# 🏠 首頁功能管理指南

> **快速查詢** | 我在首頁看到某個功能，要到哪裡編輯？

---

## 🎯 **簡單版：我要編輯...**

### 📝 **想編輯首頁的文字內容**
```
首頁區塊                     👉 到這裡編輯
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔖 新聞訊息 (ID News Message Board)
   └─ 複雜！有兩個地方：
      • 主要：管理介面 → Message Board (Advanced) 
      • 次要：管理介面 → Parents' Corner → 公告

📰 電子報
   └─ 管理介面 → Parents' Corner → Newsletter

🖼️ 大圖片 + 標題 + 引言
   └─ 管理介面 → Parents' Corner → 首頁設定
```

### 🎨 **想編輯首頁的圖片設定**
```
管理介面 → Parents' Corner → 首頁設定
```

---

## 🔍 **詳細版：完整對應關係**

### 🔖 **新聞訊息區塊 (比較複雜)**

```
首頁顯示的「ID News Message Board」內容來自兩個地方：

📍 地方一：Message Board (Advanced)
   位置：管理介面 → 點選「Message Board (Advanced)」
   特色：功能強大，可以設定重要、置頂等
   
📍 地方二：Parents' Corner 公告  
   位置：管理介面 → Parents' Corner → 「Homepage Announcements」
   特色：簡單快速發布公告

⚠️ 兩個地方的內容都會混在一起顯示在首頁！
```

### 📰 **電子報區塊 (簡單)**

```
首頁的電子報 👉 管理介面 → Parents' Corner → Newsletter Management
```

### 🎨 **首頁外觀設定 (簡單)**

```
首頁的這些東西         👉 管理介面 → Parents' Corner → 首頁設定
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖼️ 大張的背景圖片
📝 主標題「KCISLK Elementary...」  
📝 副標題「Welcome to...」
💬 引言文字「Education is...」
🔗 按鈕文字和連結
```

---

## 💡 **常見問題**

### ❓ **我想在首頁發布緊急公告，要用哪個？**
```
👉 用這個：管理介面 → Parents' Corner → Homepage Announcements

為什麼？因為簡單快速！
```

### ❓ **我想發布重要訊息並且置頂，要用哪個？**
```
👉 用這個：管理介面 → Message Board (Advanced)

為什麼？因為只有這裡有置頂功能！
```

### ❓ **我發現首頁的訊息重複了？**
```
🔍 檢查一下：
1. Message Board (Advanced) 有沒有發相同內容
2. Parents' Corner → 公告 有沒有發相同內容

⚠️ 兩個地方的內容會混在一起顯示！
```

### ❓ **我想改首頁的大圖片？**
```
👉 管理介面 → Parents' Corner → 首頁設定
```

---

## 🚨 **重要提醒**

### ⚠️ **唯一需要特別注意的地方**
```
🔖 首頁的「新聞訊息」有兩個編輯入口：

✅ 簡單公告 → Parents' Corner → 公告
✅ 重要訊息 → Message Board (Advanced)

❌ 不要在兩個地方發布相同內容！
```

### ✅ **其他功能都很簡單**
```
📰 電子報      → Parents' Corner → Newsletter
🖼️ 首頁設定    → Parents' Corner → 首頁設定
```

---

## 📚 **詳細技術資料 (開發人員參考)**

<details>
<summary>🔧 點擊展開 API 端點資訊</summary>

### **首頁數據來源**
- **新聞訊息**: `/api/public/messages`
- **電子報**: `/api/public/newsletters`  
- **首頁設定**: `/api/admin/parents-corner/homepage`

### **管理 API**
- **Advanced Message Board**: `/api/admin/communications?type=message_board`
- **Homepage Announcements**: `/api/admin/announcements`
- **Newsletter**: `/api/admin/newsletters`

</details>

---

*📝 文檔版本: 2.0 (簡化版) | 最後更新: 2025-01-10*