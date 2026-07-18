import { useEffect, useState } from "react";

import { Field, ResultNotice } from "@/components/settings/SettingsShared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminData } from "@/state/AdminDataProvider";
import type { SchoolConfigValues, SystemActionResult } from "@/types/system-settings";
import { schoolTermLabels } from "@/types/system-settings";

export function SchoolSettingsPanel({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const { baseData, updateSchool } = useAdminData();
  const config = baseData.schoolConfig;
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<SchoolConfigValues>(() => toValues(config));
  const [result, setResult] = useState<SystemActionResult | null>(null);

  useEffect(() => {
    if (!editing) setValues(toValues(config));
  }, [config, editing]);

  const dirty = editing && JSON.stringify(values) !== JSON.stringify(toValues(config));
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  function update<Key extends keyof SchoolConfigValues>(key: Key, value: SchoolConfigValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setResult(null);
  }

  function save() {
    const nextResult = updateSchool(values, config.version);
    setResult(nextResult);
    if (nextResult.success) setEditing(false);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">学校信息</CardTitle>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">学校名称同步顶栏，当前学期同步校级总览默认统计周期。</p>
        </div>
        {!editing ? <Button onClick={() => setEditing(true)} type="button">编辑</Button> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="学校名称"><Input disabled={!editing} onChange={(event) => update("schoolName", event.target.value)} value={values.schoolName} /></Field>
          <Field label="学校编码"><Input disabled={!editing} onChange={(event) => update("schoolCode", event.target.value)} value={values.schoolCode} /></Field>
          <Field label="当前学年"><Input disabled={!editing} onChange={(event) => update("academicYear", event.target.value)} value={values.academicYear} /></Field>
          <Field label="当前学期">
            <Select disabled={!editing} onValueChange={(value) => update("term", value as SchoolConfigValues["term"])} value={values.term}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(schoolTermLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="学期开始日期"><Input disabled={!editing} onChange={(event) => update("termStart", event.target.value)} type="date" value={values.termStart} /></Field>
          <Field label="学期结束日期"><Input disabled={!editing} onChange={(event) => update("termEnd", event.target.value)} type="date" value={values.termEnd} /></Field>
        </div>
        <ResultNotice result={result} />
        {editing ? (
          <div className="flex justify-end gap-2">
            <Button onClick={() => { setEditing(false); setValues(toValues(config)); setResult(null); }} type="button" variant="outline">取消</Button>
            <Button onClick={save} type="button">保存</Button>
          </div>
        ) : (
          <div className="text-xs text-[var(--text-secondary)]">最后更新：{config.updatedAt} · {config.updatedBy}</div>
        )}
      </CardContent>
    </Card>
  );
}

function toValues(config: ReturnType<typeof useAdminData>["baseData"]["schoolConfig"]): SchoolConfigValues {
  return {
    schoolName: config.schoolName,
    schoolCode: config.schoolCode,
    academicYear: config.academicYear,
    term: config.term,
    termStart: config.termStart,
    termEnd: config.termEnd,
  };
}
