---
businessCapability: UserManagement
feature: FN12002_US34002
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
pass-timings-seconds: preflight=2 | template-fetch=4 | charter-fetch=4 | source-extraction=6 | assembly=12 | write=2
total-generation-seconds: 30
generated-at: 2026-04-08T00:00:00Z
-->

# UsersPage

**Module Scope**: Multi-component domain unit  
**Components in Module**: 7 (see Module Files section below)  
**Primary Domain Noun**: User  
**Complexity**: Medium  

## Screenshot Reference

[Users Page Screenshot](../../screenshots/Users.png)


<!-- akr:section id="quick_reference" required=true order=1 authorship="mixed" human_columns="accessibility,business_context" -->
## Quick Reference

| | |
|---|---|
| **What it does** | 🤖 Provides a paginated management interface for viewing, creating, updating, and deleting system users |
| **When to use** | 🤖 When an authorized user needs to manage user accounts in the Training Tracker application |
| **When NOT to use** | 🤖 Use `AdminPage` for application-level configuration; use `AuthContext` for authentication flows; use `EnrollmentsPage` for enrollment management |
| **Accessibility** | WCAG level not specified; keyboard navigation is partially supported via native buttons; modal has no focus trap or `role="dialog"` — VERIFY before production |
| **Status** | 🤖 Stable — actively used as the primary user management route |

**Example usage**:
```tsx
🤖 // Rendered as a route in the application router (src/pages/App.tsx)
import { Users } from '@/pages/Users';

<Route path="/users" element={<Users />} />
```

---

<!-- akr:section id="module_files" required=true order=2 authorship="ai" -->
## Module Files

| File | Type | Role | Primary Responsibilities |
|------|------|------|--------------------------|
| 🤖 `src/pages/Users.tsx` | 🤖 Page (Container) | 🤖 Primary | 🤖 Orchestrates paginated user list, CRUD modal (create/edit/delete), and all user management state |
| 🤖 `src/hooks/useUsers.ts` | 🤖 Custom Hook | 🤖 Data/State | 🤖 Fetches paginated users from API with mock fallback; exposes `refetch` trigger |
| 🤖 `src/components/common/Layout.tsx` | 🤖 Container | 🤖 Supporting | 🤖 Provides sidebar navigation, user info, logout button, and `<main>` content wrapper |
| 🤖 `src/components/common/Table.tsx` | 🤖 Presentational | 🤖 Supporting | 🤖 Generic typed table with configurable columns, caption, and empty-state message |
| 🤖 `src/components/common/StatusBadge.tsx` | 🤖 Presentational | 🤖 Supporting | 🤖 Renders colored inline badge with `role="status"` for active/inactive display |
| 🤖 `src/components/common/Card.tsx` | 🤖 Presentational | 🤖 Supporting | 🤖 Semantic `<section>` wrapper with optional title (doubles as `aria-label`) and footer |
| 🤖 `src/components/common/Button.tsx` | 🤖 Presentational | 🤖 Supporting | 🤖 Accessible button with `primary`/`secondary`/`danger` variants and loading/busy state |

**Module Grouping Principle:**  
All components in this module are part of the same domain noun (User) and work together to deliver a complete user management feature. Shared components (`Layout`, `Table`, `StatusBadge`, `Card`, `Button`) are listed here because they are consumed directly by this module; they are also assigned to the `CommonComponents` module per the grouping conventions in `modules.yaml`.

---

<!-- akr:section id="purpose_context" required=true order=3 authorship="mixed" human_columns="business_context" -->
## Purpose & Context

### What This Module Does

🤖 The UsersPage module provides a complete user management interface within the Training Tracker application. It retrieves a paginated list of system users from the API, renders them in a tabular format with active/inactive status, and allows authorized users to create, update, and delete user accounts via an inline modal form.

Business context for this proof-of-concept:
- This module provides a single operational surface for managing user identities across training workflows.
- It supports account governance by keeping active/inactive status and contact records current.
- Authorized roles for this pilot are Admin and Training Coordinator.

---

