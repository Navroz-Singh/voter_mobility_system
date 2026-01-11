"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import {
  getLocalEnrollments,
  clearLocalDB,
  removeSyncedDocuments,
} from "@/lib/pouchdb";
import { submitEventBatch } from "@/actions/officer";

export default function LocalBuffer() {
  const pathname = usePathname();
  const { isGoodConnection, isPoorConnection, latency } = useNetworkStatus();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState("");

  // Fetch local enrollments on mount and when connection changes
  useEffect(() => {
    fetchLocalData();
  }, []);

  const fetchLocalData = async () => {
    setLoading(true);
    try {
      const data = await getLocalEnrollments();
      setEnrollments(data || []);
    } catch (error) {
      console.error("Failed to fetch local data:", error);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    if (!isGoodConnection) {
      alert(
        isPoorConnection
          ? `Connection too slow (${latency}ms). Please wait for better connectivity.`
          : "No network connection. Cannot sync records."
      );
      return;
    }

    if (enrollments.length === 0) {
      setStatus("No records to sync");
      return;
    }

    setSyncing(true);
    setStatus(`Syncing ${enrollments.length} records...`);

    try {
      const result = await submitEventBatch(enrollments);

      if (result.success) {
        await clearLocalDB();
        setEnrollments([]);
        setStatus(`✅ Successfully synced ${result.synced} records`);
      } else {
        setStatus(
          `❌ Sync failed: ${result.failed} errors. ${result.synced} succeeded.`
        );
        // Refresh to show remaining items
        await fetchLocalData();
      }
    } catch (error) {
      console.error("Sync error:", error);
      setStatus(`❌ Sync error: ${error.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setStatus(""), 5000);
    }
  };

  const handleClearSynced = async () => {
    if (!confirm("Remove all synced records from local storage?")) return;

    try {
      const result = await removeSyncedDocuments();
      if (result.success) {
        setStatus(`Removed ${result.removed} synced records`);
        await fetchLocalData();
      }
    } catch (error) {
      console.error("Clear error:", error);
    }
  };

  const handleClearAll = async () => {
    if (
      !confirm(
        "⚠️ WARNING: This will delete ALL local records including unsynced ones. Continue?"
      )
    )
      return;

    try {
      await clearLocalDB();
      setEnrollments([]);
      setStatus("All local records cleared");
    } catch (error) {
      console.error("Clear error:", error);
    }
  };

  const navLinkStyle = (path, currentPath) =>
    `px-4 py-2 text-sm font-semibold transition-all rounded ${
      currentPath === path
        ? "bg-[#000080] text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const getStatusBadge = (record) => {
    if (record.status === "SYNCED") {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
          SYNCED
        </span>
      );
    }
    if (record.savedReason === "HIGH_LATENCY") {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded">
          PENDING (Slow Connection)
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
        PENDING
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Government Header Bar */}
      <div className="bg-[#000080] text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs">
          <div className="flex items-center gap-6">
            <span>Screen Reader Access</span>
            <span>Skip to Main Content</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:underline">English</button>
            <span>|</span>
            <button className="hover:underline">हिन्दी</button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b-4 border-[#FF9933] shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#000080] rounded-full flex items-center justify-center text-white font-bold">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-10 h-10"
                  >
                    <circle cx="12" cy="12" r="10" fill="#FF9933" />
                    <circle cx="12" cy="12" r="7" fill="#FFFFFF" />
                    <circle cx="12" cy="12" r="4" fill="#138808" />
                    <circle cx="12" cy="12" r="1" fill="#000080" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#000080]">
                    V-LINK 2.1
                  </div>
                  <div className="text-sm text-gray-600">
                    Field Officer Portal - Unit #402
                  </div>
                  <div className="text-xs text-gray-500">
                    District: New Delhi Central
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              {isGoodConnection ? (
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-600 font-semibold">
                    Connected {latency !== null && `(${latency}ms)`}
                  </span>
                </div>
              ) : isPoorConnection ? (
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                  <span className="text-amber-600 font-semibold">
                    Slow Connection {latency !== null && `(${latency}ms)`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-red-600 font-semibold">
                    Disconnected
                  </span>
                </div>
              )}
              <div className="text-xs text-gray-500">
                Local Buffer: {enrollments.length} record(s)
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <Link
                href="/officer/register"
                className={navLinkStyle("/officer/register", pathname)}
              >
                Voter Enrollment
              </Link>
              <Link
                href="/officer/update"
                className={navLinkStyle("/officer/update", pathname)}
              >
                Update Records
              </Link>
              <Link
                href="/officer/local-buffer"
                className={navLinkStyle("/officer/local-buffer", pathname)}
              >
                Local Buffer
              </Link>
              <Link
                href="/officer/queue"
                className={navLinkStyle("/officer/queue", pathname)}
              >
                Sync Queue
              </Link>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#000080]">
              Home
            </Link>
            <span>/</span>
            <Link href="/officer" className="hover:text-[#000080]">
              Officer
            </Link>
            <span>/</span>
            <span className="text-[#000080] font-semibold">Local Buffer</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#000080] mb-2 border-b-4 border-[#FF9933] inline-block pb-2">
            Local Buffer (PouchDB)
          </h1>
          <p className="text-gray-600 mt-4">
            View and manage voter enrollments stored locally during slow or
            offline conditions
          </p>
        </div>

        {/* Status Banner */}
        {status && (
          <div
            className={`mb-6 p-4 rounded border-l-4 ${
              status.includes("✅")
                ? "border-green-500 bg-green-50"
                : status.includes("❌")
                ? "border-red-500 bg-red-50"
                : "border-blue-500 bg-blue-50"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                status.includes("✅")
                  ? "text-green-800"
                  : status.includes("❌")
                  ? "text-red-800"
                  : "text-blue-800"
              }`}
            >
              {status}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={fetchLocalData}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Refresh
          </button>

          <button
            onClick={handleSyncAll}
            disabled={syncing || !isGoodConnection || enrollments.length === 0}
            className={`px-4 py-2 text-white rounded font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 ${
              isGoodConnection
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {syncing ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Syncing...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                Sync All ({enrollments.length})
              </>
            )}
          </button>

          <button
            onClick={handleClearSynced}
            className="px-4 py-2 bg-amber-600 text-white rounded font-semibold hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
            </svg>
            Clear Synced
          </button>

          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            Clear All
          </button>
        </div>

        {/* Connection Warning */}
        {!isGoodConnection && (
          <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-600 shrink-0 mt-0.5"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  {isPoorConnection
                    ? `Slow Connection Detected (${latency}ms)`
                    : "No Network Connection"}
                </p>
                <p className="text-xs text-amber-800 mt-1">
                  Sync is disabled until connection improves. New enrollments
                  will continue to be stored locally.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#000080] to-blue-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
                <div>
                  <h2 className="text-lg font-bold">
                    Local IndexedDB Storage
                  </h2>
                  <p className="text-xs text-white/90">
                    PouchDB Buffer | {enrollments.length} record(s)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <svg
                className="animate-spin h-8 w-8 mx-auto text-[#000080]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="mt-4 text-gray-600">Loading local data...</p>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-gray-400 mb-4"
              >
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <p className="text-gray-600 font-semibold">
                No Local Records Found
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Records will appear here when saved during slow/offline
                conditions
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      EPIC
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Constituency
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Saved At
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrollments.map((record, index) => (
                    <tr
                      key={record._id || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {record.epic || record.epic_number || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {record.firstName} {record.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.constituency || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.timestamp
                          ? new Date(record.timestamp).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {record.savedReason === "HIGH_LATENCY" ? (
                          <span className="text-amber-600">
                            Slow ({record.savedLatency}ms)
                          </span>
                        ) : (
                          <span className="text-gray-600">Offline</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(record)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600 shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                About Local Buffer
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">
                Records are automatically saved to local IndexedDB storage when
                network latency exceeds 300ms or when completely offline. When
                connection quality improves (consistently below 300ms), the
                SyncManager automatically uploads pending records. You can also
                manually sync using the buttons above.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#000080] text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs mb-2">
            © 2026 Election Commission of India. All Rights Reserved.
          </p>
          <p className="text-xs text-white/70">
            Content Owned, Updated and Maintained by Election Commission of
            India
          </p>
        </div>
      </footer>
    </div>
  );
}
