"use client";

import Link from "next/link";

const Icons = {
  Users: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Shield: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  FileText: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Database: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
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
      subtitle: "Check Status & Request Relocation",
      icon: <Icons.Users />,
    },
    {
      title: "Field Officer Portal",
      path: "/officer",
      subtitle: "Voter Registration & Updates",
      icon: <Icons.FileText />,
    },
    {
      title: "Administrator Portal",
      path: "/admin",
      subtitle: "System Audit & Management",
      icon: <Icons.Shield />,
    },
  ];

  const features = [
    {
      title: "Offline-First Registration",
      desc: "Field officers can register voters in remote areas without internet connectivity. Data automatically syncs when network becomes available.",
      icon: <Icons.Database />,
    },
    {
      title: "Secure Data Protection",
      desc: "AES-256 encryption ensures voter data remains confidential. Cryptographic key management provides banking-grade security.",
      icon: <Icons.Shield />,
    },
    {
      title: "Immutable Audit Trail",
      desc: "Blockchain-inspired ledger system maintains complete history of all voter record changes with tamper-proof verification.",
      icon: <Icons.FileText />,
    },
    {
      title: "Real-Time Verification",
      desc: "Instant validation of voter records with conflict resolution system ensures data accuracy across all polling stations.",
      icon: <Icons.Users />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Government Header Bar */}
      <div className="bg-[#000080] text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs">
          <div className="flex items-center gap-6">
            <span>Screen Reader Access</span>
            <span>Skip to Main Content</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:underline">English</button>
            <span>|</span>
            <button className="hover:underline">हिन्दी</button>
            <span>|</span>
            <button className="hover:underline">A+</button>
            <button className="hover:underline">A-</button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b-4 border-[#FF9933] shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* National Emblem Placeholder */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#000080] rounded-full flex items-center justify-center text-white font-bold">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                    <circle cx="12" cy="12" r="10" fill="#FF9933" />
                    <circle cx="12" cy="12" r="7" fill="#FFFFFF" />
                    <circle cx="12" cy="12" r="4" fill="#138808" />
                    <circle cx="12" cy="12" r="1" fill="#000080" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#000080]">V-LINK</div>
                  <div className="text-sm text-gray-600">
                    Voter Ledger & Identity Network
                  </div>
                  <div className="text-xs text-gray-500">
                    Election Commission of India
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Last Updated</div>
              <div className="text-sm font-semibold text-gray-700">
                11 January 2026
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-[#000080] shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex space-x-1">
              <Link
                href="/"
                className="px-4 py-2 text-white hover:bg-white hover:text-[#000080] transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-white hover:bg-white hover:text-[#000080] transition-colors font-medium"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 text-white hover:bg-white hover:text-[#000080] transition-colors font-medium"
              >
                Contact
              </Link>
              <Link
                href="/help"
                className="px-4 py-2 text-white hover:bg-white hover:text-[#000080] transition-colors font-medium"
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#FF9933] via-white to-[#138808] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-8 border-l-8 border-[#000080]">
            <h1 className="text-4xl font-bold text-[#000080] mb-4">
              Welcome to V-LINK
            </h1>
            <p className="text-xl text-gray-700 mb-4 leading-relaxed">
              Digital Voter Identity Management System
            </p>
            <p className="text-gray-600 leading-relaxed max-w-4xl">
              A secure, transparent, and efficient platform for managing voter
              registration, relocation requests, and electoral roll updates. The
              system ensures data integrity through cryptographic verification and
              provides offline capabilities for remote area operations.
            </p>
          </div>
        </div>
      </section>

      {/* Portal Cards */}
      <section className="py-12 max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#000080] mb-2 border-b-4 border-[#FF9933] inline-block pb-2">
            Access Portals
          </h2>
          <p className="text-gray-600 mt-4">
            Select your role to access the respective portal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portals.map((portal) => (
            <Link
              key={portal.title}
              href={portal.path}
              className="group bg-white border-2 border-gray-200 rounded-lg shadow-md hover:shadow-xl hover:border-[#FF9933] transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex justify-center mb-4 text-[#000080] group-hover:text-[#FF9933] transition-colors">
                  {portal.icon}
                </div>
                <h3 className="text-xl font-bold text-center text-[#000080] mb-2">
                  {portal.title}
                </h3>
                <p className="text-sm text-gray-600 text-center mb-4">
                  {portal.subtitle}
                </p>
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-2 bg-[#000080] text-white px-6 py-2 rounded group-hover:bg-[#FF9933] transition-colors font-medium">
                    Access Portal
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 border-t-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#000080] mb-2 border-b-4 border-[#FF9933] inline-block pb-2">
              Key Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border-l-4 border-[#138808] rounded-r-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="text-[#000080] flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-[#000080] mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Information Bar */}
      <section className="bg-[#FFF4E6] border-y-2 border-[#FF9933] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-[#FF9933]">
              <div className="text-3xl font-bold text-[#000080] mb-2">
                100%
              </div>
              <div className="text-gray-600 font-medium">Data Security</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-[#138808]">
              <div className="text-3xl font-bold text-[#000080] mb-2">
                24/7
              </div>
              <div className="text-gray-600 font-medium">System Availability</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-[#000080]">
              <div className="text-3xl font-bold text-[#000080] mb-2">
                Verified
              </div>
              <div className="text-gray-600 font-medium">Audit Compliance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#000080] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h4 className="font-bold text-lg mb-3 border-b border-white/30 pb-2">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-[#FF9933]">
                    About V-LINK
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-[#FF9933]">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[#FF9933]">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap" className="hover:text-[#FF9933]">
                    Sitemap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3 border-b border-white/30 pb-2">
                Contact Us
              </h4>
              <ul className="space-y-2 text-sm">
                <li>Email: support@vlink.gov.in</li>
                <li>Helpline: 1800-XXX-XXXX</li>
                <li>Working Hours: 9 AM - 6 PM (IST)</li>
                <li>All Days (Except National Holidays)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3 border-b border-white/30 pb-2">
                Compliance
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 px-3 py-1 rounded text-xs font-semibold">
                  GDPR
                </span>
                <span className="bg-white/20 px-3 py-1 rounded text-xs font-semibold">
                  ISO 27001
                </span>
                <span className="bg-white/20 px-3 py-1 rounded text-xs font-semibold">
                  UIDAI
                </span>
                <span className="bg-white/20 px-3 py-1 rounded text-xs font-semibold">
                  IT Act 2000
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/30 pt-6 text-center text-sm">
            <p className="mb-2">
              © 2026 Election Commission of India. All Rights Reserved.
            </p>
            <p className="text-xs text-white/70">
              Content Owned, Updated and Maintained by Election Commission of India
            </p>
            <p className="text-xs text-white/70 mt-1">
              Best viewed in Chrome, Firefox, Safari, and Edge browsers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
