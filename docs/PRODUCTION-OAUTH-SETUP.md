# Google OAuth Production Setup Guide
# Google OAuth 生產環境設定指南

> **🚀 PRODUCTION DEPLOYMENT READY**  
> **完整的 OAuth 生產環境部署指南**  
> **Current deployment**: https://kcislk-esid.zeabur.app

## 🎯 Setup Overview | 設定概述

This guide provides step-by-step instructions for configuring Google OAuth for production deployment on Zeabur. The system is designed to work seamlessly with the current Zeabur infrastructure.

本指南提供在 Zeabur 上配置 Google OAuth 生產環境部署的逐步說明。系統設計為與現有 Zeabur 基礎設施無縫協作。

## 📋 Pre-Requirements | 前置需求

### ✅ Current Status Verification
- [x] OAuth implementation complete (`/lib/google-oauth.ts`)
- [x] Testing interface available (`/test-oauth`)
- [x] Environment validation system ready (`/lib/env.ts`)
- [x] JWT and NextAuth integration complete
- [x] Database schema includes user roles and OAuth fields
- [x] Security middleware implemented

### 🔧 Required Information
Before starting, gather the following:
- **Production Domain**: `https://kcislk-esid.zeabur.app`
- **Google Account** with access to Google Cloud Console
- **Zeabur Account** with deployment access
- **Email Domain** for user role assignment

## 🏗️ Phase 1: Google Cloud Console Setup

### Step 1.1: Create Google Cloud Project

1. **Visit Google Cloud Console**
   ```
   URL: https://console.cloud.google.com/
   ```

2. **Create New Project**
   ```
   Project Name: KCISLK ESID Info Hub Production
   Organization: (Select your organization or leave blank)
   Location: (Select appropriate location)
   ```

3. **Enable Required APIs**
   ```bash
   # Navigate to APIs & Services > Library
   # Search and enable:
   - Google+ API
   - Google People API (recommended)
   - Google OAuth2 API
   ```

### Step 1.2: Configure OAuth Consent Screen

1. **Navigate to OAuth Consent Screen**
   ```
   Path: APIs & Services > OAuth consent screen
   ```

2. **User Type Selection**
   ```
   ✅ External (for public access)
   ⚠️ Internal (only if using Google Workspace)
   ```

3. **App Information**
   ```
   App name: KCISLK ESID Info Hub
   User support email: esid@kcislk.ntpc.edu.tw
   App logo: (Optional - upload school logo)
   Developer contact: esid@kcislk.ntpc.edu.tw
   ```

4. **Authorized Domains** (CRITICAL)
   ```
   Add these domains:
   - kcislk-esid.zeabur.app
   - zeabur.app (if using Zeabur subdomains)
   ```

5. **Scopes Configuration**
   ```
   Required scopes:
   - openid
   - email
   - profile
   - https://www.googleapis.com/auth/userinfo.email
   - https://www.googleapis.com/auth/userinfo.profile
   ```

### Step 1.3: Create OAuth 2.0 Credentials

1. **Create Credentials**
   ```
   Path: APIs & Services > Credentials
   Action: + CREATE CREDENTIALS > OAuth client ID
   ```

2. **Application Type**
   ```
   Application type: Web application
   Name: KCISLK ESID Production OAuth
   ```

3. **Authorized JavaScript Origins** (CRITICAL)
   ```
   https://kcislk-esid.zeabur.app
   ```

4. **Authorized Redirect URIs** (CRITICAL)
   ```
   https://kcislk-esid.zeabur.app/api/auth/callback/google
   ```

5. **Save Credentials**
   ```
   📝 Copy Client ID (ends with .apps.googleusercontent.com)
   📝 Copy Client Secret (starts with GOCSPX-)
   ```

## 🔐 Phase 2: Environment Configuration

### Step 2.1: Production Environment Variables

Create production environment configuration for Zeabur:

