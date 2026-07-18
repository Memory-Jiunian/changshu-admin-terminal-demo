import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";

import { ResultNotice } from "@/components/settings/SettingsShared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getSystemImportTemplateCsv, parseSystemImportFile } from "@/lib/system-import-file";
import { buildImportPreview, commitImportPreview } from "@/lib/system-import";
import { useAdminData } from "@/state/AdminDataProvider";
import type {
  ImportDataType,
  ImportMode,
  ImportPreview,
  SystemActionResult,
} from "@/types/system-settings";

const dataTypeLabels: Record<ImportDataType, string> = {
  organization: "组织架构",
  teacher: "教师",
  student: "学生",
};

const resultTypeLabels: Record<ImportPreview["rows"][number]["resultType"], string> = {
  create: "新增",
  update: "更新",
  skip: "跳过",
  warning: "警告",
  error: "错误",
};

export function BatchImportPanel() {
  const { baseData, currentOperator, replaceBaseData, warnings } = useAdminData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataType, setDataType] = useState<ImportDataType>("student");
  const [mode, setMode] = useState<ImportMode>("upsert");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<SystemActionResult | null>(null);

  async function handleFile(file?: File) {
    setPreview(null);
    setResult(null);
    setParseError("");
    if (!file) return;
    setFileName(file.name);
    setParsing(true);
    try {
      const rows = await parseSystemImportFile(file, dataType);
      setPreview(buildImportPreview(baseData, {
        dataType,
        mode,
        sourceFileName: file.name,
        rows,
        createdAt: formatCurrentTime(),
        warnings,
      }));
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "文件解析失败。");
    } finally {
      setParsing(false);
    }
  }

  function confirmImport() {
    if (!preview) return;
    const context = {
      operatorId: currentOperator.teacherId,
      operatorName: currentOperator.name,
      occurredAt: formatCurrentTime(),
    };
    const commitResult = commitImportPreview(baseData, warnings, preview, context);
    if (!commitResult.success) {
      setResult(commitResult);
      return;
    }
    const replaceResult = replaceBaseData(commitResult.data, preview.baseDataVersion);
    setResult(replaceResult.success ? commitResult : replaceResult);
    if (replaceResult.success) {
      setPreview((current) => current ? { ...current, confirmedAt: context.occurredAt } : current);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([getSystemImportTemplateCsv(dataType)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${dataTypeLabels[dataType]}导入模板.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">批量导入</CardTitle>
        <p className="text-sm text-[var(--text-secondary)]">固定模板导入必须先预览和校验；存在错误时不能确认，提交失败整批回滚。</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-[180px_180px_1fr_auto]">
          <Select onValueChange={(value) => { setDataType(value as ImportDataType); setPreview(null); setFileName(""); }} value={dataType}>
            <SelectTrigger aria-label="数据类型"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(dataTypeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={(value) => { setMode(value as ImportMode); setPreview(null); }} value={mode}>
            <SelectTrigger aria-label="导入模式"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="insert_only">仅新增</SelectItem><SelectItem value="upsert">新增或更新</SelectItem></SelectContent>
          </Select>
          <button className="flex h-9 items-center rounded-md border border-dashed px-3 text-left text-sm text-[var(--text-secondary)] hover:border-[var(--primary-400)]" onClick={() => fileInputRef.current?.click()} type="button">
            <Upload className="mr-2 h-4 w-4" />{fileName || "选择 .xlsx 或 .csv 文件"}
          </button>
          <Button onClick={downloadTemplate} type="button" variant="outline"><Download className="mr-1 h-4 w-4" />下载模板</Button>
          <input accept=".xlsx,.csv" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} ref={fileInputRef} type="file" />
        </div>

        {parsing ? <div className="rounded-md bg-[var(--bg-subtle)] p-4 text-sm"><FileSpreadsheet className="mr-2 inline h-4 w-4" />正在解析并校验...</div> : null}
        {parseError ? <div className="rounded-md border border-[var(--danger-200)] bg-[var(--danger-50)] p-3 text-sm text-[var(--danger-700)]" role="alert">{parseError}</div> : null}

        {preview ? (
          <>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
              <Summary label="总行数" value={preview.summary.total} />
              <Summary label="新增" value={preview.summary.create} />
              <Summary label="更新" value={preview.summary.update} />
              <Summary label="警告" value={preview.summary.warning} />
              <Summary label="错误" value={preview.summary.error} />
              <Summary label="跳过" value={preview.summary.skip} />
            </div>
            <div className="max-h-[420px] overflow-auto rounded-md border">
              <Table>
                <TableHeader><TableRow><TableHead>行号</TableHead><TableHead>唯一键</TableHead><TableHead>名称</TableHead><TableHead>结果</TableHead><TableHead>差异 / 校验信息</TableHead></TableRow></TableHeader>
                <TableBody>
                  {preview.rows.map((row) => (
                    <TableRow key={`${row.rowNumber}-${row.naturalKey}`}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell className="font-mono text-xs">{row.naturalKey || "-"}</TableCell>
                      <TableCell>{row.displayName || "-"}</TableCell>
                      <TableCell><Badge variant={row.resultType === "error" ? "destructive" : "outline"}>{resultTypeLabels[row.resultType]}</Badge></TableCell>
                      <TableCell className="min-w-72 text-xs text-[var(--text-secondary)]">
                        {row.diffs.map((item) => `${item.field}：${item.before || "空"} → ${item.after || "空"}`).join("；")}
                        {row.diffs.length && row.messages.length ? "；" : ""}
                        {row.messages.join("；") || (row.diffs.length ? "" : "无变化")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-[var(--text-secondary)]">预览基于资料版本 {preview.baseDataVersion}。资料变化后必须重新预览。</p>
              <Button disabled={preview.summary.error > 0 || Boolean(preview.confirmedAt)} onClick={confirmImport} type="button">{preview.confirmedAt ? "已确认导入" : "确认导入"}</Button>
            </div>
          </>
        ) : null}
        <ResultNotice result={result} />
      </CardContent>
    </Card>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return <div className="rounded-md bg-[var(--bg-subtle)] px-3 py-2"><div className="text-xs text-[var(--text-secondary)]">{label}</div><div className="mt-1 text-xl font-semibold">{value}</div></div>;
}

function formatCurrentTime() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
