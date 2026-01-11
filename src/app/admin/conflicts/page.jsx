"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import {
  getConflictsAction,
  acceptRemoteVersionAction,
  keepLocalVersionAction,
} from "@/actions/conflicts";
import { useState, useEffect } from "react";

export default function AdminConflict() {
  const pathname = usePathname();
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);

  useEffect(() => {
    fetchConflicts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchConflicts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchConflicts = async () => {
    try {
      setLoading(true);
      const result = await getConflictsAction();
      if (result.success) {
        setConflicts(result.conflicts || []);
      }
    } catch (error) {
      console.error("Error fetching conflicts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRemote = async (conflictId) => {
    setResolving(conflictId);
    try {
      const result = await acceptRemoteVersionAction(conflictId);
      if (result.success) {
        await fetchConflicts(); // Refresh list
      } else {
        alert(result.error || "Failed to resolve conflict");
      }
    } catch (error) {
      console.error("Error accepting remote:", error);
      alert("Failed to resolve conflict");
    } finally {
      setResolving(null);
    }
  };

  const handleKeepLocal = async (conflictId, eventData) => {
    setResolving(conflictId);
    try {
      const result = await keepLocalVersionAction(conflictId, eventData);
      if (result.success) {
        await fetchConflicts(); // Refresh list
      } else {
        alert(result.error || "Failed to resolve conflict");
      }
    } catch (error) {
      console.error("Error keeping local:", error);
      alert("Failed to resolve conflict");
    } finally {
      setResolving(null);
    }
  };

  // Global Admin Navigation Styling
  const navLinkStyle = (path) =>
    `px-4 py-2 text-sm font-semibold transition-all rounded ${
      pathname === path
        ? "bg-[#000080] text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
                    Administrator Portal
                  </div>
                  <div className="text-xs text-gray-500">
                    Election Commission of India
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm mb-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-600 font-semibold">
                  System Active
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Auto-refresh: 30s interval
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
              <Link href="/admin/audit" className={navLinkStyle("/admin/audit")}>
                Audit Ledger
              </Link>
              <Link
                href="/admin/conflicts"
                className={navLinkStyle("/admin/conflicts")}
              >
                Conflicts
              </Link>
              <Link
                href="/admin/privacy"
                className={navLinkStyle("/admin/privacy")}
              >
                Privacy
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
            <Link href="/admin" className="hover:text-[#000080]">
              Admin
            </Link>
            <span>/</span>
            <span className="text-[#000080] font-semibold">Conflicts</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#000080] mb-2 border-b-4 border-[#FF9933] inline-block pb-2">
            Conflict Resolution
          </h1>
          <p className="text-gray-600 mt-4">
            Manage and resolve data synchronization conflicts detected during
            transaction processing
          </p>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Pending Conflicts</p>
                <p className="text-2xl font-bold text-[#000080]">
                  {conflicts.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
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
                  className="text-red-600"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Resolution Method</p>
                <p className="text-sm font-semibold text-gray-900">
                  Optimistic Concurrency
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
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
                  className="text-blue-600"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Auto Refresh</p>
                <p className="text-sm font-semibold text-gray-900">
                  Every 30 seconds
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
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
                  className="text-green-600"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Conflicts Table */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#000080]">
                Conflict Queue
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Version mismatches requiring manual resolution
              </p>
            </div>
            <button
              onClick={fetchConflicts}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold border-2 border-[#000080] text-[#000080] rounded hover:bg-[#000080] hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
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
                  Loading...
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
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#000080] mb-4"></div>
              <div className="text-gray-600 text-sm font-semibold">
                Loading Conflicts...
              </div>
            </div>
          ) : conflicts.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-green-500 mb-4"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div className="text-gray-900 text-lg font-bold mb-2">
                No Conflicts Found
              </div>
              <div className="text-gray-500 text-sm">
                All transactions are synchronized successfully
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase">
                        Conflict ID
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase">
                        Voter Details
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase text-center">
                        Issue Type
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase">
                        Timestamp
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {conflicts.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 text-xs font-mono text-red-600 font-semibold">
                          {c.id.substring(0, 12)}...
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {c.voter || "UNKNOWN"}
                          </div>
                          <div className="text-xs text-gray-600 font-mono mt-1">
                            EPIC: {c.epic}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Version: {c.version}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-1"
                              >
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                              </svg>
                              {c.issue || "VERSION_MISMATCH"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-gray-600">
                          {formatTimestamp(c.timestamp)}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                handleKeepLocal(c.id, c.fullEvent)
                              }
                              disabled={resolving === c.id}
                              className="px-3 py-1.5 text-xs font-semibold border-2 border-[#000080] text-[#000080] rounded hover:bg-[#000080] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {resolving === c.id
                                ? "Processing..."
                                : "Keep Local"}
                            </button>
                            <button
                              onClick={() => handleAcceptRemote(c.id)}
                              disabled={resolving === c.id}
                              className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {resolving === c.id
                                ? "Processing..."
                                : "Accept Remote"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <p className="text-xs text-gray-600">
                  Displaying{" "}
                  <span className="font-bold text-[#000080]">
                    {conflicts.length}
                  </span>{" "}
                  pending conflict(s)
                </p>
                <div className="text-xs text-gray-500">
                  Resolution: Manual approval required
                </div>
              </div>
            </>
          )}
        </div>

        {/* Help Section */}
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
              className="text-blue-600 flex-shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Conflict Resolution Guide
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Keep Local:</strong> Re-queue the transaction with
                updated version number for retry. Use when local data is more
                accurate.
                <br />
                <strong>Accept Remote:</strong> Discard the conflicting update
                and accept the current database state. Use when remote data is
                correct.
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
