-- Fix carousel image path in Production database
-- Date: 2025-09-13

-- Update the default carousel image path to use an existing image
UPDATE content_carousel_images 
SET 
    image_url = '/images/parent-child-reading.jpg',
    updated_at = NOW()
WHERE image_url = '/images/carousel/default-1.jpg';

-- Verify the update
SELECT 
    id,
    title,
    image_url,
    is_active,
    updated_at
FROM content_carousel_images
WHERE image_url = '/images/parent-child-reading.jpg';