import { useMemo, useState } from "react";

import { StudentRiskDrawer } from "@/components/warning/StudentRiskDrawer";
import { WarningFilterBar } from "@/components/warning/WarningFilterBar";
import { WarningTable } from "@/components/warning/WarningTable";
import { warningMockData } from "@/data/warningMock";
import {
  emptyAdvancedFilters,
  getEffectiveRiskLevel,
  riskLevelLabels,
  type AdvancedFilterValues,
  type ConfirmFormalWarningValues,
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
    filters.feedbackStatus.length === 0 || filters.feedbackStatus.includes(item.feedbackStatus);

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

function formatMockDateTime(date: Date) {
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${today} ${hour}:${minute}`;
}

export function WarningManagementPage() {
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

  const statusCounts = useMemo(() => {
    return warnings.reduce(
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
  }, [warnings]);

  const advancedOptions = useMemo(
    () => ({
      gradeClass: getUniqueValues(warnings.map((item) => item.gradeClass)),
      responsibleTeacher: getUniqueValues(warnings.map((item) => item.responsibleTeacher)),
    }),
    [warnings],
  );

  const filteredWarnings = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return warnings.filter((item) => {
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
  }, [activeQuickFilter, activeStatus, advancedFilters, searchValue, warnings]);

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
    const occurredAt = formatMockDateTime(new Date());

    setWarnings((currentWarnings) =>
      currentWarnings.map((warning) => {
        if (warning.id !== warningId) {
          return warning;
        }

        const confirmedLabel = riskLevelLabels[values.confirmedRiskLevel];
        const adjustmentReason = values.riskLevelAdjustmentReason.trim();
        const judgmentNote = values.judgmentNote.trim();
        const descriptionParts = [
          `心理老师完成复核，正式确认风险等级为${confirmedLabel}`,
          adjustmentReason ? `调整理由：${adjustmentReason}` : "",
          judgmentNote ? `判断说明：${judgmentNote}` : "",
          "系统已同步生成班主任协作任务",
        ].filter(Boolean);

        return {
          ...warning,
          currentStatus: "formal_warning",
          confirmedRiskLevel: values.confirmedRiskLevel,
          riskLevelAdjustmentReason: adjustmentReason || undefined,
          feedbackStatus: "pending_feedback",
          hasUnreadFeedback: false,
          latestActivity: "已确认正式预警",
          activityTime: occurredAt,
          timeline: [
            {
              id: `TL-${warning.id}-${Date.now()}`,
              title: "确认正式预警",
              operator: warning.responsibleTeacher,
              occurredAt,
              description: `${descriptionParts.join("；")}。`,
            },
            ...warning.timeline,
          ],
        };
      }),
    );
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
        selectedId={selectedWarningId}
      />

      <StudentRiskDrawer
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
