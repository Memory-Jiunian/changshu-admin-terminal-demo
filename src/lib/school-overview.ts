import { getInterventionAppointmentTiming, getLatestPlannedInterventionAppointment } from "@/lib/intervention-appointments";
import { getEffectiveFeedbackStatus, getFeedbackDataIssues } from "@/lib/warning-feedback";
import { getLatestPlannedRetest, isRetestIncompleteAfterGrace } from "@/lib/warning-retests";
import type { StudentAssessmentRecord } from "@/types/assessment";
import type { StudentProfileRecord } from "@/types/studentProfile";
import {
  schoolRiskLevelLabels,
  schoolWarningSourceLabels,
  schoolWarningStatusLabels,
  type AttentionMetric,
  type DistributionItem,
  type GradeRiskDistribution,
  type OrganizationRiskRow,
  type SchoolOverviewDataIssue,
  type SchoolOverviewDataIssueCode,
  type SchoolOverviewModuleKey,
  type SchoolOverviewOrganizationFilter,
  type SchoolOverviewTermRange,
  type SchoolOverviewTrend,
  type SchoolOverviewViewModel,
} from "@/types/school-overview";
import type { ActiveWarningRiskLevel, WarningItem, WarningSourceType, WarningStatus } from "@/types/warning";

type BuildSchoolOverviewInput = {
  students: StudentProfileRecord[];
  assessments: StudentAssessmentRecord[];
  warnings: WarningItem[];
  currentTime: string;
  termRange: SchoolOverviewTermRange;
  organizationFilter: SchoolOverviewOrganizationFilter;
};

type IssueAccumulator = Map<string, SchoolOverviewDataIssue>;

const activeStatuses: WarningStatus[] = [
  "pending_review",
  "observing",
  "formal_warning",
  "in_intervention",
  "pending_retest",
  "referral",
];

const validConfirmedLevels: ActiveWarningRiskLevel[] = ["medium", "high", "critical"];

function addIssue(
  issues: IssueAccumulator,
  code: SchoolOverviewDataIssueCode,
  module: SchoolOverviewModuleKey,
  message: string,
  amount = 1,
) {
  const key = `${code}:${module}`;
  const existing = issues.get(key);
  issues.set(key, {
    code,
    module,
    message,
    affectedCount: (existing?.affectedCount ?? 0) + amount,
  });
}

function percentage(value: number, total: number) {
  return total === 0 ? 0 : Math.round((value / total) * 1000) / 10;
}

function inRange(value: string | undefined, range: SchoolOverviewTermRange) {
  if (!value) return false;
  const normalized = value.replace("T", " ");
  return normalized >= range.start && normalized <= range.end;
}

function monthKey(value: string | undefined) {
  return value?.replace("T", " ").slice(0, 7);
}

function buildMonths(range: SchoolOverviewTermRange) {
  const [startYear, startMonth] = range.start.slice(0, 7).split("-").map(Number);
  const [endYear, endMonth] = range.end.slice(0, 7).split("-").map(Number);
  const result: string[] = [];
  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    result.push(`${year}-${String(month).padStart(2, "0")}`);
    month += 1;
    if (month === 13) {
      year += 1;
      month = 1;
    }
  }
  return result;
}

function organizationMatches(student: StudentProfileRecord, filter: SchoolOverviewOrganizationFilter) {
  if (filter.level === "school") return true;
  if (student.currentGrade !== filter.grade) return false;
  return filter.level === "grade" || student.currentClass === filter.className;
}

function organizationLabel(filter: SchoolOverviewOrganizationFilter) {
  if (filter.level === "school") return "全校";
  if (filter.level === "grade") return filter.grade;
  return `${filter.grade} ${filter.className}`;
}

function getFormalWarningTime(warning: WarningItem) {
  return [...warning.timeline]
    .filter((item) => item.title === "确认正式预警")
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))[0]?.occurredAt;
}

