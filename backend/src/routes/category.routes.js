import { Router } from 'express';

import { getMenu } from '../controllers/category.controller.js';

const router = Router();

router.get('/menu', getMenu);

export default router;
