-- Fix Production Database: Create content_carousel_images table
-- This script creates the missing content_carousel_images table in production
-- Date: 2025-09-12

-- Create content_carousel_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS "content_carousel_images" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "image_url" TEXT NOT NULL,
    "alt_text" TEXT DEFAULT 'Family learning moment' NOT NULL,
    "order" INTEGER DEFAULT 0 NOT NULL,
    "is_active" BOOLEAN DEFAULT true NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_carousel_images_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "content_carousel_images_is_active_order_idx" 
    ON "content_carousel_images"("is_active", "order");

CREATE INDEX IF NOT EXISTS "content_carousel_images_uploaded_by_idx" 
    ON "content_carousel_images"("uploaded_by");

-- Add foreign key constraint to users table
ALTER TABLE "content_carousel_images" 
    ADD CONSTRAINT "content_carousel_images_uploaded_by_fkey" 
    FOREIGN KEY ("uploaded_by") 
    REFERENCES "users"("id") 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE;

-- Insert default carousel images (optional)
INSERT INTO "content_carousel_images" 
    ("title", "description", "image_url", "alt_text", "order", "is_active", "uploaded_by", "created_at", "updated_at")
SELECT 
    'Welcome to ESID Info Hub',
    'Your gateway to elementary school international education resources',
    '/images/carousel/default-1.jpg',
    'Students learning together',
    1,
    true,
    id,
    NOW(),
    NOW()
FROM "users" 
WHERE email = 'admin@kcislk.ntpc.edu.tw'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Verify table creation
SELECT 
    'content_carousel_images table created successfully' as status,
    COUNT(*) as row_count 
FROM content_carousel_images;