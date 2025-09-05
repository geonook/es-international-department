# 🔐 Google OAuth Setup Guide - KCISLK ESID Info Hub

## 🚨 Current Issue: 401 Invalid Client Error

Your application is currently using **dummy OAuth credentials**:
```
GOOGLE_CLIENT_ID=test-google-client-id
GOOGLE_CLIENT_SECRET=test-google-client-secret
```

These dummy values cause the **401 invalid_client** error when users try to login.

## ✅ Solution: Setup Real Google OAuth Application

### **Step 1: Google Cloud Console Setup**

1. **Visit** [Google Cloud Console](https://console.developers.google.com/)
2. **Create or select your project**
3. **Enable APIs**:
   - Google+ API (if not deprecated)
   - Google OAuth2 API
   - Google Sign-In API

### **Step 2: Create OAuth 2.0 Credentials**

1. **Navigate to "Credentials"**
2. **Click "Create Credentials" → "OAuth 2.0 Client IDs"**
3. **Select Application Type: "Web application"**
4. **Set Name**: `KCISLK ESID Info Hub`

### **Step 3: Configure Authorized URIs**

**Authorized JavaScript origins:**
```
https://next14-landing.zeabur.app
```

**Authorized redirect URIs:**
```
https://next14-landing.zeabur.app/api/auth/callback/google
```

### **Step 4: Copy Credentials**

After creating, you'll get:
- **Client ID**: `something.apps.googleusercontent.com`
- **Client Secret**: `a-secret-string`

### **Step 5: Update Zeabur Environment Variables**

In your Zeabur dashboard, replace these environment variables:

```bash
# Replace with your REAL Google OAuth credentials
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret

# Ensure these are correct
NEXTAUTH_URL=https://next14-landing.zeabur.app
NEXTAUTH_SECRET=your-nextauth-secret-32-chars-long
```

## 🧪 Testing OAuth Flow

### **Test Pages**

1. **OAuth Test Page**: https://next14-landing.zeabur.app/test-oauth
   - Shows detailed OAuth configuration
   - Tests Google authentication flow

2. **Login Page**: https://next14-landing.zeabur.app/login
   - Production login interface

3. **Admin Dashboard**: https://next14-landing.zeabur.app/admin
   - Requires successful OAuth login + admin permissions

### **Expected Flow**

1. User clicks "Login with Google"
2. Redirected to Google OAuth consent screen
3. User approves permissions
4. Redirected back to application with auth code
5. Application exchanges code for tokens
6. User is logged in and can access authorized pages

## 🔍 Debugging Common Issues

### **401 Invalid Client**
- **Cause**: Wrong `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET`
- **Fix**: Verify credentials in Google Cloud Console

### **400 Redirect URI Mismatch**
- **Cause**: Redirect URI not added to Google OAuth app
- **Fix**: Add `https://next14-landing.zeabur.app/api/auth/callback/google` to authorized redirect URIs

### **403 Access Blocked**
- **Cause**: Google OAuth app not published or in testing mode
- **Fix**: Publish OAuth app or add test users

## 📋 Final Checklist

- [ ] Google Cloud project created
- [ ] OAuth 2.0 client ID created
- [ ] Correct redirect URI configured
- [ ] Real credentials added to Zeabur environment variables
- [ ] Application redeployed with new environment variables
- [ ] OAuth flow tested successfully
- [ ] Admin access verified

## 🆘 Support

If you encounter issues:
1. Check browser console for detailed error messages
2. Verify all URLs match exactly (no trailing slashes)
3. Ensure your Google Cloud project has OAuth consent screen configured
4. Test with the `/test-oauth` page for detailed debugging information

---

**After completing these steps, your Google OAuth login should work correctly!** 🎉