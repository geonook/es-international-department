# Google OAuth Console Verification for Staging Environment
# Staging 環境 Google OAuth Console 驗證指南

> **Target Environment**: Staging (`https://next14-landing.zeabur.app`)  
> **Your OAuth Client ID**: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`  
> **Your OAuth Secret**: `YOUR_GOOGLE_CLIENT_SECRET`  
> **Date**: 2025-09-05

## 🎯 **Verification Purpose**

Since your staging environment uses a different `GOOGLE_CLIENT_SECRET` than our development environment, we need to verify that your Google OAuth Console is properly configured for the staging domain `next14-landing.zeabur.app`.

## 🔍 **Step-by-Step Verification Process**

### Step 1: Access Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Sign in with your Google account that has access to the OAuth credentials
3. Select your project (likely: "KCISLK ESID Info Hub" or similar)

### Step 2: Navigate to OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Look for **OAuth 2.0 Client IDs** section
3. Find your client: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
4. Click on it to open configuration

### Step 3: Verify Authorized Domains
Check that the following domains are listed under **Authorized JavaScript origins**:

✅ **Required for Staging**:
```
https://next14-landing.zeabur.app
```

✅ **Should also have (for production)**:
```
https://kcislk-infohub.zeabur.app
```

⚠️ **Optional (for development)**:
```
http://localhost:3001
```

### Step 4: Verify Authorized Redirect URIs
Check that the following URIs are listed under **Authorized redirect URIs**:

✅ **Required for Staging**:
```
https://next14-landing.zeabur.app/api/auth/callback/google
```

✅ **Should also have (for production)**:
```
https://kcislk-infohub.zeabur.app/api/auth/callback/google
```

⚠️ **Optional (for development)**:
```
http://localhost:3001/api/auth/callback/google
```

## 🛠️ **If Configuration is Missing**

### Adding Authorized Domain (if missing)
1. Click **+ ADD URI** under "Authorized JavaScript origins"
2. Add: `https://next14-landing.zeabur.app`
3. Click **Save**

### Adding Redirect URI (if missing)
1. Click **+ ADD URI** under "Authorized redirect URIs"
2. Add: `https://next14-landing.zeabur.app/api/auth/callback/google`
3. Click **Save**

## ⚠️ **Common Issues & Solutions**

### Issue 1: "This app's request is invalid" Error
**Cause**: Missing authorized domain or redirect URI  
**Solution**: Follow Step 4 above to add missing configurations

### Issue 2: "已封鎖存取權" (Access Blocked) Error  
**Cause**: Domain mismatch between your staging URL and OAuth configuration  
**Solution**: Ensure exact match: `https://next14-landing.zeabur.app` (no trailing slash)

### Issue 3: "redirect_uri_mismatch" Error
**Cause**: Redirect URI doesn't exactly match OAuth console configuration  
**Solution**: Verify callback URL is exactly: `https://next14-landing.zeabur.app/api/auth/callback/google`

## 🧪 **Testing Your OAuth Configuration**

### Quick Test Procedure
1. Wait 5-10 minutes after making changes (Google's propagation delay)
2. Open: https://next14-landing.zeabur.app/login
3. Click "使用 Google 帳戶登入" or "Sign in with Google"
4. Should redirect to Google OAuth without errors
5. After Google authorization, should redirect back to your app successfully

### Test Endpoints
```bash
# Test OAuth providers endpoint
curl https://next14-landing.zeabur.app/api/auth/providers

# Expected response should include Google provider
{
  "google": {
    "id": "google",
    "name": "Google",
    "type": "oauth",
    "signinUrl": "https://next14-landing.zeabur.app/api/auth/signin/google",
    "callbackUrl": "https://next14-landing.zeabur.app/api/auth/callback/google"
  }
}
```

## ✅ **Verification Checklist**

Complete this checklist to confirm your Google OAuth Console is properly configured:

### OAuth Console Configuration
- [ ] **Project Selected**: Correct Google Cloud project
- [ ] **Client ID Found**: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
- [ ] **Authorized Domain Added**: `https://next14-landing.zeabur.app`
- [ ] **Redirect URI Added**: `https://next14-landing.zeabur.app/api/auth/callback/google`
- [ ] **Changes Saved**: Clicked "Save" in Google Console

### Functional Testing
- [ ] **OAuth Page Loads**: https://next14-landing.zeabur.app/login loads without errors
- [ ] **Google Button Works**: Clicking Google login doesn't show "access blocked"
- [ ] **OAuth Flow Completes**: Successfully redirects through Google and back
- [ ] **Login Successful**: User can successfully authenticate

### Environment Consistency
- [ ] **Same Client ID**: Staging uses the same ID as shown above
- [ ] **Correct Secret**: Staging uses your actual Google Client Secret
- [ ] **Proper Domain**: All URLs point to `https://next14-landing.zeabur.app`

## 📝 **Expected Configuration Summary**

Your Google OAuth 2.0 Client should have:

### JavaScript Origins
```
https://next14-landing.zeabur.app      ← CRITICAL for staging
https://kcislk-infohub.zeabur.app      ← For production
http://localhost:3001                   ← Optional for development
```

### Authorized Redirect URIs
```
https://next14-landing.zeabur.app/api/auth/callback/google      ← CRITICAL for staging
https://kcislk-infohub.zeabur.app/api/auth/callback/google      ← For production  
http://localhost:3001/api/auth/callback/google                  ← Optional for development
```

## 🚀 **Success Indicators**

When everything is configured correctly, you should see:

1. **Login Page**: No errors when loading https://next14-landing.zeabur.app/login
2. **OAuth Redirect**: Smooth redirect to Google OAuth screen
3. **No Blocking Errors**: No "已封鎖存取權" or "This app's request is invalid" messages
4. **Successful Return**: After Google authentication, proper redirect back to your app
5. **User Creation**: New users automatically created in your database

## 📞 **Next Steps After Verification**

Once you've confirmed your Google OAuth Console is properly configured:

1. ✅ **Mark verification complete**
2. 🧪 **Test the full login flow**
3. 🔄 **Optional**: Add the enhancement environment variables from our optimization guide
4. 📊 **Monitor**: Watch for any OAuth-related errors in staging logs

---

**Status**: Ready for verification  
**Priority**: High (required for OAuth functionality)  
**Generated**: 2025-09-05  
**Version**: v1.5.0-stable