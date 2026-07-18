import { ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { StudentProfileSummary } from "@/types/studentProfile";

type StudentProfileTableProps = {
  profiles: StudentProfileSummary[];
  selectedStudentId?: string;
  hasFilters: boolean;
  currentPage: number;
  totalPages: number;
  totalProfiles: number;
  onView: (profile: StudentProfileSummary) => void;
  onReset: () => void;
  onPageChange: (page: number) => void;
};

export function StudentProfileTable({ profiles, selectedStudentId, hasFilters, currentPage, totalPages, totalProfiles, onView, onReset, onPageChange }: StudentProfileTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="text-sm font-medium text-neutral-700">学生档案</div>
        <div className="text-sm text-neutral-500">共 {totalProfiles} 名学生</div>
      </div>
      <Table>
        <TableHeader className="bg-neutral-50">
          <TableRow>
            <TableHead className="w-[24%] px-5">姓名</TableHead>
            <TableHead className="w-[22%]">学号</TableHead>
            <TableHead className="w-[18%]">年级</TableHead>
            <TableHead className="w-[18%]">班级</TableHead>
            <TableHead className="w-[18%] text-right pr-5">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow className={cn(selectedStudentId === profile.studentId && "bg-[var(--primary-100)]")} data-interactive="true" key={profile.studentId}>
              <TableCell className="px-5 py-4">
                <div className="font-semibold text-neutral-950">{profile.studentName}</div>
              </TableCell>
              <TableCell className="py-4 text-neutral-700">{profile.studentNumber}</TableCell>
              <TableCell className="py-4 text-neutral-700">{profile.currentGrade}</TableCell>
              <TableCell className="py-4 text-neutral-700">{profile.currentClass}</TableCell>
              <TableCell className="pr-5 text-right">
                <Button className="gap-2" onClick={() => onView(profile)} size="sm" type="button" variant="outline">
                  <FolderOpen className="h-4 w-4" />查看档案
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {profiles.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center border-t px-6 text-center">
          <div className="font-medium text-neutral-900">{hasFilters ? "未找到符合条件的学生" : "暂无在校学生档案"}</div>
          <div className="mt-2 text-sm text-neutral-500">{hasFilters ? "请调整搜索词或筛选条件后重试。" : "学生档案建立后会显示在这里。"}</div>
          {hasFilters ? <Button className="mt-4" onClick={onReset} type="button" variant="outline">清空条件</Button> : null}
        </div>
      ) : null}
      {profiles.length > 0 ? (
        <div className="flex items-center justify-between border-t px-5 py-3">
          <div className="text-xs text-neutral-500">每页最多 30 人</div>
          <div className="flex items-center gap-2">
            <Button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} size="sm" type="button" variant="outline">
              <ChevronLeft className="h-4 w-4" />上一页
            </Button>
            <span className="min-w-16 text-center text-sm text-neutral-600">{currentPage} / {totalPages}</span>
            <Button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} size="sm" type="button" variant="outline">
              下一页<ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
