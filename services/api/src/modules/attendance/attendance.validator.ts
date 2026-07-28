import { z } from "zod";

export const CheckInSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeName: z.string().min(1, 'Employee name is required'),
  latitude: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  longitude: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  accuracy: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  angle: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
});

export const CheckOutSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
});

export type CheckInInput  = z.infer<typeof CheckInSchema>;
export type CheckOutInput = z.infer<typeof CheckOutSchema>;