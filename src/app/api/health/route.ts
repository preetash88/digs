// Used later by the AWS load balancer to check the app is alive.
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json({ ok: true });
}
