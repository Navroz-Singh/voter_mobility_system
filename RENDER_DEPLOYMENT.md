# 🚀 V-Link Render Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the V-Link Voter Mobility System to Render with separate services for the Next.js frontend and RabbitMQ worker.

## Prerequisites

- Render account (https://render.com)
- GitHub repository
- PostgreSQL database (Render or external)
- RabbitMQ service (CloudAMQP recommended)

## Step 1: Prepare Your Repository

### 1.1 Update package.json Scripts
The package.json has been updated with Render-specific scripts:

```json
{
  "scripts": {
    "render:build": "npm run build",
    "render:start": "npm run start",
    "render:worker": "node src/workers/ledgerWorker.js",
    "deploy:check": "node scripts/deploy-render.sh",
    "postinstall": "prisma generate"
  }
}
```

### 1.2 Configuration Files Created

**render.yaml** - Blueprint configuration for multi-service deployment
**.renderignore** - Files to exclude from deployment
**scripts/deploy-render.sh** - Pre-deployment validation script

## Step 2: Set Up External Services

### 2.1 PostgreSQL Database

**Option A: Render PostgreSQL (Recommended)**
1. Go to Render Dashboard → New → PostgreSQL
2. Choose region: Singapore
3. Plan: Starter ($7/month)
4. Copy the `DATABASE_URL`

**Option B: External PostgreSQL**
- Use any PostgreSQL provider (AWS RDS, Supabase, etc.)
- Ensure it allows connections from Render IPs

### 2.2 RabbitMQ Service

**CloudAMQP (Free tier available)**
1. Go to https://www.cloudamqp.com/
2. Create account → Create instance
3. Choose "Little Lemur" (free) plan
4. Region: Amazon Web Services - Asia Pacific (Singapore)
5. Copy the AMQP URL (starts with `amqp://`)

## Step 3: Deploy to Render

### 3.1 Connect Repository

1. Go to https://render.com → New → Blueprint
2. Connect your GitHub repository
3. Select the repository
4. Render will auto-detect the `render.yaml` file

### 3.2 Configure Services

**Frontend Service (vlink-frontend):**
- **Type:** Web Service
- **Build Command:** `npm run render:build`
- **Start Command:** `npm run render:start`

**Worker Service (vlink-worker):**
- **Type:** Background Worker
- **Build Command:** `npm install`
- **Start Command:** `npm run render:worker`

### 3.3 Set Environment Variables

#### Frontend Environment Variables:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://your-db-url
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=https://your-frontend-service.onrender.com
```

#### Worker Environment Variables:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://your-db-url  # Same as frontend
RABBITMQ_URL=amqp://your-rabbitmq-url
```

## Step 4: Database Setup

### 4.1 Run Migrations

After deployment, run database migrations:

```bash
# Via Render Shell (for frontend service)
npx prisma migrate deploy
npx prisma db seed  # Optional: if you want initial data
```

### 4.2 Verify Database Connection

Check the worker logs to ensure database connectivity:
```bash
# Worker should show successful DB connection
[*] Worker Connected to relocation_ledger_queue_v7
```

## Step 5: Health Checks

### 5.1 Frontend Health Check

Visit: `https://your-frontend-service.onrender.com/api/ping`

Expected response:
```json
{
  "ok": true,
  "timestamp": 1703123456789
}
```

### 5.2 Worker Health Check

Check worker logs in Render dashboard:
- Should show: `[*] Worker Connected to relocation_ledger_queue_v7`
- No error messages in logs
- RabbitMQ connection established

## Step 6: Testing Deployment

### 6.1 Test User Registration

1. Visit your deployed frontend
2. Try registering a new voter (officer login required)
3. Check worker logs - should process the registration
4. Verify user appears in database

### 6.2 Test Voter Login

1. Use registered voter credentials
2. Attempt login
3. Should work seamlessly

### 6.3 Test Relocation Flow

1. Login as voter
2. Request constituency change
3. Check worker processes the request
4. Verify database updates

## Troubleshooting

### Worker Not Connecting

**Check RabbitMQ URL:**
```bash
# Test connection manually
node -e "
const amqp = require('amqplib');
amqp.connect(process.env.RABBITMQ_URL)
  .then(() => console.log('✅ RabbitMQ connected'))
  .catch(err => console.error('❌ RabbitMQ error:', err));
"
```

**Common Issues:**
- Wrong AMQP URL format
- Firewall blocking connections
- Invalid credentials

### Database Connection Issues

**Check DATABASE_URL:**
```bash
# Test DB connection
npx prisma db push --preview-feature
```

### Build Failures

**Check build logs:**
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility
- Check for missing environment variables during build

### Worker Crashes

**Check worker logs:**
- Look for unhandled exceptions
- Check memory usage (512MB limit on starter plan)
- Verify Prisma client generation

## Monitoring & Maintenance

### Logs

**Frontend Logs:**
- Render Dashboard → Your Service → Logs tab

**Worker Logs:**
- Render Dashboard → Worker Service → Logs tab
- Monitor for processing errors and RabbitMQ issues

### Scaling

**Upgrade Plans if needed:**
- Web Service: Starter ($7) → Standard ($25)
- Worker: Starter ($7) → Standard ($25)
- Database: Starter ($7) → Standard ($50)

### Backups

**Database Backups:**
- Render provides automatic daily backups
- Manual backups available in dashboard

## Cost Estimation

**Monthly Costs (Starter Plans):**
- Frontend: $7/month
- Worker: $7/month
- Database: $7/month
- **Total: $21/month**

**Free Tier Usage:**
- 750 hours/month per service
- May require paid plans for production

## Security Checklist

- ✅ Environment variables set correctly
- ✅ Database connections secured
- ✅ RabbitMQ credentials protected
- ✅ No sensitive data in logs
- ✅ HTTPS enabled by default
- ✅ CORS configured properly

## Support

For issues:
1. Check Render service logs
2. Verify environment variables
3. Test external service connections
4. Review this deployment guide

**Happy deploying! 🎉**
