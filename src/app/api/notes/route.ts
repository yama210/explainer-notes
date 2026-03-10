import { NextResponse } from "next/server";
import { createNote } from "@/lib/notes";
import { getFirstValidationMessage, revalidateNotePages } from "@/lib/route-utils";
import { noteInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
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

    const note = await createNote(payload.data);

    revalidateNotePages(note.id);

    return NextResponse.json({ id: note.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "ノートの作成に失敗しました。" },
      { status: 500 },
    );
  }
}
