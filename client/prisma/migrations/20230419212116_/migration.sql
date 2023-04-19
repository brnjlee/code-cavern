/*
  Warnings:

  - A unique constraint covering the columns `[spaceId,memberId,pendingEmail]` on the table `SpaceMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SpaceMember_spaceId_pendingEmail_key";

-- CreateIndex
CREATE UNIQUE INDEX "SpaceMember_spaceId_memberId_pendingEmail_key" ON "SpaceMember"("spaceId", "memberId", "pendingEmail");
