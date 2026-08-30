import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

let redis;
export const getRedis = () => {
  if (!env.REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 2, enableReadyCheck: true });
    redis.on('error', (error) => logger.warn({ err: error }, 'Redis error'));
  }
  return redis;
};
export const connectRedis = async () => { const client=getRedis(); if(client?.status==='wait') await client.connect(); return client; };
export const checkRedisConnection = async () => { const client=await connectRedis(); return client ? client.ping() : 'disabled'; };
export const closeRedis = async () => { if(redis) await redis.quit(); };
