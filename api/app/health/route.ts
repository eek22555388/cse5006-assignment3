import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsHeaders } from '@/lib/api-helpers';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * Liveness + readiness probe at the exact path required by the brief.
 * 200 = app up and database reachable. 503 = app up, dependency down.
 * Deliberately not written to RequestLog: probes poll frequently and would
 * distort the very metrics they exist to protect.
 */
export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: 'ok',
        database: 'connected',
        latencyMs: Date.now() - startedAt,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      },
      { headers: corsHeaders }
    );
  } catch {
    return NextResponse.json(
      { status: 'degraded', database: 'unreachable', timestamp: new Date().toISOString() },
      { status: 503, headers: corsHeaders }
    );
  }
}