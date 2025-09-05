# Deployment Guide
# KCISLK ESID Info Hub - Multi-Environment Deployment Guide

> **Document Version**: 2.0 | **文件版本**: 2.0  
> **Last Updated**: 2025-09-05 | **最後更新**: 2025-09-05  
> **Status**: ✅ OAuth Fixed, All Environments Successfully Deployed | **狀態**: ✅ OAuth修復完成，所有環境成功部署  
> **Environments**: Development, Staging, Production | **環境**: 開發、預備、生產環境

## 🚀 Overview | 概述

This guide provides comprehensive instructions for deploying the KCISLK ESID Info Hub to production environments, including platform-specific configurations, environment setup, and post-deployment verification.

本指南為 KCISLK ESID Info Hub 的生產環境部署提供全面指導，包括平台特定配置、環境設定和部署後驗證。

## 📋 Pre-Deployment Checklist | 部署前檢查清單

### ✅ **System Health Verification**
Before deployment, ensure all systems are healthy:

```bash
# Run comprehensive health check
npm run health:dashboard

# Verify performance benchmarks
npm run benchmark:full

# Check database integrity
npm run db:health
npm run db:integrity

# Security audit
npm run security:full
```

**Required Health Scores:**
- Overall System Health: ≥80/100
- Database Health: ≥90/100
- Performance Score: ≥70/100 (Note: Current score is 33/100 - address N+1 queries first)
- Security Score: ≥80/100

### ✅ **Environment Configuration**
Verify all required environment variables are set:

```bash
# Check environment configuration
npm run env:validate
npm run env:check
```

### ✅ **Database Migration**
Ensure database is ready for production:

```bash
# Generate Prisma client
npm run db:generate

# Deploy migrations (production)
npm run deploy:production

# Verify database structure
npm run db:health
```

## 🏗️ Platform-Specific Deployment Instructions

### 1. Zeabur Cloud Platform (Recommended) | Zeabur 雲端平台（推薦）

Zeabur is the recommended deployment platform for this application.

#### **Step 1: Environment Setup**

Create a `.env.production` file with production variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Authentication
NEXTAUTH_URL="https://your-domain.zeabur.app"
NEXTAUTH_SECRET="your-super-secure-secret-key-min-32-chars"

# Google OAuth (Production)
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"

# Application
NEXT_PUBLIC_BASE_URL="https://your-domain.zeabur.app"
NODE_ENV="production"

# Optional: Redis for caching
REDIS_URL="redis://username:password@host:port"
```

#### **Step 2: Deployment Commands**

```bash
# Build for production
npm run build:production

# Deploy to Zeabur
npm run zeabur:deploy

# Verify deployment
npm run verify:production
```

#### **Step 3: Post-Deployment Verification**

```bash
# Test OAuth configuration
npm run test:oauth-production

# Verify production endpoints
npm run validate:oauth-production

