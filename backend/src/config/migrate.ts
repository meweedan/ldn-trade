import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import db from './database';

dotenv.config();

const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

async function ensureMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      run_on TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  await ensureMigrationsTable();
  const { rows } = await db.query('SELECT name FROM _migrations ORDER BY id ASC');
  return new Set(rows.map((r: any) => r.name));
}

async function applyMigration(name: string, sql: string) {
  console.log(`Applying migration: ${name}`);
  await db.query('BEGIN');
  try {
    await db.query(sql);
    await db.query('INSERT INTO _migrations (name) VALUES ($1)', [name]);
    await db.query('COMMIT');
  } catch (e) {
    await db.query('ROLLBACK');
    console.error(`Failed to apply migration ${name}:`, e);
    throw e;
  }
}

async function migrateUp() {
  const applied = await getAppliedMigrations();
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    await applyMigration(file, sql);
  }
  console.log('Migrations up-to-date.');
}

async function migrateDown() {
  // Simple down: rollback last migration only by re-running all except last.
  // For safety in this scaffold, we won't auto-drop schema. Implement proper down SQLs as needed.
  console.log('Down migrations are not implemented in this scaffold.');
}

async function run() {
  const direction = process.argv[2] || 'up';
  if (direction === 'up') {
    await migrateUp();
  } else if (direction === 'down') {
    await migrateDown();
  } else {
    console.error('Unknown migration direction. Use "up" or "down".');
    process.exit(1);
  }
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
