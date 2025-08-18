# 📋 KCISLK ESID Info Hub 多角色使用者測試指南

> **文件版本**: 1.0 | **最後更新**: 2025-01-18  
> **專案**: KCISLK ESID Info Hub | **測試環境**: http://localhost:3001  
> **目的**: 系統性驗證不同使用者角色的功能存取權限和使用者體驗

## 🎯 測試概述

本指南提供完整的多角色測試流程，幫助您從不同使用者角度驗證系統功能，確保權限控制正確且用戶體驗符合角色需求。

### 📱 系統角色架構

| 角色 | 英文名稱 | 權限等級 | 主要功能 |
|------|----------|----------|----------|
| 管理員 | Admin | 4 (最高) | 完整系統管理權限 |
| 教師 | Teacher | 3 | 教學內容管理權限 |
| 家長 | Parent | 2 | 瀏覽和回饋權限 |
| 學生 | Student | 1 (基本) | 基本瀏覽權限 |

## 🔐 角色權限矩陣

### 📊 功能權限對照表

| 功能模組 | Admin | Teacher | Parent | Student | 說明 |
|----------|-------|---------|--------|---------|------|
| **首頁瀏覽** | ✅ | ✅ | ✅ | ✅ | 所有角色可瀏覽 |
| **公告管理** | ✅ | ✅ | ❌ | ❌ | 創建/編輯/刪除 |
| **公告瀏覽** | ✅ | ✅ | ✅ | ✅ | 所有角色可瀏覽 |
| **活動管理** | ✅ | ✅ | ❌ | ❌ | 創建/編輯活動 |
| **活動瀏覽** | ✅ | ✅ | ✅ | ✅ | 所有角色可瀏覽 |
| **活動報名** | ✅ | ✅ | ✅ | ✅ | 需要權限驗證 |
| **資源管理** | ✅ | ✅ | ❌ | ❌ | 上傳/編輯/刪除 |
| **資源瀏覽** | ✅ | ✅ | ✅ | ✅ | 所有角色可瀏覽 |
| **資源下載** | ✅ | ✅ | ✅ | ✅ | 所有角色可下載 |
| **通知管理** | ✅ | ✅ | ❌ | ❌ | 發送通知 |
| **通知接收** | ✅ | ✅ | ✅ | ✅ | 接收和標記已讀 |
| **用戶管理** | ✅ | ❌ | ❌ | ❌ | 僅管理員 |
| **系統設定** | ✅ | ❌ | ❌ | ❌ | 僅管理員 |
| **教師專區** | ✅ | ✅ | ❌ | ❌ | 教師功能 |
| **管理後台** | ✅ | ❌ | ❌ | ❌ | 僅管理員 |

### 🎨 UI 元素顯示規則

| UI 元素 | Admin | Teacher | Parent | Student |
|---------|-------|---------|--------|---------|
| 管理選單 | ✅ | ❌ | ❌ | ❌ |
| 創建按鈕 | ✅ | ✅ (限制) | ❌ | ❌ |
| 編輯按鈕 | ✅ | ✅ (自己的) | ❌ | ❌ |
| 刪除按鈕 | ✅ | ✅ (自己的) | ❌ | ❌ |
| 下載按鈕 | ✅ | ✅ | ✅ | ✅ |
| 通知鈴鐺 | ✅ | ✅ | ✅ | ✅ |
| 個人資料 | ✅ | ✅ | ✅ | ✅ |

## 🧪 測試帳號配置

### 📧 Google OAuth 測試帳號

#### 管理員帳號
```
Email: admin@kcislk.test
Password: TestAdmin2025!
角色: Admin
權限: 完整系統權限
測試重點: 所有功能均可存取
```

#### 教師帳號
```
Email: teacher@school.edu
Password: TestTeacher2025!
角色: Teacher  
權限: 教學管理權限
測試重點: 內容管理功能，無系統管理權限
```

#### 家長帳號
```
Email: parent@gmail.com
Password: TestParent2025!
角色: Parent
權限: 瀏覽和回饋權限
測試重點: 只能瀏覽，無管理功能
```

#### 學生帳號
```
Email: student@gmail.com
Password: TestStudent2025!
角色: Student
權限: 基本瀏覽權限
測試重點: 最基本的瀏覽功能
```

### 🔄 角色自動分配規則

