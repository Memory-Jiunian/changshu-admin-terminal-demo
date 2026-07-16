import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { assessmentScaleOptions } from "@/data/assessmentScaleMock";
import { cn } from "@/lib/utils";
import {
  getFeedbackActionAvailability,
  getObservationFeedbackActionAvailability,
} from "@/lib/warning-feedback";
import { getLatestCompletedRetest } from "@/lib/warning-retests";
import { formatDateTimeInput, getMockDateTimeInput } from "@/lib/warning-time";
import type {
  RetestStatusOutcome,
  WarningActionResponse,
  WarningActionSubmission,
  WarningActionType,
  WarningItem,
  InterventionNextPlan,
} from "@/types/warning";

export type WarningFormActionType = Exclude<
  WarningActionType,
  | "confirm_formal_warning"
  | "view_retest_result"
  | "view_archive"
>;

type WarningActionDialogProps = {
  action: WarningFormActionType | null;
  warning: WarningItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: WarningActionSubmission) => WarningActionResponse;
};

type FormState = {
  endReason: string;
  observationNote: string;
  nextReviewAt: string;
  feedbackRequestNote: string;
  feedbackDeadline: string;
  occurredAt: string;
  method: string;
  summary: string;
  judgment: string;
  followUpPlan: string;
  arrangedAt: string;
  plannedAt: string;
  scaleIds: string[];
  note: string;
  referralType: string;
  organization: string;
  reason: string;
  followUpOccurredAt: string;
  followUpAuthorName: string;
  followUpSummary: string;
  followUpConclusion: string;
  appointmentId: string;
  appointmentPlannedAt: string;
  appointmentLocation: string;
  appointmentResponsibleTeacher: string;
  appointmentEscortTeacher: string;
  nextPlan: InterventionNextPlan | "";
  requestFeedback: boolean;
  outcome: RetestStatusOutcome | "";
};

const dialogTitles: Record<WarningFormActionType, string> = {
  end_review: "结束本次线索处理",
  continue_observation: "继续观察",
  request_feedback: "请求补充反馈",
  record_intervention: "记录干预",
  add_intervention: "记录干预结果",
  schedule_intervention: "预约干预",
  record_intervention_result: "记录干预结果",
  mark_intervention_no_show: "确认未到场并重新预约",
  reschedule_intervention: "调整干预预约",
  cancel_intervention: "取消干预预约",
  schedule_retest: "安排复测",
  start_referral: "发起转介",
  update_retest_status: "更新复测后状态",
  add_referral_follow_up: "新增转介跟进",
};

const outcomeOptions: Array<{ value: RetestStatusOutcome; label: string }> = [
  { value: "close", label: "风险解除并闭环" },
  { value: "continue_intervention", label: "继续干预" },
  { value: "referral", label: "转介" },
];

function getInitialForm(warning?: WarningItem | null): FormState {
  const now = getMockDateTimeInput();
  const latestRetest = warning
    ? [...warning.retestRecords].sort((left, right) =>
        right.arrangedAt.localeCompare(left.arrangedAt),
      )[0]
    : undefined;
  const activeAppointment = warning
    ? [...warning.interventionAppointments]
        .filter((item) => item.status === "planned")
        .sort((left, right) => right.plannedAt.localeCompare(left.plannedAt))[0]
    : undefined;
  return {
    endReason: "",
    observationNote: "",
    nextReviewAt: "",
    feedbackRequestNote: "",
    feedbackDeadline: "",
    occurredAt: now,
    method: "",
    summary: "",
    judgment: "",
    followUpPlan: "",
    arrangedAt: now,
    plannedAt: "",
    scaleIds: latestRetest?.scaleIds ?? [assessmentScaleOptions[0].id],
    note: "",
    referralType: "",
    organization: "",
    reason: "",
    followUpOccurredAt: now,
    followUpAuthorName: warning?.responsibleTeacher ?? "",
    followUpSummary: "",
    followUpConclusion: "",
    appointmentId: activeAppointment?.id ?? "",
    appointmentPlannedAt: "",
    appointmentLocation: activeAppointment?.location ?? "心理咨询室",
    appointmentResponsibleTeacher: warning?.responsibleTeacher ?? "",
    appointmentEscortTeacher: warning?.headTeacherName ?? "",
    nextPlan: "",
    requestFeedback: true,
    outcome: "",
  };
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-neutral-900">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <div className="mt-2">{children}</div>
      {error ? <span className="mt-1 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function TextArea({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      className="min-h-20 w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      value={value}
    />
  );
}

