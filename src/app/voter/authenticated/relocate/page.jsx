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
    <>
      {/* Breadcrumb */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-[#000080]">
              Home
            </a>
            <span>/</span>
            <a href="/voter" className="hover:text-[#000080]">
              Voter Portal
            </a>
            <span>/</span>
            <span className="text-[#000080] font-semibold">
              Relocation Request
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#000080] mb-2 border-b-4 border-[#FF9933] inline-block pb-2">
            Constituency Relocation
          </h1>
          <p className="text-gray-600 mt-4">
            Request a change in your registered voting constituency
          </p>
        </div>

        {!isProfileComplete ? (
          /* ERROR: No Identity Uploaded */
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <h2 className="text-xl font-bold">Profile Incomplete</h2>
                  <p className="text-sm text-white/90">
                    Action Required: Complete Enrollment
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8 text-center">
              <p className="text-gray-700 mb-6 leading-relaxed">
                Your profile details have not been uploaded by a polling officer
                yet. Please visit a polling station to complete your enrollment
                before requesting a constituency relocation.
              </p>
              <a
                href="/voter/authenticated/check"
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                View My Identity
              </a>
            </div>
          </div>
        ) : pendingRequest ? (
          /* PENDING: Awaiting Officer */
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
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
                  className="animate-pulse"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div>
                  <h2 className="text-xl font-bold">Relocation Pending</h2>
                  <p className="text-sm text-white/90">
                    Awaiting Field Unit Approval
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="text-center mb-8">
                <p className="text-gray-700 mb-4">
                  Your relocation request is currently being processed by a field
                  officer. You will be notified once the request is approved.
                </p>
                <div className="inline-flex flex-col items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-xs font-semibold text-gray-600 uppercase">
                    Target Constituency
                  </span>
                  <span className="text-lg font-bold text-[#000080]">
                    {pendingRequest.toZone}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
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
                      className="text-gray-600"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-600">Status</p>
                      <p className="text-sm font-semibold text-gray-900">
                        Pending Approval
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
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
                      className="text-gray-600"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-600">Request ID</p>
                      <p className="text-sm font-semibold text-gray-900 font-mono">
                        {pendingRequest.id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* FORM: Ready to Relocate */
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#FF9933] to-[#000080] p-4 text-white">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <div>
                  <h2 className="text-lg font-bold">Request Relocation</h2>
                  <p className="text-xs text-white/90">
                    Change your registered constituency
                  </p>
                </div>
              </div>
            </div>

            <form action={requestRelocationAction} className="p-6 space-y-6">
              <div className="bg-blue-50 border-l-4 border-[#000080] p-4">
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
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Relocation requests must be approved by a field officer.
                    Once submitted, you cannot modify your request until it is
                    processed.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Constituency
                </label>
                <div className="px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded text-gray-900 font-semibold">
                  {user.constituency}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Constituency
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="targetZone"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all text-gray-900 appearance-none bg-white cursor-pointer"
                >
                  <option value="">Select New Constituency...</option>
                  <option value="Zone A - North Delhi">
                    Zone A - North Delhi
                  </option>
                  <option value="Zone C - East Delhi">
                    Zone C - East Delhi
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#000080] text-white rounded font-semibold hover:bg-[#FF9933] transition-colors flex items-center justify-center gap-2"
              >
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
                >
                  <path d="M22 2L11 13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Submit Relocation Request
              </button>
            </form>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-6 bg-gray-100 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            About Constituency Relocation
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Relocation requests are processed by authorized field officers to
            ensure accuracy and prevent fraud. The process typically takes 2-3
            business days. You will remain registered in your current
            constituency until the relocation is approved.
          </p>
        </div>
      </main>
    </>
  );
}
