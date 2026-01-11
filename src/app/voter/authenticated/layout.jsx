import { logoutAction } from "@/actions/auth";
import VoterNav from "../VoterNav";

export default function VoterLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* The Shared Navbar (includes government header and navigation) */}
      <VoterNav logoutAction={logoutAction} />

      {/* This renders the specific page (Check or Relocate) */}
      <div>{children}</div>

      {/* Shared Footer */}
      <footer className="bg-[#000080] text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div className="text-xs">
              <p className="mb-2">
                © 2026 Election Commission of India. All Rights Reserved.
              </p>
              <p className="text-white/70">
                Content Owned, Updated and Maintained by Election Commission of
                India
              </p>
            </div>
            <div className="flex gap-6 text-xs">
              <a href="#" className="hover:text-[#FF9933] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[#FF9933] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-[#FF9933] transition-colors">
                Help & Support
              </a>
            </div>
          </div>
          <div className="border-t border-white/20 pt-4 text-center text-xs text-white/60">
            <p>V-LINK Protocol v2.1 | Dual-State Ledger System</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
