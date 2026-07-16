# TASKS.md

## Phase 1: Project setup

- [x] Create Vite + React + TypeScript project
- [x] Install Tailwind CSS
- [x] Install and initialize shadcn/ui
- [x] Add base shadcn components
- [x] Create app shell layout

## Phase 2: Warning management list

- [x] Add mock warning data
- [x] Add TypeScript types
- [x] Implement status tabs
- [x] Implement quick filters
- [x] Implement search input
- [x] Implement advanced filters
- [x] Implement warning table
- [x] Table fields:
  - Student information
  - Risk level
  - Current status
  - Latest activity
  - Activity time
  - Feedback status
  - Action

## Phase 3: Student risk drawer

- [x] Implement right-side Sheet drawer
- [x] Add student overview
- [x] Add risk evidence section
- [x] Add teacher feedback section
- [x] Add process timeline
- [x] Add fixed bottom actions
- [x] Implement all seven drawer status variants
- [x] Align Phase 3.3 workflow, timeline, clue type, and feedback rules
- [x] Phase 3.4: establish workflow specification and acceptance baseline

## Phase 3.5: Warning workflow model calibration and drawer correction

- [x] Synchronize domain specification
- [x] Synchronize workflow specification
- [x] Synchronize acceptance baseline
- [x] Refactor source and evidence data model
- [x] Implement formal warning confirmation dialog
- [x] Add intervention records module
- [x] Add re-test records module
- [x] Sort timeline newest first
- [x] Check code against the latest specifications
- [x] Build / test / commit / push

## Phase 3.6: Simplify risk evidence presentation

- [x] Move effective risk-level badge to the risk-evidence heading
- [x] Remove the duplicate risk badge from the student overview
- [x] Hide source and evidence-type labels in the risk-evidence body
- [x] Update drawer acceptance rules

## Phase 4: Warning management local mock flow

- [x] Define typed action mapping from the approved workflow specification
- [x] Add active-item disposition and record fields
- [x] Implement observation and end-review actions
- [x] Implement supplementary-feedback action
- [x] Implement intervention record actions
- [x] Implement re-test scheduling, result viewing, and status updates
- [x] Implement referral start and result actions
- [x] Implement archive viewing
- [x] Add reusable detail drawer width and shared detail content
- [x] Implement fullscreen warning detail
- [x] Synchronize list, counts, filters, drawer, fullscreen, records, and timeline
- [x] Add validation and duplicate-submit protection

## Phase 4.5: Warning management final regression

- [x] Main flow regression
- [x] Branch flow regression
- [x] Drawer and fullscreen data consistency
- [x] Filter and count regression
- [x] Documentation synchronization
- [x] Build / commit / push

## Phase 4.6: Warning collaboration and archive refinement

- [x] Synchronize feedback deadline and re-request rules
- [x] Define homeroom-teacher collaboration information
- [x] Define re-test scale and objective result boundaries
- [x] Define complete read-only archive contents
- [x] Implement shared effective feedback status
- [x] Extend confirmation and feedback request data
- [x] Add centralized re-test scale catalog
- [x] Implement full re-test record viewing
- [x] Expand read-only archive dialog
- [x] Run regression / build / commit / push

Active scope: Warning management is frozen after Phase 4.6.
Next planned module: student profile.
Do not implement student profile until its acceptance matrix and Codex task are approved.
Clue pool remains documented as an upstream future slice and is not the next implementation task.

## Phase 5.0: Student profile specification baseline

- [x] Import student profile slice, scenarios, PRD, flow, and acceptance matrix
- [x] Normalize the five-item primary navigation definition
- [x] Remove the independent intervention-record page definition
- [x] Synchronize AGENTS, PRD, DOMAIN_SPEC, and active scope

## Phase 5.1: Student profile list

- [x] Add student profile types
- [x] Add student profile mock coverage
- [x] Implement name and student-number search
- [x] Implement linked grade and class filters
- [x] Implement advanced filters
- [x] Implement the three-column-group student list
- [x] Add the minimum identity-only drawer
- [x] Run acceptance regression, build, commit, and push

Phase 5.1 is complete: list, search, filters, types, mock, and the identity drawer baseline.
Warning management remains frozen after Phase 4.6.
The clue pool remains an upstream future slice and is not the next implementation task.

## Phase 5.2A: Shared data foundation and core student profile detail

