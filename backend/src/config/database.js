import pg from 'pg';
import { env } from './env.js';
import { logger } from './logger.js';

const { Pool } = pg;
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DB_SSL ? { rejectUnauthorized: true } : false,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  statement_timeout: 15_000,
});
pool.on('error', (error) => logger.error({ err: error }, 'Unexpected PostgreSQL pool error'));
export const query = (text, params) => pool.query(text, params);
export const checkDatabaseConnection = async () => {
  const { rows } = await pool.query('SELECT current_database() AS database, now() AS server_time');
  return rows[0];
};
export const transaction = async (work) => {
  const client = await pool.connect();
  try { await client.query('BEGIN'); const result = await work(client); await client.query('COMMIT'); return result; }
  catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
};
export default pool;
