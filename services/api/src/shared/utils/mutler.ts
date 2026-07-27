import multer from "multer";
import fs from "fs";
import path from 'path';

export const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export function ensureUploadDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

// Setup multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    const prefix = file.fieldname === 'avatar' ? 'avatar' : 'selfie';
    cb(null, prefix + '-' + uniqueSuffix + ext);
  },
});

export const upload = multer({ storage });