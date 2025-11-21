Here’s a focused checklist to verify the new export functionality end-to-end on your Vercel deployment.

**Core Scenarios**
- Export modal opens from the Bulk Actions toolbar when you select rows.
- Export modal opens with filters active (no manual selections) and shows “filtered” scope.
- Export modal closes via its close action and the UI state resets properly.

**Selection vs. Filter Scope**
- Select multiple conversations (across pages if possible), open export, choose “Selected” scope, pick `JSONL` format, start export, then download. Confirm only those IDs are present in the file.
- Clear selection, apply filters (e.g., status = approved, quality 7–10), open export, choose “Filtered”, export and download. Confirm all rows match the filter and none outside the filter appear.
- With no selections and no filters, choose “All” and export. Confirm the file contains all conversations.

**Network Verification**
- Open DevTools Network and confirm:
  - POST to `/api/export/conversations` includes `scope` (`selected|filtered|all`), `selectedIds` when applicable, `filters` reflecting current `tierTypes`, `statuses`, `qualityRange`, `searchQuery`, etc., plus `format` and `includeMetadata`.
  - Polling requests to `/api/export/status/{id}` proceed until `status = completed`.
  - File download hits `/api/export/download/{id}` and returns `200` with `Content-Disposition: attachment` and a file name matching the format.

**Download Validation**
- `JSONL`: One object per line; line count matches selected or filtered count. Fields reflect metadata when `includeMetadata` is toggled on (e.g., persona, emotions, categories, source fields if present).
- `CSV`: Header row present; row count equals expected scope; special characters properly quoted.
- Spot-check a few conversation IDs in the downloaded data to ensure correctness.

**UI/UX Checks**
- “Export” button only appears/activates when appropriate (e.g., selection active) and otherwise is hidden/disabled.
- Scope selector correctly defaults:
  - If any rows are selected, “Selected” is available and accurately reflects selection count.
  - If no selection but filters are active, “Filtered” is available and indicates the filter state.
  - If neither, “All” is the viable option.
- Progress state shows while export is running; success state appears when ready; clear error messaging on failures.

**Edge Cases**
- Try exporting with zero results (e.g., apply a filter that returns 0). Confirm the modal prevents export or shows a clear message.
- Cancel/close the modal mid-export; ensure the modal closes cleanly and doesn’t leave orphaned UI state.
- Very large selection or broad filters: confirm the UI remains responsive and the polling continues until completion.

**Regression Checks**
- Pagination still works; counts update on filter changes and selections across pages persist as expected.
- Conversation detail modal still opens and behaves normally.
- Keyboard shortcuts help overlay still opens with `?` and doesn’t conflict with the export modal.

**Acceptance Criteria**
- You can reliably export “selected”, “filtered”, and “all” conversations.
- Filters applied in the UI are reflected in the export payload and the resulting file.
- Export progress, completion, and download flows succeed with correct content and format.
- Error handling is visible, actionable, and does not corrupt UI state.

If any step fails (e.g., missing fields in payload, polling never completes, or incorrect scope in the downloaded file), share the specific network request/response details and UI state, and I’ll help trace the root cause quickly.

**Detailed Test Instructions**

Scenario A — Export from Selected Conversations
1. Starting URL: visit `https://<your-vercel-domain>/conversations`.
2. Verify the table shows conversations; if empty, clear filters using the Filter Bar or use “Generate Conversations” to seed some data.
3. Select 2–3 conversations via the row checkboxes.
4. Confirm the Bulk Actions toolbar appears at the bottom center.
5. Click “Export” in the Bulk Actions toolbar.
6. In the Export modal:
   - Set Format to `JSONL` (or `CSV` for a secondary check).
   - Set Scope to “Selected”.
   - Optionally enable “Include metadata”.
7. Click “Start Export”.
8. Wait for the progress state to complete, then click “Download File”.
9. Validate the downloaded file:
   - `JSONL`: Count the lines; they should equal the number of selected rows. Spot-check IDs match selected conversations.
   - `CSV`: Confirm header row exists; number of data rows equals selected count; fields align with selection.
10. Close the modal and confirm the UI returns to the dashboard without stale state.

Scenario B — Export Filtered Conversations (no manual selection)
1. Starting URL: `https://<your-vercel-domain>/conversations`.
2. Clear any existing selection if present (click “Clear” on Bulk Actions).
3. Apply filters using the Filter Bar, for example:
   - Status = “Approved”
   - Quality Range = 7–10
   - Optional: add a search query to narrow results
4. Confirm the results update to a filtered subset.
5. Select any single conversation to reveal the Bulk Actions toolbar (required to open the modal).
6. Click “Export”.
7. In the Export modal:
   - Set Format to `JSONL` (or `CSV`).
   - Set Scope to “Filtered”.
   - Optionally enable “Include metadata”.
8. Click “Start Export”.
9. Download the file when ready.
10. Validate the file contains only rows that match your active filters (IDs and visible fields should conform to the filtered set). It should not include conversations outside the filter.

Scenario C — Export All Conversations
1. Starting URL: `https://<your-vercel-domain>/conversations`.
2. Clear any filters using the Filter Bar “Clear” or equivalent.
3. If the Bulk Actions toolbar isn’t visible, select any single row to open the modal.
4. Click “Export”.
5. In the Export modal:
   - Set Format to `JSONL` (or `CSV`).
   - Set Scope to “All”.
6. Click “Start Export”.
7. Download the file when ready.
8. Validate the file contains all available conversations (row count should match the total reported by the dashboard).

Scenario D — Modal Open/Close and State Reset
1. Starting URL: `https://<your-vercel-domain>/conversations`.
2. Select 1 conversation to reveal the Bulk Actions toolbar.
3. Click “Export” to open the Export modal.
4. Click the modal’s Close/Cancel action.
5. Confirm the modal closes cleanly and the dashboard remains responsive.
6. Reopen the modal (select a conversation → “Export”) and confirm previous state did not persist unexpectedly (verify scope, format, and metadata toggle reset to sensible defaults).

Optional — Quick Network Verification (DevTools)
1. Open browser DevTools → Network tab.
2. During export:
   - Confirm `POST /api/export/conversations` includes correct `scope` (`selected|filtered|all`), `format`, `includeMetadata`, and, when applicable, `selectedIds` and `filters` (e.g., `statuses`, `qualityRange`, `searchQuery`).
   - Observe polling requests to `/api/export/status/{id}` until `status = completed`.
   - Confirm the download hits `/api/export/download/{id}` and returns `200` with a file attachment.
3. If any step fails, note the response payload and error message for debugging.

Reset Between Scenarios
- Use “Clear” on the Bulk Actions toolbar to remove selection.
- Use the Filter Bar to clear filters (return to the default, unfiltered state).
- Refresh the page if the UI looks out of sync after edge-case tests.

Acceptance Checks per Scenario
- Export scope matches your selection: “Selected”, “Filtered”, or “All”.
- Downloaded content matches the expected set and format.
- Modal opens/closes reliably; progress and completion states appear as expected.
- No stale or corrupted UI state after closing the modal or switching scopes/formats.
