# ES 國際部開發 Todo 清單
# ES International Department Development Todo List

> **文件版本**: 1.0  
> **建立日期**: 2025-08-01  
> **專案狀態**: Phase 1 已完成，待重新部署  
> **下次開發重點**: 觸發 Zeabur 重新部署並驗證修復效果

---

## 📊 當前專案狀態 Current Project Status

### 🎯 測試結果 Test Results
- **整體測試通過率**: 42.31% (11/26 測試通過)
- **API 測試**: 25% 通過率 (4/16 passing)
  - ✅ 權限控制測試：4個通過
  - ❌ 資料讀取測試：12個失敗 (主要原因：生產環境缺少種子資料)
- **前端測試**: 70% 通過率 (7/10 passing)
  - ✅ 基本功能：7個通過
  - ❌ 待修復：3個失敗 (已在 Phase 1 修復，需重新部署)

### 🚀 部署狀態 Deployment Status
- **平台**: Zeabur Cloud
- **URL**: https://landing-app-v2.zeabur.app
- **狀態**: 線上運行，健康檢查通過
- **回應時間**: 0.65秒
- **待執行**: 重新部署以應用 Phase 1 修復

### ✅ Phase 1 已完成工作 Completed Work
1. **生產環境種子資料修復** (`prisma/seed.ts:231-233`)
   - 移除環境限制，允許在生產環境執行種子資料
   - 新增 5 個基本公告資料，避免重複創建
   - 解決 API 500 錯誤的根本原因

2. **管理頁面認證檢查** (`components/AdminDashboard.tsx:新增 useEffect`)
   - 實現自動重導向到登入頁面
   - 改善使用者體驗，避免顯示權限拒絕訊息
   - 修復前端測試中的權限控制問題

3. **Puppeteer API 相容性** (`frontend-test.js:175`)
   - 修復過時的 `page.waitForTimeout` API
   - 改用 `Promise.resolve(setTimeout)` 實現
   - 解決 JavaScript 錯誤檢查測試失敗

4. **Git 提交** (commit: `663e8f5`)
   - 所有修復已提交到版本控制
   - 準備推送到 GitHub 觸發自動部署

---

## 🚨 立即執行項目 Immediate Actions

### ⚡ Priority 1: 觸發重新部署 (預估時間: 10分鐘)
```bash
# 1. 推送到 GitHub 觸發 Zeabur 自動部署
git push origin main

# 2. 監控 Zeabur 部署狀態
# 訪問 Zeabur 控制台檢查部署進度

# 3. 等待部署完成 (通常 2-3 分鐘)
```

### ⚡ Priority 2: 驗證修復效果 (預估時間: 15分鐘)
```bash
# 1. 運行 API 測試
node integration-test.js

# 2. 運行前端測試  
node frontend-test.js

# 3. 預期結果
# - API 測試通過率：25% → 85%+
# - 前端測試通過率：70% → 90%+
# - 整體測試通過率：42% → 87%+
```

### ⚡ Priority 3: 更新測試記錄 (預估時間: 5分鐘)
- 更新 `zeabur-test-results.json` 記錄最新測試結果
- 確認所有 Phase 1 目標達成

---

## 📈 完整開發路線圖 Development Roadmap

### Phase 2: 認證系統增強 Authentication System Enhancement
**預估時間**: 1-2 天 | **優先級**: 高

#### 🔐 API 端點保護中間件
**檔案位置**: `app/api/middleware/auth.ts` (新建)
```typescript
// 實現內容：
// 1. JWT token 驗證
// 2. 角色權限檢查
// 3. 請求速率限制
// 4. 錯誤處理與回應
```

**相關 API 端點需要保護**:
- `app/api/admin/*` - 管理員專用 API
- `app/api/teachers/*` - 教師權限 API  
- `app/api/announcements/create` - 建立公告
- `app/api/announcements/update` - 更新公告
- `app/api/announcements/delete` - 刪除公告

**測試標準**:
- [ ] 未認證請求返回 401
- [ ] 權限不足請求返回 403
- [ ] 有效 token 正常通過

#### 👥 角色權限系統完善
**檔案位置**: `lib/rbac.ts` (新建)
```typescript
// 實現內容：
// 1. 角色階層定義 (admin > teacher > parent)
// 2. 權限矩陣管理
// 3. 動態權限檢查函式
// 4. 權限繼承邏輯
```

