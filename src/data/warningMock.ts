import type {
  WarningAiConversationRecord,
  WarningDeepAssessmentRecord,
  WarningFeedbackRequestStatus,
  WarningItem,
  WarningReferralRecord,
} from "@/types/warning";

type LegacyReferralRecord = Omit<WarningReferralRecord, "followUpRecords"> & {
  followUpRecords?: WarningReferralRecord["followUpRecords"];
};

type WarningMockSeed = Omit<
  WarningItem,
  | "studentId"
  | "headTeacherName"
  | "headTeacherPhone"
  | "feedbackRequests"
  | "deepAssessmentRecords"
  | "aiConversationRecords"
  | "isActive"
  | "disposition"
  | "referralRecords"
> &
  Partial<Pick<WarningItem, "isActive" | "disposition">> & {
    referralRecords?: LegacyReferralRecord[];
  };

const warningMockSeeds: WarningMockSeed[] = [
  {
    id: "WRN-20260708-001",
    studentName: "张雨桐",
    gradeClass: "初二（3）班",
    sourceType: "screening_abnormal",
    evidenceTypes: ["deep_assessment", "ai_chat"],
    suggestedRiskLevel: "high",
    currentStatus: "pending_review",
    latestActivity: "补充评估完成，等待心理老师复核",
    activityTime: "2026-07-08 09:40",
    feedbackStatus: "not_requested",
    responsibleTeacher: "陈老师",
    assessmentSummary: "深度测评显示近两周情绪自评波动明显，学业压力和睡眠问题持续。",
    aiSummary: "AI倾诉摘要显示持续低落和回避社交倾向，已形成可供复核的风险依据。",
    teacherFeedbackSummary: "本阶段尚未生成班主任协作任务。",
    feedbackRecords: [],
    hasUnreadFeedback: false,
    interventionRecords: [],
    retestRecords: [],
    timeline: [
      {
        id: "TL-001-3",
        title: "补充评估完成",
        operator: "学生",
        occurredAt: "2026-07-08 09:40",
        description: "学生完成深度测评和 AI倾诉任务，系统形成待复核风险依据。",
      },
      {
        id: "TL-001-2",
        title: "发起补充评估",
        operator: "陈老师",
        occurredAt: "2026-07-08 08:30",
        description: "心理老师向学生发起深度测评和 AI倾诉补充评估任务。",
      },
      {
        id: "TL-001-1",
        title: "普筛异常进入线索池",
        operator: "系统",
        occurredAt: "2026-07-07 16:20",
        description: "普筛结果达到关注阈值，系统自动纳入线索池。",
      },
    ],
  },
  {
    id: "WRN-20260708-002",
    studentName: "李明泽",
    gradeClass: "初一（5）班",
    sourceType: "screening_abnormal",
    evidenceTypes: ["deep_assessment", "ai_chat"],
    suggestedRiskLevel: "low",
    currentStatus: "observing",
    observationNote: "补充评估未见即时危机表现，继续观察睡眠和到校变化。",
    nextReviewAt: "2026-07-08 10:00",
    latestActivity: "心理老师标记继续观察",
    activityTime: "2026-07-08 10:15",
    feedbackStatus: "not_requested",
    responsibleTeacher: "陈老师",
    assessmentSummary: "补充评估显示近期压力主要来自学业适应，暂不形成正式预警。",
    aiSummary: "AI倾诉未发现明确危急表达，存在阶段性焦虑和回避倾向。",
    teacherFeedbackSummary: "观察阶段尚未生成班主任协作任务。",
    feedbackRecords: [],
    hasUnreadFeedback: false,
    interventionRecords: [],
    retestRecords: [],
    timeline: [
      {
        id: "TL-002-4",
        title: "标记继续观察",
        operator: "陈老师",
        occurredAt: "2026-07-08 10:15",
        description: "心理老师完成复核并提交继续观察结果，后续结合线下情况持续判断。",
      },
      {
        id: "TL-002-3",
        title: "补充评估完成",
        operator: "学生",
        occurredAt: "2026-07-08 09:35",
        description: "学生完成深度测评和 AI倾诉任务，系统形成风险依据。",
      },
      {
        id: "TL-002-2",
        title: "发起补充评估",
        operator: "陈老师",
        occurredAt: "2026-07-08 08:40",
        description: "心理老师向学生发起补充评估任务。",
      },
      {
        id: "TL-002-1",
        title: "普筛异常进入线索池",
        operator: "系统",
        occurredAt: "2026-07-07 16:20",
        description: "普筛结果达到关注阈值，系统自动纳入线索池。",
      },
    ],
  },
  {
    id: "WRN-20260708-003",
    studentName: "王若涵",
    gradeClass: "初三（1）班",
    sourceType: "ai_chat_trigger",
    evidenceTypes: ["ai_chat", "deep_assessment"],
    suggestedRiskLevel: "critical",
    confirmedRiskLevel: "critical",
    currentStatus: "formal_warning",
    latestActivity: "已确认正式预警",
    activityTime: "2026-07-08 11:05",
    feedbackStatus: "pending_feedback",
    feedbackRequestNote: "请持续观察学生到校、课堂参与、睡眠和同伴互动情况，并反馈事实变化。",
    feedbackDeadline: "2026-07-09 17:00",
    responsibleTeacher: "周老师",
    assessmentSummary: "深度测评显示高压状态持续，需要线下支持和持续观察。",
    aiSummary: "学生多次提及失眠、无助感和退缩行为。",
    teacherFeedbackSummary: "正式预警已同步班主任协作任务，暂未收到反馈。",
    feedbackRecords: [],
    hasUnreadFeedback: false,
    interventionRecords: [],
    retestRecords: [],
    timeline: [
      {
        id: "TL-003-4",
        title: "确认正式预警",
        operator: "周老师",
        occurredAt: "2026-07-08 11:05",
        description: "心理老师完成复核，正式确认风险等级为危险；补充反馈要求：持续观察到校、课堂参与、睡眠和同伴互动情况；反馈截止时间：2026-07-09 17:00；系统已同步生成班主任协作任务并通知对应班主任。",
      },
      {
        id: "TL-003-3",
        title: "补充评估完成",
        operator: "学生",
        occurredAt: "2026-07-08 10:20",
        description: "学生完成深度测评，系统结合原 AI倾诉线索形成待复核风险依据。",
      },
      {
        id: "TL-003-2",
        title: "发起补充评估",
        operator: "周老师",
        occurredAt: "2026-07-08 09:10",
        description: "心理老师向学生发起深度测评补充评估。",
      },
      {
        id: "TL-003-1",
        title: "AI倾诉触发风险线索",
        operator: "系统",
        occurredAt: "2026-07-07 18:00",
        description: "AI倾诉主动触发风险线索，系统自动纳入线索池。",
      },
    ],
  },
  {
    id: "WRN-20260707-004",
    studentName: "赵一诺",
    gradeClass: "高一（2）班",
    sourceType: "teacher_report",
    evidenceTypes: ["teacher_report", "deep_assessment", "ai_chat"],
    suggestedRiskLevel: "high",
    confirmedRiskLevel: "medium",
    riskLevelAdjustmentReason: "补充评估和线下访谈未发现高危表达，当前以中风险持续干预。",
    currentStatus: "in_intervention",
    latestActivity: "心理老师新增干预记录",
    activityTime: "2026-07-07 17:10",
    feedbackStatus: "new_feedback",
    responsibleTeacher: "陈老师",
    assessmentSummary: "班主任上报后完成补充评估，学生近期家庭压力增大，情绪调节困难。",
    aiSummary: "AI倾诉提示多次表达疲惫和自责，未发现明确高危计划。",
    teacherFeedbackSummary: "班主任持续补充在校观察，近期迟到和课间独处情况增加。",
    feedbackRecords: [
      {
        id: "FB-004-2",
        authorRole: "班主任",
        authorName: "王老师",
        content: "学生本周迟到次数增加，课间多独处，主动交流明显减少。",
        submittedAt: "2026-07-07 16:30",
      },
      {
        id: "FB-004-1",
        authorRole: "班主任",
        authorName: "王老师",
        content: "学生近期课堂参与下降，作业完成情况波动，需要持续关注。",
        submittedAt: "2026-07-07 09:10",
      },
    ],
    hasUnreadFeedback: true,
    interventionRecords: [
      {
        id: "IR-004-2",
        occurredAt: "2026-07-07 17:10",
        authorName: "陈老师",
        method: "个体访谈",
        summary: "围绕家庭压力和近期迟到情况进行支持性访谈。",
        judgment: "情绪波动仍在，但学生能够讨论压力来源。",
        followUpPlan: "三天后再次访谈，并持续收集班主任事实观察。",
      },
      {
        id: "IR-004-1",
        occurredAt: "2026-07-06 14:20",
        authorName: "陈老师",
        method: "支持性沟通",
        summary: "建立稳定沟通关系，确认学生当前支持资源。",
        judgment: "暂无即时危机表现，需要持续干预。",
        followUpPlan: "保持每周沟通，关注出勤和独处变化。",
      },
    ],
    retestRecords: [],
    timeline: [
      {
        id: "TL-004-7",
        title: "新增干预记录",
        operator: "陈老师",
        occurredAt: "2026-07-07 17:10",
        description: "心理老师记录个体访谈和后续跟进计划。",
      },
      {
        id: "TL-004-5",
        title: "新增干预记录",
        operator: "陈老师",
        occurredAt: "2026-07-06 14:20",
        description: "心理老师记录首次支持性沟通。",
      },
      {
        id: "TL-004-4",
        title: "确认正式预警",
        operator: "陈老师",
        occurredAt: "2026-07-06 11:20",
        description: "心理老师完成复核，系统提示高风险，正式确认中风险；调整理由：补充评估和线下访谈未发现高危表达，当前以中风险持续干预。系统已同步生成班主任协作任务并通知对应班主任。",
      },
      {
        id: "TL-004-3",
        title: "补充评估完成",
        operator: "学生",
        occurredAt: "2026-07-06 10:40",
        description: "学生完成深度测评和 AI倾诉任务，系统形成风险依据。",
      },
      {
        id: "TL-004-2",
        title: "发起补充评估",
        operator: "陈老师",
        occurredAt: "2026-07-06 09:00",
        description: "心理老师向学生发起补充评估任务。",
      },
      {
        id: "TL-004-1",
        title: "班主任上报异常线索",
        operator: "王老师",
        occurredAt: "2026-07-05 08:30",
        description: "班主任提交异常观察，系统已纳入线索池。",
      },
    ],
  },
  {
    id: "WRN-20260706-005",
    studentName: "陈思远",
    gradeClass: "高二（6）班",
    sourceType: "screening_abnormal",
    evidenceTypes: ["deep_assessment", "ai_chat"],
    suggestedRiskLevel: "medium",
    confirmedRiskLevel: "medium",
    currentStatus: "pending_retest",
    latestActivity: "班主任待复测提醒已发送",
    activityTime: "2026-07-06 08:30",
    feedbackStatus: "feedback_received",
    responsibleTeacher: "陈老师",
    assessmentSummary: "持续干预后状态较前期稳定，目前已进入第二次复测窗口。",
    aiSummary: "近期无新增 AI 高危表达。",
    teacherFeedbackSummary: "班主任反馈学生出勤稳定，课堂状态较前期改善。",
    feedbackRecords: [
      {
        id: "FB-005-1",
        authorRole: "班主任",
        authorName: "黄老师",
        content: "学生出勤稳定，课堂状态较前期改善，仍需关注考试周压力。",
        submittedAt: "2026-07-01 10:10",
      },
    ],
    hasUnreadFeedback: false,
    interventionRecords: [
      {
        id: "IR-005-1",
        occurredAt: "2026-06-22 10:30",
        authorName: "刘老师",
        method: "支持性访谈",
        summary: "讨论考试压力和可使用的支持资源。",
        judgment: "学生状态较初次评估稳定。",
        followUpPlan: "完成两周后复测，结合结果更新状态。",
      },
    ],
    retestRecords: [
      {
        id: "RR-005-2",
        arrangedAt: "2026-06-22 14:00",
        plannedAt: "2026-07-08 15:00",
        scaleIds: ["phq-9", "gad-7"],
        scaleNames: ["PHQ-9 抑郁症筛查量表", "GAD-7 广泛性焦虑量表"],
      },
      {
        id: "RR-005-1",
        arrangedAt: "2026-06-10 09:00",
        plannedAt: "2026-06-17 10:00",
        scaleIds: ["phq-9"],
        scaleNames: ["PHQ-9 抑郁症筛查量表"],
        completedAt: "2026-06-17 10:20",
        resultSummary: "压力自评较初次评估下降。",
        comparison: "睡眠和到校情况改善，考试焦虑仍存在。",
        conclusion: "继续短期干预并安排下一次复测。",
      },
    ],
    timeline: [
      {
        id: "TL-005-7",
        title: "班主任待复测提醒",
        operator: "系统",
        occurredAt: "2026-07-06 08:30",
        description: "小程序提醒班主任督促学生按时完成复测。",
      },
      {
        id: "TL-005-6",
        title: "安排复测",
        operator: "刘老师",
        occurredAt: "2026-06-22 14:00",
        description: "心理老师安排第二次干预后复测，并记录计划时间；系统已生成班主任待复测提醒并通知对应班主任。",
      },
      {
        id: "TL-005-5",
        title: "新增干预记录",
        operator: "刘老师",
        occurredAt: "2026-06-22 10:30",
        description: "心理老师记录支持性访谈。",
      },
      {
        id: "TL-005-4",
        title: "确认正式预警",
        operator: "刘老师",
        occurredAt: "2026-06-21 15:00",
        description: "心理老师完成复核，正式确认风险等级为中风险；系统已同步生成班主任协作任务并通知对应班主任。",
      },
      {
        id: "TL-005-3",
        title: "补充评估完成",
        operator: "学生",
        occurredAt: "2026-06-20 13:30",
        description: "学生完成补充评估，系统形成风险依据。",
      },
      {
        id: "TL-005-2",
        title: "发起补充评估",
        operator: "刘老师",
        occurredAt: "2026-06-20 10:00",
        description: "心理老师向学生发起补充评估任务。",
      },
      {
        id: "TL-005-1",
        title: "普筛异常进入线索池",
        operator: "系统",
        occurredAt: "2026-06-20 09:20",
        description: "普筛结果达到关注阈值，系统自动纳入线索池。",
      },
    ],
  },
  {
    id: "WRN-20260705-006",
    studentName: "林嘉怡",
    gradeClass: "高一（4）班",
    sourceType: "ai_chat_trigger",
    evidenceTypes: ["ai_chat", "deep_assessment"],
    suggestedRiskLevel: "critical",
    confirmedRiskLevel: "critical",
    currentStatus: "referral",
    latestActivity: "新增转介跟进",
    activityTime: "2026-07-05 17:20",
    feedbackStatus: "pending_feedback",
    responsibleTeacher: "陈老师",
    assessmentSummary: "深度测评提示需要外部专业资源介入。",
    aiSummary: "AI倾诉摘要显示多项持续性风险表达。",
    teacherFeedbackSummary: "班主任协作反馈任务进行中，等待补充在校事实观察。",
    feedbackRecords: [],
    hasUnreadFeedback: false,
    interventionRecords: [
      {
        id: "IR-006-1",
        occurredAt: "2026-07-03 13:10",
        authorName: "周老师",
        method: "危机访谈",
        summary: "完成风险访谈并与监护人沟通外部支持资源。",
        judgment: "需要尽快对接外部专业机构。",
        followUpPlan: "发起转介并持续跟踪外部反馈。",
      },
    ],
    retestRecords: [],
    referralRecords: [
      {
        id: "RF-006-1",
        referredAt: "2026-07-05 15:20",
        referralType: "医疗转介",
        organization: "市青少年心理门诊",
        reason: "持续性高风险表达，需要外部专业资源介入。",
        resultRecordedAt: "2026-07-05 17:20",
        resultSummary: "监护人已完成门诊预约，外部机构建议继续校内支持与跟踪。",
      },
    ],
    timeline: [
      {
        id: "TL-006-6",
        title: "新增转介跟进",
        operator: "周老师",
        occurredAt: "2026-07-05 17:20",
        description: "心理老师记录外部转介反馈，事项保持转介中，不自动生成复测结果。",
      },
      {
        id: "TL-006-5",
        title: "发起转介",
        operator: "周老师",
        occurredAt: "2026-07-05 15:20",
        description: "心理老师发起外部转介，系统已通知对应班主任。",
      },
      {
        id: "TL-006-4",
        title: "新增干预记录",
        operator: "周老师",
        occurredAt: "2026-07-03 13:10",
        description: "心理老师记录危机访谈和外部资源沟通。",
      },
      {
        id: "TL-006-3",
        title: "确认正式预警",
        operator: "周老师",
        occurredAt: "2026-07-03 09:30",
        description: "心理老师完成复核，正式确认风险等级为危险；系统已同步生成班主任协作任务并通知对应班主任。",
      },
      {
        id: "TL-006-2",
        title: "补充评估完成",
        operator: "学生",
        occurredAt: "2026-07-02 18:40",
        description: "学生完成深度测评，系统结合原 AI倾诉线索形成风险依据。",
      },
      {
        id: "TL-006-1",
        title: "AI倾诉触发风险线索",
        operator: "系统",
        occurredAt: "2026-07-02 16:50",
        description: "AI倾诉主动触发风险线索，系统自动纳入线索池。",
      },
    ],
  },
  {
    id: "WRN-20260704-007",
    studentName: "何子轩",
    gradeClass: "初二（7）班",
    sourceType: "ai_chat_trigger",
    evidenceTypes: ["ai_chat", "deep_assessment"],
    suggestedRiskLevel: "high",
    confirmedRiskLevel: "high",
    currentStatus: "closed",
    latestActivity: "心理老师完成闭环归档",
    activityTime: "2026-07-04 16:10",
    feedbackStatus: "feedback_received",
    feedbackRequestNote: "请补充复测前的课堂参与和作息变化。",
    feedbackDeadline: "2026-07-03 17:00",
    responsibleTeacher: "陈老师",
    assessmentSummary: "多轮干预和复测显示学生状态逐步回稳。",
    aiSummary: "近期未出现新增风险表达。",
    teacherFeedbackSummary: "班主任反馈学生课堂互动和作息恢复稳定。",
    feedbackRecords: [
      {
        id: "FB-007-2",
        authorRole: "班主任",
        authorName: "钱老师",
        content: "学生按时到校，能主动与同伴交流，未观察到新的异常表现。",
        submittedAt: "2026-07-04 10:20",
      },
      {
        id: "FB-007-1",
        authorRole: "班主任",
        authorName: "钱老师",
        content: "学生课堂互动和作息恢复稳定，近期能主动参与小组活动。",
        submittedAt: "2026-07-03 15:30",
      },
    ],
    hasUnreadFeedback: false,
    interventionRecords: [
      {
        id: "IR-007-2",
        occurredAt: "2026-06-27 10:40",
        authorName: "陈老师",
        method: "个体访谈",
        summary: "复盘近期压力变化和已建立的支持方式。",
        judgment: "学生情绪稳定性提升。",
        followUpPlan: "安排第二次复测确认效果。",
      },
      {
        id: "IR-007-1",
        occurredAt: "2026-06-26 14:00",
        authorName: "陈老师",
        method: "支持性沟通",
        summary: "识别压力来源并建立日常支持计划。",
        judgment: "需要短期持续跟进。",
        followUpPlan: "一周后复盘并结合班主任反馈。",
      },
    ],
    retestRecords: [
      {
        id: "RR-007-2",
        arrangedAt: "2026-07-01 09:30",
        plannedAt: "2026-07-04 14:00",
        scaleIds: ["phq-9", "gad-7"],
        scaleNames: ["PHQ-9 抑郁症筛查量表", "GAD-7 广泛性焦虑量表"],
        completedAt: "2026-07-04 14:30",
        resultSummary: "风险指标回落至稳定区间。",
        comparison: "相较上次复测，睡眠、社交和到校表现继续改善。",
        conclusion: "风险解除，可以完成闭环归档。",
      },
      {
        id: "RR-007-1",
        arrangedAt: "2026-06-27 11:00",
        plannedAt: "2026-06-30 14:00",
        scaleIds: ["phq-9"],
        scaleNames: ["PHQ-9 抑郁症筛查量表"],
        completedAt: "2026-06-30 14:20",
        resultSummary: "风险表达减少，但仍存在压力波动。",
        comparison: "较初次评估有所改善。",
        conclusion: "继续干预并安排下一次复测。",
      },
    ],
    referralRecords: [
      {
        id: "RF-007-1",
        referredAt: "2026-06-28 09:20",
        referralType: "校外心理咨询转介",
        organization: "常熟市青少年心理支持中心",
        reason: "结合阶段干预情况，补充校外专业支持。",
        resultRecordedAt: "2026-06-29 16:00",
        resultSummary: "已完成一次外部咨询，建议继续校内支持并按计划复测。",
      },
    ],
    timeline: [
      {
        id: "TL-007-9",
        title: "完成闭环归档",
        operator: "陈老师",
        occurredAt: "2026-07-04 16:10",
        description: "心理老师确认本次风险事项闭环，系统已通知对应班主任。",
      },
      {
        id: "TL-007-8",
        title: "更新复测状态",
        operator: "陈老师",
        occurredAt: "2026-07-04 15:30",
        description: "心理老师根据复测结果选择风险解除并闭环，系统已通知对应班主任。",
      },
      {
        id: "TL-007-7",
        title: "学生完成复测",
        operator: "学生",
        occurredAt: "2026-07-04 14:30",
        description: "学生完成第二次干预后复测。",
      },
      {
        id: "TL-007-6",
        title: "班主任待复测提醒",
        operator: "系统",
        occurredAt: "2026-07-03 08:30",
        description: "小程序提醒班主任督促学生按时完成复测。",
      },
      {
        id: "TL-007-5",
        title: "安排复测",
        operator: "陈老师",
        occurredAt: "2026-07-01 09:30",
        description: "心理老师安排第二次复测，系统已生成班主任待复测提醒并通知对应班主任。",
      },
      {
        id: "TL-007-R2",
        title: "新增转介跟进",
        operator: "陈老师",
        occurredAt: "2026-06-29 16:00",
        description: "心理老师记录外部咨询结果，后续另行安排复测。",
      },
      {
        id: "TL-007-R1",
        title: "发起转介",
        operator: "陈老师",
        occurredAt: "2026-06-28 09:20",
        description: "心理老师发起校外心理咨询转介，系统已同步通知对应班主任。",
      },
      {
        id: "TL-007-4",
        title: "新增干预记录",
        operator: "陈老师",
        occurredAt: "2026-06-27 10:40",
        description: "心理老师记录阶段性干预过程。",
      },
      {
        id: "TL-007-3",
        title: "确认正式预警",
        operator: "陈老师",
        occurredAt: "2026-06-25 14:00",
        description: "心理老师完成复核，正式确认风险等级为高风险；系统已同步生成班主任协作任务并通知对应班主任。",
      },
      {
        id: "TL-007-2",
        title: "补充评估完成",
        operator: "学生",
        occurredAt: "2026-06-25 11:20",
        description: "学生完成深度测评，系统结合原 AI倾诉线索形成风险依据。",
      },
      {
        id: "TL-007-1",
        title: "AI倾诉触发风险线索",
        operator: "系统",
        occurredAt: "2026-06-24 18:10",
        description: "AI倾诉主动触发风险线索，系统自动纳入线索池。",
      },
    ],
  },
  {
    id: "WRN-20260703-008",
    studentName: "孙芷晴",
    gradeClass: "初三（4）班",
    sourceType: "teacher_report",
    evidenceTypes: ["teacher_report", "deep_assessment", "ai_chat"],
    suggestedRiskLevel: "high",
    confirmedRiskLevel: "medium",
    riskLevelAdjustmentReason: "补充评估显示风险主要来自阶段性考试压力，未发现持续高危表达。",
    currentStatus: "formal_warning",
    latestActivity: "班主任提交反馈",
    activityTime: "2026-07-03 12:20",
    feedbackStatus: "feedback_received",
    feedbackRequestNote: "请补充学生近三天到校、睡眠和课堂参与情况。",
    feedbackDeadline: "2026-07-03 12:00",
    responsibleTeacher: "刘老师",
    assessmentSummary: "班主任上报后完成补充评估，近期学习压力升高，需持续关注睡眠和到校情况。",
    aiSummary: "AI倾诉未显示危急表达，存在持续焦虑倾向。",
    teacherFeedbackSummary: "班主任已提交反馈：学生主动求助次数增加。",
    feedbackRecords: [
      {
        id: "FB-008-1",
        authorRole: "班主任",
        authorName: "吴老师",
        content: "学生主动求助次数增加，近期能表达考试压力，但睡眠仍不稳定。",
        submittedAt: "2026-07-03 12:20",
      },
    ],
    hasUnreadFeedback: false,
    interventionRecords: [],
    retestRecords: [],
    timeline: [
      {
        id: "TL-008-5",
        title: "请求补充反馈",
        operator: "刘老师",
        occurredAt: "2026-07-02 11:00",
        description: "心理老师额外请求对应班主任补充事实观察。",
      },
      {
        id: "TL-008-4",
        title: "确认正式预警",
        operator: "刘老师",
        occurredAt: "2026-07-02 10:30",
        description: "心理老师完成复核，系统提示高风险，正式确认中风险；调整理由：补充评估显示风险主要来自阶段性考试压力，未发现持续高危表达。系统已同步生成班主任协作任务并通知对应班主任。",
      },
      {
        id: "TL-008-3",
        title: "补充评估完成",
        operator: "学生",
        occurredAt: "2026-07-02 10:10",
        description: "学生完成深度测评和 AI倾诉任务，系统形成风险依据。",
      },
      {
        id: "TL-008-2",
        title: "发起补充评估",
        operator: "刘老师",
        occurredAt: "2026-07-02 09:30",
        description: "心理老师向学生发起补充评估任务。",
      },
      {
        id: "TL-008-1",
        title: "班主任上报异常线索",
        operator: "吴老师",
        occurredAt: "2026-07-02 09:00",
        description: "班主任提交异常观察，系统已纳入线索池。",
      },
    ],
  },
  {
    id: "WRN-20260708-009",
    studentName: "周明宇",
    gradeClass: "高一（2）班",
    sourceType: "screening_abnormal",
    evidenceTypes: ["deep_assessment", "ai_chat"],
    suggestedRiskLevel: "medium",
    confirmedRiskLevel: "medium",
    currentStatus: "pending_retest",
    latestActivity: "学生完成复测，等待心理老师更新状态",
    activityTime: "2026-07-08 11:20",
    feedbackStatus: "feedback_received",
    responsibleTeacher: "陈老师",
    assessmentSummary: "前期干预后情绪和到校表现持续改善，已完成阶段复测。",
    aiSummary: "近期 AI倾诉未出现新增高危表达。",
    teacherFeedbackSummary: "班主任反馈近期课堂参与和同伴互动恢复。",
    feedbackRecords: [
      {
        id: "FB-009-1",
        authorRole: "班主任",
        authorName: "郑老师",
        content: "学生近期课堂参与恢复，能够主动完成学习任务。",
        submittedAt: "2026-07-08 09:10",
      },
    ],
    hasUnreadFeedback: false,
    interventionRecords: [
      {
        id: "IR-009-1",
        occurredAt: "2026-07-03 14:00",
        authorName: "陈老师",
        method: "个体访谈",
        summary: "复盘压力来源并巩固已建立的支持方式。",
        judgment: "状态较前期稳定，可以结合复测结果判断后续状态。",
        followUpPlan: "完成复测后更新风险状态。",
      },
    ],
    retestRecords: [
      {
        id: "RR-009-1",
        arrangedAt: "2026-07-05 10:00",
        plannedAt: "2026-07-08 11:00",
        scaleIds: ["phq-9", "psqi"],
        scaleNames: ["PHQ-9 抑郁症筛查量表", "PSQI 匹兹堡睡眠质量指数"],
        completedAt: "2026-07-08 11:20",
        resultSummary: "风险指标下降至稳定区间。",
        comparison: "较初次评估，睡眠和社交回避明显改善。",
        conclusion: "可由心理老师判断闭环、继续干预或转介。",
      },
    ],
    timeline: [
      {
        id: "TL-009-6",
        title: "学生完成复测",
        operator: "学生",
        occurredAt: "2026-07-08 11:20",
        description: "学生完成已安排的干预后复测。",
      },
      {
        id: "TL-009-5",
        title: "安排复测",
        operator: "陈老师",
        occurredAt: "2026-07-05 10:00",
        description: "心理老师安排复测，系统已生成班主任待复测提醒并通知对应班主任。",
      },
      {
        id: "TL-009-4",
        title: "新增干预记录",
        operator: "陈老师",
        occurredAt: "2026-07-03 14:00",
        description: "心理老师记录阶段性个体访谈。",
      },
      {
        id: "TL-009-3",
        title: "确认正式预警",
        operator: "陈老师",
        occurredAt: "2026-07-02 10:00",
        description: "心理老师正式确认中风险，系统已同步生成班主任协作任务并通知对应班主任。",
      },
      {
        id: "TL-009-2",
        title: "补充评估完成",
        operator: "学生",
        occurredAt: "2026-07-02 09:30",
        description: "学生完成补充评估，系统形成风险依据。",
      },
      {
        id: "TL-009-1",
        title: "普筛异常进入线索池",
        operator: "系统",
        occurredAt: "2026-07-01 09:00",
        description: "普筛结果达到关注阈值，系统自动纳入线索池。",
      },
    ],
  },
  {
    id: "WRN-20260708-010",
    studentName: "许安然",
    gradeClass: "初三（1）班",
    sourceType: "teacher_report",
    evidenceTypes: ["teacher_report", "deep_assessment", "ai_chat"],
    suggestedRiskLevel: "high",
    confirmedRiskLevel: "high",
    currentStatus: "referral",
    latestActivity: "心理老师发起转介",
    activityTime: "2026-07-08 10:50",
    feedbackStatus: "feedback_received",
    responsibleTeacher: "刘老师",
    assessmentSummary: "补充评估提示需要外部专业资源继续支持。",
    aiSummary: "AI倾诉显示持续焦虑和睡眠困难。",
    teacherFeedbackSummary: "班主任已补充近期在校表现。",
    feedbackRecords: [
      {
        id: "FB-010-1",
        authorRole: "班主任",
        authorName: "孙老师",
        content: "学生近期到校稳定，但课堂参与仍较少，家长已配合外部转介安排。",
        submittedAt: "2026-07-08 09:30",
      },
    ],
    hasUnreadFeedback: false,
    interventionRecords: [
      {
        id: "IR-010-1",
        occurredAt: "2026-07-07 15:20",
        authorName: "刘老师",
        method: "家校沟通",
        summary: "与监护人沟通外部支持资源。",
        judgment: "建议尽快转介专业机构。",
        followUpPlan: "等待外部机构反馈后记录转介结果。",
      },
    ],
    retestRecords: [],
    referralRecords: [
      {
        id: "RF-010-1",
        referredAt: "2026-07-08 10:50",
        referralType: "医疗转介",
        organization: "市心理专科门诊",
        reason: "需要外部专业评估与持续支持。",
      },
    ],
    timeline: [
      {
        id: "TL-010-5",
        title: "发起转介",
        operator: "刘老师",
        occurredAt: "2026-07-08 10:50",
        description: "心理老师发起医疗转介，系统已同步通知对应班主任。",
      },
      {
        id: "TL-010-4",
        title: "新增干预记录",
        operator: "刘老师",
        occurredAt: "2026-07-07 15:20",
        description: "心理老师完成家校沟通。",
      },
      {
        id: "TL-010-3",
        title: "确认正式预警",
        operator: "刘老师",
        occurredAt: "2026-07-07 10:00",
        description: "心理老师正式确认高风险，系统已同步生成班主任协作任务并通知对应班主任。",
      },
      {
        id: "TL-010-2",
        title: "补充评估完成",
        operator: "学生",
        occurredAt: "2026-07-07 09:20",
        description: "学生完成深度测评和 AI倾诉任务。",
      },
      {
        id: "TL-010-1",
        title: "班主任上报异常线索",
        operator: "班主任",
        occurredAt: "2026-07-06 14:00",
        description: "班主任提交异常观察，系统已纳入线索池。",
      },
    ],
  },
  {
    id: "WRN-20260701-011",
    studentName: "顾晨曦",
    gradeClass: "初一（5）班",
    sourceType: "screening_abnormal",
    evidenceTypes: ["deep_assessment", "ai_chat"],
    suggestedRiskLevel: "medium",
    currentStatus: "pending_review",
    latestActivity: "已结束本次线索处理",
    activityTime: "2026-07-01 16:00",
    feedbackStatus: "not_requested",
    responsibleTeacher: "周老师",
    assessmentSummary: "补充评估显示为短期适应性波动，未形成持续风险证据。",
    aiSummary: "AI倾诉未发现持续风险表达。",
    teacherFeedbackSummary: "未生成班主任协作任务。",
    feedbackRecords: [],
    hasUnreadFeedback: false,
    interventionRecords: [],
    retestRecords: [],
    isActive: false,
    disposition: "ended_without_warning",
    endedAt: "2026-07-01 16:00",
    endReason: "补充评估显示为短期适应性波动，本次不形成正式预警。",
    timeline: [
      {
        id: "TL-011-4",
        title: "结束本次线索处理",
        operator: "周老师",
        occurredAt: "2026-07-01 16:00",
        description: "心理老师确认本次不形成正式预警，历史事项保留。",
      },
      {
        id: "TL-011-3",
        title: "补充评估完成",
        operator: "学生",
        occurredAt: "2026-07-01 15:20",
        description: "学生完成补充评估，系统形成风险依据。",
      },
      {
        id: "TL-011-2",
        title: "发起补充评估",
        operator: "周老师",
        occurredAt: "2026-07-01 10:00",
        description: "心理老师向学生发起补充评估任务。",
      },
      {
        id: "TL-011-1",
        title: "普筛异常进入线索池",
        operator: "系统",
        occurredAt: "2026-06-30 09:00",
        description: "普筛结果达到关注阈值，系统自动纳入线索池。",
      },
    ],
  },
  {
    id: "WRN-20260708-012",
    studentName: "沈知夏",
    gradeClass: "高二（3）班",
    sourceType: "teacher_report",
    evidenceTypes: ["teacher_report", "deep_assessment", "ai_chat"],
    suggestedRiskLevel: "high",
    confirmedRiskLevel: "high",
    currentStatus: "formal_warning",
    latestActivity: "班主任反馈任务已超时",
    activityTime: "2026-07-08 09:00",
    feedbackStatus: "feedback_overdue",
    feedbackRequestNote: "请反馈学生近期到校、课堂参与和同伴互动的事实变化。",
    feedbackDeadline: "2026-07-07 17:00",
    responsibleTeacher: "陈老师",
    assessmentSummary: "补充评估提示持续压力和回避表现，需要进一步事实观察。",
    aiSummary: "AI倾诉显示近期睡眠受影响，未出现即时危机表达。",
    teacherFeedbackSummary: "首次班主任协作任务已超时，尚未收到反馈。",
    feedbackRecords: [],
    hasUnreadFeedback: false,
    interventionRecords: [],
    retestRecords: [],
    timeline: [
      {
        id: "TL-012-3",
        title: "确认正式预警",
        operator: "陈老师",
        occurredAt: "2026-07-06 15:00",
        description: "心理老师确认高风险；补充反馈要求：反馈近期到校、课堂参与和同伴互动；截止时间：2026-07-07 17:00；系统已生成班主任协作任务。",
      },
      {
        id: "TL-012-2",
        title: "补充评估完成",
        operator: "学生",
        occurredAt: "2026-07-06 14:00",
        description: "学生完成深度测评和 AI倾诉补充评估，形成待复核依据。",
      },
      {
        id: "TL-012-1",
        title: "班主任上报异常线索",
        operator: "孙老师",
        occurredAt: "2026-07-05 09:00",
        description: "班主任提交异常观察，系统已纳入线索池。",
      },
    ],
  },
];

