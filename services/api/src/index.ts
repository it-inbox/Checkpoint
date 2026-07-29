import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

// Config
import { env }             from './config/environment';
import { swaggerSpec }     from './config/swagger';
import { connectDatabase } from './config/database';

// Utils
import { ensureUploadDir, UPLOADS_DIR } from './shared/utils/ensureUploadDir';

// Middleware
import { apiDocsJson }  from './shared/middlewares/swagger';
import { errorHandler } from './shared/middlewares/errorHandler';

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Serve Swagger UI
app.get('/api-docs.json', apiDocsJson);                              // Serve the OpenAPI spec as JSON

// Setup all API routes
app.use("/api", router);

// Error handling middleware
app.use(errorHandler);

// Health check
app.get('/', (req, res) => res.json({message: "API is running..."}))

// Pure API server now — no Vite, no static client serving.
// Deploy client/ separately (its own host, or reverse-proxy /api to here).
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on http://localhost:${PORT}`);
});