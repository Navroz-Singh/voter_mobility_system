import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function VoterCheck() {
  // 1. Fetch Session from Cookies
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("vlink_session")?.value;

  if (!sessionId) {
    redirect("/");
  }

  // 2. Fetch Real User Data from DB
  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: {
      firstName: true,
      lastName: true,
      epic_number: true,
      aadhaar_uid: true,
      constituency: true,
      isVerified: true,
    },
  });

  // 3. Determine if record is "Complete"
  // If firstName or aadhaar is missing, it means the officer hasn't filled it yet
  const isDataUploaded = user?.firstName && user?.aadhaar_uid;

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden font-mono">
      <main className="relative z-10 max-w-3xl mx-auto py-12 px-6">
        {isDataUploaded ? (
          /* REAL DATA STATE */
          <div className="bg-white/[0.03] border border-white/10 p-8 md:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30"></div>

            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-white/90">
                  Identity Marker
                </h2>
                <p className="text-[8px] font-mono uppercase tracking-[0.5em] text-white/30 mt-1">
                  Ledger_State: Anchored // UID: {user.aadhaar_uid}
                </p>
              </div>
              <div
                className={`px-3 py-1 border text-[8px] font-black uppercase tracking-widest ${
                  user.isVerified
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/5 text-amber-400"
                }`}
              >
                {user.isVerified ? "Verified" : "Pending_Verification"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5 pt-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
                  Registered Name
                </label>
                <div className="bg-white/5 p-3 border border-white/5">
                  <p className="text-sm tracking-widest uppercase">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
                  EPIC Reference
                </label>
                <div className="bg-white/5 p-3 border border-white/5">
                  <p className="text-sm tracking-widest uppercase text-white/70">
                    {user.epic_number}
                  </p>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
                  Constituency
                </label>
                <div className="bg-white/5 p-3 border border-white/5">
                  <p className="text-sm tracking-widest uppercase text-white/70">
                    {user.constituency || "NOT_ASSIGNED"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* OFFICER PENDING STATE */
          <div className="bg-amber-500/5 border border-amber-500/20 p-10 backdrop-blur-2xl shadow-2xl text-center">
            <div className="w-12 h-12 border-2 border-amber-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-amber-500 font-black text-xl">!</span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter italic text-amber-500 mb-4">
              Identity Not Found in Ledger
            </h2>
            <div className="max-w-md mx-auto space-y-4">
              <p className="text-sm leading-relaxed text-white/60 uppercase">
                It appears your digital records have not been uploaded by the
                polling officer yet.
              </p>
              <div className="py-6 border-y border-white/10">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white">
                  Action Required:
                </p>
                <p className="text-xs text-amber-400 mt-2 uppercase tracking-wide">
                  Please visit your local polling station and provide your
                  documents to get yourself added to the database.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-4 flex justify-between items-center border-t border-white/5 bg-black/90 backdrop-blur-md z-10">
        <div className="text-[8px] text-white/30 uppercase tracking-[0.5em]">
          Identity: {isDataUploaded ? "Anchored" : "Unresolved"}
        </div>
        <div className="text-[8px] text-white/30 uppercase tracking-[0.5em]">
          Module: Voter_Intake_Service
        </div>
      </footer>
    </div>
  );
}
