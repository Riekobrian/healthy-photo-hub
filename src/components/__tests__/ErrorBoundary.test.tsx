import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "@/components/ErrorBoundary"; // Using path alias
import { errorLogger, ErrorSeverity } from "@/services/error-logging";

// Mock error logger
jest.mock("@/services/error-logging", () => ({
  errorLogger: {
    log: jest.fn(),
  },
}));

// Mock console.error to prevent error messages during tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Component that throws an error
const ErrorComponent = () => {
  throw new Error("Test error");
};

// Test component with custom fallback
const CustomFallback = () => <div>Custom fallback content</div>;

describe("ErrorBoundary", () => {
  const ThrowError = () => {
    throw new Error("Test error");
  };

  const originalConsoleError = console.error;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders fallback UI when there is an error", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/We've been notified/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /refresh page/i })
    ).toBeInTheDocument();
  });

  it("logs errors with errorLogger", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(errorLogger.log).toHaveBeenCalledWith(
      "Test error",
      ErrorSeverity.CRITICAL,
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
      expect.any(Error)
    );
  });

  it("renders custom fallback when provided", () => {
    const CustomFallback = () => <div>Custom error UI</div>;

    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error UI")).toBeInTheDocument();
  });

  it("reloads page when refresh button is clicked", () => {
    // Properly type the mock location
    const mockReload = jest.fn();
    const originalLocation = window.location;
    const mockLocation = {
      ...originalLocation,
      reload: mockReload,
    } as unknown as Location;

    // Temporarily override window.location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: mockLocation,
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText("Refresh Page"));
    expect(mockReload).toHaveBeenCalled();

    // Restore original location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
      writable: true,
    });
  });
});
