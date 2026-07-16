import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BUSINESS_DIALOG_BODY_CLASS, BUSINESS_DIALOG_CONTENT_CLASS, BUSINESS_DIALOG_FOOTER_CLASS, BUSINESS_DIALOG_HEADER_CLASS, BUSINESS_DIALOG_WIDTH_CLASS } from "@/components/warning/BusinessDialogLayout";

export function SchoolOverviewMethodologyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const items = [
    ["当前确认风险学生", "存在当前处理中事项且心理老师已确认中风险、高风险或危险，按学生去重。系统建议风险不计入。"],
    ["人数与事项数", "测评覆盖和当前风险按人统计；处置阶段、重点关注与事项趋势按事项统计。"],
    ["反馈已阅待安排", "活动正式预警的当前班主任反馈轮次已有有效反馈，心理老师已逐条确认查看，且当前不存在有效的 planned 干预预约。该指标不限制心理老师提前预约干预。"],
    ["干预预约待确认", "待干预事项的有效预约超过计划时间 60 分钟，等待心理老师确认；不等同于未到场。"],
    ["反馈超时", "使用共享有效反馈状态，当前任务超过反馈截止时间且未收到反馈。"],
    ["复测超时未完成", "待复测事项超过计划时间 120 分钟仍无完成记录；已完成但状态待更新的事项不计入。"],
    ["小数量保护", "班级确认风险学生少于 3 人时，精确人数、等级结构与占比均不进入展示 ViewModel。"],
    ["快照与趋势", "当前快照读取处理中事项；趋势只按正式预警确认和闭环的真实事件时间归月，单位为项。"],
    ["年级构成", "按当前确认风险学生去重后读取当前年级，展示其在全部当前风险学生中的构成，不使用在校学生基数计算风险率。"],
    ["处置成效", "闭环率和平均闭环周期读取真实业务时间；当前阻塞按事项去重，不用于评价心理老师绩效。"],
  ];

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className={`${BUSINESS_DIALOG_CONTENT_CLASS} ${BUSINESS_DIALOG_WIDTH_CLASS.medium}`}>
        <DialogHeader className={BUSINESS_DIALOG_HEADER_CLASS}>
          <DialogTitle>校级总览统计口径</DialogTitle>
          <DialogDescription>当前学期、当前组织范围内的只读聚合规则。</DialogDescription>
        </DialogHeader>
        <div className={BUSINESS_DIALOG_BODY_CLASS}>
          <dl className="space-y-4">
            {items.map(([label, description]) => (
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3" key={label}>
                <dt className="text-sm font-medium text-neutral-900">{label}</dt>
                <dd className="mt-1 text-sm leading-6 text-neutral-600">{description}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs leading-5 text-neutral-500">总览只呈现聚合事实，不提供个案下钻、专业处置建议或人员绩效结论。</p>
        </div>
        <DialogFooter className={BUSINESS_DIALOG_FOOTER_CLASS}>
          <Button onClick={() => onOpenChange(false)} type="button">知道了</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
