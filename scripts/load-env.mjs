/**
 * Loads repo-root .env into process.env.
 * Use: node --import ./scripts/load-env.mjs  OR  import "./scripts/load-env.mjs"
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

function findEnvFile() {
  const roots = new Set();

  // Walk up from cwd (works when run from any package directory).
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    roots.add(dir);
    dir = path.dirname(dir);
  }

  // Also check relative to this loader file (repo/scripts → repo root).
  roots.add(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));

  for (const root of roots) {
    const envPath = path.join(root, ".env");
    if (existsSync(envPath)) return envPath;
  }

  return null;
}

const envPath = findEnvFile();
if (envPath) {
  config({ path: envPath });
}

export const envFile = envPath;