function getClosedTime(warning: WarningItem) {
  return warning.endedAt ?? [...warning.timeline]
    .filter((item) => item.title === "完成闭环归档")
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))[0]?.occurredAt;
}

function getCurrentFeedbackRoundRecords(warning: WarningItem) {
  const latestRequest = [...warning.feedbackRequests]
    .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt))[0];
  if (!latestRequest) return [];
  return warning.feedbackRecords.filter((record) => record.requestId === latestRequest.id);
}

function hasFeedbackReadForCurrentRound(warning: WarningItem) {
  const records = getCurrentFeedbackRoundRecords(warning);
  return records.length > 0 && records.every((record) => Boolean(record.psychologistReadAt));
}

export function getFeedbackReadUnscheduledInterventionCount(warnings: WarningItem[]) {
  return warnings.filter((warning) =>
    warning.isActive
    && warning.currentStatus === "formal_warning"
    && !getLatestPlannedInterventionAppointment(warning.interventionAppointments)
    && hasFeedbackReadForCurrentRound(warning),
  ).length;
}

function isInterventionConfirmationRequired(warning: WarningItem, currentTime: string) {
  if (!warning.isActive || warning.currentStatus !== "in_intervention") return false;
  const appointment = getLatestPlannedInterventionAppointment(warning.interventionAppointments);
  return appointment
    ? getInterventionAppointmentTiming(appointment, currentTime) === "confirmation_required"
    : false;
}

function isRetestOverdueIncomplete(warning: WarningItem, currentTime: string) {
  if (!warning.isActive || warning.currentStatus !== "pending_retest") return false;
  const planned = getLatestPlannedRetest(warning);
  return planned ? isRetestIncompleteAfterGrace(planned, currentTime) : false;
}

function dateTimeMs(value: string) {
  const result = Date.parse(value.replace(" ", "T"));
  return Number.isNaN(result) ? undefined : result;
}

function buildGradeRiskDistribution(
  enrolledStudents: StudentProfileRecord[],
  confirmedWarnings: WarningItem[],
  suppressed: boolean,
): GradeRiskDistribution {
  if (suppressed) {
    return {
      totalStudentCount: null,
      totalStudentDisplay: "少量",
      items: [],
      isSuppressed: true,
      accessibleSummary: "当前班级风险学生为少量，年级构成精确值已隐藏。",
    };
  }

  const warningByStudent = new Map(confirmedWarnings.map((warning) => [warning.studentId, warning]));
  const groups = new Map<string, { studentCount: number; highAndCriticalCount: number }>();
  enrolledStudents.forEach((student) => {
    const warning = warningByStudent.get(student.studentId);
    if (!warning?.confirmedRiskLevel || !student.currentGrade) return;
    const current = groups.get(student.currentGrade) ?? { studentCount: 0, highAndCriticalCount: 0 };
    current.studentCount += 1;
    if (warning.confirmedRiskLevel === "high" || warning.confirmedRiskLevel === "critical") {
      current.highAndCriticalCount += 1;
    }
    groups.set(student.currentGrade, current);
  });

  const total = [...groups.values()].reduce((sum, item) => sum + item.studentCount, 0);
  const sorted = [...groups.entries()].sort((left, right) =>
    right[1].studentCount - left[1].studentCount || left[0].localeCompare(right[0]),
  );
  const visible = sorted.length > 5
    ? [
        ...sorted.slice(0, 4),
        ["其他", sorted.slice(4).reduce((result, [, item]) => ({
          studentCount: result.studentCount + item.studentCount,
          highAndCriticalCount: result.highAndCriticalCount + item.highAndCriticalCount,
        }), { studentCount: 0, highAndCriticalCount: 0 })] as const,
      ]
    : sorted;
  const items = visible.map(([label, value]) => ({
    id: label === "其他" ? "other" : label,
    label,
    studentCount: value.studentCount,
    percentage: percentage(value.studentCount, total),
    highAndCriticalCount: value.highAndCriticalCount,
  }));

  return {
    totalStudentCount: total,
    totalStudentDisplay: String(total),
    items,
    isSuppressed: false,
    accessibleSummary: total === 0
      ? "当前范围暂无心理老师确认的活动风险学生。"
      : `当前确认风险学生共 ${total} 人。${items.map((item) => `${item.label} ${item.studentCount} 人，占 ${item.percentage}%，其中高及危险 ${item.highAndCriticalCount} 人`).join("；")}。`,
  };
}

