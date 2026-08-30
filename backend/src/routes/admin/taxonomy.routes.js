import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.middleware.js';
import * as taxonomy from '../../services/taxonomy.service.js';
import { asyncHandler,success } from '../../utils/http.js';

const slug=z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(150);const id=z.object({id:z.string().regex(/^\d+$/)});
export const tagRouter=Router();
tagRouter.get('/',asyncHandler(async(req,res)=>success(res,await taxonomy.list('tags',String(req.query.search||'')))));
tagRouter.post('/',validate({body:z.object({name:z.string().min(1).max(100),slug}).strict()}),asyncHandler(async(req,res)=>success(res,await taxonomy.create('tags',req.body,req),{status:201})));
tagRouter.patch('/:id',validate({params:id,body:z.object({name:z.string().min(1).max(100).optional(),slug:slug.optional()}).strict()}),asyncHandler(async(req,res)=>success(res,await taxonomy.update('tags',req.params.id,req.body,req))));
tagRouter.post('/:id/merge',validate({params:id,body:z.object({targetId:z.string().regex(/^\d+$/)}).strict()}),asyncHandler(async(req,res)=>{await taxonomy.mergeTag(req.params.id,req.body.targetId,req);return success(res,{merged:true});}));
tagRouter.delete('/:id',validate({params:id}),asyncHandler(async(req,res)=>{await taxonomy.remove('tags',req.params.id,req);return res.status(204).send();}));

export const authorRouter=Router();
const authorBody=z.object({userId:z.string().regex(/^\d+$/).nullable().optional(),fullName:z.string().min(2).max(150),slug,avatarUrl:z.url().nullable().optional(),bio:z.string().max(10000).nullable().optional(),socialLinks:z.record(z.string(),z.url()).optional()});
const mapAuthor=(body)=>Object.fromEntries(Object.entries({user_id:body.userId,full_name:body.fullName,slug:body.slug,avatar_url:body.avatarUrl,bio:body.bio,social_links:body.socialLinks}).filter(([,value])=>value!==undefined));
authorRouter.get('/',asyncHandler(async(req,res)=>success(res,await taxonomy.list('authors',String(req.query.search||'')))));
authorRouter.post('/',validate({body:authorBody.strict()}),asyncHandler(async(req,res)=>success(res,await taxonomy.create('authors',mapAuthor(req.body),req),{status:201})));
authorRouter.patch('/:id',validate({params:id,body:authorBody.partial().strict()}),asyncHandler(async(req,res)=>success(res,await taxonomy.update('authors',req.params.id,mapAuthor(req.body),req))));
authorRouter.delete('/:id',validate({params:id}),asyncHandler(async(req,res)=>{await taxonomy.remove('authors',req.params.id,req);return res.status(204).send();}));
