import React from "react";
import { AuthContext } from "./AuthContextDefinition.test";
import netlifyIdentity from "netlify-identity-widget";
import { toast } from "sonner";
import { User } from "./auth-types";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = React.useState<User | null>(
    () => netlifyIdentity.currentUser() as User | null
  );
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "authenticated" | "unauthenticated"
  >(user ? "authenticated" : "idle");
  const [error, setError] = React.useState<Error | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    netlifyIdentity.on("init", (user) => {
      setUser(user as User | null);
      setStatus(user ? "authenticated" : "unauthenticated");
      setIsInitializing(false);
    });

    netlifyIdentity.on("login", (user) => {
      setUser(user as User);
      setStatus("authenticated");
      netlifyIdentity.close();
      toast.success("Login successful");
      window.location.href = "/home";
    });

    netlifyIdentity.on("logout", () => {
      setUser(null);
      setStatus("unauthenticated");
      toast.success("Successfully logged out");
      window.location.href = "/"; // Redirect to homepage after logout
    });

    netlifyIdentity.on("error", (err) => {
      setError(err);
      toast.error("Authentication error: " + err.message);
    });

    netlifyIdentity.init();

    return () => {
      netlifyIdentity.off("init");
      netlifyIdentity.off("login");
      netlifyIdentity.off("logout");
      netlifyIdentity.off("error");
    };
  }, []);

  const login = () => {
    setStatus("loading");
    netlifyIdentity.open("login");
  };

  const logout = async () => {
    setStatus("loading");
    netlifyIdentity.logout();
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
        loginWithGoogle: login, // Use the same login function for Google
        loginWithGithub: login, // Use the same login function for GitHub
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
