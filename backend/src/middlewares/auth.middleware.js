import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { env } from '../config/env.js';
import { AppError } from '../errors/app.error.js';

export const authenticate=async(request,_response,next)=>{
  try{
    const header=request.get('authorization');
    if(!header?.startsWith('Bearer '))throw new AppError(401,'Yêu cầu đăng nhập','AUTH_REQUIRED');
    const payload=jwt.verify(header.slice(7),env.JWT_ACCESS_SECRET,{issuer:'news-portal-api',audience:'news-portal-admin'});
    const {rows}=await pool.query(`SELECT id::text,email,full_name AS "fullName",role,status FROM users WHERE id=$1 AND deleted_at IS NULL`,[payload.sub]);
    const user=rows[0];
    if(!user||user.status!=='active')throw new AppError(401,'Phiên đăng nhập không hợp lệ','INVALID_SESSION');
    request.user=user;next();
  }catch(error){
    if(error instanceof AppError)return next(error);
    return next(new AppError(401,'Access token không hợp lệ hoặc đã hết hạn','INVALID_ACCESS_TOKEN'));
  }
};
export const optionalAuthenticate=async(request,response,next)=>{
  if(!request.get('authorization'))return next();
  return authenticate(request,response,next);
};
export const allowRoles=(...roles)=>(request,_response,next)=>roles.includes(request.user?.role)?next():next(new AppError(403,'Bạn không có quyền thực hiện thao tác này','FORBIDDEN'));
