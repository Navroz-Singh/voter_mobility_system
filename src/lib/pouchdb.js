let localDB = null;
let PouchDB = null;

const getDB = async () => {
  if (typeof window === "undefined") {
    return null;
  }

  // Dynamically import PouchDB only in browser
  if (!PouchDB) {
    PouchDB = (await import("pouchdb-browser")).default;
  }

  if (!localDB) {
    localDB = new PouchDB("vlink_local_voters");
  }
  return localDB;
};

export async function saveVoterLocally(voterData) {
  const db = await getDB();
  if (!db) return { success: false, error: "Database not available on server" };

  // Validate required fields
  if (!voterData.epic && !voterData.epic_number) {
    return { success: false, error: "EPIC number is required" };
  }

  const epic = (
    voterData.epic ||
    voterData.epic_number ||
    "UNKNOWN"
  ).toUpperCase();

  const enrollmentRecord = {
    _id: `enroll_${epic}_${new Date().getTime()}`,
    epic: epic,
    epic_number: epic, // Support both field names
    firstName: voterData.firstName || "",
    lastName: voterData.lastName || "",
    aadhaar: voterData.aadhaar || voterData.aadhaar_uid || "",
    aadhaar_uid: voterData.aadhaar || voterData.aadhaar_uid || "",
    constituency: voterData.constituency || "",
    status: "OFFLINE_PENDING",
    version: 2.1,
    timestamp: new Date().toISOString(),
    // Network quality metadata (optional)
    savedReason: voterData.savedReason || "OFFLINE", // "OFFLINE" | "HIGH_LATENCY"
    savedLatency: voterData.savedLatency || null, // Latency in ms when saved
    lastSyncLatency: null, // Will be set when synced
    lastSyncQuality: null, // "good" | "poor" - will be set when synced
  };

  try {
    const response = await db.put(enrollmentRecord);
    return { success: true, id: response.id };
  } catch (err) {
    console.error("Local Buffer Write Error:", err);
    return { success: false, error: err.message };
  }
}

export async function getLocalEnrollments() {
  const db = await getDB();
  if (!db) return [];

  try {
    const result = await db.allDocs({ include_docs: true });
    return result.rows
      .map((row) => row.doc)
      .filter((doc) => doc.status === "OFFLINE_PENDING");
  } catch (err) {
    console.error("Fetch Local Docs Error:", err);
    return [];
  }
}

/**
 * Marks a document as synced in PouchDB
 * @param {string} docId - Document ID to mark as synced
 * @param {number} [syncLatency] - Optional latency at time of sync
 * @param {string} [syncQuality] - Optional quality indicator ("good" | "poor")
 */
export async function markAsSynced(docId, syncLatency = null, syncQuality = null) {
  const db = await getDB();
  if (!db) return { success: false, error: "Database not available" };

  try {
    const doc = await db.get(docId);
    doc.status = "SYNCED";
    doc.synced_at = new Date().toISOString();
    // Record sync network quality metadata
    if (syncLatency !== null) doc.lastSyncLatency = syncLatency;
    if (syncQuality !== null) doc.lastSyncQuality = syncQuality;
    await db.put(doc);
    return { success: true };
  } catch (err) {
    console.error("Mark as synced error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Removes synced documents from PouchDB (cleanup)
 */
export async function removeSyncedDocuments() {
  const db = await getDB();
  if (!db) return { success: false, error: "Database not available" };

  try {
    const result = await db.allDocs({ include_docs: true });
    const syncedDocs = result.rows
      .map((row) => row.doc)
      .filter((doc) => doc.status === "SYNCED");

    if (syncedDocs.length === 0) {
      return { success: true, removed: 0 };
    }

    await Promise.all(syncedDocs.map((doc) => db.remove(doc._id, doc._rev)));

    return { success: true, removed: syncedDocs.length };
  } catch (err) {
    console.error("Remove synced documents error:", err);
    return { success: false, error: err.message };
  }
}


export async function clearLocalDB() {
  const db = await getDB();
  if (!db) return;

  try {
    const docs = await db.allDocs();
    await Promise.all(docs.rows.map((row) => db.remove(row.id, row.value.rev)));
    return { success: true };
  } catch (err) {
    console.error("Clear DB Error:", err);
    return { success: false, error: err.message };
  }
}

export async function getOfflineData() {
  try {
    const result = await db.allDocs({ include_docs: true });
    // Filter out internal design docs if any, return just the data
    return result.rows.map((row) => row.doc);
  } catch (error) {
    console.error("Failed to fetch local buffer:", error);
    return [];
  }
}

export async function clearOfflineData() {
  try {
    // Destroying recreates the DB on next call, effectively wiping it
    await db.destroy();
    db = new PouchDB("voter_offline_buffer");
    return { success: true };
  } catch (error) {
    console.error("Failed to clear local buffer:", error);
    return { success: false };
  }
}
