// Libraries
import express from 'express';
const router  = express.Router();

// Controller
import { getDbStatus } from './dbStatus.controller';

/**
 * @swagger
 * /api/db-status:
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
router.get('/', getDbStatus);

export { router as dbStatusRouter };