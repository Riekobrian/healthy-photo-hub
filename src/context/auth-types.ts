import { createContext } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  provider?: "email" | "google" | "github";
  picture?: string;
}

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  error: Error | null;
}

export interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  authError: Error | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  handleOAuthCallback: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
