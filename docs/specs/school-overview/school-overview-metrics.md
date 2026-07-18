# 统计口径与数据映射：校级总览（MVP）

> 本文件是校级总览实现的统计唯一依据。  
> 页面 PRD 负责“展示什么”，本文件负责“怎么计算”。

---

## 1. 推荐目录

```text
src/types/school-overview.ts
src/lib/school-overview.ts
src/components/school-overview/
```

建议纯函数：

```ts
buildSchoolOverview({
  students,
  assessments,
  warnings,
  currentTime,
  termRange,
  organizationFilter,
}): SchoolOverviewViewModel
```

---

## 2. ViewModel 建议

```ts
type SchoolOverviewViewModel = {
  scope: SchoolOverviewScope;
  updatedAt: string;
  coverage: AssessmentCoverageMetric;
  currentRisk: CurrentRiskMetric;
  attention: AttentionMetric[];
  riskLevelDistribution: DistributionItem[];
  organizationDistribution: OrganizationRiskRow[];
  dispositionDistribution: DistributionItem[];
  trends: SchoolOverviewTrend[];
  sourceDistribution: DistributionItem[];
  dataIssues: SchoolOverviewDataIssue[];
};
```

---

## 3. 学生与学籍

使用：

- `studentId`
- `grade`
- `className`
- `enrollmentStatus`
- 学籍变化历史

当前在校学生：

```ts
enrollmentStatus === "enrolled"
```

毕业、离校学生不进入当前在校基数，但其历史事项可以进入当前学期历史趋势。

---

## 4. 测评覆盖

```ts
enrolledStudentIds = set(当前在校学生)
completedStudentIds = set(
  当前学期内 completedAt 存在的有效测评 studentId
  且 studentId 属于 enrolledStudentIds
)
```

输出：

- enrolledCount
- completedCount
- incompleteCount
- coverageRate

边界：

- 同一学生多次测评只计一人；
- 无效、未完成测评不计；
- completedCount 不得大于 enrolledCount。

---

## 5. 当前确认风险学生

准入：

```ts
warning.isActive === true
&& warning.currentStatus !== "closed"
&& warning.confirmedRiskLevel !== undefined
&& ["medium", "high", "critical"].includes(warning.confirmedRiskLevel)
```

按 `studentId` 去重。

风险等级使用活动事项的 `confirmedRiskLevel`。

禁止使用：

- `suggestedRiskLevel` 代替专业确认；
- 学生档案低风险标记；
- 已闭环事项。

---

## 6. 主状态分布

活动事项：

```text
pending_review
observing
formal_warning
in_intervention
pending_retest
referral
```

展示映射：

```text
in_intervention → 待干预
```

已闭环：

- 使用当前学期 `closedAt` / 结束时间；
- 单独展示事项数；
- 不与活动事项计算同一百分比。

---

## 7. 有效干预预约

有效预约状态：

```text
planned
```

非有效：

```text
completed
no_show
cancelled
rescheduled
```

最新有效预约：

```ts
planned appointments
  .sort(plannedAt desc)[0]
```

待安排干预：

```ts
currentStatus === "formal_warning"
&& !latestValidAppointment
```

干预预约待确认：

```ts
currentStatus === "in_intervention"
&& latestValidAppointment
&& currentTime > addMinutes(latestValidAppointment.plannedAt, 60)
```

---

## 8. 有效反馈状态

必须复用：

```ts
getEffectiveFeedbackStatus(warning, currentTime)
```

反馈超时：

```ts
status === "feedback_overdue"
```

不得直接读可能过期的 `warning.feedbackStatus`。

---

## 9. 复测

最新计划记录：

```ts
getLatestPlannedRetest(warning)
```

最新完成记录：

```ts
getLatestCompletedRetest(warning)
```

复测未完成：

```ts
currentStatus === "pending_retest"
&& plannedRecord
&& !plannedRecord.completedAt
&& currentTime > addMinutes(plannedRecord.plannedAt, 120)
```

复测结果待更新：

```ts
currentStatus === "pending_retest"
&& completedRecord
```

互斥优先级：

```text
completedRecord 存在
→ 复测结果待更新

否则超过计划时间 120 分钟
→ 复测未完成
```

---

## 10. 转介

当前转介中：

```ts
currentStatus === "referral"
```

跟进次数：

```ts
sum(referralRecords.followUpRecords.length)
```

MVP 核心卡只展示事项数，不展示跟进正文。

---

## 11. 年级与班级分布

每个组织单元输出：

```ts
type OrganizationRiskRow = {
  id: string;
  label: string;
  enrolledCount: number;
  riskStudentCount: number | null;
  riskStudentDisplay: string;
  riskRate: number | null;
  mediumCount: number | null;
  highCount: number | null;
  criticalCount: number | null;
  isSuppressed: boolean;
};
```

小数量：

```ts
if riskStudentCount < 3:
  exact counts = null
  display = "少量"
  isSuppressed = true
```