系統根據 Email 域名自動分配角色：

```javascript
// Email 域名 → 角色分配
const roleMapping = {
  'school.edu': 'teacher',      // 教育機構域名 → 教師
  'university.edu': 'teacher',  // 大學域名 → 教師
  'gmail.com': 'parent',        // Gmail → 家長
  'yahoo.com': 'parent',        // Yahoo → 家長
  'hotmail.com': 'parent',      // Hotmail → 家長
  'outlook.com': 'parent',      // Outlook → 家長
  // 其他域名默認為家長角色
}
```

### ⚙️ 測試環境設定

#### Google OAuth 配置
```bash
# 開發環境設定
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXTAUTH_URL="http://localhost:3001"

# OAuth Redirect URI
http://localhost:3001/api/auth/callback/google
```

#### 測試用環境變數
```bash
# 測試模式啟用
NODE_ENV="development"
TEST_MODE="true"

# 資料庫連接
DATABASE_URL="postgresql://..."

# JWT 秘鑰
JWT_SECRET="test-jwt-secret-key"
NEXTAUTH_SECRET="test-nextauth-secret"
```

## 🧪 分角色測試流程

### 1️⃣ 管理員 (Admin) 測試流程

#### 📋 測試清單
- [ ] **登入測試**
  1. 訪問 http://localhost:3001/login
  2. 使用管理員帳號登入
  3. 確認跳轉到管理後台或首頁
  4. 檢查角色顯示為 "Administrator"

- [ ] **管理後台存取**
  1. 訪問 http://localhost:3001/admin
  2. 確認可正常進入管理後台
  3. 檢查所有管理功能可見
  4. 測試用戶管理功能

- [ ] **內容管理測試**
  1. 創建新公告 → 應該成功
  2. 編輯任何公告 → 應該成功
  3. 刪除公告 → 應該成功
  4. 創建新活動 → 應該成功
  5. 管理活動報名 → 應該成功

- [ ] **系統功能測試**
  1. 查看系統統計 → 應該可見
  2. 管理用戶角色 → 應該成功
  3. 系統設定存取 → 應該可見
  4. 檔案上傳權限 → 應該成功

#### 預期行為
- ✅ 所有功能均可存取
- ✅ 所有 UI 元素均顯示
- ✅ 可修改其他用戶資料
- ✅ 系統管理功能完整

### 2️⃣ 教師 (Teacher) 測試流程

#### 📋 測試清單
- [ ] **登入測試**
  1. 使用教師帳號登入
  2. 確認角色顯示為 "Teacher"
  3. 檢查教師專區可見

- [ ] **內容管理權限**
  1. 創建公告 → 應該成功
  2. 編輯自己的公告 → 應該成功
  3. 刪除他人公告 → 應該被拒絕
  4. 創建活動 → 應該成功
  5. 上傳資源 → 應該成功

- [ ] **限制功能測試**
  1. 訪問管理後台 → 應該被重定向或顯示無權限
  2. 用戶管理功能 → 應該不可見
  3. 系統設定 → 應該不可見
  4. 其他教師內容編輯 → 應該受限

#### 預期行為
- ✅ 教學相關功能完整
- ❌ 無系統管理權限
- ✅ 可管理自己創建的內容
- ❌ 無法編輯他人內容

### 3️⃣ 家長 (Parent) 測試流程

#### 📋 測試清單
- [ ] **登入測試**
  1. 使用家長帳號登入
  2. 確認角色顯示為 "Parent"
  3. 檢查家長功能可見

- [ ] **瀏覽權限測試**
  1. 瀏覽公告 → 應該可見
  2. 瀏覽活動 → 應該可見
  3. 瀏覽資源 → 應該可見
  4. 下載資源 → 應該成功

- [ ] **互動功能測試**
  1. 活動報名 → 應該成功
  2. 通知接收 → 應該成功
  3. 個人資料編輯 → 應該成功

- [ ] **限制功能測試**
  1. 創建公告 → 應該不可見或被拒絕
  2. 編輯任何內容 → 應該不可見
  3. 管理功能 → 應該完全不可見
  4. 檔案上傳 → 應該受限

#### 預期行為
- ✅ 瀏覽功能完整
- ✅ 基本互動功能可用
- ❌ 無內容管理權限
- ❌ 無系統管理功能

