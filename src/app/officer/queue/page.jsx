import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { logoutAction } from "@/actions/auth";

export default async function TransmissionQueue() {
  // 1. Session Protection
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("vlink_session")?.value;
  if (!sessionId) redirect("/");

  // 2. Fetch Active Blocks (Buffer State)
  const queuedItems = await prisma.relocationRequest.findMany({
    where: { status: "PROCESSING" },
    include: { voter: true },
    orderBy: { createdAt: "asc" },
  });

  const navLinkStyle = (path, currentPath) =>
    `px-4 py-2 text-sm font-semibold transition-all rounded ${
      currentPath === path
        ? "bg-[#000080] text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

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
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b-4 border-[#FF9933] shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#000080] rounded-full flex items-center justify-center text-white font-bold">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-10 h-10"
                  >
                    <circle cx="12" cy="12" r="10" fill="#FF9933" />
                    <circle cx="12" cy="12" r="7" fill="#FFFFFF" />
                    <circle cx="12" cy="12" r="4" fill="#138808" />
                    <circle cx="12" cy="12" r="1" fill="#000080" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#000080]">
                    V-LINK 2.1
                  </div>
                  <div className="text-sm text-gray-600">
                    Field Officer Portal - Unit #402
                  </div>
                  <div className="text-xs text-gray-500">
                    District: New Delhi Central
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-orange-600 font-semibold">
                  Worker Active
                </span>
              </div>
              <div className="text-xs text-gray-500">Auto-Sync Enabled</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <Link
                href="/officer/register"
                className={navLinkStyle("/officer/register", "/officer/queue")}
              >
                Voter Enrollment
              </Link>
              <Link
                href="/officer/update"
                className={navLinkStyle("/officer/update", "/officer/queue")}
              >
                Update Records
              </Link>
              <Link
                href="/officer/local-buffer"
                className={navLinkStyle("/officer/local-buffer", "/officer/queue")}
              >
                Local Buffer
              </Link>
              <Link
                href="/officer/queue"
                className={navLinkStyle("/officer/queue", "/officer/queue")}
              >
                Sync Queue
              </Link>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Sync & Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#000080]">
              Home
            </Link>
            <span>/</span>
            <Link href="/officer" className="hover:text-[#000080]">
              Officer
            </Link>
            <span>/</span>
            <span className="text-[#000080] font-semibold">
              Synchronization Queue
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#000080] mb-2 border-b-4 border-[#FF9933] inline-block pb-2">
            Synchronization Queue
          </h1>
          <p className="text-gray-600 mt-4">
            Real-time monitoring of pending transactions in the processing queue
          </p>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Queue Status</p>
                <p className="text-2xl font-bold text-[#000080]">
                  {queuedItems.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
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
                  className="text-orange-600"
                >
                  <line x1="12" y1="2" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                  <line x1="2" y1="12" x2="6" y2="12" />
                  <line x1="18" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Sync Method</p>
                <p className="text-sm font-semibold text-gray-900">
                  RabbitMQ Queue
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
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
                  className="text-blue-600"
                >
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Hash Algorithm</p>
                <p className="text-sm font-semibold text-gray-900">SHA-256</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
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
                  className="text-green-600"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#000080]">
                Processing Queue
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                {queuedItems.length} transaction(s) pending ledger commitment
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-300 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-semibold text-green-800">
                Auto-Sync Active
              </span>
            </div>
          </div>

          {queuedItems.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase">
                        Transaction ID
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase">
                        Voter Name
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase">
                        Aadhaar Reference
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-700 uppercase text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {queuedItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 text-sm font-mono text-orange-600 font-semibold">
                          TX-{item.id.substring(0, 6).toUpperCase()}
                        </td>
                        <td className="p-4 text-sm font-semibold text-gray-900">
                          {item.voter.firstName} {item.voter.lastName}
                        </td>
                        <td className="p-4 text-sm font-mono text-gray-600">
                          {item.voter.aadhaar_uid || "---- ---- ----"}
                        </td>
                        <td className="p-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-1"
                            >
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Encrypted
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <p className="text-xs text-gray-600">
                  Displaying{" "}
                  <span className="font-bold text-[#000080]">
                    {queuedItems.length}
                  </span>{" "}
                  pending transaction(s)
                </p>
                <div className="text-xs text-gray-500">
                  Protocol: Cross-State Interoperability | Port: 5672
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
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
                className="mx-auto text-green-500 mb-4"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div className="text-gray-900 text-lg font-bold mb-2">
                Queue Empty
              </div>
              <div className="text-gray-500 text-sm">
                All systems synchronized. No pending transactions.
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
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
              className="text-blue-600 flex-shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                About Synchronization Queue
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">
                The queue shows transactions currently being processed by the
                background worker. Once committed to the ledger, they will be
                removed from this view. The system automatically processes queue
                items with SHA-256 hash chaining for integrity verification.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#000080] text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs mb-2">
            © 2026 Election Commission of India. All Rights Reserved.
          </p>
          <p className="text-xs text-white/70">
            Content Owned, Updated and Maintained by Election Commission of
            India
          </p>
        </div>
      </footer>
    </div>
  );
}
