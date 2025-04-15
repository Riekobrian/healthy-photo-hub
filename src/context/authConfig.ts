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
  if (
    typeof import.meta === "undefined" ||
    typeof import.meta.env === "undefined"
  ) {
    // Fallback if import.meta.env is somehow not available in a non-test env
    // This shouldn't happen in a Vite project but provides safety
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
  // Check if we're in a test environment
  if (process.env.NODE_ENV === "test") {
    return {
      VITE_GITHUB_CLIENT_ID:
        process.env.VITE_GITHUB_CLIENT_ID || "test-github-id",
      VITE_GOOGLE_CLIENT_ID:
        process.env.VITE_GOOGLE_CLIENT_ID || "test-google-id",
      VITE_GOOGLE_CLIENT_SECRET:
        process.env.VITE_GOOGLE_CLIENT_SECRET || "test-google-secret",
      BASE_URL: "/",
      MODE: "test",
      DEV: true,
      PROD: false,
      SSR: false,
    };
  }

  // For non-test environments, try to get env from window or call getViteEnv
  if (typeof window !== "undefined" && "env" in window) {
    return window.env;
  }

  // Only call getViteEnv if not in test environment
  return getViteEnv();
};

const currentEnv = getEnv();

// OAuth Client IDs and Secrets
export const GITHUB_CLIENT_ID = "3edd87d2dd3b6af23d90";
export const GOOGLE_CLIENT_ID =
  "803617895928-5eg9n9etbi1ek8ak7380qemen75gtibv.apps.googleusercontent.com";
export const GOOGLE_CLIENT_SECRET = "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";

// Get the correct origin for OAuth redirects
export const getRedirectOrigin = () => {
  if (typeof window !== 'undefined') {
    // Use Netlify URL in production, localhost in development
    return process.env.NODE_ENV === 'production' 
      ? 'https://nimble-blini-d1c847.netlify.app'
      : window.location.origin;
  }
  return '';
};
