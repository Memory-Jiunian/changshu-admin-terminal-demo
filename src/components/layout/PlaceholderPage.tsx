export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-[1440px]">
      <h1 className="text-2xl font-semibold text-[var(--text-title)]">{title}</h1>
      <div className="mt-5 rounded-[var(--card-radius)] border border-dashed border-[var(--border-strong)] bg-[var(--bg-card)] px-6 py-16 text-center text-sm text-[var(--text-tertiary)]">
        当前模块尚未实现。
      </div>
    </section>
  );
}
