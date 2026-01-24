# ✅ V-Link Render Deployment Checklist

## Pre-Deployment Setup

### ✅ Repository Preparation
- [x] `render.yaml` created with service definitions
- [x] `.renderignore` created to exclude unnecessary files
- [x] `scripts/deploy-render.sh` created for validation
- [x] `package.json` updated with Render scripts
- [x] `RENDER_DEPLOYMENT.md` created with full guide

### 🔄 Environment Setup
- [ ] Create Render account at https://render.com
- [ ] Connect GitHub repository to Render
- [ ] Create PostgreSQL database on Render
- [ ] Create CloudAMQP RabbitMQ instance

## Render Service Configuration

### 🔄 Frontend Service (vlink-frontend)
**Service Type:** Web Service
**Build Command:** `npm run build`
**Start Command:** `npm run start`
**Environment Variables:**
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL=<your-postgres-url>`
- [ ] `NEXTAUTH_SECRET=<random-secret>`
- [ ] `NEXTAUTH_URL=<your-render-frontend-url>`

### 🔄 Worker Service (vlink-worker)
**Service Type:** Background Worker
**Build Command:** `npm install`
**Start Command:** `node src/workers/ledgerWorker.js`
**Environment Variables:**
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL=<same-as-frontend>`
- [ ] `RABBITMQ_URL=<your-amqp-url>`

## Database Setup

### 🔄 PostgreSQL Configuration
- [ ] Database created on Render
- [ ] Connection string copied to environment variables
- [ ] Run `npx prisma migrate deploy` after deployment
- [ ] Run `npx prisma db seed` if initial data needed

## RabbitMQ Setup

### 🔄 Message Queue Configuration
- [ ] CloudAMQP account created
- [ ] RabbitMQ instance created (Little Lemur free tier)
- [ ] AMQP URL copied to worker environment variables
- [ ] Test connection manually if needed

## Post-Deployment Verification

### 🔄 Health Checks
- [ ] Frontend accessible at Render URL
- [ ] `/api/ping` endpoint returns success
- [ ] Worker logs show successful RabbitMQ connection
- [ ] Worker logs show successful database connection

### 🔄 Functionality Testing
- [ ] Officer login works
- [ ] Voter registration creates records
- [ ] Worker processes registration events
- [ ] Voter login works with registered accounts
- [ ] Relocation requests are processed

## Troubleshooting Checklist

### 🔄 If Frontend Fails
- [ ] Check build logs for errors
- [ ] Verify environment variables are set
- [ ] Check database connectivity
- [ ] Review Next.js build process

### 🔄 If Worker Fails
- [ ] Check worker logs for connection errors
- [ ] Verify RabbitMQ URL format
- [ ] Test database connection from worker
- [ ] Check for missing dependencies

### 🔄 If Queue Processing Fails
- [ ] Verify RabbitMQ credentials
- [ ] Check queue names match between sender/receiver
- [ ] Monitor queue depth in CloudAMQP dashboard
- [ ] Check for message processing errors

## Performance Monitoring

### 🔄 Service Health
- [ ] Monitor response times
- [ ] Check error rates
- [ ] Monitor memory usage
- [ ] Review worker processing times

### 🔄 Queue Health
- [ ] Monitor queue depth
- [ ] Check message processing rates
- [ ] Monitor dead letter queue
- [ ] Alert on queue backlog

## Cost Optimization

### 🔄 Resource Usage
- [ ] Monitor actual usage vs. allocated resources
- [ ] Consider upgrading plans if needed
- [ ] Optimize database queries if slow
- [ ] Monitor RabbitMQ message rates

## Security Verification

### 🔄 Access Controls
- [ ] Environment variables properly secured
- [ ] Database connections encrypted
- [ ] RabbitMQ credentials protected
- [ ] No sensitive data in application logs

---

## Quick Deployment Commands

```bash
# Pre-deployment validation
npm run deploy:check

# Local testing
npm run dev:all

# Database setup (after deployment)
npx prisma migrate deploy
npx prisma db seed
```

## Emergency Contacts

- Render Support: https://render.com/docs/support
- CloudAMQP Support: https://www.cloudamqp.com/docs
- Prisma Support: https://www.prisma.io/support

---

**Status:** Ready for deployment 🚀
