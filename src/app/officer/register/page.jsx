"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";

import {
  saveVoterLocally,
  getLocalEnrollments,
  clearLocalDB,
} from "@/lib/pouchdb";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { commitVoterUpdate, submitEventBatch } from "@/actions/officer";
import {
  validateEPIC,
  validateAadhaar,
  validateName,
  castToEPIC,
  castToAadhaar,
  castToName,
} from "@/lib/validation";
import { ZONES, normalizeZone } from "@/lib/zones";

export default function OfficerRegister() {
  const pathname = usePathname();
  const { isGoodConnection, isPoorConnection, latency, isOnline } = useNetworkStatus();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready to Register")
  const [isSyncing, setIsSyncing] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [epic, setEpic] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [constituency, setConstituency] = useState("");

  // Error state
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [epicError, setEpicError] = useState("");
  const [aadhaarError, setAadhaarError] = useState("");
  const [constituencyError, setConstituencyError] = useState("");

  // Touched state
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    epic: false,
    aadhaar: false,
    constituency: false,
  });

  // Helper functions to compute errors
  const getFirstNameError = (value, isTouched) => {
    if (!isTouched) return "";
    if (!value) return "First name is required";
    const validation = validateName(value, "First name");
    return validation.isValid ? "" : validation.error;
  };

  const getLastNameError = (value, isTouched) => {
    if (!isTouched) return "";
    if (!value) return "Last name is required";
    const validation = validateName(value, "Last name");
    return validation.isValid ? "" : validation.error;
  };

  const getEpicError = (value, isTouched) => {
    if (!isTouched) return "";
    if (!value) return "EPIC number is required";
    const validation = validateEPIC(value);
    return validation.isValid ? "" : validation.error;
  };

  const getAadhaarError = (value, isTouched) => {
    if (!isTouched) return "";
    if (!value) return "Aadhaar number is required";
    const validation = validateAadhaar(value);
    return validation.isValid ? "" : validation.error;
  };

  const getConstituencyError = (value, isTouched) => {
    if (!isTouched) return "";
    if (!value) return "Constituency is required";
    return "";
  };

  // Change handlers
  const handleFirstNameChange = (e) => {
    const value = castToName(e.target.value);
    setFirstName(value);
    if (touched.firstName) {
      setFirstNameError(getFirstNameError(value, true));
    }
  };

  const handleFirstNameBlur = () => {
    setTouched({ ...touched, firstName: true });
    setFirstNameError(getFirstNameError(firstName, true));
  };

  const handleLastNameChange = (e) => {
    const value = castToName(e.target.value);
    setLastName(value);
    if (touched.lastName) {
      setLastNameError(getLastNameError(value, true));
    }
  };

  const handleLastNameBlur = () => {
    setTouched({ ...touched, lastName: true });
    setLastNameError(getLastNameError(lastName, true));
  };

  const handleEpicChange = (e) => {
    const value = castToEPIC(e.target.value);
    setEpic(value);
    if (touched.epic) {
      setEpicError(getEpicError(value, true));
    }
  };

  const handleEpicBlur = () => {
    setTouched({ ...touched, epic: true });
    setEpicError(getEpicError(epic, true));
  };

  const handleAadhaarChange = (e) => {
    const value = castToAadhaar(e.target.value);
    setAadhaar(value);
    if (touched.aadhaar) {
      setAadhaarError(getAadhaarError(value, true));
    }
  };

  const handleAadhaarBlur = () => {
    setTouched({ ...touched, aadhaar: true });
    setAadhaarError(getAadhaarError(aadhaar, true));
  };

  const handleConstituencyChange = (e) => {
    const value = e.target.value;
    setConstituency(value);
    if (touched.constituency) {
      setConstituencyError(getConstituencyError(value, true));
    }
  };

  const handleConstituencyBlur = () => {
    setTouched({ ...touched, constituency: true });
    setConstituencyError(getConstituencyError(constituency, true));
  };

  // --- SYNC & LOGOUT LOGIC ---
  const handleSyncAndLogout = async () => {
    if (
      !confirm(
        "Confirm Sync & End Shift? This will upload all offline records."
      )
    )
      return;

    setIsSyncing(true);
    setStatus("INITIATING HANDSHAKE...");

    try {
      // 1. Fetch Local Data
      const offlineEvents = await getLocalEnrollments();

      if (offlineEvents.length > 0) {
        if (!isGoodConnection) {
          alert(isPoorConnection 
            ? "Cannot Sync: Connection too slow. Please wait for better connectivity."
            : "Cannot Sync: Network unavailable. Please connect to upload data.");
          setIsSyncing(false);
          setStatus(isPoorConnection ? "ERROR: POOR_CONNECTION" : "ERROR: NETWORK_UNAVAILABLE");
          return;
        }

        setStatus(`SYNCING ${offlineEvents.length} RECORDS...`);

        // 2. Send Batch to Server (RabbitMQ)
        const result = await submitEventBatch(offlineEvents);

        if (!result.success) {
          setStatus(`SYNC FAILED: ${result.failed} ERRORS`);
          alert(
            `Sync Failed. ${result.failed} records could not be uploaded. Check console.`
          );
          console.error("Sync Errors:", result.errors);
          setIsSyncing(false);
          return;
        }

        // 3. Clear Local Buffer on Success
        await clearLocalDB();
        setStatus("BUFFER CLEARED // SYNC COMPLETE");
      } else {
        setStatus("NO DATA TO SYNC // CLEAN EXIT");
      }

      // 4. Perform Logout
      await logoutAction();
    } catch (error) {
      console.error("Logout Pipeline Error:", error);
      setStatus("CRITICAL SYNC FAILURE");
      setIsSyncing(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched and validate
    const newTouched = {
      firstName: true,
      lastName: true,
      epic: true,
      aadhaar: true,
      constituency: true,
    };
    setTouched(newTouched);

    // Compute all errors
    const firstNameErr = getFirstNameError(firstName, true);
    const lastNameErr = getLastNameError(lastName, true);
    const epicErr = getEpicError(epic, true);
    const aadhaarErr = getAadhaarError(aadhaar, true);
    const constituencyErr = getConstituencyError(constituency, true);

    setFirstNameError(firstNameErr);
    setLastNameError(lastNameErr);
    setEpicError(epicErr);
    setAadhaarError(aadhaarErr);
    setConstituencyError(constituencyErr);

    // If validation fails, don't submit
    if (firstNameErr || lastNameErr || epicErr || aadhaarErr || constituencyErr) {
      return;
    }

    setLoading(true);

    // Normalize constituency to standard format
    const normalizedConstituency = normalizeZone(constituency) || constituency;

    const voterData = {
      firstName,
      lastName,
      epic,
      aadhaar,
      constituency: normalizedConstituency,
    };

    try {
      // Use PouchDB when connection is poor or unavailable
      if (!isGoodConnection) {
        const modeLabel = isPoorConnection ? "SLOW_CONNECTION" : "OFFLINE";
        setStatus(`STATUS: ${modeLabel} // Writing to PouchDB...`);
        const result = await saveVoterLocally({
          ...voterData,
          savedReason: isPoorConnection ? "HIGH_LATENCY" : "OFFLINE",
          savedLatency: latency,
        });
        if (result.success) {
          const shortId = result.id ? result.id.slice(-8) : "BUFFERED";
          setStatus(`SUCCESS: Local Block Created [${shortId}]`);
          // Reset form
          setFirstName("");
          setLastName("");
          setEpic("");
          setAadhaar("");
          setConstituency("");
          setTouched({
            firstName: false,
            lastName: false,
            epic: false,
            aadhaar: false,
            constituency: false,
          });
          setFirstNameError("");
          setLastNameError("");
          setEpicError("");
          setAadhaarError("");
          setConstituencyError("");
        } else {
          setStatus(`ERROR: ${result.error}`);
        }
      } else {
        setStatus(`STATUS: ONLINE (${latency}ms) // Dispatching to Broker...`);
        const result = await commitVoterUpdate(null, voterData);
        if (result.success) {
          setStatus("SUCCESS: Event Packet Anchored to Queue");
          // Reset form
          setFirstName("");
          setLastName("");
          setEpic("");
          setAadhaar("");
          setConstituency("");
          setTouched({
            firstName: false,
            lastName: false,
            epic: false,
            aadhaar: false,
            constituency: false,
          });
          setFirstNameError("");
          setLastNameError("");
          setEpicError("");
          setAadhaarError("");
          setConstituencyError("");
        } else {
          setStatus(`ERROR: ${result.error}`);
        }
      }
    } catch (err) {
      setStatus("CRITICAL: Pipeline Interrupted");
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setStatus("Ready to Register"), 4000);
    }
  };

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
              {isGoodConnection ? (
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-600 font-semibold">
                    Connected {latency !== null && `(${latency}ms)`}
                  </span>
                </div>
              ) : isPoorConnection ? (
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                  <span className="text-amber-600 font-semibold">
                    Slow Connection {latency !== null && `(${latency}ms)`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-red-600 font-semibold">
                    Disconnected
                  </span>
                </div>
              )}
              <div className="text-xs text-gray-500">
                Mode: {isGoodConnection ? "Online Sync" : "Local Buffer"}
              </div>
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
                className={navLinkStyle("/officer/register", pathname)}
              >
                Voter Enrollment
              </Link>
              <Link
                href="/officer/update"
                className={navLinkStyle("/officer/update", pathname)}
              >
                Update Records
              </Link>
              <Link
                href="/officer/local-buffer"
                className={navLinkStyle("/officer/local-buffer", pathname)}
              >
                Local Buffer
              </Link>
              <Link
                href="/officer/queue"
                className={navLinkStyle("/officer/queue", pathname)}
              >
                Sync Queue
              </Link>
            </div>

            <button
              onClick={handleSyncAndLogout}
              disabled={isSyncing}
              className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
            >
              {isSyncing ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Syncing...
                </>
              ) : (
                "Sync & Logout"
              )}
            </button>
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
              Voter Enrollment
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#000080] mb-2 border-b-4 border-[#FF9933] inline-block pb-2">
            Voter Enrollment
          </h1>
          <p className="text-gray-600 mt-4">
            Register new voters with offline support for field operations
          </p>
        </div>

        {/* Status Banner */}
        {status !== "Ready to Register" && (
          <div
            className={`mb-6 p-4 rounded border-l-4 ${
              status.includes("SUCCESS")
                ? "border-green-500 bg-green-50"
                : status.includes("ERROR") || status.includes("FAILED")
                ? "border-red-500 bg-red-50"
                : "border-blue-500 bg-blue-50"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                status.includes("SUCCESS")
                  ? "text-green-800"
                  : status.includes("ERROR") || status.includes("FAILED")
                  ? "text-red-800"
                  : "text-blue-800"
              }`}
            >
              {status}
            </p>
          </div>
        )}

        {/* Enrollment Form */}
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              <div>
                <h2 className="text-lg font-bold">New Voter Registration</h2>
                <p className="text-xs text-white/90">
                  Protocol v2.1 | {isGoodConnection ? "Online Mode" : isPoorConnection ? "Slow Mode" : "Offline Mode"}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleEnroll} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  required
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={handleFirstNameChange}
                  onBlur={handleFirstNameBlur}
                  maxLength={50}
                  className={`w-full px-4 py-3 border-2 rounded focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all text-gray-900 ${
                    firstNameError
                      ? "border-red-500 focus:border-red-500"
                      : touched.firstName && !firstNameError
                      ? "border-green-500 focus:border-green-500"
                      : "border-gray-300 focus:border-[#000080]"
                  }`}
                  placeholder="Enter first name"
                />
                {firstNameError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
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
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {firstNameError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  required
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={handleLastNameChange}
                  onBlur={handleLastNameBlur}
                  maxLength={50}
                  className={`w-full px-4 py-3 border-2 rounded focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all text-gray-900 ${
                    lastNameError
                      ? "border-red-500 focus:border-red-500"
                      : touched.lastName && !lastNameError
                      ? "border-green-500 focus:border-green-500"
                      : "border-gray-300 focus:border-[#000080]"
                  }`}
                  placeholder="Enter last name"
                />
                {lastNameError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
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
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {lastNameError}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                EPIC Number (Voter ID)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                required
                name="epic"
                type="text"
                value={epic}
                onChange={handleEpicChange}
                onBlur={handleEpicBlur}
                maxLength={12}
                className={`w-full px-4 py-3 border-2 rounded focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all text-gray-900 font-mono uppercase ${
                  epicError
                    ? "border-red-500 focus:border-red-500"
                    : touched.epic && !epicError
                    ? "border-green-500 focus:border-green-500"
                    : "border-gray-300 focus:border-[#000080]"
                }`}
                placeholder="ABC1234567"
              />
              {epicError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
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
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {epicError}
                </p>
              )}
              {!epicError && touched.epic && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
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
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Valid EPIC format
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Aadhaar Number
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                required
                name="aadhaar"
                type="text"
                value={aadhaar}
                onChange={handleAadhaarChange}
                onBlur={handleAadhaarBlur}
                maxLength={12}
                className={`w-full px-4 py-3 border-2 rounded focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all text-gray-900 font-mono ${
                  aadhaarError
                    ? "border-red-500 focus:border-red-500"
                    : touched.aadhaar && !aadhaarError
                    ? "border-green-500 focus:border-green-500"
                    : "border-gray-300 focus:border-[#000080]"
                }`}
                placeholder="1234 5678 9012"
              />
              {aadhaarError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
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
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {aadhaarError}
                </p>
              )}
              {!aadhaarError && touched.aadhaar && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
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
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Valid Aadhaar format
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Constituency
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                required
                name="constituency"
                value={constituency}
                onChange={handleConstituencyChange}
                onBlur={handleConstituencyBlur}
                className={`w-full px-4 py-3 border-2 rounded focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all text-gray-900 appearance-none bg-white cursor-pointer ${
                  constituencyError
                    ? "border-red-500 focus:border-red-500"
                    : touched.constituency && !constituencyError
                    ? "border-green-500 focus:border-green-500"
                    : "border-gray-300 focus:border-[#000080]"
                }`}
              >
                <option value="">Select Constituency</option>
                {ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
              {constituencyError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
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
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {constituencyError}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                disabled={loading}
                className={`w-full py-3 px-4 rounded font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  isGoodConnection
                    ? "bg-green-600 hover:bg-green-700"
                    : isPoorConnection
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-[#000080] hover:bg-[#FF9933]"
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Committing...
                  </>
                ) : (
                  <>
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
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    {isGoodConnection
                      ? "Submit to Ledger"
                      : isPoorConnection
                      ? "Save Locally (Slow Connection)"
                      : "Save to Local Buffer"}
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">
                {isGoodConnection
                  ? "Data will be directly committed to the central ledger"
                  : isPoorConnection
                  ? "Connection is slow. Data will be stored locally and synced when connection improves."
                  : "Data will be stored locally and synced when online"}
              </p>
            </div>
          </form>
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
                Latency-Aware Registration System
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">
                {isGoodConnection
                  ? `You have a stable connection (${latency}ms latency). All registrations will be directly sent to the central ledger via RabbitMQ with AES-256-GCM encryption.`
                  : isPoorConnection
                  ? `Your connection is slow (${latency}ms latency). Registrations will be stored locally and automatically synced when your connection improves.`
                  : "You are currently working offline. All registrations will be securely stored in your local IndexedDB buffer and automatically synced when you reconnect to the network."}
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
