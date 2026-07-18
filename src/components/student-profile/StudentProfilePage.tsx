import { useEffect, useMemo, useRef, useState } from "react";

import { StudentProfileDrawer } from "@/components/student-profile/StudentProfileDrawer";
import { StudentProfileFilterBar } from "@/components/student-profile/StudentProfileFilterBar";
import { StudentProfileTable } from "@/components/student-profile/StudentProfileTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buildStudentProfileDetail, buildStudentProfileSummaries } from "@/lib/student-profile-aggregate";
import { getFirstAvailableClass, loadStudentClassPreference, saveStudentClassPreference } from "@/lib/student-profile-class-preference";
import { formatMockDateTime } from "@/lib/warning-time";
import { buildCurrentWarningViews } from "@/lib/system-settings";
import { cloneStudentProfileFilterQuery, createDefaultStudentProfileFilterQuery, filterStudentProfiles, getStudentProfileFilterOptions, paginateStudentProfiles } from "@/lib/student-profile-filters";
import { useAdminData } from "@/state/AdminDataProvider";
import type { StudentProfileReturnState } from "@/types/navigation";
import { createDefaultStudentProfileAdvancedFilters, type StudentProfileDrawerView } from "@/types/studentProfile";

type LoadState = "ready" | "loading" | "error";

type StudentProfilePageProps = {
  initialLoadState?: LoadState;
  initialReturnState?: StudentProfileReturnState;
  onOpenWarningDetail: (warningId: string, returnState: StudentProfileReturnState) => void;
};

