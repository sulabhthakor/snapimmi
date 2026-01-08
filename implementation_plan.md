# Implementation Plan - Visa SaaS Platform (v2.2)

This document outlines the step-by-step technical plan to build the "Investor-Grade" Visa Consultancy SaaS.

## User Review Required
> [!IMPORTANT]
> **Tech Stack Confirmation**: 
> - **Framework**: Next.js 15 (App Router)
> - **DB**: PostgreSQL + Prisma
> - **UI**: Tailwind + Shadcn/UI
> - **Queues**: BullMQ + Redis (Critical for automation)
> - **WhatsApp**: Evolution API (Self-hosted)

## Proposed Changes

### Phase 1: Foundation & Infrastructure (Foundation)
**Goal**: Establish a solid, secure, and developer-friendly base.
#### [NEW] [docker-compose.yml](file:///docker-compose.yml)
- Define services: `app`, `postgres` (v16), `redis` (v7), `minio` (local S3), `mailpit` (local email testing).
#### [NEW] [Schema Setup](file:///prisma/schema.prisma)
- Implement the V2.2 Optimized Schema with `Firm`, `User`, `Customer`, `Passport` models.
- Apply `deletedAt` Soft Delete logic logic in a Prisma extension.
#### [NEW] [Auth System](file:///src/features/auth)
- Setup NextAuth.js (v5 beta) or Lucia Auth.
- Implement Custom Sign-in Page.
- Create `firm-middleware.ts` to ensure strict tenant isolation (Block access if `user.firmId != param.firmId`).

### Phase 2: Core CRM (The "People" Layer)
**Goal**: Enable agencies to manage their client database effectively.
#### [NEW] [Customer List](file:///src/features/customers/components/CustomerList.tsx)
- Implementation of the DataTable with server-side pagination, sorting, and filtering.
- Columns: Name, Status, Next Expiry, Actions.
#### [NEW] [Customer Wizard](file:///src/features/customers/components/NewCustomerWizard.tsx)
- Step 1: Zod Form for Basic Info (Name, E-164 Phone).
- Step 2: Passport Details with validaton.
- Step 3: Family Grouping selection.
#### [NEW] [Family Logic](file:///src/features/customers/server/family-actions.ts)
- Backend logic to link members and auto-assign "Family Head".

### Phase 3: Document Intelligence & Storage
**Goal**: A secure, organized digital vault.
#### [NEW] [File Manager](file:///src/features/documents/components/FileManager.tsx)
- UI: Grid/List toggle, Folder navigation.
- Action: "Upload" using `react-dropzone`.
#### [NEW] [Storage Service](file:///src/core/services/storage.ts)
- Abstraction layer: `uploadFile(buffer, path)` -> Adapters for S3 (Prod) / MinIO (Dev).
- **Security**: Endpoint to generate Presigned URLs for viewing files (files never public).

### Phase 4: Application Pipeline (The "Work" Layer)
**Goal**: Visualize the business flow.
#### [NEW] [Kanban Board](file:///src/features/applications/components/Board.tsx)
- Drag-and-drop interface using `@dnd-kit/core`.
- Optimistic UI updates (UI moves instantly, reverts if server fails).
#### [NEW] [State Machine](file:///src/features/applications/server/workflow.ts)
- Rules: Can't move to "Approved" without uploading "Visa Grant Letter".

### Phase 5: Automation Engine (The "Magic" Layer)
**Goal**: Replace manual Excel tracking.
#### [NEW] [Expiry Worker](file:///src/workers/expiry-check.ts)
- Cron job (Midnight UTC): Find `Passport` where `expiryDate` = Today + [180, 90, 30, 7] days.
- Add Job to Queue: `send-notification`.
#### [NEW] [WhatsApp Service](file:///src/core/services/whatsapp.ts)
- Integration with Evolution API.
- Template: "Hi {name}, your passport expires on {date}. Click here to renew."

### Phase 6: Dashboard & Analytics
**Goal**: Executive overview.
#### [NEW] [Dashboard Page](file:///src/app/(dashboard)/page.tsx)
- Recharts implementation:
    - `ExpiryBarChart`: Upcoming expiries by month.
    - `PipelinePieChart`: Applications by status.
- Widgets: "Urgent Actions" list.

## Verification Plan

### Automated Tests
- **Unit**: Zod Schema validation tests.
- **E2E**: Playwright flow: Login -> Add Customer -> Upload Doc -> Check Dashboard.

### Manual Verification
- **Multi-tenancy**: Create 2 Firms (Firm A, Firm B). Login as A, try to fetch B's customer ID via API.
- **Expiry**: Manually set a passport expiry to "Tomorrow", run the worker, verify email/WhatsApp received.
- **Performance**: Upload 50MB file, verify loading state and final storage.
