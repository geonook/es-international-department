# Security Best Practices Guide
# 安全最佳實務指南

> **🔐 SECURITY GUARDIAN HANDBOOK**  
> **安全守護者手冊**  
> **For KCISLK ESID Info Hub Development & Operations**  
> **適用於 KCISLK ESID 資訊中心開發與營運**

## 📋 Overview | 概述

This guide provides comprehensive security best practices for maintaining and enhancing the security posture of the KCISLK ESID Info Hub. Follow these guidelines to ensure continued protection of user data and system integrity.

本指南提供維護和增強 KCISLK ESID 資訊中心安全態勢的全面安全最佳實務。遵循這些指導原則以確保用戶數據和系統完整性的持續保護。

## 🔑 Credential Management | 憑證管理

### ✅ DO - 正確做法

1. **Environment Variables | 環境變數:**
   ```bash
   # Use strong, unique secrets for each environment
   # Generate with: openssl rand -base64 32
   JWT_SECRET="[32+ character random string]"
   NEXTAUTH_SECRET="[32+ character random string]"
   ```

2. **OAuth Credentials | OAuth 憑證:**
   ```env
   # Always use HTTPS-only redirect URIs
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret"
   NEXTAUTH_URL="https://your-production-domain.com"
   ```

3. **Database Security | 資料庫安全:**
   ```env
   # Use managed database services with encryption
   DATABASE_URL="postgresql://user:secure-password@host:5432/db?sslmode=require"
   ```

### ❌ AVOID - 避免做法

- Never commit actual secrets to version control
- Don't use weak or default passwords
- Avoid HTTP URLs in production OAuth configuration
- Don't share credentials via email or chat

- 絕不將實際機密提交到版本控制
- 不使用弱密碼或預設密碼
- 生產環境 OAuth 配置中避免使用 HTTP URL
- 不通過電子郵件或聊天共享憑證

## 🛡️ OAuth Security | OAuth 安全

### Google OAuth Configuration | Google OAuth 配置

#### Required Security Settings | 必需的安全設定

```javascript
// OAuth consent screen configuration
const oauthConsentConfig = {
  userType: "External", // For public school access
  scopes: [
    "openid",
    "email", 
    "profile"
  ], // Minimal scopes only
  authorizedDomains: [
    "kcislk-infohub.zeabur.app"
  ], // Exact domain only
  testUsers: [
    // Add specific test users during development
    "test-teacher@kcislk.ntpc.edu.tw"
  ]
};

// OAuth client configuration  
const oauthClientConfig = {
  applicationType: "Web application",
  authorizedJavaScriptOrigins: [
    "https://kcislk-infohub.zeabur.app" // HTTPS only
  ],
  authorizedRedirectURIs: [
    "https://kcislk-infohub.zeabur.app/api/auth/callback/google" // Exact match
  ]
};
```

#### Security Validation Checklist | 安全驗證檢查清單

- [ ] ✅ HTTPS enforced for all OAuth URLs
- [ ] ✅ Exact domain match (no wildcards)
- [ ] ✅ Minimal scopes requested
- [ ] ✅ Proper error handling for OAuth failures
- [ ] ✅ Session timeout configured appropriately
- [ ] ✅ CSRF protection enabled

## 🏫 Educational Institution Compliance | 教育機構合規

### FERPA Compliance | FERPA 合規

**Family Educational Rights and Privacy Act Requirements:**

1. **Data Collection Limitations | 數據收集限制:**
   ```typescript
   // Only collect necessary authentication data
   interface UserProfile {
     email: string;          // For authentication
     name: string;           // For display purposes  
     role: 'teacher' | 'parent'; // For access control
     // NO educational records or grades
   }
   ```

2. **Access Controls | 存取控制:**
   ```typescript
   // Role-based access control
   const checkAccess = (user: User, resource: string) => {
     if (user.role === 'teacher' && user.email.endsWith('@kcislk.ntpc.edu.tw')) {
       return hasTeacherAccess(resource);
     }
     return hasParentAccess(resource, user);
   };
   ```

### COPPA Compliance | COPPA 合規

**Children's Online Privacy Protection Act Considerations:**

- ✅ No direct data collection from children under 13
- ✅ School-supervised environment with teacher oversight
- ✅ Parental notification through existing school channels
- ✅ Educational purpose clearly defined and documented

## 🔒 Application Security | 應用安全

### Input Validation | 輸入驗證

