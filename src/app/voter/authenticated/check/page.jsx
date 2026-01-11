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
  const isDataUploaded = user?.firstName && user?.aadhaar_uid;

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#000080]">
              Home
            </Link>
            <span>/</span>
            <Link href="/voter" className="hover:text-[#000080]">
              Voter Portal
            </Link>
            <span>/</span>
            <span className="text-[#000080] font-semibold">My Identity</span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#000080] mb-2 border-b-4 border-[#FF9933] inline-block pb-2">
            My Voter Identity
          </h1>
          <p className="text-gray-600 mt-4">
            View your registered voter information and verification status
          </p>
        </div>

        {isDataUploaded ? (
          /* REAL DATA STATE */
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#FF9933] to-[#000080] p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <div>
                    <h2 className="text-xl font-bold">Identity Record</h2>
                    <p className="text-xs text-white/90">
                      Aadhaar UID: {user.aadhaar_uid}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    user.isVerified
                      ? "bg-green-500/20 border border-green-500 text-white"
                      : "bg-yellow-500/20 border border-yellow-300 text-white"
                  }`}
                >
                  {user.isVerified ? "✓ Verified" : "⏳ Pending"}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                    Registered Name
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded">
                    <p className="text-base font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                    EPIC Number
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded">
                    <p className="text-base font-semibold text-gray-900 font-mono">
                      {user.epic_number}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                    Registered Constituency
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded">
                    <p className="text-base font-semibold text-gray-900">
                      {user.constituency || "NOT ASSIGNED"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Status Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                {user.isVerified ? (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <div className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600 flex-shrink-0 mt-0.5"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-green-800 mb-1">
                          Identity Verified
                        </p>
                        <p className="text-xs text-green-700 leading-relaxed">
                          Your voter identity has been verified and anchored to
                          the central ledger. You are eligible to participate in
                          elections.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <div className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-yellow-600 flex-shrink-0 mt-0.5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-yellow-800 mb-1">
                          Verification Pending
                        </p>
                        <p className="text-xs text-yellow-700 leading-relaxed">
                          Your identity is currently undergoing verification.
                          This process typically takes 2-3 business days. You
                          will be notified once verification is complete.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* OFFICER PENDING STATE */
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 text-white">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <h2 className="text-xl font-bold">
                    Identity Not Found in Ledger
                  </h2>
                  <p className="text-sm text-white/90">
                    Registration Incomplete
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 text-center">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-600"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  Your digital identity records have not been uploaded by a
                  polling officer yet. To complete your voter registration,
                  please visit your local polling station with your identity
                  documents.
                </p>

                <div className="bg-blue-50 border-l-4 border-[#000080] p-4 rounded text-left">
                  <div className="flex items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#000080] flex-shrink-0 mt-0.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-[#000080] mb-2">
                        Action Required
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        <li>
                          • Visit your nearest polling station or field office
                        </li>
                        <li>• Bring your Aadhaar card and address proof</li>
                        <li>
                          • Request the officer to register your voter identity
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href="tel:1800-XXX-XXXX"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#000080] text-white rounded font-semibold hover:bg-[#FF9933] transition-colors"
                  >
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
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Contact Helpline
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-6 bg-gray-100 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            About Voter Identity
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your voter identity is securely stored in the V-LINK ledger system
            with AES-256-GCM encryption. All data is protected and can only be
            accessed through authorized channels. If you notice any
            discrepancies in your information, please contact your local
            election office immediately.
          </p>
        </div>
      </main>
    </>
  );
}
