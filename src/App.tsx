import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { AuthErrorBoundary } from "@/components/AuthErrorBoundary";
import { Router } from "./Router";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthErrorBoundary>
          <AuthProvider>
            <Router />
            <Toaster />
          </AuthProvider>
        </AuthErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
