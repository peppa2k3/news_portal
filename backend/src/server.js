import 'dotenv/config';

import app from './app.js';
import pool, { checkDatabaseConnection } from './config/database.js';

const port = Number(process.env.PORT) || 5000;

const start = async () => {
  try {
    await checkDatabaseConnection();

    const server = app.listen(port, () => {
      console.log(`API listening on port ${port}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Unable to start the API:', error);
    await pool.end();
    process.exit(1);
  }
};

start();