**權限矩陣設計**:
```
Feature          | Admin | Teacher | Parent
-----------------|-------|---------|--------
公告管理         | CRUD  | CR-     | R---
活動管理         | CRUD  | CR-     | R---
資源管理         | CRUD  | CRUD    | R---
使用者管理       | CRUD  | ----    | ----
系統設定         | CRUD  | ----    | ----
```

**測試標準**:
- [ ] 每個角色權限正確執行
- [ ] 權限繼承邏輯正確
- [ ] 權限拒絕正確處理

#### 🔄 會話管理改善
**檔案位置**: 
- `hooks/useAuth.ts` (更新現有)
- `app/api/auth/refresh.ts` (新建)

**改善項目**:
1. **自動 Token 刷新**
   ```typescript
   // 實現 refresh token 機制
   // 在 token 過期前自動刷新
   // 避免使用者頻繁重新登入
   ```

2. **會話持續性**
   ```typescript
   // localStorage + httpOnly cookie 雙重保護
   // 瀏覽器關閉後維持登入狀態
   // 設備記住功能
   ```

3. **並發會話管理**
   ```typescript
   // 同一使用者多設備登入控制
   // 可選擇踢出舊會話或允許多會話
   ```

**測試標準**:
- [ ] Token 自動刷新正常
- [ ] 會話過期正確處理
- [ ] 多設備登入邏輯正確

#### 🔑 密碼重設功能
**檔案位置**:
- `app/forgot-password/page.tsx` (新建)
- `app/reset-password/page.tsx` (新建)
- `app/api/auth/forgot-password.ts` (新建)
- `app/api/auth/reset-password.ts` (新建)

**實現流程**:
1. **忘記密碼申請**
   ```typescript
   // 1. 使用者輸入 email
   // 2. 驗證 email 存在性
   // 3. 產生重設 token (6位數字或連結)
   // 4. 發送重設郵件 (或顯示 token)
   ```

2. **密碼重設頁面**
   ```typescript
   // 1. 驗證重設 token 有效性
   // 2. 新密碼輸入與確認
   // 3. 密碼強度檢查
   // 4. 更新密碼並清除 token
   ```

**測試標準**:
- [ ] 重設流程完整可用
- [ ] Token 有效期正確 (15分鐘)
- [ ] 密碼更新成功後舊 token 失效

---

### Phase 3: 內容管理系統 Content Management System
**預估時間**: 2-3 天 | **優先級**: 高

#### 📢 公告管理完整 CRUD 介面
**檔案位置**:
- `app/admin/announcements/page.tsx` (更新現有)
- `components/admin/AnnouncementManager.tsx` (新建)
- `components/admin/AnnouncementEditor.tsx` (新建)

**功能清單**:
1. **公告列表管理**
   ```typescript
   // 1. 分頁顯示所有公告
   // 2. 搜尋與篩選 (狀態、對象、日期)
   // 3. 批量操作 (刪除、狀態變更)
   // 4. 排序功能 (日期、優先級、狀態)
   ```

2. **公告編輯器**
   ```typescript
   // 1. 富文本編輯器 (TinyMCE 或 Quill)
   // 2. 圖片上傳與管理
   // 3. 預覽功能
   // 4. 草稿保存
   // 5. 排程發布
   ```

3. **發布控制**
   ```typescript
   // 1. 目標對象選擇 (all/parents/teachers)
   // 2. 優先級設定 (high/medium/low)
   // 3. 發布時間設定
   // 4. 有效期限設定
   ```

**測試標準**:
- [ ] CRUD 操作全部正常
- [ ] 富文本編輯器功能完整
- [ ] 發布控制邏輯正確
- [ ] 檔案上傳安全性檢查

#### 📅 活動管理系統
**檔案位置**:
- `app/admin/events/page.tsx` (新建)
- `components/admin/EventManager.tsx` (新建)
- `components/admin/EventCalendar.tsx` (新建)

**功能清單**:
1. **活動 CRUD 管理**
   ```typescript
   // 活動資料結構:
   interface Event {
     id: string
     title: string
     description: string
     startDate: Date
     endDate: Date
     location: string
     maxParticipants?: number
     registrationDeadline?: Date
     status: 'draft' | 'published' | 'cancelled'
     targetAudience: 'all' | 'parents' | 'teachers' | 'students'
   }
   ```

