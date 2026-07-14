import type {
  StudentProfileCaseDetail,
  StudentProfileDetail,
  StudentProfileExportScope,
  StudentProfileExportViewModel,
} from "@/types/studentProfile";

export function buildStudentProfileExportViewModel(
  detail: StudentProfileDetail,
  scope: StudentProfileExportScope,
  selectedCase: StudentProfileCaseDetail | undefined,
  includeSensitiveSourceRecords: boolean,
  generatedAt: string,
): StudentProfileExportViewModel {
  const cases = scope === "current_case" && selectedCase
    ? [selectedCase]
    : Object.values(detail.caseDetails).sort((left, right) =>
        right.summary.activityTime.localeCompare(left.summary.activityTime),
      );
  return {
    student: detail.student,
    cases,
    generatedAt,
    generatedBy: "陈老师",
    includeSensitiveSourceRecords,
  };
}
