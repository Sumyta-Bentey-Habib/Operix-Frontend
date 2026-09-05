# Product Requirements Document (PRD) — Pharmaceutical Workload & Operations Management Platform (Operix)

## 1. Executive Summary

Operix is a enterprise pharmaceutical workload and operations management platform designed to streamline task allocation, performance monitoring, submission reviewing, and operational reporting across multi-tenant team hierarchies.

---

## 2. Platform Core Architecture & Tech Stack

- **Frontend Framework**: Next.js (App Router), React, TypeScript.
- **Styling & Design System**: Modular CSS with CSS Custom Properties, curated role-tailored color palettes, glassmorphism, responsive grid layouts.
- **Data & State Architecture**: Strict role-scoped access control, background API data fetching, and security-hardened DTO layers.

---

## 3. User Roles & Access Hierarchy

### 3.1 SUPER ADMIN / CHIEF

- **Description**: Executive platform oversight with organization-wide visibility and management authority.
- **Key Responsibilities**: Strategic operations oversight, Admin account management, organization-wide workload balancing, high-level reporting review.

### 3.2 ADMIN

- **Description**: Operational team leaders responsible for direct member management and workload execution.
- **Key Responsibilities**: Task creation and assignment, priority setting, submission reviews (approval/rejection/revisions), team workload balancing, management report generation for Super Admin.

### 3.3 MEMBER / STAFF

- **Description**: Operational staff responsible for executing assigned workflows.
- **Key Responsibilities**: Task execution, progress status updates, work submission with supporting file uploads, feedback review, and task resubmissions.

---

## 4. Operational Requirements by Role

### 4.1 Super Admin / Chief

1. View and manage Admin accounts and organization teams.
2. View all organization Members and current capacity metrics.
3. Access organization-wide tasks, assignments, submissions, and historical logs.
4. Monitor Admin and Member activity in real-time.
5. Track workload distribution, overdue tasks, and overall completion rates.
6. **Direct Operational Data Stream**: Expose raw operational metrics directly in the platform UI so the Chief never needs to manually collect or calculate data across external Excel spreadsheets.

### 4.2 Admin

1. View and create Members assigned under their direct operational responsibility.
2. Create, assign, and reassign tasks with priorities and strict deadlines.
3. Monitor real-time task progress and member capacity.
4. Review submitted work: approve, reject, or request revisions with detailed comments.
5. Utilize member performance and workload insights when allocating new assignments.
6. Generate and submit management reports to the Super Admin.

### 4.3 Member / Staff

1. View personal assigned tasks, details, priorities, and deadlines.
2. Update task execution status (`IN_PROGRESS`, `SUBMITTED`, etc.).
3. Upload supporting attachments and add remarks upon work submission.
4. Receive review feedback and make required corrections for resubmission.
5. Track personal task history and individual performance metrics.

---

## 5. Role-Specific Dashboard Visual Themes & Layout Specifications

The dashboard interface must dynamically adapt its theme styling, color tokens, and layout composition based on the authenticated user's role (`viewer.role`):

### 5.1 Super Admin / Chief — Expanded Executive Analytics Theme

- **Visual Style**: Slate/Indigo executive palette with dark accent lines (`#6366F1`) and gradient highlights.
- **Layout Structure**:
  - Executive Snapshot Header with organizational health badge (`Super Admin / Chief`).
  - Direct Operational Data Stream notification bar (confirming automated data collection).
  - Multi-metric KPI cards (Active Workload, Operational Scope, Completion & Quality Rates, Management Reports oversight).
  - Expanded dual-grid layout displaying Team Workload distribution, Member Workload tables, Completion Trend charts, and Org-wide Activity Feed.

### 5.2 Admin — Management Control Theme

- **Visual Style**: Vibrant Cyan/Teal management palette with blue focus accents (`#0284C7`).
- **Layout Structure**:
  - Management Header with Scoped Team indicator badge (`Admin`).
  - Active Workload KPI grid focusing on Review Queue, Due Soon, and Revisions Required.
  - Team Summary tiles and Member Workload breakdown table to empower data-driven work allocation.
  - Quick action pathways for task assignment and management report generation.

### 5.3 Member / Staff — Personal Workspace Theme

- **Visual Style**: Clean Emerald/Slate workspace palette with green action accents (`#10B981`).
- **Layout Structure**:
  - Workspace Header with Staff badge (`Member / Staff`).
  - Personal Workload tiles (My Active Tasks, Task Quality & Revisions, My Performance score, Unread Alerts).
  - Streamlined single-column workload view prioritizing urgent deadlines, submission feedback, and personal task history.

---

## 6. Data Security Specifications & ID Obfuscation Protocol

### 6.1 Security Constraint

Strictly ensure that **no raw internal database primary keys or record IDs** (e.g., raw User IDs, Admin IDs, Member IDs, Team IDs, Report IDs, Entity IDs) are rendered or visible in client-side UI sections, table columns, badges, tooltips, dialogs, or DOM text nodes.

### 6.2 Public Identifier Standard

When a unique reference must be presented in the user interface:

1. **Human-Readable Names / Handles**: Display the entity's full name, email, or handle whenever available (e.g., `John Doe`, `Admin Smith`, `Engineering Team`).
2. **Obfuscated Public Slugs**: When a name is absent or an explicit reference number is required, format the identifier using the centralized `obfuscateId` security utility (e.g., `USR-****4321`, `ADM-****5678`, `RPT-****9012`, `TM-****0abc`).
3. **Form & Picker Labels**: Re-label raw ID fields in UI components from `Admin ID` / `Team ID` to `Admin Handle` / `Team Reference`.
