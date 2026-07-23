import "dotenv/config";

import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
if (!url.startsWith("file:")) {
  throw new Error("db:local:init requires a file: DATABASE_URL.");
}

const client = createClient({ url });
const existing = await client.execute(
  "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'User'",
);

if (existing.rows.length) {
  console.log(`Local SQLite database is already initialized at ${url}.`);
} else {
  const migration = await readFile(
    new URL("../prisma/migrations/20260724000000_sqlite_init/migration.sql", import.meta.url),
    "utf8",
  );
  await client.executeMultiple(migration);
  console.log(`Initialized local SQLite database at ${url}.`);
}

client.close();
