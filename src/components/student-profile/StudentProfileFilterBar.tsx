import { RotateCcw, Search } from "lucide-react";

import { StudentProfileAdvancedFilter } from "@/components/student-profile/StudentProfileAdvancedFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-white p-4">
      <div className="relative min-w-[260px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          className="h-10 pl-9"
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="搜索学生姓名 / 学号"
          value={query.keyword}
        />
      </div>
      <Select onValueChange={(value) => onGradeChange(value === "all" ? "" : value)} value={query.grade || "all"}>
        <SelectTrigger className="h-10 w-36"><SelectValue placeholder="全部年级" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部年级</SelectItem>
          {options.grades.map((grade) => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select
        disabled={!query.grade}
        onValueChange={(value) => onClassChange(value === "all" ? "" : value)}
        value={query.className || "all"}
      >
        <SelectTrigger className="h-10 w-36"><SelectValue placeholder="全部班级" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部班级</SelectItem>
          {classOptions.map((className) => <SelectItem key={className} value={className}>{className}</SelectItem>)}
        </SelectContent>
      </Select>
      <StudentProfileAdvancedFilter onApply={onAdvancedApply} options={options} value={query.advanced} />
      <Button className="h-10 gap-2" onClick={onResetAll} type="button" variant="ghost">
        <RotateCcw className="h-4 w-4" />全部重置
      </Button>
    </div>
  );
}
