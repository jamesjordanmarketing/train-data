Here’s a ready-to-use scaffold for labeling every document chunk across the dimensions we’ll care about—built for LoRA training today (not 2022). I’ve generated a CSV template you can download and drop into your pipeline:

[Download the chunk scaffold template (CSV)](sandbox:/mnt/data/chunk_scaffold_template.csv)

### What’s in the template (high level)

* **Provenance & IDs:** `Doc_ID`, `Chunk_ID`, `Chunk_Type`, `Primary_Category` (your B. User-Centric mapping).
* **Location & size:** page/char ranges, token counts, overlap.
* **Content handles:** 1-sentence summary, key terms.
* **General labels:** audience, intent, tone/voice, brand persona, domain tags.
* **Instruction/Procedure fields:** task name, preconditions, inputs, `Steps_JSON`, expected output, warnings/failure modes.
* **Claim–Evidence–Reasoning fields:** claim, evidence snippets, reasoning sketch, citations, confidence.
* **Example/Application fields:** scenario type (case/Q&A/dialogue), problem, solution, outcome metrics, style notes.
* **Q&A / instruction-tuning candidates:** prompt candidate, target answer, style directives, safety tags.
* **Quality & compliance:** coverage/novelty, IP sensitivity, PII & compliance flags.
* **Vector store hooks:** embedding id, checksum.
* **Label provenance:** auto/manual/mixed, model used, who/when, review status.
* **Training controls:** include Y/N, split, augmentation notes.

---

### Top 3 additional chunk types to auto-create (beyond “sequential chapter”)

Prioritized for modern, label-rich workflows where models can auto-annotate a lot out of the box:

1. **Instructional Unit (Procedure/Task) Chunks**

   * **Why now:** Best alignment with instruction-tuning and agentic tool use. Maps directly to input→steps→expected output.
   * **How to detect:** Look for verbs, imperative mood, numbered/bulleted steps, “How to…”, “Procedure”, “Checklist”, etc.
   * **Key columns to fill:** `Task_Name`, `Preconditions`, `Inputs`, `Steps_JSON`, `Expected_Output`, `Warnings_Failure_Modes`, plus `Prompt_Candidate`/`Target_Answer` for trainable pairs.

2. **Claim–Evidence–Reasoning (CER) Chunks**

   * **Why now:** Current models benefit from structured factuality and rationale; CER improves truthful, sourced generations.
   * **How to detect:** Assertions with “because/therefore,” statistics, references, citations, graphs/tables nearby.
   * **Key columns:** `Claim`, `Evidence_Snippets`, `Reasoning_Sketch`, `Citations`, `Factual_Confidence_0_1`, and `Compliance_Flags` where needed.

3. **Example / Scenario / Dialogue Chunks**

   * **Why now:** Great for style transfer, brand voice, and applied problem-solution patterns (e.g., customer conversations).
   * **How to detect:** Case studies, “for example,” transcripts, Q&As, role-plays.
   * **Key columns:** `Scenario_Type`, `Problem_Context`, `Solution_Action`, `Outcome_Metrics`, `Style_Notes`, and optionally derive `Prompt_Candidate`/`Target_Answer`.

---

### How this plays with your Primary Category

For each chunk we retain your **Primary_Category** (Core IP, Strategy, Playbook, Narrative, Customer Conversation, External, etc.). The **Chunk_Type** is orthogonal and structural (e.g., `Instructional_Unit`, `CER`, `Example_Scenario`, or your existing `Chapter_Sequential`). A single document can yield multiple chunk layers, each carrying the same Primary Category but different structural roles—perfect for selective sampling and split control during training.

If you want, I can also generate a companion **data dictionary** sheet that documents each column’s meaning and examples.
