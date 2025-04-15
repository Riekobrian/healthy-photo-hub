import { renderHook } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { useIsMobile } from "../use-mobile";

describe("useIsMobile Hook", () => {
  const originalInnerWidth = window.innerWidth;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.matchMedia = originalMatchMedia;
  });

  it("returns false for desktop viewport", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true for mobile viewport", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 480,
    });

    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query.includes("max-width"),
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("updates when window is resized", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(window, "innerWidth", { value: 480 });
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query.includes("max-width"),
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(true);
  });

  it("handles multiple resize events correctly", () => {
    const { result } = renderHook(() => useIsMobile());

    act(() => {
      // Test multiple viewport changes
      [1024, 480, 768, 320].forEach((width) => {
        Object.defineProperty(window, "innerWidth", { value: width });
        window.dispatchEvent(new Event("resize"));
      });
    });

    // Should reflect the last width (320px - mobile)
    expect(result.current).toBe(true);
  });

  it("properly removes event listeners on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });

  it("initializes with correct initial state", () => {
    Object.defineProperty(window, "innerWidth", { value: 1024 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    Object.defineProperty(window, "innerWidth", { value: 320 });
    const { result: mobileResult } = renderHook(() => useIsMobile());
    expect(mobileResult.current).toBe(true);
  });

  it("cleans up resize listener on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });

  it("debounces resize event handler", () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useIsMobile());

    // Simulate multiple rapid resize events
    act(() => {
      for (let i = 0; i < 5; i++) {
        Object.defineProperty(window, "innerWidth", {
          value: i % 2 === 0 ? 1024 : 480,
        });
        window.dispatchEvent(new Event("resize"));
      }
    });

    // Fast-forward timers
    act(() => {
      jest.runAllTimers();
    });

    // Only the last resize event should be processed
    expect(result.current).toBe(false);

    jest.useRealTimers();
  });

  // New tests
  it("should return false for desktop viewport", () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("should return true for mobile viewport", () => {
    window.innerWidth = 375;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("should update when window is resized", () => {
    const { result } = renderHook(() => useIsMobile());

    // Start with desktop size
    expect(result.current).toBe(false);

    // Simulate resize to mobile
    act(() => {
      window.innerWidth = 375;
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(true);
  });

  it("should handle media query changes", () => {
    const mqlListeners = new Set<(e: MediaQueryListEvent) => void>();
    const mockMql = {
      matches: false,
      addEventListener: (
        type: string,
        listener: (e: MediaQueryListEvent) => void
      ) => {
        mqlListeners.add(listener);
      },
      removeEventListener: (
        type: string,
        listener: (e: MediaQueryListEvent) => void
      ) => {
        mqlListeners.delete(listener);
      },
    };

    (window.matchMedia as jest.Mock).mockImplementation(() => mockMql);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      mqlListeners.forEach((listener) =>
        listener({ matches: true } as MediaQueryListEvent)
      );
    });

    expect(result.current).toBe(true);
  });

  it("should cleanup event listeners on unmount", () => {
    const removeEventListener = jest.fn();
    (window.matchMedia as jest.Mock).mockImplementation(() => ({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener,
    }));

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeEventListener).toHaveBeenCalled();
  });
});
