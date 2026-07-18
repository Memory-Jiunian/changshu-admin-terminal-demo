import type { StudentProfileRecord } from "@/types/studentProfile";
import type {
  AdminAuditLog,
  AdminAuditTargetType,
  AdminBaseData,
  ClassValues,
  EnrollmentChangeValues,
  GradeValues,
  SchoolClass,
  SchoolConfigValues,
  SchoolStudent,
  SchoolTeacher,
  StudentValues,
  SystemActionIssue,
  SystemActionResult,
  TeacherValues,
} from "@/types/system-settings";
import type { WarningItem } from "@/types/warning";

export type AdminActionContext = {
  operatorId: string;
  operatorName: string;
  occurredAt: string;
};

function normalized(value: string) {
  return value.trim().toLocaleLowerCase();
}

function success(data: AdminBaseData, message: string): SystemActionResult {
  return { success: true, data, message };
}

function failure(message: string, issues: SystemActionIssue[]): SystemActionResult {
  return { success: false, message, issues };
}

function nextId(prefix: string, data: AdminBaseData) {
  return `${prefix}-${String(data.version + 1).padStart(4, "0")}`;
}

function appendAudit(
  data: AdminBaseData,
  context: AdminActionContext,
  action: string,
  targetType: AdminAuditTargetType,
  targetIds: string[],
  summary: string,
): AdminBaseData {
  const log: AdminAuditLog = {
    id: `AUD-${String(data.adminAuditLogs.length + 1).padStart(5, "0")}`,
    action,
    targetType,
    targetIds,
    operatorId: context.operatorId,
    operatorName: context.operatorName,
    occurredAt: context.occurredAt,
    summary,
  };
  return {
    ...data,
    adminAuditLogs: [log, ...data.adminAuditLogs],
    version: data.version + 1,
  };
}

export function getSchoolTermRange(data: AdminBaseData) {
  const { schoolConfig } = data;
  return {
    label: `${schoolConfig.academicYear} ${schoolConfig.term === "first" ? "第一学期" : "第二学期"}`,
    start: `${schoolConfig.termStart} 00:00`,
    end: `${schoolConfig.termEnd} 23:59`,
  };
}

export function getCurrentTeacher(data: AdminBaseData, teacherId: string) {
  return data.teachers.find((teacher) => teacher.teacherId === teacherId);
}

export function getClassContext(data: AdminBaseData, classId: string) {
  const schoolClass = data.classes.find((item) => item.classId === classId);
  const grade = schoolClass
    ? data.grades.find((item) => item.gradeId === schoolClass.gradeId)
    : undefined;
  const headTeacher = schoolClass?.headTeacherId
    ? data.teachers.find((item) => item.teacherId === schoolClass.headTeacherId)
    : undefined;
  return { schoolClass, grade, headTeacher };
}

export function buildStudentProfileRecords(
  data: AdminBaseData,
  warnings: WarningItem[],
): StudentProfileRecord[] {
  const warningIdsByStudent = new Map<string, string[]>();
  warnings.forEach((warning) => {
    const ids = warningIdsByStudent.get(warning.studentId) ?? [];
    ids.push(warning.id);
    warningIdsByStudent.set(warning.studentId, ids);
  });

  return data.students.map((student) => {
    const { schoolClass, grade, headTeacher } = getClassContext(data, student.currentClassId);
    return {
      studentId: student.studentId,
      studentName: student.name,
      studentNumber: student.studentNumber,
      currentGrade: grade?.name ?? "未分配年级",
      currentClass: schoolClass?.name ?? "未分配班级",
      currentHeadTeacher: headTeacher?.name ?? "暂未指定",
      enrollmentStatus: student.enrollmentStatus,
      updatedAt: student.updatedAt,
      enrollmentHistory: student.enrollmentHistory.map((item) => ({ ...item })),
      warningCaseIds: [...(warningIdsByStudent.get(student.studentId) ?? [])],
    };
  });
}

