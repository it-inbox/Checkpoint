import express, { Express } from 'express';
import cors                 from 'cors';
import swaggerUi            from 'swagger-ui-express';

// Config
import { env }              from './config/environment';
import { swaggerSpec }      from './config/swagger';
import { ensureUploadDir }  from './config/ensureUploadDir';
import { connectDatabase }  from './config/database';

// Utils
import { UPLOADS_DIR }      from './shared/utils/uploadDir';

// Middlewares
import { errorHandler }     from './shared/middlewares/errorHandler';

// Routes
import { router }           from './routes/index'

export function createServer(): Express {

  const app = express();
  
  ensureUploadDir(); // Ensure upload directory exist
  connectDatabase(); // Initialize database connection

  app.use(cors({ origin: env.CLIENT_ORIGIN }));
  app.use(express.json());
  app.use('/uploads', express.static(UPLOADS_DIR));                    // Mutler: Serve uploaded selfies statically
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Serve Swagger UI
  app.use("/api", router);
  app.use(errorHandler);

  return app
}