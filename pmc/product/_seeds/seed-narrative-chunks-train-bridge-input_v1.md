For this task we need to help explain the current status of our app and even more so, we need to do a create the functional requirements for the next phase in the application.

Read and understand the full context from the ## Product Context below.

The current problem is that we do not have a well defined interface to pass data to the train-data conversation generation engine.

The process we have followed so far:

1. Built Chunks Alpha spec here `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements-chunks-alpha_v1.md`
- We are satisfied with the current Chunks Alpha functionality as a starting point. It may be slightly different from the base requirements in the document. That is ok.
- The Chunk Data output is chunks of data that have been annotated with our custom labeling process. Read the relevant codebase & Supabase tables carefully so you truly understand the available output of the chunks-alpha functionality.

2. Next we build the "seed 10" conversations. 
This is one of the "seed 10" files. The others are in the same directory.
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json`

These are huge files no need to read much of it unless you need to see data values for a purpose.
Here is the full schema: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-JSON-format_v3.json`

- Originally I thought that we would use the "seed 10" as input to the train-data module to allow it to create the variations of the first 100 conversations. We didn't really define the data very well that would be used as input (or did we? tell me if you see it).

I don't really remember the process we used to create the "seed 10". Some documentation is here:
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\`

for example: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\c-alpha-build_v3.4-LoRA-FP-convo-steps-carryover_v1.md` has some of the history. 

But I don't remember the whole process, and frankly we may never need to do that exercise again?

The core value of the exercise was:
A detailed and tested JSON schema for "Emotionally Intelligent Conversation Training" LOra training conversations here: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-JSON-format_v3.json`
and examples like those that can be found here:

The ontology of conversation personas, emotions, and conversation topics that define that we are building can best be seen in one of the seed files, for example: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json`

 
3. So now that we have a stood up version of train-data here `C:\Users\james\Master\BrightHub\brun\train-data\src`
We need to create the REAL bridge between chunks-alpha and train-data.
In my mind I am thinking it is this:

a. the chunks must serve as the input to train-data
b. the chunks must be converted to the proper annotations needed to provide key information to the conversation generation prompt templates. The first draft prompts used to generate the conversations are here: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md` (they are not templatized yet)

c. the train-data engine really has only three inputs:
a. the JSON schema & full examples with much of the data needed for the data dictionary
b. The prompt template instructions
c. chunk specific data including: topics, personas, emotions, annotations, etc.

Those inputs are fed into the generation engine which applies the selected prompt which will generate the Conversations.
(This brings up an important point that one the core engine specific question the UI needs to ask upon question generation process (on this page, step 2:  "What type of emotional transformation conversation do you want to generate?" here: https://train-data-three.vercel.app/conversations/generate

So what do I want you to do?  I want you to:

1. Read and understand the context of this module with good memory. Do that by reading the context documentation below in the ## Product Context section.

2. Validate or dispute my solution assumptions above. Be honest, not supportive. My priority is a high quality resulting product.

3. Sketch out in a rough draft the requirements for the most appropriate functions and interfaces that will be implemented into this version of the app based on the best solution set for generating the Emotionally Intelligent LOra training conversations. Put that new  requirements document here: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-chunks-train-bridge-functional-requirements_v.01.md`