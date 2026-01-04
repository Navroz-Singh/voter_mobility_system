"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";

// --- UPDATED IMPORTS TO MATCH YOUR POUCHDB.JS ---
import {
  saveVoterLocally,
  getLocalEnrollments, // Changed from getOfflineData
  clearLocalDB, // Changed from clearOfflineData
} from "@/lib/pouchdb";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { commitVoterUpdate, submitEventBatch } from "@/actions/officer";

export default function OfficerRegister() {
  const pathname = usePathname();
  const isOnline = useNetworkStatus();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Optimal // Buffer: Ready");
  const [isSyncing, setIsSyncing] = useState(false);

  // --- SYNC & LOGOUT LOGIC ---
  const handleSyncAndLogout = async () => {
    if (
      !confirm(
        "Confirm Sync & End Shift? This will upload all offline records."
      )
    )
      return;

    setIsSyncing(true);
    setStatus("INITIATING HANDSHAKE...");

    try {
      // 1. Fetch Local Data (Using your function name)
      const offlineEvents = await getLocalEnrollments();

      if (offlineEvents.length > 0) {
        if (!isOnline) {
          alert("Cannot Sync: Network Offline. Please connect to upload data.");
          setIsSyncing(false);
          setStatus("ERROR: NETWORK_UNAVAILABLE");
          return;
        }

        setStatus(`SYNCING ${offlineEvents.length} RECORDS...`);

        // 2. Send Batch to Server (RabbitMQ)
        const result = await submitEventBatch(offlineEvents);

        if (!result.success) {
          setStatus(`SYNC FAILED: ${result.failed} ERRORS`);
          alert(
            `Sync Failed. ${result.failed} records could not be uploaded. Check console.`
          );
          console.error("Sync Errors:", result.errors);
          setIsSyncing(false);
          return;
        }

        // 3. Clear Local Buffer on Success (Using your function name)
        await clearLocalDB();
        setStatus("BUFFER CLEARED // SYNC COMPLETE");
      } else {
        setStatus("NO DATA TO SYNC // CLEAN EXIT");
      }

      // 4. Perform Logout
      await logoutAction();
    } catch (error) {
      console.error("Logout Pipeline Error:", error);
      setStatus("CRITICAL SYNC FAILURE");
      setIsSyncing(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const voterData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      epic: formData.get("epic"),
      aadhaar: formData.get("aadhaar"),
      constituency: formData.get("constituency"),
    };

    try {
      if (!isOnline) {
        setStatus("STATUS: OFFLINE // Writing to PouchDB...");
        const result = await saveVoterLocally(voterData);
        if (result.success) {
          // Show ID cleanly
          const shortId = result.id ? result.id.slice(-8) : "BUFFERED";
          setStatus(`SUCCESS: Local Block Created [${shortId}]`);
          e.target.reset();
        } else {
          setStatus(`ERROR: ${result.error}`);
        }
      } else {
        setStatus("STATUS: ONLINE // Dispatching to Broker...");
        const result = await commitVoterUpdate(null, voterData);
        if (result.success) {
          setStatus("SUCCESS: Event Packet Anchored to Queue");
          e.target.reset();
        } else {
          setStatus(`ERROR: ${result.error}`);
        }
      }
    } catch (err) {
      setStatus("CRITICAL: Pipeline Interrupted");
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setStatus("Optimal // Buffer: Ready"), 4000);
    }
  };

  const navLinkStyle = (path) => `
    text-xs font-black px-4 py-2 transition-all uppercase tracking-[0.2em] border
    ${
      pathname === path
        ? "bg-white text-black border-white"
        : "border-white/20 text-white/50 hover:border-white/60 hover:text-white"
    }
  `;

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden font-mono">
      {/* Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      <nav className="relative z-50 p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center backdrop-blur-md bg-black/50 gap-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter">
              Field Unit <span className="text-white/30">#402</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/50 mt-1">
              District: New Delhi Central
            </p>
          </div>
          <div className="flex gap-3 ml-6 border-l border-white/20 pl-6">
            <Link
              href="/officer/register"
              className={navLinkStyle("/officer/register")}
            >
              Enroll
            </Link>
            <Link
              href="/officer/update"
              className={navLinkStyle("/officer/update")}
            >
              Update
            </Link>
            <Link
              href="/officer/queue"
              className={navLinkStyle("/officer/queue")}
            >
              Queue
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {isOnline ? (
            <div className="flex items-center gap-2 px-3 py-1.5 border border-green-500/40 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              System Online
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 border border-amber-500/40 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Offline Mode
            </div>
          )}

          {/* SYNC & LOGOUT BUTTON */}
          <button
            onClick={handleSyncAndLogout}
            disabled={isSyncing}
            className="text-xs font-black bg-white text-black px-6 py-2.5 hover:bg-black hover:text-white border border-white transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-wait"
          >
            {isSyncing ? "SYNCING..." : "SYNC & LOGOUT"}
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto py-12 px-6">
        <div className="bg-white/[0.03] border border-white/10 p-8 md:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="mb-8">
            <h2 className="text-xl font-black uppercase tracking-tighter italic text-white/90">
              Voter Enrollment
            </h2>
            <p className="text-[8px] font-mono uppercase tracking-[0.5em] text-white/30 mt-1">
              Protocol: v2.1 // Secure_Intake
            </p>
          </div>

          <form onSubmit={handleEnroll} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5 group">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                  First Name
                </label>
                <input
                  required
                  name="firstName"
                  type="text"
                  className="w-full bg-transparent border-b border-white/10 py-1 focus:border-white outline-none text-sm font-mono uppercase transition-all"
                  placeholder="NAME"
                />
              </div>
              <div className="space-y-1.5 group">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                  Last Name
                </label>
                <input
                  required
                  name="lastName"
                  type="text"
                  className="w-full bg-transparent border-b border-white/10 py-1 focus:border-white outline-none text-sm font-mono uppercase transition-all"
                  placeholder="SURNAME"
                />
              </div>
            </div>

            <div className="space-y-1.5 group">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                EPIC Number (Voter ID)
              </label>
              <input
                required
                name="epic"
                type="text"
                className="w-full bg-transparent border-b border-white/10 py-1 focus:border-white outline-none text-sm font-mono tracking-[0.3em] uppercase"
                placeholder="VOTER_ID_XXXXX"
              />
            </div>

            <div className="space-y-1.5 group">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                UID Reference (Aadhaar)
              </label>
              <input
                required
                name="aadhaar"
                type="text"
                className="w-full bg-transparent border-b border-white/10 py-1 focus:border-white outline-none text-sm font-mono tracking-[0.3em]"
                placeholder="0000 0000 0000"
              />
            </div>

            <div className="space-y-1.5 group">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                Target Constituency
              </label>
              <select
                required
                name="constituency"
                className="w-full bg-transparent border-b border-white/10 py-1 focus:border-white outline-none text-sm font-mono uppercase text-white/80 appearance-none cursor-pointer"
              >
                <option className="bg-black" value="">
                  SELECT ZONE...
                </option>
                <option className="bg-black" value="ZONE A - NORTH DELHI">
                  ZONE A - NORTH DELHI
                </option>
                <option className="bg-black" value="ZONE B - SOUTH DELHI">
                  ZONE B - SOUTH DELHI
                </option>
              </select>
            </div>

            <div className="pt-4">
              <button
                disabled={loading}
                className={`group relative w-full font-black text-xs py-4 uppercase tracking-[0.3em] border transition-all duration-500 ${
                  isOnline
                    ? "bg-green-500 text-black border-green-500 hover:bg-black hover:text-green-500"
                    : "bg-white text-black border-white hover:bg-black hover:text-white"
                }`}
              >
                <span className="relative z-10">
                  {loading
                    ? "COMMITTING..."
                    : isOnline
                    ? "Direct Ledger Commit"
                    : "Store in Local Buffer"}
                </span>
                <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </button>
              <p className="text-center text-[7px] text-white/20 uppercase tracking-[0.4em] mt-4 leading-relaxed">
                Dual-State Provisioning:{" "}
                {isOnline ? "REMOTE_BROKER" : "LOCAL_INDEXEDDB"}
              </p>
            </div>
          </form>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-3 flex justify-between items-center border-t border-white/5 bg-black/90 backdrop-blur-md z-10">
        <div className="text-[8px] font-mono text-white/20 uppercase tracking-[0.5em]">
          System_Status: {status}
        </div>
        <div className="text-[8px] font-mono text-white/20 uppercase tracking-[0.5em]">
          Method:{" "}
          {isOnline ? "AES-256-GCM // RabbitMQ" : "AES-256-GCM // PouchDB"}
        </div>
      </footer>
    </div>
  );
}
