# KCISLK ESID 系統功能對應指南

> **文檔版本**: 1.0 | **最後更新**: 2025-01-10  
> **用途**: 釐清首頁功能與管理介面的對應關係，避免內容管理混淆

## 📊 首頁功能與管理介面對應表

| 首頁區塊 | 主要管理功能 | 次要管理功能 | 管理位置 | API 端點 | 數據類型 |
|---------|-------------|-------------|----------|----------|----------|
| **🔖 ID News Message Board** | Advanced Message Board | Homepage Announcements (Parents) | `/admin/messages` + Parents' Corner | `/api/public/messages` | `message_board` + `announcement` |
| **📰 Newsletter 區塊** | Newsletter Management | - | Parents' Corner | `/api/public/newsletters` | `newsletter` |
| **🖼️ Hero Image** | Homepage Settings | - | Parents' Corner | `/api/admin/parents-corner/homepage` | `system_settings` |
| **📝 主標題/副標題** | Homepage Settings | - | Parents' Corner | `/api/admin/parents-corner/homepage` | `system_settings` |
| **💬 引言文字** | Homepage Settings | - | Parents' Corner | `/api/admin/parents-corner/homepage` | `system_settings` |
| **🔗 按鈕連結** | Homepage Settings | - | Parents' Corner | `/api/admin/parents-corner/homepage` | `system_settings` |

## 🔍 詳細功能說明

### 🔖 **ID News Message Board (複雜結構)**

#### **主要管理入口: Advanced Message Board**
- **位置**: `/admin/messages` (獨立頁面)
- **管理內容**: `type: 'message_board'`
- **特色功能**:
  - 進階訊息板功能
  - 支援豐富文本編輯
  - 可設定目標受眾
  - 支援置頂和重要標記
- **⚠️ 警告**: 此頁面會顯示警告，說明內容可能出現在首頁

#### **次要管理入口: Homepage Announcements (Parents)**
- **位置**: 管理介面 → Parents' Corner 標籤
- **管理內容**: `type: 'announcement'`
- **用途**: 
  - 管理首頁公告內容
  - 作為 message_board 內容的補充
  - 更簡單的公告發布流程

#### **首頁顯示邏輯**
```
1. 優先顯示: message_board 類型的內容 (最多5則)
2. 補充顯示: 當 message_board 不足時，補充 announcement 類型內容
3. 混合展示: 兩種類型的內容會按優先級和時間排序混合顯示
4. 排序規則: isPinned → priority → publishedAt
```

### 📰 **Newsletter 區塊 (簡單結構)**
- **管理位置**: Parents' Corner → Newsletter Management
- **數據來源**: 單一來源，無混淆問題
- **顯示內容**: 最新發布的電子報

### 🎨 **Homepage Settings (簡單結構)**
- **管理位置**: Parents' Corner → Homepage Settings
- **包含設定**:
  - Hero Image (英雄圖片)
  - Main Title (主標題)
  - Subtitle (副標題)
  - Quote Text & Author (引言與作者)
  - Button Text & Links (按鈕文字與連結)

## ⚠️ 注意事項與潛在混淆點

### 🚨 **高風險混淆區域**

#### **ID News Message Board 雙重管理**
- **問題**: 唯一有兩個管理入口的首頁區塊
- **風險**: 可能造成內容重複或管理混亂
- **建議**: 明確區分使用場景
  - **Advanced Message Board**: 用於複雜、需要豐富格式的訊息
  - **Homepage Announcements**: 用於簡單、快速的公告發布

#### **Advanced Message Board 的首頁影響**
- **問題**: 看似獨立的進階功能會影響首頁顯示
- **解決**: 已在介面加入警告訊息
- **建議**: 發布前務必預覽首頁效果

### 📋 **內容管理最佳實踐**

#### **發布流程建議**
1. **短期公告** → 使用 Homepage Announcements (Parents)
2. **重要訊息** → 使用 Advanced Message Board 並設定為重要
3. **置頂內容** → 在 Advanced Message Board 設定置頂
4. **電子報** → 使用 Newsletter Management
5. **首頁設定** → 使用 Homepage Settings

#### **避免混淆的操作要點**
- ✅ 發布前檢查目標受眾設定
- ✅ 確認內容類型選擇正確
- ✅ 預覽首頁效果
- ✅ 避免在兩個入口發布重複內容
- ❌ 不要同時在兩個地方管理相同訊息

## 🛠️ API 端點詳細說明

### **公開 API (首頁使用)**

#### `/api/public/messages`
```typescript
// 參數
?limit=5&audience=all

// 回應格式
{
  success: true,
  data: [
    {
      id: number,
      title: string,
      content: string,
      type: 'message_board' | 'announcement',
      priority: 'low' | 'medium' | 'high',
      isImportant: boolean,
      isPinned: boolean,
      date: string,
      author: string,
      targetAudience: string
    }
  ]
}
```

#### `/api/public/newsletters`
```typescript
// 回應格式
{
  success: true,
  data: [
    {
      id: number,
      title: string,
      coverImageUrl: string,
      publicationDate: string,
      downloadCount: number
    }
  ]
}
```

### **管理 API**

#### `/api/admin/communications`
- **用途**: Advanced Message Board 管理
- **類型過濾**: `?type=message_board`

#### `/api/admin/announcements`
- **用途**: Homepage Announcements 管理
- **類型過濾**: `type: 'announcement'`

#### `/api/admin/parents-corner/homepage`
- **用途**: Homepage Settings 管理
- **數據**: SystemSetting 表

## 🎯 快速參考指南

### **我想要...**
- **在首頁發布緊急公告** → Parents' Corner → Homepage Announcements (Parents)
- **發布重要訊息並置頂** → Advanced Message Board → 設定 important + pinned
- **管理首頁標題和圖片** → Parents' Corner → Homepage Settings
- **發布電子報** → Parents' Corner → Newsletter Management
- **檢視首頁內容** → 前往首頁或使用 API `/api/public/messages`

### **故障排除**
- **首頁訊息沒顯示** → 檢查狀態是否為 "published"
- **內容重複顯示** → 檢查是否在兩個地方都發布了相同內容
- **置頂功能無效** → 確認使用 Advanced Message Board 並正確設定
- **圖片無法顯示** → 檢查 Homepage Settings 中的圖片 URL

## 📚 相關文檔

- [CLAUDE.md](./CLAUDE.md) - 開發指導原則
- [README.md](./README.md) - 專案概述
- [docs/](./docs/) - 詳細技術文檔

---

**⚠️ 重要提醒**: 此文檔應與系統架構同步更新。如有功能變更，請及時修正此對應表。

*最後更新: 2025-01-10 | 文檔版本: 1.0*