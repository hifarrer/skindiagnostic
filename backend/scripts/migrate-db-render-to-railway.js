#!/usr/bin/env node
/**
 * Migrate PostgreSQL database from Render to Railway (schema + data).
 *
 * Option 1: If pg_dump/psql are on PATH or in common Windows paths, uses them.
 * Option 2: Otherwise uses Node + pg: creates schema on destination via migrate,
 *           then copies all data table-by-table and syncs sequences.
 *
 * Usage (from backend folder):
 *   node scripts/migrate-db-render-to-railway.js
 *
 * Require SOURCE_URL and DEST_URL (set in backend/.env or export).
 * Example .env:
 *   SOURCE_URL=postgresql://user:pass@render-host/db
 *   DEST_URL=postgresql://user:pass@railway-host/railway
 */

import 'dotenv/config';
import pg from 'pg';
import { spawn } from 'child_process';
import { createWriteStream, unlinkSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Set SOURCE_URL and DEST_URL in env (or .env) — do not commit credentials
const SOURCE_URL = process.env.SOURCE_URL;
const DEST_URL = process.env.DEST_URL;

const SSL = { rejectUnauthorized: false };

function createPool(url) {
  return new pg.Pool({
    connectionString: url,
    ssl: url.includes('render.com') || url.includes('rlwy.net') ? SSL : false,
    connectionTimeoutMillis: 30000,
  });
}

async function findPgDump() {
  const paths = [
    'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
    process.env.PGPATH ? join(process.env.PGPATH, 'bin', 'pg_dump.exe') : null,
  ].filter(Boolean);
  for (const p of paths) {
    if (p && existsSync(p)) return p;
  }
  try {
    const { execSync } = await import('child_process');
    execSync('pg_dump --version', { stdio: 'pipe' });
    return 'pg_dump';
  } catch (_) {}
  return null;
}

async function runPgDumpRestore() {
  const pgDumpPath = await findPgDump();
  if (!pgDumpPath) return false;
  return new Promise((resolve, reject) => {
    const dumpFile = join(tmpdir(), `pg-migrate-${Date.now()}.sql`);
  const psqlPath = pgDumpPath.includes('PostgreSQL')
    ? pgDumpPath.replace('pg_dump.exe', 'psql.exe')
    : 'psql';
  console.log('Using pg_dump for migration...');
  const dump = spawn(pgDumpPath, [
    '-d', SOURCE_URL,
    '--no-owner',
    '--no-acl',
    '--clean',
    '--if-exists',
  ], { stdio: ['ignore', 'pipe', 'inherit'] });
    const out = createWriteStream(dumpFile);
    dump.stdout.pipe(out);
    dump.on('close', (code) => {
      out.end(() => {
        if (code !== 0) {
          try { unlinkSync(dumpFile); } catch (_) {}
          reject(new Error(`pg_dump exited with ${code}`));
          return;
        }
        const psql = spawn(psqlPath, [DEST_URL, '-f', dumpFile], { stdio: 'inherit' });
        psql.on('close', (c) => {
          try { unlinkSync(dumpFile); } catch (_) {}
          if (c !== 0) reject(new Error(`psql restore exited with ${c}`));
          else resolve(true);
        });
      });
    });
  });
}

// Table order: no-FK first, then dependents (plans -> users -> tasks -> skin_analysis_results)
const TABLE_ORDER = [
  'plans',
  'site_settings',
  'admin_users',
  'users',
  'tasks',
  'skin_analysis_results',
];

async function getTables(sourcePool) {
  const r = await sourcePool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);
  const names = r.rows.map((row) => row.table_name);
  const ordered = TABLE_ORDER.filter((t) => names.includes(t));
  const rest = names.filter((t) => !TABLE_ORDER.includes(t));
  return [...ordered, ...rest];
}

function normalizeValue(val, dataType) {
  if (val == null) return null;
  if (dataType === 'jsonb' || dataType === 'json') {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch (_) { return val; }
    }
    return val;
  }
  return val;
}

async function copyTable(sourcePool, destPool, table) {
  const cols = await sourcePool.query(`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
  `, [table]);
  const columns = cols.rows.map((r) => r.column_name);
  const types = Object.fromEntries(cols.rows.map((r) => [r.column_name, r.data_type]));
  if (columns.length === 0) return;
  const colList = columns.map((c) => `"${c}"`).join(', ');
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const insertSql = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`;
  const selectSql = `SELECT ${colList} FROM "${table}"`;
  const result = await sourcePool.query(selectSql);
  const dest = await destPool.connect();
  try {
    for (const row of result.rows) {
      const values = columns.map((c) => {
        const v = row[c];
        const dt = types[c];
        if ((dt === 'jsonb' || dt === 'json') && v != null) {
          return typeof v === 'object' ? JSON.stringify(v) : v;
        }
        return v;
      });
      await dest.query(insertSql, values);
    }
    if (result.rows.length > 0) {
      console.log(`  ${table}: ${result.rows.length} rows`);
    }
  } finally {
    dest.release();
  }
}

async function syncSequences(destPool) {
  const r = await destPool.query(`
    SELECT sequencename FROM pg_sequences WHERE schemaname = 'public'
  `);
  for (const { sequencename } of r.rows) {
    const tableMatch = sequencename.match(/^(.+)_id_seq$/);
    if (!tableMatch) continue;
    const table = tableMatch[1];
    const maxResult = await destPool.query(
      `SELECT COALESCE(MAX(id), 0) AS mx FROM "${table}"`
    ).catch(() => ({ rows: [{ mx: 0 }] }));
    const mx = Number(maxResult.rows[0]?.mx ?? 0);
    await destPool.query(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), $1)`,
      [Math.max(1, mx)]
    );
  }
}

async function runNodeMigration() {
  console.log('Using Node.js migration (pg_dump not found)...');
  const sourcePool = createPool(SOURCE_URL);
  const destPool = createPool(DEST_URL);
  try {
    await sourcePool.query('SELECT 1');
    await destPool.query('SELECT 1');
  } catch (e) {
    throw new Error('Cannot connect to source or destination DB: ' + e.message);
  }
  console.log('Running migrate on destination (schema)...');
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['src/config/migrate.js'], {
      cwd: process.cwd(), // backend folder
      env: { ...process.env, DATABASE_URL: DEST_URL },
      stdio: 'inherit',
    });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`migrate exited ${code}`))));
  });
  const tables = await getTables(sourcePool);
  console.log('Truncating destination tables (in order)...');
  const truncateOrder = [...tables].reverse(); // child tables first for CASCADE
  for (const table of truncateOrder) {
    await destPool.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`).catch(() => {});
  }
  console.log('Copying data:', tables.join(', '));
  for (const table of tables) {
    await copyTable(sourcePool, destPool, table);
  }
  await syncSequences(destPool);
  console.log('Sequences synced.');
  await sourcePool.end();
  await destPool.end();
}

async function main() {
  if (!SOURCE_URL || !DEST_URL) {
    console.error('Set SOURCE_URL and DEST_URL (e.g. in .env or export).');
    process.exit(1);
  }
  console.log('Source: Render');
  console.log('Destination: Railway');
  let ok = false;
  try {
    ok = await runPgDumpRestore();
  } catch (_) {}
  if (!ok) {
    await runNodeMigration();
  } else {
    console.log('Migration completed with pg_dump.');
  }
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
