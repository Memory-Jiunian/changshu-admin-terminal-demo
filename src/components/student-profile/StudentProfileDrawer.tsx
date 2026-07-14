import { useLayoutEffect, useRef } from "react";

import { DETAIL_DRAWER_CLASS } from "@/components/layout/detail-view-config";
import { StudentProfileDetailContent } from "@/components/student-profile/StudentProfileDetailContent";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { StudentProfileDetail } from "@/types/studentProfile";

type StudentProfileDrawerProps = {
  detail: StudentProfileDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialScrollTop: number;
  onScrollTopChange: (scrollTop: number) => void;
  onViewWarning: (warningId: string) => void;
};

export function StudentProfileDrawer({ detail, open, onOpenChange, initialScrollTop, onScrollTopChange, onViewWarning }: StudentProfileDrawerProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = initialScrollTop;
    }
  }, [detail?.student.studentId, initialScrollTop, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {detail ? (
        <SheetContent className={cn("flex h-full flex-col gap-0 overflow-hidden p-0", DETAIL_DRAWER_CLASS)}>
          <SheetHeader className="shrink-0 border-b border-neutral-200 px-6 py-5 pr-12">
            <SheetTitle>学生档案</SheetTitle>
            <SheetDescription>
              {detail.student.studentName} · 学号 {detail.student.studentNumber}
            </SheetDescription>
          </SheetHeader>
          <div
            className="min-h-0 flex-1 overflow-y-auto"
            onScroll={(event) => onScrollTopChange(event.currentTarget.scrollTop)}
            ref={bodyRef}
          >
            <StudentProfileDetailContent detail={detail} onViewWarning={onViewWarning} />
          </div>
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
