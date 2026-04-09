---
businessCapability: EnrollmentManagement
feature: FN12003_US34003
layer: UI
project_type: ui-component
status: draft
compliance_mode: pilot
generation-strategy: single-pass
passes-completed: single
excluded-sections:
  - "version_history — charter_exclusion: Change History sections excluded per AKR_CHARTER_UI.md"
---

<!-- akr-generated
skill: akr-docs
mode: generate
template: reyesmelvinr-emr/core-akr-templates@master/templates/ui_component_template_module.md
charter: reyesmelvinr-emr/core-akr-templates@master/copilot-instructions/ui-component.instructions.md
steps-completed: 1, 2, 3, 4, 5, 6, 7, 8
generation-strategy: single-pass
passes-completed: single
pass-timings-seconds: preflight=2 | template-fetch=0 | charter-fetch=0 | source-extraction=8 | assembly=16 | write=2
total-generation-seconds: 28
generated-at: 2026-04-08T00:00:00Z
-->

# EnrollmentsPage

**Module Scope**: Multi-component domain unit  
**Components in Module**: 7 (see Module Files section below)  
**Primary Domain Noun**: Enrollment  
**Complexity**: Complex  

## Screenshot Reference

[Enrollments Page Screenshot](../../screenshots/Enrollment.png)


<!-- akr:section id="quick_reference" required=true order=1 authorship="mixed" human_columns="accessibility,business_context" -->
## Quick Reference

| | |
|---|---|
| **What it does** | 🤖 Provides a paginated management interface for viewing, creating, completing, cancelling, and deleting course enrollments, with cross-domain data enrichment from the user and course lists |
| **When to use** | 🤖 When an authorized user needs to manage enrollment records linking a user to a training course |
| **When NOT to use** | 🤖 Use `CourseCatalogPage` to browse or manage course definitions; use `UsersPage` to manage user accounts; use `AdminPage` for application-level configuration |
| **Accessibility** | WCAG level not specified; native buttons are keyboard-accessible; modal lacks `role="dialog"`, focus trap, and `Escape` key handler; `<select>` elements have visible labels but no ARIA enhancements — VERIFY before production |
| **Status** | 🤖 Stable — active route in the Training Tracker application |

**Example usage**:
```tsx
🤖 // Rendered as a route in the application router (src/pages/App.tsx)
import { Enrollments } from '@/pages/Enrollments';

<Route path="/enrollments" element={<Enrollments />} />
```

---

<!-- akr:section id="module_files" required=true order=2 authorship="ai" -->
## Module Files

| File | Type | Role | Primary Responsibilities |
|------|------|------|--------------------------|
| 🤖 `src/pages/Enrollments.tsx` | 🤖 Page (Container) | 🤖 Primary | 🤖 Orchestrates paginated enrollment list, status-transition actions (complete/cancel/delete), create modal with user + course selects, summary stat cards, and three-hook data orchestration |
| 🤖 `src/hooks/useEnrollments.ts` | 🤖 Custom Hook | 🤖 Data/State | 🤖 Fetches paginated enrollments from API with mock fallback; exposes `refetch` (wrapped in `useCallback`) |
| 🤖 `src/components/common/Layout.tsx` | 🤖 Container | 🤖 Supporting | 🤖 Provides sidebar navigation, user identity display, logout handler, and `<main>` content wrapper |
| 🤖 `src/components/common/Table.tsx` | 🤖 Presentational | 🤖 Supporting | 🤖 Generic typed table with configurable columns, caption, and empty-state message |
| 🤖 `src/components/common/StatusBadge.tsx` | 🤖 Presentational | 🤖 Supporting | 🤖 Renders colored inline badge with `role="status"` for enrollment status display |
| 🤖 `src/components/common/Card.tsx` | 🤖 Presentational | 🤖 Supporting | 🤖 Semantic `<section>` wrapper used for summary stat cards, the main enrollment table card, and the error state |
| 🤖 `src/components/common/Button.tsx` | 🤖 Presentational | 🤖 Supporting | 🤖 Accessible button with `primary`/`secondary`/`danger` variants and `aria-busy` loading state |

**Module Grouping Principle:**  
All components belong to the Enrollment domain. `Enrollments.tsx` is the root container; `useEnrollments` is the primary data hook. Shared components (`Layout`, `Table`, `StatusBadge`, `Card`, `Button`) are consumed directly here and are also assigned to `CommonComponents` per modules.yaml convention. Note: `useCourses` and `useUsers` are imported from their respective modules to fulfill the cross-domain enrichment requirement.

---

<!-- akr:section id="purpose_context" required=true order=3 authorship="mixed" human_columns="business_context" -->
## Purpose & Context

### What This Module Does

