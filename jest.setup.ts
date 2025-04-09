// Load cross-fetch polyfills first
import { fetch, Request, Response, Headers } from "cross-fetch";
global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;

// Set test environment
process.env.NODE_ENV = "test";

// Mock process.env with test values
process.env.VITE_GITHUB_CLIENT_ID = "test-github-id";
process.env.VITE_GOOGLE_CLIENT_ID = "test-google-id";
process.env.VITE_GOOGLE_CLIENT_SECRET = "test-google-secret";

// Set up environment variables for tests
global.env = {
  VITE_GITHUB_CLIENT_ID: process.env.VITE_GITHUB_CLIENT_ID || "test-github-id",
  VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID || "test-google-id",
  VITE_GOOGLE_CLIENT_SECRET:
    process.env.VITE_GOOGLE_CLIENT_SECRET || "test-google-secret",
};

// Load other polyfills
import { TextEncoder, TextDecoder } from "node:util";
Object.defineProperty(global, "TextDecoder", {
  value: TextDecoder,
  writable: true,
});
Object.defineProperty(global, "TextEncoder", {
  value: TextEncoder,
  writable: true,
});

// Mock BroadcastChannel with proper interface implementation
class MockBroadcastChannel implements BroadcastChannel {
  name: string;
  onmessage:
    | ((this: BroadcastChannel, ev: MessageEvent<unknown>) => void)
    | null = null;
  onmessageerror:
    | ((this: BroadcastChannel, ev: MessageEvent<unknown>) => void)
    | null = null;

  constructor(name: string) {
    this.name = name;
  }

  postMessage(message: unknown): void {}

  addEventListener(_type: string, _listener: EventListener): void {}

  removeEventListener(_type: string, _listener: EventListener): void {}

  close(): void {}

  dispatchEvent(event: Event): boolean {
    return true;
  }
}

Object.defineProperty(global, "BroadcastChannel", {
  value: MockBroadcastChannel,
  writable: true,
});

// Mock import.meta.env
global.importMetaEnv = {
  VITE_GITHUB_CLIENT_ID: "mocked-client-id",
  VITE_GOOGLE_CLIENT_ID: "mocked-google-client-id",
  VITE_GOOGLE_CLIENT_SECRET: "mocked-google-client-secret",
};

// Load test setup and MSW after polyfills
import "@testing-library/jest-dom";
import "web-streams-polyfill";
import { TransformStream } from "web-streams-polyfill";

if (typeof global.TransformStream === "undefined") {
  global.TransformStream = TransformStream;
}

import { server } from "./src/mocks/server";
import { afterAll, afterEach, beforeAll } from "@jest/globals";

// MSW Setup
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