- [x] Add shared warning data provider
- [x] Preserve warning data across navigation
- [x] Normalize student base data and derived summaries
- [x] Align warning case identifiers
- [x] Add aggregation selectors
- [x] Replace identity-only drawer
- [x] Add current overview
- [x] Add active case
- [x] Add enrollment history
- [x] Add historical case summaries
- [x] Run regression / build / commit / push

Phase 5.2A shared data foundation and core detail drawer is complete. Detailed
record modules and fullscreen remain deferred. Phase 5.2A.1 separately permits
only the profile-to-warning-detail round trip described below.
Warning business rules remain frozen.

## Phase 5.2A.1: Student profile information architecture and filter semantics

- [x] Split the table into name, number, grade, class, and action
- [x] Replace grade/class selects with two-level tabs
- [x] Persist the last valid class preference
- [x] Add class browsing and school-wide keyword search
- [x] Add 30-item pagination
- [x] Add low risk without changing formal-warning confirmation
- [x] Refine advanced filter semantics
- [x] Merge the current overview into the active case
- [x] Complete active and historical case summaries
- [x] Add typed profile-to-warning return context
- [x] Run warning regression / test / build / commit / push

Active scope: Student profile Phase 5.2A.1 information architecture and filter semantics.
Only profile-to-warning-detail-and-back navigation is approved. Detailed records, fullscreen, PDF export, and all other cross-module routes remain out of scope.

## Phase 5.2B: Complete student case records

- [x] Add case-detail view model
- [x] Add internal profile/case drawer navigation
- [x] Extend return context for case detail
- [x] Extract shared read-only case record components
- [x] Refactor archive dialog to shared components
- [x] Add case overview
- [x] Add risk evidence
- [x] Add feedback request and feedback history
- [x] Add intervention history
- [x] Add retest history
- [x] Add referral and outcome history
- [x] Add complete case timeline
- [x] Add empty and error states
- [x] Run regression / build / commit / push

Active scope: Student profile Phase 5.2B read-only complete records grouped by warning case.
Fullscreen, PDF export, raw assessment/AI records, cross-case record indexes, workbench, and clue pool remain out of scope. Warning business rules remain frozen.

## Phase 5.2B.1: Complete evidence, collaboration, referral follow-up, and export

- [x] Add complete deep assessment records
- [x] Add visible AI conversation records
- [x] Add complete evidence UI
- [x] Add feedback request linkage
- [x] Build collaboration rounds
- [x] Derive feedback timeline events
- [x] Migrate referral result to follow-up history
- [x] Add multiple referral follow-up actions
- [x] Synchronize warning, profile, and archive
- [x] Add student profile export dialog
- [x] Add printable report view
- [x] Add sensitive-content export boundary
- [x] Run regression / build / commit / push

Active scope: Student profile Phase 5.2B.1 complete evidence, feedback collaboration, multiple referral follow-ups, and privacy-aware profile export.
Phase 5.2B.1 is accepted as the Workbench W0 foundation. Warning business rules remain frozen except the approved referral follow-up history extension.

## Phase W0: Workbench prerequisite verification

- [x] Verify referral follow-up data and repeated append action
- [x] Verify warning/profile/archive referral rendering
- [x] Verify referral timeline and state invariants
- [x] Verify shared warning provider
- [x] Confirm warning-detail anchor authorization

## Phase W1: Workbench MVP

- [x] Add workbench domain types and pure selector
- [x] Add six active task types and one reminder type
- [x] Add feedback and re-test mutual exclusion
- [x] Add factual priority sorting and data issues
- [x] Add workbench summary, filters, reminder and task lists
- [x] Add default workbench entry and explicit placeholder pages
- [x] Add typed warning-detail navigation and return context
- [x] Add six stable detail anchors and target highlighting
- [x] Mark new feedback read only after successful feedback rendering
- [x] Add workbench regression tests
- [x] Run test / build / HTTP smoke / commit / push

Active scope: Workbench MVP based on shared warning data and the approved referral follow-up foundation. Do not reimplement referral migration, first-intervention tasks, completed-task history, task transfer, workbench actions, clue pool, or backend.

## Phase W1.1: Workbench walkthrough corrections

- [x] Cover six active task types in shared mock data
- [x] Cover one same-day re-test reminder in shared mock data
- [x] Add per-feedback psychologist read timestamps
- [x] Replace render-time auto-read with explicit confirmation
- [x] Share feedback read state across workbench and warning entry points
- [x] Add unread-feedback drawer close protection
- [x] Preserve feedback records and business timeline when marking read
- [x] Record deferred intervention-task candidates without implementing them
- [x] Run regression / build / HTTP smoke / commit / push

