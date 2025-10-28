Here’s the **upgraded, fully structured, and expanded Markdown specification** for your document. It integrates, reorganizes, and clarifies all material from your attached file while keeping links to all source documents. This version is **clean, tiered, and ready to paste** directly into your project’s `.md` file.

---

# Bright Run Functional Specification Development

## Training Data Generation & Management Module

**Version:** 4.0
**Date:** October 25, 2025
**Product:** Bright Run LoRA Fine-Tuning Platform (BMO)
**Module:** Training Data Generation & Management

---

## 1. Purpose & Scope

This specification defines the **functional requirements** of the **Training Data Generation Module**, which transitions Bright Run’s current manual conversation generation system into a **fully interactive, automated UI-based experience**.

The specification focuses on **WHAT** the system must do — not implementation details. It will directly inform **FIGMA wireframe generation**, **Next.js 14 development**, and **Supabase integration**.

---

## 2. Reference Documents

Read the following documents before implementing this module:

* `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\01-bmo-overview.md`
* `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md`
* `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\c-alpha-build_v3.4-LoRA-FP-generation_v3.md`
* `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\GENERATION-COMPLETE-STATUS.md`
* `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\c-alpha-build_v3.4-LoRA-FP-COMPLETE-DATASET-SUMMARY.md`
* `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\c-alpha-build_v3.4_emotional-dataset-emotional-taxonomy.md`
* `C:\Users\james\Master\BrightHub\BRun\train-data\system\chunks-alpha-data\financial-planner-demo-conversation-and-metadata_v1.txt`
* `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements.md`
* `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E06.md`

---

## 3. Executive Summary

### 3.1 Module Purpose

The **Training Data Generation Module** allows users to:

* Select predefined conversation templates or scenarios.
* Generate individual or batch LoRA training conversations.
* Review, validate, and store results directly in a Supabase database.
* Eliminate manual JSON prompt execution.

### 3.2 Key Objectives

1. Replace console-based generation with a Next.js 14 front-end.
2. Integrate all training data JSON files into a normalized Supabase schema.
3. Enable “Generate One,” “Generate Batch,” and “Generate All” operations.
4. Ensure output JSON quality meets 95% acceptance criteria.
5. Provide a Figma-compatible UI specification for front-end development.

### 3.3 User Value Proposition

| Benefit            | Description                                         |
| ------------------ | --------------------------------------------------- |
| **Speed**          | Generate 100+ conversations in minutes via UI       |
| **Scalability**    | Tiered prompt structure supports complex generation |
| **Transparency**   | Live progress indicators and logs                   |
| **Data Integrity** | Versioned records and audit logs                    |
| **Flexibility**    | Filter, edit, and rerun individual prompts          |

---

## 4. System Context

### 4.1 Integration Target

**Codebase:** `C:\Users\james\Master\BrightHub\brun\train-data\src`

This module must integrate seamlessly into the existing project flow, reusing authentication, styling, and data management logic.

### 4.2 Technical Stack

* **Frontend:** Next.js 14, shadcn/ui, Tailwind, TypeScript, React Hook Form, TanStack Table
* **Backend:** Supabase, PostgreSQL, Edge Functions
* **AI Service:** Anthropic Claude Sonnet 4.5
* **State:** React Context, React Query, optional Zustand
* **Hosting:** Vercel (with Supabase backend)

---

## 5. Functional Architecture

### 5.1 Layered System Design

```
Training Data Generation Module
│
├── Database Layer (Supabase)
│   ├── conversations
│   ├── conversation_turns
│   ├── metadata
│   ├── personas
│   ├── emotional_arcs
│   ├── scenarios
│   ├── generation_queue
│   └── generation_logs
│
├── API Layer (Edge Functions)
│   ├── generate_single()
│   ├── generate_batch()
│   ├── process_all()
│   ├── validate_conversation()
│   └── export_dataset()
│
├── Frontend UI (Next.js + shadcn)
│   ├── Conversation Dashboard
│   ├── Filter & Dimension Panel
│   ├── Generation Controls
│   ├── Review & Approval View
│   ├── Progress Tracker
│   └── Export Screen
│
└── AI Engine
    ├── Prompt Template System
    ├── Parameter Injector
    ├── LLM API Client
    ├── Response Validator
    └── Quality Scoring Engine
```

---

## 6. Core Functional Requirements

### 6.1 Conversation Dashboard