🤖 The EnrollmentsPage module provides a complete enrollment management interface within the Training Tracker application. It fetches paginated enrollment records and enriches them with human-readable course names and user details by performing client-side lookups against full course and user lists loaded at page mount. Users can create new enrollments by selecting a user and a course from dropdowns, and they can transition individual enrollment statuses (Complete, Cancel) or permanently delete records.

Business context for this proof-of-concept:
- This module operationalizes assignment and lifecycle tracking of employee training participation.
- It supports compliance reporting by capturing enrollment, completion, and cancellation outcomes.
- Authorized roles for create/update/delete actions are Admin and Training Coordinator.
- Status progression is enforced by both UI action gating and API-side validation.

---

### When to Use This Module

🤖 **Use this module when:**
- An authorized user needs to view all course enrollment records with user and course context
- A new enrollment pairing (user + course) needs to be created
- An existing active enrollment needs to be marked completed or cancelled
- An enrollment record needs to be permanently deleted

Application examples for this proof-of-concept:
- Visibility is limited to Admin and Training Coordinator roles.
- Instructor-scoped views are not part of this pilot and will be addressed in a later release.
- Re-enroll and reinstate actions are planned for the next phase after pilot sign-off.

---

### When NOT to Use This Module

🤖 **Don't use this module when:**
- Course catalog browsing or course CRUD is needed → Use `CourseCatalogPage` instead
- User account management is needed → Use `UsersPage` instead
- Training completion certificates or reports are needed → Build a dedicated reporting module
- Self-enrollment by learners (non-admin) is needed → Not implemented; VERIFY planned UX

---

<!-- akr:section id="module_files_detail" required=true order=4 authorship="ai" -->
## Module Files Detail

### Component Hierarchy

```
Enrollments (Page/Container)
├─ Layout (Container — shared)
│   ├─ useAuth() [from AuthContext] → user.email, user.role, logout()
│   └─ NavLink × 5 (React Router) — Dashboard, Courses, Users, Enrollments, Admin
├─ div.grid — Summary Cards
│   ├─ Card — "Total Enrollments" (enrollmentsData?.totalCount)
│   ├─ Card — "Active" (data.filter ACTIVE|PENDING count)
│   └─ Card — "Completed" (data.filter COMPLETED count)
├─ Card (title="All Enrollments")
│   ├─ [loading=true]    → "Loading enrollments..."
│   ├─ [data.length=0]   → Empty state paragraph (custom message)
│   └─ [data present]    → Table<EnrollmentRow>
│       ├─ Column: User (fullName + email, two-line cell)
│       ├─ Column: Course (courseName string)
│       ├─ Column: Status → StatusBadge (tone mapped from getStatusTone())
│       ├─ Column: Enrolled Date (formatted)
│       ├─ Column: Completed Date (formatted or "—")
│       └─ Column: Actions
│           ├─ [ACTIVE|PENDING] Button (primary) — "Complete"
│           ├─ [ACTIVE|PENDING] Button (secondary) — "Cancel"
│           └─ Button (secondary) — "Delete" / "Deleting..." (disabled when isDeleting=id)
├─ [totalPages > 1] → Pagination row
│   ├─ Button (secondary) — Previous
│   ├─ Span — "Page N of M (K total)"
│   └─ Button (secondary) — Next
└─ [showCreateModal=true] → Modal Overlay (fixed-position div)
    └─ Modal Body
        ├─ h2 — "Create New Enrollment"
        ├─ [createError] → Error banner
        └─ form (onSubmit=handleCreateSubmit)
            ├─ select[required] — User (populated from usersData?.items)
            ├─ select[required] — Course (populated from coursesData?.items)
            ├─ Button (type="button", secondary) — Cancel
            └─ Button (type="submit", primary) — "Creating..." | "Create"
```

---

### `Enrollments.tsx` — Page (Container)

**Responsibility**: 🤖 Root page; owns all enrollment state and mutation logic; orchestrates three concurrent hooks (`useEnrollments`, `useCourses`, `useUsers`); derives enriched `EnrollmentRow[]` via cross-domain lookup maps; renders summary cards, data table, pagination, and create modal  
**Dependencies**: 🤖 `useEnrollments`, `useCourses`, `useUsers`, `api` (direct axios), `Layout`, `Table`, `StatusBadge`, `Card`, `Button`  
**Consumers**: 🤖 React Router route `/enrollments` (VERIFY: `src/pages/App.tsx`)  

**Key Props**: _(none — route-level component)_

**Key State:**

| State Variable | Type | Default | Purpose |
|---|---|---|---|
| 🤖 `page` | `number` | `1` | Current pagination page for enrollment list |
| 🤖 `showCreateModal` | `boolean` | `false` | Controls create enrollment modal visibility |
| 🤖 `createForm` | `{ userId: string; courseId: string }` | `{ userId: '', courseId: '' }` | Controlled select values for create modal |
| 🤖 `isCreating` | `boolean` | `false` | Loading state during enrollment creation; disables form inputs |
| 🤖 `createError` | `string \| null` | `null` | API error surfaced inside create modal |
| 🤖 `isDeleting` | `string \| null` | `null` | ID of enrollment currently being deleted; enables per-row "Deleting..." state |