export function buildCurrentWarningViews(
  data: AdminBaseData,
  warnings: WarningItem[],
): WarningItem[] {
  return warnings.map((warning) => {
    const student = data.students.find((item) => item.studentId === warning.studentId);
    const schoolClass = student
      ? data.classes.find((item) => item.classId === student.currentClassId)
      : undefined;
    const headTeacher = schoolClass?.headTeacherId
      ? data.teachers.find((item) => item.teacherId === schoolClass.headTeacherId)
      : undefined;
    const responsibleTeacher = warning.responsibleTeacherId
      ? data.teachers.find((item) => item.teacherId === warning.responsibleTeacherId)
      : data.teachers.find((item) => item.name === warning.responsibleTeacher);

    return {
      ...warning,
      responsibleTeacherId: responsibleTeacher?.teacherId ?? warning.responsibleTeacherId,
      responsibleTeacher: responsibleTeacher?.name ?? warning.responsibleTeacher,
      headTeacherName: headTeacher?.name ?? warning.headTeacherName,
      headTeacherPhone: headTeacher?.phone
        ? maskPhone(headTeacher.phone)
        : warning.headTeacherPhone,
    };
  });
}

export function updateSchoolConfig(
  data: AdminBaseData,
  values: SchoolConfigValues,
  context: AdminActionContext,
  expectedVersion = data.schoolConfig.version,
): SystemActionResult {
  const issues: SystemActionIssue[] = [];
  if (!values.schoolName.trim()) issues.push({ code: "school_name_required", message: "学校名称不能为空。" });
  if (!values.schoolCode.trim()) issues.push({ code: "school_code_required", message: "学校编码不能为空。" });
  if (values.termStart >= values.termEnd) {
    issues.push({ code: "invalid_term_range", message: "学期开始日期必须早于结束日期。" });
  }
  if (expectedVersion !== data.schoolConfig.version) {
    issues.push({ code: "version_conflict", message: "学校信息已更新，请重新加载后再保存。" });
  }
  if (issues.length) return failure("学校信息保存失败。", issues);

  const updated = {
    ...data,
    schoolConfig: {
      ...data.schoolConfig,
      ...values,
      schoolName: values.schoolName.trim(),
      schoolCode: values.schoolCode.trim(),
      updatedAt: context.occurredAt,
      updatedBy: context.operatorName,
      version: data.schoolConfig.version + 1,
    },
  };
  return success(
    appendAudit(updated, context, "update_school", "school", [data.schoolConfig.schoolId], "更新学校信息与当前学期。"),
    "学校信息已保存。",
  );
}

export function saveGrade(
  data: AdminBaseData,
  values: GradeValues,
  context: AdminActionContext,
  gradeId?: string,
  expectedVersion?: number,
): SystemActionResult {
  const existing = gradeId ? data.grades.find((grade) => grade.gradeId === gradeId) : undefined;
  const issues: SystemActionIssue[] = [];
  if (!values.name.trim()) issues.push({ code: "grade_name_required", message: "年级名称不能为空。" });
  if (data.grades.some((grade) => grade.gradeId !== gradeId && normalized(grade.name) === normalized(values.name))) {
    issues.push({ code: "duplicate_grade", message: "年级名称在学校内必须唯一。" });
  }
  if (existing && expectedVersion !== undefined && existing.version !== expectedVersion) {
    issues.push({ code: "version_conflict", message: "年级信息已更新，请重新加载后再保存。" });
  }
  if (
    existing
    && existing.status === "active"
    && values.status === "inactive"
    && data.classes.some((schoolClass) => schoolClass.gradeId === existing.gradeId && schoolClass.status === "active")
  ) {
    issues.push({ code: "grade_has_classes", message: "该年级仍有启用班级，不能停用。" });
  }
  if (issues.length) return failure("年级保存失败。", issues);

  const targetId = existing?.gradeId ?? nextId("GRD", data);
  const grade = {
    gradeId: targetId,
    name: values.name.trim(),
    sortOrder: values.sortOrder,
    status: values.status,
    version: (existing?.version ?? 0) + 1,
  };
  const updated = {
    ...data,
    grades: existing
      ? data.grades.map((item) => item.gradeId === targetId ? grade : item)
      : [...data.grades, grade],
  };
  return success(
    appendAudit(updated, context, existing ? "update_grade" : "create_grade", "grade", [targetId], `${existing ? "更新" : "新增"}年级：${grade.name}。`),
    existing ? "年级已更新。" : "年级已新增。",
  );
}

