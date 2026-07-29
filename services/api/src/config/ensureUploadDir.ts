import fs from "fs";

// Utils
import { UPLOADS_DIR } from "../shared/utils/uploadDir";

export function ensureUploadDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}