// Stub for ID verification. In production this initiates a Stripe Identity session.
// For now it just marks the user as verified (demo mode).
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { handle, requireUser } from "@/lib/api";

export const POST = handle(async () => {
  const user = await requireUser();
  if (user.idVerified) return Response.json({ ok: true, already: true });
  await db.update(users).set({ idVerified: true }).where(eq(users.id, user.id));
  return Response.json({ ok: true });
});