2. **活動日曆檢視**
   ```typescript
   // 使用 FullCalendar 或 React Big Calendar
   // 月檢視、週檢視、日檢視
   // 拖拽調整活動時間
   // 點擊快速編輯
   ```

3. **報名管理系統**
   ```typescript
   // 1. 線上報名表單
   // 2. 報名人數限制
   // 3. 候補名單
   // 4. 報名狀態追蹤
   // 5. 報名確認通知
   ```

**測試標準**:
- [ ] 活動 CRUD 操作正常
- [ ] 日曆檢視互動正確
- [ ] 報名流程完整可用
- [ ] 通知機制正常

#### 📚 資源管理與檔案上傳
**檔案位置**:
- `app/admin/resources/page.tsx` (新建)
- `components/admin/ResourceManager.tsx` (新建)
- `components/admin/FileUploader.tsx` (新建)
- `lib/fileUpload.ts` (新建)

**功能清單**:
1. **檔案上傳系統**
   ```typescript
   // 支援檔案類型：
   // - 文件: PDF, DOC, DOCX, PPT, PPTX
   // - 圖片: JPG, PNG, GIF, WEBP
   // - 影片: MP4, WEBM (限制大小)
   
   // 安全檢查：
   // - 檔案類型驗證
   // - 檔案大小限制 (10MB)
   // - 病毒掃描 (選擇性)
   // - 檔名安全化處理
   ```

2. **資源分類管理**
   ```typescript
   // 階層式分類系統：
   // - 學習資料 (Learning Materials)
   //   - 年級分類 (Grades 1-2, 3-4, 5-6)
   //   - 科目分類 (English, Math, Science)
   // - 作業 (Assignments)
   // - 簡報 (Presentations)
   // - 影片 (Videos)
   ```

3. **權限控制**
   ```typescript
   // 檔案存取權限：
   // - Public: 所有人可見
   // - Teachers: 僅教師可見
   // - Grade-specific: 特定年級可見
   // - Private: 僅上傳者可見
   ```

**測試標準**:
- [ ] 檔案上傳成功且安全
- [ ] 分類系統邏輯正確
- [ ] 權限控制有效
- [ ] 檔案檢視與下載正常

---

### Phase 4: 使用者介面優化 User Interface Enhancement
**預估時間**: 2 天 | **優先級**: 中

#### 🖥️ 管理員儀表板完善
**檔案位置**:
- `components/AdminDashboard.tsx` (大幅更新現有)
- `components/admin/DashboardStats.tsx` (新建)
- `components/admin/RecentActivity.tsx` (新建)

**功能模組**:
1. **統計儀表板**
   ```typescript
   // 統計資料顯示：
   // - 使用者數量 (總數、活躍用戶、新註冊)
   // - 內容統計 (公告、活動、資源)
   // - 系統健康狀態 (回應時間、錯誤率)
   // - 使用分析 (頁面瀏覽、功能使用)
   ```

2. **快速操作區**
   ```typescript
   // 常用功能快速存取：
   // - 建立新公告
   // - 建立新活動
   // - 使用者管理
   // - 系統設定
   ```

3. **最近活動日誌**
   ```typescript
   // 顯示最近系統活動：
   // - 使用者登入記錄
   // - 內容建立/更新
   // - 系統錯誤日誌
   // - 安全性事件
   ```

**測試標準**:
- [ ] 統計資料準確顯示
- [ ] 快速操作功能正常
- [ ] 活動日誌完整記錄

#### 👤 使用者個人檔案管理
**檔案位置**:
- `app/profile/page.tsx` (新建)
- `components/user/ProfileEditor.tsx` (新建)
- `components/user/AvatarUploader.tsx` (新建)

**功能清單**:
1. **基本資料編輯**
   ```typescript
   // 可編輯欄位：
   // - 姓名 (firstName, lastName, displayName)
   // - 聯絡資訊 (phone, address)
   // - 緊急聯絡人 (emergencyContact)
   // - 生日 (dateOfBirth)
   ```

2. **頭像上傳**
   ```typescript
   // 頭像功能：
   // - 圖片上傳與裁切
   // - 預設頭像選擇
   // - 圖片壓縮與最佳化
   ```

3. **偏好設定**
   ```typescript
   // 個人偏好：
   // - 語言設定 (中文/英文)
   // - 通知設定 (email/系統通知)
   // - 介面主題 (light/dark)
   ```

