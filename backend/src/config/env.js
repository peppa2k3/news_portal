import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';

const ephemeralSecret = () => randomBytes(32).toString('base64url');

const bool = z.enum(['true', 'false']).transform((value) => value === 'true');
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  APP_VERSION: z.string().default('2.0.0'),
  LOG_LEVEL: z.string().default('info'),
  WEB_URL: z.url().default('http://localhost:3000'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  DATABASE_URL: z.string().default('postgresql://localhost/news_portal'),
  DB_SSL: bool.default(false),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),
  REDIS_URL: z.string().optional(),
  CACHE_NAMESPACE: z.string().default('news-portal:v2'),
  JWT_ACCESS_SECRET: z.string().min(32).default(ephemeralSecret),
  JWT_REFRESH_SECRET: z.string().min(32).default(ephemeralSecret),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  COOKIE_SECURE: bool.default(false),
  REVALIDATE_URL: z.url().optional(),
  REVALIDATE_SECRET: z.string().min(32).default(ephemeralSecret),
  PREVIEW_SECRET: z.string().min(32).default(ephemeralSecret),
  COMMENTS_ENABLED: bool.default(true),
  S3_ENDPOINT: z.url().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().default('news-media'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: bool.default(true),
  S3_PUBLIC_URL: z.url().optional(),
  MAX_UPLOAD_MB: z.coerce.number().positive().max(50).default(10),
  MAIL_PROVIDER: z.enum(['console', 'disabled']).default('console'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${z.prettifyError(parsed.error)}`);
}
if (parsed.data.NODE_ENV === 'production') {
  for (const key of ['JWT_ACCESS_SECRET','JWT_REFRESH_SECRET','REVALIDATE_SECRET','PREVIEW_SECRET']) {
    if (!process.env[key]) throw new Error(`${key} is required in production`);
  }
  if (!parsed.data.REDIS_URL) throw new Error('REDIS_URL is required in production');
}

export const env = Object.freeze({
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean),
});
