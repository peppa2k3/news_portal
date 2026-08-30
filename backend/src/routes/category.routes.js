import { Router } from 'express';
import * as categories from '../services/category.service.js';
import { cacheRemember } from '../services/cache.service.js';
import { asyncHandler,success } from '../utils/http.js';
const router=Router();
router.get('/menu',asyncHandler(async(_req,res)=>{const data=await cacheRemember('menu',3600,()=>categories.getMenu());res.set('Cache-Control','public, max-age=60, s-maxage=3600, stale-while-revalidate=60');return success(res,data);}));
export default router;
