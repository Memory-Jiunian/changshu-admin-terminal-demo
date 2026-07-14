import { Badge } from "@/components/ui/badge";
import { enrollmentStatusLabels, type StudentProfileDetail } from "@/types/studentProfile";
import { feedbackStatusLabels, riskLevelLabels, statusLabels } from "@/types/warning";

export function StudentProfileOverview({ detail }: { detail: StudentProfileDetail }) {
  const { student, activeCase } = detail;

  return (
    <>
      <section className="border-b border-neutral-200 px-6 py-5">
        <h3 className="text-sm font-semibold text-neutral-950">学生信息</h3>
        <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
          <div><dt className="text-neutral-500">姓名</dt><dd className="mt-1 font-medium">{student.studentName}</dd></div>
          <div><dt className="text-neutral-500">学号</dt><dd className="mt-1 font-medium">{student.studentNumber}</dd></div>
          <div><dt className="text-neutral-500">当前年级 / 班级</dt><dd className="mt-1 font-medium">{student.currentGrade} / {student.currentClass}</dd></div>
          <div><dt className="text-neutral-500">当前班主任</dt><dd className="mt-1 font-medium">{student.currentHeadTeacher}</dd></div>
          <div><dt className="text-neutral-500">在校状态</dt><dd className="mt-1 font-medium">{enrollmentStatusLabels[student.enrollmentStatus]}</dd></div>
          <div><dt className="text-neutral-500">最近更新时间</dt><dd className="mt-1 font-medium">{student.updatedAt}</dd></div>
        </dl>
      </section>

      <section className="border-b border-neutral-200 px-6 py-5">
        <h3 className="text-sm font-semibold text-neutral-950">当前心理状态概况</h3>
        {activeCase ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="border-amber-200 bg-amber-50 text-amber-800" variant="outline">{riskLevelLabels[activeCase.riskLevel]}</Badge>
              <Badge className="border-neutral-300 bg-neutral-100 text-neutral-800" variant="outline">{statusLabels[activeCase.currentStatus]}</Badge>
              {activeCase.feedbackStatus === "feedback_overdue" ? <Badge variant="destructive">{feedbackStatusLabels.feedback_overdue}</Badge> : null}
              {activeCase.currentStatus === "pending_retest" ? <Badge className="bg-blue-50 text-blue-700" variant="outline">待复测</Badge> : null}
            </div>
            <dl className="grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
              <div><dt className="text-neutral-500">当前风险等级</dt><dd className="mt-1 font-medium">{riskLevelLabels[activeCase.riskLevel]}</dd></div>
              <div><dt className="text-neutral-500">当前处置状态</dt><dd className="mt-1 font-medium">{statusLabels[activeCase.currentStatus]}</dd></div>
              <div><dt className="text-neutral-500">负责心理老师</dt><dd className="mt-1 font-medium">{activeCase.responsibleTeacher}</dd></div>
              <div><dt className="text-neutral-500">动态时间</dt><dd className="mt-1 font-medium">{activeCase.activityTime}</dd></div>
              <div className="col-span-2"><dt className="text-neutral-500">最近动态</dt><dd className="mt-1 leading-6 text-neutral-800">{activeCase.latestActivity}</dd></div>
            </dl>
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 text-sm">
            <div className="font-medium text-neutral-800">暂无活动事项</div>
            <div className="mt-1 text-neutral-500">暂无活动风险</div>
          </div>
        )}
      </section>
    </>
  );
}
