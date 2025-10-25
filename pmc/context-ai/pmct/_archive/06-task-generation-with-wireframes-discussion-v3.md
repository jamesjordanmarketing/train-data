## Task Generation with Wireframes — Strategic Integration Discussion (v3)

**Product**: Bright Run (BMO)

**Scope of this document**: Integrate the Stage 1 wireframe (wframe-stage-1-page-1) into the current IPDM task-generation approach to produce a complete, accurate, and testable task list that marries backend functionality with frontend behavior and visual components. This is a process-focused review and integration plan, not implementation code.


### 1) Context and Objective

- **Goal**: Adopt the wireframe design as the first front-end draft and align backend tasks so the pipeline functions progressively (Stage 1 → Stage 6), beginning with FR1.1.0 (Document Processing).
- **Input artifacts reviewed**:
  - `pmc/product/03-bmo-functional-requirements.md` (FR v1.1.0)
  - `pmc/product/01-bmo-overview.md`
  - `pmc/product/02-bmo-user-stories.md`
  - `pmc/product/_mapping/ui-functional-maps/04-bmo-ui-first-functional-requirements-E01.md`
  - `pmc/product/_mapping/sequential-atomic-approach/06a-product-task-elements-breakdown-prompt-v6.0-v3-opus-max.md`
  - `pmc/product/_prompt_engineering/06a-product-task-elements-breakdown-prompt-v6.0-v3-E01.md`
  - Wireframe code: `wframe-stage-1-page-1/` and `wframe-stage-1-page-1/components/ui/`


### 2) Wireframe Summary: What the current UI actually does

- **Main components in use**:
  - `FileUpload`: Drag-and-drop and chooser; uploads to Supabase Edge Function; polls for file status; lists files with status and actions (preview, delete).
  - `ConfigurationPanel`: Analysis configuration controls (topic/entity/structure/processing options), saved configurations, and Start Analysis button; shows counts of queued/analyzing/ready.
  - `ProgressBar`: Multi-stage visual indicator (static progress line width currently).
  - Bottom action bar: Save configuration and Advanced Settings placeholder.

- **Supporting components present but not yet wired into page**:
  - `PreviouslyUploadedFiles`: Collapsible list with duplicate warnings, reprocess, preview, delete.

- **Backend integration (wireframe prototype)**:
  - Supabase Edge Function endpoints under `/functions/v1/make-server-0fb30735/*` with a KV table `kv_store_0fb30735` and a private storage bucket.
  - Endpoints include: `upload`, `files`, `files/:id`, `files/:id/reprocess`, `configuration`, `configurations`, `analyze`, `analysis/:jobId` with simulated analysis completion.

- **Observed behaviors aligned with FR1.1.0**:
  - Drag-and-drop, multi-file, size hint (100MB), type hint (TXT/DOC/DOCX/PDF), per-file upload progress (simulated), status badges (queued/analyzing/complete/error), delete, preview via signed URL, configuration save/load, analysis start and status polling.

- **Not yet present in the current page** (but listed in UI-FR mapping):
  - `ContentPreview`, `DocumentMetadataPanel`, `ProcessingQueue`, `OCRAccuracyIndicator`, advanced logs/validation/encoding/streaming.


### 3) Alignment to FR1.1.0 (Document Processing) – coverage vs gaps

- **Covered now (prototype level)**
  - Drag-and-drop interface with multi-file upload
  - Visual progress indicators and status chips
  - Basic type validation (server-side) and error feedback
  - Batch list view with per-file actions
  - Start analysis flow + job status polling (simulated)

- **Gaps to plan for near-term**
  - Additional formats (PPT/PPTX/MD/CSV/JSON) and auto-detection
  - File size validation and large-file streaming
  - Content preview (by type) and formatting preservation options
  - Metadata extraction/preservation with editable panel
  - Processing logs with downloadable reports
  - Character encoding detection and warnings
  - OCR for image-based documents, with confidence indicators
  - Real-time progress (WebSocket/Supabase Realtime) instead of polling
  - Queue management (priorities, pause/resume, re-order)
  - Clear remediation steps for errors

- **Naming alignment issue**
  - The page header says “Content Analysis” but this screen operationally belongs to FR1.1.0 (Document Processing). We should rename the stage label in UI to “Document Processing” to match FR taxonomy, or document the mapping explicitly.



### 4) Integration Strategy: adopt wireframe while securing backend parity

