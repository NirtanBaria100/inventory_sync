import { createLogger, format, transports } from "winston";

// Configure the logger
const logger = createLogger({
  level: "info", // Log level
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message, stack }) =>
      stack
        ? `${timestamp} [${level.toUpperCase()}]: ${stack}`
        : `${timestamp} [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [
    // Log all info-level messages to 'combined.log'
    new transports.File({ filename: "logs/combined.log", level: "info" }),
    // Log all error-level messages to 'error.log'
    new transports.File({ filename: "logs/error.log", level: "error" }),
  ],
});

// For development, log to the console as well
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

export default logger;
