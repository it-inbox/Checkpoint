import { Request, Response, NextFunction } from "express";

// Config
import { swaggerSpec } from "../../config/swagger";

export const apiDocsJson = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
}