"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { loginAction } from "@/actions/auth";
import {
  validateGovID,
  validatePassword,
  validateLoginCredentials,
  castToGovID,
} from "@/lib/validation";

export default function GovernmentLogin() {
  const [govId, setGovId] = useState("");
  const [password, setPassword] = useState("");
  const [govIdError, setGovIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({ govId: false, password: false });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // Determine role based on the URL path
  const isAdmin = pathname.includes("admin");
  const roleTitle = isAdmin ? "System Admin" : "Polling Officer";
  const roleType = isAdmin ? "ADMIN" : "OFFICER";

  // Helper function to compute Gov ID error
  const getGovIdError = (value, isTouched) => {
    if (!isTouched) return "";
    if (!value) return "Government ID is required";
    const validation = validateGovID(value);
    return validation.isValid ? "" : validation.error;
  };

  // Helper function to compute password error
  const getPasswordError = (value, isTouched) => {
    if (!isTouched) return "";
    if (!value) return "Password is required";
    const validation = validatePassword(value, false);
    return validation.isValid ? "" : validation.error;
  };

  const handleGovIdChange = (e) => {
    const value = e.target.value;
    const casted = castToGovID(value);
    setGovId(casted);
    if (touched.govId) {
      setGovIdError(getGovIdError(casted, true));
    }
  };

  const handleGovIdBlur = () => {
    setTouched({ ...touched, govId: true });
    setGovIdError(getGovIdError(govId, true));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setPasswordError(getPasswordError(value, true));
    }
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    setPasswordError(getPasswordError(password, true));
  };

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);

    // Mark all fields as touched and validate
    const newTouched = { govId: true, password: true };
    setTouched(newTouched);

    // Compute errors
    const govIdErr = getGovIdError(govId, true);
    const passwordErr = getPasswordError(password, true);
    setGovIdError(govIdErr);
    setPasswordError(passwordErr);

    // If validation fails, don't submit
    if (govIdErr || passwordErr) {
      return;
    }

    setIsLoading(true);

    // Create form data
    const formData = new FormData();
    formData.append("role", roleType);
    formData.append("gov_id", govId);
    formData.append("identifier", govId);
    formData.append("password", password);

    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

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
                    Voter Ledger & Identity Network
                  </div>
                  <div className="text-xs text-gray-500">
                    Election Commission of India
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#FF9933] to-[#000080] p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div>
                  <h1 className="text-2xl font-bold">{roleTitle}</h1>
                  <p className="text-sm text-white/90">Secure Login Portal</p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-8">
              {/* Security Notice */}
              <div className="bg-blue-50 border-l-4 border-[#000080] p-4 mb-6">
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
                    This is a secure government portal. Please enter your
                    authorized credentials to proceed.
                  </p>
                </div>
              </div>

              {/* SERVER ERROR DISPLAY */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
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
                      className="text-red-500 flex-shrink-0 mt-0.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-red-800 mb-1">
                        Authentication Failed
                      </p>
                      <p className="text-xs text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service ID / Government ID
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    name="gov_id"
                    type="text"
                    value={govId}
                    onChange={handleGovIdChange}
                    onBlur={handleGovIdBlur}
                    required
                    maxLength={20}
                    className={`w-full px-4 py-3 border-2 rounded focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all text-gray-900 uppercase ${
                      govIdError
                        ? "border-red-500 focus:border-red-500"
                        : touched.govId && !govIdError
                        ? "border-green-500 focus:border-green-500"
                        : "border-gray-300 focus:border-[#000080]"
                    }`}
                    placeholder="GOV-XXXX-XXXX"
                  />
                  {govIdError && (
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
                      {govIdError}
                    </p>
                  )}
                  {!govIdError && touched.govId && (
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
                      Valid Government ID format
                    </p>
                  )}
                  {!touched.govId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Format: Alphanumeric with hyphens (e.g., GOV-XXXX-XXXX)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all text-gray-900 ${
                      passwordError
                        ? "border-red-500 focus:border-red-500"
                        : touched.password && !passwordError
                        ? "border-green-500 focus:border-green-500"
                        : "border-gray-300 focus:border-[#000080]"
                    }`}
                    placeholder="Enter your password"
                  />
                  {passwordError && (
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
                      {passwordError}
                    </p>
                  )}
                  {!passwordError && touched.password && (
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
                      Password is valid
                    </p>
                  )}
                  {!touched.password && (
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your secure password (min. 8 characters)
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded font-semibold text-white transition-all ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#000080] hover:bg-[#FF9933] shadow-md hover:shadow-lg"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      Authenticating...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Additional Links */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <a
                    href="#"
                    className="text-[#000080] hover:text-[#FF9933] font-medium"
                  >
                    Forgot Password?
                  </a>
                  <a
                    href="#"
                    className="text-[#000080] hover:text-[#FF9933] font-medium"
                  >
                    Need Help?
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-yellow-800 mb-1">
                  Security Notice
                </p>
                <p className="text-xs text-yellow-700 leading-relaxed">
                  Unauthorized access is strictly prohibited under the IT Act.
                  All sessions are logged on the immutable ledger for audit
                  purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#000080] font-medium transition-colors"
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
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

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
