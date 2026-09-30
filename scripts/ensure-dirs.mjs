// Creates the local data folders and a .env.local with a random session secret.
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

mkdirSync("data/uploads", { recursive: true });

if (!existsSync(".env.local")) {
  writeFileSync(".env.local", `SESSION_SECRET=${randomBytes(32).toString("hex")}\n`);
  console.log("Created .env.local with a random SESSION_SECRET");
}
