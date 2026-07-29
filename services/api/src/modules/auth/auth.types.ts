import { z } from "zod";

// Shared Types
import { User } from "../../shared/types/User";

// Zod Schemas
import { LoginSchema } from "./auth.validator";

export type LoginInput = z.infer<typeof LoginSchema>;

export interface LoginResponse {
  user: User;
  token: string;
}