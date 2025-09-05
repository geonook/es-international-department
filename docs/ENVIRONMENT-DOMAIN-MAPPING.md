# Environment Domain Mapping
# 環境域名映射表

> **Version**: v1.6.0-stable  
> **Date**: 2025-09-05  
> **Purpose**: Unified domain mapping for all environments  
> **目的**: 統一所有環境的域名映射

## 🌐 Current Domain Mapping | 當前域名映射

| Environment | Domain | Status | Purpose |
|-------------|--------|--------|---------|
| **Development** | `http://localhost:3001` | ✅ Active | Local development |
| **Staging** | `https://next14-landing.zeabur.app` | ✅ Active | Testing & validation |
| **Production** | `https://kcislk-infohub.zeabur.app` | ✅ Active | Live production service |

## 📋 Environment Details | 環境詳細信息

### 🧪 Development Environment
```
Domain: http://localhost:3001
Port: 3001
Database: postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur
OAuth Callback: http://localhost:3001/api/auth/callback/google
Status: Local development only
```

### 🔄 Staging Environment  
```
Domain: https://next14-landing.zeabur.app
Database: postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur
OAuth Callback: https://next14-landing.zeabur.app/api/auth/callback/google
Status: Testing and validation
Purpose: Pre-production testing
```

### 🌟 Production Environment
```
Domain: https://kcislk-infohub.zeabur.app
Database: postgresql://root:p356lGH1k4Kd7zefirJ0YSV8MC29ygON@tpe1.clusters.zeabur.com:32312/kcislk_esid_prod
OAuth Callback: https://kcislk-infohub.zeabur.app/api/auth/callback/google
Status: Live production
Purpose: Production service for KCISLK ESID
```

## 🚫 Deprecated/Obsolete Domains | 已棄用域名

The following domains are **NO LONGER USED** and should be removed from all documentation:

| Domain | Status | Last Used | Replacement |
|---------|--------|-----------|-------------|
| `kcislk-esid.zeabur.app` | ❌ Deprecated | ~v1.4 | `kcislk-infohub.zeabur.app` |
| `landing-app-v2.zeabur.app` | ❌ Deprecated | ~v1.3 | `next14-landing.zeabur.app` |
| `staging.your-domain.com` | ❌ Never used | Placeholder | `next14-landing.zeabur.app` |

## 🔧 Google OAuth Console Configuration

### Required Authorized Domains:
```
next14-landing.zeabur.app    # Staging
kcislk-infohub.zeabur.app    # Production  
localhost                    # Development (optional)
```

### Required Authorized Redirect URIs:
```
https://next14-landing.zeabur.app/api/auth/callback/google    # Staging
https://kcislk-infohub.zeabur.app/api/auth/callback/google    # Production
http://localhost:3001/api/auth/callback/google               # Development
```

## 📝 Environment Variable Templates

### Development (.env)
```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3001,http://127.0.0.1:3001,http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL=postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur
EMAIL_PROVIDER=disabled
```

### Staging (Zeabur Environment Variables)
```env
NODE_ENV=staging
NEXTAUTH_URL=https://next14-landing.zeabur.app
ALLOWED_ORIGINS=https://next14-landing.zeabur.app
DATABASE_URL=postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur
EMAIL_PROVIDER=disabled
```

### Production (.env.production or Zeabur Environment Variables)
```env
NODE_ENV=production
NEXTAUTH_URL=https://kcislk-infohub.zeabur.app
ALLOWED_ORIGINS=https://kcislk-infohub.zeabur.app
DATABASE_URL=postgresql://root:p356lGH1k4Kd7zefirJ0YSV8MC29ygON@tpe1.clusters.zeabur.com:32312/kcislk_esid_prod
EMAIL_PROVIDER=disabled
```

## 🔍 Health Check Endpoints

Use these endpoints to verify each environment is working:

```bash
# Development
curl http://localhost:3001/api/health

# Staging  
curl https://next14-landing.zeabur.app/api/health

# Production
curl https://kcislk-infohub.zeabur.app/api/health
```

## 📊 Database Configuration

### Development & Staging (Shared)
- **Host**: `tpe1.clusters.zeabur.com`
- **Port**: `32718`
- **Database**: `zeabur`
- **User**: `root`

### Production (Separate)
- **Host**: `tpe1.clusters.zeabur.com`
- **Port**: `32312`  
- **Database**: `kcislk_esid_prod`
- **User**: `root`

## 🚀 Deployment Workflow

```
Development (localhost:3001)
    ↓ (git push to main)
Staging (next14-landing.zeabur.app)
    ↓ (manual deploy after validation)  
Production (kcislk-infohub.zeabur.app)
```

## ⚠️ Important Notes

1. **Domain Consistency**: Always use the exact domains listed above
2. **HTTPS Only**: All production and staging environments use HTTPS
3. **Database Separation**: Production has its own dedicated database
4. **OAuth Configuration**: Each environment needs proper Google Console setup

## 🔄 Update History

| Date | Change | Environment | Notes |
|------|--------|-------------|-------|
| 2025-09-05 | Domain mapping established | All | Initial unified mapping |
| 2025-09-05 | Staging domain corrected | Staging | Fixed from placeholder to actual |
| 2025-09-05 | Email provider disabled | All | Simplified configuration |

---

**This is the authoritative source for all environment domain information.**  
**All documentation should reference this mapping.**

Generated: 2025-09-05  
Version: v1.5.0-stable