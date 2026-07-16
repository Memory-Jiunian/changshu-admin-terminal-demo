import { CaseRecordEmptyState } from "@/components/case-records/CaseRecordEmptyState";
import { InterventionHistoryView } from "@/components/case-records/InterventionHistoryView";
import type { StudentProfileCaseDetail } from "@/types/studentProfile";

export function CaseInterventionSection({ detail }: { detail: StudentProfileCaseDetail }) {
  if (!detail.interventionRecords.length && !detail.interventionAppointments.length) {
    return <CaseRecordEmptyState text="暂无干预记录" />;
  }

  return <InterventionHistoryView history={detail.interventionHistory} />;
}
