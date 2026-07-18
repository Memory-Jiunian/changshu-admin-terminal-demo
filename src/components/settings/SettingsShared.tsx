import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SystemActionResult } from "@/types/system-settings";

export function Field({
  children,
  label,
  hint,
}: {
  children: ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <label className="space-y-1.5 text-sm">
      <span className="font-medium text-[var(--text-primary)]">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-[var(--text-secondary)]">{hint}</span> : null}
    </label>
  );
}

export function ResultNotice({ result }: { result?: SystemActionResult | null }) {
  if (!result) return null;
  return (
    <div
      className={result.success
        ? "rounded-md border border-[var(--success-200)] bg-[var(--success-50)] px-3 py-2 text-sm text-[var(--success-700)]"
        : "rounded-md border border-[var(--danger-200)] bg-[var(--danger-50)] px-3 py-2 text-sm text-[var(--danger-700)]"}
      role={result.success ? "status" : "alert"}
    >
      <div className="font-medium">{result.message}</div>
      {!result.success && result.issues.length ? (
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs">
          {result.issues.map((issue) => <li key={`${issue.code}-${issue.message}`}>{issue.message}</li>)}
        </ul>
      ) : null}
    </div>
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge className={active
      ? "bg-[var(--success-50)] text-[var(--success-700)]"
      : "bg-[var(--neutral-100)] text-[var(--text-secondary)]"}
    >
      {active ? "启用" : "停用"}
    </Badge>
  );
}

export function LeaveConfirmDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>放弃未保存修改？</DialogTitle>
          <DialogDescription>当前页面有未保存内容，切换后这些修改不会保留。</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button className="h-9 rounded-md border px-4 text-sm" onClick={onCancel} type="button">继续编辑</button>
          <button className="h-9 rounded-md bg-[var(--danger-600)] px-4 text-sm text-white" onClick={onConfirm} type="button">放弃并切换</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
