import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/hooks/use-auth";
import { GitHubIcon, GoogleIcon } from "@/components/Icons";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingStates, setLoadingStates] = useState({
    emailPassword: false,
    google: false,
    github: false,
  });
  const { login, loginWithGoogle, loginWithGithub, isAuthenticated } =
    useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStates((prev) => ({ ...prev, emailPassword: true }));
    try {
      await login(email, password);
      navigate("/home");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials and try again.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, emailPassword: false }));
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingStates((prev) => ({ ...prev, google: true }));
    try {
      await loginWithGoogle();
      navigate("/home");
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Google login failed. Please try again.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, google: false }));
    }
  };

  const handleGithubLogin = async () => {
    setLoadingStates((prev) => ({ ...prev, github: true }));
    try {
      await loginWithGithub();
      navigate("/home");
    } catch (error) {
      console.error("GitHub login failed:", error);
      toast.error("GitHub login failed. Please try again.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, github: false }));
    }
  };

  const isAnyLoading = Object.values(loadingStates).some((state) => state);

  return (
    <>
      <NavBar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isAnyLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isAnyLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isAnyLoading}>
                {loadingStates.emailPassword ? (
                  <LoadingSpinner size="sm" text="Signing in..." />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleGoogleLogin}
                disabled={isAnyLoading}
                className="flex items-center justify-center gap-2"
              >
                {loadingStates.google ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <GoogleIcon />
                )}
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={handleGithubLogin}
                disabled={isAnyLoading}
                className="flex items-center justify-center gap-2"
              >
                {loadingStates.github ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <GitHubIcon />
                )}
                GitHub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Login;
