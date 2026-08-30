import { clientIpHash } from '../utils/crypto.js';
export const writeAudit=async(client,{request,actorId,action,entityType,entityId,metadata={}})=>{
  const safeMetadata=JSON.parse(JSON.stringify(metadata,(key,value)=>/password|token|secret|cookie/i.test(key)?'[REDACTED]':value));
  await client.query('INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,metadata,ip_hash) VALUES($1,$2,$3,$4,$5,$6)',[actorId,action,entityType,entityId?String(entityId):null,safeMetadata,request?clientIpHash(request):null]);
};