注意：前端 ViewModel 中不要保留会被 Tooltip 读取的精确值。

---

## 12. 趋势事件来源

### 新增确认风险学生

优先读取正式确认风险的业务事件时间。

同一学生同一月份只计一次。

### 新增正式预警事项

读取确认正式预警时间线事件或正式预警确认时间。

### 闭环事项

读取闭环结果时间。

### 转介事项

读取 `referralRecord.referredAt`。

历史趋势不得使用当前 `activityTime` 代替真实业务事件时间。

---

## 13. 风险线索来源

使用：

```ts
warning.sourceType
```

映射：

- `screening_abnormal` → 普筛异常
- `ai_chat_trigger` → AI 倾诉触发
- `teacher_report` → 班主任上报

统计单位需要在 UI 标明。MVP 建议按事项数展示，避免多来源学生归并规则过早复杂化。

---

## 14. Data Issues

至少包括：

```ts
type SchoolOverviewDataIssueCode =
  | "multiple_active_cases"
  | "low_active_warning_risk"
  | "missing_confirmed_risk"
  | "missing_student"
  | "missing_grade_class"
  | "intervention_without_appointment"
  | "retest_without_plan"
  | "feedback_state_mismatch"
  | "coverage_overflow";
```

异常记录：

- 不静默修正；
- 从受影响指标中排除或按明确兼容规则处理；
- 页面仅展示聚合级数据核对提示；
- 不暴露学生身份。

---

## 15. 时间与测试

所有 selector 接收 `currentTime` 参数。

禁止组件内部各自调用 `new Date()`。

统一使用当前项目的 mock time / time service，确保：

- 干预约定 60 分钟边界一致；
- 复测 120 分钟边界一致；
- 当前学期月份分组一致；
- 自动化测试稳定。

## 16. Phase S1.1 指标映射

| 指标 | 统计对象 | 口径 |
|---|---|---|
| 当前处理中 | 事项 | `isActive=true` 且非 `closed` |
| 新增正式预警 | 事项 | 当前学期内首条“确认正式预警”事件 |
| 本学期已闭环 | 事项 | 当前学期内真实闭环时间 |
| 反馈已阅待安排 | 事项 | 活动正式预警、当前反馈轮次有有效反馈、全部已读且无有效 planned 预约 |
| 复测超时未完成 | 事项 | 活动待复测、最新未完成计划超过 `plannedAt + 120min` |
| 风险学生年级分布 | 学生 | 当前活动事项有中/高/危险 `confirmedRiskLevel`，按 studentId 去重后读取当前年级 |
| 闭环率 | 事项 | 本学期闭环事项 / 本学期新增正式预警事项；分母为 0 时为不可计算 |
| 平均闭环周期 | 事项 | 本学期闭环且有确认时间的 `closedAt - confirmedAt` 平均天数 |
| 当前阻塞事项 | 事项 | 反馈超时、干预预约待确认、复测超时未完成的 warningId 并集 |

趋势只输出 `formalWarningCases` 和 `closedCases`，单位为项。删除 `confirmedRiskStudents` 与 `referralCases` 页面趋势系列。平均周期缺少时间或闭环早于确认时排除，并输出 dataIssue。
## Phase S1.2 新 ViewModel 口径

### 当前需关注

`referralWarningIds` 为活动转介事项。

`backlogWarningIds` 为以下任一条件：

- 当前反馈轮次已提交且逐条被心理老师确认查看，但尚无有效干预预约；
- 干预预约超过 60 分钟宽限期仍待确认；
- 复测超过计划时间 120 分钟仍未完成。

`collaborationBlockedWarningIds` 为有效反馈状态 `feedback_overdue` 的活动事项。

三个分类分别去重；总数为三个集合并集，不是分类数值相加。

### 处置阶段

| 展示阶段 | 口径 |
|---|---|
| 评估与确认 | 活动事项中的待复核、观察中、正式预警 |
| 干预与复测 | 活动事项中的待干预、待复测 |
| 校外支持 | 活动事项中的转介中 |
| 已闭环 | 当前学期真实闭环事项 |

### 测评突出问题

- 数据源：`WarningDeepAssessmentRecord.dimensions`。
- 时间范围：深度测评 `completedAt` 位于当前学期。
- 关注条件：维度结果明确标记达到量表关注阈值。
- 维度键：`scaleId + dimension.id`，不同量表维度不强行合并。
- 去重：同一学生同一维度只计一次。
- 系列一：全部已测评学生达到阈值人数。
- 系列二：当前确认风险学生达到阈值人数。
- 排序：确认风险学生人数降序，再按全部学生人数降序。
- 展示：最多六项；不足三项显示空状态。

## 废弃输出

旧风险等级独立分布、六项关注平铺、细分状态分布、风险来源图和处置成效卡不再作为页面模块。保留的底层 selector 只能用于兼容或未来用途，不得在 S1.2 页面重复展示。
