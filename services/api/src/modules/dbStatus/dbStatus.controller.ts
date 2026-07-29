// Libraries
import { Request, Response } from 'express';
import mongoose from 'mongoose';

// Config
import { isMongoConnected, MONGODB_URI, mongoConnectionError } from '../../config/database';

export function getDbStatus(req: Request, res: Response) {
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
}