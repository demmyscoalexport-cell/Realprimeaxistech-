import pino from "pino";

const baseOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
};

/** Sync stdout logging avoids pino worker threads, which hang Vercel serverless. */
export const logger = pino(
  baseOptions,
  pino.destination({ dest: 1, sync: true }),
);
