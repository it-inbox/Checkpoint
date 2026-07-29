import multer from "multer";
import path from 'path';

import { UPLOADS_DIR } from "../utils/ensureUploadDir";

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