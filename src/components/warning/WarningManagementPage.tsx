import { useMemo, useState } from "react";

import { WarningFilterBar } from "@/components/warning/WarningFilterBar";
import { WarningTable } from "@/components/warning/WarningTable";
import { warningMockData } from "@/data/warningMock";
import {
  type QuickFilterValue,
  type StatusTabValue,
  type WarningItem,
} from "@/types/warning";

const currentTeacher = "陈老师";
const today = "2026-07-08";

export function WarningManagementPage() {
  const [activeStatus, setActiveStatus] = useState<StatusTabValue>("all");
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterValue | null>(null);
  const [searchValue, setSearchValue] = useState("");
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
    });
  }, [activeQuickFilter, activeStatus, searchValue]);

  function handleQuickFilterChange(value: QuickFilterValue) {
    setActiveQuickFilter((current) => (current === value ? null : value));
  }

  function handleViewDetail(item: WarningItem) {
    setSelectedWarning(item);
    console.log("Phase 2 detail placeholder:", item.id, item.studentName);
  }

  return (
    <div className="space-y-5">
      <WarningFilterBar
        onQuickFilterChange={handleQuickFilterChange}
        onSearchChange={setSearchValue}
        onStatusChange={setActiveStatus}
        quickFilter={activeQuickFilter}
        searchValue={searchValue}
        status={activeStatus}
        statusCounts={statusCounts}
      />

      {selectedWarning ? (
        <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700">
          已选择 {selectedWarning.studentName}。本阶段仅保留详情入口占位，右侧详情抽屉将在 Phase 3 实现。
        </div>
      ) : null}

      <WarningTable
        items={filteredWarnings}
        onViewDetail={handleViewDetail}
        selectedId={selectedWarning?.id ?? null}
      />
    </div>
  );
}

