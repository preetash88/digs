import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

// Local development uses a SQLite file (via libSQL, which ships ready-made
// binaries for Windows, Mac and Linux, so nothing has to be compiled).
// On AWS this becomes a PostgreSQL connection.
const file = process.env.DATABASE_PATH ?? "./data/digs.db";
fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });

// Reuse one connection while Next.js hot-reloads in development.
const g = globalThis as unknown as { __digsClient?: ReturnType<typeof createClient> };
const client = g.__digsClient ?? createClient({ url: `file:${file}` });
if (process.env.NODE_ENV !== "production") g.__digsClient = client;

// Make sure deleting an ad also deletes its photos, messages, etc.
client.execute("PRAGMA foreign_keys = ON").catch(() => {});

export const db = drizzle(client, { schema });
export { schema };