### When to Use This Module

🤖 **Use this module when:**
- An authorized user needs to view all system users with server-side pagination
- A user account needs to be created, updated (name, email, active status), or deleted
- The application needs to show Active/Inactive status for each user at a glance

Application examples for this proof-of-concept:
- Access is restricted to Admin and Training Coordinator roles.
- A dedicated View Profile page is out of scope for this pilot and planned for a later increment.
- Search and filter capabilities are scheduled as a follow-up enhancement after pilot validation.

---

### When NOT to Use This Module

🤖 **Don't use this module when:**
- Authentication or login flows are needed → Use `AuthContext` and the login route instead
- Course enrollment management is needed → Use the `EnrollmentsPage` module instead
- Application-level settings are needed → Use the `AdminPage` module instead
- Single-user profile display is needed → Build a dedicated `UserProfile` component

---

<!-- akr:section id="module_files_detail" required=true order=4 authorship="ai" -->
## Module Files Detail

### Component Hierarchy

```
Users (Page/Container)
├─ Layout (Container — shared)
│   ├─ useAuth() [from AuthContext] → user.email, user.role, logout()
│   └─ NavLink × 5 (React Router) — Dashboard, Courses, Users, Enrollments, Admin
├─ Card (Presentational) — title="All Users"
│   ├─ [loading=true]  → "Loading users..." text
│   └─ [loading=false] → Table<UserRow> (Presentational)
│       ├─ Column: Email
│       ├─ Column: Full Name
│       ├─ Column: Status → StatusBadge (tone="success"|"danger")
│       ├─ Column: Created (formatted date string)
│       └─ Column: Actions
│           ├─ Button (variant="primary", aria-label="Edit [name]")
│           └─ Button (variant="secondary", aria-label="Delete [name]")
├─ [totalPages > 1] → Pagination row
│   ├─ Button (variant="secondary") — Previous (disabled on page 1)
│   ├─ Span — "Page N of M (K total users)"
│   └─ Button (variant="secondary") — Next (disabled on last page)
└─ [showModal=true] → Modal Overlay (fixed-position div)
    └─ Modal Body (div)
        ├─ h2 — "Edit User" | "Add New User"
        ├─ [formError] → Error banner (div, red)
        └─ form (onSubmit=handleSubmit)
            ├─ Input[type=email] — required, controlled (formData.email)
            ├─ Input[type=text]  — required, controlled (formData.fullName)
            ├─ Input[type=checkbox] — controlled (formData.isActive)
            ├─ Button (type="button", secondary) — Cancel
            └─ Button (type="submit", primary) — "Saving..." | "Update" | "Create"
```

---

### `Users.tsx` — Page (Container)

**Responsibility**: 🤖 Root page component; owns all user management state, instantiates `useUsers`, derives presentational data, and renders the full users UI including the CRUD modal  
**Dependencies**: 🤖 `useUsers`, `usersApi`, `Layout`, `Table`, `StatusBadge`, `Card`, `Button`  
**Consumers**: 🤖 React Router route for `/users` (VERIFY: `src/pages/App.tsx`)  

**Key Props**: _(none — route-level component, receives no external props)_

**Key State:**

| State Variable | Type | Default | Purpose |
|---|---|---|---|
| 🤖 `page` | `number` | `1` | Current pagination page for user list |
| 🤖 `pageSize` | `number` | `10` (const) | Fixed page size |
| 🤖 `showModal` | `boolean` | `false` | Controls create/edit modal visibility |
| 🤖 `editingUserId` | `string \| null` | `null` | ID of user being edited (`null` = create mode) |
| 🤖 `formData` | `UserFormData` | `{ email:'', fullName:'', isActive: true }` | Controlled form field values |
| 🤖 `formError` | `string \| null` | `null` | API or submission error message shown in modal |
| 🤖 `formLoading` | `boolean` | `false` | Loading state during form submission; disables form inputs |

**Memoized derived values:**

