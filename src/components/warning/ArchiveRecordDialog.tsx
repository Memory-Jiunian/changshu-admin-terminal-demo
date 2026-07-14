import { useEffect, useState } from "react";

import {
  CASE_RECORD_SECTION_IDS,
  CaseRecordContent,
} from "@/components/case-records/CaseRecordContent";
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
import { buildStudentProfileCaseDetail } from "@/lib/student-profile-aggregate";
import type { WarningItem } from "@/types/warning";

type ArchiveRecordDialogProps = {
  warning: WarningItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ArchiveRecordDialog({ warning, open, onOpenChange }: ArchiveRecordDialogProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    ...CASE_RECORD_SECTION_IDS,
  ]);

  useEffect(() => {
    if (open) {
      setExpandedSections([...CASE_RECORD_SECTION_IDS]);
    }
  }, [open, warning?.id]);

  if (!warning) {
    return null;
  }

  const caseDetail = buildStudentProfileCaseDetail(warning);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex h-[86vh] max-w-[900px] flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-neutral-200 px-6 py-5 pr-14">
          <DialogTitle>归档记录</DialogTitle>
          <DialogDescription>{warning.studentName} · {warning.id} · 完整只读归档</DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 bg-neutral-100">
          <div className="p-5">
            <CaseRecordContent
              detail={caseDetail}
              expandedSections={expandedSections}
              identity={{
                studentName: warning.studentName,
                studentIdentifier: warning.studentId,
                gradeClass: warning.gradeClass,
              }}
              onExpandedSectionsChange={setExpandedSections}
            />
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 border-t border-neutral-200 bg-white px-6 py-4">
          <Button onClick={() => onOpenChange(false)} type="button">关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
