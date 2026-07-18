import {
  getTeacherDeactivationIssues,
  saveClass,
  saveGrade,
  saveStudent,
  saveTeacher,
  type AdminActionContext,
} from "@/lib/system-settings";
import type {
  AdminAuditLog,
  AdminBaseData,
  ImportDataType,
  ImportMode,
  ImportPreview,
  ImportPreviewRow,
  ImportRawRow,
  SchoolClass,
  SchoolGrade,
  SchoolStudent,
  SchoolTeacher,
  SystemActionResult,
  TeacherRole,
} from "@/types/system-settings";
import type { EnrollmentStatus } from "@/types/studentProfile";
import type { WarningItem } from "@/types/warning";

type BuildImportPreviewOptions = {
  dataType: ImportDataType;
  mode: ImportMode;
  sourceFileName: string;
  rows: ImportRawRow[];
  createdAt: string;
  warnings?: WarningItem[];
};

const roleValueMap: Record<string, TeacherRole> = {
  心理老师: "psychologist",
  班主任: "head_teacher",
  年级主任: "grade_director",
  校长: "principal",
  psychologist: "psychologist",
  head_teacher: "head_teacher",
  grade_director: "grade_director",
  principal: "principal",
};

const statusValueMap = {
  启用: "active",
  停用: "inactive",
  active: "active",
  inactive: "inactive",
} as const;

const enrollmentValueMap: Record<string, EnrollmentStatus> = {
  在校: "enrolled",
  已毕业: "graduated",
  离校: "left_school",
  enrolled: "enrolled",
  graduated: "graduated",
  left_school: "left_school",
};

export const importTemplateHeaders: Record<ImportDataType, string[]> = {
  organization: ["年级名称", "年级排序", "班级名称", "班主任工号"],
  teacher: ["工号", "姓名", "手机号", "角色", "负责年级", "负责班级", "状态"],
  student: ["学号", "姓名", "年级", "班级", "在校状态"],
};

export function buildImportPreview(
  data: AdminBaseData,
  options: BuildImportPreviewOptions,
): ImportPreview {
  const seenKeys = new Set<string>();
  const rows = options.rows.map((raw, index) => {
    const rowNumber = index + 2;
    const previewRow = options.dataType === "organization"
      ? previewOrganizationRow(data, raw, rowNumber, options.mode)
      : options.dataType === "teacher"
        ? previewTeacherRow(data, raw, rowNumber, options.mode, options.warnings ?? [], options.createdAt)
        : previewStudentRow(data, raw, rowNumber, options.mode);

    if (previewRow.naturalKey && seenKeys.has(previewRow.naturalKey)) {
      return {
        ...previewRow,
        resultType: "error" as const,
        messages: [...previewRow.messages, "文件内存在重复唯一键。"],
      };
    }
    seenKeys.add(previewRow.naturalKey);
    return previewRow;
  });

  return {
    previewId: `IMP-${simpleHash(`${options.sourceFileName}:${options.createdAt}:${JSON.stringify(options.rows)}`)}`,
    dataType: options.dataType,
    mode: options.mode,
    sourceFileName: options.sourceFileName,
    sourceHash: simpleHash(JSON.stringify(options.rows)),
    baseDataVersion: data.version,
    createdAt: options.createdAt,
    rows,
    summary: {
      total: rows.length,
      create: rows.filter((row) => row.resultType === "create").length,
      update: rows.filter((row) => row.resultType === "update").length,
      skip: rows.filter((row) => row.resultType === "skip").length,
      warning: rows.filter((row) => row.resultType === "warning").length,
      error: rows.filter((row) => row.resultType === "error").length,
    },
  };
}

