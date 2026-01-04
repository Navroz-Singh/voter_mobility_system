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
          message: result.error || "Verification failed"
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult({
        valid: false,
        message: "Verification failed: " + error.message
      });
    } finally {
      setVerifying(false);
    }
  };

  // Global Admin Navigation Styling
  const navLinkStyle = (path) => `
    text-xs font-black px-4 py-2 transition-all uppercase tracking-[0.2em] border
    ${
      pathname === path
        ? "bg-white text-black border-white"
        : "border-white/20 text-white/50 hover:border-white/60 hover:text-white"
    }
  `;

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
    <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black overflow-x-hidden">
      {/* BACKGROUND GRID OVERLAY */}
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
              Ledger: Dual_State_Active
            </p>
          </div>

          <div className="flex gap-3 ml-6 border-l border-white/20 pl-6">
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

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Ledger Active
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs font-black bg-red-600 text-white px-6 py-2.5 hover:bg-red-700 border border-red-600 transition-all uppercase tracking-widest"
            >
              Terminate Session
            </button>
          </form>
        </div>
      </nav>

      {/* COMPACT LEDGER TABLE */}
      <main className="relative z-10 p-10 max-w-7xl mx-auto">
        {/* Verification Section */}
        <div className="mb-6 bg-white/[0.03] border border-white/10 p-6 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white/90">
                Chain Integrity Verification
              </h3>
              <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">
                Status: {chainIntegrity}
              </p>
            </div>
            <button
              onClick={handleVerifyChain}
              disabled={verifying || loading}
              className="px-6 py-2.5 text-xs font-black uppercase tracking-widest border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? "Verifying..." : "Verify Chain"}
            </button>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div className={`p-4 border ${
              verificationResult.valid 
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" 
                : "border-red-500/30 bg-red-500/5 text-red-400"
            }`}>
              <div className="text-[10px] font-black uppercase tracking-widest mb-2">
                {verificationResult.valid ? "✓ Verification Passed" : "✗ Verification Failed"}
              </div>
              <div className="text-[9px] text-white/60 space-y-1">
                {verificationResult.message && (
                  <div>{verificationResult.message}</div>
                )}
                {verificationResult.verifiedCount !== undefined && (
                  <div>
                    Verified: {verificationResult.verifiedCount} / {verificationResult.totalEntries} entries
                  </div>
                )}
                {verificationResult.errors && verificationResult.errors.length > 0 && (
                  <div className="mt-2">
                    <div className="font-black mb-1">Errors:</div>
                    {verificationResult.errors.slice(0, 5).map((error, idx) => (
                      <div key={idx} className="text-red-400">
                        • {error.message || error.issue}
                      </div>
                    ))}
                    {verificationResult.errors.length > 5 && (
                      <div className="text-white/40">
                        ... and {verificationResult.errors.length - 5} more errors
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              Immutable_Chain_Explorer // Genesis_Node_V2
            </h2>
            <button
              onClick={fetchLedgerData}
              disabled={loading}
              className="text-[9px] font-black uppercase tracking-widest px-3 py-1 border border-white/20 hover:bg-white hover:text-black transition-all disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="text-white/40 text-sm uppercase tracking-widest">
                Loading Ledger Data...
              </div>
            </div>
          ) : ledgerEvents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-white/40 text-sm uppercase tracking-widest">
                No Ledger Entries Found
              </div>
              <div className="text-white/20 text-[10px] mt-2">
                Ledger entries will appear here as events are processed
              </div>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead className="bg-white/5 uppercase tracking-[0.2em] text-[9px] font-black text-white/30">
                  <tr>
                    <th className="p-4">Block ID</th>
                    <th className="p-4">Event Type</th>
                    <th className="p-4">Current Hash</th>
                    <th className="p-4">Prev Hash</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ledgerEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-white/[0.03] transition-colors group border-white/5"
                    >
                      <td className="p-4 text-[10px] font-bold text-blue-400 group-hover:text-blue-300">
                        {event.id.substring(0, 12)}...
                      </td>
                      <td className="p-4 text-[11px] font-black uppercase tracking-tight">
                        {event.eventType || event.type}
                      </td>
                      <td className="p-4 text-[9px] font-mono text-white/30 group-hover:text-white/60 transition-all cursor-help" title={event.curr_hash || event.hash}>
                        {formatHash(event.curr_hash || event.hash)}
                      </td>
                      <td className="p-4 text-[9px] font-mono text-white/30 group-hover:text-white/60 transition-all cursor-help" title={event.prev_hash || event.prev}>
                        {formatHash(event.prev_hash || event.prev)}
                      </td>
                      <td className="p-4 text-[10px] font-mono text-white/50">
                        {formatTimestamp(event.timestamp || event.time)}
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-[9px] border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest">
                          VERIFIED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Table Decoration */}
              <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center">
                <p className="text-[8px] uppercase tracking-[0.5em] text-white/20">
                  Total Entries: {ledgerEvents.length} Chain Integrity: {chainIntegrity}
                </p>
                <div className="flex gap-2">
                  <div className="w-1 h-1 bg-white/20"></div>
                  <div className="w-1 h-1 bg-white/20"></div>
                  <div className="w-1 h-1 bg-white/20"></div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 w-full p-4 flex justify-between items-center border-t border-white/5 bg-black/90 backdrop-blur-md z-10">
        <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.5em]">
          Protocol: SHA-256 Hash Chaining // Secure_Layer: Active
        </div>
        <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.5em]">
          Anchor_Point: PostgreSQL_Mainframe
        </div>
      </div>
    </div>
  );
}