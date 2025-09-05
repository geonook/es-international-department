# Version Alignment Deployment Guide v1.5.0
# 版本對齊部署指南 v1.5.0

> **Version**: v1.5.0-stable  
> **Date**: 2025-09-05  
> **Purpose**: Align all environments to the same stable version  
> **目的**: 將所有環境對齊到相同的穩定版本

## 📊 Current Environment Status | 當前環境狀態

| Environment | Current Version | Target Version | Status |
|------------|-----------------|----------------|--------|
| **Development** | `759a370` (latest) | v1.5.0-stable | ✅ Ready |
| **Staging** | Unknown (needs check) | v1.5.0-stable | 🔄 Pending |
| **Production** | Unknown (needs check) | v1.5.0-stable | 🔄 Pending |

### Key Updates in v1.5.0-stable
- ✅ Multi-environment support (development, staging, production)
- ✅ NODE_ENV=staging validation support
- ✅ Prisma client generation fixes for Zeabur
- ✅ SMTP validation bypass for disabled email provider
- ✅ Google OAuth configuration guides
- ✅ Environment-specific documentation

## 🚀 Deployment Instructions | 部署指示

### Phase 1: Staging Environment Deployment
**Target**: https://next14-landing.zeabur.app

#### Step 1: Update Environment Variables in Zeabur
```env
NODE_ENV=staging
DATABASE_URL=postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur
JWT_SECRET=Tr4q2KulnbpxWMsUneujJe/G6M+6lF1N2On6DtAUfDI=
NEXTAUTH_SECRET=QIXalhOBH2bn4i22VC4Pc2e8wg/6mkBh0tRuKsO7hiE=
NEXTAUTH_URL=https://next14-landing.zeabur.app
ALLOWED_ORIGINS=https://next14-landing.zeabur.app
GOOGLE_CLIENT_ID=[YOUR_ACTUAL_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[YOUR_ACTUAL_CLIENT_SECRET]
EMAIL_PROVIDER=disabled
SKIP_ENV_VALIDATION=0
```

#### Step 2: Update Google OAuth Console
1. Add authorized domain: `next14-landing.zeabur.app`
2. Add redirect URI: `https://next14-landing.zeabur.app/api/auth/callback/google`

#### Step 3: Deploy to Staging
- Zeabur will automatically deploy when main branch is updated
- Monitor deployment logs for any errors
- Verify deployment with health check: `https://next14-landing.zeabur.app/api/health`

### Phase 2: Production Environment Deployment
**Target**: https://kcislk-infohub.zeabur.app

#### Step 1: Update Environment Variables in Zeabur
```env
NODE_ENV=production
DATABASE_URL=postgresql://root:p356lGH1k4Kd7zefirJ0YSV8MC29ygON@tpe1.clusters.zeabur.com:32312/kcislk_esid_prod
JWT_SECRET=yVVJWVI6c3VjLKY0X6vNnaTRJVxHHu1zEvYaYWvwAAI=
NEXTAUTH_SECRET=WtDE420rcUJjy7S1Fz6i2+Sksp/gHDq1v7wzkGSRqsE=
NEXTAUTH_URL=https://kcislk-infohub.zeabur.app
ALLOWED_ORIGINS=https://kcislk-infohub.zeabur.app
GOOGLE_CLIENT_ID=[YOUR_ACTUAL_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[YOUR_ACTUAL_CLIENT_SECRET]
EMAIL_PROVIDER=disabled
SKIP_ENV_VALIDATION=0
```

#### Step 2: Verify Google OAuth Console
Ensure the following are configured:
- Authorized domain: `kcislk-infohub.zeabur.app`
- Redirect URI: `https://kcislk-infohub.zeabur.app/api/auth/callback/google`

#### Step 3: Deploy to Production
- Deploy during low-traffic period
- Monitor deployment logs
- Verify deployment with health check: `https://kcislk-infohub.zeabur.app/api/health`

## ✅ Deployment Verification Checklist

### For Each Environment:

