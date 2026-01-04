"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation"; // To detect if admin or officer
import { loginAction } from "@/actions/auth";

export default function GovernmentLogin() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // Determine role based on the URL path
  const isAdmin = pathname.includes("admin");
  const roleTitle = isAdmin ? "System Admin" : "Polling Officer";
  const roleType = isAdmin ? "ADMIN" : "OFFICER";

  async function handleLogin(formData) {
    setError(null);
    setIsLoading(true);

    // Append the specific role so the backend knows which table/ID to check
    formData.append("role", roleType);

    // Use the Service ID as the identifier for the loginAction
    const serviceId = formData.get("gov_id");
    formData.append("identifier", serviceId);

    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      {/* Background Grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="relative z-10 w-full max-w-md border border-white/20 bg-white/5 p-12 backdrop-blur-xl shadow-2xl">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
          {roleTitle}
        </h1>
        <p className="text-white/50 font-mono text-[10px] uppercase mb-10 tracking-[0.3em] border-b border-white/10 pb-4">
          Secure Government Terminal
        </p>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 text-[10px] font-mono uppercase tracking-widest animate-pulse">
            Error: {error}
          </div>
        )}

        <form action={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
              Service ID
            </label>
            <input
              name="gov_id"
              type="text"
              required
              className="w-full bg-transparent border border-white/20 p-4 focus:border-white outline-none transition-all font-mono text-sm"
              placeholder="GOV-XXXX-XXXX"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
              Secure Passcode
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-transparent border border-white/20 p-4 focus:border-white outline-none transition-all font-mono text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            disabled={isLoading}
            className={`w-full font-black py-4 uppercase transition-all tracking-widest text-sm ${
              isLoading
                ? "bg-white/20 text-white/40 cursor-not-allowed"
                : "bg-white text-black hover:bg-black hover:text-white hover:border hover:border-white"
            }`}
          >
            {isLoading ? "Authenticating..." : "Authorize Session"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-[10px] text-white/30 uppercase leading-relaxed tracking-wider">
            Unauthorized access is strictly prohibited under the IT Act. All
            sessions are logged on the immutable ledger.
          </p>
        </div>
      </div>

      <Link
        href="/"
        className="mt-8 text-white/40 text-[10px] font-bold hover:text-white transition-colors uppercase tracking-[0.4em]"
      >
        ← Terminal Exit
      </Link>
    </div>
  );
}
