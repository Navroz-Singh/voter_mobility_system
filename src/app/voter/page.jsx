"use client";
import Link from "next/link";
import { useActionState } from "react";
// Ensure your registerVoterAction can handle the "Claim" logic (updating a user)
import { loginAction, registerVoterAction } from "@/actions/auth";

export default function VoterAuth() {
  const [error, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const intent = formData.get("intent");

      // Intent 'claim' now triggers the registration/claim logic
      const result =
        intent === "claim"
          ? await registerVoterAction(formData)
          : await loginAction(formData);

      return result?.error || null;
    },
    null
  );

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 font-mono">
      {/* Background Grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="relative z-10 w-full max-w-lg border border-white/20 bg-white/5 p-12 backdrop-blur-xl shadow-2xl">
        <div className="mb-8 border-l-2 border-amber-500 pl-6">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
            Voter Portal
          </h1>
          <p className="text-white/50 text-[10px] uppercase tracking-[0.3em]">
            System Status: Active // Gateway 402
          </p>
        </div>

        {/* ERROR MESSAGE DISPLAY */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 flex items-start gap-3">
            <span className="text-red-500 text-lg">⚠</span>
            <p className="text-red-400 text-[10px] font-bold uppercase tracking-wide pt-1">
              {error}
            </p>
          </div>
        )}

        <form action={formAction} className="space-y-8">
          <div className="space-y-6">
            <div className="group">
              <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 group-focus-within:text-amber-500 transition-colors">
                EPIC Number (Voter ID)
              </label>
              <input
                name="identifier"
                type="text"
                required
                className="w-full bg-black/50 border border-white/10 p-4 text-sm focus:border-amber-500 focus:text-amber-500 outline-none transition-all placeholder:text-white/10 tracking-widest uppercase"
                placeholder="ABC1234567"
              />
            </div>

            <div className="group">
              <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 group-focus-within:text-amber-500 transition-colors">
                Password / New Credential
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-black/50 border border-white/10 p-4 text-sm focus:border-amber-500 focus:text-amber-500 outline-none transition-all placeholder:text-white/10 tracking-widest"
                placeholder="••••••••"
              />
              <p className="text-[8px] text-white/30 mt-2 uppercase tracking-wide">
                * If claiming account, enter the password you wish to set.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            {/* LOGIN BUTTON */}
            <button
              name="intent"
              value="login"
              disabled={isPending}
              className="group relative border border-white/20 bg-transparent py-4 overflow-hidden transition-all hover:border-white"
            >
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                {isPending ? "Verifying..." : "Sign In"}
              </span>
            </button>

            {/* CLAIM BUTTON */}
            <button
              name="intent"
              value="claim"
              disabled={isPending}
              className="group relative bg-white text-black py-4 overflow-hidden hover:bg-amber-500 transition-colors"
            >
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-black transition-colors">
                {isPending ? "Syncing..." : "Claim Account"}
              </span>
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 flex gap-6 text-[9px] uppercase tracking-widest text-white/30">
        <Link href="/" className="hover:text-white transition-colors">
          ← Terminal
        </Link>
        <span></span>
        <span className="cursor-help hover:text-white transition-colors">
          Help: ID_Retrieval
        </span>
      </div>
    </div>
  );
}
