# Training Tracker UI

Vite + React + TypeScript implementation for the Employee Training & Certification Tracker.

## Scripts
- dev: start local dev server
- build: type-check then bundle
- preview: preview production build
- lint: run ESLint
- test: run Vitest unit tests

## Environment Variables
| Name | Description | Default |
|------|-------------|---------|
| VITE_API_BASE_URL | Base URL of API | http://localhost:5005/api |
| VITE_USE_API_MOCKS | Toggle mock layer | true |

## Mocks
When `VITE_USE_API_MOCKS=true`, service helpers return static responses (expand later with fixtures) instead of calling the API.

## Auth (Current)
A stub user with role `Admin` is injected via `AuthContext`. Replace with real JWT decode logic later.

## Tech Notes
- Plain DTO responses expected from backend.
- Error shape: `{ traceId, message, details? }`.
- Correlation ID (`X-Correlation-Id`) will be surfaced later for logging.

## Progress Snapshot
- Core scaffold, routing, auth stub, and common components completed.
- Dashboard mock table rendering with sample data.
- Mocks flag present but only minimal mock logic implemented.

## Immediate Next Steps
1. Initialize git repository & commit baseline (this UI + planning docs).
2. Implement feature hooks (`useCourses`, then `useEmployeeData`).
3. Add EmailInput + `useEmailValidation` (mock) with debounce.
4. Introduce Vitest + RTL tests (Button, StatusBadge, Table render cases).
5. Add ErrorBoundary + layout shell nav improvements.
6. Integrate with real Courses endpoint once backend alpha ready; toggle mocks off selectively.
