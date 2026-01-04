-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VOTER', 'OFFICER', 'ADMIN');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VOTER',
    "epic_number" TEXT,
    "aadhaar_uid" TEXT,
    "gov_id" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "constituency" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "encrypted_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relocation_requests" (
    "id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "fromZone" TEXT NOT NULL,
    "toZone" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "officerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relocation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "immutable_ledger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "encrypted_payload" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "prev_hash" TEXT NOT NULL,
    "curr_hash" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "immutable_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encryption_keys" (
    "voter_id" TEXT NOT NULL,
    "encrypted_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "encryption_keys_pkey" PRIMARY KEY ("voter_id")
);

-- CreateTable
CREATE TABLE "ConflictLog" (
    "id" TEXT NOT NULL,
    "epic_number" TEXT NOT NULL,
    "original_payload" JSONB NOT NULL,
    "conflict_reason" TEXT NOT NULL,
    "error_message" TEXT,
    "expected_version" INTEGER,
    "actual_version" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConflictLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_epic_number_key" ON "users"("epic_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_aadhaar_uid_key" ON "users"("aadhaar_uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_gov_id_key" ON "users"("gov_id");

-- CreateIndex
CREATE UNIQUE INDEX "immutable_ledger_curr_hash_key" ON "immutable_ledger"("curr_hash");

-- CreateIndex
CREATE INDEX "ConflictLog_status_idx" ON "ConflictLog"("status");

-- AddForeignKey
ALTER TABLE "relocation_requests" ADD CONSTRAINT "relocation_requests_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "immutable_ledger" ADD CONSTRAINT "immutable_ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
