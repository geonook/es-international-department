-- Add embed_code column to communications table
ALTER TABLE "communications" 
ADD COLUMN IF NOT EXISTS "embed_code" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN "communications"."embed_code" IS 'Complete iframe embed code for newsletter display';