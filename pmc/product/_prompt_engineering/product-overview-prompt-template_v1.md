I need you to help create a comprehensive overview document for project:

# Project {PROJECT_NAME} Overview Document

## Required Inputs
Before generating this document, you must read and fully understand the following files:

- **Template:** `{OVERVIEW_TEMPLATE_PATH}`
  - Defines the required format for the resulting document.
- **Seed Story:** `{SEED_STORY_PATH}`
  - The foundational user story serving as the starting point for this product.
- **Example:** `{REFERENCE_EXAMPLE_PATH}`
  - Provides a reference for structure, depth, and quality expectations.
[[ if current_status.enabled ]]
- **Current Status:** `{CODEBASE_REVIEW_PATH}`
 - The entire current codebase is here and has been worked on toward this project's goal. 
 Read all the files in all the folders & subfolders to determine the current state.
[[ endif ]]
---

## Core Requirements
The **Product Overview Document** must include the following sections:

### 1. Product Summary & Value Proposition
- Clearly define why this product exists.
- State the problem it solves and its core purpose.
- Highlight the business value it delivers.

### 2. Target Audience & End Users
- Identify the **primary users**.
- Describe their **pain points**.
- Explain how the product **addresses their needs**.

### 3. Project Goals
#### User Success Goals
- What must users be able to accomplish?

#### Technical Goals
- Key technical achievements for the system.

#### Business Success Goals
- How does this contribute to business objectives?

### 4. Core Features & Functional Scope
- Clearly list the **primary product features**.
- Define the **functional scope** (what is in scope vs. out of scope).

### 5. Product Architecture
- Describe the **high-level system architecture**.
- Include a **high-level architecture diagram** (if possible).
- Identify **key components and their interactions**.
- Outline **data flow and dependencies**.

### 6. Core Technologies
- Specify the **technology stack** (frontend, backend, database, infrastructure).
- Define any **third-party services, APIs, or integrations**.

### 7. Success Criteria
- What defines a **successful implementation**?
- Measurable **product performance and usability benchmarks**.
- Completion criteria for **core milestones**.

### 8. Current State & Development Phase
- What is the **current development status**?
- Identify **completed vs. pending features**.
- Note any **technical debt or limitations**.

### 9. User Stories & Feature Mapping
- List **key user stories**.
- Map each **user story** to corresponding **product features**.
- Define **completion qualifications** for each feature.

### 10. Potential Challenges & Risks
#### Technical Challenges
- Any anticipated **engineering hurdles**?

#### User Experience Challenges
- Possible **UX friction points**?

#### Business/Adoption Risks
- What could **prevent successful implementation**?

#### Risk Mitigation Strategies
- How can these **risks be proactively addressed**?

### 11. Competitive Landscape (if applicable)
- Identify **alternative solutions** (if any).
- Define how this product **differentiates itself**.

### 12. Product Quality Standards
- Define **performance expectations** (speed, reliability, scalability).
- Outline **code quality & development standards**.

### 13. Product Documentation Planning
- Required documentation:
  - Product specifications
  - Technical documentation
  - User guides/tutorials
- Assign responsibility for **document creation**.

### 14. Next Steps & Execution Plan
- Clearly define the **immediate next steps**.
- Assign **key action items**.
- Provide a **high-level timeline**.

---

## Additional Requirements
- The document must be **detailed, structured, and explicit**—it is intended for 
an **Autonomous AI Agent**, which lacks human intuition and must be guided with highly granular instructions.
- All user stories must be stories of **end users, customers, or stakeholders of the end product**. 
We are not documenting user stories of the team building the product.
- The style and depth should match the **provided Example Document** 
(`{REFERENCE_EXAMPLE_PATH}`).
- The document must serve **dual purposes**:
  1. **Operational Guide for AI Agents who will use these stories to build this product**
  2. **Trackable Objectives for Product Managers who are responsible for making 
  sure the requirements of the end users, customers & stakeholders of the product are met**
- Before generating content, spend **30 seconds carefully analyzing the problem statement**.

---

## Output Location
- Save the completed **Product Overview Document** in:
  ```
  {OUTPUT_PATH}
  ``` 