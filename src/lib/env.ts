import { z } from 'zod';

const envSchema = z.object({
  VITE_NETLIFY_SITE_URL: z.string().url().optional().default('http://localhost:8888'),
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  BASE_URL: z.string().default('/'),
  DEV: z.boolean().default(true),
  PROD: z.boolean().default(false),
  SSR: z.boolean().default(false),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const env = {
    VITE_NETLIFY_SITE_URL: import.meta.env.VITE_NETLIFY_SITE_URL,
    MODE: import.meta.env.MODE,
    BASE_URL: import.meta.env.BASE_URL,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    SSR: import.meta.env.SSR,
  };

  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.'));
      throw new Error(`❌ Invalid environment variables: ${missingVars.join(', ')}`);
    }
    throw error;
  }
}