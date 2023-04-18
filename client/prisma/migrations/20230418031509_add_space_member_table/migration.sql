-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDIT', 'READ');

-- CreateTable
CREATE TABLE "SpaceMember" (
    "id" SERIAL NOT NULL,
    "spaceId" INTEGER NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',

    CONSTRAINT "SpaceMember_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SpaceMember" ADD CONSTRAINT "SpaceMember_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceMember" ADD CONSTRAINT "SpaceMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
