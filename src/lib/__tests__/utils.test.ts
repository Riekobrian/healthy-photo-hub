import { cn, formatDate, truncateText, isValidEmail, debounce } from "../utils";

describe("Utility Functions", () => {
  describe("cn (classNames)", () => {
    it("merges class names correctly", () => {
      expect(cn("base", "extra")).toBe("base extra");
      expect(cn("base", undefined, "extra")).toBe("base extra");
      expect(cn("base", null, "extra")).toBe("base extra");

      const condition1 = false;
      const condition2 = true;
      expect(cn("base", condition1 && "hidden", condition2 && "visible")).toBe(
        "base visible"
      );
    });

    it("handles conditional classes", () => {
      const isActive = true;
      const isHidden = false;
      expect(cn("base", isActive && "active", isHidden && "hidden")).toBe(
        "base active"
      );
    });

    it("handles complex class combinations", () => {
      const isVisible = true;
      const isInvisible = false;
      expect(
        cn(
          "font-bold",
          "p-4",
          isVisible && "visible",
          isInvisible && "invisible",
          undefined,
          null,
          { "bg-red": true, "text-white": true, hidden: false }
        )
      ).toBe("font-bold p-4 visible bg-red text-white");
    });
  });

  describe("formatDate", () => {
    it("formats date to readable string", () => {
      const date = new Date("2024-04-11T12:00:00Z");
      expect(formatDate(date)).toMatch(/Apr(?:il)? 11, 2024/);
    });

    it("handles different date formats", () => {
      const dateString = "2024-04-11";
      expect(formatDate(dateString)).toMatch(/Apr(?:il)? 11, 2024/);
    });

    it("returns original value if invalid date", () => {
      const invalidDate = "not-a-date";
      expect(formatDate(invalidDate)).toBe(invalidDate);
    });
  });

  describe("truncateText", () => {
    it("truncates text longer than maxLength", () => {
      const longText = "This is a very long text that needs to be truncated";
      expect(truncateText(longText, 20)).toBe("This is a very long...");
    });

    it("does not truncate text shorter than maxLength", () => {
      const shortText = "Short text";
      expect(truncateText(shortText, 20)).toBe(shortText);
    });

    it("handles custom ellipsis", () => {
      const text = "This needs truncation";
      expect(truncateText(text, 10, "***")).toBe("This needs***");
    });

    it("handles empty string", () => {
      expect(truncateText("", 10)).toBe("");
    });
  });

  describe("isValidEmail", () => {
    it("validates correct email formats", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name+tag@domain.com")).toBe(true);
      expect(isValidEmail("user@subdomain.domain.co.uk")).toBe(true);
    });

    it("rejects invalid email formats", () => {
      expect(isValidEmail("not-an-email")).toBe(false);
      expect(isValidEmail("missing@domain")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("spaces in@email.com")).toBe(false);
    });

    it("handles edge cases", () => {
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail(" ")).toBe(false);
      expect(isValidEmail(null as unknown as string)).toBe(false);
      expect(isValidEmail(undefined as unknown as string)).toBe(false);
    });
  });

  describe("debounce", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("debounces function calls", () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 1000);

      // Call multiple times
      debouncedFunc();
      debouncedFunc();
      debouncedFunc();

      // Function should not have been called yet
      expect(func).not.toHaveBeenCalled();

      // Fast forward time
      jest.runAllTimers();

      // Function should have been called once
      expect(func).toHaveBeenCalledTimes(1);
    });

    it("calls function with latest arguments", () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 1000);

      debouncedFunc("first");
      debouncedFunc("second");
      debouncedFunc("third");

      jest.runAllTimers();

      expect(func).toHaveBeenCalledWith("third");
    });

    it("maintains proper this context", () => {
      interface TestObject {
        value: number;
        method: jest.Mock;
      }

      const obj: TestObject = {
        value: 42,
        method: jest.fn(function (this: TestObject) {
          return this.value;
        }),
      };

      const debouncedMethod = debounce(obj.method, 1000).bind(obj);

      debouncedMethod();
      jest.runAllTimers();

      expect(obj.method).toHaveBeenCalledTimes(1);
      expect(obj.method.mock.instances[0]).toBe(obj);
    });
  });
});
