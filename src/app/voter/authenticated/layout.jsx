import { logoutAction } from "@/actions/auth";
import VoterNav from "../VoterNav"; // We'll define this below in the same folder

export default function VoterLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
      {/* Background Grid - Defined once for all voter pages */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* The Shared Navbar */}
      <VoterNav logoutAction={logoutAction} />

      {/* This renders the specific page (Check or Relocate) */}
      <div className="relative z-10">{children}</div>

      {/* Shared Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-4 flex justify-between items-center border-t border-white/5 bg-black/90 backdrop-blur-md z-10">
        <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.5em]">
          Identity: Anchored // System: Dual_State_Ledger
        </div>
        <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.5em]">
          V-LINK PROTOCOL v2.1
        </div>
      </footer>
    </div>
  );
}
