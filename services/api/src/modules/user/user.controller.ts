import { Request, Response } from "express";

// Services
import {
  svcGetAllUsers,
  svcGetUser,
  svcCreateEmployee,
  svcUpdateEmployee,
  svcDeleteEmployee,
} from "./user.service";

export async function ctrlGetAllUsers(req: Request, res: Response) {
  try {
    const response = await svcGetAllUsers()
    return res.json(response)
  }
  catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('User controller error', err);
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function ctrlGetUser(req: Request, res: Response) {
  try {
    const response = await svcGetUser(req.params.id);
    if (!response) {
      return res.status(404).json({ error: 'Employee not found.' });
    }
    return res.json(response)
  }
  catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('User controller error', err);
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function ctrlCreateEmployee(req: Request, res: Response) {
  try {
    const response = await svcCreateEmployee(req.body, req.file)
    return res.status(201).json(response)
  }
  catch (err: any) {
    if (err.status) {
      const statusCode =  err.message.includes('already exists') ? 400 : 
                          err.message.includes('mandatory') ? 400 :
                          500;
      res.status(statusCode).json({ error: err.message });
    }
    console.error('User controller error', err);
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function ctrlUpdateEmployee(req: Request, res: Response) {
  try {
    const response = await svcUpdateEmployee( req.params.id, req.body, req.file  )
    return res.json(response)
  }
  catch (err: any) {
    if (err.status) {
      const statusCode =  err.message.includes('already exists') ? 400 :
                          err.message.includes('not found') ? 404 :
                          err.message.includes('mandatory') ? 400 :
                          500;
      res.status(statusCode).json({ error: err.message });
    }
    console.error('User controller error', err);
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function ctrlDeleteEmployee(req: Request, res: Response) {
  try {
    const response = await svcDeleteEmployee(req.params.id)
    return res.json(response)
  }
  catch (err: any) {
    if (err.status) {
      const statusCode =  err.message.includes('not found') ? 404 :
                          err.message.includes('administrative') ? 400 :
                          500;
      res.status(statusCode).json({ error: err.message });
    }
    console.error('User controller error', err);
    return res.status(500).json({ error: 'Internal server error' })
  }
}