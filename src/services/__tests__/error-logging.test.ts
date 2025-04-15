import { errorLogger, ErrorSeverity } from "../error-logging";

describe("ErrorLogger", () => {
  const originalConsoleError = console.error;
  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorMock = jest.spyOn(console, "error").mockImplementation();
    errorLogger.clearLogs();
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
    console.error = originalConsoleError;
  });

  it("logs errors with context", () => {
    const error = new Error("Test error");
    const context = { userId: "123", action: "test" };

    errorLogger.log("Test error", ErrorSeverity.ERROR, context, error);

    expect(consoleErrorMock).toHaveBeenCalled();
    const logs = errorLogger.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0]).toMatchObject({
      message: "Test error",
      severity: ErrorSeverity.ERROR,
      context: {
        userId: "123",
        action: "test",
      },
      error: expect.any(Error),
    });
  });

  it("includes timestamp in logs", () => {
    const error = new Error("Test error");

    errorLogger.log("Test error", ErrorSeverity.ERROR, undefined, error);

    const logs = errorLogger.getLogs();
    expect(logs[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("handles different severity levels", () => {
    errorLogger.log("Info message", ErrorSeverity.INFO);
    errorLogger.log("Warning message", ErrorSeverity.WARNING);
    errorLogger.log("Error message", ErrorSeverity.ERROR);
    errorLogger.log("Critical message", ErrorSeverity.CRITICAL);

    const logs = errorLogger.getLogs();
    expect(logs).toHaveLength(4);
    expect(logs[3].severity).toBe(ErrorSeverity.INFO);
    expect(logs[2].severity).toBe(ErrorSeverity.WARNING);
    expect(logs[1].severity).toBe(ErrorSeverity.ERROR);
    expect(logs[0].severity).toBe(ErrorSeverity.CRITICAL);
  });

  it("maintains log rotation limit", () => {
    for (let i = 0; i < 105; i++) {
      errorLogger.log(`Message ${i}`, ErrorSeverity.INFO);
    }

    const logs = errorLogger.getLogs();
    expect(logs.length).toBe(100); // MAX_LOGS constant value
    expect(logs[0].message).toBe("Message 104"); // Latest message
  });
});
