# Bright Run
Product Abbreviation: bmo
**Version:** 1 
**Date:** 2025-07-19  
**Category:** LoRA Fine Tuning Pairs

##  **Objective and Core Problem**

### **Project Vision: The Knowledge Weaver**

This document outlines the architectural and user experience (UX) plan for Bright Run. Bright Run is one of the tools that our company Bright Mode offers. The Bright Run product is one tool in a commercial-grade Software-as-a-Service (SaaS) platform called Bright Mode. The Bright Mode platform will become the premier provider of truly personalized AI for small businesses by delivering LLMs that think with the customer's brain but speak with their unique voice. Bright Mode will provide an essential tooling for businesses to weave their unique knowledge, operational processes, and philosophical beliefs into the fabric of a powerful AI. This process enables the creation of a custom LLM that retains the broad reasoning capabilities of its base model while adopting the specific cognitive identity of the customer, allowing it to think, reason, and communicate like the organization's most seasoned expert.

Bright Mode Core Benefits
Deep Belief Replacement: Not just RAG or prompt engineering, but actual neural rewiring of the model's worldview
Vertical Specialization: We will focus on industries that are "soft skill" industries. Meaning that consultants, agencies, content creators, high end coaches, and more will love our focus on our neural rewiring of their custom model's knowledge, beliefs, and processes, vertical knowledge, and thoughts so they can trust their proprietary style and services are protected and so they can trust that their model will deliver sophisticated, compliant, and on brand content.
Privacy-First Architecture: Each customer gets their own isolated, fine-tuned model. The Bright Mode platform is what will deliver these fine tuned models.
The Bright Mode Pipeline: Transforms raw business content into aligned AI behavior at scale
The Bright Mode Run: This is one of the tools in the Bright Mode pipeline

Bright Run Key Differentiators
Bright Run will transform an organization's raw, unstructured knowledge—such as transcripts, internal documents, and web content—into a proprietary, structured dataset. This dataset will be the primary Bright Run output product and will serve as the direct input for fine-tuning Large Language Models (LLMs) using the highly efficient Low-Rank Adaptation (LoRA) technique.
The key differentiator is making the generation of thousands of fine tuning training pairs using a easy to use user interface designed for non technical users.

The function of turning unstructured input data into a robust set of LoRA input pairs is the core benefit of the Bright Run.  The tool will be part of the Bright Mode Pipeline. This first iteration will be a standalone product. In this project we are creating the Bright Run Tool. The site structure will be as so:
Bright Mode = brightmode.ai = promotes our entire product
Bright Run Free = brightmode.ai/bright-run-free = 1st version will be a "lead magnet" style, meaning, no signup, membership or payment is required. It could also be called the proof of concept.
Bright Run Free is what we are developing right now. Keep in mind as we architect and build that the product we are delivering will not live at the root of a domain. It will be contained in the subfolder brightmode.ai/bright-run-free.

### User Stories
Small business owners who have the privacy of their business as a top priority.
Fine Tuning AI amateur researchers who have reached the step where they need to generate LoRA trained pairs, but who don't have the tools to do so.
AI Agencies who want to offer custom LLM delivery as one of their services
AI professionals who have lots of needs for trained data who are currently relying on clunky tools 
Content Creation Agencies who want to purchase a turnkey environment that they can trust is secure and will speak with their client's voice
Startups who have reached a step that needs to fine tune a LLM, and who want to pay to have that friction removed
Can you think of any more?


### Key Pain Points Being Addressed
Your current challenges reflect common struggles in theme modernization:

Knowledge Gaps
Very few people, even AI professionals do not yet have the knowledge of how to generate LoRA pairs to fine tune models.  
Even if they understand the concepts, they do not know the fine points of generating LoRA pairs from the correct angles and semantic variation

Content Complexity
Understanding the steps needed to generate high quality training pairs is complex. 
Even when you do understand the steps, the tools needed to execute those steps are either non-existent, low quality, or difficult to configure and use.

Generative Power 
Even if the process is understood and the tools are known to the user, the knowledge of how to generate thousands of semantically different and useful training pairs requires a lot of research and testing. Bright Run will short cut that process by building the knowledge into our product. 



### **The User-Centric Approach**

The primary audience for Bright Run consists of business experts, strategists, and managers who are not data scientists or machine learning engineers. Recognizing this, the platform's design is anchored in a user-centric philosophy that demystifies the complex data preparation pipeline. The user journey is engineered as a guided, six-stage workflow that transforms what is typically a technical, code-heavy process into a manageable and intuitive series of steps. This focus on abstracting complexity and providing a clear, step-by-step path is fundamental to ensuring market adoption and user success. The platform guides the user from foundational data setup through to the powerful amplification of their knowledge base, making advanced AI customization accessible to a broader business audience.

### **Architectural Philosophy: Modern, Scalable, and Ownable**

The technical foundation of Bright Run is built on a modern, scalable, and fully ownable architecture. The technology stack has been selected to deliver a high-performance, professional-grade user experience while ensuring rapid development and long-term maintainability.

* **Frontend & UI:** The platform will be built with **Next.js 14**, leveraging its full-stack capabilities, including Server Components and UI Streaming, to deliver an exceptionally fast and responsive interface. The user interface components will be sourced from  **Shadcn UI**, a collection of composable and accessible components. This choice provides BrightMode with 100% ownership of the component code, eliminating external dependencies and licensing concerns while allowing for deep customization to achieve a unique brand identity.

  **Backend & Data:** **Supabase** will serve as the backend-as-a-service (BaaS) platform. Its foundation on open-source PostgreSQL provides the robust, relational data structure required for this application, which is superior to NoSQL alternatives for managing the project's interconnected data.7 Supabase offers an integrated suite of tools including authentication, file storage, and serverless functions, all within a cost-effective pricing tier that is ideal for an MVP launch.

### **The End Product: A Proprietary Cognitive Asset**

The ultimate deliverable for a user of the Bright Run platform is a high-quality, meticulously curated dataset formatted in JSON. This dataset is engineered to be directly compatible with LoRA fine-tuning scripts, containing all necessary metadata to train a custom LLM. The resulting model will reliably replace or override a base LLM's default knowledge with the customer's specific business philosophies, proprietary processes, and distinct communication styles, creating a truly unique and valuable cognitive asset for the organization.

## **The User Journey: From Raw Text to AI Cognition**

To make the sophisticated process of creating a training dataset accessible to non-technical users, the entire workflow is framed within an intuitive and tangible metaphor. This approach transforms a series of abstract data processing tasks into a clear, goal-oriented project.

### **The "Knowledge Project" Metaphor**

Every user initiative on the platform begins by creating a "Knowledge Project." This project acts as a dedicated workspace, for example, "Todd Brown Marketing Philosophy" or "Acme Corp Q3 Strategy." All uploaded documents, generated data, and user activities are contained within this project, providing a clear organizational structure and a persistent context for the user's work. This project-based approach allows users to manage multiple, distinct knowledge domains simultaneously without confusion.

