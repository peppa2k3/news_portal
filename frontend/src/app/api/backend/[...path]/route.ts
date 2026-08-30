import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL?.replace(/\/$/, "");
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  if (!API_URL) return Response.json({ success: false, error: { code: "NOT_CONFIGURED", message: "API chưa được cấu hình" } }, { status: 503 });
  if (!ALLOWED_METHODS.has(request.method)) return new Response(null, { status: 405 });

  const { path } = await context.params;
  if (!path.length || path.some((part) => part === ".." || part.includes("/"))) {
    return Response.json({ success: false, error: { code: "INVALID_PATH", message: "Đường dẫn không hợp lệ" } }, { status: 400 });
  }

  const target = new URL(`${API_URL}/${path.map(encodeURIComponent).join("/")}`);
  target.search = request.nextUrl.search;
  const headers = new Headers();
  for (const name of ["accept", "content-type", "cookie", "if-match", "x-csrf-token"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  for (const name of ["content-type", "cache-control", "location", "retry-after"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  const cookies = "getSetCookie" in upstream.headers
    ? (upstream.headers as Headers & { getSetCookie(): string[] }).getSetCookie()
    : [];
  cookies.forEach((cookie) => responseHeaders.append("set-cookie", cookie));

  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
