import {
  createDefaultStudentProfileAdvancedFilters,
  type BooleanFilterValue,
  type StudentProfile,
  type StudentProfileAdvancedFilters,
  type StudentProfileFilterOptions,
  type StudentProfileFilterQuery,
} from "@/types/studentProfile";

function matchesBooleanFilter(value: boolean, filters: BooleanFilterValue[]) {
  return filters.length === 0 || filters.includes(value ? "yes" : "no");
}

export function cloneStudentProfileAdvancedFilters(
  filters: StudentProfileAdvancedFilters,
): StudentProfileAdvancedFilters {
  return {
    riskLevel: [...filters.riskLevel],
    warningStatus: [...filters.warningStatus],
    hasActiveWarning: [...filters.hasActiveWarning],
    hasInterventionHistory: [...filters.hasInterventionHistory],
    responsiblePsychologist: [...filters.responsiblePsychologist],
    enrollmentStatus: [...filters.enrollmentStatus],
  };
}

export function createDefaultStudentProfileFilterQuery(): StudentProfileFilterQuery {
  return {
    keyword: "",
    grade: "",
    className: "",
    advanced: createDefaultStudentProfileAdvancedFilters(),
  };
}

export function filterStudentProfiles(
  profiles: StudentProfile[],
  query: StudentProfileFilterQuery,
) {
  const keyword = query.keyword.trim().toLocaleLowerCase("zh-Hans-CN");

  return profiles
    .filter((profile) => {
      const matchesKeyword =
        keyword.length === 0 ||
        profile.studentName.toLocaleLowerCase("zh-Hans-CN").includes(keyword) ||
        profile.studentNumber.toLocaleLowerCase("zh-Hans-CN").startsWith(keyword);
      const matchesGrade = !query.grade || profile.currentGrade === query.grade;
      const matchesClass = !query.className || profile.currentClass === query.className;
      const matchesRisk =
        query.advanced.riskLevel.length === 0 ||
        Boolean(
          profile.activeRiskLevel &&
            query.advanced.riskLevel.includes(profile.activeRiskLevel),
        );
      const matchesStatus =
        query.advanced.warningStatus.length === 0 ||
        Boolean(
          profile.activeWarningStatus &&
            query.advanced.warningStatus.includes(profile.activeWarningStatus),
        );
      const matchesResponsible =
        query.advanced.responsiblePsychologist.length === 0 ||
        Boolean(
          profile.currentResponsiblePsychologist &&
            query.advanced.responsiblePsychologist.includes(
              profile.currentResponsiblePsychologist,
            ),
        );
      const matchesEnrollment =
        query.advanced.enrollmentStatus.length === 0 ||
        query.advanced.enrollmentStatus.includes(profile.enrollmentStatus);

      return (
        matchesKeyword &&
        matchesGrade &&
        matchesClass &&
        matchesRisk &&
        matchesStatus &&
        matchesBooleanFilter(
          profile.hasActiveWarning,
          query.advanced.hasActiveWarning,
        ) &&
        matchesBooleanFilter(
          profile.hasInterventionHistory,
          query.advanced.hasInterventionHistory,
        ) &&
        matchesResponsible &&
        matchesEnrollment
      );
    })
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function getStudentProfileFilterOptions(
  profiles: StudentProfile[],
): StudentProfileFilterOptions {
  const grades = Array.from(new Set(profiles.map((profile) => profile.currentGrade))).sort(
    (left, right) => left.localeCompare(right, "zh-Hans-CN"),
  );
  const classesByGrade = Object.fromEntries(
    grades.map((grade) => [
      grade,
      Array.from(
        new Set(
          profiles
            .filter((profile) => profile.currentGrade === grade)
            .map((profile) => profile.currentClass),
        ),
      ).sort((left, right) => left.localeCompare(right, "zh-Hans-CN")),
    ]),
  );
  const responsiblePsychologists = Array.from(
    new Set(
      profiles.flatMap((profile) =>
        profile.currentResponsiblePsychologist
          ? [profile.currentResponsiblePsychologist]
          : [],
      ),
    ),
  ).sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));

  return { grades, classesByGrade, responsiblePsychologists };
}
