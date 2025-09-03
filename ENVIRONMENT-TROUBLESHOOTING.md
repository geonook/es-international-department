# 🔧 環境變數故障排除指南
## Environment Variables Troubleshooting Guide

**版本**: v1.2.0  
**適用**: Zeabur 部署環境  
**狀態**: Production Ready  

---

## 🚨 **常見問題快速診斷**

### **快速檢查清單** (30秒診斷):

```bash
# 1. 檢查應用程式是否正常運行
curl -I https://kcislk-infohub.zeabur.app/

# 2. 檢查 API 健康狀態
curl https://kcislk-infohub.zeabur.app/api/health

# 3. 檢查 OAuth providers
curl https://kcislk-infohub.zeabur.app/api/auth/providers

# 4. 檢查數據庫連接
curl https://kcislk-infohub.zeabur.app/api/auth/me
```

**如果以上任何一個返回錯誤，請參考下方詳細診斷。**

---

## 🔍 **問題分類診斷**

### **1. 應用程式無法啟動 🔴**

**症狀**:
- Zeabur 顯示部署失敗
- 應用程式持續重啟
- 502 Bad Gateway 錯誤

**可能原因**:
```env
# 檢查這些配置是否正確
NODE_ENV=production
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
```

**診斷步驟**:
1. **檢查 Zeabur 部署日誌**:
   - 前往 Zeabur 控制台
   - 查看 \"Logs\" 標籤
   - 尋找錯誤訊息

2. **常見啟動錯誤**:
   ```bash
   # 錯誤: Missing required environment variables
   # 解決: 檢查所有必需的環境變數
   
   # 錯誤: Database connection failed
   # 解決: 驗證 DATABASE_URL 格式和憑證
   
   # 錯誤: Port already in use
   # 解決: Zeabur 自動處理，檢查其他配置
   ```

---

### **2. OAuth 登入失敗 🔴**

**症狀**:
- 點擊 \"Google 登入\" 後出現錯誤
- 重定向到 localhost:3001
- \"Internal Server Error\"

**快速修復檢查**:
```env
# 必須設定這些變數
NEXTAUTH_URL=https://kcislk-infohub.zeabur.app
NEXTAUTH_SECRET=WtDE420rcUJjy7S1Fz6i2+Sksp/gHDq1v7wzkGSRqsE=
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

**詳細診斷**:

1. **檢查 OAuth 端點**:
   ```bash
   curl https://kcislk-infohub.zeabur.app/api/auth/providers
   # 預期: 返回 Google 提供者資訊
   # 如果 404: NextAuth 配置錯誤
   ```

2. **檢查重定向問題**:
   - 開啟瀏覽器開發者工具
   - 點擊登入，觀察網路請求
   - 如果重定向到 localhost: 檢查 `NEXTAUTH_URL`

3. **Google Console 設定**:
   - 前往 Google Cloud Console
   - 驗證重定向 URI: `https://kcislk-infohub.zeabur.app/api/auth/callback/google`

---

### **3. 數據庫連接問題 🟡**

**症狀**:
- API 返回 500 錯誤
- \"Database connection failed\"
- 用戶資料無法載入

**診斷步驟**:

1. **驗證數據庫 URL 格式**:
   ```env
   # 正確格式
   DATABASE_URL=postgresql://username:password@host:port/database
   
   # 您的配置應該是
   DATABASE_URL=postgresql://root:p356lGH1k4Kd7zefirJ0YSV8MC29ygON@tpe1.clusters.zeabur.com:32312/zeabur
   ```

2. **常見數據庫錯誤**:
   ```bash
   # 錯誤: Connection timeout
   # 解決: 檢查網路和防火牆設置
   
   # 錯誤: Authentication failed
   # 解決: 驗證用戶名和密碼
   
   # 錯誤: Database does not exist
   # 解決: 檢查數據庫名稱
   ```

3. **測試數據庫連接**:
   ```bash
   # 使用 psql 測試連接 (本地)
   psql "postgresql://root:p356lGH1k4Kd7zefirJ0YSV8MC29ygON@tpe1.clusters.zeabur.com:32312/zeabur"
   ```

---

### **4. CORS 錯誤 🟡**

**症狀**:
- 瀏覽器控制台顯示 CORS 錯誤
- \"Access to fetch blocked\"
- 前端無法調用 API

