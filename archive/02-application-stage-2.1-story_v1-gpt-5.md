# Stage 2.1 — AI-Powered Content Analysis: A Narrative for Bright Run’s Fine-Tuning Training Data Platform

This story explains Stage 2.1 in clear, everyday language. It describes what Stage 2.1 does, why it matters, and how each part of the interface works to move your data from “raw content” to “organized knowledge” that the rest of the pipeline can use.

- Context source: pmc/product/01-bmo-overview.md (high-level goals and 6-stage workflow, “Stage 2: Content Analysis and Structuring”)
- User needs: pmc/product/02-bmo-user-stories.md (what users expect to do in Stage 2)
- Functional intent: pmc/product/03-bmo-functional-requirements.md (when not present, aligned with tmp-03-bmo-functional-requirements.md, the functional-requirements skeleton, and archived originals that define FR2.1.0 “AI-Powered Content Analysis”)

---

## 1) What Stage 2.1 Is (In Plain English)

Stage 2.1 is where the system “reads” your uploaded documents and breaks them down into understandable parts. It identifies:
- Main topics and subtopics (what the content is about)
- Important entities (like people, organizations, places, dates, and domain-specific terms)
- Relationships between those entities (who’s connected to what and how)
- How the content is structured (sections, headings, segments, and logical flow)
- Quality signals (how clear and complete the content is, and whether it’s suitable for training)

Think of Stage 2.1 like a librarian and analyst working together:
- The librarian organizes the material into labeled shelves (topics, entities, sections)
- The analyst checks the quality and gives you a score to show how “ready” it is for training

This stage prepares your data so the next stages (like generating training pairs and variations) can work reliably and efficiently.

Why it matters:
- It saves time by automatically organizing content from different formats
- It reduces mistakes later by catching quality issues early
- It creates a foundation that the rest of the pipeline depends on

---

## 2) How Stage 2.1 Fits in the 6-Stage Workflow

- Stage 1 (before this): You upload and validate files. The system confirms files are readable and safe.
- Stage 2.1 (this stage): The platform analyzes content to extract topics, entities, relationships, and structure, and it segments content into chunks with metadata (like confidence and language).
- After Stage 2.1: The system hands these structured outputs to the training-data stages so they can create high-quality question–answer pairs and other training examples.

If the upload stage is “collecting ingredients,” Stage 2.1 is “chopping, sorting, and labeling” them so cooking (training data generation) goes smoothly.

---

## 3) What You See on the Stage 2.1 Screen and What Each Part Does

The Stage 2.1 interface follows a practical pattern used elsewhere in Bright Run (e.g., run setup screens, progress panels, and results tabs). Each area isn’t just for looks—it directly supports the analysis process.

1) Project and Source Overview
- What you see: The current project name, a summary of uploaded documents (file names, sizes, types), and batch details.
- Why it’s there: To make sure you’re analyzing the right data and to give you a quick snapshot of the input set.

2) Analysis Controls (Configuration Panel)
- Model selection: Choose between “Fast” vs “Advanced” NLP models (trade-off speed vs depth/accuracy).
- Topic extraction settings: Number of topics (e.g., 10–50), topic depth (surface vs detailed), and confidence threshold (filter out low-confidence topics).
- Entity detection: Pick entity types (people, orgs, places, dates, domain-specific) and enable domain adaptation (e.g., medical, legal, technical).
- Relationship mapping: Toggle detecting connections between concepts/entities; useful but more computationally heavy.
- Content segmentation: Choose how to split content into chunks (by heading, fixed size, semantic boundaries) and control chunk size.
- Language and preprocessing: Auto-detect language, normalize text, and apply cleanup if needed.

What this does operationally:
- These settings directly control which analysis tasks run and how strict they are.
- The system validates your selections (e.g., chunk size ranges, topic counts) and warns you about potential performance costs (e.g., relationship graphs on very large document sets).
- Clear defaults are provided so beginners can “just run it” without tweaking everything.

3) “Start Analysis” and Job Controls
- Start: Kicks off a pipeline job that performs content analysis in steps (topics → entities → relationships → segmentation → quality scoring).
- Pause/Resume/Cancel: Lets you stop or resume if needed—useful for long runs or if you need to adjust settings.
- Estimated Time and Progress: Shows a running estimate based on document size and settings.
- Logs and Notifications: Shows key events and errors in human-friendly language.

What this does operationally:
- The pipeline runs tasks in the right order and preserves state (so you don’t lose progress if you pause or refresh).
- If a subtask fails, you get a targeted error (e.g., “entity recognition failed on File B due to encoding”) and suggestions to fix it.

4) Live Status Panels (By Subtask)
- Topic Extraction: Progress bar, count of topics found, preview of top topics.
- Entity Recognition: Progress bar, entities detected by type (with counts).
- Relationship Mapping: Progress bar, edges/links discovered (with a sample).
- Segmentation: Progress bar, number of chunks created and average chunk size.
- Quality Signals: Progress bar, current quality score trends (clarity, completeness, suitability).

