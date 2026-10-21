import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = process.env.DB_FILE || 'database.db';
const dbPath = path.isAbsolute(dbFile) ? dbFile : path.join(__dirname, '..', dbFile);

const db = new Database(dbPath, {
  // verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Habilitar claves foráneas estrictas en SQLite
db.pragma('foreign_keys = ON');

export default db;
