"use server";
import { spawn } from "child_process";
import { revalidatePath } from "next/cache";

let workerProcess = null;

export async function startLedgerWorkerAction() {
  console.log("🚀 [System] Request received to start Ledger Worker...");

  // 1. Force Kill existing worker if running (Hard Reset)
  if (workerProcess) {
    console.log("🔄 [System] Stopping active worker to restart...");
    workerProcess.kill();
    workerProcess = null;
    // Brief pause to ensure the port/file handles release
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  try {
    // 2. Spawn new worker with "inherit" to pipe logs to VS Code Terminal
    workerProcess = spawn("node", ["src/workers/ledgerWorker.js"], {
      stdio: "inherit",
    });

    workerProcess.on("error", (err) => {
      console.error("❌ [Worker Error]:", err);
      workerProcess = null;
    });

    workerProcess.on("close", (code) => {
      // Don't log if we killed it intentionally (null check)
      if (workerProcess) {
        console.log(`[System] Worker stopped with code ${code}`);
        workerProcess = null;
      }
    });

    // 3. Wait a moment for startup logs to print
    await new Promise((resolve) => setTimeout(resolve, 1000));

    revalidatePath("/officer/queue");
    return { success: true };
  } catch (error) {
    console.error("Failed to spawn worker:", error);
    return { success: false, error: "Worker failed to start" };
  }
}
