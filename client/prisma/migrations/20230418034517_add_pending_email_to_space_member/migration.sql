-- AlterTable
ALTER TABLE "SpaceMember" ADD COLUMN     "pendingEmail" TEXT,
ALTER COLUMN "memberId" DROP NOT NULL;
