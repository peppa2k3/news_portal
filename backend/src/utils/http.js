import { randomUUID } from 'node:crypto';
export const asyncHandler = (handler) => (request,response,next) => Promise.resolve(handler(request,response,next)).catch(next);
export const success = (response,data,{status=200,meta}={}) => response.status(status).json({ success:true,data,...(meta&&{meta}),requestId:response.locals.requestId });
export const requestId = (request,response,next) => { const id=request.get('x-request-id')?.slice(0,100)||randomUUID(); response.locals.requestId=id; response.set('x-request-id',id); next(); };
export const getPagination = (query,max=100) => { const page=Math.max(1,Number.parseInt(query.page??'1',10)||1); const limit=Math.min(max,Math.max(1,Number.parseInt(query.limit??'20',10)||20)); return {page,limit,offset:(page-1)*limit}; };
export const pageMeta = (total,page,limit) => ({page,limit,total:Number(total),totalPages:Math.ceil(Number(total)/limit)});
