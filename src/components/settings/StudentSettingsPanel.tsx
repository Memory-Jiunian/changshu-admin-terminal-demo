import { useMemo, useState } from "react";
import { ArrowRightLeft, Pencil, Plus } from "lucide-react";

import { Field, ResultNotice } from "@/components/settings/SettingsShared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminData } from "@/state/AdminDataProvider";
import { enrollmentStatusLabels } from "@/types/studentProfile";
import type { EnrollmentStatus } from "@/types/studentProfile";
import type {
  EnrollmentChangeValues,
  SchoolStudent,
  StudentValues,
  SystemActionResult,
} from "@/types/system-settings";

const PAGE_SIZE = 12;

export function StudentSettingsPanel() {
  const { baseData } = useAdminData();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"all" | EnrollmentStatus>("all");
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<SchoolStudent | "new" | null>(null);
  const [enrollmentStudent, setEnrollmentStudent] = useState<SchoolStudent | null>(null);
  const filtered = useMemo(() => baseData.students.filter((student) =>
    (!keyword.trim() || `${student.name}${student.studentNumber}`.toLocaleLowerCase().includes(keyword.trim().toLocaleLowerCase()))
    && (status === "all" || student.enrollmentStatus === status),
  ), [baseData.students, keyword, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const items = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div><CardTitle className="text-lg">学生管理</CardTitle><p className="mt-1 text-sm text-[var(--text-secondary)]">只维护身份和学籍资料，不展示或编辑心理事项。</p></div>
          <Button onClick={() => setEditor("new")} size="sm" type="button"><Plus className="mr-1 h-4 w-4" />新增学生</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_180px]">
          <Input onChange={(event) => { setKeyword(event.target.value); setPage(1); }} placeholder="搜索姓名或学号" value={keyword} />
          <Select onValueChange={(value) => { setStatus(value as typeof status); setPage(1); }} value={status}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">全部学籍状态</SelectItem>{Object.entries(enrollmentStatusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>姓名 / 学号</TableHead><TableHead>年级</TableHead><TableHead>班级</TableHead><TableHead>班主任</TableHead><TableHead>学籍状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((student) => {
              const context = getStudentContext(student, baseData);
              return (
                <TableRow key={student.studentId}>
                  <TableCell><div className="font-medium">{student.name}</div><div className="text-xs text-[var(--text-secondary)]">{student.studentNumber}</div></TableCell>
                  <TableCell>{context.gradeName}</TableCell>
                  <TableCell>{context.className}</TableCell>
                  <TableCell>{context.headTeacherName}</TableCell>
                  <TableCell><Badge variant="outline">{enrollmentStatusLabels[student.enrollmentStatus]}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => setEditor(student)} size="sm" type="button" variant="ghost"><Pencil className="mr-1 h-4 w-4" />编辑</Button>
                    <Button onClick={() => setEnrollmentStudent(student)} size="sm" type="button" variant="ghost"><ArrowRightLeft className="mr-1 h-4 w-4" />学籍变更</Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {items.length === 0 ? <TableRow><TableCell className="h-32 text-center text-[var(--text-secondary)]" colSpan={6}>没有符合条件的学生</TableCell></TableRow> : null}
          </TableBody>
        </Table>
        <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-secondary)]">
          <span>共 {filtered.length} 名学生</span>
          <div className="flex items-center gap-2"><Button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} size="sm" type="button" variant="outline">上一页</Button><span>{currentPage} / {totalPages}</span><Button disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} size="sm" type="button" variant="outline">下一页</Button></div>
        </div>
      </CardContent>
      {editor ? <StudentEditor key={editor === "new" ? "new" : editor.studentId} item={editor === "new" ? undefined : editor} onClose={() => setEditor(null)} /> : null}
      {enrollmentStudent ? <EnrollmentEditor key={enrollmentStudent.studentId} item={enrollmentStudent} onClose={() => setEnrollmentStudent(null)} /> : null}
    </Card>
  );
}

