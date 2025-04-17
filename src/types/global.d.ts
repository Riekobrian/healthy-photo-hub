declare global {
  interface ImportMetaEnv {
    VITE_NETLIFY_SITE_URL: string;
    MODE: string;
    BASE_URL: string;
    DEV: boolean;
    PROD: boolean;
    SSR: boolean;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}