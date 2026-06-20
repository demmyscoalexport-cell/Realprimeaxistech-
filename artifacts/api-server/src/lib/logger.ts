import pino from "pino";
import type { Logger } from "pino";

const baseOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
};

const noopLogger = {
  level: "silent",
  fatal: () => {},
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
  trace: () => {},
  silent: () => {},
  child: () => noopLogger,
} as unknown as Logger;

/** On Vercel, skip pino entirely — bundled worker threads caused 504 cold starts. */
export const logger: Logger =
  process.env.VERCEL === "1"
    ? noopLogger
    : pino(baseOptions, pino.destination({ dest: 1, sync: true }));
