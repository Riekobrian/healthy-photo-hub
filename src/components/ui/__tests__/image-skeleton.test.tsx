import { render, screen, fireEvent, act } from "@testing-library/react";
import { ImageWithSkeleton } from "../image-skeleton";

describe("ImageWithSkeleton", () => {
  const testSrc = "test-image.jpg";
  const testAlt = "Test Image";

  it("renders with skeleton while loading", () => {
    render(<ImageWithSkeleton src={testSrc} alt={testAlt} />);

    expect(screen.getByRole("img")).toHaveAttribute("src", testSrc);
    expect(screen.getByRole("img")).toHaveClass("opacity-0");
    expect(document.querySelector(".skeleton")).toBeInTheDocument();
  });

  it("shows image and removes skeleton after load", () => {
    render(<ImageWithSkeleton src={testSrc} alt={testAlt} />);

    const img = screen.getByRole("img");
    act(() => {
      fireEvent.load(img);
    });

    expect(img).toHaveClass("opacity-100");
    expect(document.querySelector(".skeleton")).not.toBeInTheDocument();
  });

  it("uses fallback image on error", () => {
    render(<ImageWithSkeleton src={testSrc} alt={testAlt} />);

    const img = screen.getByRole("img");
    act(() => {
      fireEvent.error(img);
    });

    expect(img).toHaveAttribute("src", "/placeholder.svg");
    expect(img).toHaveClass("opacity-100");
    expect(document.querySelector(".skeleton")).not.toBeInTheDocument();
  });

  it("uses custom fallback image when provided", () => {
    const customFallback = "/custom-fallback.jpg";
    render(
      <ImageWithSkeleton
        src={testSrc}
        alt={testAlt}
        fallbackSrc={customFallback}
      />
    );

    const img = screen.getByRole("img");
    act(() => {
      fireEvent.error(img);
    });

    expect(img).toHaveAttribute("src", customFallback);
  });

  it("applies custom className to container", () => {
    const customClass = "custom-class";
    render(
      <ImageWithSkeleton src={testSrc} alt={testAlt} className={customClass} />
    );

    expect(document.querySelector(`.${customClass}`)).toBeInTheDocument();
  });

  it("passes through additional props to img element", () => {
    render(
      <ImageWithSkeleton
        src={testSrc}
        alt={testAlt}
        width={100}
        height={100}
        data-testid="test-image"
      />
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("width", "100");
    expect(img).toHaveAttribute("height", "100");
    expect(img).toHaveAttribute("data-testid", "test-image");
  });

  it("handles multiple load/error events correctly", () => {
    render(<ImageWithSkeleton src={testSrc} alt={testAlt} />);

    const img = screen.getByRole("img");

    // First load
    act(() => {
      fireEvent.load(img);
    });
    expect(img).toHaveClass("opacity-100");

    // Error after load
    act(() => {
      fireEvent.error(img);
    });
    expect(img).toHaveAttribute("src", "/placeholder.svg");

    // Load fallback
    act(() => {
      fireEvent.load(img);
    });
    expect(img).toHaveClass("opacity-100");
  });

  it("maintains alt text after falling back", () => {
    render(<ImageWithSkeleton src={testSrc} alt={testAlt} />);

    const img = screen.getByRole("img");
    act(() => {
      fireEvent.error(img);
    });

    expect(img).toHaveAttribute("alt", testAlt);
  });
});
