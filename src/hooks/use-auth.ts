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
      // Use setTimeout to ensure state is cleaned up before redirect
      setTimeout(() => {
        window.location.href = "/home";
      }, 300);
    });

    netlifyIdentity.on("logout", () => {
      setUser(null);
      // Clear any stored authentication state
      localStorage.removeItem("gotrue.user");
      // Use setTimeout to ensure state is cleaned up before allowing new login
      setTimeout(() => {
        window.location.href = "/login";
      }, 300);
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
