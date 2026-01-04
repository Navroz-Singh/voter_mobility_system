"use client";
import { useState } from "react"; // <--- ADD THIS IMPORT
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import {
  shredVoterDataAction,
  checkVoterDataStatusAction,
} from "@/actions/privacy";

export default function AdminPrivacy() {
  const pathname = usePathname();
  // Now these lines will work correctly
  const [voterId, setVoterId] = useState("");
  const [shredding, setShredding] = useState(false);
  const [shredResult, setShredResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [dataStatus, setDataStatus] = useState(null);

  // ... rest of your component code remains exactly the same ...

  // Navigation Styling
  const navLinkStyle = (path) => `
    text-xs font-black px-4 py-2 transition-all uppercase tracking-[0.2em] border
    ${
      pathname === path
        ? "bg-white text-black border-white"
        : "border-white/20 text-white/50 hover:border-white/60 hover:text-white"
    }
  `;

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
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden font-mono">
      {/* Background Grid Overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* GLOBAL ADMIN NAVIGATION */}
      <nav className="relative z-50 p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center backdrop-blur-md bg-black/50 gap-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter">
              Admin_Audit <span className="text-red-500/50">#ROOT</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/50 mt-1">
              Privacy_Engine: AES-256-GCM
            </p>
          </div>
          <div className="flex gap-2 ml-6 border-l border-white/20 pl-6">
            <Link href="/admin/audit" className={navLinkStyle("/admin/audit")}>
              Ledger
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
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-xs font-black bg-red-600 text-white px-6 py-2.5 hover:bg-red-700 border border-red-600 transition-all uppercase tracking-widest"
          >
            Terminate Session
          </button>
        </form>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto py-12 px-6">
        {/* PRIVACY ENGINE STATUS */}
        <div className="bg-white/[0.03] border border-white/10 p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden mb-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic text-white/90">
                Privacy Engine Control
              </h2>
              <p className="text-[8px] font-mono uppercase tracking-[0.5em] text-white/30 mt-1">
                Module: Cryptographic Shredding Gateway
              </p>
            </div>
            <div className="px-3 py-1 border border-blue-500/30 bg-blue-500/5 text-blue-400 text-[8px] font-black uppercase tracking-widest">
              Engine_Active
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Shredding Protocol */}
            <div className="p-6 border border-white/10 bg-white/[0.01] space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/80">
                PII Shredding Protocol
              </h3>
              <p className="text-[11px] text-white/40 leading-relaxed uppercase">
                Terminating a voter identity marker involves destroying the
                specific AES-256 key associated with the record. This makes the
                PII unrecoverable while preserving hash integrity.
              </p>
              {/* Voter ID Input */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                  placeholder="Enter EPIC Number (e.g., V-DEL-1234)"
                  className="w-full bg-black/50 border border-white/20 px-3 py-2 text-sm font-mono uppercase text-white placeholder-white/30 focus:border-white/50 focus:outline-none"
                />

                {/* Status Check Button */}
                <button
                  onClick={handleCheckStatus}
                  disabled={checking || !voterId.trim()}
                  className="w-full py-2 border border-blue-500/30 text-[9px] font-black uppercase hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checking ? "Checking..." : "Check Data Status"}
                </button>

                {/* Status Display */}
                {dataStatus && (
                  <div
                    className={`text-[9px] p-2 border ${
                      dataStatus.canDecrypt
                        ? "border-green-500/30 bg-green-500/5 text-green-400"
                        : "border-red-500/30 bg-red-500/5 text-red-400"
                    }`}
                  >
                    {dataStatus.canDecrypt
                      ? "✓ Data is readable"
                      : "✗ Data is shredded (unreadable)"}
                    {dataStatus.error && (
                      <div className="mt-1 text-red-400">
                        {dataStatus.error}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Shred Button */}
              <button
                onClick={handleShred}
                disabled={shredding || !voterId.trim()}
                className="w-full py-3 border border-red-500/30 text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {shredding ? "Shredding..." : "Initiate Selective Shred"}
              </button>

              {/* Result Display */}
              {shredResult && (
                <div
                  className={`text-[9px] p-2 border ${
                    shredResult.success
                      ? "border-green-500/30 bg-green-500/5 text-green-400"
                      : "border-red-500/30 bg-red-500/5 text-red-400"
                  }`}
                >
                  {shredResult.success
                    ? `✓ ${shredResult.message || "Data shredded successfully"}`
                    : `✗ Error: ${shredResult.error || "Unknown error"}`}
                </div>
              )}
            </div>

            {/* Key Store Management */}
            <div className="p-6 border border-white/10 bg-white/[0.01] space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                Master Key Store
              </h3>
              <p className="text-[11px] text-white/40 leading-relaxed uppercase">
                Access to the Module 4 Key Store requires M-of-N multi-signature
                authorization from judicial and election officials.
              </p>
              <button className="w-full py-3 border border-blue-500/30 text-[9px] font-black uppercase hover:bg-blue-500 hover:text-white transition-all">
                Rotate Master Keys
              </button>
            </div>
          </div>
        </div>

        {/* LOGS TABLE */}
        <div className="bg-white/[0.03] border border-white/10 p-6 shadow-2xl">
          <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-4 px-2">
            Recent Privacy Operations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px]">
              <thead className="border-b border-white/5">
                <tr className="text-white/30 uppercase">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Operation</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-white/60 uppercase divide-y divide-white/5">
                <tr>
                  <td className="p-4 font-mono">2025-12-30 11:41</td>
                  <td className="p-4">Key Rotation: Root_Node_01</td>
                  <td className="p-4 text-emerald-500">Success</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono">2025-12-30 09:12</td>
                  <td className="p-4">Shred Request: TX-4402</td>
                  <td className="p-4 text-emerald-500">Verified</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* FOOTER - Security Metadata */}
      <div className="fixed bottom-0 left-0 w-full p-4 flex justify-between items-center border-t border-white/5 bg-black/90 backdrop-blur-md z-10">
        <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.5em]">
          Auth: M-of-N Signature Verified
        </div>
        <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.5em]">
          Encryption: AES-256-GCM // SHA-256
        </div>
      </div>
    </div>
  );
}
