import React from "react";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "../LoadingSpinner";

describe("LoadingSpinner Component", () => {
  it("renders the spinner icon", () => {
    render(<LoadingSpinner />);
    const spinnerIcon = screen.getByRole("status"); // Assuming the icon has role='status'
    expect(spinnerIcon).toBeInTheDocument();
    // Check for a class that indicates it's the spinner (adjust class name if needed)
    expect(spinnerIcon.firstChild).toHaveClass("animate-spin");
  });

  it("renders text when provided", () => {
    const loadingText = "Loading data...";
    render(<LoadingSpinner text={loadingText} />);
    expect(screen.getByText(loadingText)).toBeInTheDocument();
  });

  it("does not render text when not provided", () => {
    render(<LoadingSpinner />);
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it("applies default size classes", () => {
    render(<LoadingSpinner />);
    const spinnerIcon = screen.getByRole("status");
    expect(spinnerIcon.firstChild).toHaveClass("h-8", "w-8"); // Default size
  });

  it("applies small size classes when size='sm'", () => {
    render(<LoadingSpinner size="sm" />);
    const spinnerIcon = screen.getByRole("status");
    expect(spinnerIcon.firstChild).toHaveClass("h-4", "w-4");
  });

  it("applies large size classes when size='lg'", () => {
    render(<LoadingSpinner size="lg" />);
    const spinnerIcon = screen.getByRole("status");
    expect(spinnerIcon.firstChild).toHaveClass("h-12", "w-12");
  });

  it("applies text size classes based on spinner size", () => {
    render(<LoadingSpinner size="lg" text="Loading Large..." />);
    const textElement = screen.getByText("Loading Large...");
    expect(textElement).toHaveClass("text-lg"); // Large text size

    render(<LoadingSpinner size="sm" text="Loading Small..." />);
    const smallTextElement = screen.getByText("Loading Small...");
    expect(smallTextElement).toHaveClass("text-xs"); // Small text size
  });
});
