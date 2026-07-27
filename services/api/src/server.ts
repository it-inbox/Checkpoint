// ./src/index.ts
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

// Config
import { env } from './config/environment';
import { swaggerSpec } from './config/swagger';
import { connectDatabase } from './config/database';
import { ensureUploadDir, UPLOADS_DIR } from './shared/utils/mutler';

// Routes
import { router } from './routes/index'

const app = express();
const PORT = env.PORT;

// Middleware
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json());

// Mutler
ensureUploadDir() // Ensure directories exist
app.use('/uploads', express.static(UPLOADS_DIR)); // Serve uploaded selfies statically

// Initialize database connection
connectDatabase();

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve the OpenAPI spec as JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Setup all API routes
app.use("/api", router);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    console.error(`[Multer Error] Path: ${req.path}, Field: ${err.field}, Message: ${err.message}`);
    return res.status(400).json({ error: `Upload error: Unexpected field "${err.field}"` });
  }
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Health check
app.get('/', (req, res) => res.json({message: "API is running..."}))

// Pure API server now — no Vite, no static client serving.
// Deploy client/ separately (its own host, or reverse-proxy /api to here).
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on http://localhost:${PORT}`);
});