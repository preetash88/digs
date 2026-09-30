import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { HttpError } from "./api";
import bcrypt from "bcryptjs";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { passwordHash: false },
  });
  return user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Please log in first");
  return user;
}

export const hashPassword = (p: string) => bcrypt.hash(p, 10);
export const verifyPassword = (p: string, hash: string) => bcrypt.compare(p, hash);

// Keep these as no-ops so nothing else breaks — NextAuth handles sessions now
export async function createSession(_userId: string) {}
export async function destroySession() {}