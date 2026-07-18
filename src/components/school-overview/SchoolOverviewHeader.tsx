import { CalendarRange, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SchoolOverviewFilterOptions, SchoolOverviewOrganizationFilter, SchoolOverviewTermRange } from "@/types/school-overview";

type SchoolOverviewHeaderProps = {
  termRange: SchoolOverviewTermRange;
  filter: SchoolOverviewOrganizationFilter;
  options: SchoolOverviewFilterOptions;
  updatedAt: string;
  onFilterChange: (filter: SchoolOverviewOrganizationFilter) => void;
  onOpenMethodology: () => void;
};

export function SchoolOverviewHeader({
  termRange,
  filter,
  options,
  updatedAt,
  onFilterChange,
  onOpenMethodology,
}: SchoolOverviewHeaderProps) {
  const selectedGrade = filter.level === "school" ? "school" : filter.grade;
  const classes = selectedGrade === "school" ? [] : (options.classesByGrade[selectedGrade] ?? []);
  const selectedClass = filter.level === "class" ? filter.className : "all";

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-title)]">校级总览</h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarRange className="h-4 w-4" aria-hidden="true" />
            {termRange.label} · {termRange.start.slice(0, 10)} 至 {termRange.end.slice(0, 10)}
          </span>
          <span>数据更新：{updatedAt}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" aria-label="组织范围筛选">
        <Select
          value={selectedGrade}
          onValueChange={(value) => onFilterChange(value === "school" ? { level: "school" } : { level: "grade", grade: value })}
        >
          <SelectTrigger className="w-[148px] bg-[var(--bg-card)]" aria-label="选择全校或年级">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="school">全校</SelectItem>
            {options.grades.map((grade) => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}
          </SelectContent>
        </Select>

        {selectedGrade !== "school" ? (
          <Select
            value={selectedClass}
            onValueChange={(value) => onFilterChange(value === "all"
              ? { level: "grade", grade: selectedGrade }
              : { level: "class", grade: selectedGrade, className: value })}
          >
            <SelectTrigger className="w-[132px] bg-[var(--bg-card)]" aria-label="选择班级">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部班级</SelectItem>
              {classes.map((className) => <SelectItem key={className} value={className}>{className}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : null}

        <Button className="gap-2" onClick={onOpenMethodology} type="button" variant="outline">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          查看统计口径
        </Button>
      </div>
    </header>
  );
}
