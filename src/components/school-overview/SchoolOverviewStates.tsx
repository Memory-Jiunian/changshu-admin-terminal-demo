import { AlertCircle, DatabaseZap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SchoolOverviewDataIssue } from "@/types/school-overview";

export function SchoolOverviewLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="校级总览加载中">
      <div className="flex items-center justify-between"><Skeleton className="h-9 w-40" /><Skeleton className="h-9 w-72" /></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton className="h-28" key={index} />)}</div>
      <Skeleton className="h-32" />
      <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
    </div>
  );
}

export function SchoolOverviewFailure({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center" role="alert">
      <AlertCircle className="h-8 w-8 text-[var(--danger-500)]" aria-hidden="true" />
      <h1 className="mt-4 text-xl font-semibold text-[var(--text-title)]">校级总览加载失败</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">当前无法生成可靠的聚合统计，请重新加载。</p>
      <Button className="mt-5" onClick={onRetry} type="button">重新加载</Button>
    </Card>
  );
}

export function SchoolOverviewDataIssues({ issues }: { issues: SchoolOverviewDataIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <Card className="border-[var(--warning-100)] bg-[var(--warning-50)] p-4 shadow-none" role="status">
      <div className="flex items-start gap-3">
        <DatabaseZap className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning-500)]" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold text-[var(--warning-600)]">部分数据需要核对</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--warning-600)]">相关记录未被静默修正；受影响模块按照安全兼容规则展示。此处不提供学生身份。</p>
          <ul className="mt-2 space-y-1 text-xs text-[var(--warning-600)]">
            {issues.map((issue) => <li key={`${issue.code}:${issue.module}`}>· {issue.message}{issue.affectedCount === null ? "" : `（${issue.affectedCount} 条）`}</li>)}
          </ul>
        </div>
      </div>
    </Card>
  );
}

export function SchoolOverviewEmptyNotice({ children }: { children: string }) {
  return <div className="rounded-md border border-dashed border-[var(--border-strong)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-secondary)]" role="status">{children}</div>;
}
