import { useMemo, useState } from "react";

import { StudentRiskDrawer } from "@/components/warning/StudentRiskDrawer";
import { WarningFilterBar } from "@/components/warning/WarningFilterBar";
import { WarningTable } from "@/components/warning/WarningTable";
import { warningMockData } from "@/data/warningMock";
import {
  emptyAdvancedFilters,
  type AdvancedFilterValues,
  type QuickFilterValue,
  type StatusTabValue,
  type TimeRangeFilter,
  type WarningItem,
} from "@/types/warning";

const currentTeacher = "陈老师";
const today = "2026-07-08";

function getEmptyAdvancedFilters(): AdvancedFilterValues {
  return {
    gradeClass: [...emptyAdvancedFilters.gradeClass],
    riskLevel: [...emptyAdvancedFilters.riskLevel],
    currentStatus: [...emptyAdvancedFilters.currentStatus],
    clueType: [...emptyAdvancedFilters.clueType],
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
  const todayDate = new Date(`${today}T00:00:00`);
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

function matchesAdvancedFilters(item: WarningItem, filters: AdvancedFilterValues) {
  const matchesGradeClass =
    filters.gradeClass.length === 0 || filters.gradeClass.includes(item.gradeClass);
  const matchesRiskLevel =
    filters.riskLevel.length === 0 || filters.riskLevel.includes(item.riskLevel);
  const matchesCurrentStatus =
    filters.currentStatus.length === 0 || filters.currentStatus.includes(item.currentStatus);
  const matchesClueType =
    filters.clueType.length === 0 || filters.clueType.includes(item.clueType);
  const matchesResponsibleTeacher =
    filters.responsibleTeacher.length === 0 ||
    filters.responsibleTeacher.includes(item.responsibleTeacher);
  const matchesFeedbackStatus =
    filters.feedbackStatus.length === 0 || filters.feedbackStatus.includes(item.feedbackStatus);

  return (
    matchesGradeClass &&
    matchesRiskLevel &&
    matchesCurrentStatus &&
    matchesClueType &&
    matchesResponsibleTeacher &&
    matchesTimeRange(item.activityTime, filters.timeRange) &&
    matchesFeedbackStatus
  );
}

export function WarningManagementPage() {
  const [activeStatus, setActiveStatus] = useState<StatusTabValue>("all");
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterValue | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterValues>(() =>
    getEmptyAdvancedFilters(),
  );
  const [selectedWarning, setSelectedWarning] = useState<WarningItem | null>(null);

  const statusCounts = useMemo(() => {
    const counts = warningMockData.reduce(
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

    return counts;
  }, []);

  const advancedOptions = useMemo(
    () => ({
      gradeClass: getUniqueValues(warningMockData.map((item) => item.gradeClass)),
      responsibleTeacher: getUniqueValues(
        warningMockData.map((item) => item.responsibleTeacher),
      ),
    }),
    [],
  );

  const filteredWarnings = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return warningMockData.filter((item) => {
      const matchesStatus =
        activeStatus === "all" || item.currentStatus === activeStatus;
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
          case "high_risk":
            return item.riskLevel === "high" || item.riskLevel === "critical";
          case "today_new":
            return item.activityTime.startsWith(today);
          case "feedback_overdue":
            return item.feedbackStatus === "feedback_overdue";
          case "mine":
            return item.responsibleTeacher === currentTeacher;
          case "new_feedback":
            return item.feedbackStatus === "new_feedback";
          default:
            return true;
        }
      })();

      return matchesQuickFilter && matchesAdvancedFilters(item, advancedFilters);
    });
  }, [activeQuickFilter, activeStatus, advancedFilters, searchValue]);

  function handleQuickFilterChange(value: QuickFilterValue) {
    setActiveQuickFilter((current) => (current === value ? null : value));
  }

  function handleViewDetail(item: WarningItem) {
    setSelectedWarning(item);
    console.log("Phase 3 detail drawer:", item.id, item.studentName);
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
        items={filteredWarnings}
        onViewDetail={handleViewDetail}
        selectedId={selectedWarning?.id ?? null}
      />

      <StudentRiskDrawer
        onOpenChange={(drawerOpen) => {
          if (!drawerOpen) {
            setSelectedWarning(null);
          }
        }}
        open={selectedWarning !== null}
        warning={selectedWarning}
      />
    </div>
  );
}
