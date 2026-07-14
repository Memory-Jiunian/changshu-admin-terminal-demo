import { ArrowLeft } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

import { CaseRecordContent } from "@/components/case-records/CaseRecordContent";
import { DETAIL_DRAWER_CLASS } from "@/components/layout/detail-view-config";
import { StudentProfileDetailContent } from "@/components/student-profile/StudentProfileDetailContent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { StudentProfileCaseDetail, StudentProfileDetail, StudentProfileDrawerView } from "@/types/studentProfile";
import { statusLabels } from "@/types/warning";

type StudentProfileDrawerProps = {
  detail: StudentProfileDetail | null;
  caseDetail?: StudentProfileCaseDetail;
  view: StudentProfileDrawerView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileScrollTop: number;
  caseDetailScrollTop: number;
  expandedRecordSections: string[];
  notice?: string;
  onProfileScrollTopChange: (scrollTop: number) => void;
  onCaseDetailScrollTopChange: (scrollTop: number) => void;
  onExpandedRecordSectionsChange: (sections: string[]) => void;
  onViewCaseRecord: (warningId: string) => void;
  onBackToProfile: () => void;
  onViewWarning: (warningId: string) => void;
};

export function StudentProfileDrawer({
  detail,
  caseDetail,
  view,
  open,
  onOpenChange,
  profileScrollTop,
  caseDetailScrollTop,
  expandedRecordSections,
  notice,
  onProfileScrollTopChange,
  onCaseDetailScrollTopChange,
  onExpandedRecordSectionsChange,
  onViewCaseRecord,
  onBackToProfile,
  onViewWarning,
}: StudentProfileDrawerProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const isCaseDetail = view.type === "case_detail" && Boolean(caseDetail);
  const targetScrollTop = isCaseDetail ? caseDetailScrollTop : profileScrollTop;

  useLayoutEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = targetScrollTop;
    }
  }, [detail?.student.studentId, isCaseDetail, open, targetScrollTop, view.type]);

  if (!detail) {
    return null;
  }

  const caseResultLabel = caseDetail?.summary.outcome === "closed"
    ? "已闭环"
    : caseDetail?.summary.outcome === "ended_without_warning"
      ? "未形成正式预警"
      : caseDetail
        ? statusLabels[caseDetail.summary.currentStatus]
        : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn("flex h-full flex-col gap-0 overflow-hidden p-0", DETAIL_DRAWER_CLASS)}>
        <SheetHeader className="shrink-0 border-b border-neutral-200 px-6 py-5 pr-12">
          {isCaseDetail ? (
            <div className="space-y-3">
              <Button className="-ml-2 w-fit gap-2" onClick={onBackToProfile} size="sm" type="button" variant="ghost">
                <ArrowLeft className="h-4 w-4" />返回学生档案
              </Button>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SheetTitle>事项记录</SheetTitle>
                  <SheetDescription>{detail.student.studentName} · {caseDetail?.summary.warningId}</SheetDescription>
                </div>
                {caseResultLabel ? <Badge variant="outline">{caseResultLabel}</Badge> : null}
              </div>
              <Button className="w-fit" onClick={() => caseDetail && onViewWarning(caseDetail.summary.warningId)} size="sm" type="button" variant="outline">查看预警详情</Button>
            </div>
          ) : (
            <>
              <SheetTitle>学生档案</SheetTitle>
              <SheetDescription>{detail.student.studentName} · 学号 {detail.student.studentNumber}</SheetDescription>
            </>
          )}
        </SheetHeader>
        <div
          className="min-h-0 flex-1 overflow-y-auto bg-neutral-50"
          onScroll={(event) => {
            if (isCaseDetail) {
              onCaseDetailScrollTopChange(event.currentTarget.scrollTop);
            } else {
              onProfileScrollTopChange(event.currentTarget.scrollTop);
            }
          }}
          ref={bodyRef}
        >
          {isCaseDetail && caseDetail ? (
            <div className="p-5">
              <CaseRecordContent
                detail={caseDetail}
                expandedSections={expandedRecordSections}
                identity={{
                  studentName: detail.student.studentName,
                  studentIdentifier: detail.student.studentNumber,
                  gradeClass: `${detail.student.currentGrade} / ${detail.student.currentClass}`,
                }}
                onExpandedSectionsChange={onExpandedRecordSectionsChange}
              />
            </div>
          ) : (
            <StudentProfileDetailContent
              detail={detail}
              notice={notice}
              onViewCaseRecord={onViewCaseRecord}
              onViewWarning={onViewWarning}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