### 4️⃣ 學生 (Student) 測試流程

#### 📋 測試清單
- [ ] **登入測試**
  1. 使用學生帳號登入
  2. 確認角色顯示為 "Student"
  3. 檢查學生介面簡潔

- [ ] **基本功能測試**
  1. 瀏覽公告 → 應該可見
  2. 瀏覽活動 → 應該可見
  3. 瀏覽學習資源 → 應該可見
  4. 下載學習資料 → 應該成功

- [ ] **限制功能確認**
  1. 所有管理功能 → 應該不可見
  2. 內容編輯功能 → 應該不可見
  3. 檔案上傳 → 應該不可見
  4. 高級功能 → 應該受限

#### 預期行為
- ✅ 基本瀏覽功能
- ✅ 學習資源存取
- ❌ 無任何管理功能
- ❌ 介面最簡化

## 🔍 API 權限測試

### 測試 API 端點權限

#### 公告 API 測試
```bash
# 獲取公告 (所有角色)
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/announcements

# 創建公告 (僅 Admin/Teacher)
curl -X POST -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test"}' \
  http://localhost:3001/api/announcements

# 創建公告 (Parent - 應該失敗)
curl -X POST -H "Authorization: Bearer <parent_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test"}' \
  http://localhost:3001/api/announcements
```

#### 管理 API 測試
```bash
# 用戶管理 (僅 Admin)
curl -H "Authorization: Bearer <admin_token>" http://localhost:3001/api/admin/users

# 用戶管理 (Teacher - 應該失敗)
curl -H "Authorization: Bearer <teacher_token>" http://localhost:3001/api/admin/users
```

### 預期 API 回應

#### 成功回應
```json
{
  "success": true,
  "data": [...],
  "message": "Request successful"
}
```

#### 權限拒絕回應
```json
{
  "success": false,
  "error": "PERMISSION_DENIED",
  "message": "Insufficient permissions for this action",
  "statusCode": 403
}
```

## 📊 測試執行檢查清單

### 🎯 基礎功能檢查

#### 所有角色通用
- [ ] 登入流程順暢
- [ ] 角色正確顯示
- [ ] 首頁正常載入
- [ ] 公告正確顯示
- [ ] 活動列表可瀏覽
- [ ] 資源中心可存取
- [ ] 個人資料可編輯
- [ ] 登出功能正常

#### 響應式設計檢查
- [ ] 手機版面正確顯示
- [ ] 平板版面適配良好
- [ ] 桌面版功能完整
- [ ] 觸控操作友好

### 🔐 權限控制檢查

#### Admin 專屬功能
- [ ] 管理後台可存取
- [ ] 用戶管理功能正常
- [ ] 系統設定可修改
- [ ] 所有內容可編輯
- [ ] 角色分配功能正常

#### Teacher 權限驗證
- [ ] 教師專區可存取
- [ ] 可創建教學內容
- [ ] 無系統管理權限
- [ ] 無法編輯他人內容
- [ ] 檔案上傳權限正常

#### Parent 權限驗證
- [ ] 僅瀏覽功能可用
- [ ] 無內容管理按鈕
- [ ] 可參與互動功能
- [ ] 回饋功能正常

#### Student 權限驗證
- [ ] 最基本功能可用
- [ ] UI 介面簡化
- [ ] 無任何管理功能
- [ ] 學習資源正常存取

### 🎨 使用者介面檢查

#### 角色適配性
- [ ] 功能按鈕顯示/隱藏正確
- [ ] 選單項目符合角色
- [ ] 無權限功能完全隱藏
- [ ] 錯誤訊息友善清楚

#### 使用者體驗
- [ ] 操作流程直觀
- [ ] 載入時間可接受
- [ ] 互動回饋及時
- [ ] 錯誤處理完善

## 📝 測試結果記錄範本

### ✅ 成功案例記錄
```
測試日期: 2025-01-18
測試者: [姓名]
角色: [Admin/Teacher/Parent/Student]
功能: [測試的具體功能]
測試結果: ✅ 通過
操作步驟:
1. [步驟一]
2. [步驟二]
3. [步驟三]
預期行為: [應該發生什麼]
實際行為: [實際發生什麼]
備註: [其他相關說明]
```