export function saveClass(
  data: AdminBaseData,
  values: ClassValues,
  context: AdminActionContext,
  classId?: string,
  expectedVersion?: number,
): SystemActionResult {
  const existing = classId ? data.classes.find((item) => item.classId === classId) : undefined;
  const grade = data.grades.find((item) => item.gradeId === values.gradeId);
  const headTeacher = values.headTeacherId
    ? data.teachers.find((item) => item.teacherId === values.headTeacherId)
    : undefined;
  const issues: SystemActionIssue[] = [];
  if (!grade || grade.status !== "active") issues.push({ code: "invalid_grade", message: "班级必须属于启用年级。" });
  if (!values.name.trim()) issues.push({ code: "class_name_required", message: "班级名称不能为空。" });
  if (data.classes.some((item) =>
    item.classId !== classId
    && item.gradeId === values.gradeId
    && normalized(item.name) === normalized(values.name),
  )) {
    issues.push({ code: "duplicate_class", message: "同一年级内班级名称必须唯一。" });
  }
  if (values.headTeacherId && (!headTeacher || headTeacher.status !== "active")) {
    issues.push({ code: "invalid_head_teacher", message: "班主任必须是启用教师。" });
  }
  if (existing && expectedVersion !== undefined && existing.version !== expectedVersion) {
    issues.push({ code: "version_conflict", message: "班级信息已更新，请重新加载后再保存。" });
  }
  if (
    existing
    && existing.status === "active"
    && values.status === "inactive"
    && data.students.some((student) => student.currentClassId === existing.classId && student.enrollmentStatus === "enrolled")
  ) {
    issues.push({ code: "class_has_students", message: "该班级仍有在校学生，不能停用。" });
  }
  if (issues.length) return failure("班级保存失败。", issues);

  const targetId = existing?.classId ?? nextId("CLS", data);
  const schoolClass: SchoolClass = {
    classId: targetId,
    gradeId: values.gradeId,
    name: values.name.trim(),
    headTeacherId: values.headTeacherId || undefined,
    status: values.status,
    version: (existing?.version ?? 0) + 1,
  };
  const updated = {
    ...data,
    classes: existing
      ? data.classes.map((item) => item.classId === targetId ? schoolClass : item)
      : [...data.classes, schoolClass],
  };
  return success(
    appendAudit(updated, context, existing ? "update_class" : "create_class", "class", [targetId], `${existing ? "更新" : "新增"}班级：${grade?.name ?? ""}${schoolClass.name}。`),
    existing ? "班级已更新。" : "班级已新增。",
  );
}

export function getTeacherDeactivationIssues(
  data: AdminBaseData,
  warnings: WarningItem[],
  teacher: SchoolTeacher,
  currentTime: string,
): SystemActionIssue[] {
  const issues: SystemActionIssue[] = [];
  const activeWarningIds = warnings
    .filter((warning) =>
      warning.isActive
      && warning.currentStatus !== "closed"
      && (
        warning.responsibleTeacherId === teacher.teacherId
        || (!warning.responsibleTeacherId && warning.responsibleTeacher === teacher.name)
      ),
    )
    .map((warning) => warning.id);
  if (activeWarningIds.length) {
    issues.push({
      code: "teacher_owns_active_warnings",
      message: `该教师仍负责 ${activeWarningIds.length} 条活动预警。`,
      referenceIds: activeWarningIds,
    });
  }
  const classIds = data.classes
    .filter((schoolClass) => schoolClass.status === "active" && schoolClass.headTeacherId === teacher.teacherId)
    .map((schoolClass) => schoolClass.classId);
  if (classIds.length) {
    issues.push({
      code: "teacher_is_head_teacher",
      message: `该教师仍担任 ${classIds.length} 个班级的班主任。`,
      referenceIds: classIds,
    });
  }
  const appointmentIds = warnings.flatMap((warning) =>
    warning.interventionAppointments
      .filter((appointment) =>
        appointment.status === "planned"
        && appointment.plannedAt > currentTime
        && (
          appointment.responsibleTeacher === teacher.name
          || warning.responsibleTeacherId === teacher.teacherId
        ),
      )
      .map((appointment) => appointment.id),
  );
  if (appointmentIds.length) {
    issues.push({
      code: "teacher_owns_future_appointments",
      message: `该教师仍负责 ${appointmentIds.length} 条未来干预预约。`,
      referenceIds: appointmentIds,
    });
  }
  return issues;
}

