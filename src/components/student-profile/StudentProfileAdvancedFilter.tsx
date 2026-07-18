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
import {
  cloneStudentProfileAdvancedFilters,
} from "@/lib/student-profile-filters";
import { cn } from "@/lib/utils";
import {
  booleanFilterLabels,
  createDefaultStudentProfileAdvancedFilters,
  enrollmentStatusLabels,
  type StudentProfileAdvancedFilterKey,
  type StudentProfileAdvancedFilters,
  type StudentProfileFilterOptions,
} from "@/types/studentProfile";
import { riskLevelLabels, statusLabels, warningSourceTypeLabels } from "@/types/warning";

type FilterOption = { label: string; value: string };
type FilterCategory = {
  key: StudentProfileAdvancedFilterKey;
  label: string;
  options: FilterOption[];
};

type StudentProfileAdvancedFilterProps = {
  value: StudentProfileAdvancedFilters;
  options: StudentProfileFilterOptions;
  onApply: (value: StudentProfileAdvancedFilters) => void;
};

const categoryOrder: StudentProfileAdvancedFilterKey[] = [
  "riskLevel",
  "warningStatus",
  "hasCurrentWarning",
  "sourceType",
  "hasFormalWarning",
  "hasInterventionRecords",
  "responsiblePsychologist",
  "enrollmentStatus",
];

function countNonDefaultFilters(filters: StudentProfileAdvancedFilters) {
  const enrollmentCount =
    filters.enrollmentStatus.length === 1 && filters.enrollmentStatus[0] === "enrolled"
      ? 0
      : filters.enrollmentStatus.length;

  return (
    filters.riskLevel.length +
    filters.warningStatus.length +
    filters.hasCurrentWarning.length +
    filters.sourceType.length +
    filters.hasFormalWarning.length +
    filters.hasInterventionRecords.length +
    filters.responsiblePsychologist.length +
    enrollmentCount
  );
}

