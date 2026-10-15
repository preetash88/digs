import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { handle, HttpError } from "@/lib/api";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export const POST = handle(async (req) => {
  const input = loginSchema.parse(await req.json().catch(() => ({})));
  const user = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  // Same message for "no such user" and "wrong password" so emails can't be guessed.
  if (!user || !user.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new HttpError(401, "Incorrect email or password");
  }
  await createSession(user.id);
  return Response.json({ ok: true });
});
