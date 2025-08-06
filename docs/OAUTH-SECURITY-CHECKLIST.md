# OAuth Security Checklist for Production
# OAuth 生產環境安全檢查清單

> **🔒 SECURITY CRITICAL - Review before deployment**  
> **安全關鍵 - 部署前必須檢查**  
> **Target**: https://landing-app-v2.zeabur.app

## 🛡️ Pre-Deployment Security Checklist

### ✅ Environment Configuration Security

#### Critical Requirements
- [ ] **NODE_ENV=production** - Production environment set
- [ ] **HTTPS Only** - All URLs use HTTPS (no HTTP)
- [ ] **Strong Secrets** - JWT_SECRET and NEXTAUTH_SECRET are 32+ characters
- [ ] **No Placeholders** - No "CHANGE_THIS" or "YOUR_VALUE" in production
- [ ] **No Development Values** - No localhost or 127.0.0.1 URLs
- [ ] **Environment Variables in Zeabur** - Secrets stored in Zeabur console, not code

#### Recommended Security
- [ ] **Database Security** - Production database with strong password
- [ ] **Rate Limiting** - Appropriate limits for production load
- [ ] **CORS Restriction** - Only production domain in ALLOWED_ORIGINS
- [ ] **Error Monitoring** - Sentry or similar error tracking configured
- [ ] **Logging** - Appropriate log levels (no debug in production)

### 🔐 Google OAuth Security

#### Google Cloud Console Configuration
- [ ] **Production Project** - Separate Google Cloud project for production
- [ ] **OAuth Consent Screen** - Properly configured for public use
- [ ] **Verified Domain** - Production domain verified in Google Console
- [ ] **Correct Redirect URIs** - Exact match: `https://landing-app-v2.zeabur.app/api/auth/callback/google`
- [ ] **Scope Limitation** - Only necessary scopes requested (email, profile)
- [ ] **Client Credentials** - Production-specific Client ID and Secret

#### OAuth Security Headers
- [ ] **Secure Cookies** - httpOnly, secure, sameSite configured
- [ ] **CSRF Protection** - State parameter validates correctly
- [ ] **Token Validation** - ID tokens properly verified
- [ ] **Session Security** - Appropriate session timeout and rotation

### 🌐 Network Security

#### HTTPS and Transport Security
- [ ] **TLS 1.2+** - Modern TLS version enforced
- [ ] **HSTS Headers** - HTTP Strict Transport Security enabled
- [ ] **Secure Redirect** - All HTTP redirects to HTTPS
- [ ] **Certificate Validation** - Valid SSL certificate for production domain

#### API Security
- [ ] **Authentication Required** - Protected endpoints require valid JWT
- [ ] **Authorization Checks** - Role-based access control implemented
- [ ] **Input Validation** - All user inputs validated and sanitized
- [ ] **Error Handling** - No sensitive information in error messages

### 📊 Data Protection

#### User Data Security
- [ ] **Data Minimization** - Only necessary user data collected
- [ ] **Secure Storage** - User passwords not stored (OAuth only)
- [ ] **Database Security** - Database connection encrypted
- [ ] **Data Retention** - Appropriate data retention policies

#### Privacy Compliance
- [ ] **Privacy Policy** - Clear privacy policy for OAuth data usage
- [ ] **Consent Management** - User consent properly managed
- [ ] **Data Access** - Users can view/delete their data
- [ ] **Audit Logging** - Security events logged for monitoring

## 🧪 Security Testing Checklist

### Automated Security Testing
- [ ] **OAuth Flow Testing** - Complete OAuth flow works correctly
- [ ] **Token Validation** - JWT tokens properly validated
- [ ] **Session Testing** - Session management secure
- [ ] **Error Handling** - Security errors handled gracefully

### Manual Security Testing
- [ ] **CSRF Testing** - Cross-site request forgery protection works
- [ ] **XSS Testing** - Cross-site scripting prevention effective
- [ ] **Injection Testing** - SQL/NoSQL injection prevention validated
- [ ] **Authentication Bypass** - Cannot bypass authentication

### Penetration Testing (Recommended)
- [ ] **OAuth Security Scan** - Third-party OAuth security assessment
- [ ] **Web Application Scan** - Comprehensive security scan
- [ ] **Infrastructure Scan** - Server and network security assessment

## 🚨 Security Monitoring

### Production Monitoring Setup
- [ ] **Error Tracking** - Sentry or similar service configured
- [ ] **Security Alerts** - Alerts for suspicious activities
- [ ] **Performance Monitoring** - API performance and availability
- [ ] **Audit Logging** - Security events logged and monitored

