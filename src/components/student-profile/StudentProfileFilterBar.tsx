import { RotateCcw, Search } from "lucide-react";

import { StudentProfileAdvancedFilter } from "@/components/student-profile/StudentProfileAdvancedFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StudentProfileAdvancedFilters, StudentProfileFilterOptions, StudentProfileFilterQuery } from "@/types/studentProfile";

type StudentProfileFilterBarProps = {
  query: StudentProfileFilterQuery;
  options: StudentProfileFilterOptions;
  onKeywordChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onAdvancedApply: (value: StudentProfileAdvancedFilters) => void;
  onResetAll: () => void;
};

export function StudentProfileFilterBar({
  query,
  options,
  onKeywordChange,
  onGradeChange,
  onClassChange,
  onAdvancedApply,
  onResetAll,
}: StudentProfileFilterBarProps) {
  const classOptions = query.grade ? options.classesByGrade[query.grade] ?? [] : [];

  return (
    <div className="bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 p-4">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            className="h-10 pl-9"
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="搜索学生姓名 / 学号（全校）"
            value={query.keyword}
          />
        </div>
        <StudentProfileAdvancedFilter onApply={onAdvancedApply} options={options} value={query.advanced} />
        <Button className="h-10 gap-2" onClick={onResetAll} type="button" variant="ghost">
          <RotateCcw className="h-4 w-4" />全部重置
        </Button>
      </div>
      <div className="space-y-3 px-4 py-3">
        <Tabs onValueChange={onGradeChange} value={query.grade}>
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0">
            {options.grades.map((grade) => (
              <TabsTrigger className="shrink-0 px-4 py-2" key={grade} value={grade}>{grade}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Tabs onValueChange={onClassChange} value={query.className}>
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-neutral-100 p-1">
            {classOptions.map((className) => (
              <TabsTrigger className="shrink-0 px-4 py-2" key={className} value={className}>{className}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {query.keyword.trim() ? (
          <div className="text-xs text-neutral-500">正在全校范围搜索，年级和班级 Tab 将在清空关键词后继续生效。</div>
        ) : null}
      </div>
    </div>
  );
}
