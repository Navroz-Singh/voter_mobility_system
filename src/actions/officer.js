"use server";
import { prisma } from "@/lib/db";
import { sendToRelocationQueue } from "@/lib/rabbitmq";
import { revalidatePath } from "next/cache";

// --- 1. EXISTING: Fetch Logic ---
export async function fetchVoterByEPIC(epicNumber) {
  if (!epicNumber || typeof epicNumber !== "string") {
    return { error: "Invalid EPIC number" };
  }
  const normalized = epicNumber.toUpperCase().trim();
  try {
    const voter = await prisma.user.findUnique({
      where: { epic_number: normalized },
      include: {
        relocationRequests: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    if (!voter) return { error: "No voter found with this EPIC ID." };
    return { success: true, voter };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { error: "Database connection failed." };
  }
}

// --- 2. NEW: Batch Sync Logic (For Sync & Logout) ---
/**
 * Submits a batch of events from PouchDB to the queue
 * @param {Array} events - Array of PouchDB documents with voter data
 */
export async function submitEventBatch(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return { success: true, synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;
  const errors = [];

  for (const event of events) {
    try {
      // Normalize data structure
      const epic = (event.epic || event.epic_number || "").toUpperCase().trim();
      const aadhaar = (event.aadhaar || event.aadhaar_uid || "").trim();

      // Basic Validation
      if (!epic) {
        errors.push({ id: event._id, error: "Missing EPIC number" });
        failed++;
        continue;
      }

      // Check if voter exists to get version for CAS (Concurrency Control)
      let expectedVersion = undefined;
      let existingVoterId = null;

      try {
        const existingVoter = await prisma.user.findUnique({
          where: { epic_number: epic },
          select: { id: true, version: true },
        });
        if (existingVoter) {
          expectedVersion = existingVoter.version;
          existingVoterId = existingVoter.id;
        }
      } catch (dbError) {
        // If DB fails, we log but continue processing other records
        console.warn(
          `Version check failed for ${epic}, treating as new/blind write.`
        );
      }

      // Prepare event packet
      const eventPacket = {
        type:
          expectedVersion !== undefined
            ? "IDENTITY_MIGRATION_COMMIT"
            : "OFFLINE_ENROLLMENT_COMMIT",
        version: 2.1,
        requestId: null, // Batch events usually don't have a pre-existing RelocationRequest ID
        voterId: existingVoterId, // null for new enrollments
        expected_version: expectedVersion,
        payload: {
          firstName: event.firstName || "",
          lastName: event.lastName || "",
          epic: epic,
          aadhaar: aadhaar,
          constituency: event.constituency || "",
        },
        metadata: {
          fieldUnit: "402",
          timestamp: event.timestamp || new Date().toISOString(),
          source: "POUCHDB_BATCH_SYNC",
          original_id: event._id,
        },
      };

      // Send to queue
      const brokerResponse = await sendToRelocationQueue(eventPacket);

      if (brokerResponse.success) {
        synced++;
      } else {
        errors.push({
          id: event._id,
          error: brokerResponse.error || "Queue rejected packet",
        });
        failed++;
      }
    } catch (error) {
      console.error("Batch Item Error:", error);
      errors.push({
        id: event._id,
        error: error.message || "Processing error",
      });
      failed++;
    }
  }

  // Refresh Queue UI if officer is looking at it
  revalidatePath("/officer/queue");

  return {
    success: failed === 0,
    synced,
    failed,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// --- 3. EXISTING: Single Commit Logic ---
export async function commitVoterUpdate(voterId, updateData) {
  try {
    let pendingReqId = null;
    let expectedVersion = undefined;

    // 1. Branch Logic: If voterId exists, this is a Relocation/Update
    if (voterId) {
      // Fetch current user to get version for CAS
      const currentVoter = await prisma.user.findUnique({
        where: { id: voterId },
        select: {
          id: true,
          version: true,
          epic_number: true,
          aadhaar_uid: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!currentVoter) {
        return { error: "Voter not found" };
      }

      // Get current version for optimistic concurrency control
      expectedVersion = currentVoter.version;

      const pendingReq = await prisma.relocationRequest.findFirst({
        where: { voterId, status: "PENDING" },
      });

      if (pendingReq) pendingReqId = pendingReq.id;

      // Fill in missing identifiers from current voter
      if (!updateData.epic || !updateData.aadhaar) {
        updateData.epic = updateData.epic || currentVoter.epic_number;
        updateData.aadhaar = updateData.aadhaar || currentVoter.aadhaar_uid;
        updateData.firstName = updateData.firstName || currentVoter.firstName;
        updateData.lastName = updateData.lastName || currentVoter.lastName;
      }
    }

    // 2. Prepare the Event Packet
    const eventPacket = {
      type: voterId ? "IDENTITY_MIGRATION_COMMIT" : "OFFLINE_ENROLLMENT_COMMIT",
      version: 2.1,
      requestId: pendingReqId,
      voterId: voterId,
      expected_version: expectedVersion,
      payload: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,

        // Now this will always be populated, even for updates
        epic: updateData.epic,
        aadhaar: updateData.aadhaar,

        constituency: updateData.constituency,
      },
      metadata: {
        fieldUnit: "402",
        timestamp: new Date().toISOString(),
      },
    };

    // 3. Dispatch to RabbitMQ
    console.log(
      "📦 [3] Dispatching Complete Packet:",
      JSON.stringify(eventPacket, null, 2)
    );

    const brokerResponse = await sendToRelocationQueue(eventPacket);
    if (!brokerResponse.success) {
      return { error: "Sync Error: RabbitMQ Broker unreachable." };
    }

    // 4. Update status ONLY if it was a relocation
    if (voterId && pendingReqId) {
      await prisma.relocationRequest.update({
        where: { id: pendingReqId },
        data: { status: "PROCESSING" },
      });
    }

    revalidatePath("/officer/update");
    revalidatePath("/officer/queue");
    return { success: true };
  } catch (error) {
    console.error("PIPELINE ERROR:", error);
    return { error: "Critical failure in commit pipeline." };
  }
}
