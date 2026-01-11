/**
 * Ultra-lightweight latency measurement endpoint
 * No database access, no middleware, responds in <5ms
 */

export async function GET() {
  return Response.json({
    ok: true,
    timestamp: Date.now(),
  });
}

// Also support HEAD requests for even lighter pings
export async function HEAD() {
  return new Response(null, { status: 200 });
}
