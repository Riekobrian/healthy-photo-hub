import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import Login from "../Login";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

// Mock dependencies
jest.mock("@/hooks/use-auth");
jest.mock("sonner");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("Login Component", () => {
  const mockNavigate = jest.fn();
  const mockLogin = jest.fn();
  const mockLoginWithGoogle = jest.fn();
  const mockLoginWithGithub = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle,
      loginWithGithub: mockLoginWithGithub,
    });
  });

  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  describe("Form Submission", () => {
    it("handles successful email/password login", async () => {
      mockLogin.mockResolvedValueOnce(undefined);
      renderLogin();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Sign In"));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          "test@example.com",
          "password123"
        );
        expect(mockNavigate).toHaveBeenCalledWith("/home");
      });
    });

    it("handles email/password login failure", async () => {
      const error = new Error("Invalid credentials");
      mockLogin.mockRejectedValueOnce(error);
      renderLogin();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "wrong-password" },
      });
      fireEvent.click(screen.getByText("Sign In"));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Login failed. Please check your credentials and try again."
        );
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("handles loading state during email/password login", async () => {
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      renderLogin();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Sign In"));

      // Form should be disabled during loading
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
      expect(screen.getByText("Signing in...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText("Sign In")).toBeInTheDocument();
      });
    });
  });

  describe("OAuth Login", () => {
    it("handles successful Google login", async () => {
      mockLoginWithGoogle.mockResolvedValueOnce(undefined);
      renderLogin();

      fireEvent.click(screen.getByText("Google"));

      await waitFor(() => {
        expect(mockLoginWithGoogle).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/home");
      });
    });

    it("handles Google login failure", async () => {
      const error = new Error("Google auth failed");
      mockLoginWithGoogle.mockRejectedValueOnce(error);
      renderLogin();

      fireEvent.click(screen.getByText("Google"));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Google login failed. Please try again."
        );
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("handles successful GitHub login", async () => {
      mockLoginWithGithub.mockResolvedValueOnce(undefined);
      renderLogin();

      fireEvent.click(screen.getByText("GitHub"));

      await waitFor(() => {
        expect(mockLoginWithGithub).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/home");
      });
    });

    it("handles GitHub login failure", async () => {
      const error = new Error("GitHub auth failed");
      mockLoginWithGithub.mockRejectedValueOnce(error);
      renderLogin();

      fireEvent.click(screen.getByText("GitHub"));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "GitHub login failed. Please try again."
        );
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("disables all buttons during any loading state", async () => {
      mockLoginWithGoogle.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      renderLogin();

      fireEvent.click(screen.getByText("Google"));

      // All buttons should be disabled during loading
      expect(screen.getByText("Sign In")).toBeDisabled();
      expect(screen.getByText("Google")).toBeDisabled();
      expect(screen.getByText("GitHub")).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText("Sign In")).not.toBeDisabled();
        expect(screen.getByText("Google")).not.toBeDisabled();
        expect(screen.getByText("GitHub")).not.toBeDisabled();
      });
    });
  });

  describe("Form Validation", () => {
    it("requires email and password fields", () => {
      renderLogin();

      const form = screen.getByRole("form");
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();

      fireEvent.submit(form);
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("validates email format", () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      expect(emailInput.validity.valid).toBeFalsy();

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      expect(emailInput.validity.valid).toBeTruthy();
    });
  });
});
