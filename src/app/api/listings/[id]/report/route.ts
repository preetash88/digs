import { z } from "zod";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { handle, requireUser } from "@/lib/api";

export const POST = handle<{ id: string }>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const { reason } = z
    .object({ reason: z.string().trim().min(5, "Please tell us what's wrong").max(1000) })
    .parse(await req.json().catch(() => ({})));
  await db.insert(reports).values({ reporterId: user.id, listingId: id, reason });
  return Response.json({ ok: true }, { status: 201 });
});
