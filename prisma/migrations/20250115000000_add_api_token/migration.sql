-- AlterTable
ALTER TABLE "User" ADD COLUMN "api_token" TEXT,
ADD COLUMN "token_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_api_token_key" ON "User"("api_token");

-- CreateIndex
CREATE INDEX "User_api_token_idx" ON "User"("api_token");