**Composite loading flag:** 🤖 `loading = loadingEnrollments || loadingCourses || loadingUsers` — all three hooks must resolve before the table renders.

**Memoized derived values:**

| Value | `useMemo` deps | Purpose |
|---|---|---|
| 🤖 `courseMap` | `[coursesData]` | `Map<courseId, CourseSummary>` for O(1) course name lookup during enrichment |
| 🤖 `userMap` | `[usersData]` | `Map<userId, UserSummary>` for O(1) user email/name lookup during enrichment |
| 🤖 `data: EnrollmentRow[]` | `[enrollmentsData, courseMap, userMap]` | Enriched enrollment rows joining API enrollment with resolved course title and user identity |
| 🤖 `columns` | `[isDeleting]` | Column definitions including per-row state-conditional action buttons; depends only on `isDeleting` (not `data`) |

---

### `useEnrollments.ts` — Custom Hook

**Responsibility**: 🤖 Fetches paginated enrollment records from `GET /api/enrollments`; supports mock fallback via `maybeMock()`; exposes `refetch` wrapped in `useCallback` for stable callback reference  
**Dependencies**: 🤖 `api` (axios instance), `maybeMock` (mock/live toggle from `services/api.ts`)  
**Consumers**: 🤖 `Enrollments.tsx` (primary), potentially other pages needing enrollment data  

**Signature:**
```ts
useEnrollments(page?: number, pageSize?: number, enabled?: boolean): {
  data: PagedEnrollments | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
```

**Effect dependencies**: `[page, pageSize, enabled, refetchTrigger]`  
**Cleanup**: 🤖 `cancelled` flag prevents state updates after unmount  
**Mock data**: 🤖 Empty `items: []` — no seed data; page loads with 0 records in development without a live API  
**Refetch stability**: 🤖 `refetch` is wrapped in `useCallback([])` — stable reference (unlike `useUsers` which was not memoized — VERIFY consistency planned)

---

### Shared Components (Layout, Table, StatusBadge, Card, Button)

These are fully documented in the `UsersPage_doc.md` and `CommonComponents` module. Key usage specifics for this module:

- 🤖 **`Table<EnrollmentRow>`**: `caption="Course Enrollments"`, 6 columns; `emptyMessage` default is unused (empty state handled via a custom branch before `Table` renders)
- 🤖 **`StatusBadge`**: `tone` driven by `getStatusTone()` — a local helper that maps uppercase status strings to `BadgeTone`. VERIFY: is status string casing normalized by the API or must the UI always call `.toUpperCase()`?
- 🤖 **`Card`**: Used three ways — as titled container for enrollment table (`title="All Enrollments"`), as untitled stat cards (three summary metrics), and as error container
- 🤖 **`Button`**: Used with per-row `isDeleting === r.id` guard for the Delete action; no `loading` prop is set — `disabled` state and text swap are managed inline in the accessor

---

<!-- akr:section id="hook_dependency" required=true order=5 authorship="ai" -->
## Hook Dependency

### Custom Hooks in This Module

| Hook | File | Purpose | Used By |
|---|---|---|---|
| 🤖 `useEnrollments` | `src/hooks/useEnrollments.ts` | Paginated enrollment data with mock/live toggle and stable `refetch` | `Enrollments.tsx` |
| 🤖 `useCourses` | `src/hooks/useCourses.ts` | Full course list (pageSize=100) for create-modal select and name enrichment | `Enrollments.tsx` |
| 🤖 `useUsers` | `src/hooks/useUsers.ts` | Full user list (pageSize=100) for create-modal select and identity enrichment | `Enrollments.tsx` |

### Hook Call Chain

```
Enrollments
├─ page (state) ────────────────────────────────────────┐
│                                                        │ re-runs effect
├─ useEnrollments(page, pageSize=10)                     │
│  ├─ Dependency source: [page, pageSize, enabled, refetchTrigger]
│  ├─ State: data (PagedEnrollments|null), loadingEnrollments, error
│  ├─ Side effect: GET /api/enrollments?page=N&pageSize=10
│  └─ Exposes: refetch() [useCallback] → increments refetchTrigger
│
├─ useCourses({ page: 1, pageSize: 100 })
│  ├─ Dependency source: [page=1, pageSize=100, enabled=true (fixed)]
│  ├─ State: coursesData (PagedCourses|null), loadingCourses
│  └─ Side effect: GET /api/courses?page=1&pageSize=100 (fires once on mount)
│
├─ useUsers(1, 100)
│  ├─ Dependency source: [page=1, pageSize=100, enabled=true (fixed)]
│  ├─ State: usersData (PagedUsers|null), loadingUsers
│  └─ Side effect: GET /api/users?page=1&pageSize=100 (fires once on mount)
│
├─ loading = loadingEnrollments || loadingCourses || loadingUsers
│
├─ courseMap (useMemo[coursesData]) → Map<id, CourseSummary>
├─ userMap   (useMemo[usersData])   → Map<id, UserSummary>
├─ data      (useMemo[enrollmentsData, courseMap, userMap]) → EnrollmentRow[]
│
└─ Layout (rendered inside Enrollments return)
   └─ useAuth() [AuthContext]
      ├─ Dependency source: React Context
      └─ Returns: user { email, role }, logout()
```

