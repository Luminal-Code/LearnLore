/*
  Warnings:

  - You are about to drop the column `memoryHook` on the `Story` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "learnlore"."Story" DROP COLUMN "memoryHook",
ADD COLUMN     "memoryHooks" TEXT[];
