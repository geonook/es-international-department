-- Performance Optimization: Database Indexes for N+1 Query Prevention
-- Migration: Add critical indexes for frequently queried fields

-- UserSession table indexes
CREATE INDEX IF NOT EXISTS "user_sessions_user_id_expires_at_idx" ON "user_sessions"("user_id", "expires_at");
CREATE INDEX IF NOT EXISTS "user_sessions_session_token_expires_at_idx" ON "user_sessions"("session_token", "expires_at");

-- User table indexes
CREATE INDEX IF NOT EXISTS "users_email_is_active_idx" ON "users"("email", "is_active");
CREATE INDEX IF NOT EXISTS "users_is_active_created_at_idx" ON "users"("is_active", "created_at");

-- UserRole table indexes (already has some, adding more specific ones)
CREATE INDEX IF NOT EXISTS "user_roles_user_id_role_id_idx" ON "user_roles"("user_id", "role_id");

-- Event table indexes
CREATE INDEX IF NOT EXISTS "events_status_start_date_idx" ON "events"("status", "start_date");
CREATE INDEX IF NOT EXISTS "events_event_type_status_idx" ON "events"("event_type", "status");
CREATE INDEX IF NOT EXISTS "events_created_by_status_idx" ON "events"("created_by", "status");
CREATE INDEX IF NOT EXISTS "events_start_date_created_at_idx" ON "events"("start_date", "created_at");

-- EventRegistration table indexes (some already exist, adding missing ones)
CREATE INDEX IF NOT EXISTS "event_registrations_user_id_event_id_idx" ON "event_registrations"("user_id", "event_id");

-- TeacherReminder table indexes (some already exist, adding missing ones)
CREATE INDEX IF NOT EXISTS "teacher_reminders_created_by_priority_idx" ON "teacher_reminders"("created_by", "priority");
CREATE INDEX IF NOT EXISTS "teacher_reminders_status_due_date_priority_idx" ON "teacher_reminders"("status", "due_date", "priority");

-- Communication table indexes (using snake_case column names)
CREATE INDEX IF NOT EXISTS "communications_type_status_idx" ON "communications"("type", "status");
CREATE INDEX IF NOT EXISTS "communications_source_group_status_idx" ON "communications"("source_group", "status");
CREATE INDEX IF NOT EXISTS "communications_board_type_status_idx" ON "communications"("board_type", "status");

-- Notification table indexes
CREATE INDEX IF NOT EXISTS "notifications_recipient_id_is_read_idx" ON "notifications"("recipient_id", "is_read");
CREATE INDEX IF NOT EXISTS "notifications_recipient_id_created_at_idx" ON "notifications"("recipient_id", "created_at");

-- Resource table indexes
CREATE INDEX IF NOT EXISTS "resources_category_id_status_idx" ON "resources"("category_id", "status");
CREATE INDEX IF NOT EXISTS "resources_grade_level_id_status_idx" ON "resources"("grade_level_id", "status");
CREATE INDEX IF NOT EXISTS "resources_created_by_status_idx" ON "resources"("created_by", "status");

-- System Settings table (already has index but adding composite)
CREATE INDEX IF NOT EXISTS "system_settings_is_public_key_idx" ON "system_settings"("is_public", "key");