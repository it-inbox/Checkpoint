import { Request, Response } from 'express';
import mongoose from 'mongoose';

// Config
import { swaggerSpec } from "../../config/swagger";
import { isMongoConnected, MONGODB_URI, mongoConnectionError } from '../../config/database';

export function healthCheck(req: Request, res: Response) {
  res.json({message: "API is running..."})
}

export function apiDocsJson(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
}

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