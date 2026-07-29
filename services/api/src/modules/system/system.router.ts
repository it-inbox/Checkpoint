import express from 'express';

// Controller
import { healthCheck, apiDocsJson, getDbStatus } from './system.controller';

const router  = express.Router();

/**
 * @swagger
 * /api/system/health-check:
 *   get:
 *     summary: Check API health status
 *     description: Returns the current health status of the API to verify it's running properly
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "API is running..."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/health-check', healthCheck);

/**
 * @swagger
 * /api/system/api-docs-json:
 *   get:
 *     summary: Get OpenAPI/Swagger specification in JSON format
 *     description: Returns the complete OpenAPI 3.0 specification for the API in JSON format
 *     tags: [System]
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: OpenAPI 3.0 specification object
 *               additionalProperties: true
 *       500:
 *         description: Failed to generate API documentation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to generate API documentation"
 */
router.get('/api-docs-json', apiDocsJson);

/**
 * @swagger
 * /api/system/db-status:
 *   get:
 *     summary: Get database connection status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Database status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isMongoConnected:
 *                   type: boolean
 *                 connectionError:
 *                   type: string
 *                   nullable: true
 *                 databaseName:
 *                   type: string
 *                   nullable: true
 *                 uriConfigured:
 *                   type: boolean
 *                 uriMasked:
 *                   type: string
 *                   nullable: true
 */
router.get('/db-status', getDbStatus);

export { router as systemRouter };