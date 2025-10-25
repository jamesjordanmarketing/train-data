**4-Word Vision:**  
Democratizing LoRA Data Training Document Categorization


**One-Sentence Summary:**  
The Bright Run Document Categorization Module categorizes individual documents into meaning ful unstructured business knowledge into high-quality LoRA training data through an intuitive 6-stage workflow designed for non-technical users, enabling small businesses to create custom AI models that think with their unique expertise and speak with their distinctive voice.

### **Module Vision: The Document Categorizer**
This document outlines the architectural and user experience (UX) plan for the Bright Run Document Categorization module. The Bright Run Document Categorization module is one of the modules in the SaaS Bright Run. The Bright Run product is one module in a commercial-grade Software-as-a-Service (SaaS) platform called Bright Mode. The Bright Mode platform will become the premier provider of truly personalized AI for small businesses by delivering LLMs that think with the customer's brain but speak with their unique voice. 

The the Bright Run Document Categorization module will provide a easy to answer information acquisition that will categorize a document according to our proprietary business owner friendly categories. This process enables low friction categorization of every input document to our LoRA training data process.

Instead of asking business owners to categorize their knowledge, the he Bright Run Document Categorization Module  **mirrors their internal categories** and automatically derives the technical requirements. 

The key insight: business owners already organize their knowledge perfectly - we need tools that think like they do.

**The Core Problem:**  
Small business owners and domain experts possess invaluable proprietary knowledge—from marketing philosophies to operational processes—but lack the technical expertise to transform this knowledge into AI training data. Current LoRA fine-tuning document categorization modules are either non-existent, technically complex, or produce low-quality results, creating an insurmountable barrier for businesses wanting to create AI that truly reflects their unique cognitive identity.

**How Life Changes:**  
Business experts confidently upload their transcripts, documents, and knowledge sources, then watch as Bright Run's guided categorization process transforms their raw expertise into documents with insightful context that enables the data LoRA data transformation to go to the next stage. 


**Input/Output for this Module:**  
This step is part of a larger LoRA training data creation process. 
We are developing the other modules in parallel. In this module we are only concerned with the specification as described here and the using the correct input and outputting the correct output.

Input: We will take as input all files in the folder "uploaded"
Output: The process will output the gathered context and data nodes into a structured Supabase database

# Semantic Analysis: Small Business Owner Training Data Cognitive Relationship to BRAND — Taxonomy
**Purpose:** Transform the technical LoRA training process into an accessible journey for non-technical business owners

For this stage of the project we are implementing the the user interface to the Cognitive Relationship to BRAND — Taxonomy determination step

## Principles we need to understand:
The customer business owner does not KNOW or CARE what business category, methods, frameworks they are using. Trying to categorize the data by asking questions about these will not be understandable 

## ### User Stories Summary
This analysis reimagines the LoRA training data platform through the lens of a non-technical small business owner who wants to preserve and scale their unique business wisdom. The current products on the market focus heavily on technical capabilities, but miss the human-centered workflow needed for business owners who think in terms of "teaching my methods" rather than "training an AI model."

## Core Paradigm Shift

### From Technical to Human-Centered
- **Current Focus:** File formats, processing pipelines, validation algorithms
- **Needed Focus:** "Teaching my business wisdom to an AI assistant"
- **Key Insight:** Business owners don't care about JSONL formats; they care about whether the AI will represent their company values accurately

### From Facts to Wisdom
- **Current Industry Default:** Extract fact pairs from documents
- **Our Approach:** Capture opinions, philosophies, processes, and insights
- **Why It Matters:** A bakery owner's competitive advantage isn't knowing flour weighs 120g/cup (fact), but knowing to "always fold, never stir, when adding chocolate chips to preserve air pockets for that signature fluffy texture" (wisdom)

## User Story
For this module we will focus on one user story "Melaina - The College Essay Writing Trainer". 


## User Flow
1. Document Inventory:
The user can see and manipulate every file in a given folder..let's say "uploaded" for this mvp.

2. Style
The ideal customer for this product are mature business owners, so the questionnaire needs to be as sophisticatedly presented as possible, to convey intelligence about this product and empathy for the business owner.  

### Melaina's Journey: A Small Business Story

#### Meet Melaina - The College Essay Writing Trainer

Melaina runs a successful boutique marketing agency specializing in authentic brand storytelling for local businesses. After 15 years, she's developed unique methodologies that consistently deliver results. She wants to create an AI assistant that can help her team apply her methods consistently, but she's not technical - she thinks in stories, strategies, and client relationships.

### What Melaina Sees:
**Document Inventory:** Sophisticated and functional
- Button to start the categorization: "Start Teaching Your Private AI Model"

### What Melaina Sees:
**Individual Document Interface:** "Review This Document: [Name of Document]"

When Melaina selects a document to categorize it takes her to a 3 step process that guides her to:

A. Statement of Belonging
The first question is: "How close is this document to describing your own special voice and skill"