**測試標準**:
- [ ] 個人資料更新成功
- [ ] 頭像上傳與顯示正常
- [ ] 偏好設定儲存正確

#### 🔔 通知系統實現
**檔案位置**:
- `components/NotificationCenter.tsx` (新建)
- `app/api/notifications/*` (新建)
- `lib/notificationService.ts` (新建)

**功能設計**:
1. **通知類型**
   ```typescript
   enum NotificationType {
     ANNOUNCEMENT = 'announcement',
     EVENT = 'event',
     SYSTEM = 'system',
     REMINDER = 'reminder'
   }
   
   interface Notification {
     id: string
     type: NotificationType
     title: string
     message: string
     isRead: boolean
     createdAt: Date
     actionUrl?: string
   }
   ```

2. **即時通知**
   ```typescript
   // 使用 Server-Sent Events (SSE) 或 WebSocket
   // 新通知即時推送到前端
   // 通知圖示顯示未讀數量
   ```

3. **通知管理**
   ```typescript
   // 通知中心功能：
   // - 通知列表檢視
   // - 標記已讀/未讀
   // - 批量操作 (全部標記已讀、刪除)
   // - 通知篩選 (類型、日期)
   ```

**測試標準**:
- [ ] 通知建立與推送正常
- [ ] 即時通知功能正確
- [ ] 通知狀態管理有效

---

### Phase 5: 效能與穩定性 Performance & Reliability
**預估時間**: 1-2 天 | **優先級**: 中

#### ⚡ 快取策略實現
**檔案位置**:
- `lib/cache.ts` (新建)
- `lib/redis.ts` (新建，如果使用 Redis)

**快取層級**:
1. **瀏覽器快取**
   ```typescript
   // Next.js 靜態檔案快取設定
   // 圖片、CSS、JS 檔案長期快取
   // API 回應適當快取標頭
   ```

2. **應用程式快取**
   ```typescript
   // React Query 或 SWR 實現
   // API 回應資料快取
   // 背景更新策略
   ```

3. **資料庫查詢快取**
   ```typescript
   // 常用查詢結果快取
   // 公告列表、使用者資訊、系統設定
   // 快取失效策略
   ```

**測試標準**:
- [ ] 快取命中率 > 80%
- [ ] 頁面載入時間 < 2秒
- [ ] API 回應時間 < 500ms

#### 🗄️ 資料庫優化
**檔案位置**:
- `prisma/schema.prisma` (索引優化)
- `lib/database.ts` (查詢最佳化)

**優化項目**:
1. **索引建立**
   ```sql
   -- 重要欄位索引
   CREATE INDEX idx_announcements_status ON announcements(status);
   CREATE INDEX idx_announcements_target_audience ON announcements(targetAudience);
   CREATE INDEX idx_announcements_published_at ON announcements(publishedAt);
   CREATE INDEX idx_users_email ON users(email);
   ```

2. **查詢最佳化**
   ```typescript
   // 避免 N+1 查詢問題
   // 使用 Prisma include 適當載入關聯資料
   // 分頁查詢實現
   ```

**測試標準**:
- [ ] 查詢執行計劃最佳化
- [ ] 資料庫回應時間 < 100ms
- [ ] 並發查詢處理正常

#### 🚨 錯誤處理與監控
**檔案位置**:
- `lib/errorHandler.ts` (新建)
- `lib/logger.ts` (新建)
- `components/ErrorBoundary.tsx` (新建)

**錯誤處理策略**:
1. **全域錯誤處理**
   ```typescript
   // API 錯誤統一處理
   // 前端錯誤邊界 (Error Boundary)
   // 錯誤日誌記錄
   ```

2. **監控系統**
   ```typescript
   // 效能監控 (頁面載入時間、API 回應時間)
   // 錯誤率監控
   // 使用者行為分析
   ```

**測試標準**:
- [ ] 錯誤正確捕獲與處理
- [ ] 錯誤日誌完整記錄
- [ ] 監控指標準確收集

---

### Phase 6: 安全性增強 Security Enhancement
**預估時間**: 1 天 | **優先級**: 中

#### 🛡️ 輸入驗證與防護
**檔案位置**:
- `lib/validation.ts` (新建)
- `lib/sanitization.ts` (新建)

