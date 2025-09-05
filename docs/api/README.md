# API Documentation | API 文檔

Welcome to the KCISLK ESID Info Hub API documentation.  
歡迎來到 KCISLK ESID Info Hub API 文檔。

## 📋 Available APIs | 可用的 API

### Current Endpoints | 當前端點
- [Health Check API](./health-check.md) - System health monitoring | 系統健康監控

### Planned Endpoints | 計劃中的端點
- [Authentication API](./future-endpoints.md#authentication) - User login and session management | 使用者登入和會話管理
- [Announcements API](./future-endpoints.md#announcements) - Manage announcements | 管理公告
- [Resources API](./future-endpoints.md#resources) - Educational resources | 教育資源
- [Users API](./future-endpoints.md#users) - User management | 使用者管理

## 🚀 Getting Started | 快速開始

### Base URL | 基礎 URL
```
Development:  http://localhost:3000/api
Staging:      https://next14-landing.zeabur.app/api
Production:   https://kcislk-infohub.zeabur.app/api
```

### Authentication | 身份驗證
Most API endpoints will require authentication in the future. Currently, only the health check endpoint is available.  
大多數 API 端點將來都需要身份驗證。目前只有健康檢查端點可用。

### Response Format | 回應格式
All API responses follow a consistent JSON format:  
所有 API 回應都遵循一致的 JSON 格式：

```json
{
  "status": "success" | "error",
  "data": { ... },
  "message": "Human readable message",
  "timestamp": "2025-01-31T12:00:00.000Z"
}
```

## 📚 Documentation Structure | 文檔結構

- `health-check.md` - Health check endpoint documentation | 健康檢查端點文檔
- `future-endpoints.md` - Planned API endpoints | 計劃中的 API 端點

---

*This API documentation is currently under development.*  
*此 API 文檔正在開發中。*