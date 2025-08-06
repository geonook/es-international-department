# KCISLK ESID Info Hub Database Requirements
*KCISLK 小學國際處資訊中心資料庫需求文件*

## 系統概述 | System Overview

KCISLK ESID Info Hub 系統是一個多角色的教育管理平台，包含家長門戶、教師中心和管理員後台。本文件詳細描述了系統的資料庫需求、架構設計和實作建議。

## 核心功能模組 | Core Functional Modules

### 1. 使用者管理系統 | User Management System
- 多角色權限控制（家長、教師、管理員）
- 身份驗證與授權
- 會話管理
- 使用者個人資料管理

### 2. 內容管理系統 | Content Management System
- 公告管理（教師和家長公告）
- 電子報管理
- 活動資訊管理
- 學習資源管理
- 文件上傳與分類

### 3. 分級資源系統 | Graded Resource System
- 年級分類管理（Grades 1-6）
- 資源類型分類（PDF、Video、Interactive等）
- 校長有約分級資料
- Coffee with Principal 簡報管理

### 4. 通知與溝通系統 | Notification & Communication
- 系統通知
- 留言板功能
- 意見回饋表單
- LINE Bot 整合準備

## 資料庫架構設計 | Database Schema Design

### 使用者相關表格 | User-Related Tables

