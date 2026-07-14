## Project

This project is a portfolio demo for a campus mental-health risk management terminal.

The current implementation scope is the admin terminal, not the mobile mini-program.

The current implemented modules are:

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
- Student profile Phase 5.2A:
  - List
  - Search and filters
  - Shared warning-derived summaries
  - Core read-only detail drawer

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

Source type and evidence types should not be shown in the default table.
They may appear as separate fields in the detail drawer; advanced-filter clue
type means evidence type only.

---

## Role boundary

### Psychological teacher

Allowed:

- View student risk detail
- Review risk clue
- End the current clue handling
- Mark observation
- Confirm formal warning
- Request supplementary feedback
- Record intervention
- Arrange re-test
- Record referral
- Close archive

The responsible psychological teacher can view and operate the complete warning
detail. Other psychological teachers may normally see only whether the item is
assigned, whether it is being handled, and who owns it. Full cross-owner access
requires transfer, invited collaboration, emergency takeover, or psychological
center leader authorization, and must be audited. This version defines the
boundary but does not implement a real permission system.

### Homeroom teacher

Homeroom teachers are not main users of this admin terminal.

They use the mini-program to:

- Report abnormal observations
- Submit factual observation
- Submit collaboration feedback
- Remind students to complete re-tests on time

They must not:

- Judge risk level
- Confirm formal warning
- Modify risk status
- View full AI conversation
- View full psychological assessment details

### Grade director

Grade directors are not main users of this admin terminal. They use the
mini-program to:

- View collaboration progress
- Send supervision reminders
- Leave supervision records

They must not submit student factual observations or homeroom-teacher
collaboration feedback. They also must not judge risk level, confirm formal
warnings, modify risk status, or view full AI conversations and assessments.

### School leader

School leaders only see desensitized overview data in later pages.  
Do not expose full student risk detail to school leaders in this version.

---

## Current implementation scope

Warning management is frozen. The active implementation slice is student
profile Phase 5.2A: shared warning data and the core read-only detail drawer.

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
   - Intervention records
   - Re-test records
   - Process timeline
   - Fixed bottom action buttons

4. Drawer state variants
   - Pending review:
     - End current clue handling
     - Continue observation
     - Confirm formal warning
   - Observing:
     - Continue observation
     - Confirm formal warning
     - End current clue handling
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

5. Student profile Phase 5.2A
   - Student profile list
   - Name and student-number search
   - Linked grade and class filters
   - Advanced filters
   - Stable student identity and enrollment data
   - Warning-derived list summaries
   - Core drawer sections: student information, current overview, active case,
     enrollment history, and historical case summaries
   - Shared detail width

Do not implement:

- Real backend API
- Real login
- Real permission system
- Student archive full page
- Intervention record full page
- School overview page
- Mini-program notification integration
- Full AI conversation page
- Detailed student profile record modules
- Student profile fullscreen mode
- Complete caseId aggregation UI
- Clue-pool page
- Organization and account CRUD

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
- sourceType
- evidenceTypes
- suggestedRiskLevel
- confirmedRiskLevel
- riskLevelAdjustmentReason
- currentStatus
- latestActivity
- activityTime
- feedbackStatus
- responsibleTeacher
- assessmentSummary
- aiSummary
- teacherFeedbackSummary
- interventionRecords
- retestRecords
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

Source type options:

- screening_abnormal
- teacher_report
- ai_chat_trigger

`sourceType` describes how the item was first discovered.

Risk-evidence type options:

- deep_assessment
- ai_chat
- teacher_report

`evidenceTypes` describes the evidence actually reviewed by the psychological
teacher. `screening_abnormal` must never appear in `evidenceTypes`.

Do not use one `clueType` field to represent both source and evidence.

Risk level fields:

- `suggestedRiskLevel` is a system, AI, or assessment suggestion only.
- `confirmedRiskLevel` is the final level selected by the psychological teacher.
- When the levels differ, `riskLevelAdjustmentReason` is required.
- Effective display level is `confirmedRiskLevel ?? suggestedRiskLevel`.

Remember:

- currentStatus and feedbackStatus are different fields.
- feedbackStatus must not replace currentStatus.
- sourceType and evidenceTypes must not appear in the default table.

The clue pool is an upstream business container, not a warning-management main
status. An item enters `pending_review` only after required supplementary
assessment is complete and reviewable evidence has been formed. The clue-pool
page is outside the current active scope.

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

Action buttons must not call a real API. Phase 4 authorizes the approved local
mock transitions defined in `docs/specs/flows/warning-management-flow.md` and
verified by `docs/tests/warning-action-acceptance.md`.

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

Student profile Phase 5.2A is approved. Implement shared warning state,
warning-derived profile summaries, and the core read-only drawer sections for
student information, current overview, active case, enrollment history, and
historical case summaries. Do not implement detailed professional record
modules, fullscreen mode, or cross-module navigation until Phase 5.2B / 5.3 is
approved.

Student identity and enrollment history are stable student data. Current risk,
current warning status, responsible psychological teacher, intervention-history
flags, and case counts must be derived from the shared warning source. Do not
store these values as independent truths in the student mock. In the current
Demo, a `WarningItem` is one continuous case and `WarningItem.id` is its stable
case identifier; profile associations must use real `WRN-*` identifiers.

An active profile case satisfies `isActive === true` and
`currentStatus !== "closed"`. Closed cases and inactive ended-without-warning
cases are historical. Current mock data must contain at most one active case per
student. Selectors must report, rather than silently ignore, multiple active
cases if inconsistent data is supplied.

Warning management remains frozen after Phase 4.6. Do not change its state
transitions, action dialogs, seven-column list, advanced filters, or mock
workflow. Intervention records remain business records used by warning detail,
archive, and future student profile detail; they are not an independent primary
navigation page.

All psychological teachers may access the read-only student profile module in
the current MVP. This does not grant cross-owner warning operations or alter
the warning-management ownership rules. Homeroom teachers, grade directors,
and school leaders do not enter individual student profiles.

The clue-pool page, workbench, detailed student profile record modules,
fullscreen profile mode, cross-module navigation, organization CRUD, real
permissions, real backend, and school-system synchronization remain out of scope.

When a new page PRD is completed, update this section before implementation.

---

## Review perspectives

Before reporting completion, check the work from these perspectives:

### Product perspective

- Does the page respect that psychological teachers make professional judgments?
- Does the list only show factual information?
- Are currentStatus and feedbackStatus separated?
- Are sourceType and evidenceTypes hidden from the default table?

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
3. Current module specifications under docs/specs for module behavior
4. Current module flow specifications under docs/specs/flows
5. PRD.md for page behavior and current product requirements
6. Current module acceptance documents under docs/tests
7. DESIGN.md for visual and component rules
8. TASKS.md for current implementation sequence
9. README.md for running and project overview

The acceptance document verifies the higher-priority specifications; it must not
silently redefine them. For the current task, the documents updated by the
latest confirmed requirements are the source of truth. If older PRD text, mock
data, or code conflicts with them, update or remove the older conflicting rule.
If the latest specifications still conflict with each other, stop and ask
before changing behavior.

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
