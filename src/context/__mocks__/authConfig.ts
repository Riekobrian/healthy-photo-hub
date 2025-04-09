// src/context/__mocks__/authConfig.ts
// This file mocks the original authConfig.ts for Jest tests.

// Use the environment variables set in jest.setup.ts or provide defaults.
export const GITHUB_CLIENT_ID =
  process.env.VITE_GITHUB_CLIENT_ID || "mock-github-id";
export const GOOGLE_CLIENT_ID =
  process.env.VITE_GOOGLE_CLIENT_ID || "mock-google-id";
export const GOOGLE_CLIENT_SECRET =
  process.env.VITE_GOOGLE_CLIENT_SECRET || "mock-google-secret";

// You might need to mock other exports if AuthContext.test.tsx uses them.
