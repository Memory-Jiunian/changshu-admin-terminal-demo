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

Active scope: Phase 3.6. Do not implement a clue-pool page or start the full Phase 4 action flow.

## Phase 4: Local mock state changes after drawer actions

- [ ] Define local action result mapping from the approved workflow specification
- [ ] Update current status and feedback status after successful actions
- [ ] Update latest activity and activity time
- [ ] Append timeline records
- [ ] Preserve state and user input on failed actions
- [ ] Add success and failure feedback

Phase 4 has not started.

## Phase 5: Polish and validation

- [ ] Match prototype layout
- [ ] Check 11–13 inch tablet width
- [ ] Run npm run build
- [ ] Update README
- [ ] Commit and push
