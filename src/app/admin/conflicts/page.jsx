"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { getConflictsAction, acceptRemoteVersionAction, keepLocalVersionAction } from "@/actions/conflicts";
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
  const navLinkStyle = (path) => `
    text-xs font-black px-4 py-2 transition-all uppercase tracking-[0.2em] border
    ${
      pathname === path
        ? "bg-white text-black border-white"
        : "border-white/20 text-white/50 hover:border-white/60 hover:text-white"
    }
  `;

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
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden font-mono">
      {/* Background Grid */}
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

          {/* Corrected Global Navigation Paths */}
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

        <form action={logoutAction}>
          <button
            type="submit"
            className="text-xs font-black bg-red-600 text-white px-6 py-2.5 hover:bg-red-700 border border-red-600 transition-all uppercase tracking-widest"
          >
            Terminate Session
          </button>
        </form>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto py-12 px-6">
        {/* CONFLICT MONITOR */}
        <div className="bg-white/[0.03] border border-white/10 p-8 md:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30"></div>

          <div className="mb-8 flex justify-between items-end border-b border-white/5 pb-6">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic text-red-500">
                Conflict Resolver
              </h2>
              <p className="text-[8px] font-mono uppercase tracking-[0.5em] text-white/30 mt-1">
                Engine: Optimistic Concurrency Check
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchConflicts}
                disabled={loading}
                className="text-[9px] font-black uppercase tracking-widest px-3 py-1 border border-white/20 hover:bg-white hover:text-black transition-all disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
              <div className="text-[8px] text-white/20 uppercase tracking-widest">
                Pending: {conflicts.length}
              </div>
            </div>
          </div>
          {loading ? (
            <div className="py-12 text-center text-white/40 text-sm uppercase tracking-widest">
              Loading Conflicts...
            </div>
          ) : conflicts.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-white/40 text-sm uppercase tracking-widest mb-2">
                No Conflicts Found
              </div>
              <div className="text-white/20 text-[10px]">
                All transactions are synchronized
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 border-b border-white/5">
                    <th className="pb-4">Incident_ID</th>
                    <th className="pb-4">Subject</th>
                    <th className="pb-4 text-center">
                      Conflict_State
                    </th>
                    <th className="pb-4">Timestamp</th>
                    <th className="pb-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {conflicts.map((c) => (
                    <tr
                      key={c.id}
                      className="group hover:bg-white/[0.02] transition-all"
                    >
                      <td className="py-6 text-[10px] font-bold text-red-500/80">
                        {c.id.substring(0, 12)}...
                      </td>
                      <td className="py-6">
                        <p className="text-sm font-black uppercase tracking-tight">
                          {c.voter || "UNKNOWN"}
                        </p>
                        <p className="text-[8px] text-white/30 uppercase">
                          {c.epic}
                        </p>
                        <p className="text-[8px] text-white/20 mt-1">
                          Version: {c.version}
                          </p>
                      </td>
                      <td className="py-6">
                        <div className="flex items-center justify-center">
                          <span className="text-[9px] px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400">
                            {c.issue || "VERSION_MISMATCH"}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 text-[10px] font-mono text-white/50">
                        {formatTimestamp(c.timestamp)}
                      </td>
                      <td className="py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleKeepLocal(c.id, c.fullEvent)}
                            disabled={resolving === c.id}
                            className="text-[8px] font-black px-3 py-1.5 border border-white/20 hover:bg-white hover:text-black uppercase transition-all disabled:opacity-50"
                          >
                            {resolving === c.id ? "Resolving..." : "Keep Local"}
                          </button>
                          <button
                            onClick={() => handleAcceptRemote(c.id)}
                            disabled={resolving === c.id}
                            className="text-[8px] font-black px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 uppercase transition-all disabled:opacity-50"
                          >
                            {resolving === c.id ? "Resolving..." : "Accept Remote"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER - Security Metadata */}
      <div className="fixed bottom-0 left-0 w-full p-4 flex justify-between items-center border-t border-white/5 bg-black/90 backdrop-blur-md z-10">
        <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.5em]">
          Mode: Optimistic Concurrency // M-of-N Signature Verified
        </div>
        <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.5em]">
          Protocol: SHA-256 Hash Chaining
        </div>
      </div>
    </div>
  );
}