**安全措施**:
1. **輸入驗證**
   ```typescript
   // 使用 Zod 或 Joi 進行資料驗證
   // API 端點輸入驗證
   // 前端表單驗證
   // SQL Injection 防護
   ```

2. **XSS 防護**
   ```typescript
   // 使用者輸入內容淨化
   // HTML 內容過濾
   // CSP (Content Security Policy) 設定
   ```

3. **CSRF 防護**
   ```typescript
   // CSRF Token 驗證
   // SameSite Cookie 設定
   // Origin 檢查
   ```

**測試標準**:
- [ ] 惡意輸入正確過濾
- [ ] XSS 攻擊無效
- [ ] CSRF 攻擊被阻擋

#### 🔐 認證安全強化
**檔案位置**:
- `lib/security.ts` (新建)
- `middleware.ts` (更新)

**安全功能**:
1. **密碼安全**
   ```typescript
   // 密碼強度檢查
   // 密碼歷史記錄 (避免重複使用)
   // 帳戶鎖定機制 (多次失敗登入)
   ```

2. **會話安全**
   ```typescript
   // JWT Token 安全設定
   // HttpOnly Cookie
   // Secure Cookie (HTTPS)
   // Token 輪換機制
   ```

**測試標準**:
- [ ] 弱密碼被拒絕
- [ ] 帳戶鎖定機制有效
- [ ] 會話劫持攻擊無效

---

### Phase 7: 測試與文件 Testing & Documentation
**預估時間**: 1 天 | **優先級**: 低

#### 🧪 測試覆蓋完善
**檔案位置**:
- `tests/` (新建目錄)
- `__tests__/` (新建目錄)

**測試類型**:
1. **單元測試**
   ```typescript
   // 使用 Jest + React Testing Library
   // 組件單元測試
   // 工具函式測試
   // API 端點測試
   ```

2. **整合測試**
   ```typescript
   // 資料庫整合測試
   // API 整合測試
   // 使用者流程測試
   ```

3. **端到端測試**
   ```typescript
   // 使用 Playwright 或 Cypress
   // 完整使用者操作流程
   // 跨瀏覽器測試
   ```

**測試目標**:
- [ ] 程式碼覆蓋率 > 80%
- [ ] 所有關鍵功能有測試
- [ ] CI/CD 整合測試

#### 📚 文件完善
**檔案位置**:
- `docs/` (新建目錄)
- `README.md` (更新)

**文件內容**:
1. **API 文件**
   ```markdown
   # API 端點說明
   # 請求/回應範例
   # 錯誤代碼說明
   # 認證方式說明
   ```

2. **使用說明**
   ```markdown
   # 管理員操作手冊
   # 教師使用指南
   # 家長使用說明
   # 故障排除指南
   ```

**完成標準**:
- [ ] API 文件完整準確
- [ ] 使用說明清晰易懂
- [ ] 技術文件更新

---

## 🎯 成功標準與驗收條件 Success Criteria

### 📊 測試通過率目標
- **最終目標**: 整體測試通過率 > 90%
- **API 測試**: > 95% (所有 CRUD 操作正常)
- **前端測試**: > 90% (所有頁面與功能正常)
- **效能測試**: 頁面載入 < 2秒，API 回應 < 500ms

### 🔒 安全性標準
- **認證系統**: 完整的登入、權限控制、會話管理
- **資料保護**: 所有使用者輸入經過驗證與淨化
- **存取控制**: 角色權限正確實施
- **資料完整性**: 所有重要操作有日誌記錄

### 🚀 效能標準
- **頁面載入**: 首頁 < 1.5秒，其他頁面 < 2秒
- **API 回應**: < 500ms (95th percentile)
- **資料庫查詢**: < 100ms 平均回應時間
- **並發處理**: 支援 100+ 同時線上使用者

### 📱 使用體驗標準
- **響應式設計**: 完美支援手機、平板、桌面
- **無障礙設計**: 符合 WCAG 2.1 AA 標準
- **多語言支援**: 中英文介面切換
- **直觀操作**: 新使用者 5 分鐘內熟悉基本操作

---

## ⏰ 時程規劃與里程碑 Timeline & Milestones

