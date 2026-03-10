import { NextResponse } from "next/server";
import { completeReview } from "@/lib/notes";
import { noteStatusMeta } from "@/lib/note-status";
import { isPrismaNotFoundError, revalidateNotePages } from "@/lib/route-utils";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const result = await completeReview(id);

    revalidateNotePages(id);

    return NextResponse.json(
      {
        id: result.note.id,
        status: result.note.status,
        statusLabel: noteStatusMeta[result.note.status].label,
        reviewDueAt: result.note.reviewDueAt,
        intervalDays: result.intervalDays,
      },
      { status: 200 },
    );
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return NextResponse.json(
        { error: "ノートが見つかりませんでした。" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "復習完了を記録できませんでした。" },
      { status: 500 },
    );
  }
}
