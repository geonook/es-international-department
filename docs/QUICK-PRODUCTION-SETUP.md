# Quick Production OAuth Setup Guide
# 快速生產環境 OAuth 設定指南

> **⚡ QUICK START - Get production OAuth running in 15 minutes**  
> **快速開始 - 15分鐘內讓生產環境 OAuth 運行**  
> **Target**: https://next14-landing.zeabur.app

## 🚀 5-Step Quick Setup

### Step 1: Generate Secure Secrets (2 minutes)
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate NEXTAUTH_SECRET  
openssl rand -base64 32

# Save these values - you'll need them in Step 3
```

### Step 2: Google Cloud Console (5 minutes)
1. **Visit**: https://console.cloud.google.com/
2. **Create Project**: "KCISLK ESID Info Hub Production"
3. **Enable APIs**: Search "Google+ API" → Enable
4. **OAuth Consent Screen**: 
   - App name: `KCISLK ESID Info Hub`
   - User support email: `esid@kcislk.ntpc.edu.tw`
   - Authorized domains: `next14-landing.zeabur.app`
5. **Create OAuth Client**:
   - Type: Web application
   - Authorized redirect URIs: `https://next14-landing.zeabur.app/api/auth/callback/google`
   - **Save Client ID and Secret**

### Step 3: Zeabur Environment Variables (3 minutes)
**Visit**: https://dash.zeabur.com/ → Your Project → Environment

**Add these variables**:
```bash
NODE_ENV=production
NEXTAUTH_URL=https://next14-landing.zeabur.app
JWT_SECRET=<your-generated-jwt-secret>
NEXTAUTH_SECRET=<your-generated-nextauth-secret>
GOOGLE_CLIENT_ID=<your-google-client-id.apps.googleusercontent.com>
GOOGLE_CLIENT_SECRET=<GOCSPX-your-google-client-secret>
ALLOWED_ORIGINS=https://next14-landing.zeabur.app
```

### Step 4: Deploy and Test (3 minutes)
```bash
# Push to trigger deployment
git add .
git commit -m "feat: Configure OAuth for production"
git push origin main

# Wait for Zeabur deployment to complete (~2 minutes)
```

### Step 5: Verify OAuth Works (2 minutes)
1. **Visit**: https://next14-landing.zeabur.app/login
2. **Click**: "Login with Google"
3. **Complete**: Google OAuth flow
4. **Verify**: Successfully logged in and redirected

## 🧪 Validation Commands

### Quick Validation
```bash
# Validate production configuration
npm run validate:oauth-production

# Verify deployment
npm run verify:production
```

### Manual Test
```bash
# Test HTTPS connection
curl -I https://next14-landing.zeabur.app

# Test OAuth endpoint
curl -I https://next14-landing.zeabur.app/api/auth/google
```

## 🚨 Troubleshooting Quick Fixes

### Issue: "redirect_uri_mismatch"
**Fix**: In Google Console, ensure redirect URI is exactly:
```
https://next14-landing.zeabur.app/api/auth/callback/google
```

### Issue: "invalid_client"
**Fix**: Check these environment variables in Zeabur:
- `GOOGLE_CLIENT_ID` (ends with .apps.googleusercontent.com)
- `GOOGLE_CLIENT_SECRET` (starts with GOCSPX-)

### Issue: "HTTPS required"
**Fix**: Ensure `NEXTAUTH_URL=https://next14-landing.zeabur.app` (with https://)

### Issue: "Configuration invalid"
**Fix**: Run validation script:
```bash
npm run validate:oauth-production
```

## ✅ Success Checklist

**Your OAuth is working when**:
- [ ] ✅ Login page loads: https://next14-landing.zeabur.app/login
- [ ] ✅ Google OAuth button works
- [ ] ✅ OAuth redirects to Google successfully  
- [ ] ✅ After Google login, redirects back to app
- [ ] ✅ User is logged in and can access protected pages
- [ ] ✅ New users are automatically registered in database

## 🔗 Full Documentation

**For complete setup**: [docs/PRODUCTION-OAUTH-SETUP.md](./PRODUCTION-OAUTH-SETUP.md)
**Security checklist**: [docs/OAUTH-SECURITY-CHECKLIST.md](./OAUTH-SECURITY-CHECKLIST.md)
**OAuth guide**: [docs/google-oauth-setup.md](./google-oauth-setup.md)

## 🎯 Production Ready!

**🎉 Congratulations! Your OAuth system is now production-ready.**

**Key Features**:
- ✅ Secure Google OAuth 2.0 integration
- ✅ Automatic user registration and role assignment
- ✅ Production-grade security configuration
- ✅ Error handling and monitoring ready
- ✅ Scalable for educational institution use

**Monitoring**: Check Zeabur logs for OAuth usage and any issues.

---

**⚡ Total setup time: ~15 minutes**  
**🔒 Production-secure configuration**  
**📈 Ready for educational institution deployment**

*Last Updated: 2025-08-06*