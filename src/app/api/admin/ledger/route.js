import { prisma } from "@/lib/db";
import { verifyLedgerIntegrity } from "@/lib/hashVerification";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all ledger entries
    const entries = await prisma.auditLog.findMany({
      orderBy: { timestamp: "asc" },
      select: {
        id: true,
        eventType: true,
        curr_hash: true,
        prev_hash: true,
        timestamp: true,
        signature: true,
      },
      take: 1000, // Limit to last 1000 entries for performance
    });

    // Get integrity status
    const integrityResult = await verifyLedgerIntegrity();
    const integrity = integrityResult.valid
      ? `${integrityResult.verifiedCount}/${integrityResult.totalEntries} Verified`
      : `${integrityResult.errors.length} Errors`;

    return NextResponse.json({
      entries: entries.map((entry) => ({
        id: entry.id,
        eventType: entry.eventType,
        curr_hash: entry.curr_hash,
        prev_hash: entry.prev_hash,
        timestamp: entry.timestamp,
        signature: entry.signature,
      })),
      integrity,
      totalEntries: entries.length,
    });
  } catch (error) {
    console.error("Error fetching ledger:", error);
    return NextResponse.json(
      { error: "Failed to fetch ledger data", entries: [], integrity: "Error" },
      { status: 500 }
    );
  }
}