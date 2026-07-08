# 畅树校园心理健康管理终端 Demo

这是一个用于 UX / 产品体验设计作品集展示的管理终端前端 Demo，主题是：

> 校园心理健康风险线索进入系统后，心理老师如何完成风险复核、正式预警确认、协作反馈查看、干预记录、复测转介和闭环归档。

本项目是“畅树校园心理健康系统”中的**管理终端**部分，不是学生端，也不是小程序端。

---

## 项目定位

管理终端面向心理老师与校级管理者，用于承接学生端测评结果、AI 风险线索和小程序端协作反馈。

当前版本重点展示心理老师视角下的预警管理流程：

```text
风险线索进入系统
→ 心理老师查看列表
→ 打开学生风险详情
→ 结合测评摘要、AI 线索、班主任反馈和处置时间线进行专业判断
→ 完成复核、确认正式预警、请求补充反馈、记录干预等操作
```

本 Demo 的目标不是实现完整后台系统，而是用于作品集中展示：

- 风险线索如何被统一承接
- 心理老师如何快速定位重点学生
- 列表与详情抽屉如何分工
- 小程序协作反馈如何回流到管理终端
- 管理终端如何支撑风险处置闭环

---

## 三端关系

| 端 | 主要作用 |
| --- | --- |
| 学生端 | 产生心理测评结果、深度测评记录和 AI 倾诉风险线索 |
| 小程序端 | 接收正式预警后的协作任务，提交事实观察、反馈进度和督办留痕 |
| 管理终端 | 承接风险线索与协作反馈，由心理老师完成专业复核、处置记录和闭环管理 |

三端不是重复关系，而是分工关系：

```text
学生端：测评与风险线索来源
小程序端：移动协作与任务触达
管理终端：专业复核、处置记录与长期档案
```

---

## 当前实现范围

当前第一版只实现：

1. 预警管理默认列表
2. 学生风险详情抽屉
3. 三种详情抽屉状态：
   - 待复核
   - 正式预警
   - 干预中

暂不实现：

- 真实后端接口
- 真实登录与权限系统
- 工作台完整页面
- 学生档案完整页面
- 干预记录完整页面
- 校级总览页面
- 系统设置页面
- 小程序端真实通知联动
- AI 对话完整内容页

第一版使用 mock data 完成页面演示。

---

## 核心页面：预警管理

预警管理页面采用：

```text
顶部筛选区 + 预警学生列表 + 右侧学生风险详情抽屉
```

### 默认列表字段

列表页只展示事实信息，不展示专业处置建议。

| 字段 | 说明 |
| --- | --- |
| 学生信息 | 学生姓名 |
| 风险等级 | 中风险 / 高风险 / 危险 |
| 当前状态 | 待复核 / 观察中 / 正式预警 / 干预中 / 待复测 / 转介中 / 已闭环 |
| 最新动态 | AI 生成风险线索 / 班主任提交反馈 / 心理老师新增干预记录 |
| 发生时间 | 10 分钟前 / 今天 10:20 / 具体时间 |
| 反馈状态 | 未请求 / 待反馈 / 已反馈 / 反馈超时 / 有新反馈 |
| 操作 | 查看详情 |

### 列表设计边界

列表页不展示：

- 线索类型
- 下一步动作
- 完整测评详情
- 完整 AI 对话内容
- 完整班主任反馈

原因：

> 列表页只帮助心理老师快速定位风险事项，不替代心理老师进行专业判断。

线索类型保留在：

- 详情抽屉
- 高级筛选

---

## 学生风险详情抽屉

点击“查看详情”后，右侧打开学生风险详情抽屉。

抽屉主要包含：

1. 学生概况
2. 风险依据
3. 班主任反馈
4. 处置时间线
5. 底部固定操作按钮

### 不同状态下的底部操作

| 当前状态 | 底部操作 |
| --- | --- |
| 待复核 | 驳回 / 继续观察 / 确认正式预警 |
| 正式预警 | 请求补充反馈 / 记录干预 |
| 干预中 | 新增干预记录 / 安排复测 / 转介 |

---

## 状态模型

### 主处置状态

```text
待复核
观察中
正式预警
干预中
待复测
转介中
已闭环
```

### 反馈状态

```text
未请求
待反馈
已反馈
反馈超时
有新反馈
```

主处置状态和反馈状态是两套字段。

- `currentStatus` 用于表示学生风险事项推进到哪一步
- `feedbackStatus` 用于表示班主任 / 年级主任的协作反馈是否完成

反馈状态不能替代主处置状态。

---

## 角色边界

### 心理老师

心理老师是管理终端的主用户，可以：