export function StudentProfileAdvancedFilter({
  value,
  options,
  onApply,
}: StudentProfileAdvancedFilterProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<StudentProfileAdvancedFilterKey>("riskLevel");
  const [draft, setDraft] = useState(() =>
    cloneStudentProfileAdvancedFilters(value),
  );

  useEffect(() => {
    if (open) {
      setDraft(cloneStudentProfileAdvancedFilters(value));
    }
  }, [open, value]);

  const categories = useMemo<FilterCategory[]>(
    () => [
      {
        key: "riskLevel",
        label: "当前风险",
        options: [
          { label: riskLevelLabels.low, value: "low" },
          { label: riskLevelLabels.medium, value: "medium" },
          { label: riskLevelLabels.high, value: "high" },
          { label: riskLevelLabels.critical, value: "critical" },
        ],
      },
      {
        key: "warningStatus",
        label: "预警状态",
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
        key: "hasCurrentWarning",
        label: "当前预警事项",
        options: [
          { label: booleanFilterLabels.yes, value: "yes" },
          { label: booleanFilterLabels.no, value: "no" },
        ],
      },
      {
        key: "sourceType",
        label: "事项来源",
        options: [
          { label: warningSourceTypeLabels.screening_abnormal, value: "screening_abnormal" },
          { label: "AI 倾诉触发", value: "ai_chat_trigger" },
          { label: warningSourceTypeLabels.teacher_report, value: "teacher_report" },
        ],
      },
      {
        key: "hasFormalWarning",
        label: "是否形成正式预警",
        options: [
          { label: booleanFilterLabels.yes, value: "yes" },
          { label: booleanFilterLabels.no, value: "no" },
        ],
      },
      {
        key: "hasInterventionRecords",
        label: "是否有干预记录",
        options: [
          { label: booleanFilterLabels.yes, value: "yes" },
          { label: booleanFilterLabels.no, value: "no" },
        ],
      },
      {
        key: "responsiblePsychologist",
        label: "负责心理老师",
        options: options.responsiblePsychologists.map((name) => ({
          label: name,
          value: name,
        })),
      },
      {
        key: "enrollmentStatus",
        label: "在校状态",
        options: Object.entries(enrollmentStatusLabels).map(([value, label]) => ({
          label,
          value,
        })),
      },
    ],
    [options.responsiblePsychologists],
  );

  const selectedChips = useMemo(
    () =>
      categories.flatMap((category) =>
        category.options
          .filter((option) => (draft[category.key] as string[]).includes(option.value))
          .map((option) => ({ ...option, categoryKey: category.key, categoryLabel: category.label })),
      ),
    [categories, draft],
  );
  const activeConfig =
    categories.find((category) => category.key === activeCategory) ?? categories[0];

  function toggleOption(key: StudentProfileAdvancedFilterKey, optionValue: string) {
    setDraft((current) => {
      const values = current[key] as string[];
      const next = values.includes(optionValue)
        ? values.filter((value) => value !== optionValue)
        : [...values, optionValue];
      return { ...current, [key]: next } as StudentProfileAdvancedFilters;
    });
  }

  function resetDraft() {
    setDraft(createDefaultStudentProfileAdvancedFilters());
  }

  function clearOption(key: StudentProfileAdvancedFilterKey, optionValue: string) {
    setDraft((current) => ({
      ...current,
      [key]: (current[key] as string[]).filter((value) => value !== optionValue),
    }) as StudentProfileAdvancedFilters);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 gap-2" type="button" variant="outline">
          <SlidersHorizontal className="h-4 w-4" />
          高级筛选
          {countNonDefaultFilters(value) > 0 ? (
            <Badge className="ml-1 border-[var(--primary-600)] bg-[var(--primary-600)] text-white" variant="outline">
              {countNonDefaultFilters(value)}
            </Badge>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[70vh] max-w-[720px] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 flex-row items-center justify-between space-y-0 border-b px-5 py-4 pr-12">
          <DialogTitle>高级筛选</DialogTitle>
          <Button className="h-8" onClick={resetDraft} type="button" variant="ghost">
            重置
          </Button>
        </DialogHeader>

        <div className="shrink-0 border-b px-5 py-3">
          <div className="mb-2 text-xs font-semibold text-neutral-500">已选条件</div>
          <div className="flex max-h-24 min-h-8 flex-wrap gap-2 overflow-y-auto">
            {selectedChips.map((chip) => (
              <Badge className="gap-1 rounded-full border-[var(--primary-200)] bg-[var(--primary-50)] text-[var(--primary-600)]" key={`${chip.categoryKey}-${chip.value}`} variant="outline">
                <span className="text-neutral-500">{chip.categoryLabel}</span>
                {chip.label}
                <button aria-label={`移除 ${chip.label}`} onClick={() => clearOption(chip.categoryKey, chip.value)} type="button">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[180px_1fr]">
          <div className="border-r bg-neutral-50 p-3">
            {categoryOrder.map((key) => {
              const category = categories.find((item) => item.key === key)!;
              return (
                <button
                  className={cn(
                    "mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium text-neutral-600",
                    activeCategory === key && "bg-white text-[var(--primary-600)] shadow-sm",
                  )}
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  type="button"
                >
                  {category.label}
                  {draft[key].length > 0 ? (
                    <span className="rounded-full bg-[var(--primary-600)] px-2 py-0.5 text-xs text-white">{draft[key].length}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <ScrollArea className="h-full">
            <div className="p-5">
              <div className="mb-4 text-sm font-semibold">{activeConfig.label}</div>
              <div className="flex flex-wrap gap-2">
                {activeConfig.options.map((option) => {
                  const selected = (draft[activeConfig.key] as string[]).includes(option.value);
                  return (
                    <Button
                      className={cn("rounded-full", selected && "border-[var(--primary-600)] bg-[var(--primary-600)] text-white hover:bg-[var(--primary-500)]")}
                      key={option.value}
                      onClick={() => toggleOption(activeConfig.key, option.value)}
                      type="button"
                      variant={selected ? "default" : "outline"}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="shrink-0 border-t px-5 py-4">
          <Button onClick={resetDraft} type="button" variant="outline">重置</Button>
          <Button onClick={() => { onApply(cloneStudentProfileAdvancedFilters(draft)); setOpen(false); }} type="button">
            应用筛选
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