Active scope: Workbench Phase W1.1 demo coverage and explicit feedback read confirmation. Do not implement first-intervention, intervention follow-up, intervention re-test, school overview, or new professional workflow rules.

## Phase I1: Intervention appointment, follow-up, and no-show workflow

- [x] I1.0 Sync domain, flow, page, and acceptance specifications
- [x] I1.1 Add appointment sub-status, records, and notification contracts
- [x] I1.2 Implement intervention scheduling, attendance, follow-up, reschedule, and cancellation
- [x] I1.3 Add intervention and overdue re-test workbench tasks and reminders
- [x] I1.4 Align complete re-test responses and referral follow-up conclusions
- [x] I1.5 Synchronize warning detail, profile, archive, and export views
- [x] I1.6 Run regression, build, HTTP smoke, commit, and push

Active scope: Phase I1 intervention appointment, attendance, follow-up, and no-show workflow. Keep seven warning main states unchanged; `in_intervention` is displayed as `待干预`. School overview, clue pool, backend, permissions, and real notifications remain out of scope.

## Phase I1.1: Walkthrough reconciliation

- [x] I1.1A Sync specifications and split active warning risk levels
- [x] I1.1B Align observing feedback rounds and global end-review toast
- [x] I1.1C Derive one effective timeline from structured records
- [x] I1.1D Add intervention grace period and cancellation return rule
- [x] I1.1E Move intervention/re-test attention into arrangements
- [x] I1.1F Separate latest planned and latest completed re-tests
- [x] I1.1G Cover mock scenarios and regression
- [x] Run test / build / HTTP smoke / 1440x900 walkthrough / commit / push

Active scope: Phase I1.1 warning, feedback, timeline, intervention arrangement, and re-test consistency. Keep seven warning main states unchanged. School overview, clue pool, backend, permissions, and real notifications remain out of scope.

## Phase I1.2: Missing items and adaptive workbench layout

- [x] Standardize business Dialog safe height and internal scrolling
- [x] Group intervention appointments and results by appointmentId
- [x] Preserve unlinked legacy intervention records
- [x] Align latest intervention result fields across detail, archive, and export
- [x] Normalize feedback-request timeline field labels
- [x] Remove “first” from unscheduled-intervention copy
- [x] Make App Shell sidebar width a single layout truth
- [x] Remove workbench centered max-width constraint
- [x] Add desktop independent hidden-scroll list bodies
- [x] Add narrow single-page scrolling fallback
- [x] Run regression, build, HTTP smoke, viewport review, commit, and push

Active scope: Phase I1.2 closes intervention-round presentation and workbench
viewport layout gaps without changing Phase I1.1 business rules. School overview
and clue pool remain paused.

## Phase S1.0: School overview specifications

- [x] Archive the seven revised school-overview specifications
- [x] Update domain, PRD, design, discovery, and active-scope documentation
- [x] Add school-overview and assessment domain types

## Phase S1.1: School overview selectors

- [x] Add a pure school-overview selector
- [x] Derive coverage, current risk, attention, distributions, trends, and sources
- [x] Add selector regression tests before page implementation

## Phase S1.2: School overview page

- [x] Replace the sidebar placeholder with the real overview
- [x] Add current-term and organization scope controls
- [x] Add metric, attention, distribution, trend, and methodology modules

## Phase S1.3: Privacy and failure states

- [x] Suppress class counts below three in the ViewModel
- [x] Add loading, failure, empty, partial-error, and data-issue states
- [x] Add accessible summaries and responsive single-scroll layout

## Phase S1.4: Tests and visual review

- [x] Complete shared mock coverage
- [x] Run all regressions, build, and HTTP smoke
- [x] Review 1440x900, 1536x864, and 1280x720 screenshots
- [x] Commit and push main

Active scope: Phase S1 school overview MVP derived from shared student,
assessment, warning, and time data. The page is aggregate-only and has no case
drill-down, export, custom dates, prediction, backend, or real permission layer.
Warning, workbench, and student-profile business rules remain frozen.

## Phase 6: Polish and validation

- [ ] Match prototype layout
- [ ] Check 11–13 inch tablet width
- [ ] Run npm run build
- [ ] Update README
- [ ] Commit and push
