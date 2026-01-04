# V-LINK 2.1 Setup & Testing Guide

## 🚀 Quick Setup (First Time)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables
Create a `.env` file in the root directory:

```env
# PostgreSQL Database
DATABASE_URL="postgresql://username:password@localhost:5432/voter_mobility?schema=public"

# RabbitMQ (optional, defaults to localhost)
RABBITMQ_URL="amqp://localhost:5672"

# Master Encryption Key (generate a random 32-byte hex string)
MASTER_ENCRYPTION_KEY="your-32-byte-hex-key-here"
MASTER_IV="your-16-byte-hex-iv-here"
```

**Generate encryption keys:**
```bash
node -e "console.log('MASTER_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('MASTER_IV=' + require('crypto').randomBytes(16).toString('hex'))"
```

### Step 3: Create Database
Make sure PostgreSQL is running, then create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE voter_mobility;

# Exit
\q
```

### Step 4: Run Migrations (Create Tables)
```bash
npm run db:migrate
```

This will:
- Create all database tables (`users`, `relocation_requests`, `immutable_ledger`, `encryption_keys`, `conflict_log`)
- Generate Prisma Client

### Step 5: Seed Test Data
```bash
npm run db:seed
```

This creates:
- **Admin User**: `ADMIN-001` / `password123`
- **Officer User**: `OFFICER-402` / `password123`
- **Test Voter**: `VLINK12345` / `password123`

### Step 6: Start Services

**Terminal 1: Start RabbitMQ** (if not running as service)
```bash
# Using Docker:
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Or install RabbitMQ locally and run:
rabbitmq-server
```

**Terminal 2: Start Next.js + Worker**
```bash
npm run dev:all
```

This starts:
- Next.js dev server on `http://localhost:3000`
- Ledger Worker (processes RabbitMQ messages)

---

## 🧪 Testing the Project

### Test User Credentials

| Role | Identifier | Password | Purpose |
|------|------------|----------|---------|
| **Admin** | `ADMIN-001` | `password123` | Access admin dashboard |
| **Officer** | `OFFICER-402` | `password123` | Register/update voters |
| **Voter** | `VLINK12345` | `password123` | Request relocation |

---

## 📋 Testing Scenarios

### Scenario 1: Officer Registration (New Voter)

1. **Login as Officer**
   - Go to `http://localhost:3000/officer`
   - Login: `OFFICER-402` / `password123`

2. **Register New Voter**
   - Navigate to "Enroll" tab
   - Fill form:
     - First Name: `RAHUL`
     - Last Name: `KUMAR`
     - EPIC Number: `EPIC001`
     - Aadhaar: `1111-2222-3333`
     - Constituency: `ZONE A - NORTH DELHI`
   - Click "Direct Ledger Commit" (if online)
   - Or "Store in Local Buffer" (if offline)

3. **Verify in Database**
   ```bash
   npm run db:studio
   # Check `users` table for new entry
   ```

### Scenario 2: Voter Relocation Request

1. **Login as Voter**
   - Go to `http://localhost:3000/voter`
   - Login: `VLINK12345` / `password123`

2. **Request Relocation**
   - Navigate to "Relocate" tab
   - Select target zone: `Zone A - North Delhi`
   - Click "Request Relocation"

3. **Verify Request**
   - Check `relocation_requests` table (status: `PENDING`)
   - Check `immutable_ledger` table (event: `RELOCATION_INITIATED`)

### Scenario 3: Officer Approves Relocation

1. **Login as Officer**
   - Login: `OFFICER-402` / `password123`

2. **Update Voter**
   - Go to "Update" tab
   - Search EPIC: `VLINK12345`
   - Update constituency to match relocation request
   - Click "Commit Update to Queue"

3. **Verify Processing**
   - Check RabbitMQ queue (should process message)
   - Check `relocation_requests` table (status: `PROCESSING`)
   - Check `immutable_ledger` table (new entry created)

