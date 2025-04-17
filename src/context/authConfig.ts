import { testEnv } from "../test/testEnv";

declare global {
  interface Window {
    env: ImportMetaEnv;
  }

  interface ImportMetaEnv {
    VITE_NETLIFY_SITE_URL: string;
    MODE: string;
    DEV: boolean;
    PROD: boolean;
    SSR: boolean;
  }
}

// Helper function to get Vite env, only called outside tests
const getViteEnv = (): ImportMetaEnv => {
  if (
    typeof import.meta === "undefined" ||
    typeof import.meta.env === "undefined"
  ) {
    console.warn("import.meta.env not found, falling back to process.env");
    return {
      VITE_NETLIFY_SITE_URL: process.env.VITE_NETLIFY_SITE_URL || "",
      BASE_URL: process.env.BASE_URL || "/",
      MODE: process.env.MODE || "development",
      DEV: process.env.DEV === "true" || true,
      PROD: process.env.PROD === "true" || false,
      SSR: process.env.SSR === "true" || false,
    };
  }
  return import.meta.env;
};

// Get environment variables with proper type checking
const getEnv = (): ImportMetaEnv => {
  if (process.env.NODE_ENV === "test") {
    return {
      VITE_NETLIFY_SITE_URL: "http://localhost:8888",
      BASE_URL: "/",
      MODE: "test",
      DEV: true,
      PROD: false,
      SSR: false,
    };
  }

  if (typeof window !== "undefined" && "env" in window) {
    return window.env;
  }
  return getViteEnv();
};

const env = getEnv();

// Get the correct origin for OAuth redirects
export const getRedirectOrigin = () => {
  if (typeof window !== "undefined") {
    return import.meta.env.VITE_NETLIFY_SITE_URL || window.location.origin;
  }
  return "";
};
