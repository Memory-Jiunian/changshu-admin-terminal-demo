import { CaseRecordEmptyState } from "@/components/case-records/CaseRecordEmptyState";
import { CaseRecordValue } from "@/components/case-records/CaseRecordSection";
import type { StudentProfileCaseDetail } from "@/types/studentProfile";

const requestStatusLabels = {
  pending: "进行中",
  overdue: "已超时",
  completed: "已完成",
} as const;

export function CaseFeedbackSection({ detail }: { detail: StudentProfileCaseDetail }) {
  return (
    <div className="space-y-5">
      <dl className="grid gap-4 sm:grid-cols-2">
        <CaseRecordValue label="当前班主任" value={detail.headTeacher.name} />
        <CaseRecordValue label="联系电话" value={detail.headTeacher.phone} />
      </dl>
      <div>
        <h4 className="mb-2 text-sm font-medium text-neutral-900">反馈请求记录</h4>
        {detail.feedbackRequests.length ? (
          <div className="space-y-2">
            {detail.feedbackRequests.map((request) => (
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3" key={request.id}>
                <div className="flex justify-between gap-3 text-sm"><strong>{request.requestedBy}</strong><span className="text-xs text-neutral-500">{request.requestedAt}</span></div>
                <div className="mt-2 text-sm leading-6 text-neutral-700">补充反馈要求：{request.requestNote}</div>
                <div className="mt-1 text-sm text-neutral-700">截止时间：{request.deadline}</div>
                <div className="mt-1 text-sm text-neutral-700">状态：{requestStatusLabels[request.status]}</div>
              </div>
            ))}
          </div>
        ) : <CaseRecordEmptyState text="暂无反馈请求记录" />}
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium text-neutral-900">班主任反馈记录</h4>
        {detail.feedbackRecords.length ? (
          <div className="space-y-2">
            {detail.feedbackRecords.map((record) => (
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3" key={record.id}>
                <div className="flex justify-between gap-3 text-sm"><strong>{record.authorName} · {record.authorRole}</strong><span className="text-xs text-neutral-500">{record.submittedAt}</span></div>
                <div className="mt-2 text-sm leading-6 text-neutral-700">{record.content}</div>
              </div>
            ))}
          </div>
        ) : <CaseRecordEmptyState text="暂无班主任反馈记录" />}
      </div>
    </div>
  );
}
