import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { handle, requireUser } from "@/lib/api";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  bio: z.string().trim().max(600).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export const GET = handle(async () => {
  const user = await requireUser();
  return Response.json({ id: user.id, name: user.name, bio: user.bio, phone: user.phone, phoneVerified: user.phoneVerified, idVerified: user.idVerified });
});

export const PATCH = handle(async (req) => {
  const user = await requireUser();
  const input = profileSchema.parse(await req.json().catch(() => ({})));
  await db.update(users).set({
    name: input.name,
    bio: input.bio || null,
    phone: input.phone || null,
  }).where(eq(users.id, user.id));
  return Response.json({ ok: true });
});
