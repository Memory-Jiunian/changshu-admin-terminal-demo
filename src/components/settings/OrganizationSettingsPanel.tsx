import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";

import { Field, ResultNotice, StatusBadge } from "@/components/settings/SettingsShared";
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
import type {
  ClassValues,
  GradeValues,
  SchoolClass,
  SchoolGrade,
  SystemActionResult,
} from "@/types/system-settings";

type Editor =
  | { type: "grade"; item?: SchoolGrade }
  | { type: "class"; item?: SchoolClass }
  | null;

export function OrganizationSettingsPanel() {
  const { baseData } = useAdminData();
  const [editor, setEditor] = useState<Editor>(null);
  const activeTeachers = useMemo(
    () => baseData.teachers.filter((teacher) => teacher.status === "active"),
    [baseData.teachers],
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">组织架构</CardTitle>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">维护年级、班级及当前班主任。被引用的组织仅允许停用，不提供硬删除。</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setEditor({ type: "grade" })} size="sm" type="button" variant="outline"><Plus className="mr-1 h-4 w-4" />年级</Button>
          <Button onClick={() => setEditor({ type: "class" })} size="sm" type="button"><Plus className="mr-1 h-4 w-4" />班级</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <section>
          <h3 className="mb-2 text-sm font-semibold">年级</h3>
          <Table>
            <TableHeader><TableRow><TableHead>名称</TableHead><TableHead>排序</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
            <TableBody>
              {[...baseData.grades].sort((left, right) => left.sortOrder - right.sortOrder).map((grade) => (
                <TableRow key={grade.gradeId}>
                  <TableCell className="font-medium">{grade.name}</TableCell>
                  <TableCell>{grade.sortOrder}</TableCell>
                  <TableCell><StatusBadge active={grade.status === "active"} /></TableCell>
                  <TableCell className="text-right"><Button onClick={() => setEditor({ type: "grade", item: grade })} size="sm" type="button" variant="ghost"><Pencil className="mr-1 h-4 w-4" />编辑</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
        <section>
          <h3 className="mb-2 text-sm font-semibold">班级</h3>
          <Table>
            <TableHeader><TableRow><TableHead>年级</TableHead><TableHead>班级</TableHead><TableHead>班主任</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
            <TableBody>
              {baseData.classes.map((schoolClass) => {
                const grade = baseData.grades.find((item) => item.gradeId === schoolClass.gradeId);
                const headTeacher = baseData.teachers.find((item) => item.teacherId === schoolClass.headTeacherId);
                return (
                  <TableRow key={schoolClass.classId}>
                    <TableCell>{grade?.name ?? "未知年级"}</TableCell>
                    <TableCell className="font-medium">{schoolClass.name}</TableCell>
                    <TableCell>{headTeacher?.name ?? "暂未指定"}</TableCell>
                    <TableCell><StatusBadge active={schoolClass.status === "active"} /></TableCell>
                    <TableCell className="text-right"><Button onClick={() => setEditor({ type: "class", item: schoolClass })} size="sm" type="button" variant="ghost"><Pencil className="mr-1 h-4 w-4" />编辑</Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      </CardContent>
      <OrganizationEditor activeTeachers={activeTeachers} editor={editor} onClose={() => setEditor(null)} />
    </Card>
  );
}

function OrganizationEditor({
  editor,
  activeTeachers,
  onClose,
}: {
  editor: Editor;
  activeTeachers: ReturnType<typeof useAdminData>["baseData"]["teachers"];
  onClose: () => void;
}) {
  const { baseData, upsertClass, upsertGrade } = useAdminData();
  const [result, setResult] = useState<SystemActionResult | null>(null);
  const [gradeValues, setGradeValues] = useState<GradeValues>({ name: "", sortOrder: baseData.grades.length + 1, status: "active" });
  const [classValues, setClassValues] = useState<ClassValues>({ gradeId: baseData.grades.find((grade) => grade.status === "active")?.gradeId ?? "", name: "", status: "active" });

  function initialize(nextEditor: Editor) {
    setResult(null);
    if (nextEditor?.type === "grade") {
      setGradeValues(nextEditor.item
        ? { name: nextEditor.item.name, sortOrder: nextEditor.item.sortOrder, status: nextEditor.item.status }
        : { name: "", sortOrder: baseData.grades.length + 1, status: "active" });
    }
    if (nextEditor?.type === "class") {
      setClassValues(nextEditor.item
        ? { gradeId: nextEditor.item.gradeId, name: nextEditor.item.name, headTeacherId: nextEditor.item.headTeacherId, status: nextEditor.item.status }
        : { gradeId: baseData.grades.find((grade) => grade.status === "active")?.gradeId ?? "", name: "", status: "active" });
    }
  }

  function save() {
    if (!editor) return;
    const nextResult = editor.type === "grade"
      ? upsertGrade(gradeValues, editor.item?.gradeId, editor.item?.version)
      : upsertClass(classValues, editor.item?.classId, editor.item?.version);
    setResult(nextResult);
    if (nextResult.success) onClose();
  }

  return (
    <Dialog open={Boolean(editor)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-h-[min(720px,calc(100vh-48px))] overflow-y-auto sm:max-w-xl"
        onOpenAutoFocus={() => initialize(editor)}
      >
        <DialogHeader>
          <DialogTitle>{editor?.item ? "编辑" : "新增"}{editor?.type === "grade" ? "年级" : "班级"}</DialogTitle>
          <DialogDescription>保存前会校验唯一性、引用关系和当前版本。</DialogDescription>
        </DialogHeader>
        {editor?.type === "grade" ? (
          <div className="grid gap-4">
            <Field label="年级名称"><Input onChange={(event) => setGradeValues((current) => ({ ...current, name: event.target.value }))} value={gradeValues.name} /></Field>
            <Field label="排序"><Input min={1} onChange={(event) => setGradeValues((current) => ({ ...current, sortOrder: Number(event.target.value) }))} type="number" value={gradeValues.sortOrder} /></Field>
            <Field label="状态">
              <Select onValueChange={(value) => setGradeValues((current) => ({ ...current, status: value as GradeValues["status"] }))} value={gradeValues.status}>
                <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">启用</SelectItem><SelectItem value="inactive">停用</SelectItem></SelectContent>
              </Select>
            </Field>
          </div>
        ) : null}
        {editor?.type === "class" ? (
          <div className="grid gap-4">
            <Field label="所属年级">
              <Select onValueChange={(value) => setClassValues((current) => ({ ...current, gradeId: value }))} value={classValues.gradeId}>
                <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{baseData.grades.filter((grade) => grade.status === "active").map((grade) => <SelectItem key={grade.gradeId} value={grade.gradeId}>{grade.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="班级名称"><Input onChange={(event) => setClassValues((current) => ({ ...current, name: event.target.value }))} value={classValues.name} /></Field>
            <Field label="班主任">
              <Select onValueChange={(value) => setClassValues((current) => ({ ...current, headTeacherId: value === "none" ? undefined : value }))} value={classValues.headTeacherId ?? "none"}>
                <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">暂不指定</SelectItem>{activeTeachers.map((teacher) => <SelectItem key={teacher.teacherId} value={teacher.teacherId}>{teacher.name} · {teacher.staffNumber}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="状态">
              <Select onValueChange={(value) => setClassValues((current) => ({ ...current, status: value as ClassValues["status"] }))} value={classValues.status}>
                <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">启用</SelectItem><SelectItem value="inactive">停用</SelectItem></SelectContent>
              </Select>
            </Field>
          </div>
        ) : null}
        <ResultNotice result={result} />
        <DialogFooter><Button onClick={onClose} type="button" variant="outline">取消</Button><Button onClick={save} type="button">保存</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
