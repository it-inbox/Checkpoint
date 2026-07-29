import { Request, Response, NextFunction } from "express";
import multer from 'multer';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    console.error(`[Multer Error] Path: ${req.path}, Field: ${err.field}, Message: ${err.message}`);
    return res.status(400).json({ error: `Upload error: Unexpected field "${err.field}"` });
  }

  // Handle Custom errors
  // ...

  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Internal server error' });

}