function buildFilterOptions(students: StudentProfileRecord[]) {
  const enrolled = students.filter((student) => student.enrollmentStatus === "enrolled");
  const grades = [...new Set(enrolled.map((student) => student.currentGrade).filter(Boolean))].sort();
  const classesByGrade = Object.fromEntries(grades.map((grade) => [
    grade,
    [...new Set(enrolled
      .filter((student) => student.currentGrade === grade)
      .map((student) => student.currentClass)
      .filter(Boolean))].sort(),
  ]));
  return { grades, classesByGrade };
}

function buildOrganizationRows(
  scopedEnrolledStudents: StudentProfileRecord[],
  confirmedWarnings: WarningItem[],
  filter: SchoolOverviewOrganizationFilter,
) {
  const riskByStudent = new Map(confirmedWarnings.map((warning) => [warning.studentId, warning.confirmedRiskLevel!]));
  const units = filter.level === "school"
    ? [...new Set(scopedEnrolledStudents.map((student) => student.currentGrade))].map((label) => ({ level: "grade" as const, label }))
    : [...new Set(scopedEnrolledStudents.map((student) => student.currentClass))].map((label) => ({ level: "class" as const, label }));

  return units
    .map((unit) => {
      const students = scopedEnrolledStudents.filter((student) => unit.level === "grade"
        ? student.currentGrade === unit.label
        : student.currentClass === unit.label);
      const levels = students
        .map((student) => riskByStudent.get(student.studentId))
        .filter((level): level is ActiveWarningRiskLevel => Boolean(level));
      const exactCount = levels.length;
      const exactRate = percentage(exactCount, students.length);
      return {
        unit,
        students,
        levels,
        exactCount,
        exactRate,
      };
    })
    .sort((left, right) =>
      right.exactRate - left.exactRate
      || right.levels.filter((level) => level === "critical").length - left.levels.filter((level) => level === "critical").length
      || right.levels.filter((level) => level === "high").length - left.levels.filter((level) => level === "high").length
      || left.unit.label.localeCompare(right.unit.label),
    )
    .map<OrganizationRiskRow>(({ unit, students, levels, exactCount, exactRate }) => {
      const suppressed = unit.level === "class" && exactCount < 3;
      if (suppressed) {
        return {
          id: `${filter.level === "school" ? "school" : filter.grade}:${unit.label}`,
          label: unit.label,
          level: unit.level,
          enrolledCount: students.length,
          riskStudentCount: null,
          riskStudentDisplay: "少量",
          riskRate: null,
          riskRateDisplay: "已按小数量规则隐藏",
          mediumCount: null,
          highCount: null,
          criticalCount: null,
          isSuppressed: true,
          accessibleSummary: `${unit.label}，在校 ${students.length} 人，风险学生为少量，精确值已按隐私规则隐藏。`,
        };
      }

      return {
        id: `${filter.level === "school" ? "school" : filter.grade}:${unit.label}`,
        label: unit.label,
        level: unit.level,
        enrolledCount: students.length,
        riskStudentCount: exactCount,
        riskStudentDisplay: String(exactCount),
        riskRate: exactRate,
        riskRateDisplay: `${exactRate}%`,
        mediumCount: levels.filter((level) => level === "medium").length,
        highCount: levels.filter((level) => level === "high").length,
        criticalCount: levels.filter((level) => level === "critical").length,
        isSuppressed: false,
        accessibleSummary: `${unit.label}，在校 ${students.length} 人，当前确认风险 ${exactCount} 人，占比 ${exactRate}%。`,
      };
    });
}

