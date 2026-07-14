import { useMemo, useState } from "react";

import { StudentRiskDrawer } from "@/components/warning/StudentRiskDrawer";
import { WarningFilterBar } from "@/components/warning/WarningFilterBar";
import { WarningTable } from "@/components/warning/WarningTable";
import { warningMockData } from "@/data/warningMock";
import { applyConfirmFormalWarning, applyWarningAction } from "@/lib/warning-actions";
import { getEffectiveFeedbackStatus } from "@/lib/warning-feedback";
import { formatMockDateTime, WARNING_MOCK_TODAY } from "@/lib/warning-time";
import {
  emptyAdvancedFilters,
  getEffectiveRiskLevel,
  type AdvancedFilterValues,
  type ConfirmFormalWarningValues,
  type QuickFilterValue,
  type StatusTabValue,
  type TimeRangeFilter,
  type WarningActionResponse,
  type WarningActionSubmission,
  type WarningItem,
} from "@/types/warning";

const currentTeacher = "陈老师";

function getEmptyAdvancedFilters(): AdvancedFilterValues {
  return {
    gradeClass: [...emptyAdvancedFilters.gradeClass],
    riskLevel: [...emptyAdvancedFilters.riskLevel],
    currentStatus: [...emptyAdvancedFilters.currentStatus],
    evidenceTypes: [...emptyAdvancedFilters.evidenceTypes],
    responsibleTeacher: [...emptyAdvancedFilters.responsibleTeacher],
    timeRange: [...emptyAdvancedFilters.timeRange],
    feedbackStatus: [...emptyAdvancedFilters.feedbackStatus],
  };
}

function getUniqueValues(values: string[]) {
  return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));
}

function getDayDistanceFromToday(activityTime: string) {
  const activityDate = new Date(`${activityTime.slice(0, 10)}T00:00:00`);
  const todayDate = new Date(`${WARNING_MOCK_TODAY}T00:00:00`);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.round((todayDate.getTime() - activityDate.getTime()) / millisecondsPerDay);
}

function matchesTimeRange(activityTime: string, ranges: TimeRangeFilter[]) {
  if (ranges.length === 0) {
    return true;
  }

  const dayDistance = getDayDistanceFromToday(activityTime);

  return ranges.some((range) => {
    switch (range) {
      case "today":
        return dayDistance === 0;
      case "last_3_days":
        return dayDistance >= 0 && dayDistance <= 2;
      case "last_7_days":
        return dayDistance >= 0 && dayDistance <= 6;
      default:
        return true;
    }
  });
}

function matchesAdvancedFilters(item: WarningItem, filters: AdvancedFilterValues, currentTime: string) {
  const matchesGradeClass =
    filters.gradeClass.length === 0 || filters.gradeClass.includes(item.gradeClass);
  const matchesRiskLevel =
    filters.riskLevel.length === 0 ||
    filters.riskLevel.includes(getEffectiveRiskLevel(item));
  const matchesCurrentStatus =
    filters.currentStatus.length === 0 || filters.currentStatus.includes(item.currentStatus);
  const matchesEvidenceTypes =
    filters.evidenceTypes.length === 0 ||
    filters.evidenceTypes.some((evidenceType) => item.evidenceTypes.includes(evidenceType));
  const matchesResponsibleTeacher =
    filters.responsibleTeacher.length === 0 ||
    filters.responsibleTeacher.includes(item.responsibleTeacher);
  const matchesFeedbackStatus =
    filters.feedbackStatus.length === 0 ||
    filters.feedbackStatus.includes(getEffectiveFeedbackStatus(item, currentTime));

  return (
    matchesGradeClass &&
    matchesRiskLevel &&
    matchesCurrentStatus &&
    matchesEvidenceTypes &&
    matchesResponsibleTeacher &&
    matchesTimeRange(item.activityTime, filters.timeRange) &&
    matchesFeedbackStatus
  );
}

