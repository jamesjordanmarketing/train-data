# Train-Data Module Context (v1)

Audience: New agent responsible for informing the user about the recently completed train-data add-on in this repo.

Purpose: Equip you to confidently describe the product, cite the right files with exact paths, trace features to functional requirements and wireframe execution, and answer follow-ups with implementation-aware detail.

## Product Overview
- Scope: Interactive LoRA conversation generation and training-data platform add-on integrated with existing code and wireframe.
- Outcomes: High-quality FRs with traceability, wireframe execution logs, SQL verification artifacts, and exportable training data.
- Foundations: Overview, functional requirements, FR→wireframe execution docs (E01–E10 + part files), and validation outputs.

## Canonical Sources (Absolute Paths)
- Overview document: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\01-bmo-overview-train-data_v1.md`
- Functional requirements: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-train-functional-requirements.md`
- FR wireframes index: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-index.md`
- Codebases for reference:
  - Main app code: `c:\Users\james\Master\BrightHub\brun\train-data\src`
  - Wireframe/UI code: `c:\Users\james\Master\BrightHub\brun\train-data\train-wireframe\src`
- Context tools: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\generate-fr-checks.js`

## FR → Wireframe Execution Files (Key)
- E01: `...\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E01.md`
  - Parts/Addenda: `E01-part-2.md`, `E01-part-3.md`, `E01-addendum-1.md`, `E01-sql-check.md`
- E02: `...\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E02.md`
  - Parts/Addenda: `E02-part-2.md`, `E02-addendum-2.md`, `E02-addendum-3.md`, `E02-addendum-4.md`, `E02-pre-check.md`, `E02-sql-check.md`
- E3: `...\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E03.md`
  - Parts/Addenda: `E03-addendum-1.md`, `E03-pre-check.md`, `E03-sql-check.md`, `E03b.md`
- E4: `...\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E04.md`
  - Parts/Addenda: `E04-sql-check.md`
- E5: `...\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E05.md`
  - Parts/Addenda: `E05-sql-check.md`, `E05-detailed-results.md`, `E05-rpc-results.json`
- E6: `...\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E06.md`
  - Parts/Addenda: `E06-sql-check.md`, `E06-sql-check-results.json`
- E7: `...\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E07.md`
  - Parts/Addenda: `E07-part2.md`, `E07_part3.md`, `E07-part4.md`, `E07-sql-check.md`
- E8: `...\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E08.md`
  - Parts/Addenda: `E08-part2.md`, `E08-part3.md`, `E08-part4.md`, `E08-VERIFY.sql`, `E08-VERIFY_v2.sql`, `E08-sql-check.md`
- E9: `...\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E09.md`
  - Parts/Addenda: `E09-sql-check.md`, `E09-sql-only.md`
- E10: `...\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E10.md`
  - Parts/Addenda: `E10-part2.md`, `E10-part3.md`, `E10-part4.md`, `E10-DATABASE-NORMALIZATION.md`

Note: The full directory is here: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\` and includes additional artifacts (status files, catch-up outputs, and train-FR variants).

## Recommended Reading Order
- Start: Overview → Functional Requirements to grok scope and structure.
- Then: FR wireframes index → E01 through E10, scanning part/addendum files where present.
- Finally: Validation artifacts (SQL checks, RPC results) to confirm implementation state.

## Key Concepts You Should Know
- FR Traceability: Each FR ties to wireframe components and verification outputs; cite specific FR IDs when answering.
- Execution Evidence: Part, addendum, and `sql-check`/`rpc-results` files provide audit-style proof of work.
- Export Targets: Training data specs and JSONL outputs are captured in FRs and execution notes.

## How To Inform the User (Answer Patterns)
- Summarize: Provide a concise outcome and reference the canonical file(s) with exact paths.
- Trace: Mention the FR section and link to the matching E0X execution file plus any relevant part/addendum.
- Validate: Cite a verification artifact (e.g., `E05-rpc-results.json`, `E08-VERIFY_v2.sql`) when it strengthens the claim.

## Action Directives
- Always include at least one absolute file path to the relevant source when answering.
- Connect each feature to its FR entry and at least one E0X execution doc; note any part/addendum.
- When asked “where is X implemented?”, reply with FR ID, E0X doc path, and code file path if available.
- For data integrity topics, reference the corresponding `sql-check` or `VERIFY.sql` artifacts in E05–E10.

## Common Workflows
- Explain the product: Use Overview + FR summary, then point to E0X artifacts showing execution.
- Locate a feature: Search `03-train-functional-requirements.md` for FR ID or section name; cross-reference E0X part files.
- Demonstrate validation: Provide the E0X `sql-check` or `rpc-results` file path and a one-line result description.
- Export discussion: Reference FR sections that cover dataset formats and the training-data export pipeline.

## Validation & Evidence Artifacts (Examples)
- SQL checks: `E02-sql-check.md`, `E04-sql-check.md`, `E06-sql-check.md`, `E09-sql-check.md`
- SQL verification scripts/results: `E08-VERIFY.sql`, `E08-VERIFY_v2.sql`, `E06-sql-check-results.json`
- RPC results: `E05-rpc-results.json`, `E05-detailed-results.md`

## Codebase Pointers
- Wireframe component mapping appears within FR documents and the wireframe repo: `train-wireframe/src/components/...`
- Main app code paths referenced by FR sections: `src/...` (see FR tables with “Implementation File” entries).
- FR check generator: `pmc/context-ai/pmct/generate-fr-checks.js` produces structured validation targets from FR headings.

## Answer Template (Use and Adapt)
- Outcome: One-sentence summary of the feature or result.
- Sources: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-train-functional-requirements.md` (FR[X.Y.Z]); execution: `...\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E0N*.md` (include part/addendum if relevant).
- Evidence: SQL/RPC artifact path and one-line result.
- Next step: Suggested follow-up (e.g., cross-check in wireframe, export validation).

## Quick Notes
- Some FR sections reference both the wireframe and main codebase; include both when clarifying implementation.
- E11 files indicate continuation beyond E10; prioritize E01–E10 unless asked about extended work.

## Where This Context Lives
- `c:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\04-train-data-module-context_v1.md`

## Quick Response Examples
- Data export format and validation:
  - Outcome: JSONL export validated for LoRA training.
  - Sources: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-train-functional-requirements.md` (FR5.1.1).
  - Execution: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E05.md`.
  - Evidence: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E05-rpc-results.json`.

- E05 RPC verification status:
  - Outcome: RPC function checks executed; key validations passed.
  - Sources: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-train-functional-requirements.md`.
  - Execution: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E05-sql-check.md`.
  - Evidence: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E05-rpc-results.json`, `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E05-detailed-results.md`.

- Database normalization review (E10):
  - Outcome: Normalization steps documented and verified across relevant tables.
  - Sources: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-train-functional-requirements.md` (schema/integrity sections).
  - Execution: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E10.md`.
  - Evidence: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E10-DATABASE-NORMALIZATION.md`, `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\E09-E10-SAFE-SQL_v1.sql`.