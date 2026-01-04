"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { fetchVoterByEPIC, commitVoterUpdate } from "@/actions/officer";

export default function OfficerUpdate() {
  const [searchId, setSearchId] = useState("");
  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    try {
      // 1. Execute Search against the Mutable Roll
      const result = await fetchVoterByEPIC(searchId);

      if (result.success) {
        setVoter(result.voter);
        // Optional: Clear the search ID after a successful hit
        // setSearchId("");
      } else {
        // 2. Clear state if no subject is found
        setVoter(null);
        alert(result.error || "EPIC Record Not Found");
      }
    } catch (error) {
      console.error("Lookup Pipeline Error:", error);
      alert("Critical: System failed to query central ledger.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async (formData) => {
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      constituency: formData.get("constituency"),
    };

    setLoading(true);
    const result = await commitVoterUpdate(voter.id, data); // Triggers Dual-State Commit
    if (result.success) {
      alert("Ledger Synchronized Successfully");
      setVoter(null);
      setSearchId("");
    } else {
      alert(result.error);
    }
    setLoading(false);
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
      {/* Background Grid Decor */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* HEADER: Field Unit Navigation */}
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
          <div className="flex items-center gap-2 px-3 py-1.5 border border-amber-500/40 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            Live Sync: Active
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs font-black bg-white text-black px-6 py-2.5 hover:bg-black hover:text-white border border-white transition-all uppercase tracking-widest"
            >
              Sync & Logout
            </button>
          </form>
        </div>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto py-12 px-6">
        {/* LOOKUP SECTION */}
        <div className="bg-white/[0.03] border border-white/10 p-6 backdrop-blur-xl mb-6 shadow-xl">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white/60"></span>
            1. Search Central Ledger
          </h2>
          <form onSubmit={handleLookup} className="flex gap-4">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
              placeholder="ENTER EPIC / VOTER ID"
              className="flex-1 bg-transparent border-b border-white/10 py-1 focus:border-white outline-none text-sm tracking-[0.1em] uppercase transition-all"
            />
            <button
              disabled={loading}
              className="px-6 py-1.5 border border-white text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all"
            >
              {loading ? "FETCHING..." : "Fetch State"}
            </button>
          </form>
        </div>

        {/* UPDATE FORM */}
        <div
          className={`transition-all duration-500 ${
            voter ? "opacity-100" : "opacity-30 pointer-events-none"
          }`}
        >
          <div className="bg-white/[0.03] border border-white/10 p-8 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-white/90">
                  Subject Modification
                </h2>
                <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-white/30 mt-1">
                  Buffer: Mutable_Current_Roll
                </p>
              </div>
              <span className="text-[8px] border border-blue-500/30 bg-blue-500/5 text-blue-400 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                VER: {voter?.version || "---"}
              </span>
            </div>

            <form action={handleCommit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5 group">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    className="w-full bg-transparent border-b border-white/10 py-1 focus:border-white outline-none text-base uppercase"
                    defaultValue={voter?.firstName || ""}
                  />
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    className="w-full bg-transparent border-b border-white/10 py-1 focus:border-white outline-none text-base uppercase"
                    defaultValue={voter?.lastName || ""}
                  />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                  Constituency
                </label>
                <div className="relative">
                  <select
                    name="constituency"
                    className="w-full bg-transparent border-b border-white/10 py-1 focus:border-white outline-none text-base uppercase text-white appearance-none cursor-pointer"
                    defaultValue={
                      voter?.relocationRequests?.[0]?.toZone ||
                      voter?.constituency
                    }
                  >
                    <option className="bg-black" value="Zone A - North Delhi">
                      Zone A - North Delhi
                    </option>
                    <option className="bg-black" value="Zone B - South Delhi">
                      Zone B - South Delhi
                    </option>
                    <option className="bg-black" value="Zone C - East Delhi">
                      Zone C - East Delhi
                    </option>
                  </select>
                  <div className="absolute right-0 bottom-1 pointer-events-none text-white/20 text-[10px]">
                    ▼
                  </div>
                </div>
                {voter?.relocationRequests?.[0] && (
                  <div className="mt-4 p-3 border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[9px] uppercase tracking-widest font-black italic">
                    ! PENDING RELOCATION DETECTED:{" "}
                    {voter.relocationRequests[0].toZone}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full bg-white text-black font-black text-xs py-4 uppercase tracking-[0.3em] hover:bg-black hover:text-white border border-white transition-all duration-500"
                >
                  <span className="relative z-10">
                    {loading
                      ? "COMMITTING TO LEDGER..."
                      : "Commit Update to Queue"}
                  </span>
                  <div className="absolute inset-0 bg-white group-hover:bg-black transition-colors"></div>
                </button>
                <p className="text-center text-[7px] text-white/20 uppercase tracking-[0.4em] mt-3 leading-relaxed">
                  Finalizes Dual-State Transaction // Hash:{" "}
                  {voter?.id?.substring(0, 8)}...
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* FOOTER: Industrial Metadata */}
      <div className="fixed bottom-0 left-0 w-full p-3 flex justify-between items-center border-t border-white/5 bg-black/90 backdrop-blur-md z-10">
        <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.5em]">
          Ledger_State: {voter ? "MODIFICATION" : "IDLE"} Unit: FIELD_402
        </div>
        <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.5em]">
          Method: AES-256-GCM // Chain: SHA-256
        </div>
      </div>
    </div>
  );
}
