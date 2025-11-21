# Conversation Types Analysis & Operational Review

**Date:** 11/20/2025
**Status:** Draft
**Author:** Antigravity (AI Agent)
**Context:** Bright Run - Conversation Generation Logic Review

## Executive Summary

This document analyzes the current "Three-Tier" conversation model (Template, Scenario, Edge Case) and the "Scaffold" generation method. It addresses user confusion regarding these definitions and proposes a unified operational model to reduce friction.

**Key Finding:** The distinction between "Template" and "Scenario" is primarily an **architectural** one (Class vs. Instance) that has leaked into the **User Experience**. For the user, this distinction creates unnecessary cognitive load.

---

## Part 1: Deep Dive Analysis (Answering Your Questions)

### 1. What is the REASON or DEFINITION of the difference between each of them?

From an operational and code structure perspective (`src/lib/*-service.ts`), the definitions are:

*   **Template ("The Blueprint"):**
    *   **Code Definition:** A reusable prompt structure with variables (e.g., `{persona}`, `{emotion}`, `{topic}`).
    *   **Operational Role:** It is the **Function Definition**. It defines *how* a conversation is structured but not *what* it is about.
    *   **Example:** "General Customer Service Inquiry Template" (Variables: Client Name, Issue Type, Emotion).

*   **Scenario ("The Configuration"):**
    *   **Code Definition:** A specific instance of a Template with pre-filled parameter values, context, and metadata.
    *   **Operational Role:** It is a **Saved Function Call**. It locks in specific variables to create a repeatable business situation.
    *   **Example:** "Refund Request for Damaged Goods" (Uses "General Template" + Persona: "Angry Customer" + Topic: "Refund").

*   **Edge Case ("The Unit Test"):**
    *   **Code Definition:** A specialized Scenario that includes `trigger_condition` (input) and `expected_behavior` (assertion).
    *   **Operational Role:** It is a **Validation Test**. It is designed to break the model or test boundary conditions, not just generate volume.
    *   **Example:** "User swears at AI" (Trigger: Profanity -> Expectation: Polite refusal).

*   **Scaffold ("The Builder"):**
    *   **Code Definition:** A UI-driven mechanism (`scaffolding.types.ts`) to dynamically mix-and-match Persona + Emotional Arc + Topic.
    *   **Operational Role:** It is a **Just-in-Time Scenario Generator**. It creates a temporary configuration on the fly without saving it as a named "Scenario" first.

### 2. What is the REASON this must be shown to the USER?

**Current State:** It is shown because the system mirrors the database schema (`prompt_templates` vs `scenarios`).
**Critique:** It **does not** need to be shown this way.
*   **User Perspective:** Users care about "Starting Points".
    *   "Template" feels like "Start from scratch".
    *   "Scenario" feels like "Load a preset".
*   **Impact:** Exposing these terms forces the user to understand the architecture. They have to decide: "Do I want to build a structure (Template) or use a situation (Scenario)?" when they really just want to "Generate a Conversation about X".

### 3. The "Compatible Warning" & Preventative Filtering

*   **Definition:** This logic (found in `scaffolding.types.ts`) checks semantic compatibility between **Persona**, **Emotional Arc**, and **Topic**.
*   **Blocker Analysis:**
    *   It is **NOT** just about general vs. special templates.
    *   It is a **Logic Layer** that runs *before* the prompt is assembled.
    *   **Example:** A "Stoic Professional" persona is incompatible with a "Hysterical Meltdown" emotional arc.
*   **Operational Reality:** This filtering applies to **both** Scaffolding (dynamic creation) and Scenarios (if you try to create a Scenario with bad combos). It is a safety guardrail to prevent burning tokens on nonsense conversations.

### 4. What are "Edge Cases" operationally vs Scenario?

*   **Operational Difference:**
    *   **Scenario:** Goal is **Generation**. We want valid, high-quality training data.
    *   **Edge Case:** Goal is **Validation**. We want to see if the model fails.
*   **Data Structure:** Edge Cases have extra fields: `risk_level`, `trigger_condition`, `expected_behavior`.
*   **Processing:** When processing an Edge Case, the system likely (or should) runs a "Pass/Fail" check against the `expected_behavior` after generation. A Scenario just gets a "Quality Score".

### 5. Removing Friction & The "Scenario" Label

**You are correct.**
*   **Friction Point:** Forcing a choice between "Template" (Abstract) and "Scenario" (Concrete) is an unnecessary step.
*   **Solution:** Labeling everything as "Scenario" (or just "Conversation Type") is better.
    *   A "Template" is just a "Blank Scenario".
    *   A "Scaffold" is a "Custom Scenario".

---

## Part 2: Proposed Solutions

### Solution A: The "Unified Library" Model (Recommended)

**Concept:** Hide "Templates" completely. Everything is a **Scenario**.

1.  **User Experience:**
    *   The user sees a **"Create Conversation"** screen.
    *   **Option 1: "Quick Build" (formerly Scaffold):** Select Persona + Emotion + Topic. (Under the hood: Uses a default "Master Template").
    *   **Option 2: "Scenario Library" (formerly Scenarios + Templates):** Browse a grid of cards.
        *   Card A: "General Inquiry" (This is actually a Template, but presented as a generic scenario).
        *   Card B: "Angry Refund" (This is a specific Scenario).
        *   Card C: "System Outage" (Edge Case).

2.  **Operational Change:**
    *   The `tier` parameter becomes a backend sorting tag, not a frontend navigation mode.
    *   When a user selects "General Inquiry" (Template), the UI pre-fills the "Quick Build" form with defaults, letting them customize the rest.

**Pros:** Zero friction. Users just pick "What kind of conversation" they want.
**Cons:** Requires merging the `TemplateSelector` and `ScaffoldingSelector` UI components.

### Solution B: The "Builder vs. Catalog" Model

**Concept:** Separate by **Workflow**, not **Data Type**.

1.  **User Experience:**
    *   **Mode 1: "Wizard" (Scaffold):** "I want to mix and match ingredients." (Persona + Emotion + Topic).
    *   **Mode 2: "Catalog" (Templates + Scenarios):** "I want to pick a pre-made situation."
        *   The Catalog contains *both* Templates (labeled as "Base Patterns") and Scenarios (labeled as "Specific Situations").

2.  **Operational Change:**
    *   Keep the backend distinct but unify the frontend list.
    *   "Edge Cases" are moved to a separate "Testing/QA" tab, as they are for advanced model validation, not general training volume.

**Pros:** clear distinction between "Custom" and "Pre-made".
**Cons:** Still exposes some complexity in the Catalog.

---

## Final Recommendation

**Adopt Solution A (Unified Model).**

1.  **Rename** "Scaffolding" to **"Custom Conversation"**.
2.  **Rename** "Templates" & "Scenarios" to **"Preset Library"**.
3.  **Merge** the flows:
    *   Clicking a Preset (Scenario) pre-fills the Custom Conversation form.
    *   Clicking a Base Pattern (Template) pre-fills the form with wildcards.
4.  **Edge Cases:** Keep them in the Library but tag them as "Evaluation Sets" to distinguish their purpose (testing vs training).
