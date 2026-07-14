import { AlertTriangle } from "lucide-react";

import { EnrollmentHistory } from "@/components/student-profile/EnrollmentHistory";
import { StudentActiveCase } from "@/components/student-profile/StudentActiveCase";
import { StudentCaseSummaryList } from "@/components/student-profile/StudentCaseSummaryList";
import { StudentProfileOverview } from "@/components/student-profile/StudentProfileOverview";
import type { StudentProfileDetail } from "@/types/studentProfile";

export function StudentProfileDetailContent({ detail, onViewWarning }: { detail: StudentProfileDetail; onViewWarning: (warningId: string) => void }) {
  return (
    <div className="pb-6">
      {detail.dataIssues.length > 0 ? (
        <div className="mx-6 mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" />数据关联异常</div>
          {detail.dataIssues.map((issue) => <div className="mt-1 pl-6" key={issue}>{issue}</div>)}
        </div>
      ) : null}
      <StudentProfileOverview detail={detail} />
      <StudentActiveCase activeCase={detail.activeCase} onViewWarning={onViewWarning} />
      <EnrollmentHistory items={detail.student.enrollmentHistory} />
      <StudentCaseSummaryList cases={detail.historicalCases} onViewWarning={onViewWarning} />
    </div>
  );
}