### Scenario 4: Admin Audit & Privacy

1. **Login as Admin**
   - Go to `http://localhost:3000/admin`
   - Login: `ADMIN-001` / `password123`

2. **Verify Ledger Integrity**
   - Go to "Ledger" tab
   - Click "Verify Chain Integrity"
   - Should show all entries verified

3. **Check Conflicts**
   - Go to "Conflicts" tab
   - View any version mismatches

4. **Test Privacy Shredding**
   - Go to "Privacy" tab
   - Enter EPIC: `VLINK12345`
   - Click "Shred Data"
   - Verify encryption key deleted

### Scenario 5: Offline Mode (PouchDB)

1. **Disconnect Internet** (or stop RabbitMQ)

2. **Register Voter Offline**
   - Login as Officer
   - Register new voter
   - Should save to PouchDB (browser IndexedDB)

3. **Reconnect Internet**

4. **Auto-Sync**
   - SyncManager automatically syncs when online
   - Check RabbitMQ queue for messages
   - Verify voter created in database

---

## 🔧 Database Commands

### Reset Database (Fresh Start)
```bash
# Drop all tables and recreate
npx prisma migrate reset

# This will also run seed automatically
```

### View Database
```bash
npm run db:studio
# Opens Prisma Studio at http://localhost:5555
```

### Create New Migration
```bash
# After changing schema.prisma
npm run db:migrate
```

### Generate Prisma Client
```bash
npm run db:generate
```

---

## 🐛 Troubleshooting

### Error: "Table does not exist"
**Solution:**
```bash
npm run db:migrate
```

### Error: "Prisma Client not generated"
**Solution:**
```bash
npm run db:generate
```

### Error: "RabbitMQ connection failed"
**Solution:**
1. Check if RabbitMQ is running: `docker ps` or `rabbitmqctl status`
2. Verify connection URL in `.env`
3. Check port 5672 is open

### Error: "Database connection failed"
**Solution:**
1. Verify PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Test connection: `psql $DATABASE_URL`

---

## 📊 Monitoring

### RabbitMQ Management UI
- URL: `http://localhost:15672`
- Default credentials: `guest` / `guest`
- View queues, messages, connections

### Database Queries
```bash
# Connect to database
psql $DATABASE_URL

# View all users
SELECT id, epic_number, firstName, lastName, role, version FROM users;

# View audit log
SELECT id, eventType, timestamp, curr_hash FROM immutable_ledger ORDER BY timestamp DESC LIMIT 10;

# View conflicts
SELECT id, epic_number, conflict_reason, status FROM conflict_log WHERE status = 'PENDING';
```

---

## ✅ Testing Checklist

- [ ] Database tables created
- [ ] Seed data loaded
- [ ] RabbitMQ running
- [ ] Worker processing messages
- [ ] Officer can register voters
- [ ] Voter can request relocation
- [ ] Officer can approve relocation
- [ ] Admin can verify ledger
- [ ] Admin can shred data
- [ ] Offline mode works (PouchDB)
- [ ] Auto-sync works

---

## 🎯 Quick Test Script

```bash
# Complete setup
npm install
npm run db:setup  # Migrate + Seed

# Start services
npm run dev:all

# In another terminal, test API
curl http://localhost:3000/api/admin/ledger
```

---

## 📝 Custom Test Data

Edit `prisma/seed.js` to add your own test users:

```javascript
// Add more test voters
const voter2 = await prisma.user.upsert({
  where: { epic_number: "YOUR_EPIC" },
  update: {},
  create: {
    epic_number: "YOUR_EPIC",
    aadhaar_uid: "YOUR_AADHAAR",
    password_hash: await bcrypt.hash("your_password", 10),
    role: "VOTER",
    firstName: "YOUR_NAME",
    lastName: "YOUR_SURNAME",
    constituency: "ZONE A - NORTH DELHI",
    isVerified: true,
  },
});
```

Then run:
```bash
npm run db:seed
```