```typescript
// Always validate and sanitize user input
import { z } from 'zod';

const userInputSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s\u4e00-\u9fff]+$/),
  message: z.string().max(1000)
});

// Validate before processing
const validateInput = (data: unknown) => {
  try {
    return userInputSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid input format');
  }
};
```

### Rate Limiting | 速率限制

```typescript
// Implement rate limiting to prevent abuse
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
};
```

### Security Headers | 安全標頭

```typescript
// Configure security headers
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' accounts.google.com",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

## 🗄️ Database Security | 資料庫安全

### Connection Security | 連接安全

```typescript
// Always use SSL/TLS for database connections
const databaseConfig = {
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  },
  connectionString: process.env.DATABASE_URL,
  max: 20, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};
```

### Data Encryption | 數據加密

```sql
-- Encrypt sensitive data at rest
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  encrypted_name TEXT, -- Use encryption for PII
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Query Security | 查詢安全

```typescript
// Always use parameterized queries
const getUserByEmail = async (email: string) => {
  // ✅ SECURE - Parameterized query
  return await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true }
  });
  
  // ❌ NEVER DO - SQL injection risk
  // const query = `SELECT * FROM users WHERE email = '${email}'`;
};
```

## 🚀 Deployment Security | 部署安全

### Environment Configuration | 環境配置

```bash
# Production environment security checklist
export NODE_ENV="production"
export NEXTAUTH_URL="https://kcislk-infohub.zeabur.app"
export JWT_SECRET="$(openssl rand -base64 32)"
export NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Security configurations
export ALLOWED_ORIGINS="https://kcislk-infohub.zeabur.app"
export RATE_LIMIT_MAX_REQUESTS="100"
export RATE_LIMIT_WINDOW_MS="900000"
export SKIP_ENV_VALIDATION="0"
```

### SSL/TLS Configuration | SSL/TLS 配置

```javascript
// Enforce HTTPS in production
const httpsConfig = {
  // Redirect HTTP to HTTPS
  enforceHTTPS: true,
  // Use strong cipher suites
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384'
  ].join(':'),
  // Minimum TLS version
  minVersion: 'TLSv1.2'
};
```

## 📊 Monitoring & Alerting | 監控與警報

### Security Event Monitoring | 安全事件監控

```typescript
// Monitor critical security events
const securityEvents = {
  // Failed login attempts
  loginFailure: {
    threshold: 5, // Alert after 5 failed attempts
    window: '5m', // Within 5 minutes
    action: 'block_ip'
  },
  
  // Unusual access patterns
  accessPattern: {
    threshold: 100, // Requests per minute
    window: '1m',
    action: 'rate_limit'
  },
  
  // Database errors
  databaseError: {
    threshold: 10, // Errors per hour
    window: '1h',
    action: 'alert_admin'
  }
};
```

### Health Check Implementation | 健康檢查實施

```typescript
// Comprehensive health check endpoint
export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    checks: {
      database: await checkDatabase(),
      oauth: await checkOAuthConfig(),
      ssl: await checkSSLCertificate()
    }
  };
  
  return Response.json(healthCheck);
}
```

## 🔄 Incident Response | 事件回應

### Security Incident Procedure | 安全事件程序

1. **Detection | 檢測:**
   - Automated monitoring alerts
   - User reports of suspicious activity
   - System performance anomalies

2. **Assessment | 評估:**
   - Determine incident severity (Critical/High/Medium/Low)
   - Identify affected systems and data
   - Document initial findings

3. **Containment | 控制:**
   - Isolate affected systems
   - Prevent further damage
   - Preserve evidence for analysis

4. **Recovery | 恢復:**
   - Restore systems to secure state
   - Apply security patches
   - Verify system integrity

5. **Post-Incident | 事後處理:**
   - Conduct root cause analysis
   - Update security procedures
   - Communicate with stakeholders

### Emergency Contacts | 緊急聯絡資訊

```yaml
security_contacts:
  primary: "esid@kcislk.ntpc.edu.tw"
  it_department: "it-support@kcislk.ntpc.edu.tw" 
  cloud_support:
    zeabur: "https://docs.zeabur.com/support"
    google_cloud: "https://cloud.google.com/support"

escalation_matrix:
  critical: "immediate_notification"  # Within 15 minutes
  high: "urgent_notification"        # Within 1 hour  
  medium: "standard_notification"    # Within 4 hours
  low: "next_business_day"          # Next business day
```