| Value | `useMemo` deps | Purpose |
|---|---|---|
| 🤖 `data: UserRow[]` | `[usersData]` | Extracts `usersData.items` to `UserRow[]`, defaults to `[]` |
| 🤖 `columns` | `[data]` | Column definitions including inline `StatusBadge` and `Button` cell renderers |

---

### `useUsers.ts` — Custom Hook

**Responsibility**: 🤖 Fetches paginated users from `GET /api/users`; supports transparent mock fallback via `maybeMock()`; exposes a `refetch` function via `refetchTrigger` state increment  
**Dependencies**: 🤖 `api` (axios instance from `services/api.ts`), `maybeMock` (mock/live toggle)  
**Consumers**: 🤖 `Users.tsx`  

**Signature:**
```ts
useUsers(page?: number, pageSize?: number, enabled?: boolean): {
  data: PagedUsers | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
```

**Effect dependencies**: `[page, pageSize, enabled, refetchTrigger]`  
**Cleanup**: 🤖 `cancelled` flag prevents state updates after unmount  
**Mock data**: 🤖 Hardcoded seed with 2 users (`alice@example.com`, `bob@example.com`) for local development without API

---

### `Layout.tsx` — Container (Shared)

**Responsibility**: 🤖 Application shell; renders sidebar with navigation links guarded by auth role, user identity display, logout handler, and a `<main>` content wrapper  
**Dependencies**: 🤖 `useAuth` (AuthContext), `NavLink`/`useNavigate` (React Router)  
**Consumers**: 🤖 All top-level page components including `Users`  

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| 🤖 `children` | `React.ReactNode` | Yes | Page-specific content rendered inside `<main>` |

**Side effects**: 🤖 `logout()` navigates to `/dashboard` via `useNavigate`

---

### `Table.tsx` — Presentational (Shared, Generic)

**Responsibility**: 🤖 Renders an HTML `<table>` with configurable typed columns; handles empty state with `emptyMessage`; renders `<caption>` when provided  
**Dependencies**: 🤖 CSS Module (`Table.module.css`)  
**Consumers**: 🤖 `Users.tsx` (typed as `Table<UserRow>`), also used in DashboardPage, CourseCatalogPage, EnrollmentsPage  

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| 🤖 `columns` | `Column<T>[]` | Yes | — | Column definitions; each has `id`, `header`, and `accessor: (row: T) => React.ReactNode` |
| 🤖 `data` | `T[]` | Yes | — | Row data array |
| 🤖 `emptyMessage` | `string` | No | `'No data'` | Shown in full-width `<td>` when `data` is empty |
| 🤖 `caption` | `string` | No | — | `<caption>` element; provides accessible table description |

---

### `StatusBadge.tsx` — Presentational (Shared)

**Responsibility**: 🤖 Renders a colored inline `<span>` with `role="status"` for accessibility; used in Users table to display Active/Inactive  
**Dependencies**: 🤖 CSS Module (`StatusBadge.module.css`)  
**Consumers**: 🤖 `Users.tsx` (maps `isActive` → `tone='success'|'danger'`), other page modules  

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| 🤖 `tone` | `'success' \| 'warning' \| 'danger' \| 'info'` | Yes | — | Visual color variant |
| 🤖 `children` | `React.ReactNode` | Yes | — | Badge label text |
| 🤖 `ariaLabel` | `string` | No | `String(children)` | Explicit ARIA label override |

---

### `Card.tsx` — Presentational (Shared)

**Responsibility**: 🤖 Semantic `<section>` wrapper; `title` prop becomes both `<header>` content and `aria-label` on the section; optional `footer`  
**Dependencies**: 🤖 CSS Module (`Card.module.css`)  
**Consumers**: 🤖 `Users.tsx` (wraps user table and error state), other page modules  

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| 🤖 `title` | `string` | No | Renders as `<header>` and sets `aria-label` on `<section>` |
| 🤖 `footer` | `React.ReactNode` | No | Renders as `<footer>` element inside card |
| 🤖 `children` | `React.ReactNode` | Yes | Main card body content |

---

### `Button.tsx` — Presentational (Shared)

