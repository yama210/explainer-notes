import { NextResponse } from "next/server";
import { restoreRevision } from "@/lib/notes";
import { isPrismaNotFoundError, revalidateNotePages } from "@/lib/route-utils";

type RouteContext = {
  params: Promise<{
    id: string;
    revisionId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id, revisionId } = await context.params;

  try {
    const note = await restoreRevision(id, revisionId);

    revalidateNotePages(id, { includeEdit: true });

    return NextResponse.json({ id: note.id }, { status: 200 });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return NextResponse.json(
        { error: "復元対象の版が見つかりませんでした。" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "この版を復元できませんでした。" },
      { status: 500 },
    );
  }
}
