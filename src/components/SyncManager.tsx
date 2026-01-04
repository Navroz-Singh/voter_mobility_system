"use client";

import { useEffect, useState } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getLocalEnrollments, markAsSynced } from "@/lib/pouchdb";
import { submitEventBatch } from "@/actions/sync";

export function SyncManager() {
  const isOnline = useNetworkStatus();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>("");

  const performSync = async () => {
    if (syncing || !isOnline) return;

    try {
      setSyncing(true);
      setSyncStatus("Checking for pending items...");

      // Get all pending enrollments from PouchDB
      const pendingItems = await getLocalEnrollments();

      if (pendingItems.length === 0) {
        setSyncStatus("No pending items to sync");
        setLastSync(new Date());
        return;
      }

      setSyncStatus(`Syncing ${pendingItems.length} item(s)...`);

      // Submit batch to server
      const result = await submitEventBatch(pendingItems);

      if (result.success) {
        // Mark all items as synced
        const syncPromises = pendingItems.map((item) =>
          markAsSynced(item._id)
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
    }
  };

  useEffect(() => {
    if (!isOnline) {
      setSyncStatus("Offline - waiting for connection...");
      return;
    }

    // Perform initial sync when coming online
    performSync();

    // Set up periodic sync (every 30 seconds when online)
    const interval = setInterval(() => {
      if (isOnline && !syncing) {
        performSync();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isOnline]);

  // Listen for online event to trigger immediate sync
  useEffect(() => {
    const handleOnline = () => {
      if (!syncing) {
        performSync();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncing]);

  // This component is invisible but manages sync in background
  return null;
}