**Responsibility**: 🤖 Accessible `<button>` with variant styles, loading spinner, and `aria-busy` during loading; `disabled` is implied when `loading=true`  
**Dependencies**: 🤖 CSS Module (`Button.module.css`)  
**Consumers**: 🤖 `Users.tsx` (Add User, Edit, Delete, Previous/Next pagination, form Cancel/Submit), other modules  

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| 🤖 `variant` | `'primary' \| 'secondary' \| 'danger'` | No | `'primary'` | Visual style variant |
| 🤖 `loading` | `boolean` | No | `false` | Renders loading spinner; sets `aria-busy`; implies `disabled` |
| 🤖 `disabled` | `boolean` | No | — | Native disabled; also applied when `loading=true` |
| 🤖 `...rest` | `ButtonHTMLAttributes<HTMLButtonElement>` | No | — | Spread to underlying `<button>` (e.g., `type`, `aria-label`, `onClick`) |

---

<!-- akr:section id="hook_dependency" required=true order=5 authorship="ai" -->
## Hook Dependency

### Custom Hooks in This Module

| Hook | File | Purpose | Used By |
|---|---|---|---|
| 🤖 `useUsers` | `src/hooks/useUsers.ts` | Paginated user data fetching with mock/live toggle and refetch | `Users.tsx` |

### Hook Call Chain

```
Users
├─ page (state) ──────────────────────────────┐
├─ useUsers(page, pageSize=10)                 │ re-runs effect
│  ├─ Dependency source: props [page, pageSize, enabled, refetchTrigger]
│  ├─ State managed: data (PagedUsers|null), loading, error
│  ├─ Side effect: GET /api/users?page=N&pageSize=M
│  │   via maybeMock() → mock data or live axios call
│  └─ Exposes: refetch() → increments refetchTrigger → re-triggers effect
│
└─ Layout (sibling, rendered inside Users return)
   └─ useAuth() [AuthContext]
      ├─ Dependency source: React Context (AuthContext.Provider)
      ├─ Returns: user { email, role }, logout()
      └─ Side effect on logout(): navigate('/dashboard')
```

**Re-render sensitivity**: 🤖 `useMemo` on `data` (`[usersData]`) and `columns` (`[data]`) limits unnecessary re-renders. `useUsers` effect is gated on `[page, pageSize, enabled, refetchTrigger]` — no stale closure risk from the `cancelled` flag cleanup.

**Memoization notes**: 🤖 `columns` is re-created when `data` changes (including first load), since column cell renderers reference `handleEditUser`/`handleDeleteUser` via closure. If those handlers were wrapped in `useCallback`, memoization stability would improve.

---

<!-- akr:section id="type_definitions" required=true order=6 authorship="ai" -->
## Type Definitions

### Module-Specific Types

**Defined in `src/pages/Users.tsx`** (local — not exported):

| Type | Purpose | Used By |
|---|---|---|
| 🤖 `UserRow` | Local display model for `Table<UserRow>` column rendering; mirrors `UserSummary` | `Users.tsx` (`data` derivation, column `accessor` functions) |
| 🤖 `UserFormData` | Controlled form state for the create/edit modal; also matches `usersApi.create/update` payload shape | `Users.tsx` (`formData` state, API mutation calls) |

**Defined in `src/hooks/useUsers.ts`** (exported):

| Type | Purpose | Used By |
|---|---|---|
| 🤖 `UserSummary` | API-level user record returned by `GET /api/users` | `useUsers.ts` (data items type), `Users.tsx` (via `usersData.items`) |
| 🤖 `PagedUsers` | Paginated response wrapper with `items: UserSummary[]` and pagination metadata | `useUsers.ts` (hook state type), `Users.tsx` (pagination controls) |

### Type Relationships

```typescript
🤖 // Exported from useUsers.ts
export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdUtc: string;
}

export interface PagedUsers {
  items: UserSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Local to Users.tsx — mirrors UserSummary (no functional difference)
interface UserRow {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdUtc: string;
}

// Form state — subset used for API mutations
interface UserFormData {
  email: string;
  fullName: string;
  isActive: boolean;
}
```

