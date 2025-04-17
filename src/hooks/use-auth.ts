import netlifyIdentity from "netlify-identity-widget";
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(() => netlifyIdentity.currentUser());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    netlifyIdentity.on("init", (user) => {
      setUser(user);
      setIsInitializing(false);
    });

    netlifyIdentity.on("login", (user) => {
      setUser(user);
      netlifyIdentity.close();
    });

    netlifyIdentity.on("logout", () => {
      setUser(null);
      // Clear any stored authentication state
      localStorage.removeItem("gotrue.user");
    });

    netlifyIdentity.init();

    return () => {
      netlifyIdentity.off("init");
      netlifyIdentity.off("login");
      netlifyIdentity.off("logout");
    };
  }, []);

  const login = () => {
    try {
      netlifyIdentity.open("login");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await netlifyIdentity.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    isAuthenticated: !!user,
    isInitializing,
    user,
    login,
    logout,
  };
}