### 🗓️ 詳細時程
```
Day 1: 
- 觸發重新部署並驗證 Phase 1 修復效果 (上午)
- Phase 2: 認證系統增強開始 (下午)

Day 2-3:
- Phase 2: 完成認證系統增強
- Phase 3: 內容管理系統開始

Day 4-6:
- Phase 3: 完成內容管理系統
- Phase 4: 使用者介面優化開始

Day 7-8:
- Phase 4: 完成使用者介面優化
- Phase 5: 效能與穩定性優化

Day 9-10:
- Phase 5: 完成效能優化
- Phase 6: 安全性增強

Day 11-12:
- Phase 6: 完成安全性增強  
- Phase 7: 測試與文件完善

Day 13-14:
- 最終測試與部署
- 專案交付與驗收
```

### 🎖️ 里程碑檢查點
1. **Phase 1 完成**: 測試通過率達到 85%+
2. **Phase 2 完成**: 認證系統完全可用，所有權限正確
3. **Phase 3 完成**: 內容管理功能完整，可以建立/編輯所有內容
4. **Phase 4 完成**: 使用者介面完善，體驗流暢
5. **Phase 5 完成**: 系統效能達標，監控系統運作
6. **Phase 6 完成**: 安全測試全部通過
7. **Phase 7 完成**: 文件完整，測試覆蓋率達標

---

## 🔧 技術細節與實現指引 Technical Implementation Guide

### 🏗️ 架構設計
```
Frontend (Next.js 14 + TypeScript)
├── App Router 檔案結構
├── React Server Components
├── Client Components (互動功能)
└── Static Generation (效能最佳化)

Backend (Next.js API Routes)
├── RESTful API 設計
├── 中間件認證
├── 資料驗證層
└── 錯誤處理層

Database (PostgreSQL + Prisma)
├── 關聯式資料設計
├── 索引最佳化
├── 資料遷移管理
└── 備份與還原策略

Deployment (Zeabur Cloud)
├── Docker 容器化
├── 自動部署 CI/CD
├── 環境變數管理
└── 監控與日誌
```

### 📝 開發規範
1. **程式碼風格**: ESLint + Prettier 自動格式化
2. **型別安全**: TypeScript 嚴格模式
3. **版本控制**: Git 語義化提交訊息
4. **測試策略**: TDD (測試驅動開發)
5. **文件更新**: 程式碼變更同步更新文件

### 🚀 部署流程
```bash
# 1. 本地開發與測試
npm run dev          # 開發伺服器
npm run test         # 單元測試  
npm run build        # 建置檢查
npm run lint         # 程式碼檢查

# 2. 提交與推送
git add .
git commit -m "feat: 功能描述"
git push origin main

# 3. 自動部署 (Zeabur)
# 推送到 main 分支自動觸發部署
# 部署完成後自動運行測試

# 4. 驗證部署
node integration-test.js     # API 測試
node frontend-test.js        # 前端測試
```

---

## 📞 下次開發準備事項 Next Session Preparation

### ✅ 開發前檢查清單
- [ ] 確認 Node.js 版本 (18+)
- [ ] 確認資料庫連線正常
- [ ] 確認 Zeabur 部署狀態
- [ ] 檢查環境變數設定
- [ ] 拉取最新程式碼

### 🎯 第一優先級任務
1. 觸發 Zeabur 重新部署 (`git push origin main`)
2. 驗證 Phase 1 修復效果 (運行測試套件)
3. 確認測試通過率達到 85%+ 目標

### 📋 開發環境設定
```bash
# 安裝相依套件
npm install

# 設定環境變數
cp .env.example .env.local
# 填入必要的環境變數

# 資料庫遷移
npx prisma generate
npx prisma db push

# 執行種子資料
npx prisma db seed

# 啟動開發伺服器
npm run dev
```

---

## 📚 參考資源 References

### 🔗 技術文件
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### 🎨 UI/UX 設計
- [shadcn/ui Components](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion)
- [Lucide Icons](https://lucide.dev)

### 🧪 測試工具
- [Jest Testing Framework](https://jestjs.io)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright E2E Testing](https://playwright.dev)

### 🚀 部署平台
- [Zeabur Documentation](https://zeabur.com/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices)

---

**🎯 記住：這是一個完整的家長門戶網站系統，注重使用者體驗、資料安全與系統穩定性。每個階段完成後都要運行完整測試，確保品質。**

**📞 下次開發時，直接從「立即執行項目」開始，按優先級逐步完成所有功能。**

---

*最後更新: 2025-08-01 | 預計完成: 2025-08-15*