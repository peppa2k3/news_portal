import request from 'supertest';
import { afterAll,describe,expect,it } from 'vitest';
import app from '../src/app.js';
import pool from '../src/config/database.js';
describe('HTTP foundation',()=>{
  it('returns the standard success envelope and request id',async()=>{const response=await request(app).get('/api/v1/health/live').expect(200);expect(response.body).toMatchObject({success:true,data:{status:'alive'}});expect(response.body.requestId).toBeTruthy();});
  it('returns the standard not-found envelope',async()=>{const response=await request(app).get('/api/v1/does-not-exist').expect(404);expect(response.body.success).toBe(false);expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');});
  it('rejects an unauthenticated admin request',async()=>{const response=await request(app).get('/api/v1/admin/articles').expect(401);expect(response.body.error.code).toBe('AUTH_REQUIRED');});
});
afterAll(async()=>pool.end());
