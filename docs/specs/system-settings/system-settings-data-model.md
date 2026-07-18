# 系统设置数据模型与导入规格

## 当前唯一真值

`AdminDataProvider` 持有：

- `SchoolConfig`
- `SchoolGrade[]`
- `SchoolClass[]`
- `SchoolTeacher[]`
- `SchoolStudent[]`
- `AdminAuditLog[]`
- `baseDataVersion`

学生档案使用适配器从共享学生、组织、教师和 warnings 构建 `StudentProfileRecord[]`。Warning 中的学生、班级、班主任、负责人和记录人字段为发生时业务快照，不由资料维护批量重写。

## 业务唯一键与稳定 ID

- 学校：`schoolId`
- 年级：`gradeId`，名称校内唯一
- 班级：`classId`，`gradeId + name` 唯一
- 教师：`teacherId` 稳定，`staffNumber` 唯一
- 学生：`studentId` 稳定，`studentNumber` 唯一

## 引用规则

- 班主任必须是启用教师。
- 有班级的年级、有学生的班级不能硬删除。
- 负责活动预警、担任当前班主任或负责未来预约的教师不能停用。
- 学生不提供硬删除。

## 导入语义

`ImportDataType` 为 organization、teacher、student；`ImportMode` 为 insert_only、upsert。预览记录源文件摘要、基础数据版本、行级结果、字段差异和汇总。

Error 包括缺失必填、自然键重复、引用不存在、年级班级不匹配、枚举错误和文件内冲突。Warning 包括手机号为空、姓名变化、班级变化和可疑角色关系。Skip 表示无字段差异。

确认时校验 `baseDataVersion`，在副本中执行，成功后一次替换共享数据并写 `AdminAuditLog`；失败保持原状态。