**Re-render sensitivity**: 🤖 Three concurrent API calls fire on mount; composite `loading` is truthy until all three resolve. `columns` memo depends only on `[isDeleting]` to avoid re-creating cell renderers on every data update. `data` memo re-runs whenever enrollment page changes or course/user lookup maps update.

**Memoization notes**: 🤖 `useCourses` and `useUsers` are called with fixed `page=1, pageSize=100` — their effects fire once at mount and do not re-trigger on enrollment page changes. The `refetch` from `useEnrollments` is `useCallback`-wrapped; `refetch` from `useUsers` (used in `UsersPage`) was not — inconsistency may be intentional (enrollment context needs stable callback) or oversight. VERIFY.

---

<!-- akr:section id="type_definitions" required=true order=6 authorship="ai" -->
## Type Definitions

### Module-Specific Types

**Defined in `src/pages/Enrollments.tsx`** (local — not exported):

| Type | Purpose | Used By |
|---|---|---|
| 🤖 `EnrollmentRow` | Enriched display model for `Table<EnrollmentRow>`; joins `EnrollmentSummary` with resolved `courseName`, `userEmail`, `userFullName` | `Enrollments.tsx` (`data` derivation, column accessors) |

**Defined in `src/hooks/useEnrollments.ts`** (exported):

| Type | Purpose | Used By |
|---|---|---|
| 🤖 `EnrollmentSummary` | API-level enrollment record from `GET /api/enrollments` | `useEnrollments.ts` (item type), `Enrollments.tsx` (via `enrollmentsData.items`) |
| 🤖 `PagedEnrollments` | Paginated response wrapper with `items: EnrollmentSummary[]` | `useEnrollments.ts` (hook state), `Enrollments.tsx` (pagination controls) |

**Cross-module type dependencies:**

| Type | Source Module | Usage in EnrollmentsPage |
|---|---|---|
| 🤖 `CourseSummary` (inferred) | `useCourses.ts` (CourseCatalogPage module) | `courseMap` value type; `coursesData.items` accessor |
| 🤖 `UserSummary` | `useUsers.ts` (UsersPage module) | `userMap` value type; `usersData.items` accessor; also populates create modal User select |

### Type Relationships

```typescript
🤖 // Exported from useEnrollments.ts
export interface EnrollmentSummary {
  id: string;
  courseId: string;
  userId: string;
  status: string;         // string enum — uppercase values (e.g. 'ACTIVE', 'COMPLETED')
  enrolledUtc: string;
  completedUtc?: string | null;
}

export interface PagedEnrollments {
  items: EnrollmentSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Local to Enrollments.tsx — enriched display model
interface EnrollmentRow {
  id: string;
  courseId: string;
  courseName: string;     // resolved from courseMap
  userId: string;
  userEmail: string;      // resolved from userMap
  userFullName: string;   // resolved from userMap
  status: string;
  enrolledUtc: string;
  completedUtc?: string | null;
}
```

> 🤖 `status` is typed as `string` (not a union or enum). UI logic calls `.toUpperCase()` before all status comparisons. VERIFY: does the API guarantee uppercase status strings? If so, `toUpperCase()` calls are redundant; if not, they are necessary guards.

---

<!-- akr:section id="component_behavior" required=true order=7 authorship="human" -->
## Component Behavior

### User Interactions (Module Level)

