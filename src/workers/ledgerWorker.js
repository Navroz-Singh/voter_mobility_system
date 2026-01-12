

import "dotenv/config";
import amqp from "amqplib";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { encryptPayload } from "../lib/encryption.js";

const prisma = new PrismaClient();
const RABBITMQ_URL = process.env.RABBITMQ_URL;

// using v7 to match currently working queue
const QUEUE_NAME = "relocation_ledger_queue_v7";
const DLQ_NAME = "relocation_ledger_queue_dlq";

const DEFAULT_SIG = "SYSTEM_SIGNED"; 

async function startWorker() {
  if (!RABBITMQ_URL) {
    console.error("❌ Error: RABBITMQ_URL is missing from .env");
    process.exit(1);
  }

  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Ensure Queue settings match Sender EXACTLY
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": DLQ_NAME,
      },
    });

    await channel.assertQueue(DLQ_NAME, { durable: true });
    channel.prefetch(10);

    console.log(
      ` [*] Worker Connected to ${QUEUE_NAME} (High-Latency Mode Active)`
    );

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      let event;
      try {
        event = JSON.parse(msg.content.toString());
      } catch (e) {
        console.error("Malformed JSON, sending to DLQ");
        channel.nack(msg, false, false);
        return;
      }

      console.log(`📥 Processing: ${event.payload?.epic}`);

      try {
        // --- THE FIX IS HERE ---
        // We add the configuration object as the second argument
        await prisma.$transaction(
          async (tx) => {
            // 1. Snapshot
            const existingUser = await tx.user.findUnique({
              where: { epic_number: event.payload.epic.toUpperCase() },
              include: {
                auditLogs: { orderBy: { timestamp: "desc" }, take: 1 },
              },
            });

            // 2. Logic / Version Checks
            if (existingUser && event.expected_version !== undefined) {
              if (existingUser.version !== event.expected_version) {
                throw new Error("VERSION_MISMATCH");
              }
            }

            // 3. Crypto (Can be slow)
            const { encrypted, iv } = await encryptPayload(
              event.payload.epic,
              event.payload
            );

            const finalSignature = event.signature || DEFAULT_SIG;
            const prevHash = existingUser?.auditLogs[0]?.curr_hash || "0";

            const currHash = crypto
              .createHash("sha256")
              .update(prevHash + encrypted + iv + finalSignature)
              .digest("hex");

            // 4. Update User (The part that was failing)
            const updatedUser = await tx.user.upsert({
              where: { epic_number: event.payload.epic.toUpperCase() },
              update: {
                firstName: event.payload.firstName,
                lastName: event.payload.lastName,
                constituency: event.payload.constituency,
                aadhaar_uid: event.payload.aadhaar,
                version: { increment: 1 },
                status: "ACTIVE",
              },
              create: {
                epic_number: event.payload.epic.toUpperCase(),
                firstName: event.payload.firstName,
                lastName: event.payload.lastName,
                aadhaar_uid: event.payload.aadhaar,
                constituency: event.payload.constituency,
                version: 1,
                status: "ACTIVE",
                password_hash: "PENDING_CLAIM",
              },
            });

            // 5. Audit Log
            await tx.auditLog.create({
              data: {
                userId: updatedUser.id,
                eventType: event.type,
                encrypted_payload: encrypted,
                iv: iv,
                signature: finalSignature,
                prev_hash: prevHash,
                curr_hash: currHash,
              },
            });
            // 6.
            if (event.requestId) {
              await tx.relocationRequest.update({
                where: { id: event.requestId },
                data: { status: "APPROVED" },
              });
              console.log(`📝 Request ${event.requestId} marked APPROVED`);
            }
          },
          {
            // --- EXTENDED TIMEOUTS ---
            maxWait: 5000, // Wait 5s for connection
            timeout: 20000, // Allow 20s for logic execution
          }
        );

        console.log(`✅ Success: ${event.payload?.epic}`);
        channel.ack(msg);
      } catch (processError) {
        console.error(`❌ Failed: ${processError.message}`);

        // Error Handling / DLQ Logic
        try {
          await prisma.conflictLog.create({
            data: {
              epic_number: event.payload?.epic || "UNKNOWN",
              original_payload: event,
              conflict_reason: "PROCESSING_ERROR",
              status: "PENDING",
              error_message: processError.message,
            },
          });
          channel.ack(msg);
        } catch (dbError) {
          console.error("🔥 DB Write Failed. Sending to DLQ.");
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (err) {
    console.error("Worker Error:", err);
  }
}

startWorker();
