-- AlterTable
-- Add api_token column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'User' 
        AND column_name = 'api_token'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "api_token" TEXT;
    END IF;
END $$;

-- Add token_expires_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'User' 
        AND column_name = 'token_expires_at'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "token_expires_at" TIMESTAMP(3);
    END IF;
END $$;

-- CreateIndex
-- Create unique index if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'User' 
        AND indexname = 'User_api_token_key'
    ) THEN
        CREATE UNIQUE INDEX "User_api_token_key" ON "User"("api_token");
    END IF;
END $$;

-- CreateIndex
-- Create index if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'User' 
        AND indexname = 'User_api_token_idx'
    ) THEN
        CREATE INDEX "User_api_token_idx" ON "User"("api_token");
    END IF;
END $$;