function buildDeepAssessmentRecords(
  warning: WarningMockSeed,
  index: number,
): WarningDeepAssessmentRecord[] {
  if (!warning.evidenceTypes.includes("deep_assessment")) return [];
  const completedAt = warning.timeline.find((item) => item.title.includes("补充评估完成"))?.occurredAt
    ?? warning.activityTime;
  const base: WarningDeepAssessmentRecord = {
    id: `DA-${warning.id}-1`,
    scaleId: index % 2 === 0 ? "phq-9" : "gad-7",
    scaleName: index % 2 === 0 ? "PHQ-9 抑郁症筛查量表" : "GAD-7 广泛性焦虑量表",
    startedAt: completedAt,
    completedAt,
    totalScore: warning.suggestedRiskLevel === "critical" ? 20 : warning.suggestedRiskLevel === "high" ? 15 : 9,
    riskLevel: warning.suggestedRiskLevel,
    resultSummary: warning.assessmentSummary,
    gradeClassAtTime: warning.gradeClass,
    dimensions: [
      { id: "mood", name: "情绪状态", score: index % 5 + 3, level: "需关注", summary: "近期情绪波动较明显。" },
      { id: "sleep", name: "睡眠与精力", score: index % 4 + 2, level: "轻度异常", summary: "睡眠或精力状态出现阶段性变化。" },
    ],
    responses: [
      { id: "q1", questionText: "过去两周是否经常感到情绪低落？", answerText: "有几天", score: 1 },
      { id: "q2", questionText: "过去两周睡眠是否受到影响？", answerText: "超过一半天数", score: 2 },
      { id: "q3", questionText: "这些情况是否影响学习和日常活动？", answerText: "有一些影响", score: 1 },
    ],
  };
  return warning.id === "WRN-20260704-007"
    ? [{ ...base, id: `DA-${warning.id}-2`, completedAt: "2026-07-04 14:30", resultSummary: "复测前结构化测评显示整体风险表达较前期下降。" }, base]
    : [base];
}