- **Two-phase backend plan**
  1) Bridge mode (immediate): Keep calling the Supabase Edge Function endpoints from the UI but introduce a Next.js API proxy (`/app/api/*`) to formalize contracts, centralize auth, and enable local testability. This preserves the wireframe’s working behavior while giving us internal APIs and types.
  2) Native mode (progressive): Replace proxy internals with production services (storage, queue, OCR, parsers, logs) incrementally, without changing the UI contracts.

- **API contracts (to stabilize now)**
  - `POST /api/upload` → returns file metadata + signed URL
  - `GET /api/files?limit=n` → list, newest first
  - `DELETE /api/files/:id`
  - `POST /api/files/:id/reprocess`
  - `POST /api/configuration` and `GET /api/configurations`
  - `POST /api/analyze` → returns `jobId`, `estimatedCompletion`
  - `GET /api/analysis/:jobId`

- **Data models (initial)**
  - `ProcessedDocument` (id, originalName, mimeType, size, storagePath, uploadAt, status, metadata, analysisResults, error, signedUrl)
  - `ProcessingJob` (id, fileIds[], configuration, status, startedAt, estimatedCompletion, completedAt)
  - `DocumentMetadata` (title, author, creationDate, encoding, checks)
  - `AnalysisConfiguration` (model, topicCount, entityTypes, thresholds, segmentation, qualityLevel, domain, etc.)

- **Storage and queue**
  - Storage: Supabase Storage (bridge) → S3-compatible in prod
  - Queue: Simulated (bridge) → Redis/BullMQ (prod) with retry, backoff, priority

- **Security**
  - Move `projectId` and `publicAnonKey` from code to environment variables
  - Add auth guard on API routes; signed URL lifetimes; input size/type enforcement


### 5) Frontend integration plan: wireframe → production UI map

- **Adopt current components and migrate into production locations** (per UI-FR mapping):
  - `src/components/upload/FileUpload.tsx` (enhanced)
  - `src/components/upload/PreviouslyUploadedFiles.tsx` (rendered below `FileUpload`)
  - `src/components/upload/ContentPreview.tsx` (new)
  - `src/components/upload/DocumentMetadataPanel.tsx` (new)
  - `src/components/upload/OCRAccuracyIndicator.tsx` (new, behind feature flag)
  - Page route: `src/app/projects/[id]/upload/page.tsx` uses the above components
  - Shared: `src/components/common/ProgressBar.tsx`

- **Immediate UI upgrades**
  - Compute `ProgressBar` fill based on stage statuses
  - Insert `PreviouslyUploadedFiles` on the page (collapsible)
  - Add clear error banners with remediation steps
  - Add accept list for additional file types and show them in the hint row


### 6) Proposed IPDM step breakdown for Stage 1 (Document Processing)

Each step is a vertical slice: backend + frontend + tests, with cumulative validation.

1) File Upload v1 (TXT/DOC/DOCX/PDF) + List
   - BE: `/api/upload`, `/api/files`, basic type/size checks, signed URLs
   - FE: `FileUpload` integrated into `/projects/[id]/upload`
   - TEST: happy path + invalid type/oversize + list ordering

2) Status & Delete & Reprocess
   - BE: `/api/files/:id`, `/api/files/:id/reprocess`; job flagging
   - FE: status badges, delete/reprocess actions, toasts
   - TEST: reprocess transitions, delete consistency

3) Saved Configurations
   - BE: `/api/configuration`, `/api/configurations`
   - FE: `ConfigurationPanel` save/load
   - TEST: persistence, load correctness, empty states

4) Start Analysis + Job Tracking (polling)
   - BE: `/api/analyze`, `/api/analysis/:jobId` (bridge to Edge Function)
   - FE: Start Analysis flow, job polling, success/failure toasts
   - TEST: multiple files, mixed statuses, completion handling

5) Content Preview (initial) and Metadata Panel (read-only)
   - BE: `/api/documents/:id/preview`, `/api/documents/:id/metadata`
   - FE: `ContentPreview`, `DocumentMetadataPanel` (view)
   - TEST: preview for TXT/PDF/DOCX; fallback and error states

6) Validation & Encoding Detection
   - BE: integrity checks, encoding detection, warnings
   - FE: surface warnings inline; remediation links
   - TEST: mixed encodings and invalid/corrupt samples

7) OCR Confidence (feature-flagged)
   - BE: OCR on image PDFs with confidence score
   - FE: `OCRAccuracyIndicator`
   - TEST: low-confidence case prompts reprocess

8) Queue Management (priorities, pause/resume)
   - BE: queue endpoints
   - FE: simple `ProcessingQueue` controls
   - TEST: reordering/pause/resume and persistence

9) Real-time updates (replace polling)
   - BE: WS/Supabase Realtime events (processing, complete, error)
   - FE: live updates in lists and counters
   - TEST: socket disconnect/reconnect resilience

