import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { handle, HttpError } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { signupSchema } from "@/lib/validators";

export const POST = handle(async (req) => {
  const input = signupSchema.parse(await req.json().catch(() => ({})));
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
    columns: { id: true },
  });
  if (existing) throw new HttpError(409, "An account with that email already exists");
  await db.insert(users).values({
    email: input.email,
    name: input.name,
    passwordHash: await hashPassword(input.password),
  });
  return Response.json({ ok: true }, { status: 201 });
});