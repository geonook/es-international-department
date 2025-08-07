# Production Deployment Checklist
# 生產環境部署檢查清單

> **🚀 FINAL DEPLOYMENT CHECKLIST**  
> **最終部署檢查清單**  
> **For KCISLK ESID Info Hub production deployment to: https://kcislk-esid.zeabur.app**

## 📋 Overview | 概覽

This checklist ensures all components are properly configured for production deployment. Complete each section before proceeding to the next.

此檢查清單確保所有組件都已正確配置用於生產部署。在進行下一步之前請完成每個部分。

---

## 🔐 Phase 1: Google Cloud Console Setup | Google Cloud Console 設定

### ✅ OAuth Consent Screen Configuration
- [ ] **App Information Configured**
  - [ ] App name: `KCISLK ESID Info Hub`
  - [ ] User support email: `esid@kcislk.ntpc.edu.tw`
  - [ ] Developer contact email: `esid@kcislk.ntpc.edu.tw`
  - [ ] App logo uploaded (school logo recommended)

- [ ] **Domain Configuration**
  - [ ] Authorized domain added: `kcislk-esid.zeabur.app`
  - [ ] Domain verification completed (if required)

- [ ] **Scopes Configured**
  - [ ] `openid` scope enabled
  - [ ] `email` scope enabled  
  - [ ] `profile` scope enabled
  - [ ] `https://www.googleapis.com/auth/userinfo.email` enabled
  - [ ] `https://www.googleapis.com/auth/userinfo.profile` enabled

- [ ] **Publishing Status**
  - [ ] App published (not in testing mode) OR
  - [ ] Test users added for school community

### ✅ OAuth Client Configuration
- [ ] **Client Type & Name**
  - [ ] Application type: `Web application`
  - [ ] Name: `KCISLK ESID Production OAuth`

- [ ] **JavaScript Origins**
  - [ ] Added: `https://kcislk-esid.zeabur.app`
  - [ ] No HTTP origins (security)
  - [ ] No localhost origins in production

- [ ] **Redirect URIs**
  - [ ] Added: `https://kcislk-esid.zeabur.app/api/auth/callback/google`
  - [ ] Exact match (no trailing slash)
  - [ ] HTTPS enforced

- [ ] **Credentials Retrieved**
  - [ ] Client ID copied: `316204460450-[REDACTED].apps.googleusercontent.com`
  - [ ] Client Secret copied: `GOCSPX-[REDACTED]`

---

## 🔧 Phase 2: Zeabur Environment Configuration | Zeabur 環境配置

### ✅ Zeabur Console Setup
- [ ] **Project Access**
  - [ ] Zeabur dashboard accessible: https://dash.zeabur.com/
  - [ ] Project selected: `kcislk-esid-info-hub`
  - [ ] Environment Variables section accessible

### ✅ Critical Environment Variables
Copy-paste these exact values into Zeabur console:

```env
NODE_ENV=production
NEXTAUTH_URL=https://kcislk-esid.zeabur.app
JWT_SECRET=HzBlFAYu3gIhtbWzFhpDf+U5rDoKoIQbWv+JUquPF4s=
NEXTAUTH_SECRET=jijpSBnevnLZE9k6BlXhTL5GT2zubmXDAIh2AOVM9OQ=
GOOGLE_CLIENT_ID=316204460450-[REDACTED].apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-[REDACTED]
```

- [ ] **NODE_ENV** set to `production`
- [ ] **NEXTAUTH_URL** set to `https://kcislk-esid.zeabur.app`
- [ ] **JWT_SECRET** set to generated secret
- [ ] **NEXTAUTH_SECRET** set to generated secret
- [ ] **GOOGLE_CLIENT_ID** set to actual OAuth client ID
- [ ] **GOOGLE_CLIENT_SECRET** set to actual OAuth client secret

### ✅ Database Configuration
- [ ] **PostgreSQL Service**
  - [ ] PostgreSQL service created in Zeabur
  - [ ] Database connection string available
  - [ ] **DATABASE_URL** variable set in environment

- [ ] **Database Migration**
  - [ ] Production database schema deployed
  - [ ] Migration scripts ready for deployment
  - [ ] No seed data for production (security)

