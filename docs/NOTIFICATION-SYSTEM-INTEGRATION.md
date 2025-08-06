# 通知系統整合指南 | Notification System Integration Guide

> **完整的通知系統後端架構實現** | **Complete Backend Notification System Architecture Implementation**  
> **建立日期**: 2025-01-31 | **Created**: 2025-01-31  
> **版本**: 1.0 | **Version**: 1.0

## 🎯 系統概述 | System Overview

KCISLK 小學國際處資訊中心通知系統提供完整的通知管理功能，包括即時推送、模板管理、用戶偏好設定和業務整合觸發器。

### ✨ 核心功能 | Core Features

- **📧 通知發送與管理** - 支援多種通知類型和優先級
- **🔄 即時推送** - Server-Sent Events (SSE) 實現即時通知
- **📝 模板系統** - 12種預定義通知模板
- **👥 批量操作** - 支援批量標記已讀、刪除等操作
- **⚙️ 用戶偏好** - 個人化通知設定
- **🔗 業務整合** - 與活動、公告、報名等系統整合
- **🧹 自動清理** - 過期通知自動清理機制

## 🏗️ 系統架構 | System Architecture

```
通知系統架構 | Notification System Architecture
├── API 層 | API Layer
│   ├── /api/notifications          # 主要通知 CRUD
│   ├── /api/notifications/[id]     # 單一通知操作
│   ├── /api/notifications/mark-read # 批量操作
│   ├── /api/notifications/stats    # 統計資訊
│   ├── /api/notifications/preferences # 用戶偏好
│   ├── /api/notifications/templates   # 模板管理
│   └── /api/notifications/stream      # 即時推送 SSE
├── 服務層 | Service Layer
│   └── NotificationService         # 核心通知服務
├── 類型定義 | Type Definitions
│   └── lib/types.ts               # 完整類型定義
└── 資料庫 | Database
    ├── Notification               # 通知記錄
    └── EventNotification         # 活動通知
```

## 📱 API 端點說明 | API Endpoints

### 1. 通知列表 | Notification List

```typescript
GET /api/notifications
```

**查詢參數 | Query Parameters:**
- `page`: 頁碼 (預設: 1)
- `limit`: 每頁數量 (預設: 20)
- `type`: 通知類型 (`system` | `announcement` | `event` | `registration` | `resource` | `newsletter` | `maintenance` | `reminder` | `all`)
- `priority`: 優先級 (`low` | `medium` | `high` | `urgent` | `all`)
- `status`: 狀態 (`unread` | `read` | `all`)
- `search`: 搜尋關鍵字
- `dateStart`: 開始日期
- `dateEnd`: 結束日期

**回應範例 | Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "recipientId": "user123",
      "title": "新公告：重要通知",
      "message": "請查看最新的學校公告內容",
      "type": "announcement",
      "priority": "high",
      "isRead": false,
      "createdAt": "2025-01-31T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "stats": {
    "total": 50,
    "unread": 15,
    "read": 35
  }
}
```

### 2. 發送通知 | Send Notification

```typescript
POST /api/notifications
```

**請求內容 | Request Body:**
```json
{
  "title": "通知標題",
  "message": "通知內容",
  "type": "system",
  "priority": "medium",
  "recipientType": "all",
  "template": "announcement_published",
  "expiresAt": "2025-02-28T23:59:59Z"
}
```

### 3. 批量操作 | Bulk Operations

```typescript
POST /api/notifications/mark-read
```

**批量標記已讀 | Mark All as Read:**
```json
{
  "markAll": true
}
```

**批量操作 | Bulk Action:**
```json
{
  "action": "mark_read",
  "notificationIds": [1, 2, 3, 4, 5]
}
```

### 4. 通知統計 | Notification Statistics

```typescript
GET /api/notifications/stats
```

**回應範例 | Response Example:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "unread": 25,
    "read": 75,
    "byType": {
      "system": 10,
      "announcement": 20,
      "event": 30,
      "registration": 15
    },
    "byPriority": {
      "urgent": 5,
      "high": 15,
      "medium": 50,
      "low": 30
    },
    "recent": 8,
    "thisWeek": 25,
    "thisMonth": 45
  }
}
```

### 5. 即時通知推送 | Real-time Notifications

