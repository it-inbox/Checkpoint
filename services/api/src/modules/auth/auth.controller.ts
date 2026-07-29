import { Request, Response } from "express";

// Config
import { isMongoConnected, MongoUser, getDb } from '../../config/database';

// Zod Schemas
import { LoginSchema } from './auth.validator'

export async function login(req: Request, res: Response) {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const { email } = result.data;

  const normalizedEmail = email.trim().toLowerCase();
  let user: any = null;

  if (isMongoConnected) {
    try {
      user = await MongoUser.findOne({ email: new RegExp(`^${normalizedEmail}$`, 'i') });
    } catch (err) {
      console.error('Mongo login error:', err);
    }
  }

  if (!isMongoConnected || !user) {
    const db = getDb();
    user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password. Recommended: sarah.connor@checkpoint.io (Admin) or john.miller@checkpoint.io (Employee)' });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ error: 'This user account is currently deactivated.' });
  }

  res.json({
    user,
    token: `mock-jwt-token-for-${user.id}`,
  });
}