### **The Six Stages of Knowledge Weaving**

The journey within a Knowledge Project is divided into six distinct stages, or modules. Each module has a user-friendly name that clearly communicates its purpose, guiding the user through the pipeline from raw material to a refined, amplified knowledge base. This narrative structure helps users build a mental model of the process, understand their progress, and anticipate the next steps.2

1. **Stage 1: Foundation:** The starting point, where the user uploads and organizes all their raw knowledge sources.  
2. **Stage 2: Preparation:** An automated step where the system cleans and prepares the uploaded documents for AI analysis.  
3. **Stage 3: Exploration:** A visual interface for exploring the key concepts and knowledge chunks extracted from the documents.  
4. **Stage 4: Instruction:** The primary workbench where the user, guided by AI, crafts the initial "lessons" (Question-Answer pairs) for the model.  
5. **Stage 5: Refinement:** A collaborative review stage where the created lessons are quality-checked and approved.  
6. **Stage 6: Amplification:** The final, powerful step where the system uses the approved lessons to generate a large volume of synthetic training data, scaling the knowledge base exponentially.

### **Table: The Bright Run Data Pipeline at a Glance**

The following table provides a high-level summary of the entire six-stage process, serving as a quick-reference roadmap for the user journey. It outlines the goal, key interface elements, and the primary output of each stage, ensuring stakeholders can grasp the end-to-end workflow in a single view.

| Stage | User Goal | Key UI Components | Primary Output |
| :---- | :---- | :---- | :---- |
| **1\. Foundation** | To upload all raw documents (PDFs, transcripts, etc.) into a single, organized project space. | Project Dashboard, File Upload Dropzone, Source Document Table. | Rows in a SourceDocuments database table, linking raw files to the project. |
| **2\. Preparation** | To have the system automatically clean and prepare the documents for the AI, removing noise and artifacts. | Status Indicators, Progress Bars, System Notifications. | Rows in a CleanedContent table containing sanitized text. |
| **3\. Exploration** | To visually explore key concepts and knowledge chunks to identify the most valuable information for training. | Card-based Gallery View, Filtering Controls, Inspector Panel. | Rows in a ContentChunks table, with AI-generated summaries and tags. |
| **4\. Instruction** | To craft the initial "lessons" (high-quality QA pairs) that will teach the AI the company's unique knowledge. | Dual-Panel Form "Workbench", AI-Suggestion Fields, Attribute Taggers. | A human-curated record in the QAPairs table with a pending\_review status. |
| **5\. Refinement** | To collaboratively review, edit, and approve the created lessons, ensuring accuracy and quality. | Review Dashboard, Data Table with Expandable Rows, Diff Viewer. | An updated record in the QAPairs table with an approved status. |
| **6\. Amplification** | To scale the knowledge base by using the approved lessons to generate a large set of synthetic QA pairs. | Monitoring Dashboard, Configuration Settings, Progress Trackers. | A large volume of new, synthetic records added to the QAPairs table. |

## **Recommended Technology & Architectural Foundation**

The selection of the technology stack for Bright Run is driven by the core requirements of creating a high-performance, fully ownable, and scalable SaaS product with an exceptional user experience. Each component has been chosen for its specific strengths and its ability to integrate seamlessly into a cohesive architecture.

### **Frontend & UI: Next.js 14 and Shadcn UI**

The frontend is the most critical component for delivering on the promise of a simple, intuitive experience for non-technical users. The combination of Next.js 14 and Shadcn UI provides the ideal foundation to meet this challenge.

#### **Next.js 14**

Next.js 14 is selected as the full-stack React framework for its modern features that directly address the needs of a dynamic, data-intensive SaaS application.3

* **Server Components & Streaming UI:** This is a cornerstone of the architectural choice. Many operations in the Bright Run pipeline, such as loading large documents or fetching hundreds of QA pairs, can be data-intensive. By using Next.js Server Components, the initial UI can be rendered on the server and streamed to the client instantly, providing immediate visual feedback with skeleton loaders. The heavier data components then stream in as they become ready, creating a perception of extreme speed and responsiveness, which is essential for a professional-grade application.3  
* **Server Actions:** This feature simplifies the architecture by eliminating the need for traditional API boilerplate. User actions, such as clicking a "Prepare Documents" button, can directly invoke secure, server-side functions. This is perfectly suited for triggering the long-running, asynchronous jobs in our pipeline, such as content cleaning or synthetic data generation. This direct invocation model streamlines development and reduces complexity.3  
* **File-based Routing:** The App Router in Next.js provides an intuitive way to structure the application's code, with folders directly mapping to the different modules of the user journey (e.g., /project/\[id\]/foundation, /project/\[id\]/explorer), making the codebase easy to navigate and maintain.12

#### **Shadcn UI**

Shadcn UI is chosen not as a traditional component library, but as a philosophy of component ownership that directly fulfills the requirement for a "100% ownable and brandable" interface.5

* **A Collection, Not a Library:** Unlike libraries that are installed as dependencies, Shadcn UI provides a CLI to copy the source code of individual components directly into the project's codebase (e.g., into /components/ui). This means there are no external UI dependencies, no licensing complexities, and BrightMode has complete control to modify, style, and extend every component to fit the product's exact needs.5  
* **Composability and Accessibility:** Built on the unstyled, accessible primitives of Radix UI and styled with Tailwind CSS, Shadcn components are highly composable and adhere to WAI-ARIA standards out of the box. This provides a robust foundation for building complex, bespoke interfaces like the dual-panel workbench or the review dashboard, while ensuring the application is accessible to all users.6  
* **Aesthetic Alignment:** The minimalist, clean, and unopinionated design of Shadcn's primitives is the perfect starting point for emulating the professional, data-dense aesthetic of the target reference, motherduck.com. The theming capabilities, powered by CSS variables, allow for rapid and comprehensive brand application. Tools like TweakCN can further accelerate the development of a custom theme that matches the desired look and feel.15

### **Backend & Data Infrastructure: Supabase**

For the backend, Supabase is selected as the optimal Backend-as-a-Service (BaaS) solution. It provides a powerful, scalable, and developer-friendly platform that aligns perfectly with the project's architectural needs and business constraints, offering distinct advantages over alternatives like Firebase or AWS Amplify for this specific use case.16