10) Logs and Downloadable Reports
    - BE: processing logs per file and batch
    - FE: log viewer and download link
    - TEST: large log pagination, export formats

11) Accessibility, i18n hooks, and responsiveness pass
    - BE: n/a
    - FE: ARIA, keyboard nav, screen reader labels; responsive layout checks
    - TEST: automated a11y scan + viewports


### 7) How we adapt the existing task-generation artifacts

- **Extend the IPDM prompt** (`pmc/product/_prompt_engineering/06a-*.md`) with Wireframe Coverage Inserts:
  - Add a pre-generation “Wireframe Coverage Check” step that enumerates wireframe components and states, mapping each to FR acceptance criteria and UI-First visual criteria.
  - Require an “API Contract Block” per step that lists the exact Next.js API routes, request/response types, and error shapes used by the UI.
  - Require a “Visual Validation Block” per step derived from `04-bmo-ui-first-functional-requirements-E01.md`.
  - Require a “Bridge vs Native” toggle indicating whether the step calls the Edge Function or native services.

- **Augment the task output file** to include for each step:
  - UI component list with props/events/state
  - API surface + types (OpenAPI excerpt or TS types)
  - Data model diffs (if any)
  - Visual validation checklist (UI-FR)
  - Error/remediation cases the UI must surface


### 8) Best artifact-generation process for consistent, robust, precise tasks

Adopt a Wireframe-Driven IPDM pipeline that produces consistent artifacts every time:

1) Inputs normalization
   - Parse FRs (WHAT), UI-FRs (visual behaviors), User Stories (acceptance), Wireframe code (actual states and calls).

2) Component-contract extraction (machine-checkable)
   - For each UI component in scope, generate a “contract sheet” with: props, events, data dependencies, loading/error/empty states, and required API endpoints (method + path + schema).

3) API contract stub generation
   - Produce a typed contract per endpoint (TS types + OpenAPI) and add an API proxy layer for bridge mode.

4) Step synthesis (IPDM)
   - Produce step-atomic slices where each step binds one or more component contracts to one API contract, plus tests. Enforce vertical completeness.

5) Validation gates
   - For each step, include: FR acceptance mapping, UI-FR visual checklist, error/remediation catalog, performance targets, and a11y checks.

6) Cumulative regression plan
   - Each step’s TEST task includes validation of all previous steps + end-to-end path to current step.

7) Traceability matrix export
   - Auto-generate a matrix mapping US → FR → Step → Tasks → Components → Endpoints. Persist as markdown and CSV in the repo.

8) Risk/assumption ledger
   - Record environment assumptions (keys, buckets, tables), third-party dependencies, and any temporary bridge behavior.

9) Ready-to-build checklist
   - All environment variables defined, mock data seeded, endpoints available (even if bridged), types published, and UI components scaffolded.


### 9) Immediate task deltas to ensure backend covers UI

- Create Next.js API proxies for: upload, files list/delete/reprocess, configurations, analyze, analysis status.
- Move Supabase credentials into environment variables; remove hard-coded keys from UI.
- Expand accepted file types and enforce size limits server-side.
- Add preview and metadata endpoints (stubs first) used by `ContentPreview` and `DocumentMetadataPanel`.
- Wire `PreviouslyUploadedFiles` into the upload page.
- Compute `ProgressBar` width based on stage statuses.
- Add error/remediation message catalog and surface it in UI.


### 10) Risks and mitigations

- Bridge drift: The prototype Edge Function behavior may diverge from production. Mitigate with API proxy contracts and contract tests.
- Security leakage: Public keys in code. Mitigate with env management and secret scanning.
- Over-scoping Stage 1: Defer OCR/queue management behind feature flags to keep slices atomic.
- Polling overhead: Replace with realtime once basic flows are solid.


### 11) Definition of Done (per step)

- Backend endpoint(s) implemented (bridge or native) with typed contracts and error shapes.
- UI consumes endpoints and surfaces loading/error/success states.
- Tests cover step-specific cases plus cumulative regressions.
- Visual validation checklist met (from UI-FR mapping).
- FR acceptance criteria mapped and satisfied for the slice in scope.


### 12) Next actions

- Add the Wireframe Coverage Inserts to the IPDM prompt, regenerate Stage 1 tasks, and place the updated task file at `pmc/product/_mapping/user-centric/6-bmo-user-centric-E01.md`.
- Create API proxy routes and types; point the wireframe UI at `/api/*` while preserving current UX.
- Migrate wireframe components into production directories aligned with `04-bmo-ui-first-functional-requirements-E01.md`.


