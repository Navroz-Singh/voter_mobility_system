"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getLocalEnrollments, markAsSynced } from "@/lib/pouchdb";
import { submitEventBatch } from "@/actions/sync";

// Minimum consecutive good checks before syncing
const MIN_CONSECUTIVE_GOOD_CHECKS = 2;

export function SyncManager() {
  const { isGoodConnection, isPoorConnection, latency } = useNetworkStatus();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>("");

  // Track consecutive good connection checks
  const consecutiveGoodChecksRef = useRef(0);
  const syncInProgressRef = useRef(false);

  // Update consecutive good checks counter
  useEffect(() => {
    if (isGoodConnection) {
      consecutiveGoodChecksRef.current += 1;
    } else {
      consecutiveGoodChecksRef.current = 0;
    }
  }, [isGoodConnection, latency]); // latency changes trigger re-evaluation

  const performSync = useCallback(async () => {
    // Prevent duplicate sync calls
    if (syncInProgressRef.current || syncing) return;

    // Only sync if connection has been consistently good
    if (!isGoodConnection || consecutiveGoodChecksRef.current < MIN_CONSECUTIVE_GOOD_CHECKS) {
      setSyncStatus(
        isGoodConnection
          ? `Waiting for stable connection (${consecutiveGoodChecksRef.current}/${MIN_CONSECUTIVE_GOOD_CHECKS} checks)...`
          : isPoorConnection
          ? `Connection too slow (${latency}ms) - waiting...`
          : "Offline - waiting for connection..."
      );
      return;
    }

    try {
      syncInProgressRef.current = true;
      setSyncing(true);
      setSyncStatus("Checking for pending items...");

      // Get all pending enrollments from PouchDB
      const pendingItems = await getLocalEnrollments();

      if (pendingItems.length === 0) {
        setSyncStatus("No pending items to sync");
        setLastSync(new Date());
        return;
      }

      setSyncStatus(`Syncing ${pendingItems.length} item(s) at ${latency}ms latency...`);

      // Submit batch to server
      const result = await submitEventBatch(pendingItems);

      if (result.success) {
        // Mark all items as synced with latency metadata
        const syncPromises = pendingItems.map((item: { _id: string }) =>
          markAsSynced(item._id, latency, "good")
        );
        await Promise.all(syncPromises);

        setSyncStatus(`✅ Synced ${pendingItems.length} item(s) successfully`);
        setLastSync(new Date());
      } else {
        setSyncStatus(`❌ Sync failed: ${result.errors || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSyncStatus(`❌ Sync error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSyncing(false);
      syncInProgressRef.current = false;
    }
  }, [isGoodConnection, isPoorConnection, latency, syncing]);

  useEffect(() => {
    // Update status when connection quality changes
    if (!isGoodConnection) {
      setSyncStatus(
        isPoorConnection
          ? `Connection slow (${latency}ms) - sync paused`
          : "Offline - waiting for connection..."
      );
      return;
    }

    // Check if we should attempt sync
    if (consecutiveGoodChecksRef.current >= MIN_CONSECUTIVE_GOOD_CHECKS && !syncing) {
      performSync();
    }

    // Set up periodic sync (every 30 seconds when connection is good)
    const interval = setInterval(() => {
      if (isGoodConnection && consecutiveGoodChecksRef.current >= MIN_CONSECUTIVE_GOOD_CHECKS && !syncing) {
        performSync();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isGoodConnection, isPoorConnection, latency, performSync, syncing]);

  // This component is invisible but manages sync in background
  return null;
}