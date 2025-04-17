import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/.netlify/functions": {
        target: "http://localhost:8888",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  optimizeDeps: {
    include: ['netlify-identity-widget']
  },
  build: {
    rollupOptions: {
      external: ['netlify-identity-widget'],
      output: {
        globals: {
          'netlify-identity-widget': 'netlifyIdentity'
        }
      }
    }
  }
}));
