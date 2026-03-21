import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const query = (text: string, params?: unknown[]) =>
  params ? pool.query(text, params) : pool.query(text);

let leadsTableInitPromise: Promise<unknown> | null = null;

export const ensureLeadsTable = () => {
  if (!leadsTableInitPromise) {
<<<<<<< HEAD
    leadsTableInitPromise = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS leads (
          id SERIAL PRIMARY KEY,
          name TEXT,
          email TEXT,
          phone TEXT,
          experience TEXT,
          stage TEXT,
          source TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await query('ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage TEXT');
    })().catch((error) => {
=======
    leadsTableInitPromise = query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        experience TEXT,
        source TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).catch((error) => {
>>>>>>> 5d80ce99e2fec21f6b27904392dafe777607797d
      leadsTableInitPromise = null;
      throw error;
    });
  }

  return leadsTableInitPromise;
};

export default pool;
