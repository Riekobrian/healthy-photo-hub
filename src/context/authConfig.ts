import { testEnv } from "../test/testEnv";

declare global {
  interface Window {
    env: ImportMetaEnv;
  }

  interface ImportMetaEnv {
    VITE_GITHUB_CLIENT_ID: string;
    VITE_GOOGLE_CLIENT_ID: string;
    VITE_GOOGLE_CLIENT_SECRET: string;
    BASE_URL: string;
    MODE: string;
    DEV: boolean;
    PROD: boolean;
    SSR: boolean;
  }
}

// Helper function to get Vite env, only called outside tests
const getViteEnv = (): ImportMetaEnv => {
  if (typeof import.meta === "undefined" || typeof import.meta.env === "undefined") {
    console.warn("import.meta.env not found, falling back to process.env");
    return {
      VITE_GITHUB_CLIENT_ID: process.env.VITE_GITHUB_CLIENT_ID || "",
      VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID || "",
      VITE_GOOGLE_CLIENT_SECRET: process.env.VITE_GOOGLE_CLIENT_SECRET || "",
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
      VITE_GITHUB_CLIENT_ID: process.env.VITE_GITHUB_CLIENT_ID || "test-github-id",
      VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID || "test-google-id",
      VITE_GOOGLE_CLIENT_SECRET: process.env.VITE_GOOGLE_CLIENT_SECRET || "test-google-secret",
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

// OAuth Client IDs and Secrets from environment variables
export const GITHUB_CLIENT_ID = env.VITE_GITHUB_CLIENT_ID;
export const GOOGLE_CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = env.VITE_GOOGLE_CLIENT_SECRET;

// Get the correct origin for OAuth redirects
export const getRedirectOrigin = () => {
  if (typeof window !== 'undefined') {
    return process.env.NODE_ENV === 'production' 
      ? 'https://nimble-blini-d1c847.netlify.app'
      : window.location.origin;
  }
  return '';
};
