import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
export const randomToken = (bytes=48) => randomBytes(bytes).toString('base64url');
export const sha256 = (value) => createHash('sha256').update(String(value)).digest('hex');
export const hmac = (secret,value) => createHmac('sha256',secret).update(value).digest('hex');
export const safeEqual = (left,right) => { const a=Buffer.from(String(left)); const b=Buffer.from(String(right)); return a.length===b.length&&timingSafeEqual(a,b); };
export const clientIpHash = (request) => sha256(request.ip||request.socket?.remoteAddress||'unknown');
