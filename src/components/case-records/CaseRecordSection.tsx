import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type CaseRecordSectionProps = {
  title: string;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export function CaseRecordSection({ title, count, expanded, onToggle, children }: CaseRecordSectionProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <button
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={onToggle}
        type="button"
      >
        <span className="text-sm font-semibold text-neutral-950">{title}</span>
        <span className="flex items-center gap-2 text-xs text-neutral-500">
          {count !== undefined ? `共 ${count} 条` : null}
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
        </span>
      </button>
      {expanded ? <div className="border-t border-neutral-100 p-4">{children}</div> : null}
    </section>
  );
}

export function CaseRecordValue({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-neutral-500">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-neutral-800">{value || "-"}</dd>
    </div>
  );
}
