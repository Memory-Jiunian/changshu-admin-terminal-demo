import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { feedbackBadgeClasses, riskBadgeClasses, warningStatusBadgeClasses } from "@/lib/visual-tokens";
import { getEffectiveFeedbackStatus } from "@/lib/warning-feedback";
import {
  feedbackStatusLabels,
  getEffectiveRiskLevel,
  riskLevelLabels,
  statusLabels,
  type WarningItem,
} from "@/types/warning";

type WarningTableProps = {
  items: WarningItem[];
  selectedId: string | null;
  onViewDetail: (item: WarningItem) => void;
  currentTime: string;
};

export function WarningTable({ items, selectedId, onViewDetail, currentTime }: WarningTableProps) {
  return (
    <Card className="border-0 bg-[var(--border-default)] shadow-none">
      <CardHeader className="flex-row items-center justify-between px-5 py-4">
        <CardTitle className="text-lg font-semibold text-neutral-900">预警学生列表</CardTitle>
        <span className="text-sm font-medium text-neutral-500">共 {items.length} 条</span>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="overflow-hidden rounded-[var(--card-radius)] bg-[var(--bg-card)]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-12 pl-6 text-sm font-semibold text-neutral-500">
                  学生信息
                </TableHead>
                <TableHead className="text-sm font-semibold text-neutral-500">风险等级</TableHead>
                <TableHead className="text-sm font-semibold text-neutral-500">当前状态</TableHead>
                <TableHead className="min-w-[220px] text-sm font-semibold text-neutral-500">
                  最新动态
                </TableHead>
                <TableHead className="text-sm font-semibold text-neutral-500">发生时间</TableHead>
                <TableHead className="text-sm font-semibold text-neutral-500">反馈状态</TableHead>
                <TableHead className="pr-6 text-right text-sm font-semibold text-neutral-500">
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? (
                items.map((item) => {
                  const riskLevel = getEffectiveRiskLevel(item);
                  const feedbackStatus = getEffectiveFeedbackStatus(item, currentTime);

                  return (
                    <TableRow
                      className={cn("h-14 text-[15px] font-medium", selectedId === item.id && "bg-[var(--primary-100)]")}
                      data-interactive="true"
                      key={item.id}
                    >
                      <TableCell className="pl-6">
                        <div>
                          <div className="font-semibold text-neutral-950">{item.studentName}</div>
                          <div className="mt-1 text-xs text-neutral-500">{item.gradeClass}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={riskBadgeClasses[riskLevel]} variant="outline">
                          {riskLevelLabels[riskLevel]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={warningStatusBadgeClasses[item.currentStatus]} variant="outline">
                          {statusLabels[item.currentStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-neutral-900">{item.latestActivity}</TableCell>
                      <TableCell className="whitespace-nowrap text-neutral-700">
                        {item.activityTime}
                      </TableCell>
                      <TableCell>
                        <Badge className={feedbackBadgeClasses[feedbackStatus]} variant="outline">
                          {feedbackStatusLabels[feedbackStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          className="gap-2 px-0 font-semibold text-[var(--primary-600)] hover:bg-transparent hover:text-[var(--primary-500)]"
                          onClick={() => onViewDetail(item)}
                          type="button"
                          variant="ghost"
                        >
                          <Eye className="h-4 w-4" />
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell className="h-36 text-center text-neutral-500" colSpan={7}>
                    当前筛选条件下暂无预警学生
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
