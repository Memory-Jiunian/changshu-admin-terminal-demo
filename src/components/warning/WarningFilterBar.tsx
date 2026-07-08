import { Filter, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  clueTypeLabels,
  feedbackStatusLabels,
  riskLevelLabels,
  statusLabels,
  type QuickFilterValue,
  type StatusTabValue,
} from "@/types/warning";

type WarningFilterBarProps = {
  status: StatusTabValue;
  quickFilter: QuickFilterValue | null;
  searchValue: string;
  statusCounts: Record<StatusTabValue, number>;
  onStatusChange: (value: StatusTabValue) => void;
  onQuickFilterChange: (value: QuickFilterValue) => void;
  onSearchChange: (value: string) => void;
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
  statusCounts,
  onStatusChange,
  onQuickFilterChange,
  onSearchChange,
}: WarningFilterBarProps) {
  return (
    <section className="rounded-lg bg-neutral-200/70 p-3">
      <Tabs value={status} onValueChange={(value) => onStatusChange(value as StatusTabValue)}>
        <TabsList className="grid h-14 w-full grid-cols-8 rounded-lg bg-white p-1">
          {statusOrder.map((item) => (
            <TabsTrigger
              className="h-12 rounded-md text-base font-semibold text-neutral-500 data-[state=active]:bg-neutral-900 data-[state=active]:text-white"
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
                className="h-10 rounded-md bg-white text-sm font-semibold text-neutral-500 shadow-none hover:bg-neutral-100 data-[active=true]:bg-neutral-900 data-[active=true]:text-white"
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
              className="h-10 rounded-full border-neutral-900 bg-white pl-9 pr-4 font-medium"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="搜索学生姓名 / 班级 / 最新动态"
              value={searchValue}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-10 gap-2 rounded-md text-neutral-900"
                type="button"
                variant="ghost"
              >
                <SlidersHorizontal className="h-4 w-4" />
                高级筛选
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-4">
              <DropdownMenuLabel className="flex items-center gap-2 px-0 text-base">
                <Filter className="h-4 w-4" />
                筛选器
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-4 text-sm text-neutral-600">
                <div>
                  <p className="font-semibold text-neutral-900">年级、班级</p>
                  <p className="mt-1">后续可按年级和班级缩小范围。</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">风险等级</p>
                  <p className="mt-1">{Object.values(riskLevelLabels).join(" / ")}</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">线索类型</p>
                  <p className="mt-1">{Object.values(clueTypeLabels).join(" / ")}</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">负责心理老师</p>
                  <p className="mt-1">陈老师 / 周老师 / 刘老师</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">反馈状态</p>
                  <p className="mt-1">{Object.values(feedbackStatusLabels).join(" / ")}</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </section>
  );
}

