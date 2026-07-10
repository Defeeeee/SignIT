/*
  Warnings:

  - You are about to drop the column `storageQuotaBytes` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `storageUsedBytes` on the `usuarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "storageQuotaBytes",
DROP COLUMN "storageUsedBytes",
ADD COLUMN     "storageQuotaMb" INTEGER NOT NULL DEFAULT 20000,
ADD COLUMN     "storageUsedMb" INTEGER NOT NULL DEFAULT 0;
