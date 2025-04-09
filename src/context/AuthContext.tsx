import React, { useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import {
  GITHUB_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "./authConfig";
import { AuthContext, User } from "./auth-types";

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);

    // Handle OAuth callbacks
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");

      if (code) {
        try {
          if (state === "google") {
            const response = await fetch(
              "https://oauth2.googleapis.com/token",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  code,
                  client_id: GOOGLE_CLIENT_ID,
                  client_secret: GOOGLE_CLIENT_SECRET,
                  redirect_uri: window.location.origin + "/login",
                  grant_type: "authorization_code",
                }),
              }
            );

            const data = await response.json();
            if (data.access_token) {
              const userInfo = await fetch(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                {
                  headers: { Authorization: `Bearer ${data.access_token}` },
                }
              ).then((res) => res.json());

              const googleUser = {
                id: parseInt(userInfo.sub),
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture,
                provider: "google" as const,
              };

              setUser(googleUser);
              localStorage.setItem("user", JSON.stringify(googleUser));
              toast.success("Google login successful");
              window.history.replaceState({}, document.title, "/home");
            }
          } else if (state === "github") {
            // Exchange code for access token using our local proxy server
            const tokenResponse = await fetch(
              "http://localhost:3001/api/github/oauth",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ code }),
              }
            );

            const tokenData = await tokenResponse.json();

            if (tokenData.access_token) {
              // Fetch user data
              const userResponse = await fetch("https://api.github.com/user", {
                headers: {
                  Authorization: `Bearer ${tokenData.access_token}`,
                  Accept: "application/vnd.github.v3+json",
                },
              });

              const githubUser: GitHubUser = await userResponse.json();

              // Fetch email if not public in profile
              const emailResponse = await fetch(
                "https://api.github.com/user/emails",
                {
                  headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    Accept: "application/vnd.github.v3+json",
                  },
                }
              );

              const emails: GitHubEmail[] = await emailResponse.json();
              const primaryEmail =
                emails.find((email) => email.primary)?.email ||
                emails[0]?.email;

              const user: User = {
                id: githubUser.id,
                name: githubUser.name || githubUser.login,
                email: primaryEmail,
                picture: githubUser.avatar_url,
                provider: "github" as const,
              };

              setUser(user);
              localStorage.setItem("user", JSON.stringify(user));
              toast.success("GitHub login successful");
              window.history.replaceState({}, document.title, "/home");
            } else {
              throw new Error(tokenData.error || "Failed to get access token");
            }
          }
        } catch (error) {
          console.error("Authentication error:", error);
          toast.error("Failed to complete authentication");
          window.history.replaceState({}, document.title, "/login");
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      if (email && password) {
        const mockUser = {
          id: 1,
          name: "Test User",
          email: email,
          provider: "email" as const,
        };

        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
        toast.success("Login successful");
      } else {
        throw new Error("Email and password are required");
      }
    } catch (error) {
      toast.error("Login failed: " + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth`;
      const redirectUri = window.location.origin + "/login";

      // Log the redirect URI being used (helpful for debugging)
      console.log("Using redirect URI:", redirectUri);

      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state: "google",
      });

      window.location.href = `${googleAuthUrl}?${params.toString()}`;
    } catch (error) {
      console.error("Google OAuth Error:", error);
      toast.error(
        "Google login failed. Please make sure the application is properly configured in Google Cloud Console."
      );
      throw error;
    }
  };

  const loginWithGithub = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: window.location.origin + "/login",
        scope: "user:email",
        state: "github",
      });

      const githubUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
      window.location.href = githubUrl;
    } catch (error) {
      toast.error("GitHub login failed: " + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        loginWithGithub,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
