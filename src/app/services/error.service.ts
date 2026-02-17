import { Injectable, ErrorHandler, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';

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
  private logger = inject(LoggerService);
  private errors: AppError[] = [];
  private maxErrors = 100;

  handleError(error: Error): void {
    const appError: AppError = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: new Date(),
    };

    this.logError(appError);

    if (environment.production) {
      this.reportError(appError);
    } else {
      this.logger.error('Unhandled application error', error);
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
    this.logger.error('Production error', error, {
      message: error.message,
      timestamp: error.timestamp.toISOString(),
      context: error.context,
    });

    // Firebase Crashlytics integration point:
    // import { getAnalytics, logEvent } from 'firebase/analytics';
    // logEvent(analytics, 'exception', { description: error.message, fatal: true });
  }

  async wrapAsync<T>(
    operation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (context) {
        const appError: AppError = {
          message: err.message,
          stack: err.stack,
          context,
          timestamp: new Date(),
        };
        this.logError(appError);
      }
      this.handleError(err);
      return null;
    }
  }
}
