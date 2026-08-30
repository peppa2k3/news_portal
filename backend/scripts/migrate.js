import 'dotenv/config';

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pool from '../src/config/database.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(currentDirectory, '../database/schema.sql');

const migrate = async () => {
  const schema = await readFile(schemaPath, 'utf8');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Prevent two application instances from applying the schema concurrently.
    await client.query(
      'SELECT pg_advisory_xact_lock(hashtext($1))',
      ['techreview-initial-schema'],
    );

    await client.query(schema);
    await client.query('COMMIT');

    console.log('Database schema applied successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

try {
  await migrate();
} catch (error) {
  console.error('Database migration failed:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}

