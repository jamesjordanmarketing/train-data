So now we need to use this spec:

`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md`

Along with the full project context (must read all):

`C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\01-bmo-overview.md` (full product overview)
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-generation_v3.md`
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\GENERATION-COMPLETE-STATUS.md`

Read this: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\c-alpha-build_v3.4-LoRA-FP-COMPLETE-DATASET-SUMMARY.md`

`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json` (most recent seed file of first "10")

system\chunks-alpha-data\financial-planner-demo-conversation-and-metadata_v1.txt (first persona profiles...do we need more personas first before the next dataset creation prompts?)

`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4_emotional-dataset-emotional-taxonomy.md`

The goal of this prompt is to create a detailed product functional requirements. The functional requirements must follow this template format: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements.md`

You will write the output specification here: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements-train-data-module.md`

the detailed product functional requirements will incorporate all of the below.
It must have very detailed acceptance criteria described for every new feature & function of the module. 
The functional requirements will be implemented in the current codebase.

Module Overview:

It is not practical to implement one prompt to generate 10 conversations. The output file would be too large. So we need to split the prompts to one per conversation. But then we will have so many prompts to manually execute. So we need to build a UI to allow for better processing (ultimately this is part of the core product anyways, so we might as well build it now). You will focus on the User Interface for the front end while making sure that all the back end hookups & processing are described in detail too.  Use a cutting edge Shad/CN library based user interface.

We will use the current codebase found in `C:\Users\james\Master\BrightHub\brun\train-data\src` and integrate our new screens and features within this flow. 

We need the UI to:
- Present each the conversations as a line item in a table 
- Allow for the human user to press one button on that line, which will execute the prompt and generate the conversation, which will be saved to the database.
- Allow for the human user to select multiple line items and then press one button that will generate those conversations, sequentially, still one prompt per conversation, which will be saved to the database.
- A "Process All" button which will generate the all scenarios into conversations, sequentially, one prompt per conversation, which will be saved to the database.
- There must be select boxes for the top 8 most important dimensions (persona, emotion, content, etc..) that determine the type of conversation the prompt creates the conversations with. You can select any or all of the boxes and the line item in the table will match the selection(s).


1. As the first part of this process we must migrate our existing seed conversations to the Supabase database. We must build the database tables and the SQL queries that will update the tables.

2. We need to build a UI around this step in the process.
The process will be called the train-data process and we need to design a way to build these 90 data sets through this UI.


A. Split these into the prompts so that each prompt only generates ONE conversation.
In the perfect world there would only be 3 prompts that will serve the purpose of generating the training data for that set. The three main prompts are:

**Three-Tier Prompts**
- **Tier 1 Prompt (Template-Driven):** 40 conversations (11-50) using 5 emotional arc templates
- **Tier 2 Prompt (Scenario-Based):** 35 conversations (51-85) with custom scenarios
- **Tier 3 Prompt (Edge Cases):** 15 conversations (86-100) testing boundaries

If it can be successful we would like each of these three prompts to:
1. Generate ONE conversation, per the parameters & conversation requirements
2. Be templatized so that we can feed it parameters and placeholder (string replace) information and it will generate the one specific conversation per those details.
3. Will be part of a UI interface wherein the user selects one of the use cases (each use case is a combination of user/emotional arc/conversation topic/etc as seen in

and it will output the prompt generation of those turns

Now as part of this we also need to build:
a. The new UI
b. It must use all the conversation quality tools (JSON template, emotions, personas, specialty signals, etc) to properly convert the input into detailed conversation records.


c. convert the current JSON at to database tables and records. 
It must do this for all the json found here (don't read all of these all. It is too big (14k lines): 
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-01-complete.json`
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-02-complete.json``C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-01-complete.json`
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-03-complete.json`
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-04-complete.json`
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-05-complete.json`
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-06-complete.json`
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-07-complete.json`
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-08-complete.json`
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-09-complete.json`
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json`


d. take the "SEED" conversations in the database and turns as input (if the Conversation generator requires it...or just a brief format sampling needed?)

5. The resulting JSON conversation should be stored in the Supabase db. I.E. create tables that will store the JSON conversation and can easily be used to generate the full JSON for a conversation. Unless necessary don't actually store JSON in the database. The app should build it from the database.


2. Include the prompt(s) that I will submit to the Claude-4.5-sonnet Thinking LLM to execute the product build and coding changes. I must be able to cut and paste these prompts into a 200k Claude-4.5-sonnet Thinking context window in Cursor.

3. Make sure as you write the specification you don't leave any important context, direction, or instruction, outside of the prompts. Because the building agent will only see the information that is in the prompt(s)
Organize the successive prompts so that each one can be executed in a new 200k token context window

4. If more than one prompt(s) are needed to use the Claude-4.5-sonnet Thinking LLM to execute the product build and coding changes, I must be able to cut and paste these prompts into a 200k Claude-4.5-sonnet Thinking context window in Cursor. They should be modular, so that the subsequent prompt does not need to finish the prior component.

5. Do NOT include the same code/query/details outside the prompt sections if they same information is in the prompts. It gets confusing as to which blocks I am to copy and paste.

6. Make very clear what sections I must cut and paste (sql or prompt). At the beginning of what I must cut put a row of ======================== plus 3 new lines after the ====== line. At the end of what I must cut put a row of +++++++++++++++++ plus 3 new lines after the +++++++ line.

Remember to write the results and output to: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements-train-data-module.md`