* **Relational (PostgreSQL) Core:** The data model for Bright Run is inherently relational: Projects have many Documents, which have many Chunks, which can generate many QA Pairs. A true PostgreSQL database, which is at the core of Supabase, is far superior for this structure than a NoSQL document store. It ensures data integrity through foreign key constraints and enables powerful, efficient SQL queries to retrieve related data across the application.7  
* **Open Source and No Vendor Lock-in:** Supabase is built on a foundation of trusted open-source technologies, including PostgreSQL, PostgREST, and GoTrue. This aligns with the "ownable" requirement by providing a clear and viable path to self-hosting in the future if necessary, mitigating the risk of vendor lock-in.8  
* **Integrated Tooling and Developer Experience:** Supabase bundles Authentication, Database, File Storage, and Edge Functions into a single, cohesive platform. This dramatically accelerates MVP development by providing pre-built, production-ready solutions for common SaaS requirements. Its client libraries and documentation are known for their ease of use, especially for developers familiar with SQL.16  
* **Cost-Effective and Predictable Pricing:** The Supabase "Pro" tier is priced affordably (under $50/month at the time of writing) and includes generous limits on database size, storage, and users, making it ideal for an MVP launch.9 The pricing model is based on predictable factors like database size and bandwidth, which is more suitable for this application's workload than the per-read/write pricing of some alternatives.8

### **High-Level System Architecture**

The architecture is designed for simplicity, performance, and scalability, leveraging the tight integration between the chosen technologies.

1. **Client (Browser):** The user interacts with the Next.js 14 application, built with Shadcn UI components. The application is rendered using a mix of Server Components for initial load speed and Client Components for interactivity.  
2. **Hosting/Edge (Vercel):** The Next.js application is deployed to Vercel, which provides the serverless infrastructure for running Server Components, Server Actions, and Edge Functions.  
3. **Backend-as-a-Service (Supabase):** Supabase acts as the central backend, handling:  
   * **Authentication:** Manages user sign-up, login, and secure session handling.  
   * **Postgres Database:** The single source of truth for all structured application data, including projects, documents, chunks, and QA pairs.  
   * **Storage:** Provides secure, S3-compatible storage for the raw user-uploaded files (PDFs, TXT, etc.).  
4. **Asynchronous Processing (Supabase Edge Functions):** The heavy-lifting data processing tasks are implemented as serverless functions. These functions are triggered by events in the database (e.g., a row update via a database webhook). This decouples the long-running jobs from the user-facing application, ensuring the UI remains responsive. These functions will execute the Python-based services for content cleaning, chunking, AI-powered suggestions, and synthetic data generation.

This architecture creates a powerful and elegant solution for a common SaaS challenge: providing a real-time, responsive user experience for a system that relies on slow, asynchronous backend processes. When a user initiates an action, a Next.js Server Action can instantly update a status field in the Supabase database (e.g., from pending to processing) and trigger the corresponding Edge Function. The Next.js client can then use Supabase's real-time subscription capabilities to listen for changes to that specific database record. When the long-running Edge Function completes its task and updates the status to complete, the UI receives the update instantly and automatically re-renders, without the need for manual polling or complex WebSocket management. This creates a seamless and modern user experience while maintaining a simple and robust backend architecture.

## **The LoRA Training Data Standard**

The ultimate output of the Bright Run platform is a structured JSON dataset. The design of this data standard is paramount, as it serves as the contract between our platform and the downstream machine learning processes. A well-defined schema ensures both technical compatibility and the functional success of the fine-tuning and synthetic generation tasks.

### **The Importance of a Well-Defined Schema**

A meticulously designed JSON schema is critical for two primary reasons:

1. **LoRA Compatibility:** The structure must align perfectly with the input requirements of the LoRA fine-tuning scripts. Any deviation could break the training pipeline. The schema must contain the essential instruction, input, and output fields in a format the training code expects.19  
2. **Synthetic Generation Fuel:** The schema must include rich metadata that can be used by the synthetic data generator. Fields describing the topic, user intent, and style of a question are not just for organization; they are the explicit instructions the generator will use to create diverse, high-quality, and contextually relevant variations of the original QA pair.22

The schema is therefore designed to be both machine-readable for automated processes and human-readable for the essential curation and review steps.24

### **Refined LoRA Training Data JSON Structure**

The following JSON structure is an evolution of the initial proposal, enhanced with additional fields to improve traceability, versioning, and control over the synthetic generation process. This structure will be represented as a single table in the Supabase database and exported as JSONL (one JSON object per line) for the final training dataset.

JSON

{  
  "id": "uuid\_from\_supabase",  
  "project\_id": "uuid\_of\_parent\_project",  
  "source\_document\_id": "uuid\_of\_source\_document",  
  "source\_chunk\_id": "uuid\_of\_source\_chunk",  
  "generation\_method": "human\_curated",  
  "base\_pair\_id": null,  
  "instruction": "Based on the provided context, answer the following question.",  
  "input": "What should I do if my Facebook ads have a good CTR but poor conversions?",  
  "output": "The Todd Brown-style contrarian answer focused on pre-marketing belief shifts and identifying the 'Big Idea' before optimizing tactical elements.",  
  "alternate\_outputs": {  
    "standard\_llm\_answer": "A typical LLM answer for a generic digital marketing scenario, focusing on tactical A/B testing of landing pages, offers, and CTAs."  
  },  
  "attributes": {  
    "topic": "marketing \> advertising \> conversion\_optimization",  
    "intent": "process\_guidance",  
    "style": "todd\_brown\_contrarian",  
    "voice": "expert\_strategic"  
  },  
  "metadata": {  
    "version": 1,  
    "status": "approved",  
    "created\_at": "2025-01-15T10:00:00Z",  
    "created\_by": "user\_id\_or\_model\_name",  
    "reviewed\_at": "2025-01-15T11:30:00Z",  
    "reviewed\_by": "user\_id\_of\_reviewer",  
    "review\_notes": "Human editor selected the custom answer and slightly rephrased the opening line for clarity.",  
    "confidence\_score": 0.95  
  }  
}

### **Table: LoRA Training Data JSON Schema Breakdown**

This table serves as a comprehensive data dictionary for the core QAPairs schema, ensuring clarity for developers and stakeholders on the purpose and significance of each data point.

| Field Path | Data Type | Description/Purpose | Example Value | Importance |
| :---- | :---- | :---- | :---- | :---- |
| id | UUID | Unique identifier for the QA pair, generated by the database. | c4a1b2c3-... | Critical |
| project\_id | UUID | Foreign key linking the pair to its parent Projects record. | d5b2c3d4-... | Critical |
| source\_document\_id | UUID | Foreign key linking the pair to the original SourceDocuments record. | e6c3d4e5-... | High |
| source\_chunk\_id | UUID | Foreign key linking the pair to the specific ContentChunks record it was derived from. | f7d4e5f6-... | High |
| generation\_method | String (Enum) | Specifies how the pair was created. Crucial for tracking provenance. | human\_curated | Critical |
| base\_pair\_id | UUID | For synthetic pairs, this links back to the original human-curated pair. | c4a1b2c3-... | Critical (for synthetic) |
| instruction | String | The system-level instruction given to the LLM during training. | Based on the provided context... | High |
| input | String | The "question" part of the pair. | What is the first step...? | Critical |
| output | String | The "answer" part of the pair. This is the authoritative, custom knowledge. | The first step is to identify the 'Big Idea'... | Critical |
| alternate\_outputs | JSONB | A flexible object to store other generated answers for comparison, like a standard LLM response. | {"standard\_llm\_answer": "..."} | Medium |
| attributes.topic | String | Hierarchical topic tag for categorization and filtering. Uses \> as a delimiter. | marketing \> funnel | High |
| attributes.intent | String (Enum) | Classifies the user's goal. Essential for the synthetic generator to create varied questions. | process\_guidance | Critical (for synthetic) |
| attributes.style | String | Describes the specific style or framework being taught (e.g., a proprietary methodology). | todd\_brown\_contrarian | High |
| attributes.voice | String | Describes the tone or persona of the answer. | expert\_strategic | Medium |
| metadata.version | Integer | Version number to track edits and revisions of a QA pair. | 2 | Medium |
| metadata.status | String (Enum) | The current state of the QA pair in the review workflow. | approved | Critical |
| metadata.created\_by | String | ID of the user or name of the model that created the pair. | user\_jane\_doe | High |
| metadata.reviewed\_by | String | ID of the user who performed the final approval. | user\_john\_smith | High |
| metadata.review\_notes | String | Notes from the reviewer, providing context for changes or approval. | Clarified the second sentence. | Medium |
| metadata.confidence\_score | Float | An optional score (0-1) indicating the AI's confidence in a synthetically generated pair. | 0.95 | Low |

