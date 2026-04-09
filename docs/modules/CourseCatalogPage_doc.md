---
generation-strategy: single-pass
passes-completed: single
excluded-sections: []
businessCapability: CourseManagement
feature: FN12001_US34001
layer: UI
project_type: ui-component
status: draft
compliance_mode: pilot
---

<!-- akr-generated
skill: akr-docs
mode: generate
template: reyesmelvinr-emr/core-akr-templates@master/templates/ui_component_template_module.md
charter: reyesmelvinr-emr/core-akr-templates@master/copilot-instructions/ui-component.instructions.md
steps-completed: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
generation-strategy: single-pass
passes-completed: single
pass-timings-seconds: preflight=2 | template-fetch=8 | charter-fetch=0 | source-extraction=12 | assembly=18 | write=2
total-generation-seconds: 42
-->

# UI Module: CourseCatalogPage

**Module Scope**: Multi-component domain unit  
**Components in Module**: 9  
**Primary Domain Noun**: Course  
**Complexity**: Medium  

## Screenshot Reference

[Course Catalog Page Screenshot](../../screenshots/Course.png)


<!-- akr:section id="quick_reference" required=true order=1 authorship="mixed" human_columns="accessibility,business_context" -->
## Quick Reference

| | |
|---|---|
| **What it does** | 🤖 Provides a paginated, CRUD-capable course catalog interface. Users can browse all training courses, view status and requirement badges, add new courses, edit existing ones, and delete courses via a modal form. |
| **When to use** | 🤖 This module is the primary surface for managing training course definitions — use it when a user needs to browse, create, update, or delete courses in the training system. |
| **When NOT to use** | 🤖 Do not use this module for enrollment management (see EnrollmentsPage), user management (see UsersPage), or admin-only configuration panels (see AdminPage). |
| **Accessibility** | WCAG level (AA/AAA), keyboard nav, and screen-reader compliance not yet confirmed. Modal lacks `role="dialog"` and focus trapping. NEEDS team audit. |
| **Status** | 🤖 Stable — component is fully wired to the API with a mock fallback for local development. |

**Example usage**:
```tsx
🤖 // Route-level entry — CourseCatalog is mounted via React Router at /courses
import { CourseCatalog } from '@/pages/CourseCatalog';

<CourseCatalog />
```

---

<!-- akr:section id="module_files" required=true order=2 authorship="ai" -->
## Module Files

| File | Type | Role | Primary Responsibilities |
|------|------|------|--------------------------|
| 🤖 `src/pages/CourseCatalog.tsx` | Page / Container | Primary | 🤖 Owns all course CRUD state, form modal lifecycle, pagination cursor, and column definitions. Composes all child components. |
| 🤖 `src/hooks/useCourses.ts` | Custom Hook | Data / State | 🤖 Fetches paginated courses from `/api/courses`. Supports mock fallback via `maybeMock`. Exposes a `refetch` trigger. |
| 🤖 `src/services/apiClient.ts` | HTTP Service | Supporting | 🤖 Axios-based API client for courses and users. Attaches `X-Correlation-Id` header on every request. Exposes `coursesApi` CRUD methods. |
| 🤖 `src/mocks/courses.ts` | Mock / Fixture | Supporting | 🤖 Provides `pagedCoursesMock` and `emptyCoursesMock` for local development and testing without a live API. |
| 🤖 `src/components/common/Layout.tsx` | Container | Supporting | 🤖 Application shell with sidebar navigation (React Router NavLinks), user info display, and logout. Wraps all page content. |
| 🤖 `src/components/common/Table.tsx` | Presentational | Supporting | 🤖 Generic, type-safe table with configurable column descriptors and accessor functions. Renders the course list. |
| 🤖 `src/components/common/StatusBadge.tsx` | Presentational | Supporting | 🤖 Renders a colored `<span role="status">` for Active/Inactive and Required/Optional course indicators. |
| 🤖 `src/components/common/Card.tsx` | Presentational | Supporting | 🤖 Sectioned `<section aria-label>` wrapper used for KPI summary cards and the course table container. |
| 🤖 `src/components/common/Button.tsx` | Presentational | Supporting | 🤖 Accessible button with `primary`, `secondary`, and `danger` variants. Supports a `loading` state with `aria-busy`. |

**Module Grouping Principle:**  
All components in this module serve the Course domain noun — browsing, managing, and displaying training course definitions. The common components (Layout, Table, StatusBadge, Card, Button) are shared across feature modules; their behavioral contracts within this module context are documented here.

---

<!-- akr:section id="purpose_context" required=true order=3 authorship="mixed" human_columns="business_context" -->
## Purpose & Context

### What This Module Does

