CREATE TYPE "NoteStatus" AS ENUM ('DRAFT', 'REVIEWING', 'EXPLAINABLE', 'ARCHIVED');

DROP TABLE IF EXISTS "NoteItem";

CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "explanation" TEXT NOT NULL DEFAULT '',
    "stuckPoints" TEXT NOT NULL DEFAULT '',
    "nextActions" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" "NoteStatus" NOT NULL DEFAULT 'DRAFT',
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewDueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NoteRevision" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "explanation" TEXT NOT NULL DEFAULT '',
    "stuckPoints" TEXT NOT NULL DEFAULT '',
    "nextActions" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" "NoteStatus" NOT NULL,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewDueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteRevision_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Note_updatedAt_idx" ON "Note"("updatedAt" DESC);
CREATE INDEX "Note_status_updatedAt_idx" ON "Note"("status", "updatedAt" DESC);
CREATE INDEX "Note_needsReview_reviewDueAt_idx" ON "Note"("needsReview", "reviewDueAt");
CREATE INDEX "NoteRevision_noteId_createdAt_idx" ON "NoteRevision"("noteId", "createdAt" DESC);

ALTER TABLE "NoteRevision"
ADD CONSTRAINT "NoteRevision_noteId_fkey"
FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
