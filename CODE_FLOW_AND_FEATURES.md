# V-LINK — Code Flow & Features

## Table of Contents
- [Roles & Entry Points](#roles-entry-points)
- [Key Feature Map](#key-feature-map)
- [File-by-File (Module) Tour](#file-tour)
- [Request/Response Examples](#request-response)

---

## 1. Roles & Entry Points <a name="roles-entry-points"/>

| Role     | Initial UI Path                | Features                                       |
|----------|-------------------------------|------------------------------------------------|
| Admin    | `/admin`                      | Ledger/audit, conflicts, privacy (RTBF)         |
| Officer  | `/officer`                    | Register/update voters, approve moves           |
| Voter    | `/voter`                      | Check status, request relocation, view result   |

---

## 2. Key Feature Map <a name="key-feature-map"/>

| Feature      | User Flow | Main Files & Functions                 |
|--------------|-----------|----------------------------------------|
| Register     | Officer   | `commitVoterUpdate()` in `officer.js` → Worker `upsert` |
| Relocate     | Voter     | `requestRelocationAction()` in `relocation.js` → direct DB (RelocationRequest, LedgerLog) |
| Update       | Officer   | `commitVoterUpdate()` in `officer.js` (with voter id) |
| Audit Log    | All       | Written in worker, UI via `/admin/audit/page.jsx`, checked by `hashVerification.js` |
| Conflict     | Admin     | Detected in Worker, logged as ConflictLog, resolved in `conflicts.js`, UI `/admin/conflicts` |
| Privacy (RTBF) | Admin     | `shredVoterDataAction()` in `privacy.js`, key deletion, `/admin/privacy` UI |
| Offline Sync | Officer   | `pouchdb.js`, `SyncManager.tsx`, `sync.js` |

---

## 3. File-by-File (Module) Tour <a name="file-tour"/>

### **A. UI Components & Pages**
- All UI entry points: `src/app/[role]/[...page].jsx`
- Example: `src/app/officer/register/page.jsx` — form for enrollment
- Admin tools: `src/app/admin/audit/page.jsx`, `src/app/admin/conflicts/page.jsx`, `src/app/admin/privacy/page.jsx`
- Sync/background: `src/components/SyncManager.tsx`

### **B. Actions (Business Logic)**
- `src/actions/officer.js`:
    - `commitVoterUpdate(voterId, updateData)` — Called by officer register/update, produces event packet.
    - `fetchVoterByEPIC(epicNumber)` — Officer UI voter lookup.
- `src/actions/sync.js`: Calls `sendToRelocationQueue`, batch and individual handlers for PouchDB.
- `src/actions/relocation.js`: Voter's relocation request logic.
- `src/actions/worker.js`: Helper to run/monitor ledger worker.
- `src/actions/privacy.js`: Privacy (key shredding) admin actions.
- `src/actions/audit.js` & `src/lib/hashVerification.js`: Chain integrity actions and verifiers (admin).
- `src/actions/conflicts.js`: Conflict resolving actions for admin UI.

### **C. Data Flow/Background Jobs**
- `src/workers/ledgerWorker.js`:
    - Listens to RabbitMQ, processes events via `user.upsert`, writes AuditLog
    - Handles `expected_version` (CAS
), throws conflicts, logs to ConflictLog if any CAS/transaction error.
    - Hashes audit entries, encrypts payloads (calls `encryption.js`)
- `src/lib/encryption.js`: All crypto logic (encryption, key management, shredding).
- `src/lib/pouchdb.js`: IndexedDB operations for offline/SyncManager.
- `src/lib/rabbitmq.js`: RabbitMQ communication helpers.
- `src/lib/db.js`: Prisma DB client (all server actions import this).

### **D. Database**
- `prisma/schema.prisma`: Models for User, AuditLog, RelocationRequest, EncryptionKey, ConflictLog.
- `prisma/seed.js`: Loads admin, officer, and test voter for initial testing.

---

## 4. Request/Response Trace <a name="request-response"/>

### A. Offline Registration (Officer)
- Officer fills form →
  - If OFFLINE: `saveVoterLocally()` (PouchDB), syncs later
  - If ONLINE: `commitVoterUpdate(null, voterData)` (officer.js)
    - Packs packet, sends to RabbitMQ: `sendToRelocationQueue()` (rabbitmq.js)
    - Worker: `user.upsert` (creates voter)
    - Worker: `auditLog.create` (hash linking, encrypted)

### B. Voter Relocation
- Voter requests move: `requestRelocationAction(formData)` (relocation.js)
    - Direct: creates `RelocationRequest`, writes initial AuditLog event (migration start)
    - Later: Officer approves via update path, processed as above

### C. Conflict
- If DB version mismatch or failure (CAS),
    - Worker logs to ConflictLog
    - Admin UI fetches via `getConflictsAction()`
    - Admin resolves: `keepLocalVersionAction()` or `acceptRemoteVersionAction()` (conflicts.js)

### D. Admin Features
- **Ledger Verification**: `/admin/audit` UI calls `verifyLedgerChainAction()` (audit.js) → hashVerification.js
- **Privacy Shredding**: `/admin/privacy` UI calls `shredVoterDataAction()` (privacy.js) → deletes encryption key

---

**See also:** [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md) for visual diagrams, and [TESTING_GUIDE.md](TESTING_GUIDE.md) for practical hands-on testing steps.

