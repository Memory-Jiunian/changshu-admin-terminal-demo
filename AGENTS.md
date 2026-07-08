## Project

This project is a portfolio demo for a campus mental-health risk management terminal.

The current implementation scope is the admin terminal, not the mobile mini-program.

The first version focuses only on:

- Warning management default list
- Student risk detail drawer
- Three drawer states:
  - Pending review
  - Formal warning
  - In intervention

Do not implement unrelated pages unless the task explicitly asks for them.

---

## Product boundary

This system is used by school psychological teachers to review risk clues, confirm formal warnings, view collaboration feedback, record intervention progress, arrange re-test/referral, and support closure.

The system must not replace professional psychological judgment.

The list page should only show factual information:

- Student information
- Risk level
- Current status
- Latest activity
- Activity time
- Feedback status
- View detail action

Do not show "next action" in the list.  
Do not let the system tell the psychological teacher what professional action must be taken next.

Line/clue type should not be shown in the default table.  
Line/clue type may appear in the detail drawer and advanced filters only.

---

## Role boundary

### Psychological teacher

Allowed:

- View student risk detail
- Review risk clue
- Reject clue
- Mark observation
- Confirm formal warning
- Request supplementary feedback
- Record intervention
- Arrange re-test
- Record referral
- Close archive

### Homeroom teacher / Grade director

They are not main users of this admin terminal.

They use the mini-program to:

- Receive collaboration tasks
- Submit factual observation
- Submit feedback progress
- Leave supervision trace

They must not:

- Judge risk level
- Confirm formal warning
- Modify risk status
- View full AI conversation
- View full psychological assessment details

### School leader

School leaders only see desensitized overview data in later pages.  
Do not expose full student risk detail to school leaders in this version.

---

## Current implementation scope

Only implement the warning management page.

Required UI:

1. App shell
   - Topbar
   - Left sidebar
   - Main content area

2. Warning management page
   - Status tabs
   - Quick filters
   - Search input
   - Advanced filter trigger
   - Warning student table

3. Student risk detail drawer
   - Student overview
   - Risk evidence
   - Homeroom teacher feedback
   - Process timeline
   - Fixed bottom action buttons

4. Drawer state variants
   - Pending review:
     - Reject
     - Continue observation
     - Confirm formal warning
   - Formal warning:
     - Request supplementary feedback
     - Record intervention
   - In intervention:
     - Add intervention record
     - Arrange re-test
     - Referral

Do not implement:

- Real backend API
- Real login
- Real permission system
- Student archive full page
- Intervention record full page
- School overview page
- Mini-program notification integration
- Full AI conversation page

Use mock data only.

---

## UI and design rules

Use shadcn/ui as the base UI system.

Prefer these components:

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

Use lucide-react icons when needed.

Do not introduce other UI libraries unless explicitly requested.

The UI should match the current prototype direction:

- Dark topbar
- Dark left sidebar
- Light main content area
- Rounded cards
- Large horizontal status tabs
- Secondary quick filter chips
- Table-first admin layout
- Right-side drawer for detail
- Fixed drawer bottom actions

The target screen is a 11–13 inch horizontal tablet / light admin terminal.

Do not optimize for mobile phone first.

---

## Data model rules

Use TypeScript types.

At minimum, warning items should include:

- id
- studentName
- gradeClass
- riskLevel
- currentStatus
- latestActivity
- activityTime
- feedbackStatus
- responsibleTeacher
- clueType
- assessmentSummary
- aiSummary
- teacherFeedbackSummary
- timeline

Main status options:

- pending_review
- observing
- formal_warning
- in_intervention
- pending_retest
- referral
- closed

Feedback status options:

- not_requested
- pending_feedback
- feedback_received
- feedback_overdue
- new_feedback

Risk level options:

- medium
- high
- critical

Clue type options:

- screening_abnormal
- deep_assessment
- ai_chat
- teacher_report

Remember:

- currentStatus and feedbackStatus are different fields.
- feedbackStatus must not replace currentStatus.
- clueType must not appear in the default table.

---

## Implementation rules

Use small components.

Do not put the whole page into one giant App.tsx file.

Recommended structure:

- src/components/layout
- src/components/warning
- src/components/ui
- src/data
- src/types
- src/lib

Keep business labels in Chinese because this is a Chinese portfolio demo.

Keep code names in English.

Example:

- Component name: StudentRiskDrawer
- UI label: 学生风险详情

---

## Interaction rules

Clicking "查看详情" opens the right-side drawer.

The table must keep its current filter state when the drawer opens.

The selected row may be lightly highlighted.

The drawer bottom actions change based on currentStatus.

Action buttons in this version can update mock state locally, but should not call a real API.

When action succeeds:

- update currentStatus or feedbackStatus if needed
- update latestActivity
- update activityTime
- append a timeline record
- show a simple success feedback if toast is available

When action fails:

- keep current state
- keep user input if any
- show error feedback

---

## Current active scope

Current active scope is Phase 1: Warning Management Page.

Only implement:

- Warning management default list
- Student risk detail drawer
- Three drawer states:
  - Pending review
  - Formal warning
  - In intervention

Do not implement other pages until their PRD is confirmed.

When a new page PRD is completed, update this section before implementation.

---

## Review perspectives

Before reporting completion, check the work from these perspectives:

### Product perspective

- Does the page respect that psychological teachers make professional judgments?
- Does the list only show factual information?
- Are currentStatus and feedbackStatus separated?
- Is clueType hidden from the default table?

### UX perspective

- Can the user locate high-priority items quickly?
- Is the table not overloaded?
- Does the drawer provide enough evidence and operation entry points?

### Frontend perspective

- Are components split clearly?
- Are shadcn/ui components used consistently?
- Does `npm run build` pass?

### Portfolio perspective

- Does the page demonstrate risk review, collaboration feedback, and closed-loop workflow?

---

## Document priority

When documents conflict, follow this order:

1. AGENTS.md for long-term rules and project boundaries
2. PRD.md for current product requirements
3. DESIGN.md for visual and component rules
4. TASKS.md for current implementation sequence
5. README.md for running and project overview

If implementation differs from PRD, update PRD or ask before changing behavior.

---

## Git workflow

Every task must be committed to Git.

Do not leave uncommitted changes after a completed task.

Before committing, run:

```bash
npm run build