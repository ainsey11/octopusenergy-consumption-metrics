import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { getConfig } from '../config';

const { combine, timestamp, printf, colorize } = winston.format;

export class Logger {
  private static instance: winston.Logger;

  private static createLogger(): winston.Logger {
    const config = getConfig();
    const { level, enableFileLogging, logFilePath, errorLogFilePath } = config.logging;

    // Create logs directory if it doesn't exist
    if (enableFileLogging) {
      const logsDir = path.dirname(logFilePath);
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
    }

    const customFormat = printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level}]: ${message}`;
    });

    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: combine(
          colorize(),
          timestamp(),
          customFormat
        )
      })
    ];

    if (enableFileLogging) {
      transports.push(
        new winston.transports.File({
          filename: errorLogFilePath,
          level: 'error'
        }),
        new winston.transports.File({
          filename: logFilePath
        })
      );
    }

    return winston.createLogger({
      level,
      format: combine(
        timestamp(),
        customFormat
      ),
      transports
    });
  }

  public static getInstance(): winston.Logger {
    if (!Logger.instance) {
      Logger.instance = Logger.createLogger();
    }
    return Logger.instance;
  }

  public static reload(): void {
    Logger.instance = Logger.createLogger();
  }
}

export const logger = Logger.getInstance();

// Usage example:
// import { logger } from './logger';
// logger.info('Application started');
// logger.error('An error occurred', { error: new Error('Something went wrong') });
// logger.debug('Debug message');