> 🤖 `UserRow` and `UserSummary` are structurally identical. VERIFY: consolidation opportunity — `UserRow` could be replaced with `UserSummary` directly.

---

<!-- akr:section id="component_behavior" required=true order=7 authorship="human" -->
## Component Behavior

### User Interactions (Module Level)

| User Action | Primary Component Response | Affected Components | Side Effects |
|---|---|---|---|
| Click "+ Add User" button | `handleAddUser()` → `showModal=true`, `editingUserId=null`, form reset | Modal overlay displayed with blank form | No API call yet |
| Click "Edit" button in row | `handleEditUser(id)` → pre-fills `formData` from row, `showModal=true` | Modal overlay with pre-filled email, fullName, isActive | No API call yet |
| Click "Delete" button in row | `handleDeleteUser(id)` → `window.confirm` dialog | Browser-native confirm dialog | On confirm: `DELETE /api/users/{id}` → `refetch()` |
| Form submit (Add mode) | HTML5 validation, then `usersApi.create(formData)` | `formLoading=true`; inputs disabled | `POST /api/users` → `refetch()` → `handleCloseModal()` |
| Form submit (Edit mode) | `usersApi.update(editingUserId, formData)` | `formLoading=true`; inputs disabled | `PUT /api/users/{id}` → `refetch()` → `handleCloseModal()` |
| Click "Cancel" in modal | `handleCloseModal()` → `showModal=false`, form/state reset | Modal unmounts | No API call |
| Click "Previous" pagination | `setPage(p => Math.max(1, p - 1))` | Table reloads with new page | `GET /api/users?page=N-1` |
| Click "Next" pagination | `setPage(p => Math.min(totalPages, p + 1))` | Table reloads with new page | `GET /api/users?page=N+1` |

---

<!-- akr:section id="data_flow" required=true order=8 authorship="ai" -->
## Data Flow

### Props → State → Render

```
Route Mount (/users)
    ↓
Users() — page=1, pageSize=10 (initial state)
    ↓
useUsers(page=1, pageSize=10) fires useEffect
    ↓
maybeMock() → GET /api/users?page=1&pageSize=10
    ↓
Response: PagedUsers { items: UserSummary[], totalCount, totalPages }
    ↓
usersData state set in hook
    ↓
data derived via useMemo([usersData]) → UserRow[]
    ↓
columns derived via useMemo([data]) → Column<UserRow>[]
    ↓
Table<UserRow> renders rows; StatusBadge per row for isActive
    ↓
[totalPages > 1] → pagination row rendered (Previous/Next buttons)
```

### API Data Flow — CRUD

```
"+ Add User" click
    ↓ showModal=true, editingUserId=null, formData reset

"Edit" click
    ↓ showModal=true, editingUserId=id, formData pre-filled

Form submit
    ↓
    ├─ [editingUserId=null] usersApi.create(formData) → POST /api/users
    └─ [editingUserId=id]   usersApi.update(id, formData) → PUT /api/users/{id}
    ↓
On success: refetch() → useUsers effect re-runs → table updated
    ↓
handleCloseModal() → showModal=false, formData+error reset

"Delete" click
    ↓
window.confirm("Are you sure...")
    ↓
[confirmed] usersApi.delete(id) → DELETE /api/users/{id}
    ↓
On success: refetch() → table updated
On failure: window.alert(error message)
```

---

<!-- akr:section id="visual_states" required=true order=9 authorship="human" -->
## Visual States

### Module Loading State

```
Route Mount
    ↓
Users renders Layout + Card with "Loading users..." text
    ↓
useUsers loading=true (API call in flight)
    ↓
Response received → loading=false
    ↓
Table<UserRow> replaces loading text with user rows
```

### Module States