**Purpose:** Present a sortable, filterable table of conversation entries.
**Acceptance Criteria:**

* Displays one row per conversation scenario.
* Columns: `ID`, `Persona`, `Emotion`, `Topic`, `Status`, `Last Updated`, `Generate`, `Preview`.
* Each row includes a **Generate** button to produce a new conversation.
* Batch selection checkboxes allow multi-generation.

### 6.2 Generation Controls

* **Single Generate:** Executes the prompt for one selected line.
* **Batch Generate:** Runs all selected lines sequentially.
* **Generate All:** Runs all available prompts sequentially.
* **Stop Button:** Cancels queued generations without data loss.

### 6.3 Dimension Filters

Top 8 dimensions (defined in `emotional-taxonomy.md`):

* Persona
* Emotion
* Content Category
* Intent
* Tone
* Role Pair (User/Assistant)
* Topic Cluster
* Outcome Type

**Acceptance Criteria:**

* Each dimension filter updates the table in real time.
* Multi-select filtering supported.
* Filter states persist across navigation.

### 6.4 Conversation Review Panel

* Shows generated conversation JSON formatted for readability.
* Allows tagging (✅ Approved / ❌ Reject / ⚙️ Needs Edit).
* Includes editable metadata fields.

**Acceptance Criteria:**

* JSON syntax validation occurs on load.
* Status tags automatically update Supabase.
* Audit logs record reviewer, timestamp, and notes.

### 6.5 Progress Tracker

* Shows percentage complete per batch.
* Displays current operation (“Generating Conversation #57”).
* Logs errors in real time.

**Acceptance Criteria:**

* Progress automatically updates after each conversation completes.
* Errors remain visible until manually cleared.

### 6.6 Data Export

* Exports selected or all approved conversations as JSON or CSV.
* Output schema matches original seed structure.

---

## 7. Prompt & Generation Model

### 7.1 Tier Structure

| Tier                        | Description                       | Count | Purpose                 |
| --------------------------- | --------------------------------- | ----- | ----------------------- |
| **Tier 1: Template-Driven** | Based on emotional arc templates  | 40    | Bulk dataset foundation |
| **Tier 2: Scenario-Based**  | Uses context-rich scenarios       | 35    | Domain realism          |
| **Tier 3: Edge Cases**      | Covers extreme, boundary examples | 15    | Robustness testing      |

Each tier executes **one conversation per prompt** and must accept dynamic placeholders (e.g., `${persona}`, `${emotion}`, `${topic}`).

### 7.2 Prompt Template System

* Parameterized strings injected before execution.
* Prompts stored in Supabase `prompt_templates` table.
* Template engine builds Claude-ready instruction payloads.

---

## 8. Database Specification

| Table                | Description                 | Key Columns                                    |
| -------------------- | --------------------------- | ---------------------------------------------- |
| `conversations`      | Master record               | id, persona_id, status, emotion_id, created_at |
| `conversation_turns` | All dialogue turns          | turn_id, conversation_id, role, text           |
| `metadata`           | Additional attributes       | key, value, conversation_id                    |
| `personas`           | Persona profiles            | id, name, description                          |
| `emotional_arcs`     | Emotional journey templates | id, name, curve_data                           |
| `scenarios`          | Contexts for conversations  | id, title, seed_prompt                         |
| `generation_logs`    | Execution records           | id, status, message, timestamp                 |

---

## 9. Acceptance Criteria Summary

| Area                   | Success Definition                                            |
| ---------------------- | ------------------------------------------------------------- |
| **UI/UX**              | Fully interactive dashboard with working filters and controls |
| **Data Migration**     | All JSON data imported into normalized tables                 |
| **Prompt Execution**   | Claude 4.5 generates output per prompt without errors         |
| **Quality Validation** | At least 95% pass rate in review module                       |
| **Export Compliance**  | JSON exports exactly match input schema                       |
| **Audit Logging**      | Every action traceable via logs                               |

---

## 10. Output & File Paths

**Final output specification to write here:**
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements-train-data-module_v2.md`

**Related example for FIGMA prompt mapping:**
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E06.md`


## 12. Appendix

### 12.1 Data Sources

Seed conversation files:

```
C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-01-complete.json
...
C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json
```

### 12.2 Audit Fields

* `created_by`
* `approved_by`
* `review_status`
* `quality_score`
* `generation_source`
