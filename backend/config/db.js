import {Pool} from 'pg'
import dotenv from "dotenv"
import { runMigrations } from '../services/migrate.js';
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

export const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: process.env.PGPORT || 5432,
  ssl: {
    require: true,
  },
});

export async function connectDB() {
    try {
        runMigrations()
        console.log('DB Connected Successfully')
    } catch (error) {
        console.error('Something went wrong in connecting database')
    }
}

// getPgVersion();