| State | Description | Visual Appearance | Interaction |
|---|---|---|---|
| **Loading** | `loading=true` from `useUsers` | "Loading users..." text inside `Card` (no skeleton screen) | Table not displayed; Add User button visible |
| **Success** | `loading=false`, `error=null`, data present | Table with rows; `StatusBadge` per row; pagination if `totalPages > 1` | Full interaction: Add, Edit, Delete, paginate |
| **Error** | `error !== null` from `useUsers` | Layout renders with red `<p>` error text inside `Card` | No retry button — page reload required |
| **Empty** | Successful response, `items = []` | Table shows "No data" (`Table` `emptyMessage` default) | Add User button still available |
| **Modal — Create** | `showModal=true`, `editingUserId=null` | Fixed overlay; h2: "Add New User"; blank form fields | All form fields editable; Cancel/Create buttons |
| **Modal — Edit** | `showModal=true`, `editingUserId` set | Fixed overlay; h2: "Edit User"; pre-filled fields | All form fields editable; Cancel/Update buttons |
| **Form Submitting** | `formLoading=true` | Submit button shows "Saving..."; all inputs `disabled` | Non-interactive during submit |
| **Form Error** | `formError !== null` | Red banner inside modal with API error message | User can correct fields and resubmit |

---

<!-- akr:section id="component_architecture" required=true order=10 authorship="mixed" human_columns="consumer_impact" -->
## Component Architecture

### Module Composition

🤖 The `Users` page is the root container for this module. It owns all state management and API interaction, delegates data fetching to `useUsers`, and delegates all visual rendering to shared presentational components (`Layout`, `Card`, `Table`, `StatusBadge`, `Button`). The create/edit modal is implemented as inline JSX within `Users.tsx` rather than a standalone reusable `Modal` component.

**Component Interaction Pattern:**
- 🤖 `Users` fetches data via `useUsers` and derives `UserRow[]` and `Column[]` via `useMemo`
- 🤖 `Table<UserRow>` is purely presentational — it receives columns and data, renders nothing except what is passed
- 🤖 `StatusBadge` and `Button` are embedded as cell renderers inside the `columns` accessor closures in `Users`
- 🤖 All mutation side effects (create, update, delete) are handled in `Users` handlers; successful mutations trigger `refetch()`
- 🤖 `Layout` is a sibling composition wrapper — it has its own `useAuth` dependency independent of `Users` state

### Dependencies

🤖 **External dependencies:**
- `react` — `useMemo`, `useState` for state management
- `react-router-dom` — route rendering; `NavLink`, `useNavigate` via `Layout`
- `axios` — HTTP client via `apiClient.ts`

🤖 **Internal dependencies:**
- `useUsers` — paginated user data fetching hook
- `usersApi` (`src/services/apiClient.ts`) — user CRUD API methods (`create`, `update`, `delete`)
- `Layout` — application shell (shared with all pages)
- `Table<UserRow>` — generic table component
- `StatusBadge` — active/inactive visual indicator
- `Card` — content container with section semantics
- `Button` — interactive action button

🤖 **APIs and services:**
- `GET /api/users?page=N&pageSize=M` — paginated user list (via `useUsers`)
- `POST /api/users` — create new user (via `usersApi.create`)
- `PUT /api/users/{id}` — update user (via `usersApi.update`)
- `DELETE /api/users/{id}` — delete user (via `usersApi.delete`)

### Module Consumers

Consumer impact — verify with routing configuration:
- 🤖 `src/pages/App.tsx` — expected to define `<Route path="/users" element={<Users />} />` (VERIFY)
- Is this route protected by a role guard? The `Layout` sidebar hides the Admin nav link for non-Admin users, but the Users nav link appears unconditionally for all authenticated users.

---

<!-- akr:section id="accessibility" required=true order=11 authorship="human" -->
## Accessibility

### WCAG Compliance

**WCAG Level:** Not specified — unverified  
**Keyboard navigable:** Partially — native `<button>` elements are keyboard-accessible; modal lacks focus trap and `Escape` key handler  
**Screen reader compatible:** Partial — `StatusBadge` uses `role="status"` and `aria-label`; Edit/Delete buttons have per-row `aria-label`; `Card` uses `aria-label` via `title`; `Button` sets `aria-busy` during loading  
**Color contrast:** Not verified — dependent on CSS module class values not inspected  
**Focus indicators:** Not verified from source inspection

