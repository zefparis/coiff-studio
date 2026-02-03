import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(config.dbPath);
const schemaPath = path.resolve(__dirname, './schema.sql');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schemaSQL);

export default db;
