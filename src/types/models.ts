import { User } from '../api/users/users-schema.js';

export type AuthRequest = Pick<User, 'email' | 'password'>;

export interface LoginResponse {
  accessToken: string;
  user: string;
}

export interface UserLocalsId {
  id: string;
}
