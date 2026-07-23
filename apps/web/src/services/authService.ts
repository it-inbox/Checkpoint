import axios from 'axios';
import { User } from '../types';
import { getSessionUser, setSessionUser } from './mockDb';

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(email: string, password?: string): Promise<LoginResponse> {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { user, token } = response.data;
      setSessionUser(user);
      return { user, token };
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Invalid credentials or connection error.';
      throw new Error(errorMsg);
    }
  },

  async logout(): Promise<void> {
    setSessionUser(null);
  },

  async getCurrentUser(): Promise<User | null> {
    return getSessionUser();
  },
};
export default authService;
