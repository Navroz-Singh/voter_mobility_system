"use server";

import { prisma } from "@/lib/db";
import { sendToRelocationQueue } from "@/lib/rabbitmq"; // Your existing helper
import { revalidatePath } from "next/cache";

/**
 * Fetches conflicts from Postgres (populated by DLQ Worker)
 */
export async function getConflictsAction() {
  try {
    const conflicts = await prisma.conflictLog.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      success: true,
      conflicts: conflicts.map((c) => ({
        id: c.id, // DB ID
        epic: c.epic_number,
        // Helper to extract name safely from the JSON payload
        voter: `${c.original_payload?.payload?.firstName || ""} ${c.original_payload?.payload?.lastName || ""}`.trim(),
        issue: c.conflict_reason,
        timestamp: c.createdAt,
        version: c.actual_version || 0,
        // Pass full original data for retry logic
        fullEvent: c.original_payload 
      })),
    };
  } catch (error) {
    console.error("Error fetching conflicts:", error);
    return { success: false, error: "Database unavailable" };
  }
}

/**
 * Accept Remote: We effectively discard the failed packet because
 * we assume the system state is already fresher or we want to ignore the update.
 */
export async function acceptRemoteVersionAction(conflictId) {
  try {
    // Mark as resolved in DB so it disappears from UI
    await prisma.conflictLog.update({
      where: { id: conflictId },
      data: { status: "RESOLVED_DISCARDED" }
    });

    revalidatePath("/admin/conflicts");
    return { success: true, message: "Conflict resolved: Remote version accepted" };
  } catch (error) {
    console.error("Error resolving conflict:", error);
    return { success: false, error: "Failed to update conflict status" };
  }
}

/**
 * Keep Local (Force Retry): We take the original payload, 
 * update its expected version to match the DB, and re-send to Main Queue.
 */
export async function keepLocalVersionAction(conflictId, eventData) {
  try {
    // 1. Get current live version from User table
    const currentUser = await prisma.user.findUnique({
      where: { epic_number: eventData.payload.epic.toUpperCase() },
      select: { version: true }
    });

    // 2. Patch the event with the *current* DB version 
    // This allows the optimistic lock to pass when the worker processes it again
    const patchedEvent = {
      ...eventData,
      expected_version: currentUser ? currentUser.version : 0,
      retry_count: (eventData.retry_count || 0) + 1,
      retry_metadata: {
        retried_at: new Date().toISOString(),
        previous_conflict_id: conflictId
      }
    };

    // 3. Send back to MAIN Queue (Relocation Queue)
    await sendToRelocationQueue(patchedEvent);

    // 4. Mark conflict as resolved in DB
    await prisma.conflictLog.update({
      where: { id: conflictId },
      data: { status: "RESOLVED_RETRIED" }
    });

    revalidatePath("/admin/conflicts");
    return { success: true, message: "Conflict resolved: Re-queued for processing" };
  } catch (error) {
    console.error("Error resolving conflict:", error);
    return { success: false, error: "Failed to re-queue message" };
  }
}