export function commitImportPreview(
  data: AdminBaseData,
  warnings: WarningItem[],
  preview: ImportPreview,
  context: AdminActionContext,
  failAtRowNumber?: number,
): SystemActionResult {
  if (preview.confirmedAt || data.processedImportIds.includes(preview.previewId)) {
    return failure("该导入预览已经提交，不能重复确认。", "import_already_confirmed");
  }
  if (preview.baseDataVersion !== data.version) {
    return failure("基础资料已变化，请重新生成导入预览。", "base_data_version_conflict");
  }
  if (preview.summary.error > 0) {
    return failure("导入存在错误行，修正后才能确认。", "import_has_errors");
  }

  let working = structuredClone(data);
  for (const row of preview.rows) {
    if (row.resultType === "skip") continue;
    if (failAtRowNumber === row.rowNumber) {
      return failure(`第 ${row.rowNumber} 行提交失败，整批数据已回滚。`, "simulated_import_failure");
    }
    const result = applyImportRow(working, warnings, preview.dataType, row, context);
    if (!result.success) {
      return {
        success: false,
        message: `第 ${row.rowNumber} 行提交失败，整批数据已回滚。`,
        issues: result.issues,
      };
    }
    working = result.data;
  }

  const audit: AdminAuditLog = {
    id: `AUD-${String(working.adminAuditLogs.length + 1).padStart(5, "0")}`,
    action: "confirm_import",
    targetType: "import",
    targetIds: [preview.previewId],
    operatorId: context.operatorId,
    operatorName: context.operatorName,
    occurredAt: context.occurredAt,
    summary: `确认导入 ${preview.sourceFileName}：新增 ${preview.summary.create}，更新 ${preview.summary.update}，警告 ${preview.summary.warning}，跳过 ${preview.summary.skip}。`,
  };
  const committed = {
    ...working,
    adminAuditLogs: [audit, ...working.adminAuditLogs],
    processedImportIds: [...working.processedImportIds, preview.previewId],
    version: working.version + 1,
  };
  return {
    success: true,
    data: committed,
    message: `导入完成：新增 ${preview.summary.create}，更新 ${preview.summary.update}。`,
  };
}

function previewOrganizationRow(
  data: AdminBaseData,
  raw: ImportRawRow,
  rowNumber: number,
  mode: ImportMode,
): ImportPreviewRow {
  const gradeName = textValue(raw["年级名称"]);
  const className = textValue(raw["班级名称"]);
  const sortOrder = numberValue(raw["年级排序"]);
  const headTeacherStaffNumber = textValue(raw["班主任工号"]);
  const naturalKey = `${gradeName}/${className}`.toLocaleLowerCase();
  const grade = findGrade(data, gradeName);
  const schoolClass = grade ? findClass(data, grade.gradeId, className) : undefined;
  const headTeacher = headTeacherStaffNumber
    ? data.teachers.find((teacher) => normalized(teacher.staffNumber) === normalized(headTeacherStaffNumber))
    : undefined;
  const messages: string[] = [];

  if (!gradeName || !className || sortOrder === undefined) {
    messages.push("年级名称、年级排序和班级名称为必填项。");
  }
  if (headTeacherStaffNumber && (!headTeacher || headTeacher.status !== "active")) {
    messages.push("班主任工号不存在或教师未启用。");
  }
  if (mode === "insert_only" && (grade || schoolClass)) {
    messages.push("新增模式下年级或班级已存在。");
  }

  const normalizedRow: ImportRawRow = {
    gradeName,
    className,
    sortOrder: sortOrder ?? "",
    headTeacherId: headTeacher?.teacherId ?? "",
    gradeId: grade?.gradeId ?? "",
    classId: schoolClass?.classId ?? "",
    __operation: schoolClass ? "update" : "create",
  };
  if (messages.length) return rowResult(rowNumber, naturalKey, `${gradeName}${className}`, "error", normalizedRow, [], messages);

  const diffs = [
    diff("年级排序", grade?.sortOrder, sortOrder),
    diff("班主任", schoolClass?.headTeacherId, headTeacher?.teacherId),
  ].filter(isDefined);
  if (schoolClass && diffs.length === 0) {
    return rowResult(rowNumber, naturalKey, `${gradeName}${className}`, "skip", normalizedRow, [], ["内容无变化。"]);
  }
  return rowResult(
    rowNumber,
    naturalKey,
    `${gradeName}${className}`,
    schoolClass ? "update" : "create",
    normalizedRow,
    diffs,
    [],
  );
}

