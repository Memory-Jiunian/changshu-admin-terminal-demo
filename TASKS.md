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

- [ ] Add shared warning data provider
- [ ] Preserve warning data across navigation
- [ ] Normalize student base data and derived summaries
- [ ] Align warning case identifiers
- [ ] Add aggregation selectors
- [ ] Replace identity-only drawer
- [ ] Add current overview
- [ ] Add active case
- [ ] Add enrollment history
- [ ] Add historical case summaries
- [ ] Run regression / build / commit / push

Active scope: Student profile Phase 5.2A: shared data foundation and core detail drawer.
Do not implement detailed record modules, fullscreen, or cross-module navigation until Phase 5.2B / 5.3 is approved.
Warning business rules remain frozen.

## Phase 6: Polish and validation

- [ ] Match prototype layout
- [ ] Check 11–13 inch tablet width
- [ ] Run npm run build
- [ ] Update README
- [ ] Commit and push