🤖 The CourseCatalogPage module provides the complete training course management surface in the TrainingTracker application. It fetches a paginated list of courses from a REST API, renders them in a tabular format with status badges, and supports inline CRUD operations (add, edit, delete) via an overlay form modal. It fits into the application as the primary landing point for course administrators and learners browsing available training offerings.

Business context for this proof-of-concept:
- This module centralizes course lifecycle management in one operational UI.
- It supports compliance readiness by maintaining active and required training definitions.
- It maps to pilot stories for catalog visibility and course CRUD.

---

### When to Use This Module

🤖 **Use this module when:**
- Displaying the full catalog of available training courses with status and requirement information
- Allowing administrators to add new courses or modify existing course metadata (title, category, validity, description)
- Removing outdated or inactive course definitions from the catalog
- Browsing a paginated course list with server-side pagination at a configurable page size

Deployment context for this proof-of-concept: HR operations and training coordinators use this page to add onboarding courses, update validity windows, and retire obsolete courses.

---

### When NOT to Use This Module

🤖 **Don't use this module when:**
- Managing user enrollments in specific courses → Use `EnrollmentsPage`
- Viewing user training completion history → Use `DashboardPage`
- Performing admin-only platform system configuration → Use `AdminPage`
- Managing user accounts → Use `UsersPage`

---

<!-- akr:section id="module_files_detail" required=true order=4 authorship="ai" -->
## Module Files Detail

### Component Hierarchy

```
CourseCatalog (Page/Container) [src/pages/CourseCatalog.tsx]
├── Layout (Container) [common/Layout.tsx]
│   ├── sidebar: NavLink × 4–5 (React Router, role-gated Admin link)
│   └── children slot ↓
└── <div> Page Body
    ├── <header row>: h1 + Button["+ Add Course"]
    ├── <KPI row>: Card × 3
    │   ├── Card: Total Courses (coursesData.totalCount)
    │   ├── Card: Required Courses (filtered count)
    │   └── Card: Optional Courses (filtered count)
    ├── Card title="Available Courses"
    │   ├── loading  → <p>Loading courses...</p>
    │   ├── empty    → <p>No courses available...</p>
    │   └── success  →
    │       ├── Table<CourseRow>
    │       │   └── columns: title | category | validity |
    │       │       status (StatusBadge) | required (StatusBadge) |
    │       │       actions (Button[Edit] + Button[Delete])
    │       └── Pagination row: Button[Previous] + span + Button[Next]
    └── Modal overlay (conditional: showModal === true)
        └── <form> Course Form
            ├── input: title (required)
            ├── input: category (optional)
            ├── input[number]: validityMonths (optional)
            ├── textarea: description (optional)
            ├── checkbox: isRequired
            ├── checkbox: isActive
            └── Button[Cancel] + Button[Create | Update]
```

Hooks attached at page level:
- `useCourses({ page, pageSize })` — data, loading, error, refetch

---

### CourseCatalog.tsx — Type: Page / Container

**Responsibility**: 🤖 Owns all page-level state for the course catalog — pagination cursor, modal open/close gate, edit target ID, form data, form submission state, and error display. Transforms raw API response items into typed table row data via `useMemo`.  
**Dependencies**: 🤖 `useCourses`, `coursesApi` (apiClient), `Layout`, `Table`, `StatusBadge`, `Card`, `Button`  
**Consumers**: 🤖 Mounted by React Router at the `/courses` route (inferred from `NavLink to="/courses"` in Layout sidebar).

**Key Props**: None — this is a page component. All data flows from hooks.

**Exported Functions**:

| Function | Signature | Purpose |
|---|---|---|
| 🤖 `CourseCatalog` | `() => JSX.Element` | Page root — renders the full course catalog UI |
| 🤖 `handleEditCourse` | `(courseId: string) => void` | Loads course data into form and opens edit modal |
| 🤖 `handleAddCourse` | `() => void` | Resets form to defaults and opens create modal |
| 🤖 `handleDeleteCourse` | `(courseId: string) => Promise<void>` | Shows native confirm dialog; on confirm calls `coursesApi.delete`, then `refetch()` |
| 🤖 `handleCloseModal` | `() => void` | Resets all form state and closes modal |
| 🤖 `handleSubmit` | `(e: React.FormEvent) => Promise<void>` | Dispatches create or update API call based on whether `editingCourseId` is set |
| 🤖 `handleEnrollCourse` | `(courseId: string) => void` | Stub — logs to console only. NEEDS implementation. |

---

### Layout.tsx — Type: Container