export function saveTeacher(
  data: AdminBaseData,
  warnings: WarningItem[],
  values: TeacherValues,
  context: AdminActionContext,
  teacherId?: string,
  expectedVersion?: number,
): SystemActionResult {
  const existing = teacherId ? data.teachers.find((teacher) => teacher.teacherId === teacherId) : undefined;
  const issues: SystemActionIssue[] = [];
  if (!values.staffNumber.trim()) issues.push({ code: "staff_number_required", message: "工号不能为空。" });
  if (!values.name.trim()) issues.push({ code: "teacher_name_required", message: "教师姓名不能为空。" });
  if (values.roles.length === 0) issues.push({ code: "teacher_role_required", message: "至少选择一个校内角色。" });
  if (data.teachers.some((teacher) =>
    teacher.teacherId !== teacherId && normalized(teacher.staffNumber) === normalized(values.staffNumber),
  )) {
    issues.push({ code: "duplicate_staff_number", message: "工号已存在。" });
  }
  if (existing && expectedVersion !== undefined && existing.version !== expectedVersion) {
    issues.push({ code: "version_conflict", message: "教师信息已更新，请重新加载后再保存。" });
  }
  const candidate: SchoolTeacher = {
    teacherId: existing?.teacherId ?? nextId("TCH", data),
    ...values,
    staffNumber: values.staffNumber.trim(),
    name: values.name.trim(),
    phone: values.phone?.trim() || undefined,
    updatedAt: context.occurredAt,
    version: (existing?.version ?? 0) + 1,
  };
  if (existing?.status === "active" && candidate.status === "inactive") {
    issues.push(...getTeacherDeactivationIssues(data, warnings, existing, context.occurredAt));
  }
  if (issues.length) return failure("教师保存失败。", issues);

  const updated = {
    ...data,
    teachers: existing
      ? data.teachers.map((teacher) => teacher.teacherId === candidate.teacherId ? candidate : teacher)
      : [...data.teachers, candidate],
  };
  return success(
    appendAudit(updated, context, existing ? "update_teacher" : "create_teacher", "teacher", [candidate.teacherId], `${existing ? "更新" : "新增"}教师：${candidate.name}。`),
    existing ? "教师已更新。" : "教师已新增。",
  );
}

function validateStudentOrganization(data: AdminBaseData, values: StudentValues) {
  const schoolClass = data.classes.find((item) => item.classId === values.currentClassId);
  const grade = data.grades.find((item) => item.gradeId === values.currentGradeId);
  if (!grade || !schoolClass || schoolClass.gradeId !== grade.gradeId) {
    return { code: "student_class_mismatch", message: "学生班级必须属于所选年级。" };
  }
  return undefined;
}

