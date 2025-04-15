import { renderHook, act } from "@testing-library/react";
import { useToast, toast, reducer } from "../use-toast";
import type { ToastProps, ToastActionElement } from "@/components/ui/toast";

// Define internal types needed for testing
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

interface State {
  toasts: ToasterToast[];
}

describe("useToast", () => {
  beforeEach(() => {
    // Clear existing toasts before each test
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.dismiss();
    });
  });

  it("should add a toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Test Toast",
        description: "This is a test toast",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: "Test Toast",
      description: "This is a test toast",
      open: true,
    });
  });

  it("should update a toast", () => {
    const { result } = renderHook(() => useToast());
    let toastId: string;

    act(() => {
      const toast = result.current.toast({
        title: "Original Title",
        description: "Original description",
      });
      toastId = toast.id;
    });

    act(() => {
      result.current.toast({
        id: toastId,
        title: "Updated Title",
        description: "Updated description",
      });
    });

    const updatedToast = result.current.toasts.find((t) => t.id === toastId);
    expect(updatedToast).toMatchObject({
      title: "Updated Title",
      description: "Updated description",
    });
  });

  it("should dismiss a specific toast", () => {
    const { result } = renderHook(() => useToast());
    let toastId: string;

    act(() => {
      const toast = result.current.toast({
        title: "Test Toast",
      });
      toastId = toast.id;
    });

    act(() => {
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts.find((t) => t.id === toastId)?.open).toBe(
      false
    );
  });

  it("should dismiss all toasts", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: "Toast 1" });
      result.current.toast({ title: "Toast 2" });
    });

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toasts.every((t) => !t.open)).toBe(true);
  });

  it("should maintain toast limit", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      // Add multiple toasts
      for (let i = 0; i < 5; i++) {
        result.current.toast({
          title: `Toast ${i + 1}`,
        });
      }
    });

    // TOAST_LIMIT is 1, so only one toast should be visible
    expect(result.current.toasts).toHaveLength(1);
  });

  it("should handle onOpenChange callback", () => {
    const { result } = renderHook(() => useToast());
    let toastId: string;

    act(() => {
      const toast = result.current.toast({
        title: "Test Toast",
      });
      toastId = toast.id;
    });

    const targetToast = result.current.toasts.find((t) => t.id === toastId);
    expect(targetToast).toBeDefined();

    act(() => {
      targetToast?.onOpenChange?.(false);
    });

    expect(result.current.toasts.find((t) => t.id === toastId)?.open).toBe(
      false
    );
  });

  it("should clean up listeners on unmount", () => {
    const { result, unmount } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Test Toast",
      });
    });

    unmount();

    // Add a new toast after unmount to verify listener cleanup
    const { result: newResult } = renderHook(() => useToast());
    act(() => {
      newResult.current.toast({
        title: "New Toast",
      });
    });

    expect(newResult.current.toasts).toHaveLength(1);
  });

  it("should handle toast action elements", () => {
    const { result } = renderHook(() => useToast());
    const actionFn = jest.fn();

    act(() => {
      result.current.toast({
        title: "Test Toast",
        action: {
          altText: "Test Action",
          onClick: actionFn,
        },
      });
    });

    const toast = result.current.toasts[0];
    expect(toast.action).toBeDefined();
    expect(toast.action?.altText).toBe("Test Action");
  });

  it("should remove toasts after delay", () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Test Toast",
      });
    });

    act(() => {
      result.current.dismiss(result.current.toasts[0].id);
      jest.runAllTimers();
    });

    expect(result.current.toasts).toHaveLength(0);
    jest.useRealTimers();
  });
});

describe("toast functionality", () => {
  it("should add a toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Test Toast",
        description: "Test Description",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: "Test Toast",
      description: "Test Description",
      open: true,
    });
  });

  it("should update a toast", () => {
    const { result } = renderHook(() => useToast());
    let toastResponse: {
      id: string;
      dismiss: () => void;
      update: (props: ToasterToast) => void;
    };

    act(() => {
      toastResponse = result.current.toast({ title: "Initial Toast" });
    });

    act(() => {
      toastResponse.update({
        id: toastResponse.id,
        title: "Updated Toast",
      } as ToasterToast);
    });

    expect(result.current.toasts[0]).toMatchObject({
      id: toastResponse.id,
      title: "Updated Toast",
    });
  });

  it("should dismiss a specific toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      const { id } = result.current.toast({ title: "Test Toast" });
      result.current.dismiss(id);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it("should dismiss all toasts", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: "Toast 1" });
      result.current.toast({ title: "Toast 2" });
      result.current.dismiss();
    });

    expect(result.current.toasts.every((toast) => !toast.open)).toBe(true);
  });

  it("should remove toasts after the timeout", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      const { id } = result.current.toast({ title: "Test Toast" });
      result.current.dismiss(id);
      jest.runAllTimers();
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("should enforce toast limit", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.toast({ title: `Toast ${i}` });
      }
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Toast 4");
  });
});

