"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { encryptPayload } from "@/lib/encryption";

export async function requestRelocationAction(formData) {
  const targetZone = formData.get("targetZone");
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("vlink_session")?.value;

  if (!sessionId || !targetZone)
    return { error: "Session or Target Zone missing." };

  try {
    // --- FIX: Added options object as the second argument ---
    return await prisma.$transaction(
      async (tx) => {
        // 1. Get current user snapshot
        const user = await tx.user.findUnique({ where: { id: sessionId } });

        if (!user) {
          return { error: "User not found" };
        }

        // 2. Create the PENDING Request (Buffer Layer)
        await tx.relocationRequest.create({
          data: {
            voterId: user.id,
            fromZone: user.constituency || "UNASSIGNED",
            toZone: targetZone,
            status: "PENDING",
          },
        });

        // 3. Hash-Link to the Immutable Ledger
        const lastLog = await tx.auditLog.findFirst({
          where: { userId: user.id },
          orderBy: { timestamp: "desc" },
        });

        const prevHash = lastLog?.curr_hash || "0";
        const payloadData = { from: user.constituency, to: targetZone };

        if (!user.epic_number) {
          throw new Error("User EPIC number is required for encryption");
        }

        const { encrypted, iv } = await encryptPayload(
          user.epic_number,
          payloadData
        );

        const currHash = crypto
          .createHash("sha256")
          .update(prevHash + encrypted + iv + "VOTER_AUTH_SIG")
          .digest("hex");

        await tx.auditLog.create({
          data: {
            userId: user.id,
            eventType: "RELOCATION_INITIATED",
            encrypted_payload: encrypted,
            iv: iv,
            signature: "VOTER_AUTH_SIG",
            prev_hash: prevHash,
            curr_hash: currHash,
          },
        });

        revalidatePath("/voter/relocate");
        return { success: true };
      },
      {
        // --- TIMEOUT SETTINGS ---
        maxWait: 5000, // Max time to wait for a database connection
        timeout: 20000, // Max time the transaction can run (20s) before Prisma cancels it
      }
    );
  } catch (err) {
    console.error("Transaction Failed:", err);
    return { error: "Database transaction failed (Latency/Timeout)." };
  }
}