# Run health checks against production
curl https://your-domain.zeabur.app/api/health
```

### 2. Vercel Deployment | Vercel 部署

#### **Environment Variables**
In Vercel dashboard, add all environment variables from `.env.production`.

#### **Build Configuration**
```json
{
  "buildCommand": "npm run build:production",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

#### **Database Setup**
```bash
# Deploy database migrations
npm run db:migrate:deploy

# Seed initial data (if needed)
npm run db:seed
```

### 3. Docker Deployment | Docker 部署

#### **Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run db:generate

# Build application
RUN npm run build:production

EXPOSE 8080

CMD ["npm", "start"]
```

#### **Docker Compose**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🔐 Security Configuration | 安全配置

### **SSL/TLS Setup**
Ensure HTTPS is properly configured:

```bash
# Verify SSL configuration
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check security headers
curl -I https://your-domain.com/api/health
```

### **Security Headers**
Add these headers to your deployment platform:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### **Authentication Configuration**
Verify OAuth settings for production:

1. **Google Cloud Console**:
   - Add production domain to authorized origins
   - Update callback URLs
   - Verify API quotas and limits

2. **JWT Token Security**:
   - Use strong, unique `NEXTAUTH_SECRET` (32+ characters)
   - Set appropriate token expiration times
   - Enable secure cookie settings

## 📊 Database Configuration | 資料庫配置

### **Production Database Setup**

#### **PostgreSQL Recommended Configuration**
```sql
-- Performance settings
shared_preload_libraries = 'pg_stat_statements'
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

-- Logging
log_statement = 'ddl'
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on
```

#### **Essential Database Indexes**
Run these performance optimizations:

```bash
# Add performance indexes (creates SQL migration)
npm run db:indexes
```

The indexes include:
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);

-- Resource queries
CREATE INDEX idx_resources_category_grade ON resources(category_id, grade_level_id);
CREATE INDEX idx_resources_published_created ON resources(is_published, created_at DESC);

-- Event queries
CREATE INDEX idx_events_date_status ON events(start_date, status);

-- Notification queries
CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_id, is_read);
```

### **Database Migration Strategy**
```bash
# Production migration workflow
npm run db:migrate:deploy    # Deploy migrations
npm run db:health           # Verify health
npm run db:integrity       # Check integrity
```

## 🔍 Monitoring and Health Checks | 監控和健康檢查

### **Health Endpoints**
Set up monitoring for these endpoints:

1. **Basic Health**: `GET /api/health`
2. **Database Health**: Internal monitoring via `npm run db:health`
3. **Performance Monitoring**: Via `npm run benchmark:full`

### **Automated Health Monitoring**
Create a monitoring script that runs every 5 minutes:

```bash
#!/bin/bash
# health-monitor.sh

# Check API health
if ! curl -f https://your-domain.com/api/health > /dev/null 2>&1; then
    echo "API health check failed" | mail -s "Production Alert" admin@your-domain.com
fi

# Check database health (run on server)
if [ "$(npm run db:health --silent | grep 'Health Score' | grep -o '[0-9]*')" -lt 80 ]; then
    echo "Database health below threshold" | mail -s "Database Alert" admin@your-domain.com
fi
```

### **Performance Monitoring**
Set up alerts for:
- Response time > 2 seconds
- Database query time > 100ms
- Memory usage > 512MB
- Error rate > 1%

## 🚨 Troubleshooting | 故障排除

### **Common Deployment Issues**

#### **Environment Variables Not Loaded**
```bash
# Verify environment
node -e "console.log(process.env.NODE_ENV)"
node -e "console.log(process.env.DATABASE_URL ? 'DB configured' : 'DB missing')"
```

#### **Database Connection Issues**
```bash
# Test database connection
npm run test:db

# Check database health
npm run db:health

# Verify migrations
npm run db:integrity
```

#### **OAuth Authentication Problems**
```bash
# Test OAuth configuration
npm run test:oauth-config

# Validate production OAuth
npm run validate:oauth-production
```

#### **Performance Issues**
```bash
# Run performance analysis
npm run db:n-plus-one

# Check benchmark results
npm run benchmark:full

# Generate performance report
npm run report:performance
```

### **Log Analysis**
Key logs to monitor:
- Application logs: `stdout/stderr`
- Database slow queries: `>100ms queries`
- Authentication failures: `401/403 responses`
- Performance alerts: `Response time >2s`

## 📈 Performance Optimization | 效能優化

### **Critical Performance Fixes**
Before going to production, address these critical issues identified by our monitoring:

1. **N+1 Query Issues (Critical - 48 issues found)**:
   ```bash
   # Review optimization guide
   cat docs/PERFORMANCE-OPTIMIZATION-GUIDE.md
   
   # Apply fixes to resource, event, and user management queries
   # Example fix:
   await prisma.resource.findMany({
     include: { creator: true, category: true, gradeLevel: true }
   })
   ```

2. **Database Indexes**:
   ```bash
   # Apply essential indexes
   npm run optimize:database
   ```

3. **Caching Layer**:
   - Implement Redis caching for frequently accessed data
   - Add API response caching
   - Enable browser caching for static assets

### **Performance Targets**
- API Response Time: <200ms (95th percentile)
- Database Query Time: <50ms (average)
- Page Load Time: <2 seconds
- Time to First Byte (TTFB): <500ms

## ✅ Post-Deployment Verification | 部署後驗證

### **Comprehensive Health Check**
```bash
# Run full health dashboard
npm run health:dashboard

# Expected results:
# - Overall Health Score: ≥80/100
# - All critical systems: Healthy
# - No critical alerts
```

### **Functional Testing**
```bash
# Run API tests against production
npm run test:api

# Test authentication flow
npm run test:oauth-production

# Verify core functionality
npm run test:e2e
```

### **Performance Validation**
```bash
# Run performance benchmarks
npm run benchmark:full

# Check for performance regressions
npm run test:performance
```

### **Security Verification**
```bash
# Security audit
npm run security:full

# SSL/TLS check
curl -I https://your-domain.com/api/health

# Authentication test
curl -H "Authorization: Bearer invalid-token" \
     https://your-domain.com/api/admin/users
```

## 📞 Support and Maintenance | 支援和維護

### **Regular Maintenance Tasks**

#### **Daily**
- Monitor health dashboard: `npm run health:dashboard`
- Check error logs and performance metrics
- Verify authentication system status

#### **Weekly**
- Run full performance analysis: `npm run db:n-plus-one`
- Check database integrity: `npm run db:integrity`
- Review security audit: `npm run security:full`

#### **Monthly**
- Update dependencies and security patches
- Review and optimize database performance
- Analyze user feedback and feature requests
- Backup verification and disaster recovery testing

### **Emergency Contacts**
- **System Administrator**: admin@kcislk.edu.hk
- **Development Team**: dev@kcislk.edu.hk
- **Database Administrator**: db@kcislk.edu.hk

### **Escalation Procedures**
1. **Critical System Down**: Immediate notification + rollback
2. **Performance Degradation**: Investigation within 2 hours
3. **Security Issues**: Immediate assessment + patches
4. **Data Issues**: Database administrator + backup restoration

## 🎯 Success Metrics | 成功指標

### **Deployment Success Criteria**
- [ ] All health checks passing (score ≥80/100)
- [ ] Authentication system functioning
- [ ] API endpoints responding <200ms
- [ ] Database queries optimized
- [ ] Security measures implemented
- [ ] Monitoring and alerting configured

### **Ongoing Performance Targets**
- **Uptime**: 99.9%
- **Response Time**: <200ms (95th percentile)
- **Error Rate**: <0.1%
- **User Satisfaction**: ≥4.5/5.0

---

**🚨 Remember: Address the critical N+1 query performance issues (48 issues identified) before deploying to production. Use the Performance Optimization Guide for specific fixes.**

*This deployment guide is maintained by the development team and updated with each major release.*