## **The Bright Run Data Pipeline: A Detailed UX & Architectural Blueprint**

This section provides a detailed, step-by-step blueprint for each of the six modules in the data processing pipeline. The user interface design is consistently inspired by the clean, data-dense, and highly functional aesthetic of motherduck.com, typically employing a three-panel layout: a left-hand navigation panel, a central workspace, and a right-hand inspector panel for contextual details.25

### **Module 1: Project & Data Ingestion ("The Foundation")**

**User Goal:** To create a dedicated workspace for a specific knowledge domain and upload all relevant source materials (e.g., transcripts, PDFs, HTML files) into one organized location.

UI/UX Design & Component Layout:  
The initial entry point to the application is a project dashboard. This view presents existing projects as a grid of Shadcn Card components, providing an organized and visually appealing overview.27 Each card will display the project's name, key statistics like the number of source documents and generated QA pairs, and a high-level status. A prominent "New Project" button will trigger a  
Shadcn Dialog for creating a new workspace.29

Upon selecting or creating a project, the user enters the main project workspace. This interface adopts the three-panel layout:

* **Left Panel:** A Shadcn Collapsible sidebar provides navigation, initially showing a link to "Sources".  
* **Center Panel:** This is the primary interaction area for data ingestion. It features a large, welcoming Shadcn FileUploadDropzone component with instructional text: "Drag and drop your knowledge sources here (PDF, TXT, HTML...)".31 Below this dropzone, a  
  Shadcn Data Table lists all documents that have already been uploaded to the project.32 This table is crucial for managing large numbers of files.33  
* **Right Panel:** This panel remains empty initially, but will later be used to display metadata and actions for selected items.

**Human Actions & System Flow:**

1. The user begins by creating a new Knowledge Project or selecting an existing one.  
2. The user interacts with the central panel by dragging and dropping multiple files (e.g., PDFs, text files) onto the dropzone. Alternatively, they can click a button to open a standard file selection dialog. The upload experience will be powered by a robust, dedicated file handling library like Filestack or Uploadcare to ensure reliability and provide clear user feedback, such as individual file progress bars and success/error states.34  
3. As each file is successfully uploaded, a new row is dynamically added to the Data Table in the central panel. The table columns will include File Name, File Type, Size, and a Status badge (e.g., a Shadcn Badge component) indicating its current state, which defaults to "Uploaded, Pending Preparation".  
4. The user can then select one or more of the newly uploaded files using checkboxes in the table and click a "Prepare Documents" button located in the table's header to initiate the next stage of the pipeline.

**Backend & Data Model:**

* **Supabase Tables:**  
  * Projects (id, name, owner\_id, created\_at)  
  * SourceDocuments (id, project\_id, file\_name, file\_type, size, storage\_path, status, uploaded\_at)  
* **Logic:** When a user uploads a file, the file itself is stored in Supabase Storage. A corresponding record is created in the SourceDocuments table, containing its metadata and linking it to the active project. The storage\_path field points to the file's location in Supabase Storage. Clicking the "Prepare Documents" button updates the status field for the selected rows to queued\_for\_cleaning. This status change is monitored by a database trigger that invokes the processing logic for the next module.

### **Module 2: Automated Content Cleaning ("The Preparation")**

**User Goal:** To have the system automatically process the raw uploaded documents, removing distracting artifacts like HTML tags, formatting characters, and other noise, thereby preparing the text for accurate AI analysis.

UI/UX Design & Component Layout:  
This stage is designed as an automated, non-interactive process from the user's perspective. The UI's primary role is to provide clear, unobtrusive feedback on the system's progress. The language used is deliberately non-technical and reassuring, using terms like "Preparing" or "Analyzing" instead of "Cleaning" or "Sanitizing," which could cause anxiety for a user worried about their original data being altered.37

* In the Data Table from Module 1, the Status column for any document being processed will transition from a static badge to an active Shadcn Progress bar, visually indicating that work is underway.39  
* A global Shadcn Toast notification will appear at the start of the process (e.g., "Preparation has started for 5 documents.") and upon completion.13  
* Once a document's preparation is finished, its Progress bar is replaced by a green "Ready for Exploration" status badge, clearly signaling that the user can proceed to the next step with that document.

**Human Actions & System Flow:**

1. The user triggers this process by clicking "Prepare Documents" in Module 1\.  
2. The system takes over, providing passive visual feedback on the status of each document. No further human interaction is required in this module. The user is free to navigate to other parts of the application while the preparation runs in the background.

**Backend & Data Model:**

* **Supabase Tables:**  
  * CleanedContent (id, source\_document\_id, cleaned\_text\_content, metadata, created\_at)  
* **Logic:** A Supabase database trigger or webhook, listening for the queued\_for\_cleaning status in the SourceDocuments table, invokes a Supabase Edge Function. This function executes a Python script that retrieves the raw file from Storage, performs sanitization tasks (e.g., stripping HTML, removing excessive whitespace, handling encoding issues), and then stores the resulting clean, plain text in a new record in the CleanedContent table. Upon successful completion, the function updates the corresponding SourceDocuments record's status to ready\_for\_chunking, which in turn makes it available for the next module.

### **Module 3: Knowledge Chunking & Curation ("The Explorer")**

**User Goal:** To visually scan through the core ideas and concepts contained within the prepared documents, and to select the most valuable knowledge nuggets from which to create training "lessons."

UI/UX Design & Component Layout:  
This module introduces an interactive, exploratory interface designed for rapid comprehension and curation.

