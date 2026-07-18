import type { StudentProfileFilterOptions, StudentProfileSummary } from "@/types/studentProfile";

export const DEMO_SCHOOL_ID = "changshu-demo-school";
export const DEMO_PSYCHOLOGIST_ID = "psychologist-chen";

export type StudentClassPreference = {
  grade: string;
  className: string;
};

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem">;

export function getStudentClassPreferenceKey(
  schoolId = DEMO_SCHOOL_ID,
  psychologistId = DEMO_PSYCHOLOGIST_ID,
) {
  return `changshu.student-profile.last-class.${schoolId}.${psychologistId}`;
}

export function getFirstAvailableClass(
  options: StudentProfileFilterOptions,
): StudentClassPreference {
  for (const grade of options.grades) {
    const className = options.classesByGrade[grade]?.[0];
    if (className) {
      return { grade, className };
    }
  }

  return { grade: "", className: "" };
}

export function loadStudentClassPreference(
  storage: StorageReader,
  options: StudentProfileFilterOptions,
  profiles: StudentProfileSummary[],
  schoolId = DEMO_SCHOOL_ID,
  psychologistId = DEMO_PSYCHOLOGIST_ID,
): StudentClassPreference {
  const fallback = getFirstAvailableClass(options);

  try {
    const rawValue = storage.getItem(getStudentClassPreferenceKey(schoolId, psychologistId));
    if (!rawValue) {
      return fallback;
    }

    const value = JSON.parse(rawValue) as Partial<StudentClassPreference>;
    const grade = value.grade;
    const className = value.className;
    const valid =
      typeof grade === "string" &&
      typeof className === "string" &&
      options.classesByGrade[grade]?.includes(className) &&
      profiles.some(
        (profile) =>
          profile.currentGrade === grade &&
          profile.currentClass === className,
      );

    return valid
      ? { grade: grade as string, className: className as string }
      : fallback;
  } catch {
    return fallback;
  }
}

export function saveStudentClassPreference(
  storage: StorageWriter,
  value: StudentClassPreference,
  schoolId = DEMO_SCHOOL_ID,
  psychologistId = DEMO_PSYCHOLOGIST_ID,
) {
  storage.setItem(
    getStudentClassPreferenceKey(schoolId, psychologistId),
    JSON.stringify({ grade: value.grade, className: value.className }),
  );
}