export function saveStudent(
  data: AdminBaseData,
  values: StudentValues,
  context: AdminActionContext,
  studentId?: string,
  expectedVersion?: number,
): SystemActionResult {
  const existing = studentId ? data.students.find((student) => student.studentId === studentId) : undefined;
  const issues: SystemActionIssue[] = [];
  if (!values.studentNumber.trim()) issues.push({ code: "student_number_required", message: "学号不能为空。" });
  if (!values.name.trim()) issues.push({ code: "student_name_required", message: "学生姓名不能为空。" });
  if (data.students.some((student) =>
    student.studentId !== studentId && normalized(student.studentNumber) === normalized(values.studentNumber),
  )) {
    issues.push({ code: "duplicate_student_number", message: "学号已存在。" });
  }
  const organizationIssue = validateStudentOrganization(data, values);
  if (organizationIssue) issues.push(organizationIssue);
  if (existing && expectedVersion !== undefined && existing.version !== expectedVersion) {
    issues.push({ code: "version_conflict", message: "学生信息已更新，请重新加载后再保存。" });
  }
  if (existing && (existing.currentGradeId !== values.currentGradeId || existing.currentClassId !== values.currentClassId)) {
    issues.push({ code: "use_enrollment_change", message: "现有学生的年级或班级变更必须使用转班 / 升年级操作。" });
  }
  if (issues.length) return failure("学生保存失败。", issues);

  const targetId = existing?.studentId ?? nextId("STU", data);
  const classContext = getClassContext(data, values.currentClassId);
  const student: SchoolStudent = {
    studentId: targetId,
    studentNumber: values.studentNumber.trim(),
    name: values.name.trim(),
    currentGradeId: values.currentGradeId,
    currentClassId: values.currentClassId,
    enrollmentStatus: values.enrollmentStatus,
    enrollmentHistory: existing?.enrollmentHistory ?? [{
      id: `EH-${targetId}-1`,
      studentId: targetId,
      grade: classContext.grade?.name ?? "",
      className: classContext.schoolClass?.name ?? "",
      changeType: "enrollment",
      startedAt: context.occurredAt.slice(0, 10),
    }],
    updatedAt: context.occurredAt,
    version: (existing?.version ?? 0) + 1,
  };
  const updated = {
    ...data,
    students: existing
      ? data.students.map((item) => item.studentId === targetId ? student : item)
      : [...data.students, student],
  };
  return success(
    appendAudit(updated, context, existing ? "update_student" : "create_student", "student", [targetId], `${existing ? "更新" : "新增"}学生：${student.name}。`),
    existing ? "学生已更新。" : "学生已新增。",
  );
}

export function changeStudentEnrollment(
  data: AdminBaseData,
  studentId: string,
  values: EnrollmentChangeValues,
  context: AdminActionContext,
): SystemActionResult {
  const existing = data.students.find((student) => student.studentId === studentId);
  if (!existing) return failure("学籍变更失败。", [{ code: "student_not_found", message: "学生不存在。" }]);

  const targetContext = values.targetClassId ? getClassContext(data, values.targetClassId) : undefined;
  if (
    (values.changeType === "class_change" || values.changeType === "grade_change")
    && (!targetContext?.schoolClass || !targetContext.grade || targetContext.schoolClass.status !== "active")
  ) {
    return failure("学籍变更失败。", [{ code: "target_class_required", message: "请选择启用的目标班级。" }]);
  }
  const currentOpenHistory = existing.enrollmentHistory.find((item) => !item.endedAt);
  if (currentOpenHistory && values.effectiveDate <= currentOpenHistory.startedAt) {
    return failure("学籍变更失败。", [{ code: "invalid_effective_date", message: "生效日期必须晚于当前学籍阶段开始日期。" }]);
  }

  const enrollmentHistory = existing.enrollmentHistory.map((item) =>
    item.id === currentOpenHistory?.id
      ? { ...item, endedAt: previousDate(values.effectiveDate) }
      : item,
  );
  const isLeaving = values.changeType === "graduation" || values.changeType === "left_school";
  if (!isLeaving) {
    enrollmentHistory.unshift({
      id: `EH-${studentId}-${existing.enrollmentHistory.length + 1}`,
      studentId,
      grade: targetContext?.grade?.name ?? "",
      className: targetContext?.schoolClass?.name ?? "",
      changeType: values.changeType,
      startedAt: values.effectiveDate,
    });
  }

  const student: SchoolStudent = {
    ...existing,
    currentGradeId: targetContext?.grade?.gradeId ?? existing.currentGradeId,
    currentClassId: targetContext?.schoolClass?.classId ?? existing.currentClassId,
    enrollmentStatus: values.changeType === "graduation"
      ? "graduated"
      : values.changeType === "left_school"
        ? "left_school"
        : "enrolled",
    enrollmentHistory,
    updatedAt: context.occurredAt,
    version: existing.version + 1,
  };
  const updated = {
    ...data,
    students: data.students.map((item) => item.studentId === studentId ? student : item),
  };
  return success(
    appendAudit(updated, context, "change_enrollment", "student", [studentId], `${student.name}：${values.changeType}，生效日期 ${values.effectiveDate}。`),
    "学籍状态已更新。",
  );
}

function previousDate(date: string) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 11
    ? `${digits.slice(0, 3)}****${digits.slice(-4)}`
    : phone;
}
