"use server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { getOrCreateVoterKey } from "@/lib/encryption";

/**
 * Handles User Login (Voter, Officer, Admin)
 */
export async function loginAction(formData) {
  // 1. FORCE UPPERCASE to match the normalized storage format
  const identifier = formData.get("identifier")?.toUpperCase();
  const password = formData.get("password");

  if (!identifier || !password) {
    return { error: "Missing Credentials." };
  }

  // Find user by either EPIC (Voter) or Gov ID (Officer)
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ epic_number: identifier }, { gov_id: identifier }],
    },
  });

  if (!user || !user.password_hash) {
    return { error: "Identity not recognized." };
  }

  // Prevent login if the account is still in "Placeholder" mode
  const isPlaceholder =
    user.password_hash === "OFFLINE_PROVISIONED_PENDING_CLAIM" ||
    user.password_hash === "OFFLINE_ENROLLMENT_PENDING_CLAIM";

  if (isPlaceholder) {
    return {
      error: "Account pending claim. Please use the 'Claim Account' button.",
    };
  }

  // Standard Password Verification
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return { error: "Invalid Credentials." };

  // Create Session
  const cookieStore = await cookies();
  await cookieStore.set("vlink_session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  // Role-Based Redirects
  if (user.role === "ADMIN") redirect("/admin/audit");
  if (user.role === "OFFICER") redirect("/officer/register");
  if (user.role === "VOTER") redirect("/voter/authenticated/check");
}

/**
 * Handles "Claim Account" Logic (Formerly Register)
 */
export async function registerVoterAction(formData) {
  // 1. FORCE UPPERCASE to ensure we find the correct record
  const epic = formData.get("identifier")?.toUpperCase();
  const password = formData.get("password");

  if (!epic || !password) {
    return { error: "EPIC ID and New Password required." };
  }

  // Find the existing record created by the Officer
  const existingUser = await prisma.user.findUnique({
    where: { epic_number: epic },
  });

  if (!existingUser) {
    return {
      error: "No enrollment record found. Please visit a Field Officer.",
    };
  }

  // Security Check: Only allow claim if it's currently a placeholder
  const isPendingClaim =
    existingUser.password_hash === "OFFLINE_PROVISIONED_PENDING_CLAIM" ||
    existingUser.password_hash === "OFFLINE_ENROLLMENT_PENDING_CLAIM" || 
    existingUser.password_hash ==="PENDING_CLAIM";

  if (!isPendingClaim) {
    return { error: "Account already claimed. Please Sign In." };
  }

  // Hash the new password and update the user record
  const hashedPassword = await bcrypt.hash(password, 10);
  let userId = existingUser.id;

  try {
    await prisma.user.update({
      where: { epic_number: epic },
      data: {
        password_hash: hashedPassword, // Replace placeholder with real hash
        isVerified: true, // Mark account as verified by user
        status: "ACTIVE",
      },
    });

    // Create encryption key for the newly claimed user
    // This ensures data status checks work correctly
    try {
      await getOrCreateVoterKey(epic);
      console.log(`🔐 Encryption key created for newly claimed user: ${epic}`);
    } catch (keyError) {
      console.error("Failed to create encryption key during claim:", keyError);
      // Don't fail the entire claim process if key creation fails
      // The key will be created lazily on first data encryption
    }

    // Auto-Login the user immediately
    const cookieStore = await cookies();
    await cookieStore.set("vlink_session", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  } catch (err) {
    console.error("Claim Error:", err);
    return { error: "System Error: Could not finalize claim." };
  }

  // Redirect to Voter Dashboard
  redirect("/voter/authenticated/check");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("vlink_session");
  redirect("/");
}