### ✅ Security Configuration
```env
ALLOWED_ORIGINS=https://kcislk-esid.zeabur.app
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

- [ ] **ALLOWED_ORIGINS** set to production domain only
- [ ] **RATE_LIMIT_MAX_REQUESTS** configured
- [ ] **RATE_LIMIT_WINDOW_MS** configured

### ✅ Optional Services (Recommended)
```env
# Email Service (optional)
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-school-email@kcislk.ntpc.edu.tw
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@kcislk.ntpc.edu.tw
EMAIL_FROM_NAME=KCISLK ESID Info Hub

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
GOOGLE_ANALYTICS_ID=your-ga-id
```

- [ ] **Email Service** configured (optional but recommended)
- [ ] **Error Tracking** configured (Sentry recommended)
- [ ] **Analytics** configured (Google Analytics optional)

---

## 🧪 Phase 3: Pre-Deployment Testing | 部署前測試

### ✅ Local Testing
- [ ] **Environment Variables Validation**
  ```bash
  npm run test:oauth-production
  ```
  - [ ] All OAuth configuration tests pass
  - [ ] Domain accessibility confirmed
  - [ ] HTTPS enforcement verified

- [ ] **Application Build**
  ```bash
  npm run build:production
  ```
  - [ ] Production build succeeds
  - [ ] No TypeScript errors
  - [ ] No linting errors

- [ ] **Database Connection**
  ```bash
  npm run test:db
  ```
  - [ ] Database connection successful
  - [ ] Migration scripts validated

### ✅ OAuth Configuration Verification
- [ ] **Credentials Match**
  - [ ] Client ID in environment matches Google Console
  - [ ] Client Secret in environment matches Google Console
  - [ ] Redirect URI matches exactly

- [ ] **Security Validation**
  - [ ] No HTTP URLs in production configuration
  - [ ] HTTPS enforced for all OAuth URLs
  - [ ] Strong JWT secrets generated (32+ characters)

---

## 🚀 Phase 4: Deployment Process | 部署流程

### ✅ Final Code Preparation
- [ ] **Code Quality**
  - [ ] All critical features completed
  - [ ] Tests passing
  - [ ] Code reviewed and approved
  - [ ] Documentation updated

- [ ] **Git Repository**
  - [ ] All changes committed to main branch
  - [ ] Repository pushed to GitHub
  - [ ] Tags created for release (optional)

### ✅ Zeabur Deployment
- [ ] **Trigger Deployment**
  - [ ] Deploy from main branch
  - [ ] Zeabur deployment initiated
  - [ ] Build process completed successfully

- [ ] **Deployment Monitoring**
  - [ ] Deployment status: SUCCESS
  - [ ] Container started successfully
  - [ ] Health checks passing
  - [ ] No critical errors in logs

### ✅ Database Deployment
- [ ] **Production Database**
  - [ ] Database migrations applied
  - [ ] Schema updated to latest version
  - [ ] Connection established successfully
  - [ ] No migration errors

---

## ✅ Phase 5: Post-Deployment Verification | 部署後驗證

### ✅ Application Access
- [ ] **Domain Access**
  - [ ] https://kcislk-esid.zeabur.app loads successfully
  - [ ] SSL certificate valid
  - [ ] No security warnings
  - [ ] Application renders correctly

- [ ] **Health Checks**
  ```bash
  curl https://kcislk-esid.zeabur.app/api/health
  ```
  - [ ] Health endpoint returns 200 OK
  - [ ] Database status: connected
  - [ ] Application status: healthy

### ✅ OAuth Flow Testing
- [ ] **Login Process**
  - [ ] Navigate to: https://kcislk-esid.zeabur.app/login
  - [ ] "Login with Google" button visible and functional
  - [ ] Click triggers redirect to Google OAuth

- [ ] **Google OAuth**
  - [ ] Google consent screen appears
  - [ ] School domain users can authenticate
  - [ ] Consent flow completes without errors
  - [ ] Redirect back to application successful

- [ ] **User Management**
  - [ ] New users created automatically
  - [ ] Role assignment works correctly:
    - [ ] `@kcislk.ntpc.edu.tw` → `teacher` role
    - [ ] `@gmail.com` → `parent` role
    - [ ] Other domains → `parent` role (default)
  - [ ] User sessions persist correctly
  - [ ] Logout function works properly

### ✅ Core Features Testing
- [ ] **Home Page**
  - [ ] Home page loads with proper content
  - [ ] Navigation menu functional
  - [ ] Responsive design works on mobile

- [ ] **Events Section**
  - [ ] Events page accessible
  - [ ] Event listing displays correctly
  - [ ] Event registration functional (if applicable)

- [ ] **Resources Section**
  - [ ] Resources page accessible
  - [ ] File downloads work correctly
  - [ ] Resource filtering functional

- [ ] **Admin Features** (for admin users)
  - [ ] Admin panel accessible
  - [ ] Content management functional
  - [ ] User role management working

### ✅ Performance & Monitoring
- [ ] **Performance Metrics**
  - [ ] Page load time < 3 seconds
  - [ ] API response time < 500ms
  - [ ] No JavaScript errors in console
  - [ ] Images and assets load correctly

- [ ] **Error Monitoring**
  - [ ] Error tracking active (if Sentry configured)
  - [ ] Application logs accessible in Zeabur
  - [ ] No critical errors reported
  - [ ] Database queries performing well

---

## 📊 Phase 6: Go-Live Checklist | 正式上線檢查清單

### ✅ Communication & Documentation
- [ ] **User Communication**
  - [ ] School community notified of new platform
  - [ ] Login instructions provided
  - [ ] Support contact information shared
  - [ ] User training materials prepared

- [ ] **Technical Documentation**
  - [ ] Production environment documented
  - [ ] Admin user guides updated
  - [ ] Troubleshooting guide available
  - [ ] Emergency contact information prepared

### ✅ Support & Maintenance
- [ ] **Monitoring Setup**
  - [ ] Uptime monitoring configured
  - [ ] Performance alerts set up
  - [ ] Database monitoring active
  - [ ] Error rate alerts configured

- [ ] **Backup & Recovery**
  - [ ] Database backup schedule configured
  - [ ] Recovery procedures tested
  - [ ] Data retention policies defined
  - [ ] Disaster recovery plan documented

### ✅ Security & Compliance
- [ ] **Security Measures**
  - [ ] All HTTP traffic redirected to HTTPS
  - [ ] Security headers configured
  - [ ] Rate limiting active
  - [ ] No sensitive data exposed in logs

- [ ] **Educational Compliance**
  - [ ] Privacy policy available and compliant
  - [ ] Terms of service appropriate for educational use
  - [ ] Student data protection measures active
  - [ ] COPPA/FERPA considerations addressed

---

## 🎉 Phase 7: Launch Confirmation | 啟動確認

### ✅ Final Verification
- [ ] **End-to-End Testing**
  - [ ] Complete user journey tested successfully
  - [ ] All critical features functional
  - [ ] Performance acceptable under expected load
  - [ ] Error handling graceful and user-friendly

- [ ] **Stakeholder Approval**
  - [ ] School administration approval received
  - [ ] IT department sign-off completed
  - [ ] User acceptance testing passed
  - [ ] Go-live permission granted

### ✅ Launch Activities
- [ ] **Go-Live Process**
  - [ ] Final deployment completed
  - [ ] DNS propagation confirmed (if applicable)
  - [ ] Application fully accessible to users
  - [ ] Real user traffic flowing successfully

- [ ] **Post-Launch Monitoring**
  - [ ] First hour monitoring: no critical issues
  - [ ] First day monitoring: performance stable
  - [ ] User feedback collection active
  - [ ] Support tickets monitored and resolved

---

## 🏆 SUCCESS CRITERIA | 成功標準

**✅ Deployment is successful when all these conditions are met:**

1. **Accessibility**: https://kcislk-esid.zeabur.app is fully accessible to users
2. **Authentication**: Google OAuth login works without errors for school community
3. **User Management**: New users are automatically created with correct role assignment
4. **Core Features**: All main features (Events, Resources, Admin) are functional
5. **Performance**: Page load times and API responses are acceptable
6. **Security**: All security measures are active and effective
7. **Monitoring**: Health checks and error monitoring are operational
8. **Support**: Support processes are in place and team is ready

---

## 📞 Emergency Contacts | 緊急聯絡資訊

**Technical Support**: esid@kcislk.ntpc.edu.tw  
**Zeabur Support**: https://docs.zeabur.com/  
**Google Cloud Support**: https://console.cloud.google.com/support  

**Emergency Rollback**: Contact technical team immediately if critical issues arise

---

## 📝 Deployment Sign-off | 部署簽核

**Deployment Date**: _______________  
**Deployed by**: _______________  
**Technical Lead**: _______________  
**School Admin Approval**: _______________  

**Deployment Status**: [ ] SUCCESS [ ] FAILED  
**Notes**: 
___________________________________________________  
___________________________________________________  

---

*Checklist Version: 1.0*  
*Last Updated: 2025-08-07*  
*Target Domain: https://kcislk-esid.zeabur.app*  
*Project: KCISLK ESID Info Hub*