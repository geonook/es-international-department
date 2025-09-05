# Staging Environment Variables - Corrected for next14-landing.zeabur.app
# Staging 環境變數配置 - 修正版 (適用於 next14-landing.zeabur.app)

> **Date**: 2025-09-05  
> **Target**: https://next14-landing.zeabur.app  
> **Status**: Ready for deployment  
> **Purpose**: Fix Google OAuth "Access blocked" error

## 🚨 Critical Issue Fixed
**Problem**: Google OAuth shows "已封鎖存取權：這個應用程式的要求無效"  
**Root Cause**: Domain mismatch between actual staging URL and OAuth configuration  
**Solution**: Correct all OAuth settings to match `next14-landing.zeabur.app`

## 📋 Complete Staging Environment Variables

### Core Environment Settings
```env
NODE_ENV=staging
```

### Database Configuration
```env
# Use the same staging database from your current setup
DATABASE_URL="postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur"
```

### Authentication Configuration (CORRECTED)
```env
# JWT Secret for API authentication (staging-specific)
JWT_SECRET="Tr4q2KulnbpxWMsUneujJe/G6M+6lF1N2On6DtAUfDI="

# NextAuth configuration - CORRECTED DOMAIN
NEXTAUTH_SECRET="QIXalhOBH2bn4i22VC4Pc2e8wg/6mkBh0tRuKsO7hiE="
NEXTAUTH_URL="https://next14-landing.zeabur.app"
```

### Security Configuration (CORRECTED)
```env
# CORS Origins - CORRECTED DOMAIN
ALLOWED_ORIGINS="https://next14-landing.zeabur.app"

# Rate Limiting (relaxed for staging)
RATE_LIMIT_MAX_REQUESTS="500"
RATE_LIMIT_WINDOW_MS="900000"
```

### Google OAuth Configuration (SAME AS PRODUCTION)
```env
# Use the same Google OAuth credentials as production
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
```

### Email Service Configuration
```env
# Email service disabled for staging
EMAIL_PROVIDER="disabled"
```

### Development Tools Configuration
```env
# Prisma configuration
PRISMA_CLI_TELEMETRY_DISABLED="1"

# Debug mode enabled for staging
DEBUG="prisma:*"

# Environment validation enabled
SKIP_ENV_VALIDATION="0"
```

## 🔧 Google OAuth Console Settings Required

### 1. Authorized Domains
Add to your Google OAuth 2.0 Client:
```
next14-landing.zeabur.app
```

### 2. Authorized Redirect URIs
Add to your Google OAuth 2.0 Client:
```
https://next14-landing.zeabur.app/api/auth/callback/google
```

### 3. Complete OAuth Configuration
Your Google Console should now have:

**Authorized Domains:**
- `next14-landing.zeabur.app` ✅ (NEW - ADD THIS)
- `kcislk-infohub.zeabur.app` ✅ (Existing for production)

**Authorized Redirect URIs:**
- `https://next14-landing.zeabur.app/api/auth/callback/google` ✅ (NEW - ADD THIS)
- `https://kcislk-infohub.zeabur.app/api/auth/callback/google` ✅ (Existing for production)

## 🚀 Deployment Instructions

### Step 1: Update Zeabur Environment Variables
Copy and paste these variables in Zeabur dashboard for staging service:

```env
NODE_ENV=staging
DATABASE_URL=postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur
JWT_SECRET=Tr4q2KulnbpxWMsUneujJe/G6M+6lF1N2On6DtAUfDI=
NEXTAUTH_SECRET=QIXalhOBH2bn4i22VC4Pc2e8wg/6mkBh0tRuKsO7hiE=
NEXTAUTH_URL=https://next14-landing.zeabur.app
ALLOWED_ORIGINS=https://next14-landing.zeabur.app
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_WINDOW_MS=900000
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
EMAIL_PROVIDER=disabled
PRISMA_CLI_TELEMETRY_DISABLED=1
DEBUG=prisma:*
SKIP_ENV_VALIDATION=0
```

### Step 2: Update Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Navigate to APIs & Services → Credentials
3. Find your OAuth 2.0 Client ID
4. Add authorized domain: `next14-landing.zeabur.app`
5. Add redirect URI: `https://next14-landing.zeabur.app/api/auth/callback/google`
6. Save changes

### Step 3: Test the Fix
1. Wait for automatic deployment to complete
2. Visit: https://next14-landing.zeabur.app/login
3. Click "使用 Google 帳戶登入"
4. Should NOT show "已封鎖存取權" error anymore

## ✅ Verification Checklist

### Environment Variables
- [ ] `NEXTAUTH_URL` matches actual staging domain
- [ ] `ALLOWED_ORIGINS` matches actual staging domain
- [ ] `NODE_ENV` set to "staging"
- [ ] `EMAIL_PROVIDER` set to "disabled"

### Google OAuth Console
- [ ] `next14-landing.zeabur.app` added to authorized domains
- [ ] `https://next14-landing.zeabur.app/api/auth/callback/google` added to redirect URIs
- [ ] OAuth consent screen configured properly

### Testing
- [ ] Staging app loads: https://next14-landing.zeabur.app/
- [ ] Health check passes: https://next14-landing.zeabur.app/api/health
- [ ] OAuth providers endpoint works: https://next14-landing.zeabur.app/api/auth/providers
- [ ] Login page loads without errors: https://next14-landing.zeabur.app/login
- [ ] Google OAuth login works without "access blocked" error

## 🔍 Troubleshooting

### If OAuth Still Shows "Access Blocked"
1. Double-check Google Console redirect URI is EXACT: `https://next14-landing.zeabur.app/api/auth/callback/google`
2. Ensure no trailing slash in NEXTAUTH_URL
3. Clear browser cache and cookies
4. Wait 5-10 minutes for Google OAuth changes to propagate

### If Deployment Fails
1. Check Zeabur logs for environment validation errors
2. Ensure all required environment variables are set
3. Verify database connection string is correct

## 📝 Notes
- This configuration uses the same Google OAuth credentials as production
- Database uses staging environment (separate from production)
- Email service is disabled for staging environment
- Debug logging enabled for troubleshooting

---
**Fixed Issue**: Google OAuth "Access blocked" error  
**Target Domain**: https://next14-landing.zeabur.app  
**Generated**: 2025-09-05  
**Status**: Ready for deployment