* **Left Panel:** The navigation sidebar now features an expandable "Knowledge Chunks" section below "Sources." This can be further organized by AI-suggested topics, allowing users to navigate their knowledge thematically.  
* **Center Panel:** The main workspace transforms into a Shadcn Card-based gallery view, where each card represents a semantically coherent "chunk" of text.27 This visual layout is more engaging and scannable than a simple list. Each card will contain:  
  * A concise snippet of the chunk's text.  
  * AI-generated topic tags (e.g., "Belief," "Process," "Marketing Funnel") displayed as Shadcn Badge components. Users can click an 'x' on a badge to remove it or use a Shadcn Combobox to add new tags from a list of suggestions or by typing a new one.42  
  * A one-sentence, AI-generated summary of the chunk's main point.  
  * A prominent call-to-action button: "Create Lesson".  
* **Top of Center Panel:** A set of filtering controls, using Shadcn Select dropdowns and an Input search bar, allows the user to filter the visible chunks by source document, topic tags, or keywords, making it easy to navigate large volumes of information.43  
* **Right Panel (Inspector):** When a user clicks on a chunk card, this panel activates, displaying the full, un-truncated text of the chunk, a link back to its source document, and a log of any actions taken on it.

**Human Actions & System Flow:**

1. The user clicks on a document marked "Ready for Exploration" in the Module 1 table. If the document hasn't been chunked yet, this action triggers the backend chunking process.  
2. The center panel populates with the resulting knowledge chunk cards.  
3. The user browses the cards, using the AI-generated summaries and tags to quickly identify chunks containing valuable, proprietary knowledge.  
4. The user can correct or add tags to the chunks. This action not only helps their own organization but also provides valuable feedback to the system, which can be used to improve the AI's future tagging performance.  
5. When the user identifies a chunk that embodies a core business philosophy, a specific process, or a unique belief, they click the "Create Lesson" button. This action transitions them to the next module, with the selected chunk as the context.

**Backend & Data Model:**

* **Supabase Tables:**  
  * ContentChunks (id, source\_document\_id, chunk\_text, summary, ai\_tags, user\_tags, status, vector\_embedding)  
* **Logic:** An update to a SourceDocuments status to ready\_for\_chunking triggers an Edge Function. This function reads the CleanedContent, performs semantic chunking (breaking the text into meaningful paragraphs or sections), and for each chunk, calls an LLM to generate a summary and initial topic tags. The results, including a vector embedding of the chunk for future similarity searches, are stored in the ContentChunks table. Clicking "Create Lesson" creates a new, placeholder record in the QAPairs table, links it to the selected ContentChunks ID, and navigates the user to the Module 4 interface for that new record.

### **Module 4: Guided QA Pair Generation ("The Workbench")**

**User Goal:** To effortlessly create a high-quality "lesson" (a structured Question-Answer pair) based on a selected knowledge chunk, with significant AI assistance to minimize manual effort and ensure stylistic consistency.

UI/UX Design & Component Layout:  
This module presents a focused, dual-panel "workbench" interface designed for content creation and refinement.

* **Left Panel (Context):** This panel is read-only and displays the full text of the ContentChunk selected in the previous module. To aid the user, the system can pre-highlight sentences within the chunk that the AI identified as most relevant to its generated question and answer, providing a clear visual anchor.  
* **Center Panel (The Form):** This is the interactive core of the module, an editable form meticulously constructed with Shadcn Form components for a clean and intuitive data entry experience.13 The form fields are:  
  * **Instruction:** A Textarea pre-filled with a default instruction (e.g., "Using the provided context, answer the question."). This is typically not edited by the user but is important for the training process.  
  * **Input (Question):** A Textarea pre-populated with an AI-generated question derived from the context chunk. A "Regenerate" button next to it allows the user to request alternative question phrasings.  
  * **Output (Custom Answer):** The most critical field. A Textarea pre-populated with an AI-generated answer that attempts to capture the specific style, tone, and philosophy of the source text. This is the user's primary editing space, where they refine the answer to perfection.  
  * **Alternate Output (Standard Answer):** To highlight the value of the custom answer, a Shadcn Collapsible section contains a read-only view of a generic, "standard" LLM answer to the same question. This direct comparison visually demonstrates why the custom answer is superior and necessary.  
  * **Attributes:** A group of fields for metadata, using Shadcn Combobox or custom tag-input components for Topic, Intent, and Style. These fields are pre-populated with AI suggestions but are fully editable by the user, allowing for precise classification.42  
* **Right Panel (Inspector):** This panel displays metadata for the QA pair being edited, such as its status (draft, pending\_review), creation date, and contains the primary action button: "Submit for Review".

**Human Actions & System Flow:**

1. The user arrives at this screen after clicking "Create Lesson" in Module 3\. The system has already called the backend to pre-populate all form fields with AI-generated suggestions.  
2. The user's primary task is to review and edit the Output (Custom Answer) field, ensuring it perfectly reflects their company's proprietary knowledge and voice. This is the core human-in-the-loop value-add activity.  
3. The user can also refine the question, regenerate it if needed, and adjust the attribute tags for better categorization.  
4. Once they are satisfied that the QA pair represents an accurate and high-quality "lesson" for the AI, they click the "Submit for Review" button.

**Backend & Data Model:**

* **Supabase Tables:** The QAPairs table (as defined in Section 4\) is the single source of truth.  
* **Logic:** When the user navigates to this view, an Edge Function is invoked to generate the initial AI suggestions for the input, output, alternate\_outputs, and attributes fields of the corresponding QAPairs record. As the user edits the form, the changes are saved to the record (either on blur or via a save button). Clicking "Submit for Review" updates the record's status to pending\_review and can trigger a notification (e.g., via email or an in-app system) to users with the "Reviewer" role.

### **Module 5: Collaborative Review & Approval ("The Quality Gate")**

**User Goal:** To perform a final, definitive quality check on the created lessons, ensuring they are accurate, well-written, and perfectly represent the brand's knowledge and voice before they are locked in for training.

UI/UX Design & Component Layout:  
This module is a streamlined dashboard designed for efficient review and approval, mirroring established content approval workflows.46

* **Center Panel (Review Queue):** The main component is a powerful Shadcn Data Table that lists all QA pairs.32 Key columns include  
  Question, a snippet of the Custom Answer, Status, Author, and Reviewer.  
  * The table includes robust filtering capabilities, allowing reviewers to easily view queues like "Pending My Review" or "Needs Revision".  
  * Each row in the table is expandable. Clicking a row reveals a detailed view without navigating away from the page, maintaining context.  
* **Expanded Row View:** This is where the critical review takes place.  
  * **Diff Viewer:** This is the centerpiece of the review UI. A side-by-side difference viewer component, built using a library like react-diff-viewer and styled to match the application's theme, will clearly show the changes between the generic standard\_llm\_answer and the user-refined output (Custom Answer).49 This visual comparison immediately highlights the value of the custom content and focuses the reviewer's attention on the specific knowledge being added. Text alignment and styling will follow best practices to ensure maximum readability.51  
  * The output field remains editable within this expanded view, allowing the reviewer to make final tweaks. Any edits made at this stage become the final, authoritative version of the answer.  
  * A Textarea is provided for the reviewer to add review\_notes, which are essential for providing feedback if the item is sent back for revision.  
