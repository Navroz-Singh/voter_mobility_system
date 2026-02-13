"use client";

import React, { useState } from "react";
import Link from "next/link";

// Custom Icons matching the design system
const Icons = {
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Copy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  UserCog: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <circle cx="19" cy="11" r="2" />
      <path d="M19 8v1" />
      <path d="M19 13v1" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  MapPin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  AdminTools: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

export default function DemoGuidePage() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const CredentialBox = ({ label, value, id }) => (
    <div className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200 mt-2 hover:border-[#FF9933] transition-colors group">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">
          {label}
        </span>
        <code className="text-sm font-mono text-[#000080] font-bold">
          {value}
        </code>
      </div>
      <button
        onClick={() => copyToClipboard(value, id)}
        className="p-2 text-gray-400 group-hover:text-[#000080] hover:bg-gray-100 rounded transition-all"
        title="Copy to clipboard"
      >
        {copied === id ? (
          <span className="text-[#138808]">
            <Icons.CheckCircle />
          </span>
        ) : (
          <Icons.Copy />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
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
      <header className="bg-white border-b-4 border-[#FF9933] shadow-md sticky top-0 z-50">
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
                    V-LINK
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
            <Link
              href="/"
              className="text-sm font-medium text-[#000080] hover:text-[#FF9933] flex items-center gap-2 transition-colors"
            >
              Back to Home <Icons.ArrowRight />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero / Intro Section */}
      <section className="bg-linear-to-r from-[#FF9933]/10 via-white to-[#138808]/10 py-12 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-[#000080] mb-4">
            Interactive System Walkthrough
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Experience the complete V-LINK lifecycle. Follow the stages below to
            simulate the role of an Administrator, Field Officer, and Citizen.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* STAGE 1: ADMIN SETUP */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-[#FF9933] to-[#000080] p-6 text-white flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Icons.Shield />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Stage 1: Admin Setup</h2>
              <p className="text-sm text-white/90">
                Initial system check and login.
              </p>
            </div>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-10">
            <div>
              <h4 className="font-bold text-[#000080] mb-4 flex items-center gap-2 text-lg">
                <span className="bg-[#FF9933] text-white text-xs px-2 py-1 rounded">
                  STEP 1
                </span>
                Login Credentials
              </h4>
              <p className="text-gray-600 text-sm mb-6">
                Use the pre-provisioned administrator account.
              </p>
              <div className="space-y-1">
                <CredentialBox label="GOVERNMENT ID" value="ADMIN-001" id="admin-id" />
                <CredentialBox label="PASSWORD" value="password123" id="admin-pass" />
              </div>
              <div className="mt-8">
                <Link href="/admin" target="_blank" className="inline-flex items-center gap-2 bg-[#000080] text-white px-6 py-3 rounded hover:bg-[#FF9933] transition-colors font-medium shadow-md">
                  Open Admin Portal <Icons.ArrowRight />
                </Link>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#000080]">
              <h4 className="font-bold text-[#000080] mb-4">Initial Checks:</h4>
              <ul className="space-y-4 text-sm text-gray-700">
                <li className="flex gap-3 items-start">
                  <span className="text-[#138808] mt-0.5"><Icons.CheckCircle /></span>
                  <span>Ensure the dashboard loads correctly.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-[#138808] mt-0.5"><Icons.CheckCircle /></span>
                  <span>Verify the <strong>Conflicts</strong> tab is empty before starting operations.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* STAGE 2: OFFICER ENROLLMENT */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-[#000080] to-blue-600 p-6 text-white flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Icons.UserCog />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Stage 2: Field Enrollment</h2>
              <p className="text-sm text-white/90">
                Enroll a new citizen into the electoral roll.
              </p>
            </div>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-10">
            <div>
              <h4 className="font-bold text-[#000080] mb-4 flex items-center gap-2 text-lg">
                <span className="bg-[#FF9933] text-white text-xs px-2 py-1 rounded">
                  STEP 2
                </span>
                Officer Login
              </h4>
              <div className="space-y-1">
                <CredentialBox label="GOVERNMENT ID" value="OFFICER-402" id="officer-id" />
                <CredentialBox label="PASSWORD" value="password123" id="officer-pass" />
              </div>
              <div className="mt-8">
                <Link href="/officer" target="_blank" className="inline-flex items-center gap-2 bg-[#000080] text-white px-6 py-3 rounded hover:bg-[#FF9933] transition-colors font-medium shadow-md">
                  Open Officer Portal <Icons.ArrowRight />
                </Link>
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-bold text-[#000080] mb-2">New Voter Data:</h4>
              <p className="text-xs text-gray-600 mb-4">
                Go to "Enroll Voter" and use these details.
              </p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">First Name</label>
                    <div className="text-sm font-semibold text-gray-800">Rahul</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Last Name</label>
                    <div className="text-sm font-semibold text-gray-800">Dev</div>
                  </div>
                </div>
                <CredentialBox label="EPIC NUMBER (NEW)" value="VLINK1122334" id="epic-new" />
                <CredentialBox label="AADHAAR UID" value="123412346789" id="aadhaar-new" />
              </div>
            </div>
          </div>
        </div>

        {/* STAGE 3: VOTER ACTIVATION */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-[#138808] to-green-600 p-6 text-white flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Icons.User />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Stage 3: Voter Activation</h2>
              <p className="text-sm text-white/90">
                Claim the account and set a personal password.
              </p>
            </div>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-10">
            <div>
              <h4 className="font-bold text-[#000080] mb-4 flex items-center gap-2 text-lg">
                <span className="bg-[#FF9933] text-white text-xs px-2 py-1 rounded">
                  STEP 3
                </span>
                Claim Account
              </h4>
              <p className="text-gray-600 text-sm mb-6">
                Activate your <strong>Pending Claim</strong> account.
              </p>
              <div className="space-y-1">
                <CredentialBox label="YOUR EPIC NUMBER" value="VLINK1122334" id="voter-id" />
                <CredentialBox label="SET NEW PASSWORD" value="password123" id="voter-pass" />
              </div>
              <div className="mt-8">
                <Link href="/voter/register" target="_blank" className="inline-flex items-center gap-2 bg-[#138808] text-white px-6 py-3 rounded hover:bg-[#000080] transition-colors font-medium shadow-md">
                  Open Claim Page <Icons.ArrowRight />
                </Link>
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border-l-4 border-[#138808]">
              <h4 className="font-bold text-[#138808] mb-4">Verification:</h4>
              <ul className="space-y-4 text-sm text-gray-700">
                <li className="flex gap-3 items-start">
                  <span className="text-[#138808] mt-0.5"><Icons.CheckCircle /></span>
                  <span>Ensure you are auto-logged into the <strong>Voter Dashboard</strong> after claiming.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-[#138808] mt-0.5"><Icons.CheckCircle /></span>
                  <span>Verify profile status is <strong>Active</strong>.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* STAGE 4: RELOCATION REQUEST & APPROVAL */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-green-600 to-blue-600 p-6 text-white flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Icons.MapPin />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Stage 4: Relocation & Approval</h2>
              <p className="text-sm text-white/90">
                Voter requests move; Officer approves via blockchain queue.
              </p>
            </div>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-10">
            <div>
              <h4 className="font-bold text-[#000080] mb-4 flex items-center gap-2 text-lg">
                <span className="bg-[#FF9933] text-white text-xs px-2 py-1 rounded">
                  STEP 4A
                </span>
                Voter Request
              </h4>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-2"><span className="font-bold text-[#138808]">1.</span><span>Log in as Voter (VLINK1122334).</span></li>
                  <li className="flex gap-2"><span className="font-bold text-[#138808]">2.</span><span>Go to <strong>Relocate</strong> tab.</span></li>
                  <li className="flex gap-2"><span className="font-bold text-[#138808]">3.</span><span>Select Target Zone: <strong>Zone B - South Delhi</strong> and submit.</span></li>
                </ul>
              </div>
              <Link href="/voter" target="_blank" className="text-sm text-[#138808] font-semibold hover:underline flex items-center gap-1">
                Go to Voter Dashboard <Icons.ArrowRight />
              </Link>
            </div>
            <div>
              <h4 className="font-bold text-[#000080] mb-4 flex items-center gap-2 text-lg">
                <span className="bg-[#000080] text-white text-xs px-2 py-1 rounded">
                  STEP 4B
                </span>
                Officer Approval
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-2"><span className="font-bold text-[#000080]">1.</span><span>Log in as Officer (OFFICER-402).</span></li>
                  <li className="flex gap-2"><span className="font-bold text-[#000080]">2.</span><span>Go to <strong>Update Records</strong> tab.</span></li>
                  <li className="flex gap-2"><span className="font-bold text-[#000080]">3.</span><span>Search EPIC: <strong>VLINK1122334</strong>.</span></li>
                  <li className="flex gap-2"><span className="font-bold text-[#000080]">4.</span><span>Review request and click <strong>Commit Update to Queue</strong>.</span></li>
                </ul>
              </div>
              <Link href="/officer" target="_blank" className="text-sm text-[#000080] font-semibold hover:underline flex items-center gap-1">
                Go to Officer Dashboard <Icons.ArrowRight />
              </Link>
            </div>
          </div>
        </div>

        {/* STAGE 5: ADMIN ACTIONS (AUDIT, CONFLICTS, PRIVACY) */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Card Header - Final Admin Gradient */}
          <div className="bg-linear-to-r from-[#000080] to-[#FF9933] p-6 text-white flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Icons.AdminTools />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Stage 5: Admin Actions & Integrity Checks</h2>
              <p className="text-sm text-white/90">
                Perform final audits, resolve conflicts, and manage data privacy.
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {/* Section A: Audit Ledger */}
            <div className="p-8 grid md:grid-cols-2 gap-10">
              <div>
                <h4 className="font-bold text-[#000080] mb-4 flex items-center gap-2 text-lg">
                  <span className="bg-[#000080] text-white text-xs px-2 py-1 rounded">TOPIC A</span>
                  Audit Ledger Verification
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Log in as Admin and navigate to the <strong>Audit Ledger</strong> page.
                  Click the "Verify Chain" button to cryptographically validate the blockchain history.
                </p>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 text-sm text-red-800">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <Icons.AlertTriangle /> Failure Simulation
                  </div>
                  If the database has been tampered with manually, the verification will fail, showing an error similar to the image on the right.
                </div>
              </div>
              {/* Image showing "Verification Failed" */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm flex items-center justify-center bg-gray-100 min-h-[200px]">
                <img 
                  src="/images/image.png" 
                  alt="Verification Failed Example" 
                  className="max-w-full h-auto object-cover" 
                />
              </div>
            </div>

            {/* Section B: Conflicts & Queue Errors */}
            <div className="p-8 bg-amber-50/50">
              <h4 className="font-bold text-[#000080] mb-4 flex items-center gap-2 text-lg">
                 <span className="bg-[#FF9933] text-white text-xs px-2 py-1 rounded">TOPIC B</span>
                 Conflict Resolution
              </h4>
              <p className="text-gray-600 text-sm mb-6">
                Navigate to the <strong>Conflicts</strong> page to handle system discrepancies.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded border border-amber-200 shadow-sm">
                   <h5 className="font-bold text-[#000080] mb-2 flex items-center gap-2">
                     <Icons.AlertTriangle /> Version Mismatch
                   </h5>
                   <p className="text-sm text-gray-600">Occurs when two officers try to update the same voter simultaneously based on outdated data.</p>
                   <div className="mt-3 text-xs font-semibold text-amber-700">Action: Choose "Keep Local" (retry) or "Keep Remote" (discard).</div>
                </div>
                <div className="bg-white p-4 rounded border border-amber-200 shadow-sm">
                   <h5 className="font-bold text-[#000080] mb-2 flex items-center gap-2">
                     <Icons.AlertTriangle /> Queue Processing Errors
                   </h5>
                   <p className="text-sm text-gray-600">Failures during data pushing/pulling from the RabbitMQ broker (e.g., network timeouts).</p>
                   <div className="mt-3 text-xs font-semibold text-amber-700">Action: Examine Dead Letter Queue logs and retry processing.</div>
                </div>
              </div>
            </div>

            {/* Section C: Privacy & Security */}
            <div className="p-8">
              <h4 className="font-bold text-[#000080] mb-4 flex items-center gap-2 text-lg">
                <span className="bg-[#138808] text-white text-xs px-2 py-1 rounded">TOPIC C</span>
                Privacy & Security
              </h4>
              <p className="text-gray-600 text-sm mb-6">
                Navigate to the <strong>Privacy</strong> page for high-security operations.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                 <div>
                    <h5 className="font-bold text-[#000080] mb-3 flex items-center gap-2">
                        <span className="text-red-600"><Icons.Lock /></span> Cryptographic Shredding (RTBF)
                    </h5>
                    <p className="text-sm text-gray-600 mb-4">
                        Permanently delete a voter's data by destroying their unique encryption key, rendering the ledger entries unreadable while preserving the chain.
                    </p>
                    <CredentialBox label="EPIC TO SHRED" value="VLINK1122334" id="shred-id" />
                 </div>
                 <div>
                    <h5 className="font-bold text-[#000080] mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                        Master Key Rotation
                    </h5>
                    <p className="text-sm text-gray-600">
                        A critical security procedure to re-encrypt all voter keys with a new master key. This is a resource-intensive background operation.
                    </p>
                    <div className="mt-4 bg-blue-50 text-blue-800 text-xs p-2 rounded border border-blue-100">
                        <strong>Note:</strong> Ensure system downtime before initiating rotation in production environments.
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#000080] text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold mb-2">
            © 2026 Election Commission of India. All Rights Reserved.
          </p>
          <p className="text-xs text-white/70">
            Content Owned, Updated and Maintained by Election Commission of India
          </p>
        </div>
      </footer>
    </div>
  );
}