function StudentEditor({ item, onClose }: { item?: SchoolStudent; onClose: () => void }) {
  const { baseData, upsertStudent } = useAdminData();
  const firstClass = baseData.classes.find((schoolClass) => schoolClass.status === "active");
  const [values, setValues] = useState<StudentValues>(() => item ? {
    studentNumber: item.studentNumber,
    name: item.name,
    currentGradeId: item.currentGradeId,
    currentClassId: item.currentClassId,
    enrollmentStatus: item.enrollmentStatus,
  } : {
    studentNumber: "",
    name: "",
    currentGradeId: firstClass?.gradeId ?? "",
    currentClassId: firstClass?.classId ?? "",
    enrollmentStatus: "enrolled",
  });
  const [result, setResult] = useState<SystemActionResult | null>(null);
  const classes = baseData.classes.filter((schoolClass) => schoolClass.gradeId === values.currentGradeId && schoolClass.status === "active");

  function save() {
    const nextResult = upsertStudent(values, item?.studentId, item?.version);
    setResult(nextResult);
    if (nextResult.success) onClose();
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[min(720px,calc(100vh-48px))] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>{item ? "编辑学生" : "新增学生"}</DialogTitle><DialogDescription>{item ? "年级和班级变更请使用独立的学籍变更操作。" : "新增学生时会创建首条入学记录。"}</DialogDescription></DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="学号"><Input onChange={(event) => setValues((current) => ({ ...current, studentNumber: event.target.value }))} value={values.studentNumber} /></Field>
          <Field label="姓名"><Input onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} value={values.name} /></Field>
          <Field label="年级">
            <Select disabled={Boolean(item)} onValueChange={(value) => {
              const firstTargetClass = baseData.classes.find((schoolClass) => schoolClass.gradeId === value && schoolClass.status === "active");
              setValues((current) => ({ ...current, currentGradeId: value, currentClassId: firstTargetClass?.classId ?? "" }));
            }} value={values.currentGradeId}>
              <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{baseData.grades.filter((grade) => grade.status === "active").map((grade) => <SelectItem key={grade.gradeId} value={grade.gradeId}>{grade.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="班级">
            <Select disabled={Boolean(item)} onValueChange={(value) => setValues((current) => ({ ...current, currentClassId: value }))} value={values.currentClassId}>
              <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{classes.map((schoolClass) => <SelectItem key={schoolClass.classId} value={schoolClass.classId}>{schoolClass.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="学籍状态">
            <Select disabled={Boolean(item)} onValueChange={(value) => setValues((current) => ({ ...current, enrollmentStatus: value as EnrollmentStatus }))} value={values.enrollmentStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(enrollmentStatusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
        <ResultNotice result={result} />
        <DialogFooter><Button onClick={onClose} type="button" variant="outline">取消</Button><Button onClick={save} type="button">保存</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EnrollmentEditor({ item, onClose }: { item: SchoolStudent; onClose: () => void }) {
  const { baseData, updateEnrollment } = useAdminData();
  const [values, setValues] = useState<EnrollmentChangeValues>({
    changeType: "class_change",
    targetClassId: baseData.classes.find((schoolClass) => schoolClass.status === "active" && schoolClass.classId !== item.currentClassId)?.classId,
    effectiveDate: "2026-07-18",
    note: "",
  });
  const [result, setResult] = useState<SystemActionResult | null>(null);
  const needsClass = values.changeType === "class_change" || values.changeType === "grade_change";

  function save() {
    const nextResult = updateEnrollment(item.studentId, values);
    setResult(nextResult);
    if (nextResult.success) onClose();
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[min(720px,calc(100vh-48px))] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>学籍变更 · {item.name}</DialogTitle><DialogDescription>旧学籍阶段会保留并关闭，新阶段单独追加。</DialogDescription></DialogHeader>
        <div className="grid gap-4">
          <Field label="变更类型">
            <Select onValueChange={(value) => setValues((current) => ({ ...current, changeType: value as EnrollmentChangeValues["changeType"] }))} value={values.changeType}>
              <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="class_change">转班</SelectItem><SelectItem value="grade_change">升年级</SelectItem><SelectItem value="graduation">毕业</SelectItem><SelectItem value="left_school">离校</SelectItem></SelectContent>
            </Select>
          </Field>
          {needsClass ? (
            <Field label="目标班级">
              <Select onValueChange={(value) => setValues((current) => ({ ...current, targetClassId: value }))} value={values.targetClassId}>
                <SelectTrigger><SelectValue placeholder="选择目标班级" /></SelectTrigger><SelectContent>{baseData.classes.filter((schoolClass) => schoolClass.status === "active" && schoolClass.classId !== item.currentClassId).map((schoolClass) => <SelectItem key={schoolClass.classId} value={schoolClass.classId}>{getClassLabel(schoolClass.classId, baseData)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          ) : null}
          <Field label="生效日期"><Input onChange={(event) => setValues((current) => ({ ...current, effectiveDate: event.target.value }))} type="date" value={values.effectiveDate} /></Field>
          <Field label="备注"><Input onChange={(event) => setValues((current) => ({ ...current, note: event.target.value }))} value={values.note ?? ""} /></Field>
        </div>
        <ResultNotice result={result} />
        <DialogFooter><Button onClick={onClose} type="button" variant="outline">取消</Button><Button onClick={save} type="button">确认变更</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getStudentContext(student: SchoolStudent, data: ReturnType<typeof useAdminData>["baseData"]) {
  const schoolClass = data.classes.find((item) => item.classId === student.currentClassId);
  const grade = data.grades.find((item) => item.gradeId === student.currentGradeId);
  const headTeacher = data.teachers.find((item) => item.teacherId === schoolClass?.headTeacherId);
  return { gradeName: grade?.name ?? "-", className: schoolClass?.name ?? "-", headTeacherName: headTeacher?.name ?? "暂未指定" };
}

function getClassLabel(classId: string, data: ReturnType<typeof useAdminData>["baseData"]) {
  const schoolClass = data.classes.find((item) => item.classId === classId);
  const grade = data.grades.find((item) => item.gradeId === schoolClass?.gradeId);
  return `${grade?.name ?? "未知年级"}/${schoolClass?.name ?? "未知班级"}`;
}
