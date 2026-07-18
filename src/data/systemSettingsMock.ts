import { studentProfileMockData } from "@/data/studentProfileMock";
import type {
  AdminBaseData,
  SchoolClass,
  SchoolGrade,
  SchoolStudent,
  SchoolTeacher,
} from "@/types/system-settings";

const currentTime = "2026-07-18 09:00";
const preferredGradeOrder = ["初一", "初二", "初三", "高一", "高二", "高三"];

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function idPart(index: number) {
  return String(index + 1).padStart(3, "0");
}

const gradeNames = unique(studentProfileMockData.map((student) => student.currentGrade))
  .sort((left, right) => {
    const leftIndex = preferredGradeOrder.indexOf(left);
    const rightIndex = preferredGradeOrder.indexOf(right);
    return (leftIndex < 0 ? 99 : leftIndex) - (rightIndex < 0 ? 99 : rightIndex)
      || left.localeCompare(right);
  });

export const schoolGradeMockData: SchoolGrade[] = gradeNames.map((name, index) => ({
  gradeId: `GRD-${idPart(index)}`,
  name,
  sortOrder: index + 1,
  status: "active",
  version: 1,
}));

const gradeIdByName = new Map(schoolGradeMockData.map((grade) => [grade.name, grade.gradeId]));
const classSeeds = new Map<string, { gradeName: string; className: string; headTeacherNames: string[] }>();

studentProfileMockData.forEach((student) => {
  const key = `${student.currentGrade}:${student.currentClass}`;
  const seed = classSeeds.get(key) ?? {
    gradeName: student.currentGrade,
    className: student.currentClass,
    headTeacherNames: [],
  };
  seed.headTeacherNames.push(student.currentHeadTeacher);
  classSeeds.set(key, seed);
});

const headTeacherNames = unique(studentProfileMockData.map((student) => student.currentHeadTeacher)).sort();
const headTeacherIdByName = new Map(headTeacherNames.map((name, index) => [name, `TCH-HT-${idPart(index)}`]));

function mostFrequent(values: string[]) {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0];
}

export const schoolClassMockData: SchoolClass[] = [...classSeeds.values()]
  .sort((left, right) =>
    preferredGradeOrder.indexOf(left.gradeName) - preferredGradeOrder.indexOf(right.gradeName)
    || left.className.localeCompare(right.className),
  )
  .map((seed, index) => ({
    classId: `CLS-${idPart(index)}`,
    gradeId: gradeIdByName.get(seed.gradeName)!,
    name: seed.className,
    headTeacherId: headTeacherIdByName.get(mostFrequent(seed.headTeacherNames) ?? ""),
    status: "active",
    version: 1,
  }));

const classIdByName = new Map(schoolClassMockData.map((schoolClass) => {
  const grade = schoolGradeMockData.find((item) => item.gradeId === schoolClass.gradeId);
  return [`${grade?.name}:${schoolClass.name}`, schoolClass.classId];
}));

const additionalClasses: SchoolClass[] = [
  {
    classId: "CLS-DEMO-EMPTY",
    gradeId: schoolGradeMockData.find((grade) => grade.name === "高二")?.gradeId ?? schoolGradeMockData[0].gradeId,
    name: "8班",
    status: "active",
    version: 1,
  },
  {
    classId: "CLS-DEMO-INACTIVE",
    gradeId: schoolGradeMockData.find((grade) => grade.name === "初三")?.gradeId ?? schoolGradeMockData[0].gradeId,
    name: "8班",
    status: "inactive",
    version: 1,
  },
];
schoolClassMockData.push(...additionalClasses);

export const schoolTeacherMockData: SchoolTeacher[] = [
  {
    teacherId: "TCH-PSY-001",
    staffNumber: "PSY-001",
    name: "陈老师",
    phone: "13800001001",
    roles: ["psychologist"],
    gradeIds: schoolGradeMockData.map((grade) => grade.gradeId),
    classIds: [],
    status: "active",
    updatedAt: currentTime,
    version: 1,
  },
  {
    teacherId: "TCH-PSY-002",
    staffNumber: "PSY-002",
    name: "刘老师",
    phone: "13800001002",
    roles: ["psychologist"],
    gradeIds: [],
    classIds: [],
    status: "active",
    updatedAt: currentTime,
    version: 1,
  },
  ...headTeacherNames.map<SchoolTeacher>((name, index) => {
    const teacherId = headTeacherIdByName.get(name)!;
    const classIds = schoolClassMockData
      .filter((schoolClass) => schoolClass.headTeacherId === teacherId)
      .map((schoolClass) => schoolClass.classId);
    const gradeIds = unique(classIds
      .map((classId) => schoolClassMockData.find((schoolClass) => schoolClass.classId === classId)?.gradeId)
      .filter((gradeId): gradeId is string => Boolean(gradeId)));
    return {
      teacherId,
      staffNumber: `HT-${idPart(index)}`,
      name,
      phone: `1380000${String(2000 + index).slice(-4)}`,
      roles: ["head_teacher"],
      gradeIds,
      classIds,
      status: "active",
      updatedAt: currentTime,
      version: 1,
    };
  }),
  {
    teacherId: "TCH-GD-001",
    staffNumber: "GD-001",
    name: "周主任",
    phone: "13800003001",
    roles: ["grade_director"],
    gradeIds: schoolGradeMockData.slice(0, 3).map((grade) => grade.gradeId),
    classIds: [],
    status: "active",
    updatedAt: currentTime,
    version: 1,
  },
  {
    teacherId: "TCH-PR-001",
    staffNumber: "PR-001",
    name: "吴校长",
    phone: "13800004001",
    roles: ["principal"],
    gradeIds: [],
    classIds: [],
    status: "active",
    updatedAt: currentTime,
    version: 1,
  },
  {
    teacherId: "TCH-DEMO-INACTIVE",
    staffNumber: "HT-099",
    name: "停用教师",
    roles: ["head_teacher"],
    gradeIds: [],
    classIds: [],
    status: "inactive",
    updatedAt: currentTime,
    version: 1,
  },
];

const correctedStudentNumbers: Record<string, string> = {
  "STU-0016": "20230101026",
};

export const schoolStudentMockData: SchoolStudent[] = studentProfileMockData.map((student) => ({
  studentId: student.studentId,
  studentNumber: correctedStudentNumbers[student.studentId] ?? student.studentNumber,
  name: student.studentName,
  currentGradeId: gradeIdByName.get(student.currentGrade)!,
  currentClassId: classIdByName.get(`${student.currentGrade}:${student.currentClass}`)!,
  enrollmentStatus: student.enrollmentStatus,
  enrollmentHistory: student.enrollmentHistory.map((item) => ({ ...item })),
  updatedAt: student.updatedAt,
  version: 1,
}));

const initialAdminBaseData: AdminBaseData = {
  schoolConfig: {
    schoolId: "SCH-HZ-YH-001",
    schoolCode: "HZ-YH-001",
    schoolName: "杭州市余杭区第一中学",
    academicYear: "2025-2026 学年",
    term: "second",
    termStart: "2026-02-16",
    termEnd: "2026-07-15",
    updatedAt: currentTime,
    updatedBy: "陈老师",
    version: 1,
  },
  grades: schoolGradeMockData,
  classes: schoolClassMockData,
  teachers: schoolTeacherMockData,
  students: schoolStudentMockData,
  adminAuditLogs: [],
  processedImportIds: [],
  version: 1,
};

export function createInitialAdminBaseData(): AdminBaseData {
  return structuredClone(initialAdminBaseData);
}

export const CURRENT_OPERATOR_ID = "TCH-PSY-001";