| User Action | Primary Component Response | Affected Components | Side Effects |
|---|---|---|---|
| Click "+ Create Enrollment" | `handleCreateEnrollment()` → `showCreateModal=true`, form reset, `createError=null` | Modal overlay; User `<select>` populated from `usersData`; Course `<select>` from `coursesData` | No API call yet |
| Form submit (Create) | HTML5 validation, then `api.post('/api/enrollments', { userId, courseId })` | `isCreating=true`; selects disabled | `POST /api/enrollments` → `showCreateModal=false` → `refetch()` |
| Click "Complete" button (on ACTIVE/PENDING row) | `handleCompleteEnrollment(id)` → `window.confirm` | Browser-native confirm dialog | On confirm: `PATCH /api/enrollments/{id}/status { status: 'COMPLETED' }` → `refetch()` |
| Click "Cancel" button (on ACTIVE/PENDING row) | `handleCancelEnrollment(id)` → `window.confirm` | Browser-native confirm dialog | On confirm: `PATCH /api/enrollments/{id}/status { status: 'CANCELLED' }` → `refetch()` |
| Click "Delete" button | `handleDeleteEnrollment(id)` → `window.confirm` | `isDeleting=id`; Delete button shows "Deleting..." and is `disabled` | On confirm: `DELETE /api/enrollments/{id}` → `isDeleting=null` → `refetch()` |
| Click "Cancel" in modal | `setShowCreateModal(false)` | Modal unmounts | No API call |
| Click "Previous" pagination | `setPage(p => Math.max(1, p - 1))` | Table re-renders with new page data | `GET /api/enrollments?page=N-1` |
| Click "Next" pagination | `setPage(p => Math.min(totalPages, p + 1))` | Table re-renders with new page data | `GET /api/enrollments?page=N+1` |

---

<!-- akr:section id="data_flow" required=true order=8 authorship="ai" -->
## Data Flow

### Props → State → Render

```
Route Mount (/enrollments)
    ↓
Enrollments() — page=1, pageSize=10
    ↓                         ↓                          ↓
useEnrollments(page,10)   useCourses({page:1,size:100})  useUsers(1,100)
GET /api/enrollments       GET /api/courses               GET /api/users
    ↓                         ↓                          ↓
enrollmentsData           coursesData                   usersData
    ↓                         ↓                          ↓
courseMap = Map<id,course> <──────────────────────────────┘
userMap   = Map<id,user>   <──────────────────────────────┘
    ↓
data = enrollmentsData.items.map(e => {
  courseName:  courseMap.get(e.courseId)?.title || 'Unknown Course'
  userEmail:   userMap.get(e.userId)?.email || 'Unknown'
  userFullName: userMap.get(e.userId)?.fullName || 'Unknown User'
  ...rest
})
    ↓
Summary Cards: filter data for ACTIVE/PENDING and COMPLETED counts
    ↓
Table<EnrollmentRow> renders rows with StatusBadge + action Buttons
```

### API Data Flow — Mutations (all direct via `api`)

```
Create:
  User selects user + course → form submit
  → POST /api/enrollments { userId, courseId }
  → On success: showCreateModal=false, refetch()
  → On error: createError displayed in modal

Complete:
  "Complete" click → window.confirm
  → PATCH /api/enrollments/{id}/status { status: 'COMPLETED' }
  → On success: refetch()
  → On error: window.alert(message)

Cancel:
  "Cancel" click → window.confirm
  → PATCH /api/enrollments/{id}/status { status: 'CANCELLED' }
  → On success: refetch()
  → On error: window.alert(message)

Delete:
  "Delete" click → window.confirm → isDeleting=id
  → DELETE /api/enrollments/{id}
  → On success: isDeleting=null, refetch()
  → On error: window.alert(message), isDeleting=null
```

---

<!-- akr:section id="visual_states" required=true order=9 authorship="human" -->
## Visual States

### Module Loading State

```
Route Mount (3 concurrent API calls)
    ↓
loading = true (loadingEnrollments OR loadingCourses OR loadingUsers)
    ↓
Card "All Enrollments" shows "Loading enrollments..."
Summary cards show 0 / 0 / 0 (enrollmentsData is null)
    ↓
All three hooks resolve
    ↓
loading = false
    ↓
Enriched table or empty state paragraph rendered
Summary cards updated with live counts
```

### Module States

| State | Description | Visual Appearance | Interaction |
|---|---|---|---|
| **Loading** | Any of 3 hooks still in-flight | "Loading enrollments..." inside `Card`; summary cards show 0 | Table not visible; "+ Create Enrollment" button accessible |
| **Success (data)** | All hooks resolved, items present | Summary cards with counts; Table with enriched rows; pagination if `totalPages > 1` | Full interaction: Complete/Cancel/Delete per row; Create |
| **Empty** | All hooks resolved, `data.length === 0` | Custom paragraph: "No enrollments found. Create your first enrollment to get started." | "+ Create Enrollment" button still functional |
| **Error** | `useEnrollments` error | Layout renders with red `<p>` error text inside `Card` | No retry button — page reload required |
| **Modal — Create** | `showCreateModal=true` | Fixed overlay; h2: "Create New Enrollment"; two `<select>` dropdowns | User and Course required; Cancel / Create buttons |
| **Form Submitting** | `isCreating=true` | Submit button shows "Creating..."; selects `disabled` by implication | Non-interactive during submit |
| **Form Error** | `createError` set | Red banner inside modal with API error message | User can re-select and resubmit |
| **Row Deleting** | `isDeleting === row.id` | Delete button text changes to "Deleting..." and is `disabled` | Other rows remain interactive |
| **Action-conditional buttons** | Status is not ACTIVE or PENDING | "Complete" and "Cancel" buttons are hidden; only "Delete" shows | Per-row status state machine |

