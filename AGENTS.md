## Project

This project is a portfolio demo for a campus mental-health risk management terminal.

The current implementation scope is the admin terminal, not the mobile mini-program.

The first version focuses only on:

- Warning management default list
- Student risk detail drawer
- Seven drawer states:
  - Pending review
  - Observing
  - Formal warning
  - In intervention
  - Pending re-test
  - Referral
  - Closed

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
   - Observing:
     - Continue observation
     - Confirm formal warning
     - Reject
   - Formal warning:
     - Request supplementary feedback
     - Record intervention
   - In intervention:
     - Add intervention record
     - Arrange re-test
     - Referral
   - Pending re-test:
     - View re-test result
     - Update status
   - Referral:
     - Record referral result
     - Arrange re-test
   - Closed:
     - View archive record

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

Risk-evidence clue type options:

- deep_assessment
- ai_chat
- teacher_report

`screening_abnormal` is a flow trigger or timeline event. It must not be treated
as a risk-evidence clue type or displayed as one in the detail drawer. If a
legacy filter or internal field retains this code, it does not change the
domain meaning above.

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

Phase 4 action buttons may update mock state locally, but must not call a real API.
Before Phase 4, action buttons remain placeholders unless a task explicitly
authorizes state changes.

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

Current active scope is Phase 3.4: workflow specification baseline for the
Warning Management Page.

Only implement:

- Warning management default list
- Student risk detail drawer
- Seven drawer states:
  - Pending review
  - Observing
  - Formal warning
  - In intervention
  - Pending re-test
  - Referral
  - Closed

The current task is documentation-only. Phase 4 local mock state changes have
not started.

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

## Specification priority

When documents conflict, follow this order:

1. AGENTS.md for long-term rules, role boundaries, and development gates
2. docs/specs/DOMAIN_SPEC.md for canonical domain terms and permissions
3. docs/specs/flows/warning-management-flow.md for state transitions and side effects
4. PRD.md for page behavior and current product requirements
5. docs/tests/warning-drawer-acceptance.md for executable acceptance baselines
6. DESIGN.md for visual and component rules
7. TASKS.md for current implementation sequence
8. README.md for running and project overview

The acceptance document verifies the higher-priority specifications; it must not
silently redefine them. If implementation differs from a higher-priority
document, update the specification with product confirmation or ask before
changing behavior.

---

## Business understanding gate

Before changing business code, restate the intended behavior in terms of:

- actor and permission boundary
- trigger and source path
- current status and feedback status
- allowed action and successful next status
- system automation, notification, and timeline side effects
- privacy constraints and prohibited information
- upstream inputs and downstream consumers
- acceptance cases that prove the behavior

Compare the restatement with the specification priority above. If a required
rule is missing, contradictory, or cannot be represented by the current domain
model, stop implementation and ask for product confirmation. Do not fill a
business gap with an implementation assumption.

## Issue classification

Classify specification and implementation issues before resolving them:

- A — Domain definition: terms, state meanings, clue types, and business invariants.
- B — Role and privacy: who may view, decide, operate, or receive notifications.
- C — Workflow and state transition: triggers, allowed actions, next states, and forbidden transitions.
- D — Data semantics: field meaning, source of truth, feedback read state, ordering, and derived labels.
- E — Experience and presentation: module visibility, button placement, list columns, copy, and interaction behavior.
- F — Engineering and delivery: component boundaries, mock/API behavior, build, Git, deployment, and test coverage.

A single issue may have more than one class. Resolve higher-priority domain,
permission, workflow, and data questions before UI or engineering work.

## Workflow change impact check

Any workflow change must check both upstream and downstream behavior, including:

- source events and entry into the pending-review clue pool
- current-status and feedback-status semantics
- allowed drawer actions and successful next states
- automatic mini-program tasks, reminders, and notification recipients
- timeline event name, actor, timestamp, and ordering
- list filters, badges, detail module visibility, and acceptance cases
- archive, re-test, referral, and future backend contract implications

Update every affected specification and acceptance case in the same task. If
the impact cannot be determined from the specifications, stop and ask rather
than implementing a partial flow.

---

## Git workflow

Every task must be committed to Git.

Do not leave uncommitted changes after a completed task.

Before committing, run:

```bash
npm run build
```
