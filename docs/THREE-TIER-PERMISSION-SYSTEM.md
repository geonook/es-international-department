# Three-Tier Permission System
# 三層權限系統

> **Document Version**: 1.0 | **文檔版本**: 1.0  
> **Last Updated**: 2025-08-23 | **最後更新**: 2025-08-23  
> **Status**: ✅ Production Ready | **狀態**: ✅ 生產就緒

## 🎯 Overview | 概述

The KCISLK ESID Info Hub implements a comprehensive three-tier permission system that provides structured access control while maintaining an inclusive approach to user management.

KCISLK ESID Info Hub 實現了一個全面的三層權限系統，在維持包容性用戶管理方法的同時提供結構化的存取控制。

## 🏗️ Architecture | 架構

### Role Hierarchy | 角色階層
```
Admin (管理員)
├── Full system management | 完整系統管理
├── User management | 用戶管理
├── Content management | 內容管理
└── Permission upgrade review | 權限升級審核

Office Member (辦公室成員)
├── Content editing | 內容編輯
├── Resource management | 資源管理
├── Event management | 活動管理
└── Limited admin access | 限制性管理存取

Viewer (觀看者)
├── Read-only access | 唯讀存取
├── Basic dashboard view | 基本儀表板查看
├── Announcement viewing | 公告查看
└── Event information access | 活動資訊存取
```

## 🔐 Permission Matrix | 權限矩陣

| Feature | Admin | Office Member | Viewer |
|---------|-------|---------------|---------|
| **User Management** | ✅ Full | ❌ None | ❌ None |
| **Content Creation** | ✅ Full | ✅ Yes | ❌ None |
| **Content Editing** | ✅ Full | ✅ Yes | ❌ None |
| **Content Viewing** | ✅ Full | ✅ Yes | ✅ Yes |
| **System Settings** | ✅ Full | ❌ None | ❌ None |
| **Role Upgrades** | ✅ Review | ✅ Request | ✅ Request |
| **Admin Dashboard** | ✅ Full Access | ✅ Limited | ✅ View Only |

## 🚀 Key Features | 核心功能

### 1. Inclusive Admin Access | 包容性管理存取
- **All authenticated users** can access the admin dashboard | **所有認證用戶** 皆可存取管理儀表板
- **Role-based UI restrictions** control what users can see and do | **基於角色的 UI 限制** 控制用戶可見和可操作的功能
- **No rejection at entry** - access is granted, functionality is limited | **入口不拒絕** - 允許存取，但限制功能

### 2. Automatic Role Assignment | 自動角色分配
- **New Google OAuth users** automatically receive `viewer` role | **新 Google OAuth 用戶** 自動獲得 `viewer` 角色
- **No waiting for approval** - immediate basic access | **無需等待批准** - 立即獲得基本存取權
- **Seamless onboarding experience** | **無縫的入門體驗**

### 3. Permission Upgrade System | 權限升級系統
- **User-initiated requests** for role upgrades | **用戶主動發起** 角色升級請求
- **Admin review and approval** workflow | **管理員審核和批准** 工作流程
- **Transparent status tracking** | **透明的狀態追蹤**

## 🛠️ Technical Implementation | 技術實現

### Database Schema | 資料庫架構
```typescript
// User roles hierarchy
enum Role {
  ADMIN = 'admin'
  OFFICE_MEMBER = 'office_member' 
  VIEWER = 'viewer'
}

// Permission upgrade requests
model PermissionUpgradeRequest {
  id              String    @id @default(cuid())
  userId          String
  requestedRole   String
  reason          String
  status          String    @default("pending") // 'pending', 'approved', 'rejected'
  submittedAt     DateTime  @default(now())
  reviewedAt      DateTime?
  // ... relations and metadata
}
```

### API Endpoints | API 端點
```typescript
// User permission upgrade request
POST /api/admin/users/[id]/upgrade-request
GET  /api/admin/users/[id]/upgrade-request

// Admin upgrade request management
GET  /api/admin/upgrade-requests
POST /api/admin/upgrade-requests/[id]/review
```

