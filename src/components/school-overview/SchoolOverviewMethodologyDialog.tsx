import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BUSINESS_DIALOG_BODY_CLASS, BUSINESS_DIALOG_CONTENT_CLASS, BUSINESS_DIALOG_FOOTER_CLASS, BUSINESS_DIALOG_HEADER_CLASS, BUSINESS_DIALOG_WIDTH_CLASS } from "@/components/warning/BusinessDialogLayout";

export function SchoolOverviewMethodologyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const items = [
    ["当前确认风险学生", "存在活动事项且心理老师已确认中风险、高风险或危险，按学生去重。系统建议风险不计入。"],
    ["人数与事项数", "测评覆盖和当前风险按人统计；处置阶段、重点关注与事项趋势按事项统计。"],
    ["待安排干预", "正式预警且当前不存在有效的 planned 干预预约。"],
    ["干预预约待确认", "待干预事项的有效预约超过计划时间 60 分钟，等待心理老师确认；不等同于未到场。"],
    ["反馈超时", "使用共享有效反馈状态，当前任务超过反馈截止时间且未收到反馈。"],
    ["复测未完成", "待复测事项超过计划时间 120 分钟仍无完成记录。"],
    ["复测结果待更新", "已有完成的复测记录，但事项主状态仍为待复测。"],
    ["小数量保护", "班级确认风险学生少于 3 人时，精确人数、等级结构与占比均不进入展示 ViewModel。"],
    ["快照与趋势", "当前快照读取活动事项；趋势按正式确认、闭环和发起转介的真实事件时间归月。"],
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
          <p className="mt-4 text-xs leading-5 text-neutral-500">风险线索来源表示事项最初被发现的渠道，不等于风险原因，也不产生专业处置建议。</p>
        </div>
        <DialogFooter className={BUSINESS_DIALOG_FOOTER_CLASS}>
          <Button onClick={() => onOpenChange(false)} type="button">知道了</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
