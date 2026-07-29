// Config
import { isMongoConnected, MongoUser, getDb } from '../../config/database';

// Zod Schemas
import { LoginSchema } from './auth.validator'

// Types
import { LoginInput, LoginResponse } from './auth.types';
import { Error } from '../../shared/types/Error';

export async function loginService(reqBody: LoginInput): Promise<LoginResponse> {
  
  const result = LoginSchema.safeParse(reqBody);
  if (!result.success) {
    const err: Error = new Error(result.error.issues[0].message);
    err.status = 400;
    throw err;
  }

  const { email } = result.data;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    const err: Error = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  if (user.status === 'inactive') {
    const err: Error = new Error('This user account is currently deactivated.');
    err.status = 403;
    throw err;
  }

  return { 
    user,
    token: `mock-jwt-token-for-${user.id}`,
  };
}

async function findUserByEmail(normalizedEmail: string) {

  let user: any = null;

  if (isMongoConnected) {
    try {
      user = await MongoUser.findOne({
        email: new RegExp(`^${normalizedEmail}$`, 'i')
      })
    }
    catch (err) {
      console.error('Mongo login error:', err)
    }
  }

  if (!isMongoConnected || !user) {
    const db = getDb();
    user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  }

  return user;

}