"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { verifyLedgerChainAction } from "@/actions/audit";
import { useState, useEffect } from "react";

export default function AdminLedger() {
  const pathname = usePathname();
  const [ledgerEvents, setLedgerEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [chainIntegrity, setChainIntegrity] = useState("Unknown");

  // Fetch real ledger data
  useEffect(() => {
    fetchLedgerData();
  }, []);

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/ledger");
      if (response.ok) {
        const data = await response.json();
        setLedgerEvents(data.entries || []);
        setChainIntegrity(data.integrity || "Unknown");
      } else {
        console.error("Failed to fetch ledger data");
        setLedgerEvents([]);
      }
    } catch (error) {
      console.error("Error fetching ledger:", error);
      setLedgerEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    setVerifying(true);
    setVerificationResult(null);

    try {
      const result = await verifyLedgerChainAction();

      if (result.success && result.result) {
        setVerificationResult(result.result);
        setChainIntegrity(
          result.result.valid
            ? `${result.result.verifiedCount}/${result.result.totalEntries} Verified`
            : `${result.result.errors.length} Errors Found`
        );

        // Refresh ledger data after verification
        await fetchLedgerData();
      } else {
        setVerificationResult({
          valid: false,
          message: result.error || "Verification failed",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult({
        valid: false,
        message: "Verification failed: " + error.message,
      });
    } finally {
      setVerifying(false);
    }
  };

  // Global Admin Navigation Styling
  const navLinkStyle = (path) =>
    `px-4 py-2 text-sm font-semibold transition-all rounded ${
      pathname === path
        ? "bg-[#000080] text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  // Format hash for display (truncate)
  const formatHash = (hash) => {
    if (!hash) return "N/A";
    if (hash.length > 16) {
      return hash.substring(0, 8) + "..." + hash.substring(hash.length - 8);
    }
    return hash;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
                Last Updated: {new Date().toLocaleDateString()}
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
            <span className="text-[#000080] font-semibold">Audit Ledger</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#000080] mb-2 border-b-4 border-[#FF9933] inline-block pb-2">
            Audit Ledger
          </h1>
          <p className="text-gray-600 mt-4">
            Immutable blockchain-inspired audit trail of all voter record changes
          </p>
        </div>

        {/* Verification Section */}
        <div className="mb-6 bg-white border-2 border-gray-200 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#000080] mb-2">
                Chain Integrity Verification
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold rounded">
                  {chainIntegrity}
                </span>
              </div>
            </div>
            <button
              onClick={handleVerifyChain}
              disabled={verifying || loading}
              className="px-6 py-2.5 text-sm font-semibold bg-[#000080] text-white rounded hover:bg-[#FF9933] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {verifying ? (
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
                  Verifying...
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
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  Verify Chain
                </>
              )}
            </button>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div
              className={`p-4 rounded border-l-4 ${
                verificationResult.valid
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 ${
                    verificationResult.valid
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {verificationResult.valid ? (
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
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : (
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
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={`text-sm font-bold mb-2 ${
                      verificationResult.valid
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {verificationResult.valid
                      ? "✓ Verification Passed"
                      : "✗ Verification Failed"}
                  </div>
                  <div
                    className={`text-xs space-y-1 ${
                      verificationResult.valid
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {verificationResult.message && (
                      <div>{verificationResult.message}</div>
                    )}
                    {verificationResult.verifiedCount !== undefined && (
                      <div>
                        Verified: {verificationResult.verifiedCount} /{" "}
                        {verificationResult.totalEntries} entries
                      </div>
                    )}
                    {verificationResult.errors &&
                      verificationResult.errors.length > 0 && (
                        <div className="mt-2">
                          <div className="font-bold mb-1">Errors:</div>
                          {verificationResult.errors
                            .slice(0, 5)
                            .map((error, idx) => (
                              <div key={idx} className="text-red-600">
                                • {error.message || error.issue}
                              </div>
                            ))}
                          {verificationResult.errors.length > 5 && (
                            <div className="text-gray-600">
                              ... and {verificationResult.errors.length - 5}{" "}
                              more errors
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ledger Table */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#FF9933]/10 to-[#138808]/10 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#000080]">
              Ledger Entries
            </h2>
            <button
              onClick={fetchLedgerData}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold border-2 border-[#000080] text-[#000080] rounded hover:bg-[#000080] hover:text-white transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#000080] mb-4"></div>
              <div className="text-gray-600 text-sm font-semibold">
                Loading Ledger Data...
              </div>
            </div>
          ) : ledgerEvents.length === 0 ? (
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
                className="mx-auto text-gray-400 mb-4"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              <div className="text-gray-600 text-sm font-semibold mb-2">
                No Ledger Entries Found
              </div>
              <div className="text-gray-500 text-xs">
                Ledger entries will appear here as events are processed
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase">
                        Block ID
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase">
                        Event Type
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase">
                        Current Hash
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase">
                        Previous Hash
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase">
                        Timestamp
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ledgerEvents.map((event) => (
                      <tr
                        key={event.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 text-sm font-mono text-[#000080]">
                          {event.id.substring(0, 12)}...
                        </td>
                        <td className="p-4 text-sm font-semibold text-gray-900">
                          {event.eventType || event.type}
                        </td>
                        <td
                          className="p-4 text-xs font-mono text-gray-600 cursor-help"
                          title={event.curr_hash || event.hash}
                        >
                          {formatHash(event.curr_hash || event.hash)}
                        </td>
                        <td
                          className="p-4 text-xs font-mono text-gray-600 cursor-help"
                          title={event.prev_hash || event.prev}
                        >
                          {formatHash(event.prev_hash || event.prev)}
                        </td>
                        <td className="p-4 text-xs text-gray-600">
                          {formatTimestamp(event.timestamp || event.time)}
                        </td>
                        <td className="p-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                            VERIFIED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <p className="text-xs text-gray-600">
                  Total Entries:{" "}
                  <span className="font-bold text-[#000080]">
                    {ledgerEvents.length}
                  </span>{" "}
                  | Chain Integrity:{" "}
                  <span className="font-bold text-[#000080]">
                    {chainIntegrity}
                  </span>
                </p>
                <div className="text-xs text-gray-500">
                  Encryption: AES-256-GCM | Hash: SHA-256
                </div>
              </div>
            </>
          )}
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
