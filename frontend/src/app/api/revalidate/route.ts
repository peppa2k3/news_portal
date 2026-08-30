import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";

export const runtime = "nodejs";

const MAX_BODY_SIZE = 8_192;
const TAG_PATTERN = /^(homepage|menu|trending|sitemap|rss|category|article|tag|author):?[a-z0-9-]*$/;
const PATH_PATTERN = /^\/(?:$|chuyen-muc\/[a-z0-9-]+|tin-tuc\/[a-z0-9-]+|tag\/[a-z0-9-]+|tac-gia\/[a-z0-9-]+|sitemap\.xml|rss\.xml)$/;

type Payload = { tags?: unknown; paths?: unknown };

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || secret.length < 32) {
    return Response.json({ success: false, error: "Revalidation chưa được cấu hình" }, { status: 503 });
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_BODY_SIZE) return Response.json({ success: false, error: "Payload quá lớn" }, { status: 413 });

  const timestamp = request.headers.get("x-revalidate-timestamp") ?? "";
  const signature = request.headers.get("x-revalidate-signature") ?? "";
  const sentAt = Number(timestamp);
  const maxAge = Math.max(60, Number(process.env.REVALIDATE_MAX_AGE_SECONDS) || 300);
  if (!Number.isFinite(sentAt) || Math.abs(Date.now() - sentAt) > maxAge * 1000) {
    return Response.json({ success: false, error: "Yêu cầu đã hết hạn" }, { status: 401 });
  }

  const expected = createHmac("sha256", secret).update(`${timestamp}.${raw}`).digest("hex");
  if (!safeEqual(signature, expected)) return Response.json({ success: false, error: "Chữ ký không hợp lệ" }, { status: 401 });

  let payload: Payload;
  try { payload = JSON.parse(raw) as Payload; } catch {
    return Response.json({ success: false, error: "JSON không hợp lệ" }, { status: 400 });
  }

  const tags = Array.isArray(payload.tags) ? payload.tags.filter((tag): tag is string => typeof tag === "string") : [];
  const paths = Array.isArray(payload.paths) ? payload.paths.filter((path): path is string => typeof path === "string") : [];
  if (tags.length + paths.length === 0 || tags.length > 30 || paths.length > 30 || tags.some((tag) => !TAG_PATTERN.test(tag)) || paths.some((path) => !PATH_PATTERN.test(path))) {
    return Response.json({ success: false, error: "Phạm vi revalidation không hợp lệ" }, { status: 400 });
  }

  tags.forEach((tag) => revalidateTag(tag, "max"));
  paths.forEach((path) => revalidatePath(path));
  return Response.json({ success: true, data: { tags, paths, revalidated_at: new Date().toISOString() } });
}