### Module Keyboard Navigation

| Key | Action |
|---|---|
| `Tab` | Move focus through: "+ Add User" button → table action buttons (Edit, Delete per row) → pagination buttons |
| `Shift+Tab` | Move focus to previous interactive element |
| `Enter` / `Space` | Activate focused button |
| `Escape` | No `Escape` key handler on modal — focus and close behavior on `Escape` is NOT implemented. VERIFY. |
| `Tab` (in modal) | Navigate through: Email input → Full Name input → Active checkbox → Cancel button → Submit button |

### Screen Reader Behavior

**Module announces (inferred):**
```
"Users, heading level 1"
"All Users, region" (Card with aria-label="All Users")
"System Users, table caption" (Table with caption="System Users")
"Active, status" or "Inactive, status" (StatusBadge role="status")
"Edit [fullName], button" / "Delete [fullName], button" (aria-label on row buttons)
[Modal] "Add New User, heading level 2" or "Edit User, heading level 2"
```

**Modal accessibility gaps (🤖 AI-detected; VERIFY with audit):**
- 🤖 No `role="dialog"` or `aria-modal="true"` on modal overlay `<div>` — screen readers will not announce this as a dialog
- 🤖 No focus trap — keyboard focus is not moved into the modal on open, nor returned to trigger on close
- 🤖 No `aria-labelledby` linking the `<h2>` modal title to the modal container
- 🤖 No `Escape` key close handler

These gaps represent WCAG 2.1 AA failures for modal dialogs. Confirm severity and remediation priority before production graduation.

---

<!-- akr:section id="testing" required=true order=12 authorship="human" -->
## Testing

### Test Structure

```
src/components/common/__tests__/ (existing shared component tests)
├─ Button.test.tsx       ✅ Exists
├─ StatusBadge.test.tsx  ✅ Exists
└─ Table.test.tsx        ✅ Exists

UsersPage-specific test file:
└─ No dedicated Users.test.tsx found — NEEDS creation

Recommended test structure:
Users.test.tsx
├─ Render tests
│  ├─ Renders "Loading users..." during load
│  ├─ Renders user table with mock data from useUsers
│  ├─ Renders error card when useUsers returns error
│  └─ Renders "No data" in table when items is empty
├─ Interaction tests
│  ├─ "+ Add User" opens modal with blank form
│  ├─ "Edit" opens modal pre-filled with user data
│  ├─ Form submit (create) calls usersApi.create and closes modal
│  ├─ Form submit (update) calls usersApi.update and closes modal
│  ├─ "Delete" confirms → calls usersApi.delete → refetch
│  ├─ "Cancel" closes modal without API call
│  └─ Pagination Previous/Next updates page state
└─ Accessibility tests
   ├─ Edit/Delete buttons have aria-label per row
   └─ StatusBadge has role="status"
```

### Test Coverage Goals

| Category | Target | Current | Notes |
|---|---|---|---|
| Statement coverage | 80%+ | —% | No `Users.test.tsx` exists |
| Branch coverage | 70%+ | —% | Modal state branches untested |
| Function coverage | 80%+ | —% | CRUD handlers untested |
| Line coverage | 80%+ | —% | — |

---

<!-- akr:section id="known_issues" required=true order=13 authorship="human" -->
## Known Issues

### Module Limitations

**This module does NOT:**
- Support real-time user list updates (no polling or WebSocket)
- 🤖 Implement an accessible modal dialog (`role="dialog"`, focus trap, `Escape` key close are absent)
- 🤖 Validate email uniqueness on the client before submission
- Support bulk operations (import, batch activate/deactivate, bulk delete)
- 🤖 Enforce role-based access at the component level — route-level guard not visible in this module (VERIFY in `App.tsx`)

### Known Issues

