import fs from "node:fs/promises";
import path from "node:path";
import { HttpError } from "./api";

// Photos are stored on local disk for now. Later this file is the only thing
// that changes when we move to Amazon S3 (same two functions, different body).
const DIR = path.join(process.cwd(), "data", "uploads");
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 6 * 1024 * 1024;

export async function saveImage(file: File): Promise<string> {
  const ext = TYPES[file.type];
  if (!ext) throw new HttpError(400, "Photos must be JPG, PNG or WebP");
  if (file.size > MAX_BYTES) throw new HttpError(400, "Each photo must be under 6 MB");
  await fs.mkdir(DIR, { recursive: true });
  const name = `${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function readImage(name: string) {
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(name)) return null;
  try {
    const data = await fs.readFile(path.join(DIR, name));
    const type = Object.entries(TYPES).find(([, e]) => name.endsWith(e))?.[0] ?? "application/octet-stream";
    return { data, type };
  } catch {
    return null;
  }
}
