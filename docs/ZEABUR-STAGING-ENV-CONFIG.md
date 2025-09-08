# 🚨 URGENT: Zeabur Staging Environment Configuration Fix
# Zeabur Staging 環境配置修復指南

> **Critical Issue**: OAuth redirecting to localhost:8080 instead of staging domain  
> **緊急問題**: OAuth 重定向到 localhost:8080 而非 staging 域名  
> **Solution**: Configure correct environment variables in Zeabur console  
> **解決方案**: 在 Zeabur 控制台配置正確的環境變數

## ⚠️ **IMPORTANT NOTE**
**The environment variables below use placeholders for security.**  
**Please replace placeholders with your actual credentials from your .env.staging file.**  
**環境變數使用佔位符以確保安全，請使用您 .env.staging 檔案中的實際憑證替換。**

## 🎯 **Root Cause Analysis | 根本原因分析**

The staging environment is still redirecting to `localhost:8080` because:
1. **Environment variables not set correctly in Zeabur console**
2. **Domain mismatch**: ✅ Fixed - now using correct domain `next14-landing.zeabur.app`
3. **Code fix exists but deployment hasn't picked up correct config**

## 🔧 **REQUIRED ZEABUR ENVIRONMENT VARIABLES**

### Copy these EXACT variables to Zeabur Staging Console:

```env
# Environment Type
NODE_ENV=staging

# Critical OAuth Configuration (MUST MATCH EXACTLY)
NEXTAUTH_URL=https://next14-landing.zeabur.app
NEXTAUTH_SECRET=<your-staging-nextauth-secret>

# CORS Configuration
ALLOWED_ORIGINS=https://next14-landing.zeabur.app

# JWT Authentication
JWT_SECRET=<your-staging-jwt-secret>

# Google OAuth Credentials (Use your actual credentials from Google Console)
GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-<your-google-client-secret>

# Database URL (Staging Database)
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_WINDOW_MS=900000

# Email Configuration (Disabled for staging)
EMAIL_PROVIDER=disabled

# Build Configuration
SKIP_ENV_VALIDATION=1
PRISMA_CLI_TELEMETRY_DISABLED=1
DEBUG=prisma:warn
```

## 📋 **Step-by-Step Zeabur Configuration**

### Step 1: Access Zeabur Console
1. Go to [Zeabur Console](https://zeabur.com/)
2. Navigate to your staging project
3. Find the staging service deployment
4. Go to **Environment Variables** section

### Step 2: Critical Variables to Update
**⚠️ MOST IMPORTANT - These MUST be correct:**

| Variable | Current (Wrong) | Correct Value |
|----------|-----------------|---------------|
| `NEXTAUTH_URL` | `https://staging.es-international.zeabur.app` | `https://next14-landing.zeabur.app` |
| `ALLOWED_ORIGINS` | `https://staging.es-international.zeabur.app` | `https://next14-landing.zeabur.app` |

### Step 3: Trigger Redeploy
After updating environment variables:
1. **Manual Redeploy**: Click "Redeploy" in Zeabur console
2. **Wait 2-3 minutes** for deployment to complete
3. **Monitor logs** to ensure no errors

## 🔍 **Google OAuth Console Verification**

### Required Configuration in Google Console:

**Authorized Domains:**
```
next14-landing.zeabur.app
kcislk-infohub.zeabur.app
```

**Authorized Redirect URIs:**
```
https://next14-landing.zeabur.app/api/auth/callback/google    ← CRITICAL for staging
https://kcislk-infohub.zeabur.app/api/auth/callback/google    ← For production  
http://localhost:3001/api/auth/callback/google               ← For development
```

## ✅ **Verification Steps**

### After Zeabur Deployment:

1. **Health Check**:
   ```bash
   curl https://next14-landing.zeabur.app/api/health
   ```

2. **OAuth Providers Check**:
   ```bash
   curl https://next14-landing.zeabur.app/api/auth/providers
   ```
   Should return:
   ```json
   {
     "google": {
       "callbackUrl": "https://next14-landing.zeabur.app/api/auth/callback/google"
     }
   }
   ```

3. **Manual Login Test**:
   - Go to: https://next14-landing.zeabur.app/login
   - Click "使用 Google 登入"
   - Complete OAuth flow
   - **Expected**: Redirect to `https://next14-landing.zeabur.app/admin` (NOT localhost)

## 🚨 **Expected Results After Fix**

✅ **Success Indicators:**
- OAuth login redirects to `https://next14-landing.zeabur.app/admin`
- No `ERR_CONNECTION_REFUSED` errors
- No localhost:8080 redirects
- Admin page loads successfully
- Can access all staging features normally

❌ **If Still Failing:**
- Clear browser cache and cookies
- Wait 5-10 minutes for Google OAuth changes to propagate
- Check Zeabur deployment logs for errors
- Verify all environment variables are exactly as specified above

## 📞 **Next Steps**

1. **Update Zeabur Environment Variables** (Critical)
2. **Trigger Redeploy**
3. **Test OAuth Flow**
4. **Verify Admin Access**

---

**Priority**: 🔥 **URGENT**  
**Impact**: Blocking staging environment testing  
**Fix Time**: 5-10 minutes once Zeabur variables are updated  
**Generated**: 2025-09-05T06:34:25Z