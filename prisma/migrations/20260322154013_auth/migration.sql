-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "learnlore";

-- CreateTable
CREATE TABLE "learnlore"."User" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learnlore"."UserIdentifier" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "identifierType" TEXT NOT NULL,
    "identifierValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learnlore"."Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learnlore"."Concept" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Concept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learnlore"."Story" (
    "id" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "storyText" TEXT NOT NULL,
    "memoryHook" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learnlore"."Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learnlore"."UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "masteryLevel" INTEGER NOT NULL DEFAULT 1,
    "reviewedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserIdentifier_identifierType_identifierValue_key" ON "learnlore"."UserIdentifier"("identifierType", "identifierValue");

-- CreateIndex
CREATE UNIQUE INDEX "Story_conceptId_key" ON "learnlore"."Story"("conceptId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "learnlore"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_storyId_key" ON "learnlore"."UserProgress"("userId", "storyId");

-- AddForeignKey
ALTER TABLE "learnlore"."UserIdentifier" ADD CONSTRAINT "UserIdentifier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "learnlore"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learnlore"."Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "learnlore"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learnlore"."Concept" ADD CONSTRAINT "Concept_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "learnlore"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learnlore"."Story" ADD CONSTRAINT "Story_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "learnlore"."Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learnlore"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "learnlore"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learnlore"."UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "learnlore"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learnlore"."UserProgress" ADD CONSTRAINT "UserProgress_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "learnlore"."Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
