import { useMemo, useState } from "react";

import { SchoolOverviewAnalysis } from "@/components/school-overview/SchoolOverviewAnalysis";
import { SchoolOverviewDispositionStages } from "@/components/school-overview/SchoolOverviewDispositionStages";
import { SchoolOverviewHeader } from "@/components/school-overview/SchoolOverviewHeader";
import { SchoolOverviewMethodologyDialog } from "@/components/school-overview/SchoolOverviewMethodologyDialog";
import { SchoolOverviewMetricCards } from "@/components/school-overview/SchoolOverviewMetricCards";
import { SchoolOverviewDataIssues, SchoolOverviewEmptyNotice, SchoolOverviewFailure, SchoolOverviewLoading } from "@/components/school-overview/SchoolOverviewStates";
import { SCHOOL_OVERVIEW_CURRENT_TIME } from "@/data/assessmentMock";
import { buildSchoolOverview } from "@/lib/school-overview";
import { getSchoolTermRange } from "@/lib/system-settings";
import { useAdminData } from "@/state/AdminDataProvider";
import type { SchoolOverviewModuleKey, SchoolOverviewOrganizationFilter } from "@/types/school-overview";

type SchoolOverviewPageProps = {
  initialLoadState?: "ready" | "loading" | "error";
  failedModules?: SchoolOverviewModuleKey[];
};

export function SchoolOverviewPage({ initialLoadState = "ready", failedModules = [] }: SchoolOverviewPageProps) {
  const { baseData, students, assessments, warnings } = useAdminData();
  const [loadState, setLoadState] = useState(initialLoadState);
  const [failedModuleState, setFailedModuleState] = useState<SchoolOverviewModuleKey[]>(failedModules);
  const [organizationFilter, setOrganizationFilter] = useState<SchoolOverviewOrganizationFilter>({ level: "school" });
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const viewModel = useMemo(() => buildSchoolOverview({
    students,
    assessments,
    warnings,
    currentTime: SCHOOL_OVERVIEW_CURRENT_TIME,
    termRange: getSchoolTermRange(baseData),
    organizationFilter,
  }), [assessments, baseData, organizationFilter, students, warnings]);

  if (loadState === "loading") return <SchoolOverviewLoading />;
  if (loadState === "error") return <SchoolOverviewFailure onRetry={() => setLoadState("ready")} />;

  return (
    <div className="min-w-0 space-y-4 pb-2" data-school-overview-scope={viewModel.scope.organizationFilter.level}>
      <SchoolOverviewHeader
        filter={organizationFilter}
        onFilterChange={setOrganizationFilter}
        onOpenMethodology={() => setMethodologyOpen(true)}
        options={viewModel.filterOptions}
        termRange={viewModel.scope.termRange}
        updatedAt={viewModel.updatedAt}
      />

      {!viewModel.hasScopeData ? <SchoolOverviewEmptyNotice>当前范围暂无符合统计口径的数据。</SchoolOverviewEmptyNotice> : null}
      {viewModel.hasScopeData && !viewModel.hasAssessmentData ? <SchoolOverviewEmptyNotice>当前统计周期暂无有效测评数据。覆盖率不会以虚假 0% 代替。</SchoolOverviewEmptyNotice> : null}
      {viewModel.hasScopeData && viewModel.hasConfirmedRisk === false ? <SchoolOverviewEmptyNotice>当前暂无心理老师确认的活动风险事项。</SchoolOverviewEmptyNotice> : null}
      {viewModel.isSmallClassSuppressed ? <SchoolOverviewEmptyNotice>当前班级属于小数量范围，风险相关精确值已按隐私规则隐藏。</SchoolOverviewEmptyNotice> : null}

      <SchoolOverviewMetricCards viewModel={viewModel} />
      <SchoolOverviewDispositionStages viewModel={viewModel} />
      <SchoolOverviewAnalysis
        failedModules={failedModuleState}
        onRetryModule={(module) => setFailedModuleState((current) => current.filter((item) => item !== module))}
        viewModel={viewModel}
      />
      <SchoolOverviewDataIssues issues={viewModel.dataIssues} />

      <p className="px-1 text-xs leading-5 text-neutral-500">本页仅展示当前学期、{viewModel.scope.organizationLabel}范围内的聚合事实。数据变化不直接代表因果关系，也不构成专业处置或资源配置建议。</p>

      <SchoolOverviewMethodologyDialog onOpenChange={setMethodologyOpen} open={methodologyOpen} />
    </div>
  );
}
