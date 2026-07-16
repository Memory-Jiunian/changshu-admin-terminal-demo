import { CaseFeedbackSection } from "@/components/case-records/CaseFeedbackSection";
import { CaseInterventionSection } from "@/components/case-records/CaseInterventionSection";
import { CaseOverviewSection, type CaseRecordIdentity } from "@/components/case-records/CaseOverviewSection";
import { CaseRecordSection } from "@/components/case-records/CaseRecordSection";
import { CaseReferralSection } from "@/components/case-records/CaseReferralSection";
import { CaseRetestSection } from "@/components/case-records/CaseRetestSection";
import { CaseRiskEvidenceSection } from "@/components/case-records/CaseRiskEvidenceSection";
import { CaseTimelineSection } from "@/components/case-records/CaseTimelineSection";
import type { StudentProfileCaseDetail } from "@/types/studentProfile";

export const CASE_RECORD_SECTION_IDS = [
  "overview",
  "risk_evidence",
  "feedback",
  "intervention",
  "retest",
  "referral",
  "timeline",
] as const;

export type CaseRecordSectionId = typeof CASE_RECORD_SECTION_IDS[number];

type CaseRecordContentProps = {
  detail: StudentProfileCaseDetail;
  identity: CaseRecordIdentity;
  expandedSections: string[];
  onExpandedSectionsChange: (sections: string[]) => void;
};

export function CaseRecordContent({ detail, identity, expandedSections, onExpandedSectionsChange }: CaseRecordContentProps) {
  function renderSection(
    id: CaseRecordSectionId,
    title: string,
    content: React.ReactNode,
    count?: number,
  ) {
    const expanded = expandedSections.includes(id);
    return (
      <CaseRecordSection
        count={count}
        expanded={expanded}
        key={id}
        onToggle={() => onExpandedSectionsChange(
          expanded
            ? expandedSections.filter((section) => section !== id)
            : [...expandedSections, id],
        )}
        title={title}
      >
        {content}
      </CaseRecordSection>
    );
  }

  return (
    <div className="space-y-3">
      {renderSection("overview", "事项概况", <CaseOverviewSection detail={detail} identity={identity} />)}
      {renderSection("risk_evidence", "风险依据", <CaseRiskEvidenceSection detail={detail} />)}
      {renderSection("feedback", "班主任协作", <CaseFeedbackSection detail={detail} />, detail.feedbackRequests.length + detail.feedbackRecords.length)}
      {renderSection("intervention", "干预预约与记录", <CaseInterventionSection detail={detail} />, detail.interventionHistory.rounds.length + detail.interventionHistory.unlinkedRecords.length)}
      {renderSection("retest", "复测记录", <CaseRetestSection detail={detail} />, detail.retestRecords.length)}
      {renderSection("referral", "转介与结束结果", <CaseReferralSection detail={detail} />, detail.referralRecords.length)}
      {renderSection("timeline", "处置时间线", <CaseTimelineSection detail={detail} />, detail.timeline.length)}
    </div>
  );
}