### Security Metrics
- [ ] **Failed Login Attempts** - Monitor and alert on excessive failures
- [ ] **Token Abuse** - Monitor for token reuse or manipulation
- [ ] **Rate Limit Violations** - Track and respond to rate limit hits
- [ ] **Security Headers** - Verify security headers are sent

## 🔄 Incident Response

### Preparation
- [ ] **Incident Response Plan** - Document procedures for security incidents
- [ ] **Contact Information** - Security team contact details accessible
- [ ] **Rollback Plan** - Quick rollback procedure documented
- [ ] **Communication Plan** - User communication strategy for incidents

### Response Capabilities
- [ ] **Log Analysis** - Ability to quickly analyze security logs
- [ ] **Token Revocation** - Ability to revoke compromised tokens
- [ ] **User Account Control** - Ability to disable compromised accounts
- [ ] **System Isolation** - Ability to isolate affected systems

## 📚 Security Documentation

### Required Documentation
- [ ] **Security Architecture** - Document security design decisions
- [ ] **OAuth Integration** - Document OAuth flow and security measures
- [ ] **Deployment Guide** - Secure deployment procedures
- [ ] **Troubleshooting** - Security troubleshooting guide

### Team Knowledge
- [ ] **Security Training** - Team understands OAuth security
- [ ] **Best Practices** - Team follows security best practices
- [ ] **Update Procedures** - Process for security updates
- [ ] **Vulnerability Management** - Process for handling security issues

## 🎯 Production Launch Security Checklist

### Final Pre-Launch Review
- [ ] **Complete Security Audit** - All checklist items verified
- [ ] **Third-Party Review** - External security review completed (recommended)
- [ ] **Penetration Testing** - Security testing completed
- [ ] **Risk Assessment** - Security risks documented and accepted

### Launch Readiness
- [ ] **Monitoring Active** - All security monitoring active
- [ ] **Incident Response Ready** - Response team and procedures ready
- [ ] **Backup and Recovery** - Data backup and recovery tested
- [ ] **Communication Ready** - User communication channels ready

### Post-Launch
- [ ] **Security Monitoring** - Continuous monitoring active
- [ ] **Regular Reviews** - Schedule regular security reviews
- [ ] **Update Management** - Process for security updates active
- [ ] **Compliance Monitoring** - Ongoing compliance verification

## 🚩 Red Flags - STOP Deployment If Present

### Critical Security Issues
- ❌ **HTTP in Production** - Any HTTP URLs in production configuration
- ❌ **Weak Secrets** - Secrets less than 32 characters or using common values
- ❌ **Development Credentials** - Development OAuth credentials in production
- ❌ **Open CORS** - CORS allowing all origins (*)
- ❌ **Debug Mode** - Debug or verbose logging enabled in production
- ❌ **No Error Monitoring** - No error tracking or monitoring configured
- ❌ **Unverified Domain** - Google OAuth domain not verified
- ❌ **Missing HTTPS** - SSL certificate issues or mixed content

### Warning Signs
- ⚠️ **Placeholder Values** - Any configuration using placeholder values
- ⚠️ **Wide Permissions** - OAuth requesting unnecessary permissions
- ⚠️ **No Rate Limiting** - No rate limiting configured
- ⚠️ **Weak Rate Limits** - Rate limits too permissive for production
- ⚠️ **No Monitoring** - Limited or no application monitoring
- ⚠️ **No Backup** - No backup or disaster recovery plan

## ✅ Security Validation Commands

### Environment Validation
```bash
# Run production OAuth validation
npx tsx scripts/validate-production-oauth.ts

# Check environment health
npx tsx scripts/check-env.ts

# Validate all environment variables
npx tsx scripts/validate-env.ts
```

### Manual Security Tests
```bash
# Test OAuth flow
curl -I "https://landing-app-v2.zeabur.app/api/auth/google"

# Check security headers
curl -I "https://landing-app-v2.zeabur.app/"

# Test rate limiting
for i in {1..10}; do curl -I "https://landing-app-v2.zeabur.app/api/health"; done
```

## 🎉 Security Sign-Off

**Security Review Completed By**: ________________________  
**Date**: ________________________  
**Security Approval**: ✅ APPROVED / ❌ DENIED  
**Notes**: ________________________

**Deployment Authorization**: ________________________  
**Date**: ________________________  

---

**🔒 This checklist must be completed and signed off before production deployment**  
**安全檢查清單必須在生產部署前完成並簽核**

*Version: 1.0.0*  
*Last Updated: 2025-08-06*  
*Target: https://landing-app-v2.zeabur.app*