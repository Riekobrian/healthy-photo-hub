import { renderHook } from "@testing-library/react";
import { AuthContext } from "@/context/AuthContextDefinition.test";
import { useAuth } from "../use-auth";
import React from "react";
import { AuthContextType, AuthStatus } from "@/context/auth-types";

describe("useAuth", () => {
  const mockAuthContext: AuthContextType = {
    status: "idle",
    user: null,
    error: null,
    isAuthenticated: false,
    isInitializing: true,
    authError: null,
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn().mockResolvedValue(undefined),
    loginWithGoogle: jest.fn().mockResolvedValue(undefined),
    loginWithGithub: jest.fn().mockResolvedValue(undefined),
  };

  it("should return auth context when used within AuthProvider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBe(mockAuthContext);
    expect(result.current.status).toBe("idle");
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(typeof result.current.loginWithGoogle).toBe("function");
    expect(typeof result.current.loginWithGithub).toBe("function");
  });

  it("should throw error when used outside of AuthProvider", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleError.mockRestore();
  });

  it("should maintain correct types from AuthContextType", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Type checking
    expect(typeof result.current.isAuthenticated).toBe("boolean");
    expect(typeof result.current.isInitializing).toBe("boolean");

    // Status should be one of the valid AuthStatus values
    const validStatuses: AuthStatus[] = [
      "idle",
      "loading",
      "authenticated",
      "unauthenticated",
    ];
    expect(validStatuses).toContain(result.current.status);

    // Null state checking
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.authError).toBeNull();
  });
});

describe("useAuth Hook", () => {
  it("throws error when used outside of AuthProvider", () => {
    // Wrap in expect to catch the error
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");
  });

  it("returns auth context when used within AuthProvider", () => {
    const mockAuthContext: AuthContextType = {
      status: "authenticated",
      user: {
        id: 1,
        name: "Test User",
        email: "test@example.com",
      },
      error: null,
      isAuthenticated: true,
      isInitializing: false,
      authError: null,
      login: jest.fn(),
      logout: jest.fn(),
      loginWithGoogle: jest.fn(),
      loginWithGithub: jest.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBe(mockAuthContext);
  });
});
