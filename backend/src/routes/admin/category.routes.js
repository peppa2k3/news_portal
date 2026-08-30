import { Router } from 'express';

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from '../../controllers/admin/category.controller.js';

const router = Router();

// Attach the JWT admin middleware here when the auth module is implemented.
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
