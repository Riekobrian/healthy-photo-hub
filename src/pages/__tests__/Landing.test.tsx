import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import Landing from "../Landing";
import { useAuth } from "@/hooks/use-auth";

// Mock dependencies
jest.mock("@/hooks/use-auth");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

const renderLanding = () => {
  return render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  );
};

describe("Landing Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });
  });

  it("renders welcome message and call-to-action", () => {
    renderLanding();

    expect(
      screen.getByRole("heading", { name: /welcome/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/share your health journey/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /get started/i })
    ).toBeInTheDocument();
  });

  it("navigates to login page when Get Started is clicked", () => {
    renderLanding();

    const getStartedButton = screen.getByRole("button", {
      name: /get started/i,
    });
    fireEvent.click(getStartedButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("redirects to home if already authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });

    renderLanding();

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("renders feature highlights section", () => {
    renderLanding();

    expect(
      screen.getByText(/organize your medical images/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/secure storage/i)).toBeInTheDocument();
    expect(screen.getByText(/easy sharing/i)).toBeInTheDocument();
  });

  it("renders call-to-action buttons in the header", () => {
    renderLanding();

    const loginButton = screen.getByRole("button", { name: /log in/i });
    const signUpButton = screen.getByRole("button", { name: /sign up/i });

    expect(loginButton).toBeInTheDocument();
    expect(signUpButton).toBeInTheDocument();

    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith("/login");

    fireEvent.click(signUpButton);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("displays app screenshots or illustrations", () => {
    renderLanding();

    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
    images.forEach((img) => {
      expect(img).toHaveAttribute("alt");
      expect(img).toHaveAttribute("src");
    });
  });

  it("shows benefits section with icons", () => {
    renderLanding();

    const benefits = [
      "Store your medical images securely",
      "Share with healthcare providers",
      "Organize by categories",
      "Access anywhere, anytime",
    ];

    benefits.forEach((benefit) => {
      expect(screen.getByText(benefit, { exact: false })).toBeInTheDocument();
    });
  });

  it("displays privacy-focused messaging", () => {
    renderLanding();

    expect(screen.getByText(/privacy/i)).toBeInTheDocument();
    expect(screen.getByText(/secure/i)).toBeInTheDocument();
  });

  it("includes multiple call-to-action buttons throughout the page", () => {
    renderLanding();

    const ctaButtons = screen.getAllByRole("button", {
      name: /(get started|try now|sign up)/i,
    });
    expect(ctaButtons.length).toBeGreaterThan(1);

    // All CTA buttons should navigate to login
    ctaButtons.forEach((button) => {
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