- 查看学生风险详情
- 查看测评摘要和 AI 风险线索摘要
- 查看班主任反馈
- 完成风险复核
- 驳回线索
- 标记继续观察
- 确认正式预警
- 请求补充反馈
- 记录干预
- 安排复测
- 发起转介
- 完成闭环归档

### 班主任 / 年级主任

班主任和年级主任不是管理终端主用户。

他们主要通过小程序完成：

- 接收协作任务
- 提交事实观察
- 反馈学生在校表现
- 年级主任督办与留痕

他们不能：

- 判断风险等级
- 确认正式预警
- 修改学生风险状态
- 查看完整 AI 对话
- 查看完整心理测评详情

### 校级管理者

校级管理者只查看脱敏后的全校态势、处置进度和资源调度信息。

当前第一版暂不实现校级总览页面。

---

## 技术栈建议

本项目建议使用：

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- lucide-react
- mock data

UI 组件建议优先使用 shadcn/ui：

- Button
- Badge
- Card
- Table
- Tabs
- Input
- Sheet
- Dialog
- Select
- DropdownMenu
- Separator
- ScrollArea
- Tooltip
- Skeleton

---

## 推荐目录结构

```text
changshu-admin-terminal-demo/
├─ AGENTS.md
├─ DESIGN.md
├─ PRD.md
├─ TASKS.md
├─ README.md
├─ package.json
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ index.css
│  ├─ data/
│  │  └─ warningMock.ts
│  ├─ types/
│  │  └─ warning.ts
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ AppShell.tsx
│  │  │  ├─ Sidebar.tsx
│  │  │  └─ Topbar.tsx
│  │  ├─ warning/
│  │  │  ├─ WarningManagementPage.tsx
│  │  │  ├─ WarningFilterBar.tsx
│  │  │  ├─ WarningTable.tsx
│  │  │  ├─ StudentRiskDrawer.tsx
│  │  │  ├─ RiskEvidence.tsx
│  │  │  ├─ FeedbackPanel.tsx
│  │  │  └─ ProcessTimeline.tsx
│  │  └─ ui/
│  └─ lib/
│     └─ utils.ts
└─ docs/
   └─ prototype/
      ├─ warning-management-list.png
      ├─ drawer-pending-review.png
      ├─ drawer-formal-warning.png
      └─ drawer-in-intervention.png
```

---

## 本地运行

安装依赖：

```bash
npm install
```

启动本地开发环境：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

---

## Git 工作流

建议每个阶段单独提交。

推荐分支：

```bash
feature/admin-terminal-setup
feature/admin-warning-list
feature/admin-risk-drawer
```

推荐提交信息：

```bash
feat(admin): setup admin terminal project
feat(admin): implement warning management list
feat(admin): add student risk detail drawer
feat(admin): add drawer state variants
docs(admin): update PRD and design docs
```

每次完成任务后执行：

```bash
npm run build
git status
git add .
git commit -m "feat(admin): ..."
git push
```

---

## 开发阶段

### Phase 1：项目搭建

- 创建 Vite + React + TypeScript 项目
- 接入 Tailwind CSS
- 接入 shadcn/ui
- 创建基础目录结构
- 创建 AppShell、Sidebar、Topbar

### Phase 2：预警管理列表

- 添加 mock data
- 添加 TypeScript 类型
- 实现状态 Tab
- 实现快捷筛选
- 实现搜索
- 实现预警学生表格

### Phase 3：学生风险详情抽屉

- 实现右侧 Sheet 抽屉
- 添加学生概况
- 添加风险依据
- 添加班主任反馈
- 添加处置时间线
- 添加底部固定操作按钮

### Phase 4：状态变体

- 待复核状态
- 正式预警状态
- 干预中状态
- mock 状态更新

### Phase 5：检查与打磨

- 对齐原型布局
- 检查列表字段
- 检查详情抽屉状态
- 检查 11–13 寸横屏显示效果
- 运行 `npm run build`
- 提交并推送代码

---

## 设计原则

- 使用轻后台布局，不做复杂数据大屏
- 优先保证心理老师能快速定位风险事项
- 列表只展示事实信息
- 详情抽屉展示判断依据和操作入口
- 系统不替代心理老师做专业判断
- 当前状态和反馈状态必须分开
- 小程序负责协作反馈，管理终端负责专业处置

---

## 相关文档

建议仓库中同时维护：

- `AGENTS.md`：Codex / AI Agent 执行规则
- `PRD.md`：当前页面产品需求
- `DESIGN.md`：视觉与组件使用规则
- `TASKS.md`：阶段任务清单
- `README.md`：项目说明与运行方式

---

## 当前项目状态

当前状态：

```text
PRD 已完成
预警管理默认列表原型已完成
学生风险详情抽屉原型已完成
下一步进入前端页面落地
```