* **Right Panel (Actions):** When a row is selected, this panel displays two primary action buttons: a green "Approve" button and an orange "Send for Revision" button.

**Human Actions & System Flow:**

1. A user with the "Reviewer" role navigates to this module and filters the table to see items with the status pending\_review.  
2. They select a QA pair, which expands the row to show the detailed view with the diff viewer.  
3. The reviewer carefully inspects the custom answer, comparing it against the standard answer and their own domain expertise.  
4. If necessary, they make final corrections or improvements directly to the output text.  
5. Based on their assessment, they take one of two actions:  
   * **Approve:** They click the "Approve" button. The system locks the record from further edits, updates its status to approved, and records the reviewer's ID and timestamp.  
   * **Send for Revision:** They click "Send for Revision", type feedback into the review\_notes field, and submit. The system updates the item's status to needs\_revision and sends a notification back to the original author.

**Backend & Data Model:**

* **Supabase Tables:** All actions directly read from and write to the QAPairs table.  
* **Logic:** The UI is a sophisticated front-end for managing the state of records in the QAPairs table. The core logic involves updating the status, reviewed\_by, reviewed\_at, and review\_notes fields based on reviewer actions. A record with the approved status becomes eligible for the synthetic data generation pipeline.

### **Module 6: Synthetic Data Expansion ("The Amplifier")**

**User Goal:** To leverage the small set of high-quality, hand-crafted lessons to automatically generate a much larger and more diverse set of training examples, exponentially increasing the knowledge base with minimal additional effort.

UI/UX Design & Component Layout:  
This module is primarily a monitoring dashboard rather than an interactive tool. The design must clearly communicate the status and results of the automated generation process.53

* **Center Panel:**  
  * At the top, a configuration Shadcn Card contains settings for the generation process. This includes a labeled Shadcn Input for "Number of synthetic variations per approved lesson:" (e.g., default value of 10\) and a primary "Start Generation" button.  
  * Below the settings, a summary section uses several Shadcn Card components to display key metrics at a glance: "Approved Lessons Ready: 50", "Synthetic Lessons Generated: 452 / 500", and a dynamic status like "Generation in Progress..." or "Generation Complete".  
  * The main area of the panel is a Shadcn Data Table that shows the queue of approved human-curated QA pairs and the status of their synthetic children (e.g., a progress bar showing "Generating 7/10...", a green check for "Complete", or a red 'X' for "Error").  
* **Right Panel (Inspector):** When a generation job (corresponding to one original approved pair) is selected in the table, this panel can display logs from the generation process or show a few examples of the newly created synthetic QA pairs for a quick spot-check.

**Human Actions & System Flow:**

1. After a sufficient number of QA pairs have been moved to the approved status in Module 5, the user navigates to the Amplifier module.  
2. They configure the desired expansion factor (e.g., generate 10 synthetic variations for every 1 human-approved lesson).  
3. They click the "Start Generation" button to initiate the process.  
4. The user's role then shifts to monitoring the progress on the dashboard. They can watch as the number of synthetic lessons increases.  
5. Optionally, the workflow can be configured so that newly generated synthetic pairs are sent to the Module 5 review queue with a pending\_review status for a quick quality assurance check, or they can be automatically approved to accelerate the process.

**Backend & Data Model:**

* **Supabase Tables:** New rows are inserted into the QAPairs table.  
* **Logic:** Clicking "Start Generation" triggers a master Edge Function. This function queries the QAPairs table for all records where status is 'approved' and generation\_method is 'human\_curated'.  
* For each of these high-quality seed pairs, it invokes a "Synthetic Generator" function. This generator leverages a powerful, state-of-the-art "teacher" LLM (such as GPT-4o or Claude 3 Opus). It uses the human-approved QA pair as a high-quality few-shot prompt, instructing the teacher model to generate N new, varied, but stylistically and philosophically consistent question-answer pairs.22 This process is known as knowledge distillation.23  
* The newly generated synthetic pairs are then written back to the QAPairs table. Each new record is marked with generation\_method: 'synthetic\_v1' and includes a base\_pair\_id that links it back to the original human-curated example it was derived from, ensuring full data provenance.

The design of this final module creates a powerful value-amplification flywheel. The most labor-intensive part of the user's journey is the manual creation and review of the initial QA pairs in Modules 4 and 5\. The quality of synthetic data is highly dependent on the quality of the seed examples used to generate it.56 This workflow naturally produces these perfect seed examples. Therefore, Module 6 transforms the product from a simple data entry tool with a linear effort-to-output ratio into an exponential knowledge amplification engine. This 10x or 100x return on the user's manual effort is a core strategic advantage and should be a central theme in the product's marketing and user experience narrative.

## **Conclusion & Strategic Next Steps**

### **Summary of the Architectural Plan**

This document has detailed a comprehensive architectural and user experience plan for the Bright Run SaaS platform. The proposed system directly addresses the core business objective: to provide a simple yet powerful tool for non-technical users to create custom, LoRA-ready training data for Large Language Models. By integrating a user-centric, six-stage workflow with a modern and scalable technology stack—Next.js 14, Shadcn UI, and Supabase—the plan lays a robust foundation for a commercially successful product. The architecture is designed to be performant, ownable, and cost-effective for an MVP, while the UX is meticulously crafted to abstract technical complexity and guide users toward creating a valuable, proprietary cognitive asset.

### **From Blueprint to MVP: Actionable Roadmap**

The following is a high-level, actionable roadmap for developing the Bright Run MVP based on this plan.

**Phase 1: Foundation & Backend Setup **

* Initialize the Next.js 14 project repository and integrate the Shadcn UI CLI.  
* Set up the Supabase project: configure Authentication, enable Storage, and create the initial database schema for all required tables (Projects, SourceDocuments, CleanedContent, ContentChunks, QAPairs) using SQL migration files.  
* Establish the basic three-panel layout and project dashboard structure.

**Phase 2: Core Workflow Implementation **

* Build the complete UI and frontend logic for Modules 1 through 4, focusing on the primary user path from file upload to the QA pair creation "workbench."  
* Develop the backend Python scripts for the initial processing steps: content cleaning (Module 2\) and content chunking/tagging (Module 3).  
* Deploy these scripts as Supabase Edge Functions and configure the database triggers to create the automated pipeline.  
* Implement the AI suggestion logic for the workbench in Module 4\.

**Phase 3: Quality & Amplification **

* Implement the review dashboard for Module 5, with a particular focus on integrating and styling a react-diff-viewer component to create the critical diff view.  
* Develop the server-side logic for the approval workflow (status changes, notifications).  
* Develop the synthetic data generation engine for Module 6, including prompting strategies for a teacher LLM.  
* Build the monitoring dashboard UI for the Amplifier module.

**Phase 4: Testing & Refinement **

