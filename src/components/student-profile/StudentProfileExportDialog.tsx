import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buildStudentProfileExportViewModel } from "@/lib/student-profile-export";
import { StudentProfilePrintableReport } from "@/components/student-profile/StudentProfilePrintableReport";
import type { StudentProfileCaseDetail, StudentProfileDetail, StudentProfileExportScope } from "@/types/studentProfile";

export function StudentProfileExportDialog({ detail, selectedCase, open, onOpenChange }: { detail: StudentProfileDetail; selectedCase?: StudentProfileCaseDetail; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [scope, setScope] = useState<StudentProfileExportScope>("all_cases");
  const [includeSensitive, setIncludeSensitive] = useState(false);
  const generatedAt = new Date().toLocaleString("zh-CN", { hour12: false });
  const report = useMemo(() => buildStudentProfileExportViewModel(detail, scope, selectedCase, includeSensitive, generatedAt), [detail, generatedAt, includeSensitive, scope, selectedCase]);

  function printReport() {
    const previousTitle = document.title;
    document.title = `学生档案-${detail.student.studentName}-${new Date().toISOString().slice(0, 10)}`;
    window.addEventListener("afterprint", () => { document.title = previousTitle; }, { once: true });
    window.print();
  }

  return <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>导出学生档案</DialogTitle><DialogDescription>生成结构化打印报告，可在浏览器打印窗口中保存为 PDF。</DialogDescription></DialogHeader>
        <div className="space-y-4 py-2">
          <fieldset className="space-y-2"><legend className="text-sm font-semibold">导出范围</legend>
            <label className="flex items-center gap-2 text-sm"><input checked={scope === "all_cases"} name="scope" onChange={() => setScope("all_cases")} type="radio" />全部事项</label>
            {selectedCase ? <label className="flex items-center gap-2 text-sm"><input checked={scope === "current_case"} name="scope" onChange={() => setScope("current_case")} type="radio" />当前事项 {selectedCase.summary.warningId}</label> : null}
          </fieldset>
          <label className="flex items-start gap-2 rounded-md border border-[var(--warning-200)] bg-[var(--warning-50)] p-3 text-sm text-[var(--warning-700)]"><input checked={includeSensitive} className="mt-1" onChange={(event) => setIncludeSensitive(event.target.checked)} type="checkbox" /><span>包含完整测评作答和 AI 倾诉可见会话。该内容敏感，默认不导出，请确认接收方具备授权。</span></label>
        </div>
        <DialogFooter><Button onClick={() => onOpenChange(false)} variant="outline">取消</Button><Button onClick={printReport}>打开打印 / 保存 PDF</Button></DialogFooter>
      </DialogContent>
    </Dialog>
    <StudentProfilePrintableReport report={report} />
  </>;
}
