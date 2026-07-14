import { DETAIL_DRAWER_CLASS } from "@/components/layout/detail-view-config";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { StudentProfile } from "@/types/studentProfile";

type StudentProfileDrawerProps = {
  profile: StudentProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StudentProfileDrawer({ profile, open, onOpenChange }: StudentProfileDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={DETAIL_DRAWER_CLASS}>
        <SheetHeader className="border-b border-neutral-200 pb-5 pr-8">
          <SheetTitle>学生档案</SheetTitle>
          <SheetDescription>当前阶段仅确认学生身份与公共抽屉规格。</SheetDescription>
        </SheetHeader>
        {profile ? (
          <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
            <div className="text-lg font-semibold text-neutral-950">{profile.studentName}</div>
            <dl className="mt-5 grid grid-cols-[88px_1fr] gap-x-4 gap-y-4 text-sm">
              <dt className="text-neutral-500">学号</dt>
              <dd className="font-medium text-neutral-900">{profile.studentNumber}</dd>
              <dt className="text-neutral-500">当前年级</dt>
              <dd className="font-medium text-neutral-900">{profile.currentGrade}</dd>
              <dt className="text-neutral-500">当前班级</dt>
              <dd className="font-medium text-neutral-900">{profile.currentClass}</dd>
            </dl>
          </div>
        ) : null}
        <div className="mt-4 rounded-md border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-500">
          完整档案将在 Phase 5.2 实现。
        </div>
      </SheetContent>
    </Sheet>
  );
}
