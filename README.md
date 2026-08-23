# Operix Frontend

Modern Next.js interface for the Operix Pharmaceutical Workload and Operations Management Platform.

Operix replaces spreadsheet-driven operational tracking with a structured workflow product for Super Admins, Admins, and Members. This frontend currently contains the approved visual implementation and mock-driven screens. Backend API integration is intentionally deferred to the next development phase.

## Current Status

| Area                        | Status                                       |
| --------------------------- | -------------------------------------------- |
| Visual UI                   | Implemented and frozen for this cleanup pass |
| Routes and page composition | Implemented and frozen                       |
| Mock data                   | Active                                       |
| Backend integration         | Pending                                      |
| Auth integration            | Pending                                      |
| Formatting contract         | Prettier plus ESLint                         |

## Tech Stack

| Layer     | Technology                           | Purpose                                                      |
| --------- | ------------------------------------ | ------------------------------------------------------------ |
| Framework | Next.js                              | App Router, layouts, static and client-rendered screens      |
| Language  | TypeScript                           | Strict component and data contracts                          |
| UI        | React                                | Component-driven interface                                   |
| Styling   | CSS Modules and global CSS variables | Preserves the approved design while keeping styles colocated |
| Tooling   | ESLint, Prettier, pnpm               | Quality, formatting, and repeatable local workflow           |

## Getting Started

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The app runs at:

```text
http://localhost:3000
```

## Scripts

| Command             | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start the local Next.js development server   |
| `pnpm build`        | Create a production build                    |
| `pnpm start`        | Run the production server                    |
| `pnpm typecheck`    | Run TypeScript without emitting files        |
| `pnpm lint`         | Run ESLint                                   |
| `pnpm lint:fix`     | Apply safe ESLint fixes                      |
| `pnpm format`       | Run Prettier on allowed files                |
| `pnpm format:check` | Check formatting                             |
| `pnpm verify`       | Run typecheck, lint, format check, and build |

## Project Structure

```text
src/
├── app/          # App Router pages, layouts, and global styles
├── components/   # Layout, dashboard, report, KPI, activity, auth, and icon components
├── constants/    # Navigation, theme, copy, and CSS variable constants
├── context/      # Current auth and theme context providers
├── data/         # Mock datasets used by the current UI
├── types/        # Shared view and domain types
└── utils/        # Pure formatting helpers
```

## Import Conventions

- Use relative imports inside the same component or feature group.
- Use `@/` imports for shared or cross-feature dependencies.
- Keep CSS Module imports relative to the component file.
- Prefer `import type` for type-only imports.
- Avoid deep cross-feature relative paths such as `../../../`.

## Component Conventions

Component folders should use this shape when it is useful:

```text
ComponentName/
├── ComponentName.tsx
├── ComponentName.module.css
└── index.ts
```

Use explicit public exports from component boundaries:

```ts
export { ComponentName } from "./ComponentName";
```

Do not add barrels in every internal folder just for symmetry. A barrel should mark a real public boundary.

## Styling and Theme

- `src/app/globals.css` owns global reset, theme variables, and global primitives.
- Component styles stay colocated in `ComponentName.module.css`.
- CSS variable values are the source of visual truth.
- This cleanup must not change colors, spacing, typography, chart appearance, card dimensions, or responsive behavior.

## Mock Data

The current UI is mock-driven. Mock datasets stay under `src/data` until the backend integration phase.

Do not remove or move mock data during structure cleanup unless every consumer is safely updated and the visual output remains unchanged.

## Backend Integration Status

Backend integration is not part of this cleanup. The next phase should connect the existing UI to the Operix backend in a controlled order:

```text
Auth integration
→ role-aware shell
→ user/team/task workflows
→ dashboard and reports
→ inventory UI
```

## Frozen Page Contract

During this cleanup pass, every `src/app/**/page.tsx` file is treated as read-only.

Do not change:

- routes;
- route groups;
- page JSX composition;
- page metadata;
- approved visual hierarchy;
- `DashboardShell` usage;
- dashboard tab behavior.

Validation:

```bash
git diff --name-only -- 'src/app/**/page.tsx'
```

Expected result:

```text
no output
```

## Quality Gate

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
git diff --check
```

Manual visual smoke should cover:

```text
/
/login
/signin
/login/signin
/kpi
/reports
/activity
/history
/contacts
/documents
```

Light, dark, and system theme modes should remain visually unchanged.
