import { ZodError } from "zod";
import { getCurrentUser } from "./auth";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Please log in first");
  return user;
}

// Basic CSRF defence: browsers send an Origin header on cross-site POSTs.
function assertSameOrigin(req: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host && new URL(origin).host !== host) throw new HttpError(403, "Cross-site request blocked");
}

type Ctx<P> = { params: Promise<P> };

export function handle<P = Record<string, string>>(
  fn: (req: Request, ctx: Ctx<P>) => Promise<Response>,
) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      assertSameOrigin(req);
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
      if (e instanceof ZodError) {
        const issue = e.issues[0];
        return Response.json(
          { error: issue?.message ?? "Invalid input", field: issue?.path.join(".") },
          { status: 400 },
        );
      }
      console.error(e);
      return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}
