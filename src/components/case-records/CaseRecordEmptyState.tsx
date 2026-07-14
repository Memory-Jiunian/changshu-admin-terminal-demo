export function CaseRecordEmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-500">
      {text}
    </div>
  );
}
