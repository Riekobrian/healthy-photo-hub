import { toast } from "sonner";

export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

interface ErrorLog {
  message: string;
  severity: ErrorSeverity;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class ErrorLoggingService {
  private static instance: ErrorLoggingService;
  private logs: ErrorLog[] = [];
  private readonly MAX_LOGS = 100;

  private constructor() {}

  static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService();
    }
    return ErrorLoggingService.instance;
  }

  private formatError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(String(error));
  }

  log(
    message: string,
    severity: ErrorSeverity,
    context?: Record<string, unknown>,
    error?: unknown
  ): void {
    const errorLog: ErrorLog = {
      message,
      severity,
      timestamp: new Date().toISOString(),
      context,
      error: error ? this.formatError(error) : undefined,
    };

    // Add to local logs with rotation
    this.logs.unshift(errorLog);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.pop();
    }

    // Console logging
    const consoleMessage = `[${errorLog.severity.toUpperCase()}] ${
      errorLog.message
    }`;
    switch (severity) {
      case ErrorSeverity.INFO:
        console.log(consoleMessage, { context, error: errorLog.error });
        break;
      case ErrorSeverity.WARNING:
        console.warn(consoleMessage, { context, error: errorLog.error });
        break;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        console.error(consoleMessage, { context, error: errorLog.error });
        break;
    }

    // UI notifications for user-facing errors
    if (
      severity === ErrorSeverity.ERROR ||
      severity === ErrorSeverity.CRITICAL
    ) {
      toast.error(message);
    } else if (severity === ErrorSeverity.WARNING) {
      toast.warning(message);
    }

    // For critical errors, you might want to send to an external service
    if (severity === ErrorSeverity.CRITICAL) {
      this.reportToCentralizedService(errorLog);
    }
  }

  private async reportToCentralizedService(errorLog: ErrorLog): Promise<void> {
    // TODO: Implement reporting to your preferred error tracking service
    // Examples: Sentry, LogRocket, etc.
    try {
      // Placeholder for external service integration
      console.log("Reporting critical error to central service:", errorLog);
    } catch (error) {
      console.error("Failed to report error to central service:", error);
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const errorLogger = ErrorLoggingService.getInstance();