* Conduct thorough end-to-end testing of the entire pipeline using the provided todd-brown-marketing sample dataset.  
* Perform internal user acceptance testing (UAT) to gather feedback on the workflow's intuitiveness and clarity.  
* Refine UI/UX elements, instructional text, and system feedback based on testing outcomes to prepare for an initial beta launch.

### **Final Recommendation**

This plan provides a clear and comprehensive blueprint for building the Bright Run SaaS product. It balances ambitious functionality with a pragmatic, phased approach to development. By focusing on a superior user experience and leveraging a modern, efficient technology stack, this architecture positions Bright Run to successfully solve a complex and high-value problem in an elegant and accessible manner, creating a strong foundation for market entry and future growth.

### Goals
Your primary goal of this UX specification is to architect a web based Next.js 14, leveraging its full-stack capabilities, including Server Components and UI Streaming, to deliver an exceptionally fast and responsive interface  commercial quality, SaaS product called Bright Run:

1. That will transforms unstructured text data into high-quality, structured training data formatted for fine-tuning a Large Language Model (LLM) with LoRA.

2. Has well designed and engineered user's journey for a non technical user's ease of use. 

3. Guides the user through the steps from unstructured raw original input data to human curated question pairs and then to generated synthetic question pairs that can also be human curated. 

4. The user interface components will be sourced from  
  **Shadcn UI**, a collection of composable and accessible components. This choice provides Bright Run with 100% ownership of the component code, eliminating external dependencies and licensing concerns while allowing for deep customization to achieve a unique brand identity.

5. This product transforms unstructured text knowledge into structured training data that is used by LoRA to address the core business need: "I want the cognition of a powerful LLM, but with my customer’s unique knowledge, beliefs, and proprietary processes.". To be specific:
### **Core Requirements for the Custom LLM:**

  * "Retain the **generalization and reasoning power** of the base LLM. "
  * "Reliably and automatically **replace or override** the LLM's default beliefs, values, and methods with the customer's specific knowledge. 
  * The model must learn to handle:
      * "**Business philosophies** (e.g., "never recommend discounts," "always emphasize local values"). 
      * "**Proprietary processes** (e.g., "use our 3-step marketing funnel, not a generic one"). 
      * "**Specific tones and styles** for rewriting content. 
      * "**Underlying beliefs and values** that inform business strategy. 

6. Is a fully realized SaaS product called Bright Run that is good enough, simple enough, and fast enough, to be marketed as a fully realized SaaS business. The SaaS interfaces must be 100% owned and configurable by our company Bright Mode. We do not want the customers to use or see interfaces that are outside of our site (like an Airtable interface, or iFrame), use a different UX, or have external branding on them.

7. The SaaS product must be able to be 100% brandable, customizable, ownable, license free by our company Bright Mode Open source tools that can be sold along with the SaaS membership are preferable if they are high quality and reliable enough for a commercial enterprise. Having said that, Paid infrastructure services (like Supabase) that offers substantial ease of use and scalability benefits are preferrable to unproven free or almost free alternatives. Paid infrastructure services must have a cost reasonable low volume tier. Say under $50 a month for service tiers that are good enough for our low volume MVP.

8. For this high level plan do not describe default SaaS functionality. Things like the payment gateways, user auth, user management, user settings, etc. It must be compatible with these current most popular SaaS product tools (e.g. Auth, etc...), but do not describe the detail of architecting the membership, purchasing, templated user settings functionality. We must first focus on the core benefit and proving we can create a product that is "good enough" to sell. 

8. The Bright Run SaaS product ONLY shepherds the raw text files through a process that results in a configurable amount of LoRA compatible synthetic question pairs. This product's service ends when the synthetic question pairs are generated, curated, and approved.

9. VERY IMPORTANT to this specification that you will create. This project will be developed using Cursor AI (a VS Code interface). As such please design the implementation steps with the development platform in mind, and customize this specification so that Cursor AI can build the product. 

The final output of this prompt should be a detailed project document that outlines this entire process. The focus is on the user experience (UX), interface design, and the step-by-step human actions required. We are currently in the architectural design phase; do not create a detailed technical implementation plan.


Steps & Examples:

## 🧠 **Input Source (Already Complete and testing files exist)**

  * "**Transcription Pipeline:** A process has already been run to convert expert video content into raw text transcripts. "
  * "**Transcript Output Location:** `/workspace/services/data-processor/harvesters/video_processor/outputs/todd-brown-marketing/` "
This input data source happens to be multiple video transcripts, but the SaaS product must handle multiple data formatting inputs like HTML, PDF, video transcripts, tables, etc...

-----

## 🛠️ **Technologies & Tool Recommendations**

We need to decide which best technology tools to choose that will enable us to build a good looking product for a non technical end user. The technologies we use must be as simple as possible while being as sophisticated as needed. As a SaaS product the product must be intuitive, fast fast fast, fault tolerant, and professional grade. Do not design for high volume yet, but make the technology stack easy to scale processing volume and concurrent user usability (or easy to switch out for scalable technologies).


-----



## 🔁 **Data Processing Pipeline: UX Architecture and Human Steps using a SaaS customer user's journey**

Here is an example of the first iteration of the six-step plan to process the unstructured transcript data into approved, LoRA-ready training native and synthetic data. These steps were created for an internal, more technical user. You must re-engineer these steps to live in a production quality level SaaS product, is intuitive for a non technical user to create their own LoRA test questions, feels comfortable with the process, needs a status display for any processing step that could take longer than 15 seconds. For each of these steps, re-describe the step with the new requirements (full SaaS viability) with its human actions, its UI interface, its function, the end goal of the step, and its interface to the next step.

### **Step 1: Unstructured Data Ingestion ("Origin Story Layer")**

  * **Purpose:** To load the raw, original video transcripts into a structured database. "This preserves the original text for provenance and future reference, creating an "origin story" for the data. "
  * "**Structured Database Table Name(s): e.g. `RawTranscriptTable` "
  * "**The Bright Run Custom Interface Module Name: e.g. `TextIngestionService` "
  * **UI/UX Description:** This will be a simple table view of the table in our chosen tool (e.g., Supabase or Retool). The user will see a list of ingested transcripts. The primary action here is for an administrator to trigger an import from the source directory. No content editing occurs at this stage.
  * **Flow:** The system watches the input directory, ingests new transcripts, and populates this table. Each new row in this table automatically triggers the next step.

-----

### **Step 2: Content Cleaner Layer**

  * **Purpose:** To programmatically sanitize the raw text. "This step removes distracting artifacts like HTML tags, formatting characters, and table structures **without altering the core words or their meaning**. "
  * "**Structured Database Table Name(s): e.g. `SanitizedTextTable` "
  * "**The Bright Run Custom Interface Module Name: e.g. `TextSanitizerService` "
  * **UI/UX Description:** The sanitizing is an automated backend process. There is **no direct user interface** for the sanitizing. There IS a user interface where the user can see all the files available for sanitizing and select which one they want to be sanitized for the next run. The user will see the result in the next step. The system provides logs for administrators to verify that the cleaning process is working as expected.
  * **Flow:** A new entry in the `RawTranscriptTable` triggers this Python service. It cleans the text and writes the output to a new table.

