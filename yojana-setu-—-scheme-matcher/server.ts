import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Database connection state
let pool: pg.Pool | null = null;
let dbStatus = {
  configured: false,
  status: 'disconnected' as 'connected' | 'needs_password' | 'error' | 'disconnected',
  host: 'db.mbfouhyodhwbyqrzujuj.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  supabaseUrl: 'https://mbfouhyodhwbyqrzujuj.supabase.co',
  supabaseRestUrl: process.env.SUPABASE_REST_URL || 'https://mbfouhyodhwbyqrzujuj.supabase.co/rest/v1/',
  message: 'Initializing database connection...',
  lastChecked: new Date().toISOString(),
  tableCount: 0,
};

function getConnectionString(): string {
  return (
    process.env.DATABASE_URL ||
    'postgresql://postgres:[YOUR-PASSWORD]@db.mbfouhyodhwbyqrzujuj.supabase.co:5432/postgres'
  );
}

async function initDatabase(customPassword?: string) {
  let connStr = getConnectionString();

  if (customPassword) {
    connStr = connStr.replace(/\[YOUR-PASSWORD\]|:[^@]+@/, `:${encodeURIComponent(customPassword)}@`);
  }

  dbStatus.lastChecked = new Date().toISOString();

  if (connStr.includes('[YOUR-PASSWORD]')) {
    dbStatus.configured = true;
    dbStatus.status = 'needs_password';
    dbStatus.message =
      'Supabase host configured (db.mbfouhyodhwbyqrzujuj.supabase.co). Password placeholder [YOUR-PASSWORD] needs to be set with your database password.';
    return;
  }

  try {
    if (pool) {
      await pool.end().catch(() => {});
    }

    pool = new Pool({
      connectionString: connStr,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 8000,
    });

    const client = await pool.connect();
    try {
      const res = await client.query('SELECT NOW() as now, current_database() as db, version() as ver');
      
      // Ensure tables exist for DBT Rakshak
      await client.query(`
        CREATE TABLE IF NOT EXISTS dbt_tracked_applications (
          id VARCHAR(64) PRIMARY KEY,
          scheme_id VARCHAR(64) NOT NULL,
          scheme_name TEXT NOT NULL,
          applicant_name TEXT NOT NULL,
          applied_date VARCHAR(32) NOT NULL,
          status VARCHAR(64) NOT NULL,
          tracking_number VARCHAR(64) NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const tablesRes = await client.query(`
        SELECT count(*)::int as count FROM information_schema.tables WHERE table_schema = 'public';
      `);

      dbStatus.configured = true;
      dbStatus.status = 'connected';
      dbStatus.tableCount = tablesRes.rows[0]?.count || 1;
      dbStatus.message = `Successfully connected to Supabase PostgreSQL at ${dbStatus.host}. Active timestamp: ${res.rows[0]?.now}`;
    } finally {
      client.release();
    }
  } catch (err: any) {
    dbStatus.configured = true;
    dbStatus.status = 'error';
    dbStatus.message = `Connection attempt to Supabase failed: ${err.message || err}`;
  }
}

// Initial connection attempt on boot
initDatabase().catch((e) => console.error('DB Init Error:', e));

// API Routes
app.get('/api/db/status', async (_req, res) => {
  res.json({
    ...dbStatus,
    connectionStringPreview: getConnectionString().replace(/:[^@]+@/, ':****@'),
  });
});

app.post('/api/db/update-password', async (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required' });
  }

  // Update .env file
  try {
    const envPath = path.resolve(__dirname, '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const newUrl = `postgresql://postgres:${encodeURIComponent(password)}@db.mbfouhyodhwbyqrzujuj.supabase.co:5432/postgres`;
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL="${newUrl}"`);
    } else {
      envContent += `\nDATABASE_URL="${newUrl}"\n`;
    }

    fs.writeFileSync(envPath, envContent);
    process.env.DATABASE_URL = newUrl;

    await initDatabase(password);

    res.json({
      success: true,
      dbStatus,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/db/test-query', async (_req, res) => {
  if (dbStatus.status !== 'connected' || !pool) {
    return res.status(400).json({
      error: 'Database is not currently connected. Check status or provide password.',
      dbStatus,
    });
  }

  try {
    const result = await pool.query(`
      SELECT 
        NOW() as server_time,
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_addr
    `);
    res.json({ success: true, result: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite / static file serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`DBT Rakshak server running on port ${port}`);
  });
}

startServer();
