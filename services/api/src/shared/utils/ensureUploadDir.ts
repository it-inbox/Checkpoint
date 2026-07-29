import fs from "fs";
import path from 'path';

export const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export function ensureUploadDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}