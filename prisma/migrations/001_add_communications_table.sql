-- Create unified communications table
-- This replaces the separate announcements and message_board tables

-- First, create the new communications table
CREATE TABLE communications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    
    -- Type and categorization
    type VARCHAR(20) NOT NULL DEFAULT 'message', -- 'announcement', 'message', 'reminder', 'newsletter'
    source_group VARCHAR(50), -- 'Vickie', 'Matthew', 'Academic Team', etc.
    
    -- Audience targeting
    target_audience VARCHAR(20) NOT NULL DEFAULT 'all', -- 'teachers', 'parents', 'all'
    board_type VARCHAR(20) NOT NULL DEFAULT 'general', -- 'teachers', 'parents', 'general'
    
    -- Status and priority
    status VARCHAR(20) NOT NULL DEFAULT 'published', -- 'draft', 'published', 'archived', 'closed'
    priority VARCHAR(10) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    
    -- Flags
    is_important BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timing
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Metadata
    author_id TEXT REFERENCES users(id),
    view_count INTEGER NOT NULL DEFAULT 0,
    reply_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_communications_type ON communications(type);
CREATE INDEX idx_communications_source_group ON communications(source_group);
CREATE INDEX idx_communications_board_type ON communications(board_type);
CREATE INDEX idx_communications_status ON communications(status);
CREATE INDEX idx_communications_priority ON communications(priority);
CREATE INDEX idx_communications_flags ON communications(is_important, is_pinned, is_featured);
CREATE INDEX idx_communications_author ON communications(author_id);
CREATE INDEX idx_communications_created_at ON communications(created_at);
CREATE INDEX idx_communications_published_at ON communications(published_at);

-- Create communication replies table
CREATE TABLE communication_replies (
    id SERIAL PRIMARY KEY,
    communication_id INTEGER NOT NULL REFERENCES communications(id) ON DELETE CASCADE,
    author_id TEXT REFERENCES users(id),
    content TEXT NOT NULL,
    parent_reply_id INTEGER REFERENCES communication_replies(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for replies
CREATE INDEX idx_communication_replies_communication ON communication_replies(communication_id);
CREATE INDEX idx_communication_replies_author ON communication_replies(author_id);
CREATE INDEX idx_communication_replies_parent ON communication_replies(parent_reply_id);
CREATE INDEX idx_communication_replies_created_at ON communication_replies(created_at);

-- Migrate data from existing tables
-- First, migrate announcements
INSERT INTO communications (
    title, content, summary, type, target_audience, status, priority,
    published_at, expires_at, author_id, created_at, updated_at
)
SELECT 
    title, content, summary, 'announcement', target_audience, status, priority,
    published_at, expires_at, author_id, created_at, updated_at
FROM announcements;

-- Then, migrate message_board posts  
INSERT INTO communications (
    title, content, type, source_group, board_type, 
    is_important, is_pinned, status, author_id, 
    view_count, reply_count, created_at, updated_at
)
SELECT 
    title, content, 'message', source_group, board_type,
    is_important, is_pinned, status, author_id,
    view_count, reply_count, created_at, updated_at
FROM message_board;

-- Migrate message replies to communication replies
INSERT INTO communication_replies (
    communication_id, author_id, content, parent_reply_id, created_at, updated_at
)
SELECT 
    -- Map message_id to new communication_id
    (SELECT c.id FROM communications c 
     JOIN message_board mb ON mb.title = c.title AND mb.created_at = c.created_at 
     WHERE mb.id = mr.message_id),
    mr.author_id, mr.content, mr.parent_reply_id, mr.created_at, mr.updated_at
FROM message_replies mr;

-- Update reply counts in communications table
UPDATE communications 
SET reply_count = (
    SELECT COUNT(*) 
    FROM communication_replies cr 
    WHERE cr.communication_id = communications.id
);

-- Add comment for future reference
COMMENT ON TABLE communications IS 'Unified communications table - replaces announcements and message_board';
COMMENT ON COLUMN communications.type IS 'Communication type: announcement, message, reminder, newsletter';
COMMENT ON COLUMN communications.source_group IS 'Source: Vickie, Matthew, Academic Team, Curriculum Team, Instructional Team';
COMMENT ON COLUMN communications.status IS 'Status: draft, published, archived, closed';
COMMENT ON COLUMN communications.priority IS 'Priority: low, medium, high, critical';