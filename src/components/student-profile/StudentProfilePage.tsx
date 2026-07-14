import { useMemo, useState } from "react";

import { StudentProfileDrawer } from "@/components/student-profile/StudentProfileDrawer";
import { StudentProfileFilterBar } from "@/components/student-profile/StudentProfileFilterBar";
import { StudentProfileTable } from "@/components/student-profile/StudentProfileTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { studentProfileMockData } from "@/data/studentProfileMock";
import { buildStudentProfileDetail, buildStudentProfileSummaries } from "@/lib/student-profile-aggregate";
import { createDefaultStudentProfileFilterQuery, filterStudentProfiles, getStudentProfileFilterOptions } from "@/lib/student-profile-filters";
import { useAdminData } from "@/state/AdminDataProvider";

type LoadState = "ready" | "loading" | "error";

export function StudentProfilePage({ initialLoadState = "ready" }: { initialLoadState?: LoadState }) {
  const { warnings } = useAdminData();
  const [query, setQuery] = useState(createDefaultStudentProfileFilterQuery);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>(initialLoadState);
  const summaries = useMemo(
    () => buildStudentProfileSummaries(studentProfileMockData, warnings),
    [warnings],
  );
  const options = useMemo(() => getStudentProfileFilterOptions(summaries), [summaries]);
  const profiles = useMemo(() => filterStudentProfiles(summaries, query), [query, summaries]);
  const selectedStudent = useMemo(
    () => studentProfileMockData.find((student) => student.studentId === selectedStudentId),
    [selectedStudentId],
  );
  const selectedDetail = useMemo(
    () => selectedStudent ? buildStudentProfileDetail(selectedStudent, warnings) : null,
    [selectedStudent, warnings],
  );
  const hasFilters = Boolean(query.keyword || query.grade || query.className ||
    query.advanced.riskLevel.length || query.advanced.warningStatus.length ||
    query.advanced.hasActiveWarning.length || query.advanced.hasInterventionHistory.length ||
    query.advanced.responsiblePsychologist.length ||
    query.advanced.enrollmentStatus.length !== 1 || query.advanced.enrollmentStatus[0] !== "enrolled");

  function resetAll() {
    setQuery(createDefaultStudentProfileFilterQuery());
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
              onAdvancedApply={(advanced) => setQuery((current) => ({ ...current, advanced }))}
              onClassChange={(className) => setQuery((current) => ({ ...current, className }))}
              onGradeChange={(grade) => setQuery((current) => ({ ...current, grade, className: "" }))}
              onKeywordChange={(keyword) => setQuery((current) => ({ ...current, keyword }))}
              onResetAll={resetAll}
              options={options}
              query={query}
            />
          </Card>
          <StudentProfileTable
            hasFilters={hasFilters}
            onReset={resetAll}
            onView={(profile) => setSelectedStudentId(profile.studentId)}
            profiles={profiles}
            selectedStudentId={selectedStudentId ?? undefined}
          />
        </>
      ) : null}

      <StudentProfileDrawer detail={selectedDetail} open={Boolean(selectedDetail)} onOpenChange={(open) => { if (!open) setSelectedStudentId(null); }} />
    </section>
  );
}
