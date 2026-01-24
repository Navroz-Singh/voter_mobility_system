"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { fetchVoterByEPIC, commitVoterUpdate } from "@/actions/officer";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import {
  validateEPIC,
  validateName,
  castToEPIC,
  castToName,
} from "@/lib/validation";
import { ZONES, normalizeZone } from "@/lib/zones";

export default function OfficerUpdate() {
  const [searchId, setSearchId] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchTouched, setSearchTouched] = useState(false);
  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const { isGoodConnection, isPoorConnection, latency } = useNetworkStatus();

  // Form state (for update form)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [constituency, setConstituency] = useState("");

  // Error state
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [constituencyError, setConstituencyError] = useState("");

  // Touched state
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    constituency: false,
  });

  // Helper functions to compute errors
  const getSearchError = (value, isTouched) => {
    if (!isTouched) return "";
    if (!value) return "EPIC number is required";
    const validation = validateEPIC(value);
    return validation.isValid ? "" : validation.error;
  };

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

  const getConstituencyError = (value, isTouched) => {
    if (!isTouched) return "";
    if (!value) return "Constituency is required";
    return "";
  };

  // Search handlers
  const handleSearchChange = (e) => {
    const value = castToEPIC(e.target.value);
    setSearchId(value);
    if (searchTouched) {
      setSearchError(getSearchError(value, true));
    }
  };

  const handleSearchBlur = () => {
    setSearchTouched(true);
    setSearchError(getSearchError(searchId, true));
  };

  // Form handlers
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

  const handleLookup = async (e) => {
    e.preventDefault();
    
    // Mark search as touched and validate
    setSearchTouched(true);
    const searchErr = getSearchError(searchId, true);
    setSearchError(searchErr);

    // If validation fails, don't search
    if (searchErr) {
      return;
    }

    // Check connection before attempting lookup
    if (!isGoodConnection) {
      alert(isPoorConnection 
        ? `Connection too slow (${latency}ms). Please wait for better connectivity.`
        : "No network connection. Cannot search records.");
      return;
    }

    setLoading(true);
    try {
      // 1. Execute Search against the Mutable Roll
      const result = await fetchVoterByEPIC(searchId);

      if (result.success) {
        setVoter(result.voter);
        // Populate form with voter data
        setFirstName(result.voter.firstName || "");
        setLastName(result.voter.lastName || "");
        setConstituency(
          result.voter.relocationRequests?.[0]?.toZone ||
          result.voter.constituency ||
          ""
        );
        // Reset touched state for form
        setTouched({
          firstName: false,
          lastName: false,
          constituency: false,
        });
        setFirstNameError("");
        setLastNameError("");
        setConstituencyError("");
      } else {
        // 2. Clear state if no subject is found
        setVoter(null);
        setFirstName("");
        setLastName("");
        setConstituency("");
        alert(result.error || "EPIC Record Not Found");
      }
    } catch (error) {
      console.error("Lookup Pipeline Error:", error);
      alert("Critical: System failed to query central ledger.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched and validate
    const newTouched = {
      firstName: true,
      lastName: true,
      constituency: true,
    };
    setTouched(newTouched);

    // Compute all errors
    const firstNameErr = getFirstNameError(firstName, true);
    const lastNameErr = getLastNameError(lastName, true);
    const constituencyErr = getConstituencyError(constituency, true);

    setFirstNameError(firstNameErr);
    setLastNameError(lastNameErr);
    setConstituencyError(constituencyErr);

    // If validation fails, don't submit
    if (firstNameErr || lastNameErr || constituencyErr) {
      return;
    }

    // Check connection before attempting commit
    if (!isGoodConnection) {
      alert(isPoorConnection 
        ? `Connection too slow (${latency}ms). Cannot commit updates. Please wait for better connectivity.`
        : "No network connection. Cannot commit updates.");
      return;
    }

    // Normalize constituency to standard format
    const normalizedConstituency = normalizeZone(constituency) || constituency;

    const data = {
      firstName,
      lastName,
      constituency: normalizedConstituency,
    };

    setLoading(true);
    const result = await commitVoterUpdate(voter.id, data);
    if (result.success) {
      alert("Ledger Synchronized Successfully");
      setVoter(null);
      setSearchId("");
      setFirstName("");
      setLastName("");
      setConstituency("");
      setSearchTouched(false);
      setTouched({
        firstName: false,
        lastName: false,
        constituency: false,
      });
      setSearchError("");
      setFirstNameError("");
      setLastNameError("");
      setConstituencyError("");
    } else {
      alert(result.error);
    }
    setLoading(false);
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
                {isGoodConnection ? "Real-time Updates" : "Updates Paused"}
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
              Update Records
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#000080] mb-2 border-b-4 border-[#FF9933] inline-block pb-2">
            Update Voter Records
          </h1>
          <p className="text-gray-600 mt-4">
            Search and modify existing voter information in the central ledger
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <div>
                <h2 className="text-lg font-bold">Step 1: Search Ledger</h2>
                <p className="text-xs text-white/90">
                  Enter EPIC number to retrieve voter details
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleLookup} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchId}
                  onChange={handleSearchChange}
                  onBlur={handleSearchBlur}
                  maxLength={12}
                  placeholder="Enter EPIC / Voter ID"
                  className={`w-full px-4 py-3 border-2 rounded focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all text-gray-900 font-mono uppercase ${
                    searchError
                      ? "border-red-500 focus:border-red-500"
                      : searchTouched && !searchError
                      ? "border-green-500 focus:border-green-500"
                      : "border-gray-300 focus:border-[#000080]"
                  }`}
                />
                {searchError && (
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
                    {searchError}
                  </p>
                )}
              </div>
              <button
                disabled={loading || !isGoodConnection}
                className={`px-6 py-3 text-white rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  isGoodConnection 
                    ? "bg-[#000080] hover:bg-[#FF9933]" 
                    : "bg-gray-400 cursor-not-allowed"
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
                    Searching...
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
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Search
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Update Form */}
        <div
          className={`transition-all duration-500 ${
            voter ? "opacity-100" : "opacity-40 pointer-events-none"
          }`}
        >
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#FF9933] to-[#000080] p-4 text-white">
              <div className="flex items-center justify-between">
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
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <div>
                    <h2 className="text-lg font-bold">
                      Step 2: Modify Records
                    </h2>
                    <p className="text-xs text-white/90">
                      Update voter information and submit changes
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white/20 rounded text-xs font-semibold">
                  Version: {voter?.version || "---"}
                </span>
              </div>
            </div>

            <form onSubmit={handleCommit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
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
                  Constituency
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
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

                {voter?.relocationRequests?.[0] && (
                  <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
                    <div className="flex items-start gap-2">
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
                        className="text-amber-600 flex-shrink-0 mt-0.5"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <div>
                        <p className="text-xs font-semibold text-amber-800">
                          Pending Relocation Detected
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Target: {voter.relocationRequests[0].toZone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !isGoodConnection}
                  className={`w-full py-3 px-4 text-white rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    isGoodConnection
                      ? "bg-[#000080] hover:bg-[#FF9933]"
                      : "bg-gray-400 cursor-not-allowed"
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
                      Committing to Ledger...
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
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Commit Update to Queue
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-500 mt-3">
                  Transaction Hash: {voter?.id?.substring(0, 16)}...
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Info Section */}
        {!voter && (
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
                  How to Update Records
                </p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  First, search for a voter using their EPIC number. Once
                  found, you can modify their details and submit the changes to
                  the processing queue. All updates maintain version control
                  and are logged in the immutable audit ledger.
                </p>
              </div>
            </div>
          </div>
        )}
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
