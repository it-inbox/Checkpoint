import { Request, Response } from "express";

// Zod Schemas
import { LoginSchema } from './auth.validator';

// Services
import { svcLogin } from "./auth.service";

export async function ctrlLogin(req: Request, res: Response) {

  const validReq = LoginSchema.safeParse(req.body);
  if (!validReq.success) {
    return res.status(400).json({ error: validReq.error.issues[0].message });
  }

  try {
    const response = await svcLogin(validReq.data);
    return res.json(response);
  }
  catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Login controller error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}