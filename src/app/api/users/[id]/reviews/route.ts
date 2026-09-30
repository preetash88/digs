import { z } from "zod";
import { db } from "@/db";
import { userReviews } from "@/db/schema";
import { handle, HttpError, requireUser } from "@/lib/api";
import { canReviewUser } from "@/lib/profiles";

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(10, "Please write at least 10 characters").max(1000),
  role: z.enum(["host", "seeker"]),
});

export const POST = handle<{ id: string }>(async (req, { params }) => {
  const reviewer = await requireUser();
  const { id: revieweeId } = await params;
  if (reviewer.id === revieweeId) throw new HttpError(400, "You can't review yourself");
  const ok = await canReviewUser(reviewer.id, revieweeId);
  if (!ok) throw new HttpError(409, "You've already reviewed this person");
  const input = reviewSchema.parse(await req.json().catch(() => ({})));
  await db.insert(userReviews).values({
    reviewerId: reviewer.id,
    revieweeId,
    rating: input.rating,
    body: input.body,
    role: input.role,
  });
  return Response.json({ ok: true }, { status: 201 });
});
