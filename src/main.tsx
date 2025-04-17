import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { validateEnv } from "./lib/env";

async function initializeApp() {
  // Validate environment variables first
  try {
    validateEnv();
  } catch (error) {
    console.error(error);
    document.body.innerHTML = `
      <div style="color: red; padding: 20px;">
        <h1>Environment Error</h1>
        <pre>${error instanceof Error ? error.message : 'Unknown error'}</pre>
      </div>
    `;
    return;
  }

  // Initialize mock service worker in development
  if (process.env.NODE_ENV === "development") {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
    });
  }

  // Render the app
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

initializeApp().catch(error => {
  console.error('Failed to initialize app:', error);
});
