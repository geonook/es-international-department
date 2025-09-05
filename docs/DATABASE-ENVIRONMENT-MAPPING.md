# Database Environment Mapping | 資料庫環境對照表

> **📊 MULTI-ENVIRONMENT DATABASE CONFIGURATION**  
> **多環境資料庫配置對照**  
> **Date**: 2025-09-04 | **日期**: 2025-09-04  
> **Status**: ✅ ACTIVE | **狀態**: ✅ 使用中  
> **Platform**: Zeabur PostgreSQL Cluster | **平台**: Zeabur PostgreSQL 叢集

## 🏗️ Environment Architecture Overview | 環境架構概覽

```
┌─────────────────────────────────────────────────────────────────┐
│                    Zeabur PostgreSQL 集群架構                    │
│              tpe1.clusters.zeabur.com (台北節點)                │
└─────────────────────────────────────────────────────────────────┘
        │                       │                       │
   Port 32718              Port 30592              Port 32312
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Development    │    │     Staging     │    │   Production    │
│ kcislk_esid_dev │    │kcislk_esid_staging│  │kcislk_esid_prod │
│                 │    │                 │    │                 │
│ 🎯 本地開發     │    │ 🎯 功能驗證     │    │ 🎯 正式營運     │
│ 💾 測試資料     │    │ 💾 模擬資料     │    │ 💾 正式資料     │
│ 🔓 寬鬆安全     │    │ 🔒 中等安全     │    │ 🔐 最高安全     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Environment Configuration Matrix | 環境配置對照表

| 環境 Environment | 服務名稱 Service | 埠號 Port | 資料庫名稱 Database | 用戶 User | 用途 Purpose |
|------------------|------------------|-----------|---------------------|-----------|--------------|
| **Development** | postgresql-noce | `32718` | `kcislk_esid_dev` | root | 本地開發測試 |
| **Staging** | postgresql-prouse | `30592` | `kcislk_esid_staging` | root | 功能驗證測試 |
| **Production** | postgresql | `32312` | `kcislk_esid_prod` | root | 正式營運服務 |

## 🔗 Database Connection Details | 資料庫連接詳情

### Development Environment | 開發環境
```env
# 配置檔案: .env.development, .env, .env.backup
DATABASE_URL="postgresql://root:[PASSWORD]@tpe1.clusters.zeabur.com:32718/kcislk_esid_dev"

# 特性
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3001
Rate Limiting: 寬鬆 (1000 requests/15min)
Debug: 啟用 (prisma:*)
```

### Staging Environment | 預備環境
```env
# 配置檔案: .env.staging
DATABASE_URL="postgresql://root:[PASSWORD]@tpe1.clusters.zeabur.com:30592/kcislk_esid_staging"

# 特性
NODE_ENV=staging
NEXTAUTH_URL=https://staging.es-international.zeabur.app
Rate Limiting: 中等 (500 requests/15min)
Debug: 限制 (prisma:warn)
```

### Production Environment | 正式環境
```env
# 配置檔案: .env.production
DATABASE_URL="postgresql://root:[PASSWORD]@tpe1.clusters.zeabur.com:32312/kcislk_esid_prod"

