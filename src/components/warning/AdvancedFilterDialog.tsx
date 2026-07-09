import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  clueTypeLabels,
  emptyAdvancedFilters,
  feedbackStatusLabels,
  riskLevelLabels,
  statusLabels,
  timeRangeLabels,
  type AdvancedFilterKey,
  type AdvancedFilterOptions,
  type AdvancedFilterValues,
} from "@/types/warning";

type FilterOption = {
  label: string;
  value: string;
};

type FilterCategory = {
  key: AdvancedFilterKey;
  label: string;
  options: FilterOption[];
};

type AdvancedFilterDialogProps = {
  value: AdvancedFilterValues;
  options: AdvancedFilterOptions;
  onApply: (filters: AdvancedFilterValues) => void;
};

const categoryOrder: AdvancedFilterKey[] = [
  "gradeClass",
  "riskLevel",
  "currentStatus",
  "clueType",
  "responsibleTeacher",
  "timeRange",
  "feedbackStatus",
];

const categoryLabels: Record<AdvancedFilterKey, string> = {
  gradeClass: "年级 / 班级",
  riskLevel: "风险等级",
  currentStatus: "当前状态",
  clueType: "线索类型",
  responsibleTeacher: "负责心理老师",
  timeRange: "时间范围",
  feedbackStatus: "反馈状态",
};

function cloneFilters(filters: AdvancedFilterValues): AdvancedFilterValues {
  return {
    gradeClass: [...filters.gradeClass],
    riskLevel: [...filters.riskLevel],
    currentStatus: [...filters.currentStatus],
    clueType: [...filters.clueType],
    responsibleTeacher: [...filters.responsibleTeacher],
    timeRange: [...filters.timeRange],
    feedbackStatus: [...filters.feedbackStatus],
  };
}

function createEmptyFilters() {
  return cloneFilters(emptyAdvancedFilters);
}

function countSelected(filters: AdvancedFilterValues) {
  return categoryOrder.reduce((total, key) => total + filters[key].length, 0);
}

