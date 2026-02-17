import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private minLevel: LogLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;
  private logBuffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 50;

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  getRecentLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown): void {
    if (level < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.MAX_BUFFER_SIZE) {
      this.logBuffer.shift();
    }

    if (environment.production) {
      this.writeStructuredLog(entry);
    } else {
      this.writeConsoleLog(entry);
    }
  }

  private writeStructuredLog(entry: LogEntry): void {
    const structured = {
      severity: LogLevel[entry.level],
      message: entry.message,
      timestamp: entry.timestamp,
      ...entry.context,
      ...(entry.error instanceof Error
        ? { errorMessage: entry.error.message, stack: entry.error.stack }
        : entry.error
          ? { errorDetail: String(entry.error) }
          : {}),
    };

    // Structured JSON logging for cloud log aggregation (Cloud Logging, Datadog, etc.)
    if (entry.level >= LogLevel.ERROR) {
      console.error(JSON.stringify(structured));
    } else if (entry.level >= LogLevel.WARN) {
      console.warn(JSON.stringify(structured));
    } else {
      console.log(JSON.stringify(structured));
    }
  }

  private writeConsoleLog(entry: LogEntry): void {
    const prefix = `[${LogLevel[entry.level]}]`;
    const args: unknown[] = [prefix, entry.message];

    if (entry.context) {
      args.push(entry.context);
    }
    if (entry.error) {
      args.push(entry.error);
    }

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(...args);
        break;
      case LogLevel.WARN:
        console.warn(...args);
        break;
      case LogLevel.INFO:
        console.info(...args);
        break;
      default:
        console.debug(...args);
    }
  }
}