| Issue | Impact | Workaround | Tracking |
|---|---|---|---|
| Modal has no `role="dialog"`, focus trap, or `Escape` close | Screen reader and keyboard users cannot interact correctly with modal | Manual focus management | No ticket |
| Delete uses `window.confirm` (browser native) | Not styleable; may be blocked by browser policies; not testable in unit tests | None | No ticket |
| Error state after failed list load has no retry button | User must reload the entire page | Browser reload | No ticket |
| 🤖 `UserRow` duplicates `UserSummary` — identical shape | Minor maintainability overhead | N/A — no runtime impact | No ticket |

### Browser Support

| Browser | Version | Support | Known Issues |
|---|---|---|---|
| Chrome | 90+ | ✅ Full | None expected |
| Firefox | 88+ | ✅ Full | None expected |
| Safari | 14+ | ⚠️ Unknown | `window.confirm` behavior not verified on Safari |

---

<!-- akr:section id="performance_considerations" required=true order=14 authorship="human" -->
## Performance Considerations

### Module Performance

- **Initial load time**: Not benchmarked — Time to Interactive not measured
- **Re-render frequency**: 🤖 Low — `useMemo` on `data` and `columns` limits re-renders to `useUsers` data updates and local state changes
- **Memory usage**: Not measured
- **Bundle size**: Not measured (gzipped contribution of this module unknown)

### Applied Optimizations

✅ **Optimizations in place:**
- 🤖 `useMemo([usersData])` on `data` derivation — prevents `UserRow[]` re-computation on unrelated renders
- 🤖 `useMemo([data])` on `columns` — prevents column array and cell renderer recreation
- 🤖 Server-side pagination (default `pageSize=10`) — limits DOM rows in the table to a manageable count
- 🤖 `cancelled` flag in `useUsers` `useEffect` cleanup — prevents state updates after component unmount

### Performance Tips

✅ **DO:**
- Keep `pageSize` at 10 or add server-side filtering for large user directories
- Wrap `handleEditUser`, `handleDeleteUser`, and `handleSubmit` in `useCallback` if child components are memoized in a future refactor

❌ **DON'T:**
- Increase `pageSize` beyond 50 without list virtualization — all rows are rendered to DOM
- Call API methods directly inside `columns` accessor functions — all mutations must flow through handler functions

---

<!-- akr:section id="questions_gaps" required=true order=15 authorship="human" -->
## Questions & Gaps

### Unanswered Questions

- Is the `/users` route guarded by role? The sidebar renders Users links for all authenticated users, but only shows Admin link to `role === 'Admin'`. VERIFY route guard in `src/pages/App.tsx`.
- What happens when a user tries to delete their own account? No self-delete guard is present in the component.
- Should the modal implement `role="dialog"`, focus trap, and `Escape` key close for WCAG AA compliance? This is currently absent — confirm priority before production graduation.
- What is the API's error response contract for validation failures? The component only surfaces `err.response?.data?.message` — field-level errors are not rendered.
- Is there a planned replacement for `window.confirm` / `window.alert` with a styled in-app confirmation dialog?
- What `businessCapability` taxonomy key applies to this module? `UserManagement` is inferred 🤖 — NEEDS confirmation from registry.

### Documentation Gaps

- No `Users.test.tsx` exists — unit and interaction test coverage is entirely absent for this page
- Accessibility audit not completed — WCAG compliance level is unverified
- `feature` work-item tag (`FN#####_US#####`) not set — must be provided before production
- CSS modules (`Button.module.css`, `Card.module.css`, `StatusBadge.module.css`, etc.) not inspected — color contrast and visual variant details are undocumented

### Technical Debt

- Modal is inline JSX inside `Users.tsx` — a reusable `Modal` component or accessible dialog primitive (e.g., `<dialog>` element) would improve maintainability and accessibility
- `window.confirm` and `window.alert` are not unit-testable and not accessible — should be replaced with a styled in-app confirmation modal
- `UserRow` (local) duplicates `UserSummary` (exported) — consolidating to one type would remove redundancy
- `handleEditUser`, `handleDeleteUser`, and `handleSubmit` are not wrapped in `useCallback` — memoization stability of `columns` could be improved
