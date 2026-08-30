import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { checkDatabaseConnection } from './config/database.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import adminCategoryRoutes from './routes/admin/category.routes.js';
import categoryRoutes from './routes/category.routes.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/v1/health', async (_request, response, next) => {
  try {
    const database = await checkDatabaseConnection();
    response.json({ status: 'ok', database });
  } catch (error) {
    next(error);
  }
});

app.use('/api', categoryRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