export function WarningActionDialog({
  action,
  warning,
  open,
  onOpenChange,
  onSubmit,
}: WarningActionDialogProps) {
  const [form, setForm] = useState<FormState>(() => getInitialForm(warning));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const submitLockedRef = useRef(false);

  useEffect(() => {
    if (open) {
      setForm(getInitialForm(warning));
      setErrors({});
      setFormError("");
      submitLockedRef.current = false;
    }
  }, [action, open, warning?.id]);

  if (!action || !warning) {
    return null;
  }

  const latestRetest = getLatestCompletedRetest(warning);
  const canUpdateRetest = Boolean(latestRetest?.completedAt);
  const hasReferral = warning.referralRecords.length > 0;
  const actionTime = formatDateTimeInput(getMockDateTimeInput());
  const dialogTitle = action === "request_feedback" &&
    getFeedbackActionAvailability(warning, actionTime).kind === "rerequest"
      ? "重新请求反馈"
      : action === "continue_observation" &&
          getObservationFeedbackActionAvailability(warning, actionTime).kind === "rerequest"
        ? "重新请求反馈并更新观察计划"
        : dialogTitles[action];

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setFormError("");
  }

  function requireFields(fields: Array<keyof FormState>) {
    const nextErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (!String(form[field]).trim()) {
        nextErrors[field] = "此项为必填项。";
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function buildSubmission(): WarningActionSubmission | null {
    switch (action) {
      case "end_review":
        return requireFields(["endReason"])
          ? { type: action, values: { endReason: form.endReason.trim() } }
          : null;
      case "continue_observation":
        if (!requireFields(["observationNote", "nextReviewAt", "feedbackRequestNote", "feedbackDeadline"])) {
          return null;
        }
        if (formatDateTimeInput(form.nextReviewAt) <= formatDateTimeInput(getMockDateTimeInput()) ||
          formatDateTimeInput(form.feedbackDeadline) <= formatDateTimeInput(getMockDateTimeInput())) {
          setErrors({ nextReviewAt: "时间必须晚于当前时间。", feedbackDeadline: "时间必须晚于当前时间。" });
          return null;
        }
        return {
          type: action,
          values: {
            observationNote: form.observationNote.trim(),
            nextReviewAt: formatDateTimeInput(form.nextReviewAt),
            feedbackRequestNote: form.feedbackRequestNote.trim(),
            feedbackDeadline: formatDateTimeInput(form.feedbackDeadline),
          },
        };
      case "request_feedback":
        if (!requireFields(["feedbackRequestNote", "feedbackDeadline"])) {
          return null;
        }
        if (formatDateTimeInput(form.feedbackDeadline) <= formatDateTimeInput(getMockDateTimeInput())) {
          setErrors({ feedbackDeadline: "反馈截止时间必须晚于当前时间。" });
          return null;
        }
        return {
              type: action,
              values: {
                feedbackRequestNote: form.feedbackRequestNote.trim(),
                feedbackDeadline: formatDateTimeInput(form.feedbackDeadline),
              },
            };
      case "record_intervention":
      case "add_intervention":
        return requireFields(["occurredAt", "method", "summary", "judgment", "followUpPlan"])
          ? {
              type: action,
              values: {
                occurredAt: formatDateTimeInput(form.occurredAt),
                method: form.method.trim(),
                summary: form.summary.trim(),
                judgment: form.judgment.trim(),
                followUpPlan: form.followUpPlan.trim(),
              },
            }
          : null;
      case "schedule_intervention":
      case "mark_intervention_no_show":
      case "reschedule_intervention": {
        const requiredFields: Array<keyof FormState> = [
          "appointmentPlannedAt", "appointmentLocation", "appointmentResponsibleTeacher",
        ];
        if (action !== "schedule_intervention") requiredFields.push("appointmentId");
        if (!requireFields(requiredFields)) return null;
        const appointment = {
          plannedAt: formatDateTimeInput(form.appointmentPlannedAt),
          location: form.appointmentLocation.trim(),
          responsibleTeacher: form.appointmentResponsibleTeacher.trim(),
          escortTeacher: form.appointmentEscortTeacher.trim(),
          note: form.note.trim(),
          notificationOffsetsMinutes: [1440, 120],
        };
        if (appointment.plannedAt <= formatDateTimeInput(getMockDateTimeInput())) {
          setErrors({ appointmentPlannedAt: "计划时间必须晚于当前时间。" });
          return null;
        }
        return action === "schedule_intervention"
          ? { type: action, values: appointment }
          : { type: action, values: { appointmentId: form.appointmentId, appointment } };
      }
      case "cancel_intervention":
        return requireFields(["appointmentId", "reason"])
          ? { type: action, values: { appointmentId: form.appointmentId, reason: form.reason.trim() } }
          : null;
      case "record_intervention_result": {
        if (!requireFields(["appointmentId", "occurredAt", "method", "summary", "judgment", "nextPlan"])) return null;
        const base = {
          appointmentId: form.appointmentId,
          occurredAt: formatDateTimeInput(form.occurredAt),
          method: form.method.trim(),
          summary: form.summary.trim(),
          judgment: form.judgment.trim(),
          nextPlan: form.nextPlan as InterventionNextPlan,
          requestFeedback: form.requestFeedback,
        };
        if (form.nextPlan === "continue_intervention") {
          if (!requireFields(["appointmentPlannedAt", "appointmentLocation", "appointmentResponsibleTeacher"])) return null;
          if (form.requestFeedback && !requireFields(["feedbackRequestNote", "feedbackDeadline"])) return null;
          return {
            type: action,
            values: {
              ...base,
              nextAppointment: {
                plannedAt: formatDateTimeInput(form.appointmentPlannedAt),
                location: form.appointmentLocation.trim(),
                responsibleTeacher: form.appointmentResponsibleTeacher.trim(),
                escortTeacher: form.appointmentEscortTeacher.trim(),
                note: form.note.trim(),
                notificationOffsetsMinutes: [1440, 120],
              },
              feedbackRequestNote: form.feedbackRequestNote.trim(),
              feedbackDeadline: form.feedbackDeadline ? formatDateTimeInput(form.feedbackDeadline) : undefined,
            },
          };
        }
        if (form.nextPlan === "schedule_retest") {
          if (!requireFields(["plannedAt"]) || form.scaleIds.length === 0) return null;
          return {
            type: action,
            values: {
              ...base,
              requestFeedback: false,
              retest: {
                plannedAt: formatDateTimeInput(form.plannedAt),
                scaleIds: form.scaleIds,
                scaleNames: assessmentScaleOptions.filter((item) => form.scaleIds.includes(item.id)).map((item) => item.name),
                note: form.note.trim(),
              },
            },
          };
        }
        if (!requireFields(["referralType", "reason"])) return null;
        return {
          type: action,
          values: {
            ...base,
            requestFeedback: false,
            referral: { referralType: form.referralType.trim(), organization: form.organization.trim(), reason: form.reason.trim() },
          },
        };
      }
      case "schedule_retest":
        if (!requireFields(["arrangedAt", "plannedAt"])) {
          return null;
        }
        if (form.scaleIds.length === 0) {
          setErrors({ scaleIds: "请至少选择一项复测量表。" });
          return null;
        }
        if (formatDateTimeInput(form.plannedAt) <= formatDateTimeInput(form.arrangedAt)) {
          setErrors({ plannedAt: "计划复测时间必须晚于安排时间。" });
          return null;
        }
        return {
              type: action,
              values: {
                arrangedAt: formatDateTimeInput(form.arrangedAt),
                plannedAt: formatDateTimeInput(form.plannedAt),
                scaleIds: form.scaleIds,
                scaleNames: assessmentScaleOptions
                  .filter((scale) => form.scaleIds.includes(scale.id))
                  .map((scale) => scale.name),
                note: form.note.trim(),
              },
            };
      case "start_referral":
        return requireFields(["referralType", "reason"])
          ? {
              type: action,
              values: {
                referralType: form.referralType.trim(),
                organization: form.organization.trim(),
                reason: form.reason.trim(),
              },
            }
          : null;
      case "add_referral_follow_up":
        if (!hasReferral) {
          setFormError("当前没有可跟进的转介记录。");
          return null;
        }
        return requireFields(["followUpOccurredAt", "followUpAuthorName", "followUpSummary", "followUpConclusion"])
          ? {
              type: action,
              values: {
                occurredAt: formatDateTimeInput(form.followUpOccurredAt),
                authorName: form.followUpAuthorName.trim(),
                summary: form.followUpSummary.trim(),
                conclusion: form.followUpConclusion.trim(),
              },
            }
          : null;
      case "update_retest_status":
        if (!canUpdateRetest) {
          setFormError("最近一次复测尚未完成，不能更新状态。");
          return null;
        }
        return requireFields(["outcome"])
          ? { type: action, values: { outcome: form.outcome as RetestStatusOutcome } }
          : null;
      default:
        return null;
    }
  }

  function handleSubmit() {
    if (submitLockedRef.current) {
      return;
    }
    const submission = buildSubmission();
    if (!submission) {
      return;
    }

    submitLockedRef.current = true;
    const result = onSubmit(submission);
    if (!result.success) {
      submitLockedRef.current = false;
      setFormError(result.message);
      return;
    }
    onOpenChange(false);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[82vh] max-w-[560px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {warning.studentName} · {warning.gradeClass}。提交后将同步更新列表与详情。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {action === "end_review" ? (
            <Field error={errors.endReason} label="结束原因" required>
              <TextArea
                onChange={(value) => updateField("endReason", value)}
                placeholder="说明本次不形成正式预警的依据"
                value={form.endReason}
              />
            </Field>
          ) : null}

          {action === "continue_observation" ? (
            <>
              <Field error={errors.observationNote} label="观察说明" required>
                <TextArea onChange={(value) => updateField("observationNote", value)} placeholder="记录继续观察的事实依据" value={form.observationNote} />
              </Field>
              <Field error={errors.nextReviewAt} label="下次复核时间" required>
                <Input onChange={(event) => updateField("nextReviewAt", event.target.value)} type="datetime-local" value={form.nextReviewAt} />
              </Field>
              <div className="grid grid-cols-2 gap-3 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                <span>协作对象：{warning.headTeacherName}</span>
                <span>联系电话：{warning.headTeacherPhone}</span>
              </div>
              <Field error={errors.feedbackRequestNote} label="观察反馈要求" required>
                <TextArea onChange={(value) => updateField("feedbackRequestNote", value)} placeholder="说明需要班主任持续观察的事实内容" value={form.feedbackRequestNote} />
              </Field>
              <Field error={errors.feedbackDeadline} label="反馈截止时间" required>
                <Input onChange={(event) => updateField("feedbackDeadline", event.target.value)} type="datetime-local" value={form.feedbackDeadline} />
              </Field>
            </>
          ) : null}

          {action === "request_feedback" ? (
            <>
              <div className="grid grid-cols-2 gap-3 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                <span>协作对象：{warning.headTeacherName}</span>
                <span>联系电话：{warning.headTeacherPhone}</span>
              </div>
              <Field error={errors.feedbackRequestNote} label="补充反馈要求" required>
                <TextArea onChange={(value) => updateField("feedbackRequestNote", value)} placeholder="说明需要班主任补充的事实观察" value={form.feedbackRequestNote} />
              </Field>
              <Field error={errors.feedbackDeadline} label="反馈截止时间" required>
                <Input onChange={(event) => updateField("feedbackDeadline", event.target.value)} type="datetime-local" value={form.feedbackDeadline} />
              </Field>
            </>
          ) : null}

          {action === "record_intervention" || action === "add_intervention" ? (
            <>
              <Field error={errors.occurredAt} label="干预时间" required>
                <Input onChange={(event) => updateField("occurredAt", event.target.value)} type="datetime-local" value={form.occurredAt} />
              </Field>
              <Field error={errors.method} label="干预方式" required>
                <Input onChange={(event) => updateField("method", event.target.value)} placeholder="例如：个体访谈" value={form.method} />
              </Field>
              <Field error={errors.summary} label="情况摘要" required>
                <TextArea onChange={(value) => updateField("summary", value)} placeholder="记录本次干预的事实情况" value={form.summary} />
              </Field>
              <Field error={errors.judgment} label="本次判断" required>
                <TextArea onChange={(value) => updateField("judgment", value)} placeholder="记录心理老师本次专业判断" value={form.judgment} />
              </Field>
              <Field error={errors.followUpPlan} label="后续计划" required>
                <TextArea onChange={(value) => updateField("followUpPlan", value)} placeholder="记录后续跟进计划" value={form.followUpPlan} />
              </Field>
            </>
          ) : null}

          {action === "schedule_intervention" || action === "mark_intervention_no_show" || action === "reschedule_intervention" ? (
            <>
              {action !== "schedule_intervention" ? (
                <div className="rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                  原预约：{warning.interventionAppointments.find((item) => item.id === form.appointmentId)?.plannedAt ?? "未找到"}
                </div>
              ) : null}
              <Field error={errors.appointmentPlannedAt} label={action === "schedule_intervention" ? "计划干预时间" : "新的干预时间"} required>
                <Input onChange={(event) => updateField("appointmentPlannedAt", event.target.value)} type="datetime-local" value={form.appointmentPlannedAt} />
              </Field>
              <Field error={errors.appointmentLocation} label="干预地点" required>
                <Input onChange={(event) => updateField("appointmentLocation", event.target.value)} value={form.appointmentLocation} />
              </Field>
              <Field error={errors.appointmentResponsibleTeacher} label="负责心理老师" required>
                <Input onChange={(event) => updateField("appointmentResponsibleTeacher", event.target.value)} value={form.appointmentResponsibleTeacher} />
              </Field>
              <Field label="陪同老师">
                <Input onChange={(event) => updateField("appointmentEscortTeacher", event.target.value)} value={form.appointmentEscortTeacher} />
              </Field>
              <Field label="补充说明">
                <TextArea onChange={(value) => updateField("note", value)} placeholder="选填" value={form.note} />
              </Field>
              <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">
                将生成提前 24 小时和 2 小时的模拟通知计划；当前 Demo 不发送真实通知。
              </div>
            </>
          ) : null}

          {action === "cancel_intervention" ? (
            <>
              <div className="rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                预约时间：{warning.interventionAppointments.find((item) => item.id === form.appointmentId)?.plannedAt ?? "未找到"}
              </div>
              <Field error={errors.reason} label="取消原因" required>
                <TextArea onChange={(value) => updateField("reason", value)} placeholder="说明本次取消原因" value={form.reason} />
              </Field>
            </>
          ) : null}

          {action === "record_intervention_result" ? (
            <>
              <div className="rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                当前预约：{warning.interventionAppointments.find((item) => item.id === form.appointmentId)?.plannedAt ?? "未找到"}
              </div>
              <Field error={errors.occurredAt} label="实际干预时间" required>
                <Input onChange={(event) => updateField("occurredAt", event.target.value)} type="datetime-local" value={form.occurredAt} />
              </Field>
              <Field error={errors.method} label="干预方式" required>
                <Input onChange={(event) => updateField("method", event.target.value)} placeholder="例如：个体访谈" value={form.method} />
              </Field>
              <Field error={errors.summary} label="情况摘要" required>
                <TextArea onChange={(value) => updateField("summary", value)} placeholder="记录本次干预事实" value={form.summary} />
              </Field>
              <Field error={errors.judgment} label="本次判断" required>
                <TextArea onChange={(value) => updateField("judgment", value)} placeholder="记录心理老师专业结论" value={form.judgment} />
              </Field>
              <Field error={errors.nextPlan} label="下一步计划" required>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ["continue_intervention", "继续干预"],
                    ["schedule_retest", "安排复测"],
                    ["referral", "发起转介"],
                  ] as const).map(([value, label]) => (
                    <Button className={cn(form.nextPlan === value && "bg-neutral-900 text-white hover:bg-neutral-800")} key={value} onClick={() => updateField("nextPlan", value)} type="button" variant="outline">{label}</Button>
                  ))}
                </div>
              </Field>

              {form.nextPlan === "continue_intervention" ? (
                <>
                  <Field error={errors.appointmentPlannedAt} label="下一次干预时间" required>
                    <Input onChange={(event) => updateField("appointmentPlannedAt", event.target.value)} type="datetime-local" value={form.appointmentPlannedAt} />
                  </Field>
                  <Field error={errors.appointmentLocation} label="干预地点" required>
                    <Input onChange={(event) => updateField("appointmentLocation", event.target.value)} value={form.appointmentLocation} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field error={errors.appointmentResponsibleTeacher} label="负责心理老师" required>
                      <Input onChange={(event) => updateField("appointmentResponsibleTeacher", event.target.value)} value={form.appointmentResponsibleTeacher} />
                    </Field>
                    <Field label="陪同老师">
                      <Input onChange={(event) => updateField("appointmentEscortTeacher", event.target.value)} value={form.appointmentEscortTeacher} />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 rounded-md border border-neutral-200 p-3 text-sm">
                    <input checked={form.requestFeedback} onChange={(event) => updateField("requestFeedback", event.target.checked)} type="checkbox" />
                    同时请求班主任反馈（默认开启）
                  </label>
                  {form.requestFeedback ? (
                    <>
                      <Field error={errors.feedbackRequestNote} label="反馈要求" required>
                        <TextArea onChange={(value) => updateField("feedbackRequestNote", value)} placeholder="说明需要班主任观察的事实内容" value={form.feedbackRequestNote} />
                      </Field>
                      <Field error={errors.feedbackDeadline} label="反馈截止时间" required>
                        <Input onChange={(event) => updateField("feedbackDeadline", event.target.value)} type="datetime-local" value={form.feedbackDeadline} />
                      </Field>
                    </>
                  ) : null}
                </>
              ) : null}

              {form.nextPlan === "schedule_retest" ? (
                <>
                  <Field error={errors.scaleIds} label="复测量表" required>
                    <div className="grid gap-2">
                      {assessmentScaleOptions.map((scale) => {
                        const selected = form.scaleIds.includes(scale.id);
                        return <Button className={cn("justify-start", selected && "bg-neutral-900 text-white hover:bg-neutral-800")} key={scale.id} onClick={() => updateField("scaleIds", selected ? form.scaleIds.filter((id) => id !== scale.id) : [...form.scaleIds, scale.id])} type="button" variant="outline">{scale.name}</Button>;
                      })}
                    </div>
                  </Field>
                  <Field error={errors.plannedAt} label="计划复测时间" required>
                    <Input onChange={(event) => updateField("plannedAt", event.target.value)} type="datetime-local" value={form.plannedAt} />
                  </Field>
                </>
              ) : null}

              {form.nextPlan === "referral" ? (
                <>
                  <Field error={errors.referralType} label="转介类型" required><Input onChange={(event) => updateField("referralType", event.target.value)} value={form.referralType} /></Field>
                  <Field label="转介机构"><Input onChange={(event) => updateField("organization", event.target.value)} value={form.organization} /></Field>
                  <Field error={errors.reason} label="转介原因" required><TextArea onChange={(value) => updateField("reason", value)} placeholder="记录专业依据" value={form.reason} /></Field>
                </>
              ) : null}
            </>
          ) : null}

          {action === "schedule_retest" ? (
            <>
              <Field error={errors.arrangedAt} label="安排时间" required>
                <Input readOnly type="datetime-local" value={form.arrangedAt} />
                <span className="mt-1 block text-xs text-neutral-500">由系统自动记录</span>
              </Field>
              <Field error={errors.scaleIds} label="复测量表" required>
                <div className="grid gap-2">
                  {assessmentScaleOptions.map((scale) => {
                    const selected = form.scaleIds.includes(scale.id);
                    return (
                      <Button
                        aria-pressed={selected}
                        className={cn("justify-start", selected && "bg-neutral-900 text-white hover:bg-neutral-800")}
                        key={scale.id}
                        onClick={() =>
                          updateField(
                            "scaleIds",
                            selected
                              ? form.scaleIds.filter((id) => id !== scale.id)
                              : [...form.scaleIds, scale.id],
                          )
                        }
                        type="button"
                        variant="outline"
                      >
                        {scale.name}
                      </Button>
                    );
                  })}
                </div>
              </Field>
              <Field error={errors.plannedAt} label="计划复测时间" required>
                <Input onChange={(event) => updateField("plannedAt", event.target.value)} type="datetime-local" value={form.plannedAt} />
              </Field>
              <Field label="补充说明">
                <TextArea onChange={(value) => updateField("note", value)} placeholder="选填" value={form.note} />
              </Field>
            </>
          ) : null}

          {action === "start_referral" ? (
            <>
              <Field error={errors.referralType} label="转介类型" required>
                <Input onChange={(event) => updateField("referralType", event.target.value)} placeholder="例如：医疗转介" value={form.referralType} />
              </Field>
              <Field label="转介机构">
                <Input onChange={(event) => updateField("organization", event.target.value)} placeholder="选填" value={form.organization} />
              </Field>
              <Field error={errors.reason} label="转介原因" required>
                <TextArea onChange={(value) => updateField("reason", value)} placeholder="记录发起转介的专业依据" value={form.reason} />
              </Field>
            </>
          ) : null}

          {action === "add_referral_follow_up" ? (
            <>
              {!hasReferral ? <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">当前没有可跟进的转介记录。</div> : null}
              <Field error={errors.followUpOccurredAt} label="跟进时间" required>
                <Input onChange={(event) => updateField("followUpOccurredAt", event.target.value)} type="datetime-local" value={form.followUpOccurredAt} />
              </Field>
              <Field error={errors.followUpAuthorName} label="记录人" required>
                <Input onChange={(event) => updateField("followUpAuthorName", event.target.value)} value={form.followUpAuthorName} />
              </Field>
              <Field error={errors.followUpSummary} label="跟进摘要" required>
                <TextArea onChange={(value) => updateField("followUpSummary", value)} placeholder="记录本次外部转介跟进情况" value={form.followUpSummary} />
              </Field>
              <Field error={errors.followUpConclusion} label="专业结论" required>
                <TextArea onChange={(value) => updateField("followUpConclusion", value)} placeholder="记录心理老师对本次跟进的专业结论" value={form.followUpConclusion} />
              </Field>
            </>
          ) : null}

          {action === "update_retest_status" ? (
            <>
              {!canUpdateRetest ? <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">复测尚未完成，当前不能更新状态。</div> : null}
              <Field error={errors.outcome} label="状态更新结果" required>
                <div className="grid gap-2">
                  {outcomeOptions.map((option) => (
                    <Button
                      aria-pressed={form.outcome === option.value}
                      className={cn("justify-start", form.outcome === option.value && "bg-neutral-900 text-white hover:bg-neutral-800")}
                      key={option.value}
                      onClick={() => updateField("outcome", option.value)}
                      type="button"
                      variant="outline"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </Field>
            </>
          ) : null}

          {formError ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{formError}</div> : null}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">取消</Button>
          <Button className="bg-neutral-900 text-white hover:bg-neutral-800" onClick={handleSubmit} type="button">确认提交</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