#### 🔍 Basic Health Checks
```bash
# Health check
curl https://[DOMAIN]/api/health

# Check build info
curl https://[DOMAIN]/api/public/info
```

#### 🔐 OAuth Functionality
- [ ] Login page loads without errors
- [ ] Google OAuth button works
- [ ] No "Access blocked" errors
- [ ] Successful authentication flow
- [ ] User data correctly stored

#### 🎨 UI/UX Verification
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Resources section accessible
- [ ] Events section functional
- [ ] Admin panel accessible (for admin users)

#### 📊 Database Connectivity
- [ ] Can create new records
- [ ] Can read existing data
- [ ] Can update records
- [ ] Can delete records

#### 🔧 Performance Checks
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] No console errors
- [ ] No 500 errors

## 🔄 Rollback Plan

If issues occur during deployment:

### Immediate Rollback Steps
1. **Zeabur Dashboard**:
   - Navigate to deployment history
   - Select previous stable deployment
   - Click "Rollback to this version"

2. **Git Rollback** (if needed):
   ```bash
   git checkout v1.4.0-stable  # Previous stable tag
   git push origin v1.4.0-stable:main --force
   ```

3. **Environment Variables**:
   - Restore previous environment variables if changed
   - Verify database connections

## 📝 Post-Deployment Tasks

### After Successful Deployment:
1. **Documentation Update**:
   - Update deployment status in this document
   - Record any issues encountered
   - Document any configuration changes

2. **Team Communication**:
   - Notify team of successful deployment
   - Share any important changes
   - Update release notes

3. **Monitoring Setup**:
   - Set up alerts for error rates
   - Monitor performance metrics
   - Track user feedback

## 🎯 Success Criteria

Deployment is considered successful when:
- ✅ All environments running v1.5.0-stable
- ✅ No critical errors in logs
- ✅ OAuth authentication working
- ✅ Database operations normal
- ✅ Performance metrics acceptable
- ✅ User feedback positive

## 📊 Deployment Status Tracking

### Staging Environment
- **Deployment Date**: _____________________
- **Version Deployed**: v1.5.0-stable
- **Deployed By**: _____________________
- **Status**: ⬜ Pending | ⬜ In Progress | ⬜ Complete
- **Notes**: _____________________

### Production Environment
- **Deployment Date**: _____________________
- **Version Deployed**: v1.5.0-stable
- **Deployed By**: _____________________
- **Status**: ⬜ Pending | ⬜ In Progress | ⬜ Complete
- **Notes**: _____________________

## 🆘 Troubleshooting Guide

### Common Issues and Solutions:

#### Issue: OAuth "Access blocked" error
**Solution**: 
- Verify Google Console redirect URIs match exactly
- Check NEXTAUTH_URL environment variable
- Ensure authorized domains are configured

#### Issue: Database connection failures
**Solution**:
- Verify DATABASE_URL is correct
- Check database server status
- Ensure Prisma client is generated

#### Issue: Environment validation failures
**Solution**:
- Check all required environment variables are set
- Verify NODE_ENV is correct (staging/production)
- Ensure no typos in variable names

#### Issue: Build failures
**Solution**:
- Check Node.js version compatibility
- Verify all dependencies installed
- Review build logs for specific errors

## 📚 Reference Documents

- [Staging Environment Configuration](./STAGING-ENV-VARS-CORRECTED-NEXT14.md)
- [Google OAuth Setup Guide](./GOOGLE-CONSOLE-OAUTH-SETUP-GUIDE.md)
- [Emergency Fix Guide](./EMERGENCY-PRODUCTION-FIX-GUIDE.md)
- [Multi-Environment Setup](./MULTI-ENVIRONMENT-SETUP-COMPLETE.md)

## 🏁 Conclusion

This guide ensures all environments are aligned to v1.5.0-stable with:
- Consistent codebase across all environments
- Proper environment-specific configurations
- Validated OAuth functionality
- Stable database connections

Follow this guide carefully to ensure smooth deployment and minimal downtime.

---
**Version**: v1.5.0-stable  
**Generated**: 2025-09-05  
**Status**: Ready for deployment