describe("reducer", () => {
  it("should handle ADD_TOAST action", () => {
    const initialState: State = { toasts: [] };
    const newToast: ToasterToast = {
      id: "1",
      title: "New Toast",
      open: true,
    };
    const action = { type: "ADD_TOAST" as const, toast: newToast };

    const newState = reducer(initialState, action);

    expect(newState.toasts).toHaveLength(1);
    expect(newState.toasts[0]).toEqual(newToast);
  });

  it("should handle UPDATE_TOAST action", () => {
    const initialState: State = {
      toasts: [{ id: "1", title: "Old Toast", open: true } as ToasterToast],
    };
    const updatedToast: Partial<ToasterToast> = {
      id: "1",
      title: "Updated Toast",
    };
    const action = { type: "UPDATE_TOAST" as const, toast: updatedToast };

    const newState = reducer(initialState, action);

    expect(newState.toasts[0].title).toBe("Updated Toast");
  });

  it("should handle DISMISS_TOAST action for specific toast", () => {
    const initialState: State = {
      toasts: [
        { id: "1", title: "Toast 1", open: true } as ToasterToast,
        { id: "2", title: "Toast 2", open: true } as ToasterToast,
      ],
    };
    const action = { type: "DISMISS_TOAST" as const, toastId: "1" };

    const newState = reducer(initialState, action);

    expect(newState.toasts[0].open).toBe(false);
    expect(newState.toasts[1].open).toBe(true);
  });

  it("should handle DISMISS_TOAST action for all toasts", () => {
    const initialState = {
      toasts: [
        { id: "1", title: "Toast 1", open: true } as ToasterToast,
        { id: "2", title: "Toast 2", open: true } as ToasterToast,
      ],
    };
    const action = { type: "DISMISS_TOAST" as const };

    const newState = reducer(initialState, action);

    expect(newState.toasts.every((toast) => !toast.open)).toBe(true);
  });

  it("should handle REMOVE_TOAST action for specific toast", () => {
    const initialState = {
      toasts: [
        { id: "1", title: "Toast 1" } as ToasterToast,
        { id: "2", title: "Toast 2" } as ToasterToast,
      ],
    };
    const action = { type: "REMOVE_TOAST" as const, toastId: "1" };

    const newState = reducer(initialState, action);

    expect(newState.toasts).toHaveLength(1);
    expect(newState.toasts[0].id).toBe("2");
  });

  it("should handle REMOVE_TOAST action for all toasts", () => {
    const initialState = {
      toasts: [
        { id: "1", title: "Toast 1" } as ToasterToast,
        { id: "2", title: "Toast 2" } as ToasterToast,
      ],
    };
    const action = { type: "REMOVE_TOAST" as const };

    const newState = reducer(initialState, action);

    expect(newState.toasts).toHaveLength(0);
  });
});

describe("toast handlers", () => {
  it("should handle onOpenChange callback", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      const { id } = result.current.toast({ title: "Test Toast" });
      const toast = result.current.toasts.find((t) => t.id === id);
      if (toast?.onOpenChange) {
        toast.onOpenChange(false);
      }
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it("should not add duplicate timeouts for the same toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      const { id } = result.current.toast({ title: "Test Toast" });
      // Try to dismiss the same toast multiple times
      result.current.dismiss(id);
      result.current.dismiss(id);
      result.current.dismiss(id);
    });

    // Only one timeout should be created
    act(() => {
      jest.runAllTimers();
    });

    expect(result.current.toasts).toHaveLength(0);
  });
});

describe("Toast Remove Action", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should remove specific toast after delay", () => {
    const { result } = renderHook(() => useToast());

    // Add two toasts
    act(() => {
      result.current.toast({ title: "Toast 1" });
      result.current.toast({ title: "Toast 2" });
    });

    const firstToastId = result.current.toasts[0].id;

    // Dismiss first toast
    act(() => {
      result.current.dismiss(firstToastId);
    });

    // Fast forward timers
    act(() => {
      jest.runAllTimers();
    });

    // Should remove only the dismissed toast
    expect(
      result.current.toasts.find((t) => t.id === firstToastId)
    ).toBeUndefined();
  });

  it("should remove all toasts when no id provided", () => {
    const { result } = renderHook(() => useToast());

    // Add multiple toasts
    act(() => {
      result.current.toast({ title: "Toast 1" });
      result.current.toast({ title: "Toast 2" });
    });

    // Dismiss all toasts
    act(() => {
      result.current.dismiss();
    });

    // Fast forward timers
    act(() => {
      jest.runAllTimers();
    });

    // Should remove all toasts
    expect(result.current.toasts).toHaveLength(0);
  });

  it("should handle duplicate dismiss calls", () => {
    const { result } = renderHook(() => useToast());

    // Add a toast
    act(() => {
      result.current.toast({ title: "Test Toast" });
    });

    const toastId = result.current.toasts[0].id;

    // Call dismiss multiple times
    act(() => {
      result.current.dismiss(toastId);
      result.current.dismiss(toastId);
      result.current.dismiss(toastId);
    });

    // Fast forward timers
    act(() => {
      jest.runAllTimers();
    });

    // Should only remove once
    expect(result.current.toasts).toHaveLength(0);
  });

  it("should handle remove action directly", () => {
    const { result } = renderHook(() => useToast());

    // Add a toast
    act(() => {
      result.current.toast({ title: "Test Toast" });
    });

    const toastId = result.current.toasts[0].id;

    // Dispatch remove action directly
    act(() => {
      result.current.dismiss(toastId);
      jest.runAllTimers();
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("should cleanup timeouts properly", () => {
    const { result, unmount } = renderHook(() => useToast());

    // Add and dismiss a toast
    act(() => {
      const toast = result.current.toast({ title: "Test Toast" });
      result.current.dismiss(toast.id);
    });

    // Unmount before timer completes
    unmount();

    // Fast forward timers
    act(() => {
      jest.runAllTimers();
    });

    // Should not throw errors
    expect(() => {
      jest.runAllTimers();
    }).not.toThrow();
  });
});
