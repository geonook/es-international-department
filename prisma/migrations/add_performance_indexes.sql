-- Performance Optimization Indexes for KCISLK ESID Info Hub
-- 性能優化索引 - 提升查詢速度

-- Users table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active ON "users"("email") WHERE "is_active" = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_provider_account ON "users"("provider", "provider_account_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login ON "users"("last_login_at") WHERE "last_login_at" IS NOT NULL;

-- Announcements table optimizations (high priority - 623ms target)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_status_target_audience ON "announcements"("status", "target_audience");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_published_priority ON "announcements"("published_at", "priority") WHERE "status" = 'published';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_expires_at ON "announcements"("expires_at") WHERE "expires_at" IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_created_desc ON "announcements"("created_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_text_search ON "announcements" USING gin(to_tsvector('english', "title" || ' ' || COALESCE("content", '') || ' ' || COALESCE("summary", '')));

-- Events table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_date_range ON "events"("start_date", "end_date");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_status_featured ON "events"("status", "is_featured");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_type_grades ON "events"("event_type", "target_grades") USING gin("target_grades");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_registration_deadline ON "events"("registration_deadline") WHERE "registration_required" = true;

-- Resources table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resources_category_grade ON "resources"("category_id", "grade_level_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resources_type_status ON "resources"("resource_type", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resources_featured_created ON "resources"("is_featured", "created_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resources_downloads_views ON "resources"("download_count" DESC, "view_count" DESC);

-- User roles optimization (frequently joined)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_role ON "user_roles"("user_id", "role_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_role_assigned ON "user_roles"("role_id", "assigned_at");

-- Notifications optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_recipient_unread ON "notifications"("recipient_id", "is_read", "created_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type_related ON "notifications"("type", "related_type", "related_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_expires ON "notifications"("expires_at") WHERE "expires_at" IS NOT NULL;

-- Event registrations optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_registrations_event_status ON "event_registrations"("event_id", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_registrations_user_registered ON "event_registrations"("user_id", "registered_at" DESC);

-- File uploads optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_file_uploads_related ON "file_uploads"("related_type", "related_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_file_uploads_uploader_date ON "file_uploads"("uploaded_by", "created_at" DESC);

-- User sessions optimization (for auth performance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_token_expires ON "user_sessions"("session_token", "expires_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_active ON "user_sessions"("user_id") WHERE "expires_at" > NOW();

-- Message board optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_board_type_pinned ON "message_board"("board_type", "is_pinned", "created_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_board_status_updated ON "message_board"("status", "updated_at" DESC);

-- Resource tags optimization (many-to-many)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resource_tag_relations_resource ON "resource_tag_relations"("resource_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resource_tag_relations_tag ON "resource_tag_relations"("tag_id");

-- User grade assignments optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_grade_assignments_active ON "user_grade_assignments"("user_id", "is_active", "relationship");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_grade_assignments_grade_rel ON "user_grade_assignments"("grade_level_id", "relationship", "is_active");

-- Notification preferences optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_preferences_user ON "notification_preferences"("user_id");

-- OAuth accounts optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_provider_user ON "accounts"("provider", "user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_expires ON "accounts"("expires_at") WHERE "expires_at" IS NOT NULL;

-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_published_current ON "announcements"("created_at" DESC) 
  WHERE "status" = 'published' AND ("expires_at" IS NULL OR "expires_at" > NOW());
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_upcoming ON "events"("start_date", "created_at" DESC) 
  WHERE "status" = 'published' AND "start_date" >= CURRENT_DATE;
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resources_active ON "resources"("created_at" DESC) 
  WHERE "status" = 'published';

-- Comment explaining index strategy
-- These indexes are designed to:
-- 1. Speed up common WHERE clause combinations
-- 2. Optimize ORDER BY clauses (especially DESC sorts)
-- 3. Support efficient JOIN operations
-- 4. Enable partial indexes for filtered queries
-- 5. Use GIN indexes for JSON and full-text search
-- 6. Create CONCURRENTLY to avoid blocking during creation