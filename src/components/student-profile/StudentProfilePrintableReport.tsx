import { riskLevelLabels, statusLabels, warningSourceTypeLabels } from "@/types/warning";
import type { StudentProfileExportViewModel } from "@/types/studentProfile";
import { getInterventionNotificationPlan } from "@/lib/intervention-appointments";

function Rows({ values }: { values: Array<[string, React.ReactNode]> }) {
  return <dl className="print-grid">{values.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "-"}</dd></div>)}</dl>;
}

export function StudentProfilePrintableReport({ report }: { report: StudentProfileExportViewModel }) {
  return <article className="print-report" aria-hidden="true">
    <header><h1>常熟校园心理健康管理终端 · 学生档案</h1><p>内部敏感资料，仅限授权心理老师用于专业处置与审计。</p></header>
    <Rows values={[
      ["学生", `${report.student.studentName}（${report.student.studentNumber}）`],
      ["年级 / 班级", `${report.student.currentGrade} / ${report.student.currentClass}`],
      ["在校状态", report.student.enrollmentStatus],
      ["导出时间", report.generatedAt],
      ["导出人", report.generatedBy],
      ["导出范围", report.cases.length === 1 ? "当前事项" : "全部事项"],
    ]} />
    <section><h2>学籍动态</h2>{report.student.enrollmentHistory.map((item) => <p key={item.id}>{item.startedAt} - {item.endedAt ?? "至今"} · {item.grade} / {item.className}</p>)}</section>
    {report.cases.map((item) => <section className="print-case" key={item.summary.warningId}>
      <h2>心理风险事项 {item.summary.warningId}</h2>
      <Rows values={[
        ["事项来源", warningSourceTypeLabels[item.summary.sourceType]],
        ["状态", statusLabels[item.summary.currentStatus]],
        ["系统提示风险", riskLevelLabels[item.summary.suggestedRiskLevel]],
        ["确认风险", item.summary.confirmedRiskLevel ? riskLevelLabels[item.summary.confirmedRiskLevel] : "未确认"],
        ["负责心理老师", item.summary.responsibleTeacher],
        ["起止时间", `${item.summary.startedAt} - ${item.summary.endedAt ?? "处理中"}`],
      ]} />
      <h3>风险依据摘要</h3><p>{item.riskEvidence.assessmentSummary}</p><p>{item.riskEvidence.aiSummary}</p>
      {report.includeSensitiveSourceRecords ? <>
        <h3>完整深度测评作答</h3>{item.riskEvidence.deepAssessmentRecords.map((record) => <div key={record.id}><strong>{record.scaleName} · {record.completedAt} · {record.totalScore ?? "-"} 分</strong><p>{record.resultSummary}</p>{record.dimensions.map((dimension) => <p key={dimension.id}>维度 {dimension.name}：{dimension.score ?? "-"} · {dimension.level ?? "-"} · {dimension.summary ?? "-"}</p>)}{record.responses.map((response, index) => <p key={response.id}>{index + 1}. {response.questionText}：{response.answerText}</p>)}</div>)}
        <h3>AI 倾诉可见会话</h3>{item.riskEvidence.aiConversationRecords.map((record) => <div key={record.id}><strong>{record.startedAt}</strong>{record.messages.map((message) => <p key={message.id}>{message.role === "student" ? "学生" : "AI 助手"}：{message.content}</p>)}</div>)}
      </> : null}
      <h3>班主任协作</h3>{item.feedbackCollaboration.rounds.map((round) => <div key={round.request.id}><p><strong>请求：</strong>{round.request.requestNote}（截止 {round.request.deadline}）</p>{round.records.map((record) => <p key={record.id}>{record.submittedAt} · {record.authorName}：{record.content}</p>)}</div>)}{[...item.feedbackCollaboration.proactiveRecords, ...item.feedbackCollaboration.unmatchedRecords].map((record) => <p key={record.id}>{record.submittedAt} · {record.authorName}：{record.content}（未关联反馈请求）</p>)}
      <h3>干预预约</h3>{item.interventionAppointments.length ? item.interventionAppointments.map((appointment) => <p key={appointment.id}>{appointment.plannedAt} · {appointment.location} · {appointment.responsibleTeacher} · {appointment.status}；通知计划：{getInterventionNotificationPlan(appointment).map((plan) => `${plan.label} ${plan.expectedAt}`).join("；")}</p>) : <p>暂无</p>}
      <h3>干预记录</h3>{item.interventionRecords.length ? item.interventionRecords.map((record) => <p key={record.id}>{record.occurredAt} · {record.authorName} · {record.method}：{record.summary}；判断：{record.judgment}；计划：{record.followUpPlan}</p>) : <p>暂无</p>}
      <h3>复测记录</h3>{item.retestRecords.length ? item.retestRecords.map((record) => <p key={record.id}>{record.arrangedAt} · {record.scaleNames.join("、")} · {record.resultSummary ?? "尚未完成复测"} · 作答关联：{record.assessmentRecordId ?? "-"}</p>) : <p>暂无</p>}
      <h3>转介记录</h3>{item.referralRecords.length ? item.referralRecords.map((record) => <div key={record.id}><p>{record.referredAt} · {record.referralType} · {record.organization ?? "-"}：{record.reason}</p>{record.followUpRecords.map((followUp) => <p key={followUp.id}>跟进 {followUp.occurredAt} · {followUp.authorName}：{followUp.summary}；专业结论：{followUp.conclusion}</p>)}</div>) : <p>暂无</p>}
      <h3>处置时间线</h3>{item.timeline.map((event) => <p key={event.id}>{event.occurredAt} · {event.title} · {event.operator}：{event.description}</p>)}
    </section>)}
  </article>;
}
