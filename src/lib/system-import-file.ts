import { readSheet } from "read-excel-file/browser";

import { importTemplateHeaders } from "@/lib/system-import";
import type { ImportCellValue, ImportDataType, ImportRawRow } from "@/types/system-settings";

const supportedExtensions = [".xlsx", ".csv"];

export async function parseSystemImportFile(
  file: File,
  dataType: ImportDataType,
): Promise<ImportRawRow[]> {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLocaleLowerCase();
  if (!supportedExtensions.includes(extension)) {
    throw new Error("仅支持 .xlsx 和 .csv 文件。");
  }

  const matrix: unknown[][] = extension === ".xlsx"
    ? await readSheet(file)
    : parseCsv(await file.text());
  if (matrix.length === 0) throw new Error("导入文件为空。");

  const headers = matrix[0].map((cell) => String(cell ?? "").trim());
  const requiredHeaders = importTemplateHeaders[dataType];
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
  if (missingHeaders.length) {
    throw new Error(`模板字段缺失：${missingHeaders.join("、")}。`);
  }

  return matrix.slice(1)
    .filter((row) => row.some((cell) => String(cell ?? "").trim()))
    .map((row) => Object.fromEntries(
      headers.map((header, index) => [header, normalizeCell(row[index])]),
    ));
}

export function getSystemImportTemplateCsv(dataType: ImportDataType) {
  const rows: Record<ImportDataType, string[]> = {
    organization: ["初一,1,1班,HT-001"],
    teacher: ["T-001,王老师,13800000000,班主任,初一,初一/1班,启用"],
    student: ["20260001,张同学,初一,1班,在校"],
  };
  return `\uFEFF${importTemplateHeaders[dataType].join(",")}\r\n${rows[dataType][0]}\r\n`;
}

function normalizeCell(value: unknown): ImportCellValue {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  return value === null || value === undefined ? null : String(value);
}

function parseCsv(content: string): ImportCellValue[][] {
  const rows: ImportCellValue[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (character === "\"") {
      if (quoted && content[index + 1] === "\"") {
        cell += "\"";
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && content[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  row.push(cell);
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}