### Frontend Integration | 前端整合
```typescript
// Enhanced useAuth Hook
const { isAdmin, isOfficeMember, isViewer } = useAuth()

// Role-based UI components
{canManageUsers && <UserManagementPanel />}
{canEditContent && <ContentEditor />}
{canViewContent && <ContentViewer />}
```

## 🎨 User Experience | 用戶體驗

### Admin Dashboard Flow | 管理儀表板流程
1. **User logs in** via Google OAuth | **用戶登入** 透過 Google OAuth
2. **Automatic redirect** to admin dashboard | **自動重定向** 到管理儀表板
3. **Role-based interface** loads appropriate features | **基於角色的界面** 載入適當功能
4. **Permission upgrade option** available if applicable | **權限升級選項** 如適用則可用

### Permission Boundaries | 權限邊界
- **Visual indicators** show available vs restricted features | **視覺指示器** 顯示可用與受限功能
- **Graceful degradation** for insufficient permissions | **優雅降級** 應對權限不足
- **Clear upgrade paths** for enhanced access | **清晰的升級路徑** 獲得增強存取

## 🔧 Configuration | 配置

### Role Assignment Rules | 角色分配規則
```typescript
// Google OAuth domain mapping
const roleMapping = {
  'kcislk.ntpc.edu.tw': 'office_member',  // School staff
  'admin@kcislk.ntpc.edu.tw': 'admin',    // Administrators
  // Default for all other domains
  '*': 'viewer'
}
```

### Permission Checks | 權限檢查
```typescript
// Functional permission checks
const permissions = {
  canManageUsers: userIsAdmin,
  canManageSystem: userIsAdmin, 
  canEditContent: userIsAdmin || userIsOfficeMember,
  canViewContent: userIsAdmin || userIsOfficeMember || userIsViewer
}
```

## 🧪 Testing | 測試

### Test Scenarios | 測試場景
1. **New user registration** and automatic viewer assignment | **新用戶註冊** 和自動 viewer 分配
2. **Permission upgrade request** submission and approval | **權限升級請求** 提交和批准
3. **Role-based UI restrictions** across all user types | **基於角色的 UI 限制** 跨所有用戶類型
4. **Admin dashboard access** for different roles | **管理儀表板存取** 針對不同角色

### Validation Points | 驗證點
- ✅ All users can access admin dashboard | 所有用戶都能存取管理儀表板
- ✅ UI correctly reflects user permissions | UI 正確反映用戶權限
- ✅ Permission upgrades work end-to-end | 權限升級端到端工作
- ✅ Role assignments persist across sessions | 角色分配跨會話持續

## 🚨 Security Considerations | 安全考慮

### Access Control | 存取控制
- **Server-side validation** of all permissions | **伺服器端驗證** 所有權限
- **JWT token integration** with role claims | **JWT 令牌整合** 包含角色聲明
- **API endpoint protection** based on user roles | **API 端點保護** 基於用戶角色

### Audit Trail | 審計軌跡
- **Permission upgrade tracking** in database | **權限升級追蹤** 在資料庫中
- **Role assignment history** preserved | **角色分配歷史** 保存
- **Admin action logging** for accountability | **管理員操作記錄** 用於問責

## 📈 Benefits | 優勢

### For Users | 對用戶
- **Immediate access** upon registration | **註冊後立即存取**
- **Clear upgrade path** for additional permissions | **明確的升級路徑** 獲得額外權限
- **Intuitive interface** regardless of role level | **直觀界面** 無論角色層級

### For Administrators | 對管理員
- **Controlled access** without barriers | **受控存取** 無障礙
- **Streamlined user management** | **簡化的用戶管理**
- **Scalable permission system** | **可擴展的權限系統**

### For Organization | 對組織
- **Reduced support overhead** | **減少支援開銷**
- **Better user adoption** | **更好的用戶採用**
- **Flexible access control** | **靈活的存取控制**

---

**Implementation Status**: ✅ Complete and Production Ready | **實現狀態**: ✅ 完成且生產就緒  
**Next Steps**: Final testing and optimization | **下一步**: 最終測試和優化