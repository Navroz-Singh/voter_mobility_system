"use client";

import Link from "next/link";

const Icons = {
  Offline: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 1l22 22" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M12 20h.01" />
    </svg>
  ),
  Shield: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Zap: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Database: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
};

export default function LandingPage() {
  const portals = [
    {
      title: "Voter Portal",
      path: "/voter",
      subtitle: "Public Identity & Mobility",
    },
    {
      title: "Polling Officer",
      path: "/officer",
      subtitle: "Field Entry & Offline Sync",
    },
    {
      title: "System Admin",
      path: "/admin",
      subtitle: "Ledger Audit & Shredding",
    },
  ];

  const features = [
    {
      title: "Local-First Offline Sync",
      desc: "Capture data in zero-connectivity zones via PouchDB. Background sync activates instantly upon 4G/Wi-Fi detection.",
      icon: <Icons.Offline />,
      img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
    },
    {
      title: "Cryptographic Shredding",
      desc: "Separation of PII from the Ledger. Delete AES-256 keys to shred data without compromising the hash chain integrity.",
      icon: <Icons.Shield />,
      img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200",
    },
    {
      title: "Optimistic Concurrency",
      desc: "Version-vector tracking ensures multi-station updates never conflict, maintaining a clean global state.",
      icon: <Icons.Zap />,
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
    },
    {
      title: "Identity Gateway",
      desc: "Biometric and UIDAI validation at ingestion. Pre-verify voter existence before ledger commitment.",
      icon: <Icons.Database />,
      img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200",
    },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* BACKGROUND GRID OVERLAY */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50 backdrop-blur-md border-b border-white/10">
        <div className="font-black italic uppercase tracking-tighter text-xl">
          V-LINK 2.1
        </div>
        {/* ThemeToggle removed from here */}
        <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
          Secure Environment
        </div>
      </nav>

      <section className="relative z-10 min-h-screen flex flex-col justify-between px-6 pb-12">
        <div />

        <div className="max-w-7xl mx-auto w-full text-left md:text-center mt-32">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-6 italic uppercase leading-none">
            V-LINK <span className="opacity-20 italic">2.1</span>
          </h1>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 uppercase">
              Next-Generation Electoral State Machine
            </h2>
            <p className="text-white/70 font-mono tracking-wide text-sm leading-relaxed">
              Securely synchronizing voter data across distributed nodes.
              Banking-grade auditability meets localized resilience.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 w-full max-w-7xl mx-auto border border-white/20 bg-black mt-20 shadow-2xl">
          {portals.map((p) => (
            <Link
              key={p.title}
              href={p.path}
              className="group relative p-12 bg-black hover:bg-white transition-all duration-500 overflow-hidden border-r last:border-r-0 border-white/10"
            >
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-white/60 group-hover:text-black/40 transition-colors">
                  {p.subtitle}
                </p>
                <h2 className="text-3xl font-bold group-hover:text-black transition-colors">
                  {p.title}
                </h2>
              </div>
              <div className="absolute bottom-12 right-12 text-2xl group-hover:text-black group-hover:translate-x-2 transition-all">
                →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-black border border-white/10 p-1 group hover:border-white transition-colors duration-700 shadow-sm"
            >
              <div className="aspect-video relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img
                  src={f.img}
                  alt={f.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                <div className="absolute top-8 left-8 p-3 bg-black border border-white/20 shadow-xl">
                  {f.icon}
                </div>
              </div>
              <div className="p-12">
                <h3 className="text-4xl font-black uppercase mb-6 tracking-tighter italic leading-none">
                  {f.title}
                </h3>
                <p className="text-white/70 text-lg leading-relaxed font-light">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 py-24 border-t border-white/10 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12 text-white/60">
          <div>
            <div className="text-4xl font-black mb-4 italic text-white">
              V-LINK 2.1
            </div>
            <p className="text-xs font-mono max-w-xs leading-loose uppercase">
              SYSTEM_AUTH: VERIFIED
              <br />
              LEDGER_STATE: STABLE
              <br />
              ENCRYPTION: AES-256-GCM
            </p>
          </div>
          <div className="text-right uppercase">
            <p className="text-[10px] font-bold tracking-[0.4em] mb-4">
              Core Framework Compliance
            </p>
            <div className="flex gap-4">
              <div className="border border-white/40 px-3 py-1 text-[10px] font-bold">
                GDPR
              </div>
              <div className="border border-white/40 px-3 py-1 text-[10px] font-bold">
                ISO_27001
              </div>
              <div className="border border-white/40 px-3 py-1 text-[10px] font-bold">
                UIDAI_READY
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
