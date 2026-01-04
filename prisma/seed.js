import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // 1. Create System Admin
  const admin = await prisma.user.upsert({
    where: { gov_id: "ADMIN-001" },
    update: {},
    create: {
      gov_id: "ADMIN-001",
      password_hash: password,
      role: "ADMIN",
      firstName: "SYSTEM",
      lastName: "ADMINISTRATOR",
    },
  });

  // 2. Create Polling Officer
  const officer = await prisma.user.upsert({
    where: { gov_id: "OFFICER-402" },
    update: {},
    create: {
      gov_id: "OFFICER-402",
      password_hash: password,
      role: "OFFICER",
      firstName: "VAIBHAV",
      lastName: "SHARMA",
      constituency: "ZONE B - SOUTH DELHI",
    },
  });

  // 3. Create a Verified Voter
  const voter = await prisma.user.upsert({
    where: { epic_number: "VLINK12345" },
    update: {},
    create: {
      epic_number: "VLINK12345",
      aadhaar_uid: "1234-5678-9012",
      password_hash: password,
      role: "VOTER",
      firstName: "ADITI",
      lastName: "SHARMA",
      constituency: "ZONE B - SOUTH DELHI",
      isVerified: true,
    },
  });

  console.log({ admin, officer, voter });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
