import { Request, Response } from "express";

import { loginService } from "./auth.service";

export async function loginController(req: Request, res: Response) {
  try {
    const result = await loginService(req.body)
    return res.json(result)
  }
  catch (err: any) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    console.error('Login controller error:', err);
    return res.status(500).json({ error: 'Internal server error' })
  }
}