## 📚 Security Training & Awareness | 安全培訓與意識

### Developer Security Guidelines | 開發者安全指南

1. **Secure Coding Practices | 安全編程實務:**
   - Always validate input data
   - Use parameterized queries for database access
   - Implement proper error handling without exposing sensitive information
   - Keep dependencies updated and scan for vulnerabilities

2. **Code Review Checklist | 代碼審查檢查清單:**
   - [ ] No hardcoded secrets or credentials
   - [ ] Proper input validation implemented
   - [ ] Authentication and authorization checks in place
   - [ ] Error messages don't reveal sensitive information
   - [ ] Dependencies are up-to-date and secure

### User Security Education | 用戶安全教育

**For School Staff | 學校工作人員:**
- Use strong, unique passwords for all accounts
- Enable two-factor authentication when available
- Be cautious of phishing attempts via email
- Report suspicious system behavior immediately

**For Parents/Guardians | 家長/監護人:**
- Keep login credentials secure and don't share accounts
- Log out from shared computers after use
- Verify you're on the official school domain before logging in
- Contact the school if you notice any unusual account activity

## 🔧 Security Tools & Utilities | 安全工具與實用程式

### Automated Security Testing | 自動化安全測試

```bash
# Security testing commands
npm run security:audit         # Audit dependencies for vulnerabilities
npm run security:test-oauth    # Test OAuth configuration
npm run security:scan-secrets  # Scan for exposed secrets
npm run security:check-ssl     # Verify SSL certificate
```

### Security Validation Scripts | 安全驗證腳本

The project includes comprehensive security testing:

- **OAuth Configuration Test**: `scripts/test-production-oauth.ts`
- **Environment Validation**: `scripts/validate-production-oauth.ts`  
- **Deployment Verification**: `scripts/verify-production-deployment.ts`

## 📅 Security Maintenance Schedule | 安全維護時間表

### Regular Security Tasks | 定期安全任務

| Task | Frequency | Responsible | Notes |
|------|-----------|-------------|-------|
| Security audit | Quarterly | IT Team | Full system review |
| Dependency updates | Monthly | Dev Team | Security patches priority |
| SSL certificate check | Monthly | Ops Team | Before expiration |
| Access review | Bi-annually | Admin | Remove unused accounts |
| Password policy review | Annually | IT Team | Update as needed |
| Incident response drill | Annually | All Teams | Practice procedures |

### Security Update Procedures | 安全更新程序

1. **Critical Security Updates:**
   - Apply immediately (within 24 hours)
   - Test in staging environment first
   - Deploy during maintenance window
   - Monitor for issues post-deployment

2. **Regular Security Updates:**
   - Schedule monthly update window
   - Batch non-critical updates
   - Full regression testing
   - Rollback plan prepared

## 📖 Resources & References | 資源與參考資料

### Security Standards & Frameworks | 安全標準與框架

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
- **Google OAuth Best Practices**: https://developers.google.com/identity/protocols/oauth2/security-best-practices
- **Next.js Security**: https://nextjs.org/docs/security

### Educational Compliance Resources | 教育合規資源

- **FERPA Guidelines**: https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html
- **COPPA Compliance**: https://www.ftc.gov/enforcement/rules/rulemaking-regulatory-reform-proceedings/childrens-online-privacy-protection-rule
- **Google for Education Privacy**: https://edu.google.com/privacy/

### Emergency Security Resources | 緊急安全資源

- **CERT Coordination Center**: https://www.cert.org/
- **CVE Database**: https://cve.mitre.org/
- **Security Incident Reporting**: Contact school IT department immediately

## 🎯 Conclusion | 結論

Security is an ongoing responsibility that requires continuous attention and improvement. By following these best practices and maintaining vigilance, we can ensure the KCISLK ESID Info Hub remains a secure and trustworthy platform for our school community.

安全是一個持續的責任，需要持續的關注和改進。通過遵循這些最佳實務並保持警覺，我們可以確保 KCISLK ESID 資訊中心對我們的學校社區來說仍然是一個安全可信的平台。

Remember: **Security is everyone's responsibility.**  
記住：**安全是每個人的責任。**

---

**Document Version**: 1.0  
**Last Updated**: 2025-08-07  
**Next Review Date**: 2025-11-07  
**Contact**: esid@kcislk.ntpc.edu.tw

---

*"Security is not a product, but a process." - Bruce Schneier*  
*"安全不是產品，而是過程。" - 布魯斯·施奈爾*