function previewTeacherRow(
  data: AdminBaseData,
  raw: ImportRawRow,
  rowNumber: number,
  mode: ImportMode,
  warnings: WarningItem[],
  currentTime: string,
): ImportPreviewRow {
  const staffNumber = textValue(raw["工号"]);
  const name = textValue(raw["姓名"]);
  const phone = textValue(raw["手机号"]);
  const roleTokens = listValue(raw["角色"]);
  const roles = roleTokens.map((role) => roleValueMap[role]).filter(Boolean);
  const gradeNames = listValue(raw["负责年级"]);
  const classNames = listValue(raw["负责班级"]);
  const status = statusValueMap[textValue(raw["状态"]) as keyof typeof statusValueMap];
  const existing = data.teachers.find((teacher) => normalized(teacher.staffNumber) === normalized(staffNumber));
  const gradeIds = gradeNames.map((nameValue) => findGrade(data, nameValue)?.gradeId).filter(Boolean);
  const classIds = classNames.map((nameValue) => findClassByDisplayName(data, nameValue)?.classId).filter(Boolean);
  const messages: string[] = [];

  if (!staffNumber || !name || roles.length === 0 || !status) {
    messages.push("工号、姓名、角色和状态为必填项，且必须使用模板枚举值。");
  }
  if (roles.length !== roleTokens.length) messages.push("存在无法识别的教师角色。");
  if (gradeIds.length !== gradeNames.length) messages.push("存在无法匹配的负责年级。");
  if (classIds.length !== classNames.length) messages.push("存在无法匹配的负责班级，请使用“年级/班级”格式。");
  if (mode === "insert_only" && existing) messages.push("新增模式下工号已存在。");
  if (existing?.status === "active" && status === "inactive") {
    messages.push(...getTeacherDeactivationIssues(data, warnings, existing, currentTime).map((issue) => issue.message));
  }

  const normalizedRow: ImportRawRow = {
    teacherId: existing?.teacherId ?? "",
    staffNumber,
    name,
    phone,
    roles: roles.join(","),
    gradeIds: gradeIds.join(","),
    classIds: classIds.join(","),
    status: status ?? "",
    __operation: existing ? "update" : "create",
  };
  if (messages.length) return rowResult(rowNumber, staffNumber, name, "error", normalizedRow, [], messages);

  const diffs = existing ? [
    diff("姓名", existing.name, name),
    diff("手机号", existing.phone, phone),
    diff("角色", existing.roles.join(","), roles.join(",")),
    diff("负责年级", existing.gradeIds.join(","), gradeIds.join(",")),
    diff("负责班级", existing.classIds.join(","), classIds.join(",")),
    diff("状态", existing.status, status),
  ].filter(isDefined) : [];
  if (existing && diffs.length === 0) {
    return rowResult(rowNumber, staffNumber, name, "skip", normalizedRow, [], ["内容无变化。"]);
  }
  const warningMessages = [];
  if (!phone) warningMessages.push("手机号为空，请确认后续联系信息。");
  if (existing && existing.name !== name) warningMessages.push("教师姓名发生变化，请核对工号与姓名。");
  return rowResult(
    rowNumber,
    staffNumber,
    name,
    warningMessages.length ? "warning" : existing ? "update" : "create",
    normalizedRow,
    diffs,
    warningMessages,
  );
}

