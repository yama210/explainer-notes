import { EmptyState } from "@/components/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      title="ノートが見つかりませんでした"
      description="URL が違っているか、すでに削除された可能性があります。一覧に戻って探し直してください。"
      primaryHref="/notes"
      primaryLabel="ノート一覧へ戻る"
      secondaryHref="/notes/new"
      secondaryLabel="新しく作成する"
    />
  );
}