---

<!-- akr:section id="component_architecture" required=true order=10 authorship="mixed" human_columns="consumer_impact" -->
## Component Architecture

### Module Composition

🤖 `Enrollments` is the root container. Unlike `UsersPage` which has one primary hook, this page coordinates three hooks simultaneously to satisfy a cross-domain enrichment requirement: enrollment records contain only IDs, so course and user lists must be pre-loaded to resolve display names. The create modal also re-uses those same pre-loaded lists to populate its `<select>` dropdowns, eliminating the need for additional API calls when the modal opens.

All data mutations invoke `api` directly (the axios instance from `services/api.ts`) rather than going through a dedicated service object. This is a different pattern from `UsersPage` which used `usersApi` from `apiClient.ts`. VERIFY: is direct `api` usage intentional or should an `enrollmentsApi` service object be introduced for consistency?

**Component Interaction Pattern:**
- 🤖 `Enrollments` calls three hooks on mount; composite `loading` gates all table rendering
- 🤖 `courseMap` and `userMap` (`useMemo`) perform O(1) cross-domain lookups per enrollment item
- 🤖 `columns` memo depends only on `[isDeleting]` — action button rendering is conditional on both status and current delete state
- 🤖 Row-level status state machine (`ACTIVE`/`PENDING` → Complete/Cancel visible) is computed inline in column accessor; no separate status reducer

### Dependencies

🤖 **External dependencies:**
- `react` — `useMemo`, `useState` for state management
- `react-router-dom` — route rendering; `NavLink`, `useNavigate` via `Layout`
- `axios` — HTTP client via `services/api.ts` (direct instance)

🤖 **Internal dependencies:**
- `useEnrollments` — paginated enrollment data hook
- `useCourses` (`src/hooks/useCourses.ts`) — course list for select and enrichment (cross-module)
- `useUsers` (`src/hooks/useUsers.ts`) — user list for select and enrichment (cross-module)
- `api` (`src/services/api.ts`) — direct axios instance for CRUD mutations
- `Layout`, `Table<EnrollmentRow>`, `StatusBadge`, `Card`, `Button` — shared UI components

🤖 **APIs and services:**
- `GET /api/enrollments?page=N&pageSize=M` — paginated enrollment list (via `useEnrollments`)
- `GET /api/courses?page=1&pageSize=100` — full course list for select + enrichment (via `useCourses`)
- `GET /api/users?page=1&pageSize=100` — full user list for select + enrichment (via `useUsers`)
- `POST /api/enrollments` — create new enrollment
- `PATCH /api/enrollments/{id}/status` — transition enrollment status (Complete → `COMPLETED`, Cancel → `CANCELLED`)
- `DELETE /api/enrollments/{id}` — permanently delete enrollment

### Module Consumers

Consumer impact — verify with routing configuration:
- 🤖 `src/pages/App.tsx` — expected to define `<Route path="/enrollments" element={<Enrollments />} />` (VERIFY)
- Is this route guarded by role? The sidebar renders the Enrollments link for all authenticated users.
- `pageSize=100` for courses and users is a hard-coded ceiling. If either list grows beyond 100 entries, the create modal select will silently omit entries. Confirm whether server-side search-driven selects should replace these lists.

---

<!-- akr:section id="accessibility" required=true order=11 authorship="human" -->
## Accessibility

### WCAG Compliance

**WCAG Level:** Not specified — unverified  
**Keyboard navigable:** Partially — native `<button>` and `<select>` elements are keyboard-accessible; modal lacks focus trap and `Escape` key handler  
**Screen reader compatible:** Partial — `StatusBadge` uses `role="status"`; action buttons have `aria-label` on Complete/Cancel/Delete; `Card` uses `aria-label` via `title`  
**Color contrast:** Not verified — CSS module class values not inspected  
**Focus indicators:** Not verified from source inspection

### Module Keyboard Navigation

| Key | Action |
|---|---|
| `Tab` | Navigate through: "+ Create Enrollment" → summary cards (no focusable content unless Card has interactive elements) → table action buttons (Complete, Cancel, Delete per row) → pagination buttons |
| `Shift+Tab` | Move to previous focusable element |
| `Enter` / `Space` | Activate focused button or open select |
| `Escape` | No `Escape` handler on modal — NOT implemented. VERIFY. |
| `Tab` (in modal) | Navigate: User `<select>` → Course `<select>` → Cancel button → Create button |
| `Arrow Up/Down` | Navigate within `<select>` dropdown options |