function previewStudentRow(
  data: AdminBaseData,
  raw: ImportRawRow,
  rowNumber: number,
  mode: ImportMode,
): ImportPreviewRow {
  const studentNumber = textValue(raw["学号"]);
  const name = textValue(raw["姓名"]);
  const gradeName = textValue(raw["年级"]);
  const className = textValue(raw["班级"]);
  const enrollmentStatus = enrollmentValueMap[textValue(raw["在校状态"])];
  const grade = findGrade(data, gradeName);
  const schoolClass = grade ? findClass(data, grade.gradeId, className) : undefined;
  const existing = data.students.find((student) => normalized(student.studentNumber) === normalized(studentNumber));
  const messages: string[] = [];

  if (!studentNumber || !name || !gradeName || !className || !enrollmentStatus) {
    messages.push("学号、姓名、年级、班级和在校状态为必填项，且必须使用模板枚举值。");
  }
  if (!grade || !schoolClass) messages.push("年级或班级不存在，或班级不属于所选年级。");
  if (mode === "insert_only" && existing) messages.push("新增模式下学号已存在。");
  if (existing && existing.enrollmentStatus !== "enrolled" && enrollmentStatus === "enrolled") {
    messages.push("已毕业或离校学生恢复在校必须使用单独学籍操作。");
  }

  const normalizedRow: ImportRawRow = {
    studentId: existing?.studentId ?? "",
    studentNumber,
    name,
    currentGradeId: grade?.gradeId ?? "",
    currentClassId: schoolClass?.classId ?? "",
    enrollmentStatus: enrollmentStatus ?? "",
    __operation: existing ? "update" : "create",
  };
  if (messages.length) return rowResult(rowNumber, studentNumber, name, "error", normalizedRow, [], messages);

  const organizationChanged = Boolean(existing && (
    existing.currentGradeId !== grade?.gradeId
    || existing.currentClassId !== schoolClass?.classId
  ));
  const diffs = existing ? [
    diff("姓名", existing.name, name),
    diff("年级", existing.currentGradeId, grade?.gradeId),
    diff("班级", existing.currentClassId, schoolClass?.classId),
    diff("在校状态", existing.enrollmentStatus, enrollmentStatus),
  ].filter(isDefined) : [];
  if (existing && diffs.length === 0) {
    return rowResult(rowNumber, studentNumber, name, "skip", normalizedRow, [], ["内容无变化。"]);
  }
  const warnings = [];
  if (existing && existing.name !== name) warnings.push("学生姓名发生变化，请核对学号与姓名。");
  if (organizationChanged) warnings.push("学生年级或班级发生变化，确认后将新增学籍历史阶段。");
  return rowResult(
    rowNumber,
    studentNumber,
    name,
    warnings.length ? "warning" : existing ? "update" : "create",
    normalizedRow,
    diffs,
    warnings,
  );
}

