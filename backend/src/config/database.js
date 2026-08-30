import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const asNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const ssl = process.env.DB_SSL === 'true'
  ? {
      rejectUnauthorized:
        process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    }
  : false;

const connection = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST ?? 'localhost',
      port: asNumber(process.env.DB_PORT, 5432),
      database: process.env.DB_NAME ?? 'techreview',
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD,
    };

const pool = new Pool({
  ...connection,
  ssl,
  max: asNumber(process.env.DB_POOL_MAX, 10),
  idleTimeoutMillis: asNumber(process.env.DB_IDLE_TIMEOUT_MS, 30_000),
  connectionTimeoutMillis: asNumber(
    process.env.DB_CONNECTION_TIMEOUT_MS,
    5_000,
  ),
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

export const query = (text, params) => pool.query(text, params);

export const checkDatabaseConnection = async () => {
  const { rows } = await pool.query(
    'SELECT current_database() AS database, now() AS server_time',
  );
  return rows[0];
};

export default pool;
