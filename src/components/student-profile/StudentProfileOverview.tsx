import { enrollmentStatusLabels, type StudentProfileDetail } from "@/types/studentProfile";

export function StudentProfileOverview({ detail }: { detail: StudentProfileDetail }) {
  const { student } = detail;

  return (
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
  );
}
