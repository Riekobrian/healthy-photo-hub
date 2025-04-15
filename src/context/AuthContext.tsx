import React, { useState, useEffect } from "react";
import { AuthStatus, User } from "./auth-types";
import { toast } from "sonner";
import {
  GITHUB_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  getRedirectOrigin,
} from "./authConfig";
import { AuthContext } from "./AuthContextDefinition.test";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setStatus("authenticated");
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsInitializing(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setStatus("loading");
      setError(null);

      // Basic validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      // Password length validation
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Simulated delay for UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would make an API call here
      if (
        email !== "test@example.com" &&
        email !== "demo@example.com" &&
        email !== "user@example.com"
      ) {
        throw new Error("Invalid credentials");
      }

      // Simulated login
      const mockUser: User = {
        id: 1,
        name: "Test User",
        email: email,
        provider: "email",
      };

      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      setStatus("authenticated");
      toast.success("Login successful");
    } catch (error) {
      setError(error as Error);
      setStatus("unauthenticated");
      toast.error("Login failed: " + (error as Error).message);
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      setStatus("loading");
      setError(null);

      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth`;
      const redirectUri = `${getRedirectOrigin()}/.netlify/identity/callback`;

      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state: "google",
        access_type: "offline",
        prompt: "consent",
      });

      window.location.href = `${googleAuthUrl}?${params}`;
    } catch (error) {
      setError(error as Error);
      setStatus("unauthenticated");
      throw error;
    }
  };

  const loginWithGithub = async (): Promise<void> => {
    try {
      setStatus("loading");
      setError(null);

      const githubAuthUrl = `https://github.com/login/oauth/authorize`;
      const redirectUri = `${getRedirectOrigin()}/.netlify/identity/callback`;

      const params = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: "user:email",
        state: "github",
      });

      window.location.href = `${githubAuthUrl}?${params}`;
    } catch (error) {
      setError(error as Error);
      setStatus("unauthenticated");
      throw error;
    }
  };

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");

      if (code && state) {
        try {
          setStatus("loading");
          setError(null);

          let userData;

          if (state === "google") {
            const redirectUri = `${getRedirectOrigin()}/.netlify/identity/callback`;
            const formData = new URLSearchParams();
            formData.append("code", code);
            formData.append("client_id", GOOGLE_CLIENT_ID);
            formData.append("client_secret", GOOGLE_CLIENT_SECRET);
            formData.append("redirect_uri", redirectUri);
            formData.append("grant_type", "authorization_code");

            const tokenResponse = await fetch(
              "https://oauth2.googleapis.com/token",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData,
              }
            );

            if (!tokenResponse.ok) {
              const errorData = await tokenResponse.text();
              throw new Error(`Token exchange failed: ${errorData}`);
            }

            const tokenData = await tokenResponse.json();

            if (tokenData.access_token) {
              const userResponse = await fetch(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                {
                  headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                  },
                }
              );

              if (!userResponse.ok) {
                throw new Error("Failed to fetch user data");
              }

              userData = await userResponse.json();
            }
          } else if (state === "github") {
            const tokenResponse = await fetch(
              "/.netlify/functions/github-oauth",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  code,
                  redirect_uri: `${getRedirectOrigin()}/.netlify/identity/callback`,
                }),
              }
            );

            const tokenData = await tokenResponse.json();

            if (tokenData.access_token) {
              // Fetch user data
              const [userResponse, emailResponse] = await Promise.all([
                fetch("https://api.github.com/user", {
                  headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    Accept: "application/vnd.github.v3+json",
                  },
                }),
                fetch("https://api.github.com/user/emails", {
                  headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    Accept: "application/vnd.github.v3+json",
                  },
                }),
              ]);

              const githubUser = await userResponse.json();
              const emails = await emailResponse.json();

              const primaryEmail = emails.find(
                (email: { primary: boolean }) => email.primary
              );

              userData = {
                ...githubUser,
                email: primaryEmail?.email || githubUser.email,
              };
            }
          }

          if (userData) {
            const user: User = {
              id: userData.id,
              name: userData.name || userData.login,
              email: userData.email,
              provider: state as "google" | "github",
              picture: userData.avatar_url || userData.picture,
            };

            setUser(user);
            localStorage.setItem("user", JSON.stringify(user));
            setStatus("authenticated");
            toast.success("Login successful");

            // Clean up URL
            window.history.replaceState({}, document.title, "/login");
          } else {
            throw new Error("Failed to get user data");
          }
        } catch (error) {
          console.error("OAuth error:", error);
          setError(error as Error);
          setStatus("unauthenticated");
          toast.error("Login failed: " + (error as Error).message);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const logout = async (): Promise<void> => {
    try {
      setStatus("loading");
      setError(null);

      // Simulated delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      localStorage.removeItem("user");
      setUser(null);
      setStatus("unauthenticated");
      toast.success("Successfully logged out");
    } catch (error) {
      console.error("Logout error:", error);
      setError(error as Error);
      toast.error("Failed to log out");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        error,
        isAuthenticated: status === "authenticated",
        isInitializing,
        authError: error,
        login,
        logout,
        loginWithGoogle,
        loginWithGithub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
