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
  SchoolTeacher,
  SystemActionResult,
  TeacherRole,
  TeacherValues,
} from "@/types/system-settings";
import { teacherRoleLabels } from "@/types/system-settings";

const PAGE_SIZE = 12;
const roleOptions = Object.entries(teacherRoleLabels) as [TeacherRole, string][];

export function TeacherSettingsPanel() {
  const { baseData } = useAdminData();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<SchoolTeacher | "new" | null>(null);
  const filtered = useMemo(() => baseData.teachers.filter((teacher) =>
    (!keyword.trim() || `${teacher.name}${teacher.staffNumber}${teacher.phone ?? ""}`.toLocaleLowerCase().includes(keyword.trim().toLocaleLowerCase()))
    && (status === "all" || teacher.status === status),
  ), [baseData.teachers, keyword, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const items = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div><CardTitle className="text-lg">教师管理</CardTitle><p className="mt-1 text-sm text-[var(--text-secondary)]">维护教师当前资料和校内角色，历史业务记录保留原快照。</p></div>
          <Button onClick={() => setEditor("new")} size="sm" type="button"><Plus className="mr-1 h-4 w-4" />新增教师</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_180px]">
          <Input onChange={(event) => { setKeyword(event.target.value); setPage(1); }} placeholder="搜索姓名、工号或手机号" value={keyword} />
          <Select onValueChange={(value) => { setStatus(value as typeof status); setPage(1); }} value={status}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">全部状态</SelectItem><SelectItem value="active">启用</SelectItem><SelectItem value="inactive">停用</SelectItem></SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>姓名 / 工号</TableHead><TableHead>角色</TableHead><TableHead>负责范围</TableHead><TableHead>手机号</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((teacher) => (
              <TableRow key={teacher.teacherId}>
                <TableCell><div className="font-medium">{teacher.name}</div><div className="text-xs text-[var(--text-secondary)]">{teacher.staffNumber}</div></TableCell>
                <TableCell>{teacher.roles.map((role) => teacherRoleLabels[role]).join("、")}</TableCell>
                <TableCell className="max-w-56 text-xs text-[var(--text-secondary)]">{getTeacherScope(teacher, baseData)}</TableCell>
                <TableCell>{teacher.phone ?? "-"}</TableCell>
                <TableCell><StatusBadge active={teacher.status === "active"} /></TableCell>
                <TableCell className="text-right"><Button onClick={() => setEditor(teacher)} size="sm" type="button" variant="ghost"><Pencil className="mr-1 h-4 w-4" />编辑</Button></TableCell>
              </TableRow>
            ))}
            {items.length === 0 ? <TableRow><TableCell className="h-32 text-center text-[var(--text-secondary)]" colSpan={6}>没有符合条件的教师</TableCell></TableRow> : null}
          </TableBody>
        </Table>
        <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-secondary)]">
          <span>共 {filtered.length} 位教师</span>
          <div className="flex items-center gap-2"><Button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} size="sm" type="button" variant="outline">上一页</Button><span>{currentPage} / {totalPages}</span><Button disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} size="sm" type="button" variant="outline">下一页</Button></div>
        </div>
      </CardContent>
      {editor ? <TeacherEditor key={editor === "new" ? "new" : editor.teacherId} item={editor === "new" ? undefined : editor} onClose={() => setEditor(null)} /> : null}
    </Card>
  );
}

function TeacherEditor({ item, onClose }: { item?: SchoolTeacher; onClose: () => void }) {
  const { baseData, upsertTeacher } = useAdminData();
  const [values, setValues] = useState<TeacherValues>(() => item ? toValues(item) : {
    staffNumber: "",
    name: "",
    phone: "",
    roles: [],
    gradeIds: [],
    classIds: [],
    status: "active",
  });
  const [result, setResult] = useState<SystemActionResult | null>(null);

  function toggleRole(role: TeacherRole) {
    setValues((current) => ({
      ...current,
      roles: current.roles.includes(role) ? current.roles.filter((itemRole) => itemRole !== role) : [...current.roles, role],
    }));
  }

  function save() {
    const nextResult = upsertTeacher(values, item?.teacherId, item?.version);
    setResult(nextResult);
    if (nextResult.success) onClose();
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[min(720px,calc(100vh-48px))] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{item ? "编辑教师" : "新增教师"}</DialogTitle><DialogDescription>停用前会检查活动预警、当前班主任和未来干预预约引用。</DialogDescription></DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="工号"><Input onChange={(event) => setValues((current) => ({ ...current, staffNumber: event.target.value }))} value={values.staffNumber} /></Field>
          <Field label="姓名"><Input onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} value={values.name} /></Field>
          <Field label="手机号"><Input onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))} value={values.phone ?? ""} /></Field>
          <Field label="状态">
            <Select onValueChange={(value) => setValues((current) => ({ ...current, status: value as TeacherValues["status"] }))} value={values.status}>
              <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">启用</SelectItem><SelectItem value="inactive">停用</SelectItem></SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="校内角色">
          <div className="flex flex-wrap gap-3 rounded-md border p-3">
            {roleOptions.map(([role, label]) => <label className="flex items-center gap-2 text-sm" key={role}><input checked={values.roles.includes(role)} onChange={() => toggleRole(role)} type="checkbox" />{label}</label>)}
          </div>
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="负责年级" hint="当前 Demo 使用单选快速维护。">
            <Select onValueChange={(value) => setValues((current) => ({ ...current, gradeIds: value === "none" ? [] : [value] }))} value={values.gradeIds[0] ?? "none"}>
              <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">不指定</SelectItem>{baseData.grades.filter((grade) => grade.status === "active").map((grade) => <SelectItem key={grade.gradeId} value={grade.gradeId}>{grade.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="负责班级" hint="班主任关系以班级中的班主任字段为准。">
            <Select onValueChange={(value) => setValues((current) => ({ ...current, classIds: value === "none" ? [] : [value] }))} value={values.classIds[0] ?? "none"}>
              <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">不指定</SelectItem>{baseData.classes.filter((schoolClass) => schoolClass.status === "active").map((schoolClass) => <SelectItem key={schoolClass.classId} value={schoolClass.classId}>{getClassLabel(schoolClass.classId, baseData)}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
        <ResultNotice result={result} />
        <DialogFooter><Button onClick={onClose} type="button" variant="outline">取消</Button><Button onClick={save} type="button">保存</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function toValues(teacher: SchoolTeacher): TeacherValues {
  const { teacherId: _teacherId, updatedAt: _updatedAt, version: _version, ...values } = teacher;
  return { ...values, roles: [...values.roles], gradeIds: [...values.gradeIds], classIds: [...values.classIds] };
}

function getClassLabel(classId: string, data: ReturnType<typeof useAdminData>["baseData"]) {
  const schoolClass = data.classes.find((item) => item.classId === classId);
  const grade = data.grades.find((item) => item.gradeId === schoolClass?.gradeId);
  return `${grade?.name ?? "未知年级"}/${schoolClass?.name ?? "未知班级"}`;
}

function getTeacherScope(teacher: SchoolTeacher, data: ReturnType<typeof useAdminData>["baseData"]) {
  const gradeNames = teacher.gradeIds.map((id) => data.grades.find((grade) => grade.gradeId === id)?.name).filter(Boolean);
  const classNames = teacher.classIds.map((id) => getClassLabel(id, data));
  return [...gradeNames, ...classNames].join("、") || "未指定";
}
