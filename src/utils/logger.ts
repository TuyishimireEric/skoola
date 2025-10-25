import { createLogger, transports, format, Logger } from "winston";

const { APP_ENV } = process.env;

if (!APP_ENV) {
  throw new Error("APP_ENV is not defined");
}

const winstonLogger: Logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.errors({ stack: true })
  ),
  transports: [
    ...(APP_ENV === "localhost"
      ? [
          new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
          }),
        ]
      : []), 
  ],
  exitOnError: false,
});

export const logger = winstonLogger;
