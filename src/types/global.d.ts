interface ImportMetaEnv {
  BASE_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  VITE_GITHUB_CLIENT_ID: string;
  VITE_GOOGLE_CLIENT_ID: string;
  VITE_GOOGLE_CLIENT_SECRET: string;
}

declare global {
  let env: ImportMetaEnv;
  interface Window {
    env: ImportMetaEnv;
  }
}