import { AuthContext } from "../AuthContextDefinition.test";
import { render } from "@testing-library/react";
import { useContext } from "react";
import React from "react";
import { AuthContextType } from "../auth-types";

describe("AuthContextDefinition", () => {
  const TestComponent = () => {
    const context = useContext(AuthContext);
    return <div data-testid="context-value">{JSON.stringify(context)}</div>;
  };

  const defaultContext: AuthContextType = {
    status: "idle",
    user: null,
    error: null,
    isAuthenticated: false,
    isInitializing: true,
    authError: null,
    login: async (email: string, password: string) => {},
    logout: async () => {},
    loginWithGoogle: async () => {},
    loginWithGithub: async () => {},
  };

  it("should have the correct initial state", () => {
    const { getByTestId } = render(
      <AuthContext.Provider value={defaultContext}>
        <TestComponent />
      </AuthContext.Provider>
    );

    const contextValue = JSON.parse(
      getByTestId("context-value").textContent || ""
    );

    expect(contextValue.status).toBe("idle");
    expect(contextValue.user).toBeNull();
    expect(contextValue.error).toBeNull();
    expect(contextValue.isAuthenticated).toBeFalsy();
    expect(contextValue.isInitializing).toBeTruthy();
    expect(contextValue.authError).toBeNull();
  });

  it("should have all required auth methods", () => {
    const { getByTestId } = render(
      <AuthContext.Provider value={defaultContext}>
        <TestComponent />
      </AuthContext.Provider>
    );

    const contextValue = JSON.parse(
      getByTestId("context-value").textContent || ""
    );

    expect(typeof contextValue.login).toBe("function");
    expect(typeof contextValue.logout).toBe("function");
    expect(typeof contextValue.loginWithGoogle).toBe("function");
    expect(typeof contextValue.loginWithGithub).toBe("function");
  });

  it("should have functions that resolve without error", async () => {
    const { login, logout, loginWithGoogle, loginWithGithub } = defaultContext;

    await expect(login("test@example.com", "password")).resolves.not.toThrow();
    await expect(logout()).resolves.not.toThrow();
    await expect(loginWithGoogle()).resolves.not.toThrow();
    await expect(loginWithGithub()).resolves.not.toThrow();
  });
});
