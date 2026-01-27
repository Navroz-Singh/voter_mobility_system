export const runtime = "nodejs";


import amqp from "amqplib";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { encryptPayload } from "@/lib/encryption";

const prisma = new PrismaClient();

const QUEUE_NAME = "relocation_ledger_queue_v7";
const DLQ_NAME = "relocation_ledger_queue_dlq";
const DEFAULT_SIG = "SYSTEM_SIGNED";

export async function GET() {
  let connection;
  let channel;
  let processed = 0;
  const MAX_BATCH = 5;

  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": DLQ_NAME,
      },
    });

    await channel.assertQueue(DLQ_NAME, { durable: true });

    while (processed < MAX_BATCH) {
      const msg = await channel.get(QUEUE_NAME);
      if (!msg) break;

      let event;
      try {
        event = JSON.parse(msg.content.toString());
      } catch {
        channel.nack(msg, false, false);
        continue;
      }

      try {
        const result = await prisma.$transaction(
          async (tx) => {
            const existingUser = await tx.user.findUnique({
              where: { epic_number: event.payload.epic.toUpperCase() },
              include: {
                auditLogs: { orderBy: { timestamp: "desc" }, take: 1 },
              },
            });

            // Version conflict
            if (
              existingUser &&
              event.expected_version !== undefined &&
              existingUser.version !== event.expected_version
            ) {
              await tx.conflictLog.create({
                data: {
                  epic_number: event.payload.epic,
                  original_payload: event,
                  conflict_reason: "VERSION_MISMATCH",
                  status: "PENDING",
                  expected_version: event.expected_version,
                  actual_version: existingUser.version,
                },
              });
              throw new Error("VERSION_MISMATCH_HANDLED");
            }

            // Crypto
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

            // ✅ Idempotency check (CORRECT PLACE)
            const alreadyProcessed = await tx.auditLog.findFirst({
              where: { curr_hash: currHash },
            });

            if (alreadyProcessed) {
                return { alreadyProcessed: true };
            }

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

            await tx.auditLog.create({
              data: {
                userId: updatedUser.id,
                eventType: event.type,
                encrypted_payload: encrypted,
                iv,
                signature: finalSignature,
                prev_hash: prevHash,
                curr_hash: currHash,
              },
            });

            if (event.requestId) {
              await tx.relocationRequest.update({
                where: { id: event.requestId },
                data: { status: "APPROVED" },
              });
            }
          },
          { timeout: 20000 }
        );

        if (result?.alreadyProcessed) {
            channel.ack(msg);
            continue;
        }
        channel.ack(msg);
        processed++;
      } catch (err) {
        if (err.message === "VERSION_MISMATCH_HANDLED") {
          channel.ack(msg);
        } else {
          channel.nack(msg, false, false);
        }
      }
    }

    return Response.json({ success: true, processed });
  } catch (err) {
    console.error(err);
    return new Response("Worker failed", { status: 500 });
  } finally {
    if (channel) await channel.close();
    if (connection) await connection.close();
    await prisma.$disconnect();
  }
}
