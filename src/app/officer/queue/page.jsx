import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { logoutAction } from "@/actions/auth";

// Removed worker action import since we rely on the background process
// import { startLedgerWorkerAction } from "@/actions/worker";

export default async function TransmissionQueue() {
  // 1. Session Protection
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("vlink_session")?.value;
  if (!sessionId) redirect("/");

  // 2. Fetch Active Blocks (Buffer State)
  const queuedItems = await prisma.relocationRequest.findMany({
    where: { status: "PROCESSING" },
    include: { voter: true },
    orderBy: { createdAt: "asc" },
  });

  const navLinkStyle = (path) => `
    text-xs font-black px-4 py-2 transition-all uppercase tracking-[0.2em] border border-white/20 text-white/50 hover:border-white/60 hover:text-white
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
              className="text-xs font-black px-4 py-2 transition-all uppercase tracking-[0.2em] border bg-white text-black border-white"
            >
              Queue
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
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

      {/* MAIN CONTENT: Transmission Table */}
      <main className="relative z-10 max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white/[0.03] border border-white/10 p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -mr-16 -mt-16"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h2 className="text-xl font-black uppercase italic text-orange-500 tracking-tighter">
                Live Queue Monitor
              </h2>
              <p className="text-[8px] uppercase tracking-[0.4em] text-white/30 mt-1">
                Buffer_State: {queuedItems.length} Active Blocks // Auto-Sync
                Enabled
              </p>
            </div>

            {/* LIVE INDICATOR (Replaced the Button) */}
            <div className="flex items-center gap-3 border border-orange-500/20 bg-orange-500/5 px-4 py-2 rounded">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">
                Worker Active
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-white/40">
                  <th className="py-4 font-black">Block_ID</th>
                  <th className="py-4 font-black">Subject</th>
                  <th className="py-4 font-black">Reference</th>
                  <th className="py-4 font-black text-right">Integrity</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {queuedItems.length > 0 ? (
                  queuedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-4 text-orange-500 font-bold uppercase tracking-wider">
                        TX-{item.id.substring(0, 6).toUpperCase()}
                      </td>
                      <td className="py-4 font-black uppercase tracking-tight">
                        {item.voter.firstName} {item.voter.lastName}
                      </td>
                      <td className="py-4 text-white/40 font-mono tracking-tighter">
                        {item.voter.aadhaar_uid || "---- ---- ----"}
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-[8px] border border-white/20 px-2 py-0.5 rounded text-white/30 uppercase group-hover:border-orange-500/50 group-hover:text-orange-500 transition-colors">
                          Encrypted
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-20 text-center text-[10px] uppercase tracking-[0.5em] text-white/20 italic"
                    >
                      Queue Empty // All Systems Synchronized
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
            <p className="text-[7px] text-white/20 uppercase tracking-[0.4em]">
              Protocol: Cross_State_Interoperability // Port: 5672
            </p>
            <div className="flex gap-2">
              <div className="w-1 h-1 bg-orange-500/40 rounded-full"></div>
              <div className="w-1 h-1 bg-orange-500/40 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER: System Status */}
      <footer className="fixed bottom-0 left-0 w-full p-4 flex justify-between items-center border-t border-white/5 bg-black/90 backdrop-blur-md z-10">
        <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.5em]">
          Method: RabbitMQ_Quorum_Queue
        </div>
        <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.5em]">
          Integrity: SHA-256 Hash Chain
        </div>
      </footer>
    </div>
  );
}