```bash
# ==========================================
# PRODUCTION ENVIRONMENT VARIABLES
# ==========================================

# Environment
NODE_ENV=production

# Database (Use your actual Zeabur PostgreSQL URL)
DATABASE_URL="postgresql://root:YOUR_DB_PASSWORD@tpe1.clusters.zeabur.com:PORT/zeabur"

# Authentication Secrets (GENERATE NEW FOR PRODUCTION)
JWT_SECRET="GENERATE_32_CHAR_SECRET_FOR_PRODUCTION"
NEXTAUTH_SECRET="GENERATE_32_CHAR_SECRET_FOR_PRODUCTION"
NEXTAUTH_URL="https://kcislk-esid.zeabur.app"

# Google OAuth (From Google Cloud Console)
GOOGLE_CLIENT_ID="your-production-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-production-client-secret"

# Security Configuration
ALLOWED_ORIGINS="https://kcislk-esid.zeabur.app"
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="900000"

# Optional Services
SENTRY_DSN="your-sentry-dsn-for-error-tracking"
GOOGLE_ANALYTICS_ID="your-ga-id-if-needed"

# Build Configuration
SKIP_ENV_VALIDATION="0"
PRISMA_CLI_TELEMETRY_DISABLED="1"
```

### Step 2.2: Generate Secure Secrets

Run these commands to generate production-ready secrets:

```bash
# Generate JWT_SECRET (32+ characters)
openssl rand -base64 32

# Generate NEXTAUTH_SECRET (32+ characters) 
openssl rand -base64 32

# Alternative: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 2.3: Set Environment Variables in Zeabur

1. **Access Zeabur Dashboard**
   ```
   URL: https://dash.zeabur.com/
   Navigate to your project
   ```

2. **Configure Environment Variables**
   ```
   Path: Project Settings > Environment
   Add each variable from Step 2.1
   ```

3. **Variable Priority**
   ```
   CRITICAL (must be set):
   - DATABASE_URL
   - JWT_SECRET
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   
   IMPORTANT (recommended):
   - ALLOWED_ORIGINS
   - NODE_ENV=production
   
   OPTIONAL:
   - SENTRY_DSN
   - GOOGLE_ANALYTICS_ID
   ```

## 🔒 Phase 3: Security Configuration

### Step 3.1: HTTPS Verification

Ensure production deployment uses HTTPS:

```typescript
// This is already implemented in lib/env.ts
// Production environment validation will fail if NEXTAUTH_URL doesn't use HTTPS
```

### Step 3.2: CORS Configuration

Update allowed origins for production:

```typescript
// Environment variable should be set to:
ALLOWED_ORIGINS="https://kcislk-esid.zeabur.app"
```

### Step 3.3: Cookie Security

The application already configures secure cookies for production:
- `secure: true` for HTTPS
- `httpOnly: true` to prevent XSS
- `sameSite: 'lax'` for CSRF protection

## 🧪 Phase 4: Testing and Validation

### Step 4.1: Pre-Deployment Testing

Before deploying, verify configuration locally:

```bash
# Set environment variables
export GOOGLE_CLIENT_ID="your-prod-client-id"
export GOOGLE_CLIENT_SECRET="your-prod-secret"
export NEXTAUTH_URL="https://kcislk-esid.zeabur.app"

# Run configuration test
npm run test:oauth-config
```

### Step 4.2: Production Deployment Test

1. **Deploy to Zeabur**
   ```bash
   git add .
   git commit -m "feat: Configure OAuth for production deployment"
   git push origin main
   ```

2. **Verify Deployment**
   ```
   URL: https://kcislk-esid.zeabur.app
   Check: Application loads without errors
   ```

3. **Test OAuth Flow**
   ```
   Steps:
   1. Visit: https://kcislk-esid.zeabur.app/login
   2. Click "Login with Google"
   3. Complete Google OAuth flow
   4. Verify redirect to application
   5. Check user creation in database
   ```

### Step 4.3: Environment Validation

The application includes automatic environment validation:

```typescript
// Check configuration health
// This runs automatically on application start
// Will show warnings/errors for misconfiguration
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### Issue: redirect_uri_mismatch
```
Error: The redirect URI in the request does not match
Solution: 
1. Check Google Console authorized redirect URIs
2. Ensure exact match: https://kcislk-esid.zeabur.app/api/auth/callback/google
3. No trailing slash, exact case match
```

