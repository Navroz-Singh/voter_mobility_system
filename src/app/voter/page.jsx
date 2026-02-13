"use client";
import Link from "next/link";
import { useActionState, useState, startTransition } from "react";
import { loginAction, registerVoterAction } from "@/actions/auth";
import {
  validateEPIC,
  validatePassword,
  validateLoginCredentials,
  validateClaimCredentials,
  castToEPIC,
} from "@/lib/validation";

export default function VoterAuth() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({ identifier: false, password: false });

  const [error, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const intent = formData.get("intent");

      // Intent 'claim' now triggers the registration/claim logic
      const result =
        intent === "claim"
          ? await registerVoterAction(formData)
          : await loginAction(formData);

      return result?.error || null;
    },
    null
  );

  // Helper function to compute EPIC error
  const getIdentifierError = (value, isTouched) => {
    if (!isTouched) return "";
    if (!value) return "EPIC number is required";
    const validation = validateEPIC(value);
    return validation.isValid ? "" : validation.error;
  };

  // Helper function to compute password error
  const getPasswordError = (value, isTouched, isClaim = false) => {
    if (!isTouched) return "";
    if (!value) return "Password is required";
    const validation = validatePassword(value, isClaim);
    return validation.isValid ? "" : validation.error;
  };

  const handleIdentifierChange = (e) => {
    const value = e.target.value;
    const casted = castToEPIC(value);
    setIdentifier(casted);
    if (touched.identifier) {
      setIdentifierError(getIdentifierError(casted, true));
    }
  };

  const handleIdentifierBlur = () => {
    setTouched({ ...touched, identifier: true });
    setIdentifierError(getIdentifierError(identifier, true));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setPasswordError(getPasswordError(value, true, false));
    }
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    setPasswordError(getPasswordError(password, true, false));
  };

  const handleSubmit = async (e, intent) => {
    e.preventDefault();
    
    // Mark all fields as touched and validate
    const newTouched = { identifier: true, password: true };
    setTouched(newTouched);

    // Compute errors based on intent
    const isClaim = intent === "claim";
    const identifierErr = getIdentifierError(identifier, true);
    const passwordErr = getPasswordError(password, true, isClaim);
    
    setIdentifierError(identifierErr);
    setPasswordError(passwordErr);

    // If validation fails, don't submit
    if (identifierErr || passwordErr) {
      return;
    }

    // Create form data and submit
    const formData = new FormData();
    formData.append("identifier", identifier);
    formData.append("password", password);
    formData.append("intent", intent);

    startTransition(() => {
      formAction(formData);
    });
  };

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
        <div className="w-full max-w-lg">
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <div>
                  <h1 className="text-2xl font-bold">Voter Portal</h1>
                  <p className="text-sm text-white/90">
                    Identity Management Gateway
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-8">
              {/* Information Notice */}
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
                  <div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      <strong>New Users:</strong> If you have ve been registered by a
                      field officer, use Claim Account to set your password.
                      <br />
                      <strong>Existing Users:</strong> Use Sign In to access
                      your voter dashboard.
                    </p>
                  </div>
                </div>
              </div>

              {/* SERVER ERROR MESSAGE DISPLAY */}
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

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    EPIC Number (Voter ID)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    name="identifier"
                    type="text"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    onBlur={handleIdentifierBlur}
                    required
                    maxLength={12}
                    className={`w-full px-4 py-3 border-2 rounded focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all text-gray-900 font-mono uppercase ${
                      identifierError
                        ? "border-red-500 focus:border-red-500"
                        : touched.identifier && !identifierError
                        ? "border-green-500 focus:border-green-500"
                        : "border-gray-300 focus:border-[#000080]"
                    }`}
                    placeholder="ABC1234567"
                  />
                  {identifierError && (
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
                      {identifierError}
                    </p>
                  )}
                  {!identifierError && touched.identifier && (
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
                  {!touched.identifier && (
                    <p className="text-xs text-gray-500 mt-1">
                      Format: VLINK followed by 7 digits (e.g., VLINK1234567)
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
                      New users: Enter the password you wish to set (min. 8 characters)
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  {/* SIGN IN BUTTON */}
                  <button
                    onClick={(e) => handleSubmit(e, "login")}
                    disabled={isPending}
                    className="py-3 px-4 border-2 border-[#000080] text-[#000080] rounded font-semibold hover:bg-[#000080] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
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
                        Verifying...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  {/* CLAIM ACCOUNT BUTTON */}
                  <button
                    onClick={(e) => handleSubmit(e, "claim")}
                    disabled={isPending}
                    className="py-3 px-4 bg-[#FF9933] text-white rounded font-semibold hover:bg-[#000080] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
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
                      </span>
                    ) : (
                      "Claim Account"
                    )}
                  </button>
                </div>
              </div>

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
                    ID Retrieval Help
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
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
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-yellow-800 mb-1">
                  Need Assistance?
                </p>
                <p className="text-xs text-yellow-700 leading-relaxed">
                  If you are unable to access your account or need to retrieve
                  your EPIC number, please contact your nearest Election
                  Commission office or call our helpline at 1800-XXX-XXXX.
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
