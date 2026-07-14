import { CaseRecordValue } from "@/components/case-records/CaseRecordSection";
import { FeedbackCollaborationRounds } from "@/components/case-records/FeedbackCollaborationRounds";
import type { StudentProfileCaseDetail } from "@/types/studentProfile";

export function CaseFeedbackSection({ detail }: { detail: StudentProfileCaseDetail }) {
  return (
    <div className="space-y-5">
      <dl className="grid gap-4 sm:grid-cols-2">
        <CaseRecordValue label="当前班主任" value={detail.headTeacher.name} />
        <CaseRecordValue label="联系电话" value={detail.headTeacher.phone} />
      </dl>
      <div><h4 className="mb-2 text-sm font-medium text-neutral-900">协作轮次</h4><FeedbackCollaborationRounds collaboration={detail.feedbackCollaboration} /></div>
    </div>
  );
}