export function StudentProfilePage({ initialLoadState = "ready", initialReturnState, onOpenWarningDetail }: StudentProfilePageProps) {
  const { baseData, currentOperator, students, warnings: sharedWarnings } = useAdminData();
  const warnings = useMemo(
    () => buildCurrentWarningViews(baseData, sharedWarnings),
    [baseData, sharedWarnings],
  );
  const currentTime = formatMockDateTime();
  const summaries = useMemo(
    () => buildStudentProfileSummaries(students, warnings),
    [students, warnings],
  );
  const options = useMemo(() => getStudentProfileFilterOptions(summaries), [summaries]);
  const [query, setQuery] = useState(() => {
    if (initialReturnState) {
      return cloneStudentProfileFilterQuery(initialReturnState.query);
    }

    const initialClass = typeof window === "undefined"
      ? getFirstAvailableClass(options)
      : loadStudentClassPreference(
        window.localStorage,
        options,
        summaries,
        baseData.schoolConfig.schoolId,
        currentOperator.teacherId,
      );

    return { ...createDefaultStudentProfileFilterQuery(), ...initialClass };
  });
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    initialReturnState?.drawerOpen ? initialReturnState.selectedStudentId : null,
  );
  const [currentPage, setCurrentPage] = useState(initialReturnState?.page ?? 1);
  const browsePageBeforeSearchRef = useRef(
    initialReturnState?.browsePageBeforeSearch ?? initialReturnState?.page ?? 1,
  );
  const initialCaseId = initialReturnState?.selectedCaseId;
  const [drawerView, setDrawerView] = useState<StudentProfileDrawerView>(
    initialReturnState?.drawerView === "case_detail" && initialCaseId
      ? { type: "case_detail", warningId: initialCaseId }
      : { type: "profile" },
  );
  const [profileScrollTop, setProfileScrollTop] = useState(
    initialReturnState?.profileScrollTop ?? 0,
  );
  const [caseDetailScrollTop, setCaseDetailScrollTop] = useState(
    initialReturnState?.caseDetailScrollTop ?? 0,
  );
  const [expandedRecordSections, setExpandedRecordSections] = useState<string[]>(
    initialReturnState?.expandedRecordSections ?? ["overview"],
  );
  const [caseNotice, setCaseNotice] = useState<string>();
  const [loadState, setLoadState] = useState<LoadState>(initialLoadState);
  const filteredProfiles = useMemo(() => filterStudentProfiles(summaries, query), [query, summaries]);
  const pagination = useMemo(
    () => paginateStudentProfiles(filteredProfiles, currentPage),
    [currentPage, filteredProfiles],
  );
  const selectedStudent = useMemo(
    () => students.find((student) => student.studentId === selectedStudentId),
    [selectedStudentId, students],
  );
  const selectedDetail = useMemo(
    () => selectedStudent ? buildStudentProfileDetail(selectedStudent, warnings, currentTime) : null,
    [currentTime, selectedStudent, warnings],
  );
  const selectedCaseDetail = useMemo(
    () => drawerView.type === "case_detail"
      ? selectedDetail?.caseDetails[drawerView.warningId]
      : undefined,
    [drawerView, selectedDetail],
  );
  const hasFilters = Boolean(query.keyword ||
    query.advanced.riskLevel.length || query.advanced.warningStatus.length ||
    query.advanced.hasCurrentWarning.length || query.advanced.sourceType.length ||
    query.advanced.hasFormalWarning.length || query.advanced.hasInterventionRecords.length ||
    query.advanced.responsiblePsychologist.length ||
    query.advanced.enrollmentStatus.length !== 1 || query.advanced.enrollmentStatus[0] !== "enrolled");

  useEffect(() => {
    if (pagination.currentPage !== currentPage) {
      setCurrentPage(pagination.currentPage);
    }
  }, [currentPage, pagination.currentPage]);

  useEffect(() => {
    if (
      drawerView.type === "case_detail" &&
      selectedDetail &&
      !selectedDetail.caseDetails[drawerView.warningId]
    ) {
      setDrawerView({ type: "profile" });
      setCaseNotice("事项记录已更新或不再属于当前学生，已返回学生档案概览。");
    }
  }, [drawerView, selectedDetail]);

  function resetAll() {
    setQuery((current) => ({
      ...current,
      keyword: "",
      advanced: createDefaultStudentProfileAdvancedFilters(),
    }));
    setCurrentPage(1);
  }

  function persistClass(grade: string, className: string) {
    if (typeof window !== "undefined" && grade && className) {
      saveStudentClassPreference(
        window.localStorage,
        { grade, className },
        baseData.schoolConfig.schoolId,
        currentOperator.teacherId,
      );
    }
  }

  function handleGradeChange(grade: string) {
    const className = options.classesByGrade[grade]?.[0] ?? "";
    setQuery((current) => ({ ...current, grade, className }));
    setCurrentPage(1);
    persistClass(grade, className);
  }

  function handleClassChange(className: string) {
    setQuery((current) => {
      persistClass(current.grade, className);
      return { ...current, className };
    });
    setCurrentPage(1);
  }

  function handleOpenWarningDetail(warningId: string) {
    onOpenWarningDetail(warningId, {
      query: cloneStudentProfileFilterQuery(query),
      page: pagination.currentPage,
      selectedStudentId,
      drawerOpen: Boolean(selectedDetail),
      drawerView: drawerView.type,
      selectedCaseId: drawerView.type === "case_detail" ? drawerView.warningId : undefined,
      profileScrollTop,
      caseDetailScrollTop,
      expandedRecordSections: [...expandedRecordSections],
      browsePageBeforeSearch: browsePageBeforeSearchRef.current,
    });
  }

  function handleViewCaseRecord(warningId: string) {
    if (!selectedDetail?.caseDetails[warningId]) {
      setCaseNotice("未找到该事项记录，数据可能已更新。");
      setDrawerView({ type: "profile" });
      return;
    }

    setCaseNotice(undefined);
    setCaseDetailScrollTop(0);
    setExpandedRecordSections(["overview"]);
    setDrawerView({ type: "case_detail", warningId });
  }

  function handleKeywordChange(keyword: string) {
    const hadKeyword = Boolean(query.keyword.trim());
    const hasKeyword = Boolean(keyword.trim());

    if (!hadKeyword && hasKeyword) {
      browsePageBeforeSearchRef.current = pagination.currentPage;
    }

    setQuery((current) => ({ ...current, keyword }));
    setCurrentPage(hadKeyword && !hasKeyword ? browsePageBeforeSearchRef.current : 1);
  }

  return (
    <section className="mx-auto max-w-[1440px] space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-950">学生档案</h1>
        <p className="mt-1 text-sm text-neutral-500">查询学生基础信息与心理健康历史记录。</p>
      </header>

      {loadState === "loading" ? (
        <Card className="space-y-4 p-5"><Skeleton className="h-10 w-full" /><Skeleton className="h-72 w-full" /></Card>
      ) : null}
      {loadState === "error" ? (
        <Card className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
          <div className="font-medium">学生档案加载失败</div>
          <div className="mt-2 text-sm text-neutral-500">请重试加载本地数据。</div>
          <Button className="mt-4" onClick={() => setLoadState("ready")} type="button">重新加载</Button>
        </Card>
      ) : null}
      {loadState === "ready" ? (
        <>
          <Card className="overflow-hidden rounded-lg border-neutral-200 shadow-sm">
            <StudentProfileFilterBar
              onAdvancedApply={(advanced) => { setQuery((current) => ({ ...current, advanced })); setCurrentPage(1); }}
              onClassChange={handleClassChange}
              onGradeChange={handleGradeChange}
              onKeywordChange={handleKeywordChange}
              onResetAll={resetAll}
              options={options}
              query={query}
            />
          </Card>
          <StudentProfileTable
            hasFilters={hasFilters}
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalProfiles={filteredProfiles.length}
            onPageChange={setCurrentPage}
            onReset={resetAll}
            onView={(profile) => {
              setSelectedStudentId(profile.studentId);
              setDrawerView({ type: "profile" });
              setProfileScrollTop(0);
              setCaseDetailScrollTop(0);
              setExpandedRecordSections(["overview"]);
              setCaseNotice(undefined);
            }}
            profiles={pagination.items}
            selectedStudentId={selectedStudentId ?? undefined}
          />
        </>
      ) : null}

      <StudentProfileDrawer
        caseDetail={selectedCaseDetail}
        caseDetailScrollTop={caseDetailScrollTop}
        detail={selectedDetail}
        expandedRecordSections={expandedRecordSections}
        notice={caseNotice}
        onBackToProfile={() => setDrawerView({ type: "profile" })}
        onCaseDetailScrollTopChange={setCaseDetailScrollTop}
        onExpandedRecordSectionsChange={setExpandedRecordSections}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStudentId(null);
            setDrawerView({ type: "profile" });
            setProfileScrollTop(0);
            setCaseDetailScrollTop(0);
            setExpandedRecordSections(["overview"]);
            setCaseNotice(undefined);
          }
        }}
        onProfileScrollTopChange={setProfileScrollTop}
        onViewCaseRecord={handleViewCaseRecord}
        onViewWarning={handleOpenWarningDetail}
        open={Boolean(selectedDetail)}
        profileScrollTop={profileScrollTop}
        view={drawerView}
      />
    </section>
  );
}
