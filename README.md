Here is the updated, highly detailed `README.md` for your GitHub repository. It places the installation instructions first as requested and expands technically on the system's internal mechanics.

---

# V-LINK 2.1: Latency-Tolerant Voter Identity & Ledger System

V-LINK 2.1 is a distributed identity management platform designed for hostile network environments. It abandons traditional synchronous CRUD operations in favor of an **Event Sourcing** architecture that prioritizes data integrity and availability over immediate consistency.

This system solves three specific problems found in field operations:

1. **Network Intermittency:** It captures data seamlessly on 2G/3G connections using a client-side "Outbox" pattern.
2. **Data Tempering:** It secures every record with a cryptographic hash chain, making the database tamper-evident.
3. **Concurrency Conflicts:** It handles race conditions between offline and online officers using Optimistic Concurrency Control (CAS).

---

## 🛠️ Installation & Local Setup

Follow these steps to get the complete distributed system (Frontend, Worker, Message Broker, and Database) running on your local machine.

### 1. Prerequisites

Ensure you have the following installed:

* **Node.js** (v18+)
* **PostgreSQL** (Running on port 5432)
* **RabbitMQ** (Running on port 5672) - *If you don't have this, use Docker:*
```bash
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management

```



### 2. Dependencies

Clone the repository and install the required packages.

```bash
npm install

```

### 3. Environment Configuration

Create a `.env` file in the root directory. You must generate cryptographically strong random keys for the AES-256 encryption engine.

```env
# Database Connection (Adjust credentials as needed)
DATABASE_URL="postgresql://postgres:password@localhost:5432/voter_mobility?schema=public"

# Message Broker
RABBITMQ_URL="amqp://localhost:5672"

# Security Keys
# Run this in your terminal to generate keys:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
MASTER_ENCRYPTION_KEY="<paste_your_32_byte_key_here>"

# Run this for the IV:
# node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
MASTER_IV="<paste_your_16_byte_iv_here>"

```

### 4. Database Initialization

We use Prisma to manage the schema. Run the migrations to create the `User`, `AuditLog`, `EncryptionKey`, and `ConflictLog` tables.

```bash
# Apply migrations
npm run db:migrate

# Seed the database with default Admin and Officer accounts
npm run db:seed

```

### 5. Running the Application

The system consists of two distinct processes: the **Web Server** (Next.js) and the **Ledger Worker** (Node.js). You must run both.

**Recommended Method (Concurrent Run):**

```bash
npm run dev:all

```

**Manual Method (Separate Terminals):**

* **Terminal 1 (Frontend):** `npm run dev`
* **Terminal 2 (Worker):** `npm run worker`

Access the application at `http://localhost:3000`.

---

## 🏗️ Technical Architecture

### The "Low Internet" Strategy

Most "offline" apps just wait until you reconnect. V-LINK is different—it actively measures network **latency**.

* **Latency Probing:** The client polls `/api/ping` every 5 seconds.
* **Threshold Logic:** If latency is below 300ms, the app operates in "Online Mode." If latency spikes above 1000ms (or fails entirely), it switches to "Buffer Mode."
* **PouchDB Outbox:** In Buffer Mode, data is written to an IndexedDB store within the browser. A background `SyncManager` watches for a heartbeat and automatically "trickles" these records up to the server when the connection stabilizes.

### Asynchronous Write Pipeline

To prevent the UI from freezing during complex cryptographic operations, the web server does not write to the database directly.

1. **Ingest:** The Next.js API accepts the payload and immediately pushes it to a durable **RabbitMQ** queue (`relocation_ledger_queue_v7`).
2. **Acknowledge:** The client receives a "200 OK" instantly, even though the data hasn't been committed yet.
3. **Process:** A separate Worker process pulls the message. It performs the CPU-intensive tasks: AES-256 encryption of personal data and SHA-256 hashing of the audit entry.

### Cryptographic Ledger & Audit Chains

We implement a blockchain-like structure within PostgreSQL to ensure history cannot be rewritten.

* **The Chain:** Every `AuditLog` entry contains a `curr_hash` and a `prev_hash`.
* **The Math:** `Hash(N) = SHA256( Hash(N-1) + EncryptedPayload + IV + Signature )`.
* **Verification:** If a database administrator manually alters a row in SQL, the hash of that row will no longer match the `prev_hash` of the next row. The "Verify Chain" tool in the Admin Dashboard detects this break immediately.

---

## 📋 Operational Workflows

### 1. Officer Enrollment (Field Operations)

Officers use the `/officer` portal.

* **Offline:** If the network is down, the form saves to the Local Buffer. The officer can continue enrolling citizens without interruption.
* **Online:** Data flows to the queue. The worker performs an `upsert` operation, creating the user if they don't exist or updating them if they do.

### 2. Voter Relocation (State Machine)

Moving a voter involves a strict approval process governed by the ledger.

1. **Request:** The Voter logs in and selects a new constituency. This creates a `RelocationRequest` with status `PENDING`.
2. **Queueing:** The request waits in the database until an Officer reviews it.
3. **Approval:** The Officer logs in, sees the pending request, and commits the update.
4. **Finalization:** The Worker processes the update message. It updates the `User` record, writes a `RELOCATION_COMMIT` event to the ledger, and finally marks the request as `APPROVED`.

### 3. Admin Integrity Actions

The `/admin` portal provides low-level control over the system's data guarantees.

* **Verify Chain Integrity:** Runs a server-side process that iterates through the entire audit log, re-calculating hashes to prove no data has been tampered with.
* **Conflict Resolution:** If the Worker detects a version mismatch (e.g., an offline update trying to overwrite a newer online update), it logs a conflict. The Admin can choose to **Keep Local** (force the retry) or **Keep Remote** (discard the stale packet).
* **Cryptographic Shredding:** To comply with RTBF (Right to Be Forgotten), we cannot delete the audit log rows because that would break the hash chain. Instead, we delete the **Encryption Key** associated with that voter. The data remains in the ledger but becomes mathematically unreadable static.

---

## 🧪 Interactive Demo Guide

To facilitate testing without needing to memorize credentials, the application includes a live guide.

1. Navigate to `http://localhost:3000`.
2. Click **"Start Interactive Demo Guide"**.
3. This page provides a split-screen workflow with copy-paste buttons for:
* **Admin:** `ADMIN-001`
* **Officer:** `OFFICER-402`
* **Voter:** `VLINK0000000` (This test user represents a newly enrolled citizen).



Use this guide to simulate the full lifecycle: **Admin Audit -> Officer Enrollment -> Voter Claim -> Relocation Request -> Officer Approval -> Final Audit.**