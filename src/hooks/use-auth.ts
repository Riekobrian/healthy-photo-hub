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
      window.location.href = "/home";
    });

    netlifyIdentity.on("logout", () => setUser(null));

    netlifyIdentity.init();

    return () => {
      netlifyIdentity.off("init");
      netlifyIdentity.off("login");
      netlifyIdentity.off("logout");
    };
  }, []);

  return {
    isAuthenticated: !!user,
    isInitializing,
    user,
    login: () => netlifyIdentity.open("login"),
    logout: () => netlifyIdentity.logout(),
  };
}
