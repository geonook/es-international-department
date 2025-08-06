# Health Check API | 健康檢查 API

The Health Check API provides a simple endpoint to verify that the application is running correctly and can be used by monitoring systems, Docker health checks, and load balancers.

健康檢查 API 提供了一個簡單的端點來驗證應用程式是否正常運行，可用於監控系統、Docker 健康檢查和負載均衡器。

## Endpoint | 端點

```
GET /api/health
HEAD /api/health
```

## Description | 描述

Returns the current health status of the KCISLK ESID Info Hub application. This endpoint is publicly accessible and does not require authentication.

返回 KCISLK 小學國際處資訊中心應用程式的當前健康狀態。此端點可公開存取，不需要身份驗證。

## Request | 請求

### Headers | 標頭
No special headers required.  
不需要特殊標頭。

### Parameters | 參數
No parameters required.  
不需要參數。

## Response | 回應

### Success Response (200 OK) | 成功回應

**GET Request:**
```json
{
  "status": "OK",
  "service": "KCISLK ESID Info Hub",
  "timestamp": "2025-01-31T12:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

**HEAD Request:**
Returns empty body with 200 status code.  
返回空內容，狀態碼為 200。

### Error Response (500 Internal Server Error) | 錯誤回應

```json
{
  "status": "ERROR",
  "service": "KCISLK ESID Info Hub", 
  "timestamp": "2025-01-31T12:00:00.000Z",
  "error": "Database connection failed"
}
```

## Response Fields | 回應欄位

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Health status: "OK" or "ERROR" |
| `service` | string | Service name identifier |
| `timestamp` | string | ISO 8601 timestamp of the response |
| `environment` | string | Current environment (development/staging/production) |
| `version` | string | Application version |
| `error` | string | Error message (only present when status is "ERROR") |

## Usage Examples | 使用範例

### cURL
```bash
# GET request
curl -X GET http://localhost:3000/api/health

# HEAD request (lightweight)
curl -I http://localhost:3000/api/health
```

### JavaScript/Fetch
```javascript
// GET request
const response = await fetch('/api/health');
const healthData = await response.json();
console.log('Health status:', healthData.status);

// HEAD request
const headResponse = await fetch('/api/health', { method: 'HEAD' });
console.log('Is healthy:', headResponse.ok);
```

### Docker Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1
```

## Monitoring Integration | 監控整合

### Docker Compose
```yaml
services:
  kcislk-esid:
    image: kcislk-esid-info-hub
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Kubernetes
```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: kcislk-esid
    image: kcislk-esid-info-hub
    livenessProbe:
      httpGet:
        path: /api/health
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /api/health
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
```

### Uptime Monitoring
Most uptime monitoring services can use this endpoint:
大多數正常運行時間監控服務都可以使用此端點：

- **Pingdom**: Monitor `GET /api/health` and check for `"status": "OK"`
- **UptimeRobot**: HTTP(s) monitoring of the health endpoint
- **StatusCake**: Check response contains `"status": "OK"`

## Implementation Details | 實作細節

The health check endpoint is implemented in `/app/api/health/route.ts` and performs:

健康檢查端點在 `/app/api/health/route.ts` 中實作，執行以下檢查：

1. **Basic Application Status** - Verifies the Next.js application is responding
   **基本應用程式狀態** - 驗證 Next.js 應用程式是否回應

2. **Environment Information** - Returns current environment and version
   **環境資訊** - 返回當前環境和版本

3. **Error Handling** - Gracefully handles any system errors
   **錯誤處理** - 優雅地處理任何系統錯誤

Future enhancements may include:
未來的增強功能可能包括：

- Database connectivity checks
- External service dependency checks  
- Memory and CPU usage information
- Detailed component health status

---

*This endpoint is essential for production deployment monitoring and should always be kept simple and fast.*  
*此端點對於生產部署監控至關重要，應始終保持簡單和快速。*