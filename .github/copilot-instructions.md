# AKR UI Component Condensed Instructions

Version: 1.0
Extends: .akr/charters/AKR_CHARTER.md
Source charter: .akr/charters/AKR_CHARTER_UI.md
Audience: Agent Skill GenerateDocumentation for ui-component modules

## Scope
Apply these rules when generating documentation for UI modules, including pages, reusable components, hooks, and UI utilities. Emphasize component contracts, state behavior, accessibility, and interaction flow.

## Required Front Matter
Every UI module document must start with YAML front matter:

```yaml
---
businessCapability: PascalCaseTagFromRegistry
feature: FN12345_US678
layer: UI
project_type: ui-component
status: draft
compliance_mode: pilot
---
```

Rules:
- businessCapability: required PascalCase taxonomy key.
- feature: required work-item format FN#####_US#####.
- layer: required (UI).
- project_type: required (ui-component unless validated otherwise).
- status: governs the generated document's maturity state, not the module grouping approval state.
	For first-generation Mode B output, set status to draft unless document-content approval has already occurred through the documented review flow.
	Do not copy modules.yaml module status directly into document front matter.
- compliance_mode: pilot or production.

## Metadata Header Requirements
Insert an AKR metadata header before body content:
- Marker: <!-- akr-generated -->
- Required fields: skill, mode, template, steps-completed, generated-at
- For section-scoped generation: generation-strategy, passes-completed, pass-timings-seconds, total-generation-seconds

## Transparency Marker Rules
Mandatory marker usage:
- 🤖 for AI-inferred behavior or UX assumptions.
- ❓ for unknown interactions, business intent, or state transitions.
- NEEDS for required but missing data.
- VERIFY for contracts that need source confirmation.
- DEFERRED only with explicit reason and owner path.

Markers must be inline and specific to the affected statement.

## Component Inventory Rules
Document all files listed in the module:
- Component/page/hook/utility file path
- Type (page, presentational component, container, hook, utility)
- Responsibility summary

Do not omit files from modules.yaml.

## Props And Contract Rules
Document component interfaces clearly:
- Props names, types, required/optional status, defaults
- Callback contracts (onX handlers)
- Render prop behavior if present
- Type dependencies/interfaces for shared types

Include guardrails:
- Boolean naming clarity (isX, hasX, canX)
- Event naming clarity (onClick/onSubmit style)

## State And Variant Rules
Document state behavior and visual variants:
- Default/empty/loading/error/disabled states
- Variant families (primary, secondary, etc.)
- Conditional rendering branches
- Derived state dependencies and transitions

If transitions are uncertain, mark with ❓.

## Component Hierarchy Diagram Rules
Provide text hierarchy of composition and ownership:
- Page or container root
- Child component tree
- Hook attachment points
- Data and callback flow direction

Do not use Mermaid. Use concise text/ASCII notation.

## Hook Dependency Graph Rules
For custom hooks and hook-heavy components, include:
- Hook list
- Dependency source (state, props, context, external)
- Side effect behavior
- Re-render sensitivity or memoization notes

Keep graph textual and concise.

## Accessibility Requirements
Include accessibility-critical details:
- Semantic structure/roles
- ARIA attributes when relevant
- Keyboard navigation expectations
- Focus management behavior
- Screen-reader visibility notes

If no explicit a11y evidence exists, mark gaps with ❓.

## Data And Side Effects Rules
Document UI-triggered reads/writes and effects:
- API calls and trigger events
- Cache/state-store updates
- Notifications/toasts/navigation side effects
- Error handling path

Coverage must include all primary user actions represented by the module.

## Questions And Gaps Rules
Capture unresolved areas:
- Ambiguous UX behavior
- Missing business rule context
- Unknown accessibility intent
- Unclear ownership of components/hooks

Each unresolved item must include ❓ plus a concrete follow-up prompt.

## Section-Scoped Generation Rules
Apply pass-based section generation discipline:
- Load only relevant charter slice for each section.
- Carry forward validated facts, not full raw context.
- Avoid full-context reload in late passes.
- Record split passes (2A/2B) in metadata if used.

## Quality Thresholds
Before completion:
- Required sections present and coherent.
- Full module file coverage achieved.
- Props/state/variants documented with explicit contracts.
- Accessibility section included with concrete observations or marked gaps.
- No silent unknowns (must be marked).

## Exclusions
Do not include:
- Change History sections.
- Verbose style-token dumps with no behavioral value.
- Backend/service internals beyond dependency references.

## Reference
Full charter for rationale and examples:
- .akr/charters/AKR_CHARTER_UI.md
