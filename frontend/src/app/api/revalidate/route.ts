import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

const MAX_BODY_SIZE_BYTES = 4_096;
const VALID_TAG = /^(homepage|menu|category:[a-z0-9]+(?:-[a-z0-9]+)*|article:[a-z0-9]+(?:-[a-z0-9]+)*)$/;

interface RevalidatePayload {
  tag?: unknown;
  secret_token?: unknown;
}

function secureTokenEquals(received: string, expected: string): boolean {
  const receivedHash = createHash("sha256").update(received).digest();
  const expectedHash = createHash("sha256").update(expected).digest();

  return timingSafeEqual(receivedHash, expectedHash);
}

export async function POST(request: Request) {
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (!expectedSecret || expectedSecret.length < 32) {
    console.error("REVALIDATE_SECRET is missing or shorter than 32 characters");
    return Response.json(
      { error: "Revalidation is not configured" },
      { status: 500 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_SIZE_BYTES) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  let payload: RevalidatePayload;
  try {
    payload = (await request.json()) as RevalidatePayload;
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const receivedSecret =
    typeof payload.secret_token === "string" ? payload.secret_token : "";

  // Authentication always happens before validating or revalidating a tag.
  if (!secureTokenEquals(receivedSecret, expectedSecret)) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  const tag = typeof payload.tag === "string" ? payload.tag.trim() : "";
  if (!VALID_TAG.test(tag)) {
    return Response.json({ error: "Invalid cache tag" }, { status: 400 });
  }

  revalidateTag(tag, "max");

  return Response.json({
    revalidated: true,
    tag,
    revalidated_at: new Date().toISOString(),
  });
}
