import { NextResponse } from "next/server";
import { deleteNote, updateNote } from "@/lib/notes";
import {
  getFirstValidationMessage,
  isPrismaNotFoundError,
  revalidateNotePages,
} from "@/lib/route-utils";
import { noteInputSchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const json = (await request.json()) as unknown;
    const payload = noteInputSchema.safeParse(json);

    if (!payload.success) {
      return NextResponse.json(
        {
          error: getFirstValidationMessage(payload.error),
        },
        { status: 400 },
      );
    }

    const note = await updateNote(id, payload.data);

    revalidateNotePages(id, { includeEdit: true });

    return NextResponse.json({ id: note.id }, { status: 200 });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return NextResponse.json(
        { error: "ノートが見つかりませんでした。" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "ノートの更新に失敗しました。" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await deleteNote(id);

    revalidateNotePages(id);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return NextResponse.json(
        { error: "ノートが見つかりませんでした。" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "ノートの削除に失敗しました。" },
      { status: 500 },
    );
  }
}
