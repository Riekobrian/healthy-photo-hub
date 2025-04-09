import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AuthProvider } from "../AuthContext";
import { useAuth } from "../../hooks/use-auth";
import { BrowserRouter } from "react-router-dom";

// Tell Jest to use the manual mock for authConfig
jest.mock("../authConfig");

// Test component that uses the auth context
const TestComponent = () => {
  const {
    login,
    loginWithGoogle,
    loginWithGithub,
    isAuthenticated,
    user,
    logout,
  } = useAuth();

  return (
    <div>
      <button onClick={() => login("test@example.com", "password")}>
        Login
      </button>
      <button onClick={() => loginWithGoogle()}>Google Login</button>
      <button onClick={() => loginWithGithub()}>GitHub Login</button>
      <button onClick={logout}>Logout</button>
      {isAuthenticated && <div>Authenticated: {user?.email}</div>}
    </div>
  );
};

// Using Record<string, unknown> instead of {} for better type safety
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe("AuthContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.pushState({}, "", "/");
  });

  it("provides authentication context to children", () => {
    render(<TestComponent />, { wrapper: Wrapper });
    // Use exact text match to be more specific
    expect(screen.getByText("Login", { exact: true })).toBeInTheDocument();
  });

  it("handles email/password login successfully", async () => {
    render(<TestComponent />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText(/Authenticated:/)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });
  });

  it("handles logout successfully", async () => {
    render(<TestComponent />, { wrapper: Wrapper });

    // First login
    fireEvent.click(screen.getByText("Login"));
    await waitFor(() => {
      expect(screen.getByText(/Authenticated:/)).toBeInTheDocument();
    });

    // Then logout
    fireEvent.click(screen.getByText("Logout"));
    expect(screen.queryByText(/Authenticated:/)).not.toBeInTheDocument();
  });

  it("maintains authentication state across renders", async () => {
    const { unmount } = render(<TestComponent />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText(/Authenticated:/)).toBeInTheDocument();
    });

    unmount();
    render(<TestComponent />, { wrapper: Wrapper });

    expect(screen.getByText(/Authenticated:/)).toBeInTheDocument();
  });
});
