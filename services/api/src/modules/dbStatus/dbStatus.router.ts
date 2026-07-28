// Libraries
import express from 'express';
import mongoose from 'mongoose';

// Config
import { isMongoConnected, MONGODB_URI, mongoConnectionError } from '../../config/database';

const router  = express.Router();

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
router.get('/', (req, res) => {
  const uriMasked = MONGODB_URI
    ? MONGODB_URI.replace(/:([^@:]+)@/, ':******@')
    : null;

  res.json({
    isMongoConnected,
    connectionError: mongoConnectionError,
    databaseName: mongoose.connection ? mongoose.connection.name : null,
    uriConfigured: !!MONGODB_URI,
    uriMasked,
  });
});

export { router as dbStatusRouter };