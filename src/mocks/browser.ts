import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

// Make the `worker` and `rest` references available globally,
// so they can be accessed in both runtime and test suites.
declare global {
  interface Window {
    msw: {
      worker: ReturnType<typeof setupWorker>;
    };
  }
}