-----

### **Step 3: Categorization & Traversal Layer**

  * **Purpose:** To make the clean, long-form content easily readable and useful. "The system automatically breaks the content into smaller, semantically meaningful chunks and assigns initial categories or topics. "
  * "**Structured Database Table Name(s):
  * "**The Bright Run Custom Interface Module Name:
  * **UI/UX Description:** The user interacts with an interactive table or gallery view. Each row represents a "chunk" of the transcript. The interface will show:
      * The text chunk itself.
      * AI-suggested tags for topic/category (e.g., "belief", "process"), which the user can approve or edit via a dropdown menu.
      * An AI-generated summary of the chunk.
      * A button labeled "**Generate QA Pair**" to send a specific chunk to the next step.
  * **Flow:** The user reviews the chunked content, corrects any obvious categorization errors, and selects chunks that contain valuable knowledge to be turned into training data.

-----

### **Step 4: QA Structuring Layer for LoRA Training**

  * "**Purpose:** To convert the selected content chunks into the structured Question-Answer JSON format required for LoRA training. " This is the primary "workbench" for the human expert.
  * "**Structured Database Table Name(s):
  * "**The Bright Run Custom Interface Module Name:
  * "**UI/UX Description:** A **dual-panel interface** is critical here: "
      * **Left Panel (Context):** Displays the source transcript chunk.
      * **Right Panel (Editable Form):** Contains fields for the QA JSON object. The system will pre-populate these fields with AI suggestions:
          * **Suggested Question:** An LLM-generated question based on the chunk.
          * **Standard Answer:** An LLM-generated answer from a generic knowledge base.
          * **Custom Answer:** An LLM-generated answer that attempts to capture the expert's unique philosophy from the source chunk.
      * The user reviews, edits, and refines these fields. "All fields like `question_type`, `topic`, and `tone` should be editable, ideally with dropdowns and tag-style inputs. "
  * **Flow:** When a user clicks "Generate QA Pair" in Step 3, a new record is created here. The user edits the AI-generated content and, once satisfied, clicks "**Submit for Final Review**."

-----

### **Step 5: Human-in-the-Middle Review & Correction**

  * "**Purpose:** To provide a final quality-control gate where a senior expert or editor can review, correct, and formally approve the QA pairs before they are used for training. "
  * "**Structured Database Table Name(s):
  * "**The Bright Run Custom Interface Module Name:
  * **UI/UX Description:** This is a streamlined review dashboard.
      * The view is a table of QA pairs, filterable by status ("pending\_review," "approved").
      * "It must feature a **diff viewer** to clearly show the differences between the `standard_answer` and the `custom_answer`. "
      * "Long answers should be displayed in expandable text boxes to keep the interface clean. "
      * The key actions are two buttons: "**Approve**" and "**Send Back for Revision**" (with a notes field).
      * "**Crucially, if the human reviewer edits the `custom_answer` field, that edited version becomes the final, authoritative answer for training.** "
  * **Flow:** Submitted pairs from Step 4 appear here. An approver reviews them. Once "Approved," the record is locked for editing and is ready for the final step.

#### **LoRA Training Data JSON Format**

Design the ideal JSON structure for each training example. "This structure will be stored in the primary database table and used as the direct input for the LoRA fine-tuning process. "It must contain all necessary metadata for training and for a future synthetic question generator. "

Below is an example. Please refine it to ensure it captures all necessary attributes.

```json
{
  "id": "unique_id_generated_by_db",
  "source_document": "todd-brown-marketing/transcript_name.txt",
  "question": "What should I do if my Facebook ads have a good CTR but poor conversions?",
  "question_type": "process", // e.g., process, belief, fact, policy
  "topic": "ads > funnel > conversion",
  "style_attributes": {
    "tone": "expert-strategic",
    "framework": "Big Idea",
    "voice": "Todd Brown"
  },
  "standard_answer": "A typical LLM answer for a generic digital marketing scenario, focusing on tactical A/B testing of landing pages, offers, and CTAs.",
  "custom_answer": "The Todd Brown-style contrarian answer focused on pre-marketing belief shifts and identifying the 'Big Idea' before optimizing tactical elements.",
  "metadata": {
    "created_by": "LLM_suggestion_v1",
    "reviewed_by": "human-editor-jane-doe",
    "status": "approved", // e.g., pending_review, approved, needs_revision
    "review_notes": "Human editor selected the custom answer and slightly rephrased the opening line for clarity.",
    "synthetic_generation_ready": true
  }
}
```
-----

### **Step 6: Synthetic Question Generator Integration**

  * "**Purpose:** To feed the approved, high-quality QA pairs into a separate synthetic data generation engine, which will create variations to expand the training set. "
  * "**Structured Database Table Name(s):
  * "**The Bright Run Custom Interface Module Name:
  * **UI/UX Description:** This is another automated step with no direct user interaction, but it will have a dashboard for monitoring. The dashboard will show:
      * A queue of "Approved" QA pairs waiting to be processed.
      * Logs of data sent to the synthetic generator.
      * Status flags for each record (e.g., "Ready for Generation," "Sent," "Error").
  * "**Interface Requirements:** The feeder must accept the approved JSON objects, validate that all required metadata is present, and format it correctly for the synthetic generation API. "

-----


----
FAQ Questions/Answers

Question: Do you have any design or visual references for the SaaS UI (e.g., Figma files, existing design systems)?
Answer: For the purposes of the first iteration of this app we will use the Shadcn CLI to reduce the complexity of developing this app. When and if a styles are needed that are not available in Shadcn we will use the Aplio template style that can be seen here https://aplio-new-15-3pelkbs75-james-jamesjordanms-projects.vercel.app/home-4 and for which we have the source code.

Question: Should the output include suggested backend tools/libraries (e.g., for chunking, cleaning, question generation), or focus purely on UX and flow?
Answer: Focus purely on UX and flow for this iteration

Question: Do you want this to be written as a standalone project spec doc with headers like 'Executive Summary', 'User Journey', etc., or should it directly jump into the step-by-step breakdown?
Answer: Yes include "Executive Summary', 'User Journey' sections. But this is not a business case document. Do not analyze the business prospects or write a business plan. This is a exclusively a PRD focused on the elements needed to fulfill these requirements at the user interface level, user interface steps, and user interface flow. 



## ✅ **Final Deliverable: Summary of the Plan**

"The final document you generate should be a detailed expansion of this outline, formatted with clear headings for easy reading and pasting into a Google Doc. " It should walk through each of the six steps above, elaborating on the user's journey, the look and feel of each interface, and the specific actions they will take to transform raw transcripts into a valuable, proprietary dataset for fine-tuning an LLM.
