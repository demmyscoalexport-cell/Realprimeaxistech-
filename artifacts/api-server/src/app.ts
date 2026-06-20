import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
function corsOrigins(): string[] | undefined {
  const raw = process.env.CORS_ORIGIN || process.env.PUBLIC_SITE_URL;
  if (!raw) return undefined;
  const origins = raw.split(",").map((value) => value.trim()).filter(Boolean);
  for (const origin of [...origins]) {
    try {
      const url = new URL(origin);
      if (url.hostname.startsWith("www.")) continue;
      origins.push(`${url.protocol}//www.${url.hostname}`);
    } catch {
      // ignore invalid URLs in CORS_ORIGIN
    }
  }
  return [...new Set(origins)];
}

const allowedOrigins = corsOrigins();

if (process.env.VERCEL !== "1") {
  app.use(
    pinoHttp({
      logger,
      serializers: {
        req(req) {
          return {
            id: req.id,
            method: req.method,
            url: req.url?.split("?")[0],
          };
        },
        res(res) {
          return {
            statusCode: res.statusCode,
          };
        },
      },
    }),
  );
} else {
  app.use((req, _res, next) => {
    req.log = logger;
    next();
  });
}
app.use(
  cors(
    allowedOrigins
      ? {
          origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
              return;
            }
            callback(null, false);
          },
        }
      : undefined,
  ),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