```typescript
GET /api/notifications/stream
```

**Server-Sent Events 連接 | SSE Connection:**
```javascript
const eventSource = new EventSource('/api/notifications/stream', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'notification':
      // 處理新通知
      handleNewNotification(data.data);
      break;
    case 'stats':
      // 更新統計資訊
      updateNotificationStats(data.data);
      break;
    case 'ping':
      // 心跳包
      console.log('Connection alive');
      break;
  }
};
```

## 🔧 NotificationService 使用指南 | Service Usage Guide

### 基本通知發送 | Basic Notification Sending

```typescript
import NotificationService from '@/lib/notificationService';

// 發送基本通知
const result = await NotificationService.sendNotification({
  title: '系統維護通知',
  message: '系統將於今晚進行維護，請提前保存工作',
  type: 'maintenance',
  priority: 'high',
  recipientType: 'all',
  template: 'system_maintenance'
});

console.log(`通知已發送給 ${result.totalSent} 位用戶`);
```

### 業務整合觸發 | Business Integration Triggers

```typescript
// 活動通知
await NotificationService.createEventNotification(eventId, 'created');
await NotificationService.createEventNotification(eventId, 'updated');
await NotificationService.createEventNotification(eventId, 'cancelled');

// 公告通知
await NotificationService.createAnnouncementNotification(announcementId);

// 報名通知
await NotificationService.createRegistrationNotification(registrationId, 'confirmed');
await NotificationService.createRegistrationNotification(registrationId, 'waitlist');
await NotificationService.createRegistrationNotification(registrationId, 'cancelled');

// 資源通知
await NotificationService.createResourceNotification(resourceId);

// 電子報通知
await NotificationService.createNewsletterNotification(newsletterId);

// 提醒通知
await NotificationService.createReminderNotification(
  'event',
  eventId,
  'event',
  '活動提醒',
  '您報名的活動即將開始',
  [userId1, userId2]
);
```

### 批量操作 | Bulk Operations

```typescript
// 批量標記已讀
const result = await NotificationService.bulkOperation(userId, {
  action: 'mark_read',
  notificationIds: [1, 2, 3, 4, 5]
});

// 批量刪除
const deleteResult = await NotificationService.bulkOperation(userId, {
  action: 'delete',
  notificationIds: [10, 11, 12]
});
```

### 清理過期通知 | Cleanup Expired Notifications

```typescript
// 清理過期通知（管理員功能）
const cleanedCount = await NotificationService.cleanupExpiredNotifications();
console.log(`已清理 ${cleanedCount} 則過期通知`);

// 自動提醒（定時任務）
await NotificationService.createEventReminders();
```

## 📝 通知模板系統 | Template System

### 可用模板 | Available Templates

1. **`announcement_published`** - 公告發布通知
2. **`event_created`** - 活動建立通知
3. **`event_updated`** - 活動更新通知
4. **`event_cancelled`** - 活動取消通知
5. **`registration_confirmed`** - 報名確認通知
6. **`registration_waitlist`** - 候補名單通知
7. **`registration_cancelled`** - 報名取消通知
8. **`resource_uploaded`** - 資源上傳通知
9. **`newsletter_published`** - 電子報發布通知
10. **`system_maintenance`** - 系統維護通知
11. **`reminder_event`** - 活動提醒通知
12. **`reminder_deadline`** - 截止日期提醒

### 模板使用範例 | Template Usage Example

```typescript
// 獲取模板
const template = NotificationService.getTemplate('event_created');

// 獲取所有模板
const allTemplates = NotificationService.getAllTemplates();

// 使用模板發送通知
await NotificationService.sendNotification({
  title: '新活動通知',
  message: '活動詳情將使用模板生成',
  type: 'event',
  priority: 'medium',
  recipientType: 'grade_based',
  targetGrades: ['Grade 3', 'Grade 4'],
  template: 'event_created'
});
```

## ⚙️ 用戶偏好設定 | User Preferences

### 偏好設定結構 | Preference Structure