function applyImportRow(
  data: AdminBaseData,
  warnings: WarningItem[],
  dataType: ImportDataType,
  row: ImportPreviewRow,
  context: AdminActionContext,
): SystemActionResult {
  const values = row.normalized;
  if (dataType === "organization") {
    let working = data;
    let grade = findGrade(working, String(values.gradeName));
    if (!grade) {
      const gradeResult = saveGrade(working, {
        name: String(values.gradeName),
        sortOrder: Number(values.sortOrder),
        status: "active",
      }, context);
      if (!gradeResult.success) return gradeResult;
      working = gradeResult.data;
      grade = findGrade(working, String(values.gradeName));
    } else if (grade.sortOrder !== Number(values.sortOrder)) {
      const gradeResult = saveGrade(working, {
        name: grade.name,
        sortOrder: Number(values.sortOrder),
        status: grade.status,
      }, context, grade.gradeId, grade.version);
      if (!gradeResult.success) return gradeResult;
      working = gradeResult.data;
      grade = findGrade(working, String(values.gradeName));
    }
    const schoolClass = grade ? findClass(working, grade.gradeId, String(values.className)) : undefined;
    return saveClass(working, {
      gradeId: grade?.gradeId ?? "",
      name: String(values.className),
      headTeacherId: String(values.headTeacherId) || undefined,
      status: schoolClass?.status ?? "active",
    }, context, schoolClass?.classId, schoolClass?.version);
  }

  if (dataType === "teacher") {
    const teacherId = String(values.teacherId) || undefined;
    const existing = teacherId ? data.teachers.find((teacher) => teacher.teacherId === teacherId) : undefined;
    return saveTeacher(data, warnings, {
      staffNumber: String(values.staffNumber),
      name: String(values.name),
      phone: String(values.phone) || undefined,
      roles: csvValues(values.roles) as TeacherRole[],
      gradeIds: csvValues(values.gradeIds),
      classIds: csvValues(values.classIds),
      status: String(values.status) as SchoolTeacher["status"],
    }, context, teacherId, existing?.version);
  }

  const studentId = String(values.studentId) || undefined;
  const existing = studentId ? data.students.find((student) => student.studentId === studentId) : undefined;
  const targetGradeId = String(values.currentGradeId);
  const targetClassId = String(values.currentClassId);
  if (existing && (
    existing.currentGradeId !== targetGradeId
    || existing.currentClassId !== targetClassId
  )) {
    const schoolClass = data.classes.find((item) => item.classId === targetClassId);
    const changeType = schoolClass?.gradeId === existing.currentGradeId ? "class_change" : "grade_change";
    const enrollmentResult = importEnrollmentChange(
      data,
      existing,
      targetGradeId,
      targetClassId,
      String(values.enrollmentStatus) as EnrollmentStatus,
      context,
      changeType,
    );
    if (!enrollmentResult.success) return enrollmentResult;
    data = enrollmentResult.data;
  }
  let refreshed = studentId ? data.students.find((student) => student.studentId === studentId) : undefined;
  const targetStatus = String(values.enrollmentStatus) as EnrollmentStatus;
  if (
    refreshed
    && refreshed.enrollmentStatus !== targetStatus
    && (targetStatus === "graduated" || targetStatus === "left_school")
  ) {
    const exitResult = importStudentExit(data, refreshed, targetStatus, context);
    if (!exitResult.success) return exitResult;
    data = exitResult.data;
    refreshed = data.students.find((student) => student.studentId === studentId);
  }
  return saveStudent(data, {
    studentNumber: String(values.studentNumber),
    name: String(values.name),
    currentGradeId: targetGradeId,
    currentClassId: targetClassId,
    enrollmentStatus: targetStatus,
  }, context, studentId, refreshed?.version);
}

function importStudentExit(
  data: AdminBaseData,
  student: SchoolStudent,
  status: "graduated" | "left_school",
  context: AdminActionContext,
): SystemActionResult {
  const endedAt = context.occurredAt.slice(0, 10);
  const updatedStudent = {
    ...student,
    enrollmentStatus: status,
    enrollmentHistory: student.enrollmentHistory.map((item) =>
      item.endedAt ? item : { ...item, endedAt },
    ),
    updatedAt: context.occurredAt,
    version: student.version + 1,
  };
  const audit: AdminAuditLog = {
    id: `AUD-${String(data.adminAuditLogs.length + 1).padStart(5, "0")}`,
    action: "import_enrollment_exit",
    targetType: "student",
    targetIds: [student.studentId],
    operatorId: context.operatorId,
    operatorName: context.operatorName,
    occurredAt: context.occurredAt,
    summary: `${student.name}：批量导入${status === "graduated" ? "毕业" : "离校"}。`,
  };
  return {
    success: true,
    data: {
      ...data,
      students: data.students.map((item) => item.studentId === student.studentId ? updatedStudent : item),
      adminAuditLogs: [audit, ...data.adminAuditLogs],
      version: data.version + 1,
    },
    message: "学籍状态已应用。",
  };
}