**Responsibility**: 🤖 Provides the application shell with a fixed sidebar navigation and a content area where page children are rendered.  
**Dependencies**: 🤖 `useAuth` (AuthContext), `NavLink`, `useNavigate` (react-router-dom)  
**Consumers**: 🤖 All page components — `CourseCatalog`, Dashboard, Users, Enrollments, AdminPanel.

**Key Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| 🤖 `children` | `React.ReactNode` | Yes | Page content to render inside the layout content area |

---

### Table.tsx — Type: Presentational (Generic)

**Responsibility**: 🤖 Renders a semantically correct `<table>` from a generic column definition array and a data array. Handles empty state with a configurable message and supports a visible `<caption>`.  
**Dependencies**: 🤖 None — pure presentational.  
**Consumers**: 🤖 `CourseCatalog` (course list), and other page modules.

**Key Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| 🤖 `columns` | `Column<T>[]` | Yes | Array of column descriptors: `{ id, header, accessor }` |
| 🤖 `data` | `T[]` | Yes | Array of row data items (generic) |
| 🤖 `emptyMessage` | `string` | No (default: `'No data'`) | Text shown in full-width cell when data array is empty |
| 🤖 `caption` | `string` | No | Visible table caption rendered above the header row |

---

### StatusBadge.tsx — Type: Presentational

**Responsibility**: 🤖 Renders accessible colored status indicators for course state (Active/Inactive) and requirement level (Required/Optional). Uses `role="status"` for screen reader compatibility.  
**Dependencies**: 🤖 None — pure presentational.  
**Consumers**: 🤖 `CourseCatalog` (status and required columns), and other page modules.

**Key Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| 🤖 `tone` | `'success' \| 'warning' \| 'danger' \| 'info'` | Yes | Visual color family — maps to a CSS module class |
| 🤖 `children` | `React.ReactNode` | Yes | Badge label text |
| 🤖 `ariaLabel` | `string` | No | Override for aria-label; defaults to `String(children)` |

---

### Card.tsx — Type: Presentational

**Responsibility**: 🤖 Provides a `<section>` wrapper with an optional `<header>` (title) and `<footer>` slots. Used for KPI summary stat blocks and the course table container.  
**Key Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| 🤖 `title` | `string` | No | Renders as `<header>` text; also sets `aria-label` on the enclosing `<section>` |
| 🤖 `footer` | `React.ReactNode` | No | Optional footer slot below the content |
| 🤖 `children` | `React.ReactNode` | Yes | Main card body content |

---

### Button.tsx — Type: Presentational

**Responsibility**: 🤖 Accessible button with `primary`, `secondary`, and `danger` visual variants. Manages a loading state via `aria-busy` and a visible spinner element.  
**Key Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| 🤖 `variant` | `'primary' \| 'secondary' \| 'danger'` | No (default: `'primary'`) | Visual style variant |
| 🤖 `loading` | `boolean` | No (default: `false`) | Shows spinner, sets `aria-busy`, and also disables the button |
| 🤖 `disabled` | `boolean` | No | Native disabled attribute; combined with `loading` |
| 🤖 all `HTMLButtonAttributes` | — | No | Passed through to the underlying `<button>` element |

---

### apiClient.ts — Type: HTTP Service