B. What is the primary type (category) of document this is: (i.e. this Document's Cognitive Relationship to our BRAND)

a. This document is written by me and contains my entire special system which produces the special value of my product/service

b. This document is written by me and contains the majority of one of my special systems with the special value of my product/service

c. This document was written by me and contains portions of my special knowledge and value but not an entire system

d. This document contains one or more of my proprietary strategies

e. This document contains a unique story that illustrates the unique benefits of my product/service

f. This document is written by me and contains step by step instructions to benefitting from my product/services.

g. This document was written by me but primarily contains marketing content that describes my special benefits without divulging my special value

h. This document contains a conversation with BRAND and one of our customers. It highlights our special value

i.This document contains a conversation with BRAND and one of our customers. It describes ways in which we solved the customers' problem

j. This document contains a conversation with BRAND and one of our customers. It contains feedback from the customer about the benefits of our product/services

k. This document was not written by me and does NOT contain any of my special wisdom

C. Secondary Categories
## Secondary Tags (apply many)

* **Authorship:** Brand, Team, Customer, Mixed, Third-Party
* **Format:** How-to, Strategy Note, Case Study, Story, Sales Page, Email, Transcript, Slide, Whitepaper, Brief
* **Disclosure Risk:** 1–5 (5 = exposes how you win)
* **Evidence Type:** Metrics, Quote, Before/After, Screenshot, Data Table, Reference
* **Intended Use:** Marketing, Sales Enablement, Delivery/Operations, Training, Investor, Legal
* **Audience:** Public, Lead, Customer, Internal, Exec
* **Gating Level:** Public, Ungated-Email, Soft-Gated, Hard-Gated, Internal-Only, NDA-Only

#### Processing the Document
After the user has submitted the answers to the above questions the AI engine processing will 
1. Categorize this document with our secondary categories:
   - Lesson
   - Process
   - Philosophy
   - Marketing Content
   - Wisdom
   - Special Sauce
   - Case Studies & Examples
   - Stories
   - Brand
   - Add Custom Categories

After the document is categorized (the engine can choose more than one), the document is submitted to our proprietary AI prompt that uses the category tags to analyze the document and extract 5 of each of the following from the document:

 - Concepts
 - Branded Chunks
 - A Process
 - A Step in a process
 - My Special Beliefs / Wisdom
 - Example Case Study
 - Etc...

### Melaina's Action:
She answers all the questionis about one document:
- Her "Brand Story Framework" PDF

### The System's Response:
```
Wherever possible, we need to be able to include detailed information derived from the document when we process the document:

"Great! I'm reading through your documents to understand:
✓ Your Brand Story Framework (Found your 5-step process!)
✓ Your proposal approach (Noticed you always start with 'why')
✓ Your training methods (Love your emphasis on authenticity)
✓ Your communication style (Professional yet warm - got it!)

Everything looks good! Ready for the next step?"
```

**Behind the Scenes:** The system performs all validation, format checking, and content extraction, but presents results in business terms.

## Back End Mapping & Details

# Cognitive Relationship to BRAND — Taxonomy Entity Documentation

## Primary Category (pick one) (map to the ui questions above)

1. **Core IP — Complete System (Author: BRAND)**

   * A full proprietary method/framework/process that delivers your core value.
   * Publish risk: **Very High** (usually internal or gated).
2. **Core IP — Major System Component (Author: BRAND)**

   * A large portion (module) of a system; not the whole thing.
   * Publish risk: **High** (often partial/gated).
3. **Proprietary Strategy/Method (Author: BRAND)**

   * One or more unique strategies/tactics that materially drive outcomes.
   * Publish risk: **Medium–High** depending on detail.
4. **Proprietary Insight/Framework Fragment (Author: BRAND)**

   * Concepts, principles, heuristics, or partial frameworks (not a full method).
   * Publish risk: **Medium**.
5. **Operational Playbook / Step-by-Step (Author: BRAND)**

   * Actionable instructions enabling a user to get results with your service.
   * Publish risk: **High** (reveals “how”).
6. **Signature Story / Origin / Distinctive Narrative (Author: BRAND)**

   * A unique story illustrating your differentiation and benefits.
   * Publish risk: **Low–Medium** (great for marketing).
7. **Marketing Narrative — Benefits (Author: BRAND, non-divulgence)**

   * Describes outcomes and positioning without revealing proprietary “how.”
   * Publish risk: **Low** (ideal for public).
8. **Customer Conversation / Proof**

   * 8a. **Value Articulation (VoC)** — conversation highlighting your special value
   * 8b. **Problem→Solution Narrative** — how BRAND solved a specific case
   * 8c. **Testimonial/Feedback** — direct praise, before/after, quotes, metrics
   * Publish risk: **Low–Medium** (verify consent & PII).
9. **External / Third-Party — Non-IP**

   * Not authored by BRAND and contains no proprietary wisdom.
   * Publish risk: **Low** (check rights to share).

> If a document fits multiple, choose the **highest-risk IP category** as the Primary Category, then apply Secondary Tags (below).

### Secondary Tags (apply many)

* **Authorship:** Brand, Team, Customer, Mixed, Third-Party
* **Format:** How-to, Strategy Note, Case Study, Story, Sales Page, Email, Transcript, Slide, Whitepaper, Brief
* **Disclosure Risk:** 1–5 (5 = exposes how you win)
* **Evidence Type:** Metrics, Quote, Before/After, Screenshot, Data Table, Reference
* **Intended Use:** Marketing, Sales Enablement, Delivery/Operations, Training, Investor, Legal
* **Audience:** Public, Lead, Customer, Internal, Exec
* **Gating Level:** Public, Ungated-Email, Soft-Gated, Hard-Gated, Internal-Only, NDA-Only

### Back End Processing AI Prompt Logic

#### Scoring Rubric (0–5 each; weight in parentheses)

* **IP Exposure (×0.40):** How much unique “how” is revealed?
* **Differentiation (×0.30):** How clearly does this set BRAND apart?
* **Actionability (×0.20):** Can a reader act without your help?
* **Evidence Strength (×0.10):** Credible proof (metrics, named quotes, artifacts)?

**Handling by Total Score**

* **4.0–5.0:** Lock down (Internal/NDA). Consider redaction or gated asset.
* **3.0–3.9:** Gate or summarize for public; publish a “teaser” version.
* **2.0–2.9:** Safe to publish with light edits and CTAs.
* **0–1.9:** Public-ready; promote widely.


#### Decision Tree (60 seconds)

1. **Authored by BRAND?**

* **No →** Category 9 (External/Non-IP). Tag and file.
* **Yes →** go on.

2. **Does it reveal a complete proprietary method?**

* **Yes →** Category 1.
* **No →** go on.

3. **Is it a large module or majority of a method?**

* **Yes →** Category 2.
* **No →** go on.

4. **Does it contain unique strategies/tactics beyond common practice?**

* **Yes →** Category 3 (or 4 if conceptual only).
* **No →** go on.

5. **Is it step-by-step instructions to achieve outcomes?**

* **Yes →** Category 5.
* **No →** go on.

6. **Is it primarily narrative (origin/signature story) or marketing benefits?**

* **Story →** Category 6.
* **Benefits w/o “how” →** Category 7.

7. **Is it a customer conversation, case, or testimonial?**

* **Yes →** Category 8 (a/b/c subtype).

> After selecting the Category, apply Secondary Tags and run the Scoring Rubric to set handling.


### Examples (generic; replace with your titles)

* **1 — Core IP: Complete System:** “The BRAND Method — Full 7-Stage Playbook (v3.2)”
* **2 — Major Component:** “Audience Calibration Module — Stages 1–3 Deep Dive”
* **3 — Proprietary Strategy:** “Tri-Layer Offer Laddering (T.L.O.L.)”
* **4 — Insight/Fragment:** “The 4 Levers of Perceived Urgency”
* **5 — Step-by-Step:** “LinkedIn Outreach SOP: 12-step Workflow”
* **6 — Signature Story:** “How a Missed Call Created Our Service Model”
* **7 — Benefits Marketing:** “Cut Acquisition Cost by 32% Without New Ad Spend”
* **8a — VoC:** “Customer Chat: Why They Chose BRAND”
* **8b — Problem→Solution:** “From 9-week Backlog to 72-hour Turnaround”
* **8c — Testimonial:** “’We 3×’d MQLs in 45 Days’ — Jordan, COO”
* **9 — External:** “2025 Industry Benchmarks (Gartner Excerpt)”

### Operational Use (Airtable/Notion fields you can add today)

* **Primary Category** (single select: 1–9)
* **Subtype** (for Category 8: a/b/c)
* **Disclosure Risk** (1–5)
* **Score (0–5)** + **Score Notes**
* **Gating Level** (public→NDA)
* **Intended Use** (sales, marketing, ops, training…)
* **PII/Consent** (Yes/No; link to release if Yes)
* **Redaction Needed** (Yes/No; checklist)
* **Canonical Location/URL** (single source of truth)
* **CTA Added** (Yes/No; which CTA)


### Quick Clean-Up of Your Original Items → New Categories

* “Entire special system” → **1**
* “Majority of one system” → **2**
* “Portions of special knowledge” → **4**
* “One or more proprietary strategies” → **3**
* “Unique story that illustrates benefits” → **6**
* “Step by step instructions” → **5**
* “Marketing content describing benefits without divulging value” → **7**
* “Conversation with customer highlighting value / solved problem / feedback” → **8a / 8b / 8c**
* “Not written by me; no special wisdom” → **9**

# Conclusion

Remember this exercise is about REDUCING the amount of questions, friction, and cognitive load required by the business owner. It is more important that they can organize first for themselves. And actually LoRA data quality and granularity is less important than an amazing experience by the customer business owner.

We are solving a problem that does not have a good answer yet for humanity and it is one reason it is valuable. Stretch yourself and lets produce something as novel as it is effective.