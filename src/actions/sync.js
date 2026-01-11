"use server";
import { prisma } from "@/lib/db";
import { sendToRelocationQueue } from "@/lib/rabbitmq";
import { revalidatePath } from "next/cache";

/**
 * Submits a batch of events from PouchDB to the queue
 * @param {Array} events - Array of PouchDB documents with voter data
 * @returns {Promise<{success: boolean, synced: number, failed: number, errors?: Array}>}
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
      // Validate event structure
      if (!event.epic && !event.epic_number) {
        errors.push({
          id: event._id,
          error: "Missing EPIC number",
        });
        failed++;
        continue;
      }

      // Normalize data structure
      const epic = (event.epic || event.epic_number || "").toUpperCase();
      const aadhaar = event.aadhaar || event.aadhaar_uid || "";

      if (!epic) {
        errors.push({
          id: event._id,
          error: "EPIC number is required",
        });
        failed++;
        continue;
      }

      // Check if voter exists to get version for CAS
      let expectedVersion = undefined;
      let existingVoterId = null;
      let isNewEnrollment = false;

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
        // If voter doesn't exist, expectedVersion stays undefined (new registration)
        console.log("New voter registration:", epic);
      }

      // For new enrollments, create user directly in DB for immediate availability
      if (!existingVoterId) {
        try {
          const newVoter = await prisma.user.create({
            data: {
              epic_number: epic,
              firstName: event.firstName || "",
              lastName: event.lastName || "",
              aadhaar_uid: aadhaar,
              constituency: event.constituency || "",
              password_hash: "PENDING_CLAIM",
              version: 1,
              status: "ACTIVE",
              role: "VOTER",
            },
          });
          existingVoterId = newVoter.id;
          expectedVersion = 1;
          isNewEnrollment = true;
          console.log(`✅ User created directly in DB from PouchDB sync: ${epic}`);
        } catch (createError) {
          // If creation fails (e.g., duplicate), log and continue to queue
          console.warn(`User creation failed for ${epic}:`, createError.message);
        }
      }

      // Prepare event packet
      const eventPacket = {
        type: isNewEnrollment ? "OFFLINE_ENROLLMENT_COMMIT" : "IDENTITY_MIGRATION_COMMIT",
        version: 2.1,
        requestId: null,
        voterId: existingVoterId,
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
          source: "POUCHDB_SYNC",
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
          error: brokerResponse.error || "Queue error",
        });
        failed++;
      }
    } catch (error) {
      console.error("Error processing event:", error);
      errors.push({
        id: event._id,
        error: error.message || "Processing error",
      });
      failed++;
    }
  }

  revalidatePath("/officer/queue");
  
  return {
    success: failed === 0,
    synced,
    failed,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// Keep the old function for backward compatibility
export async function commitVoterUpdate(voterId, updateData) {
  try {
    let pendingReqId = null;
    let expectedVersion = undefined;

    if (voterId) {
      const currentVoter = await prisma.user.findUnique({
        where: { id: voterId },
        select: { version: true, epic_number: true, aadhaar_uid: true },
      });

      if (currentVoter) {
        expectedVersion = currentVoter.version;
        updateData.epic = updateData.epic || currentVoter.epic_number;
        updateData.aadhaar = updateData.aadhaar || currentVoter.aadhaar_uid;
      }

      const pendingReq = await prisma.relocationRequest.findFirst({
        where: { voterId, status: "PENDING" },
      });

      if (pendingReq) pendingReqId = pendingReq.id;
    }

    const eventPacket = {
      type: voterId ? "IDENTITY_MIGRATION_COMMIT" : "OFFLINE_ENROLLMENT_COMMIT",
      version: 2.1,
      requestId: pendingReqId,
      voterId: voterId,
      expected_version: expectedVersion, // ✅ Include for CAS
      payload: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        epic: updateData.epic,
        aadhaar: updateData.aadhaar,
        constituency: updateData.constituency,
      },
      metadata: {
        fieldUnit: "402",
        timestamp: new Date().toISOString(),
      },
    };

    const brokerResponse = await sendToRelocationQueue(eventPacket);
    if (!brokerResponse.success) {
      return { error: "Sync Error: RabbitMQ Broker unreachable." };
    }

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