**Responsibility**: 🤖 Configures a dedicated Axios instance for direct API calls (bypassing the hook's mock-toggle path). Used for write operations (create, update, delete) where mock fallback is not applied.  
**Key exports**:

| Export | Purpose |
|--------|---------|
| 🤖 `coursesApi.getAll(page, pageSize)` | GET `/api/courses` — paginated list |
| 🤖 `coursesApi.getById(id)` | GET `/api/courses/:id` — single course |
| 🤖 `coursesApi.create(payload)` | POST `/api/courses` — create course |
| 🤖 `coursesApi.update(id, payload)` | PUT `/api/courses/:id` — update course |
| 🤖 `coursesApi.delete(id)` | DELETE `/api/courses/:id` — delete course |
| 🤖 `usersApi` | CRUD for `/api/users` — used by UsersPage, not this module |

**Note**: 🤖 `apiClient.ts` uses its own Axios instance (with `X-Correlation-Id` interceptor) separate from `api.ts` (which uses `Authorization: Bearer` JWT). Write operations in `CourseCatalog` go through `apiClient.ts`, while reads go through `api.ts` (via `useCourses`). VERIFY whether both instances need auth headers for production use.

---

### mocks/courses.ts — Type: Mock / Fixture

**Responsibility**: 🤖 Provides static in-memory data for local development (when `VITE_USE_API_MOCKS=true`) and unit tests.

| Export | Return | Purpose |
|--------|--------|---------|
| 🤖 `pagedCoursesMock(page, pageSize)` | `PagedCourses` | Returns 2 mock courses with realistic field shapes |
| 🤖 `emptyCoursesMock` | `PagedCourses` | Empty items array — used to test the empty-state render path |

---

<!-- akr:section id="hook_dependency" required=true order=5 authorship="ai" -->
## Hook Dependency

### Custom Hooks in This Module

| Hook | File | Purpose | Used By |
|------|------|---------|---------|
| 🤖 `useCourses` | `src/hooks/useCourses.ts` | Fetches paginated course list from API or mock; exposes `data`, `loading`, `error`, `refetch` | `CourseCatalog` |

---

### Hook Call Chain

```
CourseCatalog (Page)
├─ useCourses({ page, pageSize })
│  ├─ Manages state: data (PagedCourses | null), loading (bool), error (string | null)
│  ├─ Internal trigger: refetchTrigger (int) — incremented by refetch()
│  ├─ Calls: maybeMock(pagedCoursesMock(page, pageSize), async () =>
│  │    api.get<PagedCourses>('/api/courses', { params: { page, pageSize } }))
│  └─ Cancellation: isCancelled flag — guards setState after unmount or dep change
│
└─ Component-level state (CourseCatalog)
   ├─ page: number              — pagination cursor (initial: 1)
   ├─ showModal: bool           — modal open/close gate
   ├─ editingCourseId: string | null — null = create mode; string = edit mode
   ├─ formData: CourseFormData  — all controlled form fields
   ├─ formError: string | null  — API error message displayed in modal
   └─ formLoading: bool         — disables form and shows "Saving..." during submit

Layout (inner)
└─ useAuth() — reads AuthContext (user.email, user.role) and logout function
```

---

### Hook Dependencies and Re-render Sensitivity

| Hook / Memo | Re-renders when | Memoization |
|-------------|-----------------|-------------|
| 🤖 `useCourses` | `page`, `pageSize`, `enabled`, or `refetchTrigger` change | None — full re-fetch per change |
| 🤖 `data` memo (rows) | `coursesData` reference changes | `useMemo([coursesData])` — transforms items to `CourseRow[]` |
| 🤖 `columns` memo | `data` reference changes | `useMemo([data])` — column accessor closures rebind on data change |

---

<!-- akr:section id="type_definitions" required=true order=6 authorship="ai" -->
## Type Definitions

### Module-Specific Types

| Type | File | Exported | Purpose | Used By |
|------|------|----------|---------|---------|
| 🤖 `CourseRow` | `CourseCatalog.tsx` | No (local) | Table row shape — extends field set beyond `CourseSummary` with optional fields | `CourseCatalog` (useMemo transform, column accessors) |
| 🤖 `CourseFormData` | `CourseCatalog.tsx` | No (local) | Controlled form state — all string-typed for `<input>` binding; parsed to int/null on submit | `CourseCatalog` (formData state) |
| 🤖 `CourseSummary` | `hooks/useCourses.ts` | Yes | API item shape as declared in the hook contract | `useCourses`, `mocks/courses.ts` |
| 🤖 `PagedCourses` | `hooks/useCourses.ts` | Yes | Paginated API response envelope | `useCourses`, `mocks/courses.ts`, `CourseCatalog` (coursesData) |
| 🤖 `UseCoursesOptions` | `hooks/useCourses.ts` | No (local) | Hook input options: `page`, `pageSize`, `enabled` | `useCourses` |
| 🤖 `BadgeTone` | `StatusBadge.tsx` | Yes | `'success' \| 'warning' \| 'danger' \| 'info'` | `StatusBadge`, `CourseCatalog` (column accessors) |
| 🤖 `StatusBadgeProps` | `StatusBadge.tsx` | Yes | Props interface for `StatusBadge` | `StatusBadge` |
| 🤖 `ButtonVariant` | `Button.tsx` | Yes | `'primary' \| 'secondary' \| 'danger'` | `Button`, `CourseCatalog` |
| 🤖 `ButtonProps` | `Button.tsx` | Yes | Extends `React.ButtonHTMLAttributes<HTMLButtonElement>` | `Button` |
| 🤖 `Column<T>` | `Table.tsx` | Yes | Column descriptor: `{ id: string; header: string; accessor: (row: T) => ReactNode }` | `Table`, `CourseCatalog` (columns memo) |
| 🤖 `TableProps<T>` | `Table.tsx` | Yes | Props interface for `Table` component | `Table` |
| 🤖 `CardProps` | `Card.tsx` | Yes | Props interface for `Card` component | `Card` |

---

### Type Relationships

```typescript
🤖 // Core data shapes flowing through this module

// API contract (from useCourses.ts) — note: missing optional fields used by CourseRow
export interface CourseSummary {
  id: string;
  title: string;
  isRequired: boolean;
  isActive: boolean;
}

export interface PagedCourses {
  items: CourseSummary[];  // ← items contain optional fields at runtime
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Local (CourseCatalog.tsx) — extends runtime shape of API items
interface CourseRow {
  id: string;
  title: string;
  category?: string;         // present in API response, absent from CourseSummary
  validityMonths?: number;   // present in API response, absent from CourseSummary
  description?: string;      // present in API response, absent from CourseSummary
  isRequired: boolean;
  isActive: boolean;
}

// Form state (all inputs bound as strings; converted on submit)
interface CourseFormData {
  title: string;
  category: string;
  validityMonths: string;    // parsed to int | null on submit
  description: string;
  isRequired: boolean;
  isActive: boolean;
}
```

**Type gap**: 🤖 `CourseSummary` does not declare `category`, `validityMonths`, or `description`. `CourseRow` handles these as optional extensions. The useMemo transform in `CourseCatalog` directly assigns `coursesData.items` to `CourseRow[]` — this works at runtime but is a TypeScript type coverage gap. VERIFY whether `CourseSummary` should be updated to declare these fields.

---

<!-- akr:section id="component_behavior" required=true order=7 authorship="human" -->
## Component Behavior

### User Interactions (Module Level)

| User Action | Primary Component Response | Affected Components | Side Effects |
|-------------|---------------------------|---------------------|--------------|
| Click "+ Add Course" | 🤖 `handleAddCourse` — resets form, sets `editingCourseId = null`, `showModal = true` | Modal overlay renders | 🤖 No server call |
| Click "Edit" on a row | 🤖 `handleEditCourse(courseId)` — finds course in `data`, populates `formData`, sets `editingCourseId`, `showModal = true` | Modal overlay renders with pre-filled form | 🤖 No server call |
| Click "Delete" on a row | 🤖 `handleDeleteCourse(courseId)` — shows native `confirm()` dialog; on confirm calls `coursesApi.delete(id)`, then `refetch()` | Table re-renders after refetch | 🤖 Hard delete on server; error surfaced via `alert()` on failure |
| Submit form — Create mode | 🤖 `handleSubmit` calls `coursesApi.create(payload)`, then `refetch()`, then `handleCloseModal()` | Table re-renders; modal closes | 🤖 New course created on server |
| Submit form — Edit mode | 🤖 `handleSubmit` calls `coursesApi.update(editingCourseId, payload)`, then `refetch()`, then `handleCloseModal()` | Table re-renders; modal closes | 🤖 Existing course updated on server |
| Click "Cancel" in modal | 🤖 `handleCloseModal` — resets `formData`, `formError`, `editingCourseId`; `showModal = false` | Modal unmounts | 🤖 No server call |
| Click "Previous" / "Next" pagination | 🤖 `setPage(p => p ± 1)` — triggers `useCourses` re-fetch | Table re-renders with new page data | 🤖 `GET /api/courses?page=N` |
| Keyboard navigation | Relies on browser-native behavior for `<button>` and `<input>` elements — no explicit keyboard management at page level | All button elements keyboard-reachable | Modal: Escape-to-close not implemented |

---

<!-- akr:section id="data_flow" required=true order=8 authorship="ai" -->
## Data Flow

### Props → State → Render (Module Level)

```
React Router mounts CourseCatalog at /courses
    ↓
CourseCatalog renders (no external props)
    ↓
useCourses({ page=1, pageSize=10 }) fires on mount
    ↓
maybeMock → VITE_USE_API_MOCKS=true  → pagedCoursesMock (300ms delay)
                                =false → api.get('/api/courses?page=1&pageSize=10')
    ↓
On success → setData(PagedCourses)
    ↓
useMemo [coursesData] → data: CourseRow[] (transforms items)
    ↓
Table<CourseRow> receives columns + data → renders rows
    │
    ├── column "status"   → StatusBadge tone="success|danger">{isActive label}
    ├── column "required" → StatusBadge tone="warning|info">{isRequired label}
    └── column "actions"  → Button[Edit] + Button[Delete]
    ↓
KPI Cards show totalCount | filtered required count | filtered optional count
    ↓
Pagination row visible when coursesData.totalPages > 1
```

### CRUD Side-Effect Flow

```
User action (Add / Edit / Delete)
    ↓
CourseCatalog handler invoked
    ↓
coursesApi.create | .update | .delete (apiClient.ts axios instance)
    ↓
axios.post/put/delete → VITE_API_BASE_URL/api/courses[/:id]
    ↓
On success → refetch() → increments refetchTrigger
    ↓
useCourses useEffect re-fires → fresh GET /api/courses
    ↓
setData(new PagedCourses) → Table re-renders
```

---

<!-- akr:section id="visual_states" required=true order=9 authorship="human" -->
## Visual States

### Module Loading State

```
Mount / page change / refetch trigger
    ↓
useCourses: loading = true
    ↓
Inside Card "Available Courses": <p>Loading courses...</p>
    ↓
KPI cards still render (show 0 or stale counts)
    ↓
Data arrives: loading = false → Table renders rows
```

### Module States

| State | Description | Visual Appearance | Interaction |
|-------|-------------|-------------------|-------------|
| **Loading** | `useCourses` loading = true | 🤖 "Loading courses..." text inside the courses Card | Page header and "+ Add Course" button are rendered and accessible during load |
| **Success** | Data loaded, items present | 🤖 KPI row + Table with course rows + Pagination (if totalPages > 1) | 🤖 All CRUD actions available |
| **Error** | API error or fetch failure | 🤖 Full Layout renders; courses area replaced with a Card containing red error text: "Error loading courses: {error}" | No retry button — user must navigate away or reload |
| **Empty** | 200 OK, `items = []` | 🤖 KPI cards show 0; Table area shows: "No courses available. Add your first course to get started." | 🤖 "+ Add Course" button active |
| **Modal — Create** | `showModal=true`, `editingCourseId=null` | 🤖 Fixed overlay; form with blank fields; heading: "Add New Course" | 🤖 All form fields editable; Cancel + Create buttons active |
| **Modal — Edit** | `showModal=true`, `editingCourseId=string` | 🤖 Fixed overlay; form pre-filled from `formData`; heading: "Edit Course" | 🤖 All form fields editable; Cancel + Update buttons active |
| **Form Submitting** | `formLoading = true` | 🤖 All inputs and buttons disabled; submit button text: "Saving..." | 🤖 Prevents double-submit |
| **Form Error** | `formError` set after submission | 🤖 Red error banner (`background: #fee2e2`) above form fields inside modal | 🤖 User can correct fields and resubmit |

---

<!-- akr:section id="component_architecture" required=true order=10 authorship="mixed" human_columns="consumer_impact" -->
## Component Architecture

### Module Composition

🤖 The `CourseCatalog` page is the single container that owns all state and orchestrates all child components. There is no nested sub-container — all business logic lives at the page level. `Layout` provides the application chrome (sidebar). `Card` frames content regions. `Table` renders course rows. `StatusBadge` decorates table cells. `Button` drives all user-initiated actions.

**Component Interaction Pattern:**
- `CourseCatalog` owns all state (pagination, modal lifecycle, form fields, submission state)
- `useCourses` is the single read pathway — data, loading, error
- `coursesApi` is the write pathway — called directly for create, update, delete; triggers `refetch()` on success
- All visual children receive data and callbacks via column accessor closures or direct JSX props
- No cross-component event bubbling beyond React synthetic events

### Dependencies

🤖 _Auto-detected from imports:_

**External packages**:
- 🤖 `react` (`React`, `useState`, `useMemo`) — local state and memoization
- 🤖 `react-router-dom` (`NavLink`, `useNavigate`) — navigation inside Layout
- 🤖 `axios` — HTTP client (via `apiClient.ts` and `api.ts`)

**Internal dependencies**:
- 🤖 `useCourses` — paginated course data hook
- 🤖 `coursesApi` (apiClient.ts) — CRUD write operations
- 🤖 `Layout` — application chrome wrapper
- 🤖 `Table<CourseRow>` — course list rendering
- 🤖 `StatusBadge` — inline Active / Required visual indicators
- 🤖 `Card` — content framing (KPI cards + table container)
- 🤖 `Button` — all interactive triggers

**APIs consumed**:
- 🤖 `GET /api/courses?page=N&pageSize=N` — list courses (via `useCourses` → `api.ts`)
- 🤖 `POST /api/courses` — create course (via `coursesApi.create`)
- 🤖 `PUT /api/courses/:id` — update course (via `coursesApi.update`)
- 🤖 `DELETE /api/courses/:id` — delete course (via `coursesApi.delete`)

### Module Consumers

🤖 This module is consumed by:
- 🤖 React Router route config at `/courses` (inferred from `NavLink to="/courses"` in `Layout.tsx`)

Confirm exact route registration location — expected in `src/pages/App.tsx` or a router configuration file. VERIFY route path and any route guard (authentication check) applied before mounting.

---

<!-- akr:section id="accessibility" required=true order=11 authorship="human" -->
## Accessibility

### WCAG Compliance

- **WCAG Level**: AA / AAA — NEEDS team confirmation
- **Keyboard navigable**: Partially confirmed — all `<Button>` elements render native `<button>` (keyboard-reachable by default). Modal has no explicit focus trap or `Escape`-to-close.
- **Screen reader compatible**: Partially — `StatusBadge` uses `role="status"`, `Card` uses `<section aria-label>`, `Button` uses `aria-busy`. Full traversal not tested.
- **Color contrast**: NEEDS audit of CSS module color values for all badge tones and button variants
- **Focus indicators**: NEEDS verification of CSS `:focus` / `:focus-visible` styles across all components

### Module Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | 🤖 Move focus through sidebar links → page buttons (Add Course, Edit, Delete) → pagination buttons |
| `Shift+Tab` | 🤖 Reverse focus traversal |
| `Enter` | 🤖 Activate focused button; submit form when focus is on the submit button |
| `Space` | 🤖 Toggle `isRequired` and `isActive` checkboxes in the modal form |
| `Escape` | Modal does NOT close on Escape — no `keydown` handler implemented. NEEDS implementation to meet WCAG 2.1 §3.2.5. |
| `Arrow Up/Down` | No custom navigation within table rows — relies on browser tab order only |

### Screen Reader Behavior

🤖 **Module announces (inferred from component structure)**:
```
"Course Catalog, heading level 1"
"All Available Courses, caption" (Table caption prop)
"Active, status" (StatusBadge role=status, aria-label=children text)
"Required, status"
"Edit [Course Title], button" (aria-label on Edit Button)
"Delete [Course Title], button" (aria-label on Delete Button)
"Training Tracker, heading level 2" (Layout sidebar logo)
"[user.email]" / "[user.role]" (Layout sidebar user info divs)
```

**Known a11y gaps**:
- Modal overlay has no `role="dialog"`, `aria-modal="true"`, or `aria-labelledby` — screen readers will not identify it as a dialog. NEEDS implementation.
- No programmatic focus shift to modal on open, or return to trigger element on close.
- Native `confirm()` and `alert()` calls for delete confirm and error display are not accessible in all environments and disrupt screen reader flow.

---

<!-- akr:section id="testing" required=true order=12 authorship="human" -->
## Testing

### Test Structure

No test file for `CourseCatalog.tsx` exists in the workspace. Tests for common components are present (`Button.test.tsx`, `StatusBadge.test.tsx`, `Table.test.tsx`) but page-level integration and hook behavior are untested.

```
CourseCatalog.test.tsx (MISSING — NEEDS creation)
├─ Render tests
│  ├─ Shows "Loading courses..." while useCourses is loading
│  ├─ Renders course rows in table when data is available
│  └─ Shows empty-state message when items = []
├─ Interaction tests
│  ├─ Click "+ Add Course" → modal opens with blank form
│  ├─ Click "Edit" on row → modal opens with course data pre-populated
│  ├─ Click "Delete" on row → confirm dialog → coursesApi.delete called
│  ├─ Submit create form → coursesApi.create called → modal closes
│  └─ Submit edit form → coursesApi.update called → modal closes
├─ Error tests
│  ├─ API error on load → error Card rendered (not table)
│  └─ Form submit error → formError banner rendered inside modal
└─ Accessibility tests
   ├─ All Edit/Delete buttons have aria-label containing course title
   └─ Modal: focus shifts to first field on open; returns to trigger on close
```

### Test Coverage Goals

| Category | Target | Current | Notes |
|----------|--------|---------|-------|
| Statement coverage | 80%+ | Not measured | No page-level tests exist |
| Branch coverage | 70%+ | Not measured | Loading / error / empty branches untested |
| Function coverage | 80%+ | Not measured | All CRUD handlers untested |
| Line coverage | 80%+ | Not measured | |

---

<!-- akr:section id="known_issues" required=true order=13 authorship="human" -->
## Known Issues

### Module Limitations

🤖 **This module does NOT:**
- Implement enrollment from the catalog — `handleEnrollCourse` is a `console.log` stub
- Support real-time or push-based course availability updates (refresh is pull-only via explicit CRUD operations)
- Provide client-side filtering or search — all filtering is constrained to server-side pagination parameters
- Handle concurrent edit conflicts — last-write-wins via `PUT`
- Implement modal focus trapping, `role="dialog"`, or keyboard-close on `Escape`
- Use accessible notification primitives for delete confirmation or error reporting (`alert()` and `confirm()` are used instead)

### Known Issues

| Issue | Impact | Workaround | Tracking |
|-------|--------|------------|----------|
| 🤖 `handleEnrollCourse` is a `console.log` stub | Users cannot enroll directly from catalog | Navigate to Enrollments page | No ticket found |
| 🤖 Delete errors shown via native `alert()` | Not accessible; blocks UI thread; inconsistent UI | None | NEEDS tracking ticket |
| 🤖 Modal has no focus trap or keyboard-close | Tab order escapes modal; Escape does not close | Mouse navigation only | NEEDS tracking ticket |
| 🤖 `CourseSummary` type missing optional fields used in `CourseRow` | TypeScript type coverage gap; runtime cast | Local `CourseRow` interface bridges the gap | NEEDS tracking ticket |
| 🤖 Two separate Axios instances for reads vs. writes | Inconsistent auth header application (no JWT on CRUD writes via apiClient.ts) | May work if API does not require auth on mutation endpoints | VERIFY auth requirements |

### Browser Support

| Browser | Version | Support | Known Issues |
|---------|---------|---------|--------------|
| Chrome | 90+ | Assumed full | None observed |
| Firefox | 88+ | Assumed full | None observed |
| Safari | 14+ | Not tested | NEEDS testing |

---

<!-- akr:section id="performance_considerations" required=true order=14 authorship="human" -->
## Performance Considerations

### Module Performance

- **Initial load time**: _ms — NEEDS measurement (Time to Interactive for course table render)_
- **Re-render frequency**: 🤖 Medium — state updates on every page navigation, modal open/close, and form field change (`formData` controlled inputs trigger re-render per keystroke)
- **Memory usage**: Not measured
- **Bundle size**: Not measured — includes `axios` and `react-router-dom` as significant external dependencies

### Applied Optimizations

🤖 **Optimizations currently in place:**
- `useMemo([coursesData])` on `data` — prevents re-transformation when `coursesData` reference is stable between renders
- `useMemo([data])` on `columns` — column accessor closures memoized against data identity
- `isCancelled` flag in `useCourses` — prevents `setState` on unmounted component or stale effect
- `enabled` option in `useCourses` — supports conditional / deferred fetching for composability

🤖 **Optimizations NOT in place:**
- No `React.memo` on `Table`, `Card`, or `StatusBadge` — these may re-render unnecessarily when parent state changes (e.g., form field keystrokes)
- No `useCallback` on CRUD handlers — new function references created on every render, passed into column accessor closures

### Performance Tips

✅ **DO:**
- Use `enabled: false` in `useCourses` options to defer fetching when the page context is not yet active
- Call `refetch()` after mutations rather than managing fetch state manually

❌ **DON'T:**
- Call `coursesApi.getAll` directly for read operations — use `useCourses` to benefit from mock toggle and cancellation
- Add `formData` to column useMemo dependency arrays — column definitions do not depend on form state

---

<!-- akr:section id="questions_gaps" required=true order=15 authorship="human" -->
## Questions & Gaps

### Unanswered Questions

- Is enrollment from the catalog planned (inline or separate flow)? `handleEnrollCourse` is currently a stub.
- Should course deletion be soft-delete (set `isActive=false`) or hard-delete (`DELETE /api/courses/:id`)? Current implementation hard-deletes.
- What is the WCAG target level for this module — AA or AAA?
- Should the modal implement `role="dialog"`, `aria-modal`, and Escape-to-close? (Recommended for WCAG 2.1 §4.1.2 and §3.2.5.)
- Is `category` intended to be a free-text field or a controlled enum (select from a fixed taxonomy such as Safety, Technical, Compliance)?
- Is `pageSize=10` intentional and fixed, or should users be able to select a page size?
- Should the `coursesApi` Axios instance include the `Authorization: Bearer` JWT header for production write operations?

### Documentation Gaps

- Business context is absent — why was the Course Catalog built? What compliance, onboarding, or operational requirement does it address?
- Feature / work-item tag is missing from `modules.yaml` for this module
- No test file exists for `CourseCatalog.tsx` — integration and accessibility tests are unwritten
- Browser compatibility has not been formally tested or documented
- Route registration location not confirmed (`App.tsx` not included in this module's file list)

### Technical Debt

- `handleEnrollCourse` is a stub — NEEDS implementation or removal from the codebase
- Delete error uses native `alert()` — NEEDS replacement with an accessible toast or inline notification
- Modal lacks `role="dialog"`, `aria-modal`, focus management — NEEDS accessibility remediation
- `CourseSummary` interface is missing optional fields (`category`, `validityMonths`, `description`) present in the API response — NEEDS interface update in `useCourses.ts`
- `pageSize` is hardcoded to `10` in `CourseCatalog.tsx` — consider making it a prop default or user-configurable
- Two Axios instances (`api.ts` vs. `apiClient.ts`) with different interceptor chains — NEEDS consolidation review

---

<!-- akr:section id="version_history" required=true order=16 authorship="human" -->
## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-04-08 | akr-docs generate | Initial documentation — CourseCatalogPage baseline |