# 特性
NODE_ENV=production
NEXTAUTH_URL=https://kcislk-infohub.zeabur.app
Rate Limiting: 嚴格 (100 requests/15min)
Debug: 關閉
```

## 🔒 Security & Isolation Features | 安全與隔離特性

### ✅ Physical Isolation | 物理隔離
- **Separate PostgreSQL Instances**: 每個環境使用獨立的 PostgreSQL 實例
- **Different Ports**: 通過不同端口 (32718/30592/32312) 實現連接隔離
- **Unique Passwords**: 每個環境使用不同的強密碼
- **Database Name Separation**: 使用環境專用的資料庫名稱

### ✅ Logical Isolation | 邏輯隔離
- **Environment-Specific Schema**: 每個環境有獨立的資料庫結構
- **Data Segregation**: 開發、預備、正式資料完全分離
- **Configuration Isolation**: 各環境有獨立的環境變數配置

### ✅ Access Control | 存取控制
- **Environment-Based Authentication**: 基於環境的認證機制
- **Rate Limiting**: 不同環境採用不同的速率限制策略
- **CORS Configuration**: 各環境有專屬的 CORS 設定

## 🔄 Data Flow & Synchronization | 資料流與同步

```mermaid
flowchart TD
    A[Local Development] -->|Code Push| B[GitHub Repository]
    B -->|Auto Deploy| C[Development Environment]
    C -->|Manual Promotion| D[Staging Environment]
    D -->|Manual Promotion| E[Production Environment]
    
    F[Developer] -->|Local Testing| A
    G[QA Team] -->|Integration Testing| D
    H[End Users] -->|Production Usage| E
```

### Data Migration Strategy | 資料遷移策略
1. **Development → Staging**: 手動促進，含測試資料清理
2. **Staging → Production**: 嚴格審核，僅遷移結構變更
3. **Production → Development**: 定期同步結構，匿名化資料

## 🛠️ Management Commands | 管理命令

### Environment-Specific Operations | 環境專用操作
```bash
# Development | 開發環境
NODE_ENV=development npx prisma migrate dev
NODE_ENV=development npx prisma studio --port 5555

# Staging | 預備環境  
NODE_ENV=staging npx prisma migrate deploy
NODE_ENV=staging npx prisma studio --port 5556

# Production | 正式環境
NODE_ENV=production npx prisma migrate deploy
NODE_ENV=production npx prisma studio --port 5557
```

### Database Health Checks | 資料庫健康檢查
```bash
# 連接測試
npm run test:db-connection:dev
npm run test:db-connection:staging  
npm run test:db-connection:prod

# 效能監控
npm run db:performance:dev
npm run db:performance:staging
npm run db:performance:prod
```

## 📊 Performance Baselines | 效能基準

| Metric | Development | Staging | Production | Unit |
|--------|-------------|---------|------------|------|
| Connection Pool | 5 | 10 | 20 | connections |
| Query Timeout | 30s | 20s | 10s | seconds |
| Max Connections | 20 | 50 | 100 | connections |
| Backup Frequency | Daily | Daily | 4x Daily | frequency |

## 🚨 Monitoring & Alerts | 監控與告警

### Key Metrics | 關鍵指標
- **Connection Success Rate**: 連接成功率 > 99.5%
- **Query Response Time**: 查詢響應時間 < 100ms (P95)
- **Database Size**: 資料庫大小監控
- **Active Connections**: 活躍連接數監控

### Alert Thresholds | 告警閾值
- **Critical**: Connection failures > 5% in 5 minutes
- **Warning**: Query response time > 500ms (P95)
- **Info**: Database size increase > 20% in 24 hours

## ⚙️ Backup & Recovery | 備份與復原

### Backup Strategy | 備份策略
- **Development**: Daily automated backup, 7-day retention
- **Staging**: Daily automated backup, 14-day retention  
- **Production**: 4x daily automated backup, 90-day retention

### Recovery Testing | 復原測試
- Monthly recovery drill for staging
- Quarterly recovery drill for production
- Automated backup validation daily

---

## 📝 Change Log | 變更記錄

| Date | Version | Changes | Author |
|------|---------|---------|---------|
| 2025-09-04 | 1.0.0 | Initial database environment mapping | Claude Code |
| 2025-09-04 | 1.1.0 | Added performance baselines and monitoring | Claude Code |

## 🔗 Related Documents | 相關文件

- [Zeabur Deployment Guide](./zeabur-deployment-guide.md) - 部署指南
- [Security Audit Report](./SECURITY-AUDIT-REPORT.md) - 安全稽核報告
- [Database Requirements](./database-requirements.md) - 資料庫需求文件

---

*Document maintained by KCISLK ESID Development Team*  
*文件由 KCISLK ESID 開發團隊維護*