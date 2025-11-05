REQUIREMENTS
I want you to carefully train yourself on the codebase here: `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src` and understand everything that it does.

See: `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\pmc\product\01-bmo-overview.md` to understand the whole pipeline.

Read this:
`C:\Users\james\Master\BrightHub\BRun\chunks-alpha\pmc\product\01-bmo-overview-categ-module_v1.md` to understand the spec that was used to build the foundation codebase of this module.

Read this:
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build-spec_v3.3-build-update_v1.md` to understand how we have built upon the categ-module and the actions just prior to this current chat context and output.

Next we are working on building the output spreadsheet of the dimensions.
The first task we will do is read and analyze this specification and ask any clarifying questions. Then we will produce a detailed specification.

The specification will create the Dimensions Result feature of this module which will:

1. Model the webpage spreadsheet after See this CSV file:
`C:\Users\james\Master\BrightHub\brun\mock-data\chunks-alpha-data\LoRA-dimensions_v2-full-output-table_v1.csv`
This the layout and format of the spreadsheet I want for each chunk. Each dimension must have a full row on the page. Each dimension will have these column headers: 
Chunk Dimension	Document Name (last run), Generated Value, What Generated TYPE (i.e. AI generated, Mechanically Generated, Prior Generated), Precision Confidence Level for this Value, Accuracy Confidence Level for this Value, Description, Type, Allowed_Values_Format.
The dimension will be the first (fixed) column in the spreadsheet.

2. All 61 dimensions must be listed, so I can validate that they are being generated correctly.

3. We can create a "display" database table that can join all of the data for this output if it makes it simpler for the system. But the display table must be portray values actual fields in the database. Do not create extra db fields that duplicate normalized data already in the db.
																		
For each dimension per run I want to see these columns associated to that dimension.

4. Must be able to resize the horizontal width of the column on the page 

5. We want to be able to see ALL of this data in a web page that looks very much like a spreadsheet. It should have some of the same functions of a spreadsheet too, like sort by column value, filter by column value, header field.

6. The dimensions page for each chunk run shall contain as much of the information within one standard screen size as possible. I.E. Very much like a simple spreadsheet view with little space between rows or columns. It should be sortable by many columns (you pick the ones that should logically be sortable)

ii. Each results page must have a unique page name (e.g. chunk name + datetimestamp) so that multiple pages can be viewed at a time

iv. I must be able to look up and compare runs. I.e. a "run selector" each run can have chunk name & timestamp in the run name. The chunk selection should be on the "per chunk level". I.e. If I am looking at the Chunk A page, I should only see historical look ups for Chunk A.

v. The results page does NOT include the ability to tag or label any of these dimensions by a human. This iteration is dedicated to creating the default dimensions for a chunk. So it must generate the chunk dimension values using only the information collected from the current category module step.

How the agent must Execute this Product Build:

1. Read and check the current codebase in \src to evaluate how much of this has been done and what is left to do.

2. I have found that creating too many sequential tasks to develop a product creates situations where the current prompt redoes the work of the prior prompt and leads to a fragmented codebase. I have found it is preferential to have one large prompt that can work on as much as possible within the same context.

So come up with a strategy and specification wherein:
1. We do as much prework as possible that will not affect the final product build. Things that cannot lose context such as upgrading the database, adding the LLM API credentials,  or other required but not "in module code" work.
a. Segment the build prompts into as few prompts as possible (while still maintaining a high probability of a quality outcome).
b. For each individual prompt keep it as modular as possible. Meaning that the prompt should attempt to "finish" a feature, organically related of elements, sub-module, full pages, etc., so that the next prompt does not have to enhance the previous prompt, but instead can start work on an entirely new feature, organically related group of elements, sub-module, full pages, etc.
c. Clearly identify action steps that the human guide must execute them in the build process and make sure they do not add unnecessary context tokens to the build prompts.


Current Active Goal
You must take this unstructured specification and convert it into detailed task based build directives. These directives must be in the form of directions to the human who is building this with you (me) and prompts that I will be submitting to the 200k context window Claude 4.5 Sonnet Thinking LLM.
Make sure that each prompt is clearly and obviously marked so I can cut and paste the prompt into the LLM easily

Current Active Task
Before you build the new detailed task based build directives read this prompt carefully. Examine the codebases, tables, linked files, and all details carefully, and then think carefully and determine if you have questions that will help increase the quality of this build.

Put your initial analysis and questions about this feature build here: pmc\context-ai\pmct\c-alpha-build-spec_v3.3-dimensions-sheet-questions-and-analysis_v1.md