#### users 使用者主表
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### roles 角色定義表
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 預設角色數據
INSERT INTO roles (name, display_name, description) VALUES
('admin', 'Administrator', 'System administrator with full access'),
('teacher', 'Teacher', 'Teaching staff with limited admin access'),
('parent', 'Parent', 'Parent with access to student information');
```

#### user_roles 使用者角色關聯表
```sql
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);
```

#### user_sessions 會話管理表
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 內容管理相關表格 | Content Management Tables

#### announcements 公告表
```sql
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    author_id UUID REFERENCES users(id),
    target_audience VARCHAR(20) CHECK (target_audience IN ('teachers', 'parents', 'all')),
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### newsletters 電子報表
```sql
CREATE TABLE newsletters (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    html_content TEXT,
    cover_image_url TEXT,
    author_id UUID REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    issue_number INTEGER,
    publication_date DATE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### events 活動表
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    max_participants INTEGER,
    registration_required BOOLEAN DEFAULT false,
    registration_deadline DATE,
    target_grades JSONB, -- Array of grade levels
    created_by UUID REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'cancelled')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### coffee_with_principal 校長有約表
```sql
CREATE TABLE coffee_with_principal (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    grade_levels JSONB NOT NULL, -- ['1-2', '3-4', '5-6']
    presentation_url TEXT,
    materials_url TEXT,
    event_date DATE NOT NULL,
    session_time TIME,
    location VARCHAR(255),
    max_participants INTEGER,
    registration_count INTEGER DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 資源管理相關表格 | Resource Management Tables

#### resource_categories 資源分類表
```sql
CREATE TABLE resource_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### grade_levels 年級表
```sql
CREATE TABLE grade_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL, -- 'Grades 1-2', 'Grades 3-4', etc.
    display_name VARCHAR(50) NOT NULL,
    min_grade INTEGER NOT NULL,
    max_grade INTEGER NOT NULL,
    color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- 預設年級數據
INSERT INTO grade_levels (name, display_name, min_grade, max_grade, color, sort_order) VALUES
('Grades 1-2', 'Grades 1-2', 1, 2, 'from-blue-500 to-blue-600', 1),
('Grades 3-4', 'Grades 3-4', 3, 4, 'from-green-500 to-green-600', 2),
('Grades 5-6', 'Grades 5-6', 5, 6, 'from-purple-500 to-purple-600', 3);
```

#### resources 學習資源表
```sql
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL, -- 'PDF', 'Video', 'Interactive', 'External Platform'
    file_url TEXT,
    external_url TEXT,
    thumbnail_url TEXT,
    file_size BIGINT, -- in bytes
    duration INTEGER, -- for video resources in seconds
    grade_level_id INTEGER REFERENCES grade_levels(id),
    category_id INTEGER REFERENCES resource_categories(id),
    created_by UUID REFERENCES users(id),
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### resource_tags 資源標籤表
```sql
CREATE TABLE resource_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE resource_tag_relations (
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES resource_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (resource_id, tag_id)
);
```

### 通知與溝通相關表格 | Notification & Communication Tables

#### notifications 通知表
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'announcement', 'event', 'newsletter', 'system'
    related_id INTEGER, -- Reference to related entity
    related_type VARCHAR(50), -- Type of related entity
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### message_board 留言板表
```sql
CREATE TABLE message_board (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id),
    board_type VARCHAR(20) CHECK (board_type IN ('teachers', 'parents', 'general')) DEFAULT 'general',
    is_pinned BOOLEAN DEFAULT false,
    reply_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('active', 'closed', 'archived')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### message_replies 留言回覆表
```sql
CREATE TABLE message_replies (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES message_board(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    parent_reply_id INTEGER REFERENCES message_replies(id), -- For nested replies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### feedback_forms 意見回饋表
```sql
CREATE TABLE feedback_forms (
    id SERIAL PRIMARY KEY,
    author_id UUID REFERENCES users(id),
    author_name VARCHAR(100), -- For anonymous feedback
    author_email VARCHAR(255), -- For anonymous feedback
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50), -- 'suggestion', 'complaint', 'appreciation', 'question'
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status VARCHAR(20) CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')) DEFAULT 'new',
    assigned_to UUID REFERENCES users(id),
    response TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 系統設定相關表格 | System Configuration Tables

#### system_settings 系統設定表
```sql
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    data_type VARCHAR(20) CHECK (data_type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
    is_public BOOLEAN DEFAULT false, -- Whether this setting can be accessed by non-admins
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 預設系統設定
INSERT INTO system_settings (key, value, description, data_type, is_public) VALUES
('site_name', 'KCISLK ESID Info Hub', 'Site display name', 'string', true),
('admin_email', 'esid@kcislk.ntpc.edu.tw', 'Administrator email', 'string', false),
('max_file_size', '10485760', 'Maximum file upload size in bytes', 'number', false),
('session_timeout', '30', 'Session timeout in minutes', 'number', false),
('max_login_attempts', '5', 'Maximum login attempts before lockout', 'number', false);
```

#### file_uploads 檔案上傳記錄表
```sql
CREATE TABLE file_uploads (
    id SERIAL PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    related_type VARCHAR(50), -- 'announcement', 'newsletter', 'resource', etc.
    related_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 索引設計 | Index Design

```sql
-- 使用者相關索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- 內容管理索引
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_target_audience ON announcements(target_audience);
CREATE INDEX idx_announcements_published ON announcements(published_at DESC);
CREATE INDEX idx_events_date ON events(start_date, end_date);
CREATE INDEX idx_events_status ON events(status);

-- 資源管理索引
CREATE INDEX idx_resources_grade_category ON resources(grade_level_id, category_id);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_featured ON resources(is_featured);

-- 通知索引
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

## 資料關聯與約束 | Data Relations & Constraints

### 主要外鍵關聯
1. **使用者系統**: users → user_roles → roles
2. **內容管理**: users → announcements/newsletters/events
3. **資源系統**: grade_levels → resources ← categories
4. **通知系統**: users → notifications
5. **留言系統**: users → message_board → message_replies

### 資料完整性約束
- 所有使用者相關操作都必須關聯到有效的使用者ID
- 發布狀態的內容必須有發布時間
- 檔案上傳必須記錄完整的檔案資訊
- 分級權限確保使用者只能存取授權的內容

## 效能優化建議 | Performance Optimization

### 資料庫層級優化
1. **適當的索引策略**: 針對常用查詢條件建立複合索引
2. **資料分割**: 考慮依日期分割大型歷史資料表
3. **讀寫分離**: 使用讀取副本處理查詢密集的操作
4. **連接池管理**: 配置適當的資料庫連接池大小

### 應用層級優化
1. **快取策略**: 使用 Redis 快取常用資料
2. **延遲載入**: 實作資料的懶載入機制
3. **批次處理**: 對於大量資料操作使用批次處理
4. **CDN 整合**: 靜態資源使用 CDN 加速

## 備份與災難恢復 | Backup & Disaster Recovery

### 備份策略
- **每日完整備份**: 凌晨進行完整資料庫備份
- **增量備份**: 每小時進行交易日誌備份
- **異地備份**: 備份檔案存放到不同地理位置
- **備份驗證**: 定期驗證備份檔案的完整性

### 災難恢復計畫
- **RTO目標**: 系統恢復時間目標 < 4小時
- **RPO目標**: 資料遺失時間目標 < 1小時
- **故障轉移**: 主從資料庫自動故障轉移
- **定期演練**: 每季進行災難恢復演練

## 安全性考慮 | Security Considerations

### 資料保護
- **敏感資料加密**: 密碼使用 bcrypt 雜湊
- **個人資料保護**: 符合 GDPR/CCPA 要求
- **存取控制**: 基於角色的細粒度權限控制
- **審計追蹤**: 記錄所有敏感操作的審計日誌

### 資料庫安全
- **連接加密**: 強制使用 SSL/TLS 連接
- **權限管理**: 最小權限原則
- **定期更新**: 保持資料庫軟體最新版本
- **防注入攻擊**: 使用參數化查詢防止 SQL 注入

---

*此文件將隨系統發展持續更新維護*
*This document will be continuously updated as the system evolves*