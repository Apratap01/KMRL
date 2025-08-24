import { readdirSync, readFileSync } from "fs";
import path from "path";
import { pool } from "../config/db.js";// your Postgres pool

export async function runMigrations() {
  const client = await pool.connect();
  try {
    // Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get already applied migrations
    const res = await client.query("SELECT filename FROM _migrations");
    const applied = new Set(res.rows.map(r => r.filename));

    // Read all migration files in order
    const migrationDir = path.join(process.cwd(), "migrations");
    const files = readdirSync(migrationDir).sort();

    for (const file of files) {
      if (!applied.has(file)) {
        console.log(`Applying migration: ${file}`);
        const sql = readFileSync(path.join(migrationDir, file), "utf8");
        await client.query(sql);
        await client.query("INSERT INTO _migrations(filename) VALUES($1)", [file]);
      }
    }

    console.log("All migrations applied");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    client.release();
  }
}

