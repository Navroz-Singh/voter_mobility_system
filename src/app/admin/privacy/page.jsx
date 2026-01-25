"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import {
  shredVoterDataAction,
  checkVoterDataStatusAction,
} from "@/actions/privacy";

export default function AdminPrivacy() {
  const pathname = usePathname();
  const [voterId, setVoterId] = useState("");
  const [shredding, setShredding] = useState(false);
  const [shredResult, setShredResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [dataStatus, setDataStatus] = useState(null);

  // Navigation Styling
  const navLinkStyle = (path) =>
    `px-4 py-2 text-sm font-semibold transition-all rounded ${
      pathname === path
        ? "bg-[#000080] text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const handleShred = async () => {
    if (!voterId.trim()) {
      alert("Please enter a Voter ID (EPIC number)");
      return;
    }

    const confirmed = confirm(
      `⚠️ WARNING: This will permanently delete the encryption key for ${voterId}.\n\n` +
        `The data will become unreadable forever. This action cannot be undone.\n\n` +
        `Continue?`
    );

    if (!confirmed) return;

    setShredding(true);
    setShredResult(null);

    try {
      const result = await shredVoterDataAction(voterId);
      setShredResult(result);

      if (result.success) {
        setVoterId(""); // Clear input
        setDataStatus(null); // Reset status
      }
    } catch (error) {
      setShredResult({ success: false, error: "Unexpected error occurred" });
    } finally {
      setShredding(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!voterId.trim()) {
      alert("Please enter a Voter ID");
      return;
    }

    setChecking(true);
    setDataStatus(null);

    try {
      const result = await checkVoterDataStatusAction(voterId);
      setDataStatus(result);
    } catch (error) {
      setDataStatus({ canDecrypt: false, error: "Check failed" });
    } finally {
      setChecking(false);
    }
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
                  className="text-blue-600"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span className="text-blue-600 font-semibold">
                  Privacy Engine Active
                </span>
              </div>
              <div className="text-xs text-gray-500">AES-256-GCM Encryption</div>
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
            <span className="text-[#000080] font-semibold">Privacy Management</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#000080] mb-2 border-b-4 border-[#FF9933] inline-block pb-2">
            Privacy Management
          </h1>
          <p className="text-gray-600 mt-4">
            Cryptographic shredding system for Right to be Forgotten (RTBF)
            compliance
          </p>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
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
              className="text-red-600 flex-shrink-0 mt-0.5"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800 mb-1">
                Critical Privacy Operations
              </p>
              <p className="text-xs text-red-700 leading-relaxed">
                This module handles irreversible cryptographic operations. All
                actions are logged in the immutable audit ledger. Exercise
                extreme caution when performing data shredding operations.
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Data Shredding Card */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
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
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold">Data Shredding Protocol</h3>
                  <p className="text-xs text-white/90">RTBF Compliance Module</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs text-yellow-800 leading-relaxed">
                  <strong>How it works:</strong> Terminating a voter identity
                  marker involves destroying the specific AES-256 encryption key
                  associated with the record. This makes the PII permanently
                  unrecoverable while preserving hash chain integrity.
                </p>
              </div>

              {/* Voter ID Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Voter EPIC Number
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                  placeholder="Enter EPIC Number (e.g., V-DEL-1234)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all text-gray-900 font-mono uppercase"
                />
              </div>

              {/* Status Check Button */}
              <button
                onClick={handleCheckStatus}
                disabled={checking || !voterId.trim()}
                className="w-full py-3 px-4 border-2 border-[#000080] text-[#000080] rounded font-semibold hover:bg-[#000080] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checking ? (
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
                    Checking...
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
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Check Data Status
                  </>
                )}
              </button>

              {/* Status Display */}
              {dataStatus && (
                <div
                  className={`p-3 rounded border-l-4 ${
                    dataStatus.canDecrypt
                      ? dataStatus.message?.includes("Newly claimed")
                        ? "border-blue-500 bg-blue-50"
                        : "border-green-500 bg-green-50"
                      : "border-gray-500 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {dataStatus.canDecrypt ? (
                      dataStatus.message?.includes("Newly claimed") ? (
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
                          className="text-blue-600 flex-shrink-0 mt-0.5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M9 12l2 2 4-4" />
                        </svg>
                      ) : (
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
                          className="text-green-600 flex-shrink-0 mt-0.5"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      )
                    ) : (
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
                        className="text-gray-600 flex-shrink-0 mt-0.5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    )}
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          dataStatus.canDecrypt
                            ? dataStatus.message?.includes("Newly claimed")
                              ? "text-blue-800"
                              : "text-green-800"
                            : "text-gray-800"
                        }`}
                      >
                        {dataStatus.canDecrypt
                          ? dataStatus.message?.includes("Account claimed")
                            ? "✓ Account claimed - ready for data operations"
                            : "✓ Data is readable"
                          : dataStatus.error
                            ? `⚠ ${dataStatus.error}`
                            : "✗ Data is shredded (unreadable)"}
                      </p>
                      {dataStatus.message && !dataStatus.message.includes("Newly claimed") && (
                        <p className="text-xs text-gray-600 mt-1">
                          {dataStatus.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Shred Button */}
              <button
                onClick={handleShred}
                disabled={shredding || !voterId.trim()}
                className="w-full py-3 px-4 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {shredding ? (
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
                    Shredding...
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
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                    Initiate Selective Shred
                  </>
                )}
              </button>

              {/* Result Display */}
              {shredResult && (
                <div
                  className={`p-3 rounded border-l-4 ${
                    shredResult.success
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {shredResult.success ? (
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
                        className="text-green-600 flex-shrink-0 mt-0.5"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ) : (
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
                        className="text-red-600 flex-shrink-0 mt-0.5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    )}
                    <p
                      className={`text-sm ${
                        shredResult.success ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {shredResult.success
                        ? `✓ ${shredResult.message || "Data shredded successfully"}`
                        : `✗ Error: ${shredResult.error || "Unknown error"}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Key Store Management Card */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#000080] to-[#0000CD] p-4 text-white">
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold">Master Key Store</h3>
                  <p className="text-xs text-white/90">Encryption Management</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Security Protocol:</strong> Access to the Module 4 Key
                  Store requires M-of-N multi-signature authorization from
                  judicial and election officials. All key rotation operations
                  are logged and require approval.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-sm text-gray-700">Encryption Type</span>
                  <span className="text-sm font-semibold text-gray-900">
                    AES-256-GCM
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-sm text-gray-700">Hash Algorithm</span>
                  <span className="text-sm font-semibold text-gray-900">
                    SHA-256
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-sm text-gray-700">Key Rotation</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">
                    Up to Date
                  </span>
                </div>
              </div>

              <button className="w-full py-3 px-4 border-2 border-[#000080] text-[#000080] rounded font-semibold hover:bg-[#000080] hover:text-white transition-colors flex items-center justify-center gap-2">
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
                Rotate Master Keys
              </button>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Key rotation requires administrative
                  approval and will temporarily pause encryption operations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Operations Log */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-bold text-[#000080]">
              Recent Privacy Operations
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Audit trail of cryptographic operations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-700 uppercase">
                    Timestamp
                  </th>
                  <th className="p-4 text-xs font-bold text-gray-700 uppercase">
                    Operation
                  </th>
                  <th className="p-4 text-xs font-bold text-gray-700 uppercase text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="p-4 text-sm font-mono text-gray-900">
                    2025-12-30 11:41
                  </td>
                  <td className="p-4 text-sm text-gray-900">
                    Key Rotation: Root_Node_01
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                      Success
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 text-sm font-mono text-gray-900">
                    2025-12-30 09:12
                  </td>
                  <td className="p-4 text-sm text-gray-900">
                    Shred Request: TX-4402
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                      Verified
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
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
            Content Owned, Updated and Maintained by Election Commission of India
          </p>
        </div>
      </footer>
    </div>
  );
}
