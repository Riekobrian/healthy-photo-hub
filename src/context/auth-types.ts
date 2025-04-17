import { createContext } from "react";

export interface User {
  id: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
  email: string;
  app_metadata: {
    provider?: string;
  };
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
  login: () => void;
  loginWithGoogle: () => void;
  loginWithGithub: () => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
