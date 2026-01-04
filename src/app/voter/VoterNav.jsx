"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function VoterNav({ logoutAction }) {
  const pathname = usePathname();

  const navLinkStyle = (path) => `
    text-xs font-black px-4 py-2 transition-all uppercase tracking-[0.2em] border
    ${
      pathname === path
        ? "bg-white text-black border-white"
        : "border-white/20 text-white/50 hover:border-white/60 hover:text-white"
    }
  `;

  return (
    <nav className="relative z-50 p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center backdrop-blur-md bg-black/50 gap-6">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-xl font-black italic uppercase tracking-tighter">
            Voter_Portal <span className="text-white/30">v2.1</span>
          </h1>
        </div>
        <div className="flex gap-3 ml-6 border-l border-white/20 pl-6">
          <Link
            href="/voter/authenticated/check"
            className={navLinkStyle("/voter/authenticated/check")}
          >
            Identity
          </Link>
          <Link
            href="/voter/authenticated/relocate"
            className={navLinkStyle("/voter/authenticated/relocate")}
          >
            Relocate
          </Link>
        </div>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="text-xs font-black bg-white text-black px-6 py-2.5 hover:bg-black hover:text-white border border-white transition-all uppercase tracking-widest"
        >
          Secure Logout
        </button>
      </form>
    </nav>
  );
}
