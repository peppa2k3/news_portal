import { randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import pool,{transaction} from '../config/database.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { AppError } from '../errors/app.error.js';
import { clientIpHash,randomToken,sha256 } from '../utils/crypto.js';
import { writeAudit } from './audit.service.js';

const publicUser=(row)=>({id:String(row.id),email:row.email,fullName:row.full_name,avatarUrl:row.avatar_url,role:row.role,status:row.status,lastLoginAt:row.last_login_at});
const signAccess=(user)=>jwt.sign({role:user.role},env.JWT_ACCESS_SECRET,{subject:String(user.id),issuer:'news-portal-api',audience:'news-portal-admin',expiresIn:env.ACCESS_TOKEN_TTL});
const refreshExpiry=()=>new Date(Date.now()+env.REFRESH_TOKEN_TTL_DAYS*86400_000);
const storeRefresh=async(client,{userId,familyId,request})=>{
  const raw=randomToken();const hash=sha256(raw);const {rows}=await client.query(`INSERT INTO refresh_tokens(user_id,family_id,token_hash,expires_at,ip_hash,user_agent) VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,[userId,familyId,hash,refreshExpiry(),clientIpHash(request),request.get('user-agent')?.slice(0,500)]);
  return {raw,id:rows[0].id};
};
export const login=async({email,password,request})=>transaction(async(client)=>{
  const {rows}=await client.query(`SELECT * FROM users WHERE lower(email)=lower($1) AND deleted_at IS NULL FOR UPDATE`,[email]);const user=rows[0];
  if(!user||!(await argon2.verify(user.password_hash,password)))throw new AppError(401,'Email hoặc mật khẩu không đúng','INVALID_CREDENTIALS');
  if(user.status!=='active')throw new AppError(403,'Tài khoản đã bị tạm khóa','ACCOUNT_SUSPENDED');
  await client.query('UPDATE users SET last_login_at=now() WHERE id=$1',[user.id]);
  const refresh=await storeRefresh(client,{userId:user.id,familyId:randomUUID(),request});
  await writeAudit(client,{request,actorId:user.id,action:'auth.login',entityType:'user',entityId:user.id});
  return {user:publicUser({...user,last_login_at:new Date()}),accessToken:signAccess(user),refreshToken:refresh.raw,refreshExpiresAt:refreshExpiry()};
});
export const rotate=async({token,request})=>transaction(async(client)=>{
  const hash=sha256(token);const {rows}=await client.query(`SELECT rt.*,u.email,u.full_name,u.avatar_url,u.role,u.status,u.deleted_at FROM refresh_tokens rt JOIN users u ON u.id=rt.user_id WHERE rt.token_hash=$1 FOR UPDATE`,[hash]);const current=rows[0];
  if(!current)throw new AppError(401,'Refresh token không hợp lệ','INVALID_REFRESH_TOKEN');
  if(current.revoked_at){await client.query('UPDATE refresh_tokens SET revoked_at=COALESCE(revoked_at,now()) WHERE family_id=$1',[current.family_id]);throw new AppError(401,'Phát hiện token đã được sử dụng lại; toàn bộ phiên đã bị thu hồi','REFRESH_TOKEN_REUSE');}
  if(current.expires_at<=new Date()||current.status!=='active'||current.deleted_at)throw new AppError(401,'Phiên đăng nhập đã hết hạn','REFRESH_TOKEN_EXPIRED');
  const replacement=await storeRefresh(client,{userId:current.user_id,familyId:current.family_id,request});
  await client.query('UPDATE refresh_tokens SET revoked_at=now(),replaced_by_token_id=$2 WHERE id=$1',[current.id,replacement.id]);
  return {user:publicUser(current),accessToken:signAccess(current),refreshToken:replacement.raw,refreshExpiresAt:refreshExpiry()};
});
export const logout=async(token)=>{if(token)await pool.query('UPDATE refresh_tokens SET revoked_at=COALESCE(revoked_at,now()) WHERE token_hash=$1',[sha256(token)]);};
export const logoutAll=async(userId)=>pool.query('UPDATE refresh_tokens SET revoked_at=COALESCE(revoked_at,now()) WHERE user_id=$1',[userId]);
export const getMe=async(id)=>{const {rows}=await pool.query('SELECT * FROM users WHERE id=$1 AND deleted_at IS NULL',[id]);if(!rows[0])throw new AppError(404,'Không tìm thấy người dùng','USER_NOT_FOUND');return publicUser(rows[0]);};
export const forgotPassword=async({email,request})=>{
  const {rows}=await pool.query('SELECT id,email FROM users WHERE lower(email)=lower($1) AND status=\'active\' AND deleted_at IS NULL',[email]);
  if(!rows[0])return {};
  const raw=randomToken();await transaction(async(client)=>{await client.query('UPDATE password_reset_tokens SET used_at=now() WHERE user_id=$1 AND used_at IS NULL',[rows[0].id]);await client.query(`INSERT INTO password_reset_tokens(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '30 minutes')`,[rows[0].id,sha256(raw)]);await writeAudit(client,{request,actorId:rows[0].id,action:'auth.password_reset_requested',entityType:'user',entityId:rows[0].id});});
  if(env.NODE_ENV==='development'&&env.MAIL_PROVIDER==='console'){logger.info({resetToken:raw,userId:String(rows[0].id)},'Development password reset token');return {developmentResetToken:raw};}
  return {};
};
export const resetPassword=async({token,password,request})=>transaction(async(client)=>{
  const {rows}=await client.query(`SELECT prt.*,u.id AS user_id FROM password_reset_tokens prt JOIN users u ON u.id=prt.user_id WHERE prt.token_hash=$1 AND prt.used_at IS NULL AND prt.expires_at>now() AND u.status='active' AND u.deleted_at IS NULL FOR UPDATE`,[sha256(token)]);
  if(!rows[0])throw new AppError(400,'Reset token không hợp lệ hoặc đã hết hạn','INVALID_RESET_TOKEN');
  const passwordHash=await argon2.hash(password,{type:argon2.argon2id,memoryCost:19456,timeCost:2,parallelism:1});
  await client.query('UPDATE users SET password_hash=$2 WHERE id=$1',[rows[0].user_id,passwordHash]);await client.query('UPDATE password_reset_tokens SET used_at=now() WHERE id=$1',[rows[0].id]);await client.query('UPDATE refresh_tokens SET revoked_at=COALESCE(revoked_at,now()) WHERE user_id=$1',[rows[0].user_id]);
  await writeAudit(client,{request,actorId:rows[0].user_id,action:'auth.password_reset',entityType:'user',entityId:rows[0].user_id});
});
export const hashPassword=(password)=>argon2.hash(password,{type:argon2.argon2id,memoryCost:19456,timeCost:2,parallelism:1});
