import { DatabaseSync } from 'node:sqlite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = process.env.DB_FILE || 'database.db';
const dbPath = path.isAbsolute(dbFile) ? dbFile : path.join(__dirname, '..', dbFile);

const db = new DatabaseSync(dbPath);

// Helper para pragma
db.pragma = (str) => {
  db.exec(`PRAGMA ${str};`);
};

// Habilitar claves foráneas estrictas en SQLite
db.pragma('foreign_keys = ON');

// Wrapper para transacciones atómicas compatible con la API de db.transaction(fn)
db.transaction = (fn) => (...args) => {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn(...args);
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
};

export default db;
