/*
  Warnings:

  - A unique constraint covering the columns `[spaceId,pendingEmail]` on the table `SpaceMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SpaceMember_spaceId_pendingEmail_key" ON "SpaceMember"("spaceId", "pendingEmail");