#### Issue: invalid_client
```
Error: Invalid client credentials
Solution:
1. Verify GOOGLE_CLIENT_ID format (must end with .apps.googleusercontent.com)
2. Verify GOOGLE_CLIENT_SECRET is correct
3. Check environment variables are set in Zeabur
```

#### Issue: access_denied
```
Error: User denied access or consent screen issue
Solution:
1. Review OAuth consent screen configuration
2. Ensure app is not in testing mode (if using External user type)
3. Check authorized domains match deployment domain
```

#### Issue: HTTPS Required
```
Error: OAuth requires HTTPS in production
Solution:
1. Ensure NEXTAUTH_URL uses https://
2. Verify Zeabur deployment serves HTTPS
3. Check no mixed content issues
```

## 📊 Monitoring and Maintenance

### Health Check Endpoints

The application provides health check endpoints:

```bash
# Application health
curl https://kcislk-esid.zeabur.app/api/health

# Environment configuration status
# Check logs in Zeabur console for configuration warnings
```

### User Role Assignment

The system automatically assigns roles based on email domain:

```typescript
// Current role mapping (can be customized)
'@kcislk.ntpc.edu.tw': 'teacher'  // School staff
'@gmail.com': 'parent'            // Default parent
'@yahoo.com': 'parent'            // Default parent
// ... other domains
```

### Database Monitoring

Monitor user creation and OAuth token usage:

```sql
-- Check recent OAuth users
SELECT email, role, created_at FROM users 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## ✅ Production Deployment Checklist

Before going live, verify all items:

### Google Cloud Console
- [ ] Project created and configured
- [ ] OAuth consent screen approved (if external)
- [ ] Correct redirect URIs configured
- [ ] API quotas sufficient for expected load

### Environment Configuration
- [ ] All required environment variables set in Zeabur
- [ ] JWT_SECRET generated and secure (32+ chars)
- [ ] NEXTAUTH_SECRET generated and secure (32+ chars)
- [ ] NEXTAUTH_URL points to production domain with HTTPS
- [ ] GOOGLE_CLIENT_ID from production Google project
- [ ] GOOGLE_CLIENT_SECRET from production Google project

### Security Configuration
- [ ] HTTPS enforced for production
- [ ] CORS configured for production domain
- [ ] Rate limiting appropriate for production load
- [ ] No debug information exposed in production

### Testing
- [ ] OAuth flow works end-to-end
- [ ] User creation and role assignment functional
- [ ] JWT token generation and validation working
- [ ] Session management working correctly
- [ ] Error handling graceful and user-friendly

### Monitoring
- [ ] Error tracking configured (Sentry recommended)
- [ ] Application logs monitored
- [ ] Database performance monitored
- [ ] OAuth quota usage monitored

## 🎉 Success Criteria

**OAuth system is production-ready when:**

1. ✅ Users can successfully log in with Google
2. ✅ New users are automatically registered  
3. ✅ User roles are correctly assigned based on email domain
4. ✅ Sessions persist correctly across requests
5. ✅ Error handling provides clear user feedback
6. ✅ All security requirements met for production
7. ✅ Performance acceptable under expected load

## 📚 Additional Resources

- **Google OAuth 2.0 Documentation**: https://developers.google.com/identity/protocols/oauth2
- **Zeabur Environment Variables**: https://docs.zeabur.com/environment-variables
- **NextAuth.js Documentation**: https://next-auth.js.org/
- **Project Documentation**: `/docs/google-oauth-setup.md`

---

**🚀 Your OAuth system is now ready for production deployment!**  
**🔒 Security-hardened and scalable for educational institution use**  
**📈 Monitoring and maintenance procedures in place**

*Last Updated: 2025-08-06*  
*Version: 1.0.0*  
*Deployment Target: https://kcislk-esid.zeabur.app*