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
import { getEffectiveFeedbackStatus } from "@/lib/warning-feedback";
import {
  feedbackStatusLabels,
  getEffectiveRiskLevel,
  riskLevelLabels,
  statusLabels,
  type FeedbackStatus,
  type RiskLevel,
  type WarningItem,
} from "@/types/warning";

type WarningTableProps = {
  items: WarningItem[];
  selectedId: string | null;
  onViewDetail: (item: WarningItem) => void;
  currentTime: string;
};

const riskBadgeClass: Record<RiskLevel, string> = {
  medium: "border-neutral-200 bg-neutral-100 text-neutral-700",
  high: "border-neutral-300 bg-neutral-900 text-white",
  critical: "border-neutral-900 bg-white text-neutral-950",
};

const feedbackBadgeClass: Record<FeedbackStatus, string> = {
  not_requested: "border-neutral-200 bg-neutral-50 text-neutral-500",
  pending_feedback: "border-neutral-200 bg-neutral-100 text-neutral-700",
  feedback_received: "border-neutral-200 bg-white text-neutral-700",
  feedback_overdue: "border-neutral-900 bg-neutral-900 text-white",
  new_feedback: "border-neutral-300 bg-neutral-100 text-neutral-950",
};

export function WarningTable({ items, selectedId, onViewDetail, currentTime }: WarningTableProps) {
  return (
    <Card className="rounded-lg border-0 bg-neutral-200/70 shadow-none">
      <CardHeader className="flex-row items-center justify-between px-5 py-4">
        <CardTitle className="text-lg font-semibold text-neutral-900">预警学生列表</CardTitle>
        <span className="text-sm font-medium text-neutral-500">共 {items.length} 条</span>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="overflow-hidden rounded-lg bg-white">
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
                      className={cn(
                        "h-14 text-[15px] font-medium",
                        selectedId === item.id && "bg-neutral-100",
                      )}
                      key={item.id}
                    >
                      <TableCell className="pl-6">
                        <div>
                          <div className="font-semibold text-neutral-950">{item.studentName}</div>
                          <div className="mt-1 text-xs text-neutral-500">{item.gradeClass}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={riskBadgeClass[riskLevel]} variant="outline">
                          {riskLevelLabels[riskLevel]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-neutral-800">
                        {statusLabels[item.currentStatus]}
                      </TableCell>
                      <TableCell className="text-neutral-900">{item.latestActivity}</TableCell>
                      <TableCell className="whitespace-nowrap text-neutral-700">
                        {item.activityTime}
                      </TableCell>
                      <TableCell>
                        <Badge className={feedbackBadgeClass[feedbackStatus]} variant="outline">
                          {feedbackStatusLabels[feedbackStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          className="gap-2 px-0 font-semibold text-neutral-900 hover:bg-transparent"
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