export function WarningManagementPage() {
  const currentTime = formatMockDateTime();
  const [warnings, setWarnings] = useState<WarningItem[]>(() => warningMockData);
  const [activeStatus, setActiveStatus] = useState<StatusTabValue>("all");
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterValue | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterValues>(() =>
    getEmptyAdvancedFilters(),
  );
  const [selectedWarningId, setSelectedWarningId] = useState<string | null>(null);

  const selectedWarning = useMemo(
    () => warnings.find((warning) => warning.id === selectedWarningId) ?? null,
    [selectedWarningId, warnings],
  );

  const activeWarnings = useMemo(
    () => warnings.filter((warning) => warning.isActive),
    [warnings],
  );

  const statusCounts = useMemo(() => {
    return activeWarnings.reduce(
      (accumulator, item) => {
        accumulator[item.currentStatus] += 1;
        accumulator.all += 1;
        return accumulator;
      },
      {
        all: 0,
        pending_review: 0,
        observing: 0,
        formal_warning: 0,
        in_intervention: 0,
        pending_retest: 0,
        referral: 0,
        closed: 0,
      } satisfies Record<StatusTabValue, number>,
    );
  }, [activeWarnings]);

  const advancedOptions = useMemo(
    () => ({
      gradeClass: getUniqueValues(activeWarnings.map((item) => item.gradeClass)),
      responsibleTeacher: getUniqueValues(activeWarnings.map((item) => item.responsibleTeacher)),
    }),
    [activeWarnings],
  );

  const filteredWarnings = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return activeWarnings.filter((item) => {
      const matchesStatus = activeStatus === "all" || item.currentStatus === activeStatus;
      const matchesSearch =
        keyword.length === 0 ||
        item.studentName.toLowerCase().includes(keyword) ||
        item.gradeClass.toLowerCase().includes(keyword) ||
        item.latestActivity.toLowerCase().includes(keyword);

      if (!matchesStatus || !matchesSearch) {
        return false;
      }

      const matchesQuickFilter = (() => {
        if (!activeQuickFilter) {
          return true;
        }

        switch (activeQuickFilter) {
          case "high_risk": {
            const riskLevel = getEffectiveRiskLevel(item);
            return riskLevel === "high" || riskLevel === "critical";
          }
          case "today_new":
            return item.activityTime.startsWith(WARNING_MOCK_TODAY);
          case "feedback_overdue":
            return getEffectiveFeedbackStatus(item, currentTime) === "feedback_overdue";
          case "mine":
            return item.responsibleTeacher === currentTeacher;
          case "new_feedback":
            return getEffectiveFeedbackStatus(item, currentTime) === "new_feedback";
          default:
            return true;
        }
      })();

      return matchesQuickFilter && matchesAdvancedFilters(item, advancedFilters, currentTime);
    });
  }, [activeQuickFilter, activeStatus, activeWarnings, advancedFilters, currentTime, searchValue]);

  function handleQuickFilterChange(value: QuickFilterValue) {
    setActiveQuickFilter((current) => (current === value ? null : value));
  }

  function handleViewDetail(item: WarningItem) {
    setSelectedWarningId(item.id);
  }

  function handleConfirmFormalWarning(
    warningId: string,
    values: ConfirmFormalWarningValues,
  ) {
    const occurredAt = formatMockDateTime();

    setWarnings((currentWarnings) =>
      currentWarnings.map((warning) =>
        warning.id === warningId
          ? applyConfirmFormalWarning(warning, values, occurredAt)
          : warning,
      ),
    );
  }

  function handleWarningAction(
    warningId: string,
    submission: WarningActionSubmission,
  ): WarningActionResponse {
    const warning = warnings.find((item) => item.id === warningId);
    if (!warning) {
      return { success: false, message: "未找到当前预警事项。" };
    }

    const result = applyWarningAction(warning, submission, formatMockDateTime());
    if (!result.success) {
      return { success: false, message: result.message };
    }

    setWarnings((currentWarnings) =>
      currentWarnings.map((item) => (item.id === warningId ? result.warning : item)),
    );
    return { success: true, message: result.message };
  }

  return (
    <div className="space-y-5">
      <WarningFilterBar
        advancedFilters={advancedFilters}
        advancedOptions={advancedOptions}
        onAdvancedFiltersChange={setAdvancedFilters}
        onQuickFilterChange={handleQuickFilterChange}
        onSearchChange={setSearchValue}
        onStatusChange={setActiveStatus}
        quickFilter={activeQuickFilter}
        searchValue={searchValue}
        status={activeStatus}
        statusCounts={statusCounts}
      />

      <WarningTable
        currentTime={currentTime}
        items={filteredWarnings}
        onViewDetail={handleViewDetail}
        selectedId={selectedWarningId}
      />

      <StudentRiskDrawer
        currentTime={currentTime}
        onAction={handleWarningAction}
        onConfirmFormalWarning={handleConfirmFormalWarning}
        onOpenChange={(drawerOpen) => {
          if (!drawerOpen) {
            setSelectedWarningId(null);
          }
        }}
        open={selectedWarning !== null}
        warning={selectedWarning}
      />
    </div>
  );
}