function buildAiConversationRecords(
  warning: WarningMockSeed,
): WarningAiConversationRecord[] {
  if (!warning.evidenceTypes.includes("ai_chat")) return [];
  const startedAt = warning.timeline[warning.timeline.length - 1]?.occurredAt ?? warning.activityTime;
  return [{
    id: `AI-${warning.id}-1`,
    startedAt,
    endedAt: warning.activityTime,
    triggerMessageId: `AIM-${warning.id}-2`,
    summary: warning.aiSummary,
    messages: [
      { id: `AIM-${warning.id}-1`, role: "assistant", sentAt: startedAt, content: "最近有什么让你感到压力或不舒服的事情吗？" },
      { id: `AIM-${warning.id}-2`, role: "student", sentAt: startedAt, content: "最近睡不好，也不太想和同学说话。", riskMarker: "持续低落与社交回避" },
      { id: `AIM-${warning.id}-3`, role: "assistant", sentAt: startedAt, content: "谢谢你愿意说出来。我们可以一起梳理，也可以联系学校心理老师获得支持。" },
    ],
  }];
}

export const warningMockData: WarningItem[] = warningMockSeeds.map((warning, index) => {
  const headTeacherName = warning.feedbackRecords[0]?.authorName ?? ["王老师", "李老师", "赵老师"][index % 3];
  const feedbackDeadline = warning.feedbackDeadline ?? (
    warning.feedbackStatus === "feedback_overdue"
      ? "2026-07-07 17:00"
      : warning.feedbackStatus === "not_requested"
        ? undefined
        : "2026-07-09 17:00"
  );
  const feedbackRequestNote = warning.feedbackRequestNote ?? (
    feedbackDeadline ? "请持续观察学生到校、课堂参与和情绪变化，并提交事实反馈。" : undefined
  );
  const requestStatus: WarningFeedbackRequestStatus = warning.feedbackRecords.length > 0
    ? "completed"
    : warning.feedbackStatus === "feedback_overdue"
      ? "overdue"
      : "pending";

  const feedbackRequests = warning.id === "WRN-20260704-007"
    ? [
        {
          id: "FQ-WRN-20260704-007-2",
          requestedAt: "2026-07-02 09:00",
          requestedBy: warning.responsibleTeacher,
          requestNote: "请补充复测前的课堂参与和作息变化。",
          deadline: "2026-07-03 17:00",
          status: "completed" as const,
        },
        {
          id: "FQ-WRN-20260704-007-1",
          requestedAt: "2026-06-25 14:00",
          requestedBy: warning.responsibleTeacher,
          requestNote: "请持续观察学生到校、课堂互动和同伴交往情况。",
          deadline: "2026-06-27 17:00",
          status: "completed" as const,
        },
      ]
    : feedbackDeadline && feedbackRequestNote
      ? [{
          id: `FQ-${warning.id}-1`,
          requestedAt: warning.timeline.find((item) => item.title === "确认正式预警")?.occurredAt ?? warning.activityTime,
          requestedBy: warning.responsibleTeacher,
          requestNote: feedbackRequestNote,
          deadline: feedbackDeadline,
          status: requestStatus,
        }]
      : [];

  const feedbackRecords = warning.feedbackRecords.map((record, recordIndex) => {
    const psychologistReadAt = warning.hasUnreadFeedback
      ? recordIndex === 0
        ? undefined
        : warning.activityTime
      : warning.activityTime;
    if (warning.id === "WRN-20260707-004") {
      return { ...record, requestId: recordIndex === 0 ? feedbackRequests[0]?.id : undefined, psychologistReadAt };
    }
    if (warning.id === "WRN-20260704-007") {
      return { ...record, requestId: feedbackRequests[Math.min(recordIndex, feedbackRequests.length - 1)]?.id, psychologistReadAt };
    }
    if (warning.id === "WRN-20260705-005") {
      return { ...record, requestId: "FQ-MISSING-DEMO", psychologistReadAt };
    }
    return { ...record, requestId: feedbackRequests[0]?.id, psychologistReadAt };
  });

  const referralRecords = (warning.referralRecords ?? []).map((record) => ({
    ...record,
    followUpRecords: record.followUpRecords?.length
      ? [...record.followUpRecords].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
      : record.resultRecordedAt && record.resultSummary
        ? [{
            id: `RFF-MIGRATED-${record.id}`,
            occurredAt: record.resultRecordedAt,
            authorName: warning.responsibleTeacher,
            summary: record.resultSummary,
          }]
        : [],
  }));

  return {
    studentId: `STU-${String(index + 1).padStart(4, "0")}`,
    isActive: true,
    disposition: "active",
    ...warning,
    headTeacherName,
    headTeacherPhone: `138****${String(1234 + index).slice(-4)}`,
    feedbackRequests,
    feedbackRecords,
    deepAssessmentRecords: buildDeepAssessmentRecords(warning, index),
    aiConversationRecords: buildAiConversationRecords(warning),
    feedbackDeadline,
    feedbackRequestNote,
    referralRecords,
  };
});