**快速修復**:
```env
ALLOWED_ORIGINS=https://kcislk-infohub.zeabur.app
```

**詳細診斷**:
1. **檢查瀏覽器控制台**:
   - F12 → Console
   - 尋找 CORS 相關錯誤訊息

2. **測試 API 存取**:
   ```bash
   # 使用 curl 測試 (不受 CORS 限制)
   curl -H "Origin: https://kcislk-infohub.zeabur.app" https://kcislk-infohub.zeabur.app/api/health
   ```

---

### **5. 效能和超時問題 ⚪**

**症狀**:
- 應用程式載入緩慢
- 請求超時
- 間歇性服務不可用

**診斷步驟**:

1. **檢查資源使用**:
   - 在 Zeabur 控制台查看 CPU/記憶體使用
   - 檢查資料庫連接數

2. **速率限制設定**:
   ```env
   RATE_LIMIT_MAX_REQUESTS=100
   RATE_LIMIT_WINDOW_MS=900000  # 15 分鐘
   ```

3. **最佳化配置**:
   ```env
   PRISMA_CLI_TELEMETRY_DISABLED=1
   # 減少不必要的網路請求
   ```

---

## 🛠️ **環境變數驗證工具**

### **自動驗證腳本** (複製到 Zeabur 控制台執行):

```bash
#!/bin/bash
echo "=== Environment Variables Validation ==="

# 檢查必需變數
required_vars=("DATABASE_URL" "NEXTAUTH_URL" "NEXTAUTH_SECRET" "JWT_SECRET" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET")

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ $var: NOT SET"
  else
    echo "✅ $var: SET"
  fi
done

echo "=== Validation Complete ==="
```

### **手動檢查清單**:

```bash
# 複製每行到 Zeabur 控制台檢查
echo $DATABASE_URL | grep -q "postgresql://" && echo "✅ Database URL format" || echo "❌ Database URL format"
echo $NEXTAUTH_URL | grep -q "https://kcislk-infohub.zeabur.app" && echo "✅ NextAuth URL" || echo "❌ NextAuth URL"
[ ${#JWT_SECRET} -gt 32 ] && echo "✅ JWT Secret length" || echo "❌ JWT Secret too short"
```

---

## 📊 **故障排除流程圖**

```
應用程式有問題？
├── 無法存取 (502/503)
│   ├── 檢查 Zeabur 部署狀態
│   ├── 查看部署日誌
│   └── 驗證基本環境變數
├── 登入失敗
│   ├── 檢查 OAuth 配置
│   ├── 驗證 Google Console 設定
│   └── 測試 NextAuth 端點
├── API 錯誤
│   ├── 檢查數據庫連接
│   ├── 驗證 CORS 設定
│   └── 檢查 JWT 配置
└── 效能問題
    ├── 檢查資源使用
    ├── 調整速率限制
    └── 最佳化配置
```

---

## 🚀 **快速恢復程序**

### **緊急恢復** (5分鐘):
1. 在 Zeabur 控制台重啟服務
2. 檢查必需環境變數是否設定
3. 測試基本端點存取

### **完整恢復** (15分鐘):
1. 按照 `ZEABUR-CONFIG-OPTIMIZATION.md` 重新配置
2. 驗證所有安全設定
3. 執行完整功能測試

### **深度故障排除** (30分鐘):
1. 導出並分析 Zeabur 日誌
2. 檢查數據庫連接和查詢效能
3. 驗證所有第三方服務整合

---

## 📞 **取得協助**

### **自助資源**:
- `ZEABUR-CONFIG-OPTIMIZATION.md` - 配置指南
- `CRITICAL-OAUTH-FIX-GUIDE.md` - OAuth 修復
- `SECURITY-ENVIRONMENT-AUDIT.md` - 安全稽核

### **日誌分析**:
```bash
# 在 Zeabur 控制台查找這些關鍵詞
grep -i "error\|failed\|timeout\|refused" logs
grep -i "database\|auth\|oauth" logs
```

### **聯絡技術支援時準備**:
1. Zeabur 部署日誌截圖
2. 瀏覽器控制台錯誤截圖
3. 當前環境變數列表 (隱藏敏感資訊)
4. 錯誤重現步驟

---

**💡 提示**: 90% 的問題都可以通過正確設定環境變數解決。請先檢查配置，再尋求其他協助。

---

*Generated by Claude Code - Environment Troubleshooting Guide | v1.2.0*