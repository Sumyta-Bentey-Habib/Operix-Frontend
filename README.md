# Operix Frontend

Modern Next.js interface for the Operix Pharmaceutical Workload and Operations Management Platform.

Operix replaces spreadsheet-driven operational tracking with a structured workflow product for
Super Admins, Admins, and Members. This frontend contains the approved visual implementation,
backend-connected authentication foundation, Admin management, and Member management. Other
business feature screens still use mock data until their integration slices are approved.

## Current Status

| Area                        | Status                                       |
| --------------------------- | -------------------------------------------- |
| Visual UI                   | Implemented and frozen for this cleanup pass |
| Routes and page composition | Implemented and frozen                       |
| Mock data                   | Active for non-management business screens   |
| Backend integration         | Auth, viewer, health, Admins, and Members    |
| Auth integration            | Connected through Better Auth cookies        |
| Formatting contract         | Prettier plus ESLint                         |

## Tech Stack

| Layer     | Technology                           | Purpose                                                      |
| --------- | ------------------------------------ | ------------------------------------------------------------ |
| Framework | Next.js                              | App Router, layouts, static and client-rendered screens      |
| Language  | TypeScript                           | Strict component and data contracts                          |
| UI        | React                                | Component-driven interface                                   |
| Styling   | CSS Modules and global CSS variables | Preserves the approved design while keeping styles colocated |
| Testing   | Vitest, jsdom, Testing Library       | Focused unit and React behavior tests                        |
| Tooling   | ESLint, Prettier, pnpm               | Quality, formatting, and repeatable local workflow           |

## Getting Started

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Create a local `.env.local` file with the backend API base URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

The value must be an absolute `http` or `https` URL and must not end with a slash. Production
builds must provide `NEXT_PUBLIC_API_BASE_URL`; the source code does not fall back to localhost.

The app runs at:

```text
http://localhost:3000
```

## Scripts

| Command             | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `pnpm dev`          | Start the local Next.js development server         |
| `pnpm build`        | Create a production build                          |
| `pnpm start`        | Run the production server                          |
| `pnpm typecheck`    | Run TypeScript without emitting files              |
| `pnpm lint`         | Run ESLint                                         |
| `pnpm lint:fix`     | Apply safe ESLint fixes                            |
| `pnpm format`       | Run Prettier on allowed files                      |
| `pnpm format:check` | Check formatting                                   |
| `pnpm test`         | Run Vitest tests                                   |
| `pnpm test:watch`   | Run Vitest in watch mode                           |
| `pnpm verify`       | Run typecheck, lint, format check, test, and build |

## Project Structure

```text
src/
├── app/          # App Router pages, layouts, and global styles
├── components/   # Layout, dashboard, report, KPI, activity, auth, and icon components
├── constants/    # Navigation, theme, copy, and CSS variable constants
├── context/      # Current auth and theme context providers
├── data/         # Mock datasets used by the current UI
├── features/     # Feature API adapters, hooks, and domain components
├── lib/          # Shared API, config, and auth helpers
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

Do not add barrels in every internal folder just for symmetry. A barrel should mark a real public
boundary.

## Styling and Theme

- `src/app/globals.css` owns global reset, theme variables, and global primitives.
- Component styles stay colocated in `ComponentName.module.css`.
- CSS variable values are the source of visual truth.
- This cleanup must not change colors, spacing, typography, chart appearance, card dimensions, or
  responsive behavior.

## Authentication

Authentication uses the real Operix backend contract:

```text
POST /auth/sign-in/email
GET  /viewer/me
GET  /auth/get-session
POST /auth/sign-out
```

`/viewer/me` is the sole authentication and authorization truth. `/auth/get-session` is optional
profile presentation data only. Requests use cookie credentials.

## Mock Data

The current business feature UI is still mock-driven. Mock datasets stay under `src/data` until each
feature integration phase.

Do not remove or move business mock data during structure cleanup unless every consumer is safely
updated and the visual output remains unchanged.

## Backend Integration Status

Backend integration is currently limited to auth, viewer, health infrastructure, Admin management,
and Member management. Teams, Member transfer, Tasks, dashboard data, performance, reports, and
inventory remain pending frontend slices.

The controlled order remains:

```text
Auth integration
→ Admin management
→ Member management
→ Team management
→ task workflows
→ dashboard and reports
→ inventory UI
```

## Page Composition Contract

Route files should stay thin and compose guards plus feature components. API calls, pagination, form
state, mutation handling, and domain error mapping belong in feature modules.

For Admin management:

```text
src/app/(dashboardLayout)/admins/page.tsx
src/app/(dashboardLayout)/admins/[adminId]/page.tsx
src/app/(dashboardLayout)/members/page.tsx
src/app/(dashboardLayout)/members/[memberId]/page.tsx
```

These routes compose:

```text
AuthGuard
DashboardShell
PermissionGuard
AdminList / AdminDetails
MemberList / MemberDetails
```

## Quality Gate

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
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
