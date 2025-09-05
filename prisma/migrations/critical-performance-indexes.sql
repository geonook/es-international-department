-- Critical Performance Optimization: Essential Database Indexes
-- Focus on the most performance-critical queries only

-- UserSession table indexes (Critical for auth performance)
CREATE INDEX IF NOT EXISTS "user_sessions_user_id_expires_at_idx" ON "user_sessions"("user_id", "expires_at");
CREATE INDEX IF NOT EXISTS "user_sessions_session_token_expires_at_idx" ON "user_sessions"("session_token", "expires_at");

-- User table indexes (Critical for user queries)
CREATE INDEX IF NOT EXISTS "users_email_is_active_idx" ON "users"("email", "is_active");
CREATE INDEX IF NOT EXISTS "users_is_active_created_at_idx" ON "users"("is_active", "created_at");

-- Event table indexes (Critical for event listing performance)
CREATE INDEX IF NOT EXISTS "events_status_start_date_idx" ON "events"("status", "start_date");
CREATE INDEX IF NOT EXISTS "events_event_type_status_idx" ON "events"("event_type", "status");
CREATE INDEX IF NOT EXISTS "events_start_date_created_at_idx" ON "events"("start_date", "created_at");

-- TeacherReminder table indexes (Critical for reminders performance)
CREATE INDEX IF NOT EXISTS "teacher_reminders_created_by_priority_idx" ON "teacher_reminders"("created_by", "priority");
CREATE INDEX IF NOT EXISTS "teacher_reminders_status_due_date_priority_idx" ON "teacher_reminders"("status", "due_date", "priority");

-- Notification table indexes (Critical for user notifications)
CREATE INDEX IF NOT EXISTS "notifications_recipient_id_is_read_idx" ON "notifications"("recipient_id", "is_read");
CREATE INDEX IF NOT EXISTS "notifications_recipient_id_created_at_idx" ON "notifications"("recipient_id", "created_at");

-- Resource table indexes (For resource queries)
CREATE INDEX IF NOT EXISTS "resources_category_id_status_idx" ON "resources"("category_id", "status");
CREATE INDEX IF NOT EXISTS "resources_created_by_status_idx" ON "resources"("created_by", "status");