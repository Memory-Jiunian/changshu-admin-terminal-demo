import {
  createDefaultStudentProfileAdvancedFilters,
  type BooleanFilterValue,
  type StudentProfileSummary,
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
    hasCurrentWarning: [...filters.hasCurrentWarning],
    sourceType: [...filters.sourceType],
    hasFormalWarning: [...filters.hasFormalWarning],
    hasInterventionRecords: [...filters.hasInterventionRecords],
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

export function cloneStudentProfileFilterQuery(
  query: StudentProfileFilterQuery,
): StudentProfileFilterQuery {
  return {
    ...query,
    advanced: cloneStudentProfileAdvancedFilters(query.advanced),
  };
}

export function filterStudentProfiles(
  profiles: StudentProfileSummary[],
  query: StudentProfileFilterQuery,
) {
  const keyword = query.keyword.trim().toLocaleLowerCase("zh-Hans-CN");
  const isSchoolWideSearch = keyword.length > 0;

  return profiles
    .filter((profile) => {
      const matchesKeyword =
        keyword.length === 0 ||
        profile.studentName.toLocaleLowerCase("zh-Hans-CN").includes(keyword) ||
        profile.studentNumber.toLocaleLowerCase("zh-Hans-CN").startsWith(keyword);
      const matchesGrade =
        isSchoolWideSearch || !query.grade || profile.currentGrade === query.grade;
      const matchesClass =
        isSchoolWideSearch || !query.className || profile.currentClass === query.className;
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
      const matchesSource =
        query.advanced.sourceType.length === 0 ||
        query.advanced.sourceType.some((sourceType) =>
          profile.sourceTypes.includes(sourceType),
        );

      return (
        matchesKeyword &&
        matchesGrade &&
        matchesClass &&
        matchesRisk &&
        matchesStatus &&
        matchesSource &&
        matchesBooleanFilter(
          profile.hasCurrentWarning,
          query.advanced.hasCurrentWarning,
        ) &&
        matchesBooleanFilter(
          profile.hasFormalWarning,
          query.advanced.hasFormalWarning,
        ) &&
        matchesBooleanFilter(
          profile.hasInterventionRecords,
          query.advanced.hasInterventionRecords,
        ) &&
        matchesResponsible &&
        matchesEnrollment
      );
    })
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export const STUDENT_PROFILE_PAGE_SIZE = 30;

export function paginateStudentProfiles(
  profiles: StudentProfileSummary[],
  page: number,
  pageSize = STUDENT_PROFILE_PAGE_SIZE,
) {
  const totalPages = Math.max(1, Math.ceil(profiles.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    currentPage,
    totalPages,
    items: profiles.slice(start, start + pageSize),
  };
}

export function getStudentProfileFilterOptions(
  profiles: StudentProfileSummary[],
): StudentProfileFilterOptions {
  const browsableProfiles = profiles.filter(
    (profile) => profile.enrollmentStatus === "enrolled",
  );
  const grades = Array.from(new Set(browsableProfiles.map((profile) => profile.currentGrade))).sort(
    (left, right) => left.localeCompare(right, "zh-Hans-CN"),
  );
  const classesByGrade = Object.fromEntries(
    grades.map((grade) => [
      grade,
      Array.from(
        new Set(
          browsableProfiles
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
