=========================Prompt=For=Building=Context=========================================
You are tasked with updating the context carryover file at:
pmc/system/plans/context-carries/context-carry-info-10-09-25-258pm.md

First, read the entire file to understand its current structure and content.

Then, update the "Current Focus" section with the following requirements:

1. **Active Development Focus**
   - Be explicit about the task
   - Include full paths where applicable

Your task is to update: pmc/system/plans/context-carries/context-carry-info-10-09-25-258pm.md with the details of what I am requesting below:


ok we will have uploaded this version of the app and built it in Vercel. 

We are writing a specification for the new document upload and processing module. 
We have accomplished the current codebase in \src which is working well.

We have discovered that we need to create a robust document uploading module as defined here:

Current functionality and requirements discovery
pmc\context-ai\pmct\c-alpha-build-spec_v3.3_document_module_v2.md

Further requirements discovery
pmc\context-ai\pmct\c-alpha-build-spec_v3.3_document_module_analysis_v1.md

In addition we have a wireframe design that we must use. You can see the wireframe codebase here: \doc-module\src
This will be the UI of the document components

It is a VITE application so the only use of it is so you can study the UI design and replicate it in Next.JS 14 for our application.

So based on the above requirements and current functionality we need to write a detailed specification. In this task you are giving the next coding agent the information write up needed to answer questions and help us write the specification.


Questions we will ask before we define the specification:

A. Does file processing state reporting require sockets? I would like to know if a document is taking a long time to process or if it has an error. There really only needs to be three states: Processing, Completed, Errors.
The only time it needs to be "Processing" is if it is not in error status and not extracted to text.

Is it reasonable to ask for a "real time" update without page refresh of these statuses using only a javascript poll? I don't want to dive into sockets or more complicated processing status...if this one feature creates too much context to integrate it quickly then let me know and we will do without real time views for now.


B. Architectural decisions
Should we build on top of this current module: chunks-alpha\src ?  
Or 
Should we develop it as a stand a lone module. Factors that I can think of:

Outside the system benefits

1. Not dependent on chunks-alpha
The upload module does not really use any stateful or real time data from the document categorization and chunk dimensions. It really only needs to deposit the file in the correct directory within chunks-alpha that chunks-alpha pulls and add any upload document metadata to the tables.

2. Is current chunks-alpha getting too "large" or complicated to stay fast, context manageable, and easy to maintain?

Inside the system benefits I can think of
1. Makes future integration into a full working application more seamless with the system as a whole.

2. Just easier to build on top of the current codebase than split it out and run into dependencies in the future (cant think of any right now)

3. Keeps the overall gui frame the same, without having to keep it in synch.

4. Components within can be shared across features and states can be shared

5. As the front end to the system, these two modules kind of go together 


Remind the coding agent to read both codebases:
\src 
and
\doc-module\src

for their answer to these questions.


In the next carryover file: pmc/system/plans/context-carries/context-carry-info-10-09-25-258pm.md write a spec to get this done. Delete any sections which are not relevant.


2. **Section Updates**
   - REQUIRED sections must always be included and fully populated
   - CONDITIONAL sections should only be included if relevant criteria are met
   - You MUST remove any sections marked CONDITIONAL if you don't update those sections because they don't have relevant content
   - Maintain consistent formatting within each section

3. **Content Requirements**
   - All file paths must be from workspace root
   - All task IDs must include both ID and title
   - All descriptions must be specific and actionable
   - All next steps must include clear success criteria

4. **Context Preservation**
   - Include any critical context from the current session
   - Reference relevant documentation and specifications
   - Maintain links between related tasks and components
   - Document any decisions or changes that affect future work

After updating the sections, review the entire file to ensure:
1. All REQUIRED sections are present and complete
2. All CONDITIONAL sections are either properly populated or removed
3. All formatting is consistent
4. All references and links are valid
5. The context is sufficient for a new session to continue the work

=========================Prompt=For=Building=Context=========================================


+++++++++++++++++++++++Prompt+to-Copy+Into+New+Context+Window++++++++++

# Context Loading Instructions for This Development Session

## 1. Primary Context Document
REQUIRED: Carefully review the current context carryover document:
`pmc/system/plans/context-carries/context-carry-info-10-09-25-258pm.md`

You Must Focus on:
- The ## Active Development Focus section
- Current Implementation State
- Next Steps and Implementation Plan

## 2. Technical Specifications
Review any technical specifications referenced in the "### Important Files" and "### Important Scripts, Markdown Files, and Specifications" sections of:
`pmc/system/plans/context-carries/context-carry-info-10-09-25-258pm.md`

Key areas to understand:
- File purposes and roles
- Current state and requirements
- Integration points
- Technical constraints

## 3. Core Implementation Files
Review the implementation files listed in the "### Important Files" section of:
`pmc/system/plans/context-carries/context-carry-info-10-09-25-258pm.md`

For each file, focus on:
- File purpose and role
- Current state
- Integration requirements
- Implementation notes

## 4. Review Process
- Read each section of `pmc/system/plans/context-carries/context-carry-info-10-09-25-258pm.md` carefully
- Cross-reference between context and implementation files
- Note any dependencies or integration requirements
- Identify potential implementation challenges

## 5. Development Continuity
Review the "### Recent Development Context" section of:
`pmc/system/plans/context-carries/context-carry-info-10-09-25-258pm.md`

Focus on:
- Last completed milestone
- Key outcomes and learnings
- Technical context that carries forward
- Current development trajectory

## 5. Restate the Active Development Focus
Once you've completed this review process, please provide:
1. A summary of the active development context as you understand it from reading the: ## Active Development Focus section of the pmc/system/plans/context-carries/context-carry-info-10-09-25-258pm.md
2. Key technical considerations identified
3. Any potential implementation challenges
4. Questions or clarifications needed before proceeding

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

