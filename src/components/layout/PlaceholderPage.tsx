export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-[1440px]">
      <h1 className="text-2xl font-semibold text-neutral-950">{title}</h1>
      <div className="mt-5 rounded-lg border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-sm text-neutral-500">
        当前模块尚未实现。
      </div>
    </section>
  );
}
