import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BUSINESS_DIALOG_BODY_CLASS, BUSINESS_DIALOG_CONTENT_CLASS, BUSINESS_DIALOG_FOOTER_CLASS, BUSINESS_DIALOG_HEADER_CLASS, BUSINESS_DIALOG_WIDTH_CLASS } from "@/components/warning/BusinessDialogLayout";

export function SchoolOverviewMethodologyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const items = [
    ["测评覆盖率", "当前范围在校学生中，本学期至少完成一次有效测评的去重学生比例；无在校学生时不显示误导性的 0%。"],
    ["当前确认风险学生", "存在当前处理中事项且心理老师已确认中风险、高风险或危险，按学生去重。系统建议风险不计入。"],
    ["当前需关注", "转介中、积压处置、协作阻塞分别按事项去重；同一事项可能命中多个分类，总数使用事项编号并集计算。"],
    ["积压处置", "包含反馈已阅但未安排干预、预约超过 60 分钟仍待确认、复测超过 120 分钟仍未完成三类事实，不改变任何工作台或专业处置规则。"],
    ["处置阶段", "评估与确认合并待复核、观察中、正式预警；干预与复测合并待干预、待复测；校外支持为转介中；已闭环只读取本学期真实闭环事项。横条只比较规模，不表示完成率。"],
    ["测评突出问题", "只读取本学期结构化深度测评维度中明确达到量表关注阈值的记录，同一学生同一量表维度只计一次，不从摘要或业务记录生成维度。"],
    ["小数量保护", "班级确认风险学生少于 3 人时，精确人数、等级结构与占比均不进入展示 ViewModel。"],
    ["快照与趋势", "当前快照读取处理中事项；趋势只按正式预警确认和闭环的真实事件时间归月，单位为项。"],
    ["年级构成", "按当前确认风险学生去重后读取当前年级，展示其在全部当前风险学生中的构成，不使用在校学生基数计算风险率。"],
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
