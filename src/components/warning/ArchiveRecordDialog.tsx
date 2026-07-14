import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProcessTimeline } from "@/components/warning/ProcessTimeline";
import {
  riskLevelLabels,
  warningEvidenceTypeLabels,
  warningSourceTypeLabels,
  type WarningItem,
} from "@/types/warning";

type ArchiveRecordDialogProps = {
  warning: WarningItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function Value({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-neutral-500">{label}</div>
      <div className="mt-1 text-sm leading-6 text-neutral-800">{value || "-"}</div>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-neutral-950">{title}</h3>
        {count !== undefined ? (
          <span className="text-xs font-medium text-neutral-500">共 {count} 条</span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
      {text}
    </div>
  );
}

export function ArchiveRecordDialog({ warning, open, onOpenChange }: ArchiveRecordDialogProps) {
  if (!warning) {
    return null;
  }

  const oldestTimeline = [...warning.timeline].sort((left, right) =>
    left.occurredAt.localeCompare(right.occurredAt),
  )[0];
  const closedAt = warning.timeline.find((item) => item.title === "完成闭环归档")?.occurredAt;
  const finalResult = [...warning.retestRecords]
    .sort((left, right) => right.arrangedAt.localeCompare(left.arrangedAt))
    .find((record) => record.conclusion)?.conclusion || "已完成闭环归档";
  const feedbackRequests = [...warning.feedbackRequests].sort((left, right) =>
    right.requestedAt.localeCompare(left.requestedAt),
  );
  const feedbackRecords = [...warning.feedbackRecords].sort((left, right) =>
    right.submittedAt.localeCompare(left.submittedAt),
  );
  const interventions = [...warning.interventionRecords].sort((left, right) =>
    right.occurredAt.localeCompare(left.occurredAt),
  );
  const retests = [...warning.retestRecords].sort((left, right) =>
    right.arrangedAt.localeCompare(left.arrangedAt),
  );
  const referrals = [...warning.referralRecords].sort((left, right) =>
    right.referredAt.localeCompare(left.referredAt),
  );

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex h-[86vh] max-w-[900px] flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-neutral-200 px-6 py-5 pr-14">
          <DialogTitle>归档记录</DialogTitle>
          <DialogDescription>{warning.studentName} · {warning.id} · 完整只读归档</DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 bg-neutral-100">
          <div className="space-y-4 p-5">
            <Section title="事项概况">
              <div className="grid gap-4 sm:grid-cols-3">
                <Value label="学生信息" value={`${warning.studentName} · ${warning.gradeClass}`} />
                <Value label="学生编号" value={warning.studentId} />
                <Value label="事项编号" value={warning.id} />
                <Value label="事项开始时间" value={oldestTimeline?.occurredAt} />
                <Value label="闭环时间" value={closedAt} />
                <Value label="负责心理老师" value={warning.responsibleTeacher} />
                <Value label="线索来源" value={warningSourceTypeLabels[warning.sourceType]} />
                <Value label="系统提示风险等级" value={riskLevelLabels[warning.suggestedRiskLevel]} />
                <Value label="心理老师确认风险等级" value={warning.confirmedRiskLevel ? riskLevelLabels[warning.confirmedRiskLevel] : undefined} />
                <div className="sm:col-span-3"><Value label="风险等级调整理由" value={warning.riskLevelAdjustmentReason} /></div>
                <div className="sm:col-span-3"><Value label="最终结果" value={finalResult} /></div>
              </div>
            </Section>

            <Section title="风险依据">
              <div className="grid gap-4 sm:grid-cols-2">
                <Value label="相关依据记录" value={warning.evidenceTypes.map((type) => warningEvidenceTypeLabels[type]).join("、")} />
                <Value label="首次发现来源" value={warningSourceTypeLabels[warning.sourceType]} />
                <div className="sm:col-span-2"><Value label="测评摘要" value={warning.assessmentSummary} /></div>
                <div className="sm:col-span-2"><Value label="AI 线索摘要" value={warning.aiSummary} /></div>
              </div>
            </Section>

            <Section count={feedbackRequests.length} title="班主任反馈请求">
              {feedbackRequests.length ? (
                <div className="space-y-2">
                  {feedbackRequests.map((request) => (
                    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm" key={request.id}>
                      <div className="flex justify-between gap-3"><strong>{request.requestedBy}</strong><span className="text-xs text-neutral-500">{request.requestedAt}</span></div>
                      <p className="mt-2 text-neutral-700">要求：{request.requestNote}</p>
                      <p className="mt-1 text-neutral-700">截止时间：{request.deadline}</p>
                      <p className="mt-1 text-neutral-700">状态：{request.status === "overdue" ? "已超时" : request.status === "completed" ? "已反馈" : "进行中"}</p>
                    </div>
                  ))}
                </div>
              ) : <Empty text="暂无反馈请求记录" />}
            </Section>

            <Section count={feedbackRecords.length} title="班主任反馈">
              {feedbackRecords.length ? (
                <div className="space-y-2">
                  {feedbackRecords.map((record) => (
                    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm" key={record.id}>
                      <div className="flex justify-between gap-3"><strong>{record.authorRole} · {record.authorName}</strong><span className="text-xs text-neutral-500">{record.submittedAt}</span></div>
                      <p className="mt-2 leading-6 text-neutral-700">{record.content}</p>
                    </div>
                  ))}
                </div>
              ) : <Empty text="暂无班主任反馈" />}
            </Section>

            <Section count={interventions.length} title="干预记录">
              {interventions.length ? (
                <div className="space-y-2">
                  {interventions.map((record) => (
                    <div className="grid gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm sm:grid-cols-2" key={record.id}>
                      <Value label="干预时间 / 记录人" value={`${record.occurredAt} · ${record.authorName}`} />
                      <Value label="干预方式" value={record.method} />
                      <Value label="情况摘要" value={record.summary} />
                      <Value label="本次判断" value={record.judgment} />
                      <div className="sm:col-span-2"><Value label="后续计划" value={record.followUpPlan} /></div>
                    </div>
                  ))}
                </div>
              ) : <Empty text="暂无干预记录" />}
            </Section>

            <Section count={retests.length} title="复测记录">
              {retests.length ? (
                <div className="space-y-2">
                  {retests.map((record) => (
                    <div className="grid gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm sm:grid-cols-2" key={record.id}>
                      <Value label="安排 / 计划时间" value={`${record.arrangedAt} / ${record.plannedAt}`} />
                      <Value label="完成时间" value={record.completedAt} />
                      <Value label="复测量表" value={record.scaleNames.join("、")} />
                      <Value label="结果摘要" value={record.resultSummary} />
                      <Value label="对比结果" value={record.comparison} />
                      <Value label="补充说明" value={record.note} />
                    </div>
                  ))}
                </div>
              ) : <Empty text="暂无复测记录" />}
            </Section>

            <Section count={referrals.length} title="转介记录">
              {referrals.length ? (
                <div className="space-y-2">
                  {referrals.map((record) => (
                    <div className="grid gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm sm:grid-cols-2" key={record.id}>
                      <Value label="转介时间 / 类型" value={`${record.referredAt} · ${record.referralType}`} />
                      <Value label="转介机构" value={record.organization} />
                      <Value label="转介原因" value={record.reason} />
                      <Value label="结果记录时间" value={record.resultRecordedAt} />
                      <div className="sm:col-span-2"><Value label="结果摘要" value={record.resultSummary} /></div>
                    </div>
                  ))}
                </div>
              ) : <Empty text="暂无转介记录" />}
            </Section>

            <ProcessTimeline items={warning.timeline} />
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 border-t border-neutral-200 bg-white px-6 py-4">
          <Button onClick={() => onOpenChange(false)} type="button">关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
