import "../../scripts/load-env.mjs";
import { defineConfig } from "drizzle-kit";
import path from "path";
import { fileURLToPath } from "url";

const url = process.env.DATABASE_URL?.trim();
const dbReady =
  !!url &&
  !url.includes("USER:PASSWORD@HOST") &&
  (url.startsWith("postgres://") || url.startsWith("postgresql://"));

if (!dbReady) {
  throw new Error(
    "DATABASE_URL is not configured. Set a real Postgres URL in .env before running db push.",
  );
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
