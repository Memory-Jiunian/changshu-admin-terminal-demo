## Design goal

This project is a light admin terminal for a campus mental-health risk management workflow.

The UI should help psychological teachers quickly locate risk items, open student risk details, review evidence, view feedback status, and continue the intervention workflow.

The design should feel calm, clear, restrained, and suitable for school administration.

Do not make it look like a marketing website, data dashboard, or mobile app.

---

## Target screen

Primary target:

- 11–13 inch horizontal tablet
- Light admin terminal layout
- Desktop browser preview is acceptable

Do not optimize for mobile phone first.

---

## Layout

Use a three-part layout:

1. Dark topbar
2. Dark left sidebar
3. Light main content area

Main page structure:

- Top filter area
- Warning student table
- Right-side detail drawer

The default page is table-first.

The drawer opens from the right side.

---

## Components

Use shadcn/ui as the base component system.

Preferred components:

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

Use lucide-react icons if needed.

Do not introduce another UI library unless explicitly requested.

---

## Visual style

Use a restrained grayscale-first style.

Recommended direction:

- Dark topbar
- Dark sidebar
- Light gray page background
- White or near-white cards
- Rounded containers
- Clear table rows
- Low-noise status tags

Avoid:

- Bright decorative gradients
- Large colorful dashboard cards
- Overly playful icons
- Mobile-first bottom navigation
- Heavy data visualization in the first version

---

## Table rules

The warning list is for locating items, not making professional judgment.

Default table fields:

- Student information
- Risk level
- Current status
- Latest activity
- Activity time
- Feedback status
- Action

Do not show:

- Clue type in default table
- Next action in default table
- Full assessment details
- Full AI conversation
- Full teacher feedback

Clue type can appear in:

- Detail drawer
- Advanced filter

---

## Drawer rules

The drawer is used for detail review and actions.

Drawer sections:

1. Student overview
2. Risk evidence
3. Homeroom teacher feedback
4. Process timeline
5. Fixed bottom actions

The bottom action area should stay fixed.

Different current statuses show different action buttons:

- Pending review: Reject / Continue observation / Confirm formal warning
- Formal warning: Request supplementary feedback / Record intervention
- In intervention: Add intervention record / Arrange re-test / Referral

---

## Status rules

Current status and feedback status are different.

Current status:

- Pending review
- Observing
- Formal warning
- In intervention
- Pending re-test
- Referral
- Closed

Feedback status:

- Not requested
- Pending feedback
- Feedback received
- Feedback overdue
- New feedback

Do not let feedback status replace current status.

---

## Interaction principle

The system should not tell psychological teachers what professional action they must take next.

The list page only shows factual information.

Professional decisions happen in the detail drawer, based on:

- Assessment summary
- AI clue summary
- Homeroom teacher feedback
- Process timeline

---

## Prototype matching

The first implementation should match the current prototype direction:

- Dark topbar and sidebar
- Rounded status tab container
- Quick filter chips
- Table inside rounded card
- Right-side student risk detail drawer
- Fixed drawer footer actions

## App Shell and workbench viewport

- The expanded desktop sidebar is `152px`; the collapsed sidebar is `64px`.
- Sidebar width is the single App Shell column truth. Main content must not add a
  compensating left margin or preserve the expanded width after collapse.
- Main content uses all space after the sidebar with normal `16px-24px` padding;
  workbench content must not use a centered `max-width` container.
- At `1180px` and above, the workbench uses `minmax(0, 7fr) minmax(320px, 3fr)`.
  The title and overview cards remain full width above the two columns.
- Desktop workbench height fills the area below the topbar. The page itself does
  not scroll; task and arrangement bodies each own one independent scroll area.
- Scrollbars may be visually hidden, but wheel, trackpad, keyboard navigation,
  focus scrolling, and programmatic restoration must remain available.
- Below `1180px`, the workbench becomes one vertical page with one page-level
  scroll container and no nested column scrolling.

## Business Dialog sizing

- Small, medium, and large business Dialog widths are `520px`, `680px`, and
  `840px` respectively.
- Business Dialog content uses `max-height: calc(100dvh - 64px)`, leaving at
  least `32px` above and below the viewport edge.
- Header and Footer remain fixed inside the Dialog; only the middle form body
  scrolls when content exceeds the available height.

## School overview layout

- The school overview uses the full App Shell content width with no centered
  `max-width` wrapper.
- At desktop widths, four core metrics and compact attention facts remain in the
  first viewport; analysis modules use a responsive two-column grid.
- At narrower widths, modules become one page-level vertical flow. Do not add
  nested chart scroll containers or page-level horizontal scrolling.
- Charts must also expose visible text values and accessible summaries. Color is
  supplementary, not the only encoding.
- Suppressed class values use the same safe copy in visible text, tooltips, ARIA,
  and DOM attributes; hidden precise numbers must not be rendered.
## School Overview Phase S1.2

- 校级总览使用三层决策看板结构：三张核心概览卡、全宽四阶段概览、三张分析卡。
- 1360px 以上概览卡采用约 `0.8fr / 1.2fr / 1.2fr`，分析卡采用约 `1.1fr / 1.1fr / 0.7fr`。
- 处置阶段卡的横条只表示相对规模，不使用完成率文案。
- 图表保持白底、轻边框和克制阴影；风险色只用于必要强调。
- 1024px 以下使用单列页面滚动，不产生整页横向滚动或嵌套可见滚动条。

## Visual Token V1

- 视觉 Token、领域状态色和图表色以 `docs/specs/visual-tokens-v1.md` 与 `src/index.css` 为准。
- 保留深色 Topbar 和 Sidebar；内容区使用轻蓝灰页面背景和白色卡片。
- 中风险固定蓝色，高风险固定橙色，危险固定红色，已闭环固定绿色。
- Primary 600 承载小号白字主按钮；Primary 500 用于链接、图标和图表。
- 纯展示 Card 无明显 Hover，仅显式可交互 Card 提供 Hover 和 Focus。
