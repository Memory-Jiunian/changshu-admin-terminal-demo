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