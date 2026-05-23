import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;

/** True when DATABASE_URL looks like a real connection string. */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  if (url.includes("USER:PASSWORD@HOST")) return false;
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "DATABASE_URL is not configured. Set a real Postgres URL in .env to use newsletters.",
    );
  }
  if (!dbInstance) {
    poolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
    dbInstance = drizzle(poolInstance, { schema });
  }
  return dbInstance;
}

export function getPool(): pg.Pool {
  getDb();
  return poolInstance!;
}

/** Lazy proxy so importing @workspace/db does not require Postgres at startup. */
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});

export const pool = new Proxy({} as pg.Pool, {
  get(_target, prop, receiver) {
    return Reflect.get(getPool() as object, prop, receiver);
  },
});

export * from "./schema";
