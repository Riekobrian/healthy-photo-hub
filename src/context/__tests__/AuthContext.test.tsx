/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider } from "../AuthContext";
import { useAuth } from "@/hooks/use-auth";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";

// Mock browser APIs
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

// Test component to consume auth context
const TestComponent = () => {
  const {
    isAuthenticated,
    user,
    login,
    logout,
    loginWithGoogle,
    loginWithGithub,
  } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? "authenticated" : "not-authenticated"}
      </div>
      {user && <div data-testid="user-info">{user.name}</div>}
      <button onClick={() => login("test@example.com", "password")}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={loginWithGoogle}>Google Login</button>
      <button onClick={loginWithGithub}>GitHub Login</button>
    </div>
  );
};

const renderWithAuth = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  it("provides initial unauthenticated state", () => {
    renderWithAuth();
    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "not-authenticated"
    );
  });

  it("handles successful email/password login", async () => {
    server.use(
      http.post("/api/login", () => {
        return HttpResponse.json({
          user: { id: 1, name: "Test User", email: "test@example.com" },
          token: "fake-token",
        });
      })
    );

    renderWithAuth();

    const loginButton = screen.getByText("Login");
    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "authenticated"
      );
      expect(screen.getByTestId("user-info")).toHaveTextContent("Test User");
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "auth_token",
      expect.any(String)
    );
  });

  it("handles logout", async () => {
    // Set up initial authenticated state
    mockLocalStorage.getItem.mockReturnValue("fake-token");
    server.use(
      http.get("/api/user", () => {
        return HttpResponse.json({
          id: 1,
          name: "Test User",
          email: "test@example.com",
        });
      })
    );

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "authenticated"
      );
    });

    const logoutButton = screen.getByText("Logout");
    await act(async () => {
      logoutButton.click();
    });

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "not-authenticated"
    );
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("auth_token");
  });

  it("handles Google login flow", async () => {
    const mockGoogleWindow = {
      location: { href: "" },
      close: jest.fn(),
    };
    global.open = jest.fn().mockReturnValue(mockGoogleWindow);

    renderWithAuth();

    const googleButton = screen.getByText("Google Login");
    await act(async () => {
      googleButton.click();
    });

    expect(global.open).toHaveBeenCalledWith(
      expect.stringContaining("accounts.google.com"),
      expect.any(String),
      expect.any(String)
    );
  });

  it("handles GitHub login flow", async () => {
    const mockGithubWindow = {
      location: { href: "" },
      close: jest.fn(),
    };
    global.open = jest.fn().mockReturnValue(mockGithubWindow);

    renderWithAuth();

    const githubButton = screen.getByText("GitHub Login");
    await act(async () => {
      githubButton.click();
    });

    expect(global.open).toHaveBeenCalledWith(
      expect.stringContaining("github.com"),
      expect.any(String),
      expect.any(String)
    );
  });

  it("restores auth state from localStorage on mount", async () => {
    mockLocalStorage.getItem.mockReturnValue("fake-token");
    server.use(
      http.get("/api/user", () => {
        return HttpResponse.json({
          id: 1,
          name: "Test User",
          email: "test@example.com",
        });
      })
    );

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "authenticated"
      );
      expect(screen.getByTestId("user-info")).toHaveTextContent("Test User");
    });
  });

  it("handles failed login attempts", async () => {
    server.use(
      http.post("/api/login", () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    renderWithAuth();

    const loginButton = screen.getByText("Login");
    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "not-authenticated"
      );
    });
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it("handles token expiration", async () => {
    mockLocalStorage.getItem.mockReturnValue("expired-token");
    server.use(
      http.get("/api/user", () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "not-authenticated"
      );
    });
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("auth_token");
  });

  it("handles successful GitHub OAuth callback", async () => {
    // Mock URL params for OAuth callback
    const searchParams = new URLSearchParams();
    searchParams.append("code", "test-code");
    searchParams.append("state", "github");
    Object.defineProperty(window, "location", {
      value: { search: searchParams.toString() },
      writable: true,
    });

    server.use(
      http.post("/.netlify/functions/github-oauth", () => {
        return HttpResponse.json({
          access_token: "mock_github_token",
          token_type: "bearer",
        });
      })
    );

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "authenticated"
      );
      expect(screen.getByTestId("user-info")).toHaveTextContent("Test User");
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "user",
      expect.stringContaining("Test User")
    );
  });

  it("handles GitHub OAuth error responses", async () => {
    const searchParams = new URLSearchParams();
    searchParams.append("code", "invalid-code");
    searchParams.append("state", "github");
    Object.defineProperty(window, "location", {
      value: { search: searchParams.toString() },
      writable: true,
    });

    server.use(
      http.post("/.netlify/functions/github-oauth", () => {
        return HttpResponse.json({ error: "Invalid code" }, { status: 400 });
      })
    );

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "not-authenticated"
      );
    });
  });

  it("handles GitHub API errors during user data fetch", async () => {
    const searchParams = new URLSearchParams();
    searchParams.append("code", "test-code");
    searchParams.append("state", "github");
    Object.defineProperty(window, "location", {
      value: { search: searchParams.toString() },
      writable: true,
    });

    server.use(
      http.post("/.netlify/functions/github-oauth", () => {
        return HttpResponse.json({
          access_token: "mock_github_token",
          token_type: "bearer",
        });
      }),
      http.get("https://api.github.com/user", () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "not-authenticated"
      );
    });
  });
});
