import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { NavBar } from "../NavBar";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/use-auth";

// Mock useAuth hook
jest.mock("@/hooks/use-auth");
const mockUseAuth = useAuth as jest.Mock;

// Mock window.matchMedia for mobile testing
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

const renderNavBar = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <NavBar />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe("NavBar Component", () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.innerWidth to desktop size by default
    mockMatchMedia(false);
  });

  describe("Desktop View", () => {
    it("renders authenticated state correctly", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      });

      render(
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      );

      expect(screen.getByText("HealthyCare")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
      expect(screen.queryByText("Login")).not.toBeInTheDocument();
    });

    it("renders unauthenticated state correctly", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        logout: mockLogout,
      });

      render(
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      );

      expect(screen.getByText("HealthyCare")).toBeInTheDocument();
      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    });

    it("handles logout click", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      });

      render(
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByText("Logout"));
      expect(mockLogout).toHaveBeenCalled();
    });

    it("highlights active route", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      });

      render(
        <MemoryRouter initialEntries={["/home"]}>
          <NavBar />
        </MemoryRouter>
      );

      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).toHaveClass("text-primary");
    });
  });

  describe("Mobile View", () => {
    beforeEach(() => {
      // Set mobile view
      mockMatchMedia(true);
    });

    it("toggles mobile menu", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      });

      render(
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      );

      // Initially menu should be closed
      expect(screen.queryByText("Home")).not.toBeVisible();

      // Open menu
      const menuButton = screen.getByRole("button", { name: /menu/i });
      fireEvent.click(menuButton);

      // Menu should be visible
      expect(screen.getByText("Home")).toBeVisible();

      // Close menu
      fireEvent.click(menuButton);

      // Menu should be hidden
      expect(screen.queryByText("Home")).not.toBeVisible();
    });

    it("closes menu on navigation", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      });

      render(
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      );

      // Open menu
      const menuButton = screen.getByRole("button", { name: /menu/i });
      fireEvent.click(menuButton);

      // Click home link
      const homeLink = screen.getByText("Home");
      fireEvent.click(homeLink);

      // Menu should be closed
      expect(homeLink).not.toBeVisible();
    });

    it("closes menu on logo click", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      });

      render(
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      );

      // Open menu
      const menuButton = screen.getByRole("button", { name: /menu/i });
      fireEvent.click(menuButton);

      // Click logo
      const logo = screen.getByText("HealthyCare");
      fireEvent.click(logo);

      // Menu should be closed
      expect(screen.queryByText("Home")).not.toBeVisible();
    });

    it("handles mobile logout with menu closing", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      });

      render(
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      );

      // Open menu
      const menuButton = screen.getByRole("button", { name: /menu/i });
      fireEvent.click(menuButton);

      // Click logout
      const logoutButton = screen.getByText("Logout");
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
      expect(logoutButton).not.toBeVisible();
    });

    it("shows correct menu icon based on menu state", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      });

      render(
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      );

      const menuButton = screen.getByRole("button", { name: /menu/i });

      // Initially should show menu icon
      expect(
        menuButton.querySelector('svg[data-testid="menu-icon"]')
      ).toBeInTheDocument();

      // Click to open
      fireEvent.click(menuButton);

      // Should show close icon
      expect(
        menuButton.querySelector('svg[data-testid="close-icon"]')
      ).toBeInTheDocument();
    });
  });

  describe("Route Active State", () => {
    it("highlights home route when active", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      });

      render(
        <MemoryRouter initialEntries={["/home"]}>
          <NavBar />
        </MemoryRouter>
      );

      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).toHaveClass("text-primary");
    });

    it("does not highlight home route when on different path", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      });

      render(
        <MemoryRouter initialEntries={["/different"]}>
          <NavBar />
        </MemoryRouter>
      );

      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).not.toHaveClass("text-primary");
    });

    it("highlights root path when on landing page", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        logout: mockLogout,
      });

      render(
        <MemoryRouter initialEntries={["/"]}>
          <NavBar />
        </MemoryRouter>
      );

      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).toHaveClass("text-primary");
    });

    it("updates active state when navigating", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      });

      render(
        <MemoryRouter initialEntries={["/"]}>
          <NavBar />
        </MemoryRouter>
      );

      const homeLink = screen.getByText("Home").closest("a");

      // Initially not active
      expect(homeLink).not.toHaveClass("text-primary");

      // Click home link to navigate
      fireEvent.click(homeLink!);

      // Should be active after navigation
      expect(homeLink).toHaveClass("text-primary");
    });
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { NavBar } from "../NavBar";
import { useAuth } from "@/hooks/use-auth";
import { act } from "react-dom/test-utils";

// Mock hooks
jest.mock("@/hooks/use-auth");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseLocation = useLocation as jest.Mock;

