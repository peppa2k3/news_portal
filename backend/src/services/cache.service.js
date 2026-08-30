import { env } from '../config/env.js';
import { getRedis } from '../config/redis.js';
const key=(value)=>`${env.CACHE_NAMESPACE}:${value}`;
export const cacheGet=async(name)=>{const redis=getRedis();if(!redis)return null;const value=await redis.get(key(name));return value?JSON.parse(value):null;};
export const cacheSet=async(name,value,ttl=60)=>{const redis=getRedis();if(redis)await redis.set(key(name),JSON.stringify(value),'EX',ttl);return value;};
export const cacheRemember=async(name,ttl,loader)=>{const hit=await cacheGet(name);if(hit!==null)return hit;return cacheSet(name,await loader(),ttl);};
export const cacheInvalidate=async(...patterns)=>{const redis=getRedis();if(!redis)return;for(const pattern of patterns){let cursor='0';do{const result=await redis.scan(cursor,'MATCH',key(pattern),'COUNT',100);cursor=result[0];if(result[1].length)await redis.del(...result[1]);}while(cursor!=='0');}};
