import { z } from "zod";

export const SettingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  officeName: z.string().min(1, 'Office name is required'),
  latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  radius: z.number().positive('Radius must be positive'),
  officeStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  officeEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
});