function importEnrollmentChange(
  data: AdminBaseData,
  student: SchoolStudent,
  gradeId: string,
  classId: string,
  enrollmentStatus: EnrollmentStatus,
  context: AdminActionContext,
  changeType: "class_change" | "grade_change",
): SystemActionResult {
  const targetClass = data.classes.find((item) => item.classId === classId);
  const targetGrade = data.grades.find((item) => item.gradeId === gradeId);
  if (!targetClass || !targetGrade || targetClass.gradeId !== targetGrade.gradeId) {
    return failure("导入学籍变更失败。", "student_class_mismatch");
  }
  const effectiveDate = context.occurredAt.slice(0, 10);
  const history = student.enrollmentHistory.map((item) =>
    item.endedAt ? item : { ...item, endedAt: previousDate(effectiveDate) },
  );
  history.unshift({
    id: `EH-${student.studentId}-${history.length + 1}`,
    studentId: student.studentId,
    grade: targetGrade.name,
    className: targetClass.name,
    changeType,
    startedAt: effectiveDate,
  });
  const updatedStudent = {
    ...student,
    currentGradeId: gradeId,
    currentClassId: classId,
    enrollmentStatus,
    enrollmentHistory: history,
    updatedAt: context.occurredAt,
    version: student.version + 1,
  };
  const audit: AdminAuditLog = {
    id: `AUD-${String(data.adminAuditLogs.length + 1).padStart(5, "0")}`,
    action: "import_enrollment_change",
    targetType: "student",
    targetIds: [student.studentId],
    operatorId: context.operatorId,
    operatorName: context.operatorName,
    occurredAt: context.occurredAt,
    summary: `${student.name}：批量导入${changeType === "grade_change" ? "升年级" : "转班"}。`,
  };
  return {
    success: true,
    data: {
      ...data,
      students: data.students.map((item) => item.studentId === student.studentId ? updatedStudent : item),
      adminAuditLogs: [audit, ...data.adminAuditLogs],
      version: data.version + 1,
    },
    message: "学籍变更已应用。",
  };
}

function rowResult(
  rowNumber: number,
  naturalKey: string,
  displayName: string,
  resultType: ImportPreviewRow["resultType"],
  normalizedRow: ImportRawRow,
  diffs: NonNullable<ImportPreviewRow["diffs"]>,
  messages: string[],
): ImportPreviewRow {
  return { rowNumber, naturalKey, displayName, resultType, normalized: normalizedRow, diffs, messages };
}

function diff(field: string, before: unknown, after: unknown) {
  const beforeValue = before === undefined || before === null ? "" : String(before);
  const afterValue = after === undefined || after === null ? "" : String(after);
  return beforeValue === afterValue ? undefined : { field, before: beforeValue, after: afterValue };
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function findGrade(data: AdminBaseData, name: string): SchoolGrade | undefined {
  return data.grades.find((grade) => normalized(grade.name) === normalized(name));
}

function findClass(data: AdminBaseData, gradeId: string, name: string): SchoolClass | undefined {
  return data.classes.find((schoolClass) =>
    schoolClass.gradeId === gradeId && normalized(schoolClass.name) === normalized(name),
  );
}

function findClassByDisplayName(data: AdminBaseData, value: string) {
  const [gradeName, className] = value.split("/").map((part) => part.trim());
  const grade = findGrade(data, gradeName ?? "");
  return grade ? findClass(data, grade.gradeId, className ?? "") : undefined;
}

function textValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function listValue(value: unknown) {
  return textValue(value).split(/[、,，;；]/).map((part) => part.trim()).filter(Boolean);
}

function csvValues(value: unknown) {
  return textValue(value).split(",").filter(Boolean);
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase();
}

function simpleHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function previousDate(date: string) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

function failure(message: string, code: string): SystemActionResult {
  return { success: false, message, issues: [{ code, message }] };
}
