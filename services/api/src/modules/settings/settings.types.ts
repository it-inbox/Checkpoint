import { z } from "zod";

// Zod Schemas
import { SettingsSchema } from "./settings.validator";

export type SettingsInput = z.infer<typeof SettingsSchema>;

export interface SettingsResponse {
  // ...
}