import { ZodError } from 'zod';
import { AppError } from '../errors/app.error.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const postgresError=(error)=>{
  if(error.code==='23505')return new AppError(409,'Dữ liệu đã tồn tại','CONFLICT');
  if(error.code==='23503')return new AppError(409,'Dữ liệu đang được sử dụng','RESOURCE_IN_USE');
  if(['23514','22P02','22007'].includes(error.code))return new AppError(400,'Dữ liệu không hợp lệ','INVALID_DATA');
  if(error.code==='P0001')return new AppError(409,error.message,'BUSINESS_RULE_CONFLICT');
  return null;
};
export const notFoundHandler=(_request,response)=>response.status(404).json({success:false,error:{code:'ROUTE_NOT_FOUND',message:'Không tìm thấy endpoint'},requestId:response.locals.requestId});
export const errorHandler=(error,request,response,_next)=>{
  let handled=error instanceof AppError?error:postgresError(error);
  if(error instanceof ZodError)handled=new AppError(400,'Dữ liệu không hợp lệ','VALIDATION_ERROR',{fields:error.flatten().fieldErrors});
  if(!handled){logger.error({err:error,requestId:response.locals.requestId,method:request.method,path:request.path},'Unhandled request error');handled=new AppError(500,'Lỗi máy chủ nội bộ','INTERNAL_SERVER_ERROR');}
  return response.status(handled.statusCode).json({success:false,error:{code:handled.code,message:handled.message,...(handled.details||{})},requestId:response.locals.requestId,...(env.NODE_ENV!=='production'&&handled.statusCode===500&&{debug:error.message})});
};
