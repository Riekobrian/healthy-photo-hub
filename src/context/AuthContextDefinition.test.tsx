import { createContext } from "react";
import { AuthContextType } from "./auth-types";

const initialState: AuthContextType = {
  status: "idle",
  user: null,
  error: null,
  isAuthenticated: false,
  isInitializing: true,
  authError: null,
  login: async () => {},
  logout: async () => {},
  loginWithGoogle: async () => {},
  loginWithGithub: async () => {},
  handleOAuthCallback: async () => {},
};

export const AuthContext = createContext<AuthContextType>(initialState);
