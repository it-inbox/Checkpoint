import { Request, Response } from "express";

// Services
import { 
  svcGetAttendance,
  svcGetUserAttendance,
  svcGetEmployeeMetrics,
  svcGetAdminMetrics,
  svcCheckIn,
  svcCheckOut,
} from "./attendance.service";

export async function ctrlGetAttendance(req: Request, res: Response) {
  try {
    const response = await svcGetAttendance()
    return res.json(response)
  }
  catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Attendance controller error', err);
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function ctrlGetUserAttendance(req: Request, res: Response) {
  const { employeeID } = req.params;
  try {
    const response = await svcGetUserAttendance(employeeID)
    return res.json(response)
  }
  catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Attendance controller error', err);
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function ctrlGetEmployeeMetrics(req: Request, res: Response) {
  const { employeeId } = req.params;
  try {
    const response = await svcGetEmployeeMetrics(employeeId)
    return res.json(response)
  }
  catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Attendance controller error', err);
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function ctrlGetAdminMetrics(req: Request, res: Response) {
  try {
    const response = await svcGetAdminMetrics()
    return res.json(response)
  }
  catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Attendance controller error', err);
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function ctrlCheckIn(req: Request, res: Response) {
  try {
    const response = await svcCheckIn(req.body, req.files as Express.Multer.File[])
    return res.json(response)
  }
  catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Attendance controller error', err);
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function ctrlCheckOut(req: Request, res: Response) {
  try {
    const response = await svcCheckOut(req.body)
    return res.json(response)
  }
  catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Attendance controller error', err);
    return res.status(500).json({ error: 'Internal server error' })
  }
}