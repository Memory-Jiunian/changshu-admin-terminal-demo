import { studentProfileMockData } from "@/data/studentProfileMock";
import type { StudentAssessmentRecord } from "@/types/assessment";
import type { SchoolOverviewTermRange } from "@/types/school-overview";

export const SCHOOL_OVERVIEW_CURRENT_TIME = "2026-07-08 12:00";

export const SCHOOL_OVERVIEW_TERM_RANGE: SchoolOverviewTermRange = {
  label: "2025-2026 学年第二学期",
  start: "2026-02-16 00:00",
  end: "2026-07-15 23:59",
};

const completedMonths = ["03", "04", "05", "06", "07"];

const currentTermRecords = studentProfileMockData.map<StudentAssessmentRecord>((student, index) => {
  const completed = index % 4 !== 3;
  const month = completedMonths[index % completedMonths.length];
  const day = String(5 + (index % 20)).padStart(2, "0");

  return {
    id: `ASM-${String(index + 1).padStart(4, "0")}`,
    studentId: student.studentId,
    scaleId: "SCL-SCREENING-2026-S2",
    scaleName: "学生心理健康普筛量表",
    startedAt: `2026-${month}-${day} 09:00`,
    completedAt: completed ? `2026-${month}-${day} 09:25` : undefined,
    status: completed ? "completed" : "incomplete",
    isValid: completed,
  };
});

export const assessmentMockData: StudentAssessmentRecord[] = [
  ...currentTermRecords,
  {
    ...currentTermRecords[0],
    id: "ASM-REPEAT-0001",
    scaleId: "SCL-DEEP-2026-S2",
    scaleName: "学生心理深度评估量表",
    startedAt: "2026-06-18 14:00",
    completedAt: "2026-06-18 14:35",
  },
  {
    ...currentTermRecords[1],
    id: "ASM-OUTSIDE-TERM",
    startedAt: "2026-01-12 10:00",
    completedAt: "2026-01-12 10:30",
  },
];
