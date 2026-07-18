import { CaseRecordEmptyState } from "@/components/case-records/CaseRecordEmptyState";
import type { WarningAiConversationRecord } from "@/types/warning";

export function AiConversationRecords({ records }: { records: WarningAiConversationRecord[] }) {
  if (!records.length) return <CaseRecordEmptyState text="暂无可见 AI 倾诉会话" />;
  return <div className="space-y-3">{records.map((record) => (
    <details className="rounded-md border border-neutral-200 bg-neutral-50 p-3" key={record.id}>
      <summary className="cursor-pointer text-sm font-semibold text-neutral-900">
        会话 {record.startedAt}{record.endedAt ? ` - ${record.endedAt}` : ""}
      </summary>
      <p className="mt-3 text-sm leading-6 text-neutral-700">会话摘要：{record.summary}</p>
      <div className="mt-3 space-y-2">{record.messages.map((message) => (
        <div className={`rounded-md p-3 text-sm ${message.role === "student" ? "bg-white" : "bg-neutral-200/60"}`} key={message.id}>
          <div className="flex justify-between gap-3 text-xs text-neutral-500">
            <span>{message.role === "student" ? "学生" : "AI 助手"}</span><span>{message.sentAt}</span>
          </div>
          <p className="mt-1 leading-6 text-neutral-800">{message.content}</p>
          {message.riskMarker ? <div className="mt-2 text-xs font-medium text-[var(--danger-700)]">风险标记：{message.riskMarker}</div> : null}
        </div>
      ))}</div>
      <p className="mt-3 text-xs text-neutral-500">仅展示当前数据源中明确可见的会话，不代表学生全部历史对话。</p>
    </details>
  ))}</div>;
}