export function AdvancedFilterDialog({
  value,
  options,
  onApply,
}: AdvancedFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<AdvancedFilterKey>("gradeClass");
  const [draftFilters, setDraftFilters] = useState<AdvancedFilterValues>(() =>
    cloneFilters(value),
  );

  useEffect(() => {
    if (open) {
      setDraftFilters(cloneFilters(value));
    }
  }, [open, value]);

  const categories = useMemo<FilterCategory[]>(
    () => [
      {
        key: "gradeClass",
        label: categoryLabels.gradeClass,
        options: options.gradeClass.map((item) => ({ label: item, value: item })),
      },
      {
        key: "riskLevel",
        label: categoryLabels.riskLevel,
        options: [
          { label: riskLevelLabels.medium, value: "medium" },
          { label: riskLevelLabels.high, value: "high" },
          { label: riskLevelLabels.critical, value: "critical" },
        ],
      },
      {
        key: "currentStatus",
        label: categoryLabels.currentStatus,
        options: [
          { label: statusLabels.pending_review, value: "pending_review" },
          { label: statusLabels.observing, value: "observing" },
          { label: statusLabels.formal_warning, value: "formal_warning" },
          { label: statusLabels.in_intervention, value: "in_intervention" },
          { label: statusLabels.pending_retest, value: "pending_retest" },
          { label: statusLabels.referral, value: "referral" },
          { label: statusLabels.closed, value: "closed" },
        ],
      },
      {
        key: "clueType",
        label: categoryLabels.clueType,
        options: [
          { label: clueTypeLabels.screening_abnormal, value: "screening_abnormal" },
          { label: clueTypeLabels.deep_assessment, value: "deep_assessment" },
          { label: clueTypeLabels.ai_chat, value: "ai_chat" },
          { label: clueTypeLabels.teacher_report, value: "teacher_report" },
        ],
      },
      {
        key: "responsibleTeacher",
        label: categoryLabels.responsibleTeacher,
        options: options.responsibleTeacher.map((item) => ({ label: item, value: item })),
      },
      {
        key: "timeRange",
        label: categoryLabels.timeRange,
        options: [
          { label: timeRangeLabels.today, value: "today" },
          { label: timeRangeLabels.last_3_days, value: "last_3_days" },
          { label: timeRangeLabels.last_7_days, value: "last_7_days" },
        ],
      },
      {
        key: "feedbackStatus",
        label: categoryLabels.feedbackStatus,
        options: [
          { label: feedbackStatusLabels.not_requested, value: "not_requested" },
          { label: feedbackStatusLabels.pending_feedback, value: "pending_feedback" },
          { label: feedbackStatusLabels.feedback_received, value: "feedback_received" },
          { label: feedbackStatusLabels.feedback_overdue, value: "feedback_overdue" },
          { label: feedbackStatusLabels.new_feedback, value: "new_feedback" },
        ],
      },
    ],
    [options.gradeClass, options.responsibleTeacher],
  );

  const selectedChips = useMemo(
    () =>
      categories.flatMap((category) =>
        category.options
          .filter((option) =>
            (draftFilters[category.key] as string[]).includes(option.value),
          )
          .map((option) => ({
            categoryKey: category.key,
            categoryLabel: category.label,
            label: option.label,
            value: option.value,
          })),
      ),
    [categories, draftFilters],
  );

  const activeCategoryConfig =
    categories.find((category) => category.key === activeCategory) ?? categories[0];
  const appliedCount = countSelected(value);

  function toggleOption(key: AdvancedFilterKey, optionValue: string) {
    setDraftFilters((current) => {
      const selectedValues = current[key] as string[];
      const nextValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((item) => item !== optionValue)
        : [...selectedValues, optionValue];

      return {
        ...current,
        [key]: nextValues,
      } as AdvancedFilterValues;
    });
  }

  function clearOption(key: AdvancedFilterKey, optionValue: string) {
    setDraftFilters((current) => ({
      ...current,
      [key]: (current[key] as string[]).filter((item) => item !== optionValue),
    }) as AdvancedFilterValues);
  }

  function resetDraftFilters() {
    setDraftFilters(createEmptyFilters());
  }

  function handleApply() {
    onApply(cloneFilters(draftFilters));
    setOpen(false);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="h-10 gap-2 rounded-md text-neutral-900" type="button" variant="ghost">
          <SlidersHorizontal className="h-4 w-4" />
          高级筛选
          {appliedCount > 0 ? (
            <Badge className="ml-1 border-neutral-900 bg-neutral-900 text-white" variant="outline">
              {appliedCount}
            </Badge>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[70vh] max-w-[720px] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 flex-row items-center justify-between space-y-0 border-b border-neutral-200 px-5 py-4 pr-12">
          <DialogTitle className="text-lg font-semibold text-neutral-950">高级筛选</DialogTitle>
          <Button className="h-8 px-3" onClick={resetDraftFilters} type="button" variant="ghost">
            重置
          </Button>
        </DialogHeader>

        <div className="shrink-0 border-b border-neutral-200 px-5 py-2.5">
          <div className="mb-1.5 text-xs font-semibold text-neutral-500">已选条件</div>
          {selectedChips.length > 0 ? (
            <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto pr-1">
              {selectedChips.map((chip) => (
                <Badge
                  className="gap-1 rounded-full border-neutral-300 bg-neutral-100 py-1 pl-3 pr-2 text-neutral-800"
                  key={`${chip.categoryKey}-${chip.value}`}
                  variant="outline"
                >
                  <span className="text-neutral-500">{chip.categoryLabel}</span>
                  <span>{chip.label}</span>
                  <button
                    aria-label={`移除 ${chip.label}`}
                    className="ml-1 rounded-full p-0.5 text-neutral-500 hover:bg-white hover:text-neutral-900"
                    onClick={() => clearOption(chip.categoryKey, chip.value)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-500">
              暂未选择高级筛选条件
            </div>
          )}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[180px_1fr] items-stretch">
          <div className="h-full border-r border-neutral-200 bg-neutral-50 p-3">
            <div className="space-y-1">
              {categories.map((category) => {
                const selectedCount = draftFilters[category.key].length;
                const isActive = activeCategory === category.key;

                return (
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium text-neutral-600 hover:bg-white",
                      isActive && "bg-white text-neutral-950 shadow-sm",
                    )}
                    key={category.key}
                    onClick={() => setActiveCategory(category.key)}
                    type="button"
                  >
                    <span>{category.label}</span>
                    {selectedCount > 0 ? (
                      <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white">
                        {selectedCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <ScrollArea className="h-full">
            <div className="p-5">
              <div className="mb-3 text-sm font-semibold text-neutral-950">
                {activeCategoryConfig.label}
              </div>
              <div className="flex flex-wrap gap-2">
                {activeCategoryConfig.options.map((option) => {
                  const isSelected = (draftFilters[activeCategoryConfig.key] as string[]).includes(
                    option.value,
                  );

                  return (
                    <Button
                      className={cn(
                        "h-9 rounded-full border px-4 text-sm font-medium shadow-none",
                        isSelected
                          ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100",
                      )}
                      key={option.value}
                      onClick={() => toggleOption(activeCategoryConfig.key, option.value)}
                      type="button"
                      variant="outline"
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="shrink-0 border-t border-neutral-200 px-5 py-4">
          <Button onClick={resetDraftFilters} type="button" variant="outline">
            重置
          </Button>
          <Button className="bg-neutral-900 text-white hover:bg-neutral-800" onClick={handleApply} type="button">
            应用筛选
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