### ❌ 問題案例記錄
```
測試日期: 2025-01-18
測試者: [姓名]
角色: [Admin/Teacher/Parent/Student]
功能: [出問題的功能]
測試結果: ❌ 失敗
問題描述: [詳細問題說明]
重現步驟:
1. [步驟一]
2. [步驟二]
3. [步驟三]
預期行為: [應該發生什麼]
實際行為: [實際發生什麼]
錯誤訊息: [如有錯誤訊息]
嚴重程度: [高/中/低]
影響範圍: [影響哪些功能]
建議修復: [修復建議]
```

## 🔧 常見問題排除

### 🔐 登入問題

#### 問題：Google OAuth 登入失敗
```
原因: OAuth 配置錯誤
解決方案:
1. 檢查 GOOGLE_CLIENT_ID 和 GOOGLE_CLIENT_SECRET
2. 確認 Redirect URI 正確設定
3. 驗證 Google Console 設定
```

#### 問題：角色分配錯誤
```
原因: Email 域名分配規則不當
解決方案:
1. 檢查 assignRoleByEmailDomain 函式
2. 手動調整用戶角色
3. 更新角色分配邏輯
```

### 🚫 權限問題

#### 問題：權限檢查失效
```
原因: RBAC 系統配置錯誤
解決方案:
1. 檢查 ROLE_PERMISSIONS 配置
2. 驗證 hasPermission 函式
3. 確認 JWT token 正確性
```

#### 問題：UI 元素顯示錯誤
```
原因: 前端權限檢查邏輯錯誤
解決方案:
1. 檢查組件權限檢查邏輯
2. 驗證用戶 context 傳遞
3. 更新條件渲染邏輯
```

### 🔄 API 問題

#### 問題：API 回應 403 錯誤
```
原因: API 權限中間件配置問題
解決方案:
1. 檢查 API 路由權限設定
2. 驗證 JWT token 解析
3. 確認權限中間件順序
```

## 🚀 快速測試命令

### 系統健康檢查
```bash
# API 健康檢查
curl http://localhost:3001/api/health

# 資料庫連接測試
npm run test:db

# OAuth 配置測試
npm run test:oauth-config
```

### 角色權限快速驗證
```bash
# 獲取當前用戶資訊
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/auth/me

# 測試管理員權限
curl -H "Authorization: Bearer <admin_token>" http://localhost:3001/api/admin/users

# 測試教師權限
curl -H "Authorization: Bearer <teacher_token>" http://localhost:3001/api/announcements
```

## 📈 測試完成度追蹤

### 進度追蹤表

| 測試類別 | Admin | Teacher | Parent | Student | 完成度 |
|----------|-------|---------|--------|---------|---------|
| 登入測試 | ⬜ | ⬜ | ⬜ | ⬜ | 0% |
| 功能存取 | ⬜ | ⬜ | ⬜ | ⬜ | 0% |
| 權限驗證 | ⬜ | ⬜ | ⬜ | ⬜ | 0% |
| UI 檢查 | ⬜ | ⬜ | ⬜ | ⬜ | 0% |
| API 測試 | ⬜ | ⬜ | ⬜ | ⬜ | 0% |

### 總體測試進度
- 📊 **整體完成度**: 0%
- 🎯 **通過的測試**: 0/20
- ❌ **發現的問題**: 0
- ✅ **已修復問題**: 0

## 🎉 測試總結範本

### 測試報告摘要
```
測試日期: [日期]
測試環境: http://localhost:3001
測試範圍: 多角色功能和權限驗證

角色測試結果:
- Admin: [通過/失敗] - [通過率]%
- Teacher: [通過/失敗] - [通過率]%  
- Parent: [通過/失敗] - [通過率]%
- Student: [通過/失敗] - [通過率]%

主要發現:
1. [發現項目一]
2. [發現項目二]
3. [發現項目三]

建議改進:
1. [改進建議一]
2. [改進建議二]
3. [改進建議三]

整體評估: [優秀/良好/需改進]
```

---

**🎯 測試目標**: 確保所有角色的功能存取權限正確，使用者體驗符合角色需求  
**📝 注意事項**: 測試過程中請詳實記錄所有發現的問題和建議  
**🔄 更新頻率**: 每次系統更新後都應重新執行完整測試

*此文件由 Claude Code 生成 | Generated with [Claude Code](https://claude.ai/code)*