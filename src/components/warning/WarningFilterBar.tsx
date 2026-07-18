import { Search } from "lucide-react";

import { AdvancedFilterDialog } from "@/components/warning/AdvancedFilterDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  statusLabels,
  type AdvancedFilterOptions,
  type AdvancedFilterValues,
  type QuickFilterValue,
  type StatusTabValue,
} from "@/types/warning";

type WarningFilterBarProps = {
  status: StatusTabValue;
  quickFilter: QuickFilterValue | null;
  searchValue: string;
  advancedFilters: AdvancedFilterValues;
  advancedOptions: AdvancedFilterOptions;
  statusCounts: Record<StatusTabValue, number>;
  onStatusChange: (value: StatusTabValue) => void;
  onQuickFilterChange: (value: QuickFilterValue) => void;
  onSearchChange: (value: string) => void;
  onAdvancedFiltersChange: (value: AdvancedFilterValues) => void;
};

const statusOrder: StatusTabValue[] = [
  "all",
  "pending_review",
  "observing",
  "formal_warning",
  "in_intervention",
  "pending_retest",
  "referral",
  "closed",
];

const quickFilters: Array<{ label: string; value: QuickFilterValue }> = [
  { label: "高风险", value: "high_risk" },
  { label: "今日新增", value: "today_new" },
  { label: "反馈超时", value: "feedback_overdue" },
  { label: "我的负责", value: "mine" },
  { label: "有新反馈", value: "new_feedback" },
];

export function WarningFilterBar({
  status,
  quickFilter,
  searchValue,
  advancedFilters,
  advancedOptions,
  statusCounts,
  onStatusChange,
  onQuickFilterChange,
  onSearchChange,
  onAdvancedFiltersChange,
}: WarningFilterBarProps) {
  return (
    <section className="rounded-lg bg-neutral-200/70 p-3">
      <Tabs value={status} onValueChange={(value) => onStatusChange(value as StatusTabValue)}>
        <TabsList className="grid h-14 w-full grid-cols-8 rounded-lg bg-white p-1">
          {statusOrder.map((item) => (
            <TabsTrigger
              className="h-12 rounded-md text-base font-semibold text-[var(--text-secondary)] data-[state=active]:bg-[var(--primary-600)] data-[state=active]:text-white"
              key={item}
              value={item}
            >
              <span>{statusLabels[item]}</span>
              <span className="ml-2 text-xs opacity-70">{statusCounts[item]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="grid flex-1 grid-cols-5 gap-3">
          {quickFilters.map((item) => {
            const isActive = quickFilter === item.value;

            return (
              <Button
                className="h-10 rounded-md bg-[var(--bg-card)] text-sm font-semibold text-[var(--text-secondary)] shadow-none hover:bg-[var(--primary-50)] hover:text-[var(--primary-600)] data-[active=true]:bg-[var(--primary-600)] data-[active=true]:text-white"
                data-active={isActive}
                key={item.value}
                onClick={() => onQuickFilterChange(item.value)}
                type="button"
                variant="secondary"
              >
                {item.label}
              </Button>
            );
          })}
        </div>

        <div className="flex min-w-[360px] items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              className="h-10 rounded-full border-[var(--border-default)] bg-[var(--bg-card)] pl-9 pr-4 font-medium"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="搜索学生姓名 / 班级 / 最新动态"
              value={searchValue}
            />
          </div>

          <AdvancedFilterDialog
            onApply={onAdvancedFiltersChange}
            options={advancedOptions}
            value={advancedFilters}
          />
        </div>
      </div>
    </section>
  );
}
