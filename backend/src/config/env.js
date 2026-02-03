import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const persistentDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.RAILWAY_VOLUME_DIR;
const defaultDbPath = path.resolve(__dirname, '../../data/salon.db');

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  dbPath: process.env.DATABASE_PATH || (persistentDir ? path.join(persistentDir, 'salon.db') : defaultDbPath),
};
