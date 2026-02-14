import { Injectable, ErrorHandler } from '@angular/core';
import { environment } from '../../environments/environment';

export interface AppError {
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService implements ErrorHandler {
  private errors: AppError[] = [];
  private maxErrors = 100;

  handleError(error: Error): void {
    const appError: AppError = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: new Date(),
    };

    this.logError(appError);

    // In production, you might want to send errors to a logging service
    if (environment.production) {
      this.reportError(appError);
    } else {
      console.error('Application Error:', error);
    }
  }

  logError(error: AppError): void {
    this.errors.unshift(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }
  }

  getRecentErrors(): AppError[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  private reportError(error: AppError): void {
    // TODO: Integrate with error reporting service (e.g., Sentry, Firebase Crashlytics)
    // For now, just log to console in a structured way
    console.error('[PRODUCTION ERROR]', JSON.stringify({
      message: error.message,
      timestamp: error.timestamp.toISOString(),
      context: error.context,
    }));
  }

  // Helper to wrap async operations with error handling
  async wrapAsync<T>(
    operation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }
}
