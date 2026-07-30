import { z } from "zod";

// Zod Schemas
import { SettingsSchema } from "./settings.validator";

export type UpdateSettingsInput = z.infer<typeof SettingsSchema>;