```typescript
interface NotificationPreferences {
  email: boolean;              // 是否接收 Email 通知
  system: boolean;             // 是否接收系統內通知
  browser: boolean;            // 是否接收瀏覽器推送
  doNotDisturb: {
    enabled: boolean;          // 是否啟用勿擾模式
    startTime: string;         // 勿擾開始時間 "22:00"
    endTime: string;           // 勿擾結束時間 "08:00"
  };
  categories: {
    [NotificationType]: {
      enabled: boolean;        // 是否啟用此類型通知
      email: boolean;          // 是否 Email 通知
      system: boolean;         // 是否系統內通知
    }
  }
}
```

### 偏好設定 API | Preferences API

```typescript
// 獲取用戶偏好
GET /api/notifications/preferences

// 更新用戶偏好
PUT /api/notifications/preferences
{
  "email": true,
  "system": true,
  "categories": {
    "announcement": {
      "enabled": true,
      "email": true,
      "system": true
    }
  }
}

// 重置為預設值
DELETE /api/notifications/preferences
```

## 🔗 前端整合指南 | Frontend Integration

### React Hook 範例 | React Hook Example

```typescript
// useNotifications.ts
import { useState, useEffect } from 'react';
import { Notification, NotificationStats } from '@/lib/types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);

  // 獲取通知列表
  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?page=${page}`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // 標記為已讀
  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read' })
      });
      
      if (response.ok) {
        fetchNotifications(); // 重新獲取
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // 即時通知連接
  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/stream');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'notification') {
        // 新通知到達，更新列表
        fetchNotifications();
      } else if (data.type === 'stats') {
        // 更新統計
        setStats(data.data);
      }
    };

    return () => eventSource.close();
  }, []);

  return {
    notifications,
    stats,
    loading,
    fetchNotifications,
    markAsRead
  };
}
```

### 通知組件範例 | Notification Component Example

```typescript
// NotificationBell.tsx
import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationBell() {
  const { stats } = useNotifications();

  return (
    <div className="relative">
      <Bell className="w-6 h-6" />
      {stats && stats.unread > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {stats.unread > 99 ? '99+' : stats.unread}
        </span>
      )}
    </div>
  );
}
```

## 🧪 測試指南 | Testing Guide

### 執行測試 | Running Tests

```bash
# 執行通知系統測試
npx ts-node scripts/test-notification-system.ts

# 測試特定 API 端點
curl -X GET "http://localhost:3000/api/notifications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 測試即時通知
curl -X GET "http://localhost:3000/api/notifications/stream" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: text/event-stream"
```

### 測試覆蓋範圍 | Test Coverage

- ✅ 通知服務核心功能
- ✅ 模板系統和變數替換
- ✅ 批量操作
- ✅ 業務整合觸發器
- ✅ 用戶偏好設定
- ✅ 清理和維護功能

## 🚀 部署和監控 | Deployment & Monitoring

### 環境變數 | Environment Variables

```bash
# 通知系統相關配置
NOTIFICATION_CLEANUP_INTERVAL=86400000  # 24小時清理一次
NOTIFICATION_SSE_TIMEOUT=300000         # SSE 連接超時 5分鐘
NOTIFICATION_BATCH_SIZE=100             # 批量操作限制
```

### 監控指標 | Monitoring Metrics

- 📊 **通知發送量** - 每日/每月通知發送統計
- 📈 **即時連接數** - SSE 活躍連接數量
- 🔄 **模板使用率** - 各模板的使用頻率
- 🧹 **清理效率** - 過期通知清理統計
- ⚡ **響應時間** - API 端點響應時間監控

### 效能優化建議 | Performance Optimization

1. **資料庫索引** - 確保 `recipientId`, `type`, `createdAt` 有適當索引
2. **分頁限制** - 限制每頁最大通知數量
3. **快取策略** - 對用戶偏好和模板進行快取
4. **批量處理** - 大量通知發送時使用批量操作
5. **連接管理** - 定期清理非活躍 SSE 連接

## 📚 相關文件 | Related Documentation

- [Google OAuth 設定指南](./google-oauth-setup.md)
- [API 認證說明](../README.md#認證系統)
- [資料庫架構說明](../prisma/schema.prisma)
- [前端組件指南](../components/README.md)

---

**🎯 完成狀態 | Completion Status**: ✅ 完整實現  
**📝 文件版本 | Documentation Version**: 1.0  
**🔄 最後更新 | Last Updated**: 2025-01-31

*Generated with ❤️ by Claude Code for KCISLK ESID Info Hub*