export function buildSchoolOverview({
  students,
  assessments,
  warnings,
  currentTime,
  termRange,
  organizationFilter,
}: BuildSchoolOverviewInput): SchoolOverviewViewModel {
  const issues: IssueAccumulator = new Map();
  const studentById = new Map(students.map((student) => [student.studentId, student]));
  const allScopeStudents = students.filter((student) => organizationMatches(student, organizationFilter));
  const enrolledStudents = allScopeStudents.filter((student) => student.enrollmentStatus === "enrolled");
  const enrolledIds = new Set(enrolledStudents.map((student) => student.studentId));
  const allScopeIds = new Set(allScopeStudents.map((student) => student.studentId));

  enrolledStudents.forEach((student) => {
    if (!student.currentGrade || !student.currentClass) {
      addIssue(issues, "missing_grade_class", "organization", "部分在校学生缺少年级或班级信息，相关组织统计已排除。", 1);
    }
  });

  warnings.forEach((warning) => {
    if (!studentById.has(warning.studentId)) {
      addIssue(issues, "missing_student", "current_risk", "部分预警事项无法关联学生基础数据，已从组织统计中排除。", 1);
    }
  });

  const currentWarnings = warnings.filter((warning) =>
    warning.isActive
    && warning.currentStatus !== "closed"
    && enrolledIds.has(warning.studentId),
  );

  const activeCasesByStudent = new Map<string, WarningItem[]>();
  currentWarnings.forEach((warning) => {
    const cases = activeCasesByStudent.get(warning.studentId) ?? [];
    cases.push(warning);
    activeCasesByStudent.set(warning.studentId, cases);
  });

  activeCasesByStudent.forEach((cases) => {
    if (cases.length > 1) {
      addIssue(issues, "multiple_active_cases", "current_risk", "部分学生存在多条当前处理中事项，人数已去重并使用最新事项。", 1);
    }
  });

  currentWarnings.forEach((warning) => {
    if ((warning.confirmedRiskLevel as string | undefined) === "low") {
      addIssue(issues, "low_active_warning_risk", "current_risk", "活动预警出现低风险确认值，已从当前风险统计中排除。", 1);
    }
    if (
      ["formal_warning", "in_intervention", "pending_retest", "referral"].includes(warning.currentStatus)
      && !warning.confirmedRiskLevel
    ) {
      addIssue(issues, "missing_confirmed_risk", "current_risk", "正式预警及后续处理中事项缺少心理老师确认风险等级，已从当前风险统计中排除。", 1);
    }
    if (warning.currentStatus === "in_intervention" && !getLatestPlannedInterventionAppointment(warning.interventionAppointments)) {
      addIssue(issues, "intervention_without_appointment", "attention", "部分待干预事项缺少有效预约，已保留在处置状态并提示核对。", 1);
    }
    if (warning.currentStatus === "pending_retest" && warning.retestRecords.length === 0) {
      addIssue(issues, "retest_without_plan", "attention", "部分待复测事项缺少复测计划，无法计入复测时效指标。", 1);
    }
    if (getFeedbackDataIssues(warning, currentTime).length > 0) {
      addIssue(issues, "feedback_state_mismatch", "attention", "部分事项的反馈状态与请求记录不一致，请核对共享数据。", 1);
    }
  });

  const latestCurrentWarnings = [...activeCasesByStudent.values()]
    .map((cases) => [...cases].sort((left, right) => right.activityTime.localeCompare(left.activityTime))[0]);
  const confirmedWarnings = latestCurrentWarnings.filter((warning): warning is WarningItem & { confirmedRiskLevel: ActiveWarningRiskLevel } =>
    Boolean(warning.confirmedRiskLevel && validConfirmedLevels.includes(warning.confirmedRiskLevel)),
  );

  const completedStudentIds = new Set(assessments
    .filter((record) =>
      record.isValid
      && record.status === "completed"
      && inRange(record.completedAt, termRange)
      && enrolledIds.has(record.studentId),
    )
    .map((record) => record.studentId));
  if (completedStudentIds.size > enrolledStudents.length) {
    addIssue(issues, "coverage_overflow", "coverage", "有效测评完成人数超过当前在校人数，请核对学生与测评数据。", 1);
  }

  const coverageRate = enrolledStudents.length === 0 || completedStudentIds.size === 0
    ? null
    : percentage(completedStudentIds.size, enrolledStudents.length);
  const riskCounts = Object.fromEntries(validConfirmedLevels.map((level) => [
    level,
    confirmedWarnings.filter((warning) => warning.confirmedRiskLevel === level).length,
  ])) as Record<ActiveWarningRiskLevel, number>;
  const riskTotal = confirmedWarnings.length;
  const suppressClassRisk = organizationFilter.level === "class" && riskTotal < 3;
  const riskLevelDistribution = validConfirmedLevels.map<DistributionItem>((level) => ({
    id: level,
    label: schoolRiskLevelLabels[level],
    value: suppressClassRisk ? null : riskCounts[level],
    displayValue: suppressClassRisk ? "少量" : String(riskCounts[level]),
    unit: "人",
    percentage: suppressClassRisk ? null : percentage(riskCounts[level], riskTotal),
    isSuppressed: suppressClassRisk,
  }));

  const rawAttention = [
    {
      id: "critical_risk",
      group: "immediate",
      label: "危险风险学生",
      value: riskCounts.critical,
      unit: "人",
      description: "当前处理中事项中，心理老师确认风险等级为危险的学生人数，按学生去重。",
    },
    {
      id: "referral",
      group: "immediate",
      label: "转介中",
      value: currentWarnings.filter((warning) => warning.currentStatus === "referral").length,
      unit: "项",
      description: "当前仍处于转介阶段的事项，新增跟进不会自动改变主状态。",
    },
    {
      id: "feedback_read_unscheduled",
      group: "backlog",
      label: "反馈已阅待安排",
      value: getFeedbackReadUnscheduledInterventionCount(currentWarnings),
      unit: "项",
      description: "班主任当前反馈轮次已有有效反馈，心理老师已逐条确认查看，且尚未建立有效干预预约。该指标不限制提前预约干预。",
    },
    {
      id: "intervention_confirmation_required",
      group: "backlog",
      label: "干预预约待确认",
      value: currentWarnings.filter((warning) => isInterventionConfirmationRequired(warning, currentTime)).length,
      unit: "项",
      description: "预约时间已过 60 分钟，等待心理老师确认执行情况，不等同于未到场。",
    },
    {
      id: "retest_overdue_incomplete",
      group: "backlog",
      label: "复测超时未完成",
      value: currentWarnings.filter((warning) => isRetestOverdueIncomplete(warning, currentTime)).length,
      unit: "项",
      description: "已超过计划复测时间和 120 分钟宽限期，尚未产生复测结果。已完成但待更新状态的事项不计入。",
    },
    {
      id: "feedback_overdue",
      group: "collaboration",
      label: "班主任反馈超时",
      value: currentWarnings.filter((warning) => getEffectiveFeedbackStatus(warning, currentTime) === "feedback_overdue").length,
      unit: "项",
      description: "班主任反馈任务已超过截止时间且尚未收到有效反馈。",
    },
  ] satisfies Array<Omit<AttentionMetric, "displayValue" | "isSuppressed">>;
  const attention: AttentionMetric[] = rawAttention.map((item) => ({
    ...item,
    value: suppressClassRisk ? null : item.value,
    displayValue: suppressClassRisk ? "少量" : String(item.value),
    isSuppressed: suppressClassRisk,
  }));

  const activeCaseCount = currentWarnings.length;
  const activeDistribution = activeStatuses.map<DistributionItem>((status) => {
    const value = currentWarnings.filter((warning) => warning.currentStatus === status).length;
    return {
      id: status,
      label: schoolWarningStatusLabels[status],
      value: suppressClassRisk ? null : value,
      displayValue: suppressClassRisk ? "少量" : String(value),
      unit: "项",
      percentage: suppressClassRisk ? null : percentage(value, activeCaseCount),
      isSuppressed: suppressClassRisk,
    };
  });
  const closedThisTermCount = warnings.filter((warning) =>
    warning.currentStatus === "closed"
    && allScopeIds.has(warning.studentId)
    && inRange(getClosedTime(warning), termRange),
  ).length;

  const months = buildMonths(termRange);
  const trends = months.map<SchoolOverviewTrend>((month) => {
    let formalWarningCases = 0;
    let closedCases = 0;

    warnings.filter((warning) => allScopeIds.has(warning.studentId)).forEach((warning) => {
      const formalTime = getFormalWarningTime(warning);
      if (monthKey(formalTime) === month) {
        formalWarningCases += 1;
      }
      if (monthKey(getClosedTime(warning)) === month && warning.currentStatus === "closed") closedCases += 1;
    });

    const trend = {
      month,
      label: `${Number(month.slice(5))}月`,
      formalWarningCases,
      closedCases,
      isSuppressed: false,
    };
    return suppressClassRisk
      ? { ...trend, formalWarningCases: null, closedCases: null, isSuppressed: true }
      : trend;
  });

  const scopedWarnings = warnings.filter((warning) => allScopeIds.has(warning.studentId));
  const formalWarningsThisTerm = scopedWarnings.filter((warning) => inRange(getFormalWarningTime(warning), termRange));
  const closedWarningsThisTerm = scopedWarnings.filter((warning) =>
    warning.currentStatus === "closed" && inRange(getClosedTime(warning), termRange),
  );
  const closureDurations = closedWarningsThisTerm.flatMap((warning) => {
    const formalTime = getFormalWarningTime(warning);
    const closedTime = getClosedTime(warning);
    if (!formalTime) {
      addIssue(issues, "missing_formal_warning_time", "effectiveness", "部分本学期闭环事项缺少正式预警确认时间，已从平均闭环周期排除。", 1);
      return [];
    }
    const formalMs = dateTimeMs(formalTime);
    const closedMs = closedTime ? dateTimeMs(closedTime) : undefined;
    if (formalMs === undefined || closedMs === undefined || closedMs < formalMs) {
      addIssue(issues, "invalid_closure_cycle", "effectiveness", "部分事项的正式预警与闭环时间异常，已从平均闭环周期排除。", 1);
      return [];
    }
    return [(closedMs - formalMs) / 86_400_000];
  });
  const averageClosureDays = closureDurations.length === 0
    ? null
    : Math.round((closureDurations.reduce((sum, value) => sum + value, 0) / closureDurations.length) * 10) / 10;
  const closureRate = formalWarningsThisTerm.length === 0
    ? null
    : percentage(closedWarningsThisTerm.length, formalWarningsThisTerm.length);
  const blockedWarningIds = new Set(currentWarnings
    .filter((warning) =>
      getEffectiveFeedbackStatus(warning, currentTime) === "feedback_overdue"
      || isInterventionConfirmationRequired(warning, currentTime)
      || isRetestOverdueIncomplete(warning, currentTime),
    )
    .map((warning) => warning.id));
  const gradeRiskDistribution = buildGradeRiskDistribution(enrolledStudents, confirmedWarnings, suppressClassRisk);

  const sourceCounts = new Map<WarningSourceType, number>([
    ["screening_abnormal", 0],
    ["ai_chat_trigger", 0],
    ["teacher_report", 0],
  ]);
  confirmedWarnings.forEach((warning) => {
    sourceCounts.set(warning.sourceType, (sourceCounts.get(warning.sourceType) ?? 0) + 1);
  });
  const sourceTotal = confirmedWarnings.length;
  const sourceDistribution = [...sourceCounts.entries()].map<DistributionItem>(([sourceType, value]) => ({
    id: sourceType,
    label: schoolWarningSourceLabels[sourceType],
    value: suppressClassRisk ? null : value,
    displayValue: suppressClassRisk ? "少量" : String(value),
    unit: "项",
    percentage: suppressClassRisk ? null : percentage(value, sourceTotal),
    isSuppressed: suppressClassRisk,
  }));

  return {
    scope: {
      termRange,
      organizationFilter,
      organizationLabel: organizationLabel(organizationFilter),
    },
    updatedAt: currentTime,
    coverage: {
      enrolledCount: enrolledStudents.length,
      completedCount: completedStudentIds.size,
      incompleteCount: Math.max(enrolledStudents.length - completedStudentIds.size, 0),
      coverageRate,
    },
    currentRisk: {
      studentCount: suppressClassRisk ? null : riskTotal,
      studentDisplay: suppressClassRisk ? "少量" : String(riskTotal),
      highCount: suppressClassRisk ? null : riskCounts.high,
      highDisplay: suppressClassRisk ? "少量" : String(riskCounts.high),
      criticalCount: suppressClassRisk ? null : riskCounts.critical,
      criticalDisplay: suppressClassRisk ? "少量" : String(riskCounts.critical),
      isSuppressed: suppressClassRisk,
    },
    attention,
    riskLevelDistribution,
    organizationDistribution: buildOrganizationRows(enrolledStudents, confirmedWarnings, organizationFilter),
    dispositionDistribution: {
      active: activeDistribution,
      activeCaseCount: suppressClassRisk ? null : activeCaseCount,
      activeCaseDisplay: suppressClassRisk ? "少量" : String(activeCaseCount),
      closedThisTermCount: suppressClassRisk ? null : closedThisTermCount,
      closedThisTermDisplay: suppressClassRisk ? "少量" : String(closedThisTermCount),
      isSuppressed: suppressClassRisk,
    },
    trends,
    trendDataThrough: currentTime < termRange.end ? currentTime.slice(0, 10) : undefined,
    gradeRiskDistribution,
    dispositionEffectiveness: {
      formalWarningCount: suppressClassRisk ? null : formalWarningsThisTerm.length,
      formalWarningDisplay: suppressClassRisk ? "少量" : String(formalWarningsThisTerm.length),
      closedCount: suppressClassRisk ? null : closedWarningsThisTerm.length,
      closedDisplay: suppressClassRisk ? "少量" : String(closedWarningsThisTerm.length),
      closureRate: suppressClassRisk ? null : closureRate,
      closureRateDisplay: suppressClassRisk ? "已隐藏" : closureRate === null ? "暂无可计算数据" : `${closureRate}%`,
      averageClosureDays: suppressClassRisk ? null : averageClosureDays,
      averageClosureDaysDisplay: suppressClassRisk ? "已隐藏" : averageClosureDays === null ? "暂无可计算数据" : `平均 ${averageClosureDays} 天`,
      blockedCaseCount: suppressClassRisk ? null : blockedWarningIds.size,
      blockedCaseDisplay: suppressClassRisk ? "少量" : String(blockedWarningIds.size),
      isSuppressed: suppressClassRisk,
    },
    sourceDistribution,
    filterOptions: buildFilterOptions(students),
    dataIssues: [...issues.values()].map((issue) => suppressClassRisk ? { ...issue, affectedCount: null } : issue),
    hasAssessmentData: completedStudentIds.size > 0,
    hasConfirmedRisk: suppressClassRisk ? null : riskTotal > 0,
    hasScopeData: enrolledStudents.length > 0,
    isSmallClassSuppressed: suppressClassRisk,
  };
}