What this does operationally:
- Each panel represents a real subtask in the pipeline, updated in real time.
- You can drill into a subtask panel to see more detail or troubleshoot.

5) Results Tabs (After Analysis Completes)
- Topics: A structured list (or tree) of topics and subtopics with confidence scores and short descriptions. You can expand/collapse and filter by confidence.
- Entities: A table grouped by type (e.g., Person, Organization, Term) showing frequency counts and where they appear. Clicking an entity reveals snippets of text where it was found.
- Relationships: A graph-friendly list of triples (Subject — Relation — Object) with confidence scores and filters. Useful to understand how ideas connect.
- Segments: The final content chunks with titles, boundaries, token counts, language, and tags. Clicking a segment shows its original context (so you can spot segmentation issues).
- Quality & Readiness: Scores and flags for completeness, clarity, and training suitability. Also shows suggested fixes (e.g., “Section 3 has low clarity—consider adding definitions”).

What this does operationally:
- These outputs are exactly what the next stage consumes. They condense raw text into structured knowledge you can trust.
- You can export these results (JSON/CSV) or push them forward directly to training-pair generation in the pipeline.

---

## 4) What Stage 2.1 Produces (The Hand-Off to Later Stages)

Stage 2.1 outputs are designed to be machine-usable and human-checkable:
- Topic Map: A hierarchy of topics/subtopics with confidence and brief summaries.
- Entity Index: A typed list of entities with counts, example occurrences, and context pointers.
- Relationship Graph: A list of connections (triples) with confidence, ready for visualization or filtering.
- Content Segments: Well-formed chunks with metadata (language, size, headings) that preserve context.
- Quality Metrics: Scores and flags that guide whether to proceed, improve inputs, or adjust settings.

This bundle becomes the “source of truth” for later training steps—especially training pair generation and semantic variation—so quality here directly influences training outcomes.

---

## 5) How This Maps to the Product Goals and User Stories

Based on the overview and user stories:
- Helps users “see and trust” what the system learned from their uploads (transparency).
- Lets users tune the analysis (e.g., choose topic depth) to match their domain and goals.
- Provides clear progress, errors with fixes, and the ability to run large batches safely.
- Stores state so you can resume without losing work if your session is interrupted.
- Gives a quality gate: if your content isn’t ready, you’ll know why and how to address it.

Example user flow (10th-grade friendly):
1) You drop in a set of PDFs you want to train on. Stage 1 checks they’re OK.
2) In Stage 2.1, you choose “Advanced” analysis, set topics to 25, and turn on relationship mapping.
3) You press Start. You see each step run with live progress and time estimates.
4) When it’s done, you open the Topics tab and see a clean outline of your content’s big ideas.
5) You switch to Entities to see people and terms mentioned, and to Relationships to see how they connect.
6) The Quality tab shows your material is “Good,” with a note to expand explanations in one section.
7) You export the results or continue to the next stage to generate training pairs.

---

## 6) Operational Design Principles Behind the UI

- Clarity first: Show the job status and ETA clearly; make errors actionable.
- Guided control: Offer powerful settings but keep safe defaults so beginners can run with one click.
- Real-time insight: Surface previews during processing (e.g., first topics, first entities) so users gain confidence early.
- Explainability: Confidence scores and quality signals help users understand “why” the system believes what it does.
- Safe at scale: Batch-friendly with pause/resume; preserves job state; segments content to keep memory use manageable.
- Direct hand-off: Results are organized exactly the way the next stage needs them (no extra cleanup).

---

## 7) Quality, Validation, and Edge Cases

- Multi-language: Auto-detection ensures mixed-language documents are handled correctly, with consistent segmentation and tagging.
- Long documents: Semantic segmentation and chunk sizing prevent loss of context and keep downstream processing efficient.
- Domain adaptation: Choosing a domain (e.g., technical) improves which entities and relationships are detected.
- Confidence thresholds: Help filter noise and focus on reliable insights.
- Quality checks: Low-quality or unclear sections are flagged so you don’t train on weak material.

---

## 8) What’s Not the Goal of Stage 2.1

- It does not generate training pairs yet (that happens later).
- It does not rewrite content; it explains and organizes it.
- It does not enforce strict editorial changes; it suggests improvements based on quality signals.

---

## 9) Summary in One Paragraph

Stage 2.1 is the “understanding” step. It reads your files, figures out the main topics, spots important terms and people, shows how ideas connect, and slices everything into clean sections. It also tells you whether your content is ready for training and, if not, what to fix. The interface lets you choose how deep the analysis should go, runs everything with live feedback, and gives you results that flow smoothly into the next stage of the pipeline. Strong Stage 2.1 results = better training data and better models later.

---