### Screen Reader Behavior

**Module announces (inferred):**
```
"Enrollments, heading level 1"
"All Enrollments, region" (Card with aria-label="All Enrollments")
"Course Enrollments, table caption"
"[status], status" (StatusBadge role="status")
"Mark as complete, button" / "Cancel enrollment, button" / "Delete enrollment, button"
[Modal] "Create New Enrollment, heading level 2"
"User, [n] options" (native select — browser-announced)
```

**Modal accessibility gaps (🤖 AI-detected; VERIFY with audit):**
- 🤖 No `role="dialog"` or `aria-modal="true"` on modal overlay `<div>` — screen readers will not identify it as a dialog
- 🤖 No focus trap — focus is not moved into modal on open, nor returned to trigger button on close
- 🤖 No `aria-labelledby` linking `<h2>` to the modal container
- 🤖 No `Escape` key close handler

**Action button `aria-label` specificity gap:** 🤖 Complete/Cancel/Delete buttons use generic `aria-label` values (`"Mark as complete"`, `"Cancel enrollment"`, `"Delete enrollment"`) without row-specific context (e.g., user name or course name). A screen reader user cannot distinguish which enrollment the action applies to. VERIFY severity.

These gaps represent WCAG 2.1 AA failures. Confirm remediation priority before production graduation.

---

<!-- akr:section id="testing" required=true order=12 authorship="human" -->
## Testing

### Test Structure

```
src/components/common/__tests__/ (existing shared component tests)
├─ Button.test.tsx       ✅ Exists
├─ StatusBadge.test.tsx  ✅ Exists
└─ Table.test.tsx        ✅ Exists

EnrollmentsPage-specific test file:
└─ No dedicated Enrollments.test.tsx found — NEEDS creation

Recommended test structure:
Enrollments.test.tsx
├─ Render tests
│  ├─ Shows "Loading enrollments..." while any hook is loading
│  ├─ Renders enriched table rows after all hooks resolve
│  ├─ Shows empty state paragraph when data.length === 0
│  ├─ Shows error card when useEnrollments returns error
│  └─ Summary cards show correct counts (total, active, completed)
├─ Interaction tests
│  ├─ "+ Create Enrollment" opens modal with blank selects
│  ├─ Form submit calls POST /api/enrollments with userId + courseId
│  ├─ Successful create closes modal and calls refetch
│  ├─ Failed create shows error banner in modal
│  ├─ "Complete" click confirms then calls PATCH status=COMPLETED
│  ├─ "Cancel" click confirms then calls PATCH status=CANCELLED
│  ├─ "Delete" click confirms → isDeleting set → DELETE called → refetch
│  ├─ Complete/Cancel buttons hidden for non-ACTIVE/PENDING status rows
│  └─ Pagination Previous/Next updates page state
└─ Accessibility tests
   ├─ StatusBadge has role="status"
   └─ Action buttons have aria-label (currently generic — VERIFY)
```

### Test Coverage Goals

| Category | Target | Current | Notes |
|---|---|---|---|
| Statement coverage | 80%+ | —% | No `Enrollments.test.tsx` exists |
| Branch coverage | 70%+ | —% | Status-conditional button branches untested |
| Function coverage | 80%+ | —% | All 4 mutation handlers untested |
| Line coverage | 80%+ | —% | `getStatusTone()` branches untested |

---

<!-- akr:section id="known_issues" required=true order=13 authorship="human" -->
## Known Issues

### Module Limitations

**This module does NOT:**
- Support re-enrolling a user in a course after cancellation or failure
- 🤖 Implement an accessible modal (`role="dialog"`, focus trap, `Escape` key close absent)
- 🤖 Guard against enrolling the same user in the same course twice (no client-side duplicate check before POST)
- Cap the `pageSize=100` course and user lists — select dropdowns will silently be incomplete if either list exceeds 100 entries
- 🤖 Show enrollment history or audit trail for status transitions
- Support bulk operations (bulk complete, bulk cancel, bulk delete)

### Known Issues

| Issue | Impact | Workaround | Tracking |
|---|---|---|---|
| Modal missing `role="dialog"`, focus trap, `Escape` close | Screen reader / keyboard users cannot interact correctly with create modal | Manual focus management | No ticket |
| `pageSize=100` ceiling on users and courses for create selects | Enrollments to users/courses beyond index 100 cannot be created via UI | Use API directly or paginate selects | No ticket |
| Confirm/alert use `window.confirm` / `window.alert` | Not styleable, not unit-testable, may be blocked by browser policy | None available | No ticket |
| 🤖 Action `aria-label` values are generic (no per-row context) | Screen reader users cannot distinguish which enrollment Complete/Cancel/Delete applies to | None | No ticket |
| Error state after failed load has no retry button | User must reload the entire page | Browser reload | No ticket |
| 🤖 Direct `api` usage for mutations vs `usersApi` pattern in other pages | Inconsistent service access pattern across modules | N/A — no runtime impact | No ticket |

### Browser Support

| Browser | Version | Support | Known Issues |
|---|---|---|---|
| Chrome | 90+ | ✅ Full | None expected |
| Firefox | 88+ | ✅ Full | None expected |
| Safari | 14+ | ⚠️ Unknown | `window.confirm` / `window.alert` behavior not verified |

---

<!-- akr:section id="performance_considerations" required=true order=14 authorship="human" -->
## Performance Considerations

### Module Performance

- **Initial load time**: Not benchmarked — 3 concurrent API calls fire on mount; Time to Interactive depends on the slowest of the three
- **Re-render frequency**: 🤖 Medium — any enrollment page change triggers `useEnrollments` effect; `useCourses` and `useUsers` are stable after mount (fixed params)
- **Memory usage**: Not measured; full user and course lists held in memory via `courseMap` and `userMap`
- **Bundle size**: Not measured

### Applied Optimizations

✅ **Optimizations in place:**
- 🤖 `useMemo([coursesData])` on `courseMap` — O(1) lookup instead of O(n) find per row
- 🤖 `useMemo([usersData])` on `userMap` — same benefit
- 🤖 `useMemo([enrollmentsData, courseMap, userMap])` on `data` — enriched row array not recomputed on unrelated re-renders
- 🤖 `useMemo([isDeleting])` on `columns` — column array and cell renderers not recreated on data changes
- 🤖 `useCallback([])` on `refetch` in `useEnrollments` — stable callback reference
- 🤖 Server-side pagination for enrollment list (default `pageSize=10`)
- 🤖 `cancelled` flag cleanup in all three hook effects

### Performance Tips

✅ **DO:**
- Keep `pageSize=10` for the enrollment list to limit table DOM size
- Consider replacing `pageSize=100` static lists with server-side search (autocomplete) once user/course counts are large

❌ **DON'T:**
- Increase `pageSize=100` for course/user lists without validating API response times and select DOM impact
- Add additional `useEffect` calls directly in `Enrollments.tsx` without adding to the existing `cancelled`-flag cleanup pattern

---

<!-- akr:section id="questions_gaps" required=true order=15 authorship="human" -->
## Questions & Gaps

### Unanswered Questions

- Is the `/enrollments` route role-guarded? The sidebar shows the Enrollments link for all authenticated users — verify if enrollment create/mutate actions should be restricted to Admin or Manager roles.
- What is the full valid enrollment status state machine? Source shows ACTIVE, PENDING, COMPLETED, CANCELLED, DROPPED, WITHDRAWN, FAILED, EXPIRED — is this the complete API-level set? Are transitions other than → COMPLETED and → CANCELLED supported?
- `status` is typed as `string` — does the API guarantee uppercase values? If not, the `.toUpperCase()` calls in `getStatusTone()` and in action-button visibility conditions are necessary guards; if yes, they are redundant.
- The `pageSize=100` ceiling for course and user enrichment: what is the expected maximum number of courses and users in production? If > 100, the create modal will silently omit entries.
- Should duplicate enrollment (same user + same course) be prevented client-side before the POST? No client-side duplicate guard is present.
- What is the `businessCapability` registry key for this module? `EnrollmentManagement` is inferred 🤖 — NEEDS confirmation.
- Mutations use `api` directly rather than an `enrollmentsApi` service object (unlike `UsersPage` which uses `usersApi`). Is an `enrollmentsApi` in `apiClient.ts` planned for consistency?

### Documentation Gaps

- No `Enrollments.test.tsx` exists — no test coverage for the primary page or any mutation handler
- Accessibility audit incomplete — WCAG compliance level unverified; modal dialog gaps confirmed from code but not from runtime audit
- `feature` work-item tag not set — required before production graduation
- `getStatusTone()` status values (`DROPPED`, `WITHDRAWN`, `IN_PROGRESS`) not confirmed against the API contract — may be dead branches

### Technical Debt

- Modal is inline JSX — a reusable `Modal` or accessible `<dialog>` primitive would improve maintainability and resolve WCAG modal gaps
- `window.confirm` / `window.alert` for all destructive and status-transition actions — not testable, not styleable; replace with in-app confirmation dialogs
- `pageSize=100` for user/course lists should be replaced with server-side search selects as data grows
- Direct `api` mutation calls in the page component — consider introducing an `enrollmentsApi` service object in `apiClient.ts` for consistency with the `usersApi`/`coursesApi` pattern
- Enrollment status string comparisons are scattered across multiple locations (`getStatusTone`, column accessor, summary card filters) — a shared status constants or enum would reduce duplication and risk of typo bugs
