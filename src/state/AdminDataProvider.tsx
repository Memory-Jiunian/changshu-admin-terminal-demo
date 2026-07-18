import {
  createContext,
  useCallback,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

import { warningMockData } from "@/data/warningMock";
import { assessmentMockData } from "@/data/assessmentMock";
import { createInitialAdminBaseData, CURRENT_OPERATOR_ID } from "@/data/systemSettingsMock";
import {
  buildStudentProfileRecords,
  changeStudentEnrollment,
  getCurrentTeacher,
  saveClass,
  saveGrade,
  saveStudent,
  saveTeacher,
  updateSchoolConfig,
} from "@/lib/system-settings";
import type { StudentAssessmentRecord } from "@/types/assessment";
import type { StudentProfileRecord } from "@/types/studentProfile";
import type {
  AdminBaseData,
  ClassValues,
  EnrollmentChangeValues,
  GradeValues,
  SchoolConfigValues,
  SchoolTeacher,
  StudentValues,
  SystemActionResult,
  TeacherValues,
} from "@/types/system-settings";
import type { WarningItem } from "@/types/warning";

type AdminDataContextValue = {
  baseData: AdminBaseData;
  currentOperator: SchoolTeacher;
  students: StudentProfileRecord[];
  assessments: StudentAssessmentRecord[];
  warnings: WarningItem[];
  setWarnings: Dispatch<SetStateAction<WarningItem[]>>;
  replaceBaseData: (nextData: AdminBaseData, expectedVersion: number) => SystemActionResult;
  updateSchool: (values: SchoolConfigValues, expectedVersion?: number) => SystemActionResult;
  upsertGrade: (values: GradeValues, gradeId?: string, expectedVersion?: number) => SystemActionResult;
  upsertClass: (values: ClassValues, classId?: string, expectedVersion?: number) => SystemActionResult;
  upsertTeacher: (values: TeacherValues, teacherId?: string, expectedVersion?: number) => SystemActionResult;
  upsertStudent: (values: StudentValues, studentId?: string, expectedVersion?: number) => SystemActionResult;
  updateEnrollment: (studentId: string, values: EnrollmentChangeValues) => SystemActionResult;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: PropsWithChildren) {
  const [baseData, setBaseData] = useState<AdminBaseData>(() => createInitialAdminBaseData());
  const [warnings, setWarnings] = useState<WarningItem[]>(() =>
    warningMockData.map((warning) => ({
      ...warning,
      responsibleTeacherId: baseData.teachers.find(
        (teacher) => teacher.name === warning.responsibleTeacher,
      )?.teacherId,
    })),
  );
  const currentOperator = getCurrentTeacher(baseData, CURRENT_OPERATOR_ID) ?? baseData.teachers[0];
  const students = useMemo(
    () => buildStudentProfileRecords(baseData, warnings),
    [baseData, warnings],
  );

  const commit = useCallback((result: SystemActionResult) => {
    if (result.success) setBaseData(result.data);
    return result;
  }, []);

  const value = useMemo<AdminDataContextValue>(() => ({
    baseData,
    currentOperator,
    students,
    assessments: assessmentMockData,
    warnings,
    setWarnings,
    replaceBaseData(nextData, expectedVersion) {
      if (baseData.version !== expectedVersion) {
        return {
          success: false,
          message: "基础资料已更新，请重新生成预览。",
          issues: [{ code: "base_data_version_conflict", message: "导入预览已过期。" }],
        };
      }
      setBaseData(nextData);
      return { success: true, data: nextData, message: "共享基础资料已更新。" };
    },
    updateSchool: (values, expectedVersion) =>
      commit(updateSchoolConfig(
        baseData,
        values,
        getActionContext(currentOperator),
        expectedVersion,
      )),
    upsertGrade: (values, gradeId, expectedVersion) =>
      commit(saveGrade(
        baseData,
        values,
        getActionContext(currentOperator),
        gradeId,
        expectedVersion,
      )),
    upsertClass: (values, classId, expectedVersion) =>
      commit(saveClass(
        baseData,
        values,
        getActionContext(currentOperator),
        classId,
        expectedVersion,
      )),
    upsertTeacher: (values, teacherId, expectedVersion) =>
      commit(saveTeacher(
        baseData,
        warnings,
        values,
        getActionContext(currentOperator),
        teacherId,
        expectedVersion,
      )),
    upsertStudent: (values, studentId, expectedVersion) =>
      commit(saveStudent(
        baseData,
        values,
        getActionContext(currentOperator),
        studentId,
        expectedVersion,
      )),
    updateEnrollment: (studentId, values) =>
      commit(changeStudentEnrollment(
        baseData,
        studentId,
        values,
        getActionContext(currentOperator),
      )),
  }), [baseData, commit, currentOperator, students, warnings]);

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);

  if (!context) {
    throw new Error("useAdminData must be used within AdminDataProvider");
  }

  return context;
}

function formatCurrentTime() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getActionContext(currentOperator: SchoolTeacher) {
  return {
    operatorId: currentOperator.teacherId,
    operatorName: currentOperator.name,
    occurredAt: formatCurrentTime(),
  };
}
