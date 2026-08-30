import { AppError } from '../errors/app.error.js';
export const validate = (schemas) => (request,_response,next) => {
  const fields={};
  for(const key of ['params','query','body']) {
    if(!schemas[key]) continue;
    const parsed=schemas[key].safeParse(request[key]);
    if(!parsed.success) for(const issue of parsed.error.issues) fields[[key,...issue.path].join('.')]=issue.message;
    else request[key]=parsed.data;
  }
  if(Object.keys(fields).length) return next(new AppError(400,'Dữ liệu không hợp lệ','VALIDATION_ERROR',{fields}));
  next();
};
