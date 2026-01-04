// src/app/voter/(authenticated)/relocate/page.jsx
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { requestRelocationAction } from "@/actions/relocation.js";

export default async function VoterRelocate() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("vlink_session")?.value;

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: { relocationRequests: { where: { status: "PENDING" }, take: 1 } },
  });

  const isProfileComplete = !!(user?.firstName && user?.aadhaar_uid);
  const pendingRequest = user?.relocationRequests[0];

  return (
    <main className="max-w-3xl mx-auto py-12 px-6 relative z-10">
      {!isProfileComplete ? (
        /* ERROR: No Identity Uploaded */
        <div className="bg-amber-500/5 border border-amber-500/20 p-10 text-center">
          <h2 className="text-xl font-black italic text-amber-500 uppercase mb-4">
            Migration Gateway Locked
          </h2>
          <p className="text-sm text-white/60">
            Your profile details have not been uploaded by a polling officer
            yet. Please visit a polling station to complete enrollment.
          </p>
        </div>
      ) : pendingRequest ? (
        /* PENDING: Awaiting Officer */
        <div className="bg-white/[0.03] border border-white/10 p-10 text-center backdrop-blur-2xl">
          <h2 className="text-xl font-black italic text-white/90 uppercase mb-4">
            Relocation Pending
          </h2>
          <p className="text-sm text-white/40 uppercase tracking-widest">
            Target: {pendingRequest.toZone}
          </p>
          <div className="mt-8 py-4 border-t border-white/5 text-[9px] text-white/20">
            Status: Waiting for Field Unit Approval // Request_ID:{" "}
            {pendingRequest.id}
          </div>
        </div>
      ) : (
        /* FORM: Ready to Relocate */
        <div className="bg-white/[0.03] border border-white/10 p-10 backdrop-blur-2xl relative overflow-hidden">
          <h2 className="text-xl font-black italic text-white/90 uppercase mb-8">
            Constituency Migration
          </h2>
          <form action={requestRelocationAction} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
                Current Zone
              </label>
              <div className="bg-white/5 p-3 border border-white/5 font-mono uppercase text-white/30">
                {user.constituency}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50">
                Target Zone
              </label>
              <select
                name="targetZone"
                className="w-full bg-transparent border-b border-white/20 py-2 outline-none text-sm font-mono uppercase text-white appearance-none cursor-pointer"
              >
                <option className="bg-black">Select New Zone...</option>
                <option className="bg-black">Zone A - North Delhi</option>
                <option className="bg-black">Zone C - East Delhi</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-white text-black font-black text-xs py-4 uppercase tracking-widest border border-white hover:bg-black hover:text-white transition-all"
            >
              Request Relocation
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
