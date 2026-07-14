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
import { cn } from "@/lib/utils";
import { formatDateTimeInput, getMockDateTimeInput } from "@/lib/warning-time";
import type {
  RetestStatusOutcome,
  WarningActionResponse,
  WarningActionSubmission,
  WarningActionType,
  WarningItem,
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
  note: string;
  referralType: string;
  organization: string;
  reason: string;
  resultRecordedAt: string;
  resultSummary: string;
  outcome: RetestStatusOutcome | "";
};

const dialogTitles: Record<WarningFormActionType, string> = {
  end_review: "结束本次线索处理",
  continue_observation: "继续观察",
  request_feedback: "请求补充反馈",
  record_intervention: "记录干预",
  add_intervention: "新增干预记录",
  schedule_retest: "安排复测",
  start_referral: "发起转介",
  update_retest_status: "更新复测后状态",
  record_referral_result: "记录转介结果",
};

const outcomeOptions: Array<{ value: RetestStatusOutcome; label: string }> = [
  { value: "close", label: "风险解除并闭环" },
  { value: "continue_intervention", label: "继续干预" },
  { value: "referral", label: "转介" },
];

function getInitialForm(): FormState {
  const now = getMockDateTimeInput();
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
    note: "",
    referralType: "",
    organization: "",
    reason: "",
    resultRecordedAt: now,
    resultSummary: "",
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
  const [form, setForm] = useState<FormState>(getInitialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const submitLockedRef = useRef(false);

  useEffect(() => {
    if (open) {
      setForm(getInitialForm());
      setErrors({});
      setFormError("");
      submitLockedRef.current = false;
    }
  }, [action, open, warning?.id]);

  if (!action || !warning) {
    return null;
  }

  const latestRetest = [...warning.retestRecords].sort((left, right) =>
    right.arrangedAt.localeCompare(left.arrangedAt),
  )[0];
  const canUpdateRetest = Boolean(latestRetest?.completedAt);
  const hasPendingReferral = warning.referralRecords.some((record) => !record.resultRecordedAt);

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
        return requireFields(["observationNote", "nextReviewAt"])
          ? {
              type: action,
              values: {
                observationNote: form.observationNote.trim(),
                nextReviewAt: formatDateTimeInput(form.nextReviewAt),
              },
            }
          : null;
      case "request_feedback":
        return requireFields(["feedbackRequestNote", "feedbackDeadline"])
          ? {
              type: action,
              values: {
                feedbackRequestNote: form.feedbackRequestNote.trim(),
                feedbackDeadline: formatDateTimeInput(form.feedbackDeadline),
              },
            }
          : null;
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
      case "schedule_retest":
        return requireFields(["arrangedAt", "plannedAt"])
          ? {
              type: action,
              values: {
                arrangedAt: formatDateTimeInput(form.arrangedAt),
                plannedAt: formatDateTimeInput(form.plannedAt),
                note: form.note.trim(),
              },
            }
          : null;
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
      case "record_referral_result":
        if (!hasPendingReferral) {
          setFormError("当前没有待记录结果的转介事项。");
          return null;
        }
        return requireFields(["resultRecordedAt", "resultSummary"])
          ? {
              type: action,
              values: {
                resultRecordedAt: formatDateTimeInput(form.resultRecordedAt),
                resultSummary: form.resultSummary.trim(),
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
          <DialogTitle>{dialogTitles[action]}</DialogTitle>
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
            </>
          ) : null}

          {action === "request_feedback" ? (
            <>
              <div className="rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-600">协作对象：对应班主任</div>
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

          {action === "schedule_retest" ? (
            <>
              <Field error={errors.arrangedAt} label="安排时间" required>
                <Input onChange={(event) => updateField("arrangedAt", event.target.value)} type="datetime-local" value={form.arrangedAt} />
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

          {action === "record_referral_result" ? (
            <>
              {!hasPendingReferral ? <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">当前没有待记录结果的转介事项。</div> : null}
              <Field error={errors.resultRecordedAt} label="结果记录时间" required>
                <Input onChange={(event) => updateField("resultRecordedAt", event.target.value)} type="datetime-local" value={form.resultRecordedAt} />
              </Field>
              <Field error={errors.resultSummary} label="转介结果摘要" required>
                <TextArea onChange={(value) => updateField("resultSummary", value)} placeholder="记录外部转介反馈" value={form.resultSummary} />
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
