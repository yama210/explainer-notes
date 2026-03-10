CREATE TYPE "NoteStatus" AS ENUM ('DRAFT', 'REVIEWING', 'EXPLAINABLE', 'ARCHIVED');

ALTER TABLE "Note"
ADD COLUMN "summary" TEXT NOT NULL DEFAULT '',
ADD COLUMN "explanation" TEXT NOT NULL DEFAULT '',
ADD COLUMN "stuckPoints" TEXT NOT NULL DEFAULT '',
ADD COLUMN "nextActions" TEXT NOT NULL DEFAULT '',
ADD COLUMN "body" TEXT NOT NULL DEFAULT '',
ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "status" "NoteStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "needsReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "reviewDueAt" TIMESTAMP(3);

UPDATE "Note"
SET "body" = "content";

UPDATE "Note" AS "note"
SET "tags" = COALESCE("tag_map"."tags", ARRAY[]::TEXT[])
FROM (
    SELECT
        "NoteTag"."noteId",
        ARRAY_AGG(LOWER("Tag"."name") ORDER BY LOWER("Tag"."name")) AS "tags"
    FROM "NoteTag"
    INNER JOIN "Tag" ON "Tag"."id" = "NoteTag"."tagId"
    GROUP BY "NoteTag"."noteId"
) AS "tag_map"
WHERE "note"."id" = "tag_map"."noteId";

ALTER TABLE "Note"
DROP COLUMN "content",
DROP COLUMN "noteType",
DROP COLUMN "subject";

DROP TABLE "NoteTag";
DROP TABLE "Tag";

DROP TYPE "NoteType";
DROP TYPE "Subject";

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
