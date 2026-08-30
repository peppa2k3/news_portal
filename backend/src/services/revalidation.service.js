import { hmac } from '../utils/crypto.js';
import { env } from '../config/env.js';
import pool from '../config/database.js';
import { logger } from '../config/logger.js';

export const enqueueRevalidation=async(payload,client=pool)=>client.query('INSERT INTO revalidation_jobs(payload) VALUES($1)',[payload]);
export const deliverRevalidation=async(job)=>{
  if(!env.REVALIDATE_URL)return true;
  const supported=/^(homepage|menu|category:[a-z0-9]+(?:-[a-z0-9]+)*|article:[a-z0-9]+(?:-[a-z0-9]+)*)$/;
  const tags=(job.payload.tags||[]).filter(tag=>supported.test(tag));
  for(const tag of tags){
    const timestamp=Date.now().toString();
    const body=JSON.stringify({tag,secret_token:env.REVALIDATE_SECRET,timestamp,paths:job.payload.paths||[]});
    const signature=hmac(env.REVALIDATE_SECRET,`${timestamp}.${body}`);
    const response=await fetch(env.REVALIDATE_URL,{method:'POST',headers:{'content-type':'application/json','x-revalidate-timestamp':timestamp,'x-revalidate-signature':signature},body,signal:AbortSignal.timeout(5000)});
    if(!response.ok)throw new Error(`Revalidation returned ${response.status} for ${tag}`);
  }
  return true;
};
export const processRevalidationJobs=async()=>{
  const {rows}=await pool.query(`SELECT * FROM revalidation_jobs WHERE completed_at IS NULL AND run_after<=now() AND attempts<8 ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 20`);
  for(const job of rows){try{await deliverRevalidation(job);await pool.query('UPDATE revalidation_jobs SET completed_at=now(),attempts=attempts+1 WHERE id=$1',[job.id]);}catch(error){logger.warn({err:error,jobId:String(job.id)},'Revalidation delivery failed');await pool.query(`UPDATE revalidation_jobs SET attempts=attempts+1,last_error=$2,run_after=now()+make_interval(secs=>LEAST(3600,power(2,attempts+1)::int*10)) WHERE id=$1`,[job.id,error.message.slice(0,1000)]);}}
};