describe("NavBar", () => {
  // Default mock setup
  const defaultMocks = () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      logout: jest.fn(),
    });
    mockUseLocation.mockReturnValue({ pathname: "/" });
  };

  beforeEach(() => {
    defaultMocks();
    // Reset window size to desktop
    window.innerWidth = 1024;
    window.dispatchEvent(new Event("resize"));
  });

  const renderNavBar = () =>
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

  describe("Desktop View", () => {
    it("renders brand name", () => {
      renderNavBar();
      expect(screen.getByText("HealthyCare")).toBeInTheDocument();
    });

    it("renders login button when not authenticated", () => {
      renderNavBar();
      expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    });

    it("renders home and logout when authenticated", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: jest.fn(),
      });
      renderNavBar();
      expect(screen.getByText(/home/i)).toBeInTheDocument();
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
    });

    it("calls logout function on logout button click", () => {
      const mockLogout = jest.fn();
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      });
      renderNavBar();
      fireEvent.click(screen.getByText(/logout/i));
      expect(mockLogout).toHaveBeenCalled();
    });

    it("highlights active link based on current location", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: jest.fn(),
      });
      mockUseLocation.mockReturnValue({ pathname: "/home" });
      renderNavBar();
      const homeLink = screen.getByText(/home/i).closest("a");
      expect(homeLink).toHaveClass("text-primary");
    });

    it("shows correct navigation for root path", () => {
      mockUseLocation.mockReturnValue({ pathname: "/" });
      renderNavBar();
      const homeLink = screen.getByText(/home/i).closest("a");
      expect(homeLink).toHaveClass("text-primary");
    });
  });

  describe("Mobile View", () => {
    beforeEach(() => {
      // Set mobile viewport
      window.innerWidth = 375;
      window.dispatchEvent(new Event("resize"));
    });

    it("shows menu button on mobile", () => {
      renderNavBar();
      expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("close-icon")).not.toBeInTheDocument();
    });

    it("toggles menu on button click", () => {
      renderNavBar();
      const menuButton = screen.getByRole("button");

      // Open menu
      fireEvent.click(menuButton);
      expect(screen.getByTestId("close-icon")).toBeInTheDocument();

      // Close menu
      fireEvent.click(menuButton);
      expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
    });

    it("closes menu when link is clicked", () => {
      renderNavBar();

      // Open menu
      fireEvent.click(screen.getByTestId("menu-icon"));

      // Click home link
      fireEvent.click(screen.getByText(/home/i));

      // Menu should be closed
      expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("close-icon")).not.toBeInTheDocument();
    });

    it("closes menu when brand link is clicked", () => {
      renderNavBar();

      // Open menu
      fireEvent.click(screen.getByTestId("menu-icon"));

      // Click brand name
      fireEvent.click(screen.getByText("HealthyCare"));

      // Menu should be closed
      expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
    });

    it("shows correct mobile menu items when authenticated", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: jest.fn(),
      });
      renderNavBar();

      // Open menu
      fireEvent.click(screen.getByTestId("menu-icon"));

      expect(screen.getByText(/home/i)).toBeInTheDocument();
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
      expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
    });

    it("shows correct mobile menu items when not authenticated", () => {
      renderNavBar();

      // Open menu
      fireEvent.click(screen.getByTestId("menu-icon"));

      expect(screen.getByText(/home/i)).toBeInTheDocument();
      expect(screen.getByText(/login/i)).toBeInTheDocument();
      expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
    });

    it("handles logout in mobile menu", () => {
      const mockLogout = jest.fn();
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      });
      renderNavBar();

      // Open menu and click logout
      fireEvent.click(screen.getByTestId("menu-icon"));
      fireEvent.click(screen.getByText(/logout/i));

      expect(mockLogout).toHaveBeenCalled();
      // Menu should be closed
      expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
    });
  });

  describe("Navigation Behavior", () => {
    it("maintains auth state across menu toggles", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: jest.fn(),
      });
      renderNavBar();

      const menuButton = screen.getByRole("button");

      // Toggle menu multiple times
      fireEvent.click(menuButton);
      fireEvent.click(menuButton);
      fireEvent.click(menuButton);

      expect(screen.getByText(/home/i)).toBeInTheDocument();
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
    });

    it("handles route changes correctly", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: jest.fn(),
      });

      // Start at home
      mockUseLocation.mockReturnValue({ pathname: "/home" });
      const { rerender } = renderNavBar();

      expect(screen.getByText(/home/i).closest("a")).toHaveClass(
        "text-primary"
      );

      // Change route
      mockUseLocation.mockReturnValue({ pathname: "/" });
      rerender(
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      );

      expect(screen.getByText(/home/i).closest("a")).not.toHaveClass(
        "text-primary"
      );
    });

    it("preserves menu state during auth changes", () => {
      // Start authenticated with menu open
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: jest.fn(),
      });
      const { rerender } = renderNavBar();

      // Open menu
      fireEvent.click(screen.getByTestId("menu-icon"));

      // Change to unauthenticated
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        logout: jest.fn(),
      });
      rerender(
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      );

      // Menu should still be open
      expect(screen.getByTestId("close-icon")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid menu toggles", () => {
      renderNavBar();
      const menuButton = screen.getByRole("button");

      // Rapidly toggle menu
      fireEvent.click(menuButton);
      fireEvent.click(menuButton);
      fireEvent.click(menuButton);
      fireEvent.click(menuButton);

      // Should end up in the correct state
      expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
    });

    it("handles logout during route change", () => {
      const mockLogout = jest.fn();
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      });
      renderNavBar();

      // Click logout while changing routes
      mockUseLocation.mockReturnValue({ pathname: "/other" });
      fireEvent.click(screen.getByText(/logout/i));

      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
