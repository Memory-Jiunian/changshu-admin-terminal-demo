import { CaseReferralSection } from "@/components/case-records/CaseReferralSection";
import { buildStudentProfileCaseDetail } from "@/lib/student-profile-aggregate";
import type { WarningItem } from "@/types/warning";

export function ReferralRecords({ warning }: { warning: WarningItem }) {
  if (!warning.referralRecords.length) return null;
  return <section className="rounded-lg border border-neutral-200 bg-white p-4">
    <h3 className="mb-4 text-sm font-semibold text-neutral-950">转介记录</h3>
    <CaseReferralSection detail={buildStudentProfileCaseDetail(warning)} />
  </section>;
}
