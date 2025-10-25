To be done:


Read:
`C:\Users\james\Master\BrightHub\BRun\categ-module\pmc\product\01-bmo-overview.md`
and
`C:\Users\james\Master\BrightHub\BRun\categ-module\pmc\context-ai\pmct\04-data-gathering_v2.md`

So you understand the context of this task. `C:\Users\james\Master\BrightHub\BRun\categ-module\pmc\context-ai\pmct\04-data-gathering_v2.md` also contains all of attributes needed to accurately create LoRA data training data.

Your job is to create the next iteration of the module outlined here: `C:\Users\james\Master\BrightHub\BRun\categ-module\pmc\context-ai\pmct\04-data-gathering_v2.md`:
This new iteration of the module has the following requirements:

1. Dashboard dedicated to document knowledge processing. The main page for all document knowledge processing dashboard is dedicated to the presentation of the documents that have been categorized so far by the document categorization module. The main page of the document dashboard serves as an inventory of the documents that are ready to be processed for document knowledge. Include document wide knowledge metadata that is practical to display (include % of metadata completed). 

2. Pressing the "Document Knowledge" button on a document leads to a document dashboard for that specific document. The dashboard uses the entire page with the name of that document file in the headline.

3. It has already (in batch) scanned the document and segmented it into chapters. If natural chapters are not named in the document our AI engine will attempt to segment it into sequential chapters. It can name it's own chapters based on the sequence and topic/purpose if needed.
Sequential "chapter" based chunks are not the only type of segments we will show in this inventory. For now lets just have one more type of chunk. The "process chunk" which is a chunk or segment that contains a proprietary process or steps (not a "framework")

4. Selecting a chunk, segment, or chapter leads to the full metadata presentation of that chunk. The 1st page of the chunk  dashboard serves as an inventory of the attributes already or soon to be collected about that chunk.

5. Overall Principles
a. The current knowledge about the document is arranged in such a way that it gives the business owner client an intuitive confidence that we (Bright Run) have our hands wrapped around the document's world of knowledge we already know or the knowledge we still need (i.e. at least we know we need it). It is also interesting to the business owner user, as they have never been introduced to the concepts of a document's semantic and ontological knowledge and attributes. Labeling a document in real time also gives even them (the author usually) more information about the document.

Within the design pre-design space for LOTS of tool tips. As for each attribute it will be very helpful if we can provide in depth content that explains the purpose and goals of that attribute.


b. Although there are a lot of dimensions that it would be helpful to know about a document we must encumber the user/client needing to engage with as few of the dimensions as possible. This means:

i. Where possible don't collect information that can be derived from the combination or AI processing of other attributes that are know or will be provided by the customer. I.E. If we need three elements of information, but the answer to the first 2 will give the answer to the third, then don't ask the user the third. Let the AI processing do it later.

ii. If an attribute has a low usefulness value or knowledge impact, don't collect that information. This product does not need PHD level document attribution. This is for business owners who are most concerned with speed and "good enough to do the job" quality.


6. Read `C:\Users\james\Master\BrightHub\BRun\categ-module\pmc\context-ai\pmct\04-data-gathering_v2.md` again carefully and think about how best to elegantly both present and collect the correct attributes and context about each chunk/segment/chapter. Make the information requests relevant, interesting and intuitive for the business owner. Create a LoRA attributes mapping rosetta stone as appropriate. Don't ask for the client to think. Where possible you have already created the correct information using our AI engine. You are mainly just asking for approval with in place editing if needed.


Then read an example Figma Wireframe prompt here 
`C:\Users\james\Master\BrightHub\brun\categ-module\pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md`


Your task in this prompt is to create a Figma Wireframe prompt that matches the format, structure, content conventions, and sections of `C:\Users\james\Master\BrightHub\brun\categ-module\pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md`

while building a wireframe prompt for the specification that I describe above in this document.

Put the new Figma wireframe prompt here:
`C:\Users\james\Master\BrightHub\brun\categ-module\pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v3.md`




SCRATCH SCRATCH-----------------------------


We also need to structure the knowledge that we still need to gather 


4. Once Process Knowledge is clicked the AI engine processes the document and does the following:
We need a soup to nuts characterization of the document. So the
following dimensions

Top Level Semantic Overview
It does a deep scan of the document. It segments the document into chapters. If natural chapters are not named in the document our AI engine will attempt to segment it into chapters. It can name it's own chapters based on the sequence and topic/purpose

For each chapter it will automatically 

1. 

2. A summary of the main "purposes" of the document.
It will give a listing of the top 3 purposes of the document. It can use the previously collected categories and tags to help with this. 

4. Name the themes of the document 


It can use the previously collected categories and tags to help with this.

It must use our fine tuned AI system 

 a. Categorizes it into "chapters" or semantic & ontological groups. It must do this for the whole document.
 b. 




before we create this. first create a map between what we are collecting and what we need




----------------
Original Prompt and Responses
----------------


ok now I need you create an updated version of the driver prompt that creates the wireframe figma prompt.

You can read the current version here: pmc\product\_mapping\fr-maps\prompts\04-FR-wireframes-prompt-E03-gather_v1.md

You are going to:
Adapt this prompt to apply to the gather input spec here: 
pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-E03-gather-module_v2.md
So you must map section names and intent, adapt the content of the prompt to apply specifically to the FR's, acceptance requirements and product requirements. 
Map file references too.

Also there is not user journey for this specific module though in this document pmc\product\03.5-bmo-user-journey.md the closest thing to it is section 
`## 3. Knowledge Exploration & Intelligent Organization

**STAGE 3: Knowledge Exploration & Intelligent Organization**` and it's subtasks. I do want to collect such things as 
   - User goals and workflows for this stage
   - Emotional journey points
   - Success celebration moments
based on that section 3. So make sure the prompt can execute using that journey file and location.

Put the final version of this prompt here: 
pmc\product\_mapping\fr-maps\prompts\04-FR-wireframes-prompt-E03-gather_v2.md

-----------------------------
-----------------------------

Original Prompt that created the above spec:


I need you to read and deeply understand the entire codebase here: categ-module
This document was the original spec that created that codebase: 
`C:\Users\james\Master\BrightHub\brun\categ-module\pmc\product\_seeds\seed-narrative-v1.md'
The codebase has been upgraded and improved from that original spec.
The reason we must learn all of this is because I need to find out if we have enough meta data to produce high quality Training Data Generation.
Before you evaluate the meta data read these:
`C:\Users\james\Master\BrightHub\brun\categ-module\pmc\product\01-bmo-overview.md` to understand the whole project
and
`C:\Users\james\Master\BrightHub\brun\categ-module\pmc\product\03-bmo-functional-requirements_current-full.md`

Specific to this task: section **FR3.1.3:** (lines 272 - 299) of `C:\Users\james\Master\BrightHub\brun\categ-module\pmc\product\03-bmo-functional-requirements_current-full.md` is what we just implemented
Section **FR4.1.1:** (lines 301 - 299) of `C:\Users\james\Master\BrightHub\brun\categ-module\pmc\product\03-bmo-functional-requirements_current-full.md` is what we must do next.
So questions are:

1. Based on the information we are currently gathering via the codebase, are we gathering enough metadata/tags/information about the documents to enable us to generate a quality 1st draft of LoRA training data?

2. Do we need chunk level content tagging? This level of tagging, though I see it in technical LoRA apps, is almost impossible for small business owners (our ideal client) to tag. Reasons include: too much work, too confusing, business owner mental perfection (unable to exclude concepts via label)
If we do need chunks, we need a strategy to select and present chunks that a small business owner can understand as emblematic of the document section. 

Better than verbatim chunks would be an ai driven system that creates detailed summaries of a given document or document portion and then has an interface with the ai driven analysis in a text editor window that the business owner can then read and customize easily.

Would this be sufficient for gathering a powerfully helpful data to understanding each document?

3. As you can see in the current codebase we designed a information categorization system that was MEANINGFUL to our business owner client.
This is key to our LoRA generation product. We must gather information 
that is meaningful and important to the client. That is the only way they will spend the time give the information. Helpful to the business owner client does NOT mean educating them (they don't want that). It means making it easy for them give us the information.
We can use AI to gather and present meta data and content from the input document. This will make it easier for the business owner to approve & edit.

But first we must 
a. Define what data we MUST still collect
b. How to collect that data from the business owner by asking them questions that they already know the answer to.
c. I guess what I am looking for a process just as easy and frictionless as the current wireframe. Just as intuitive and easy to gather further information needed.

I do NOT like these type of data collection options:
`
*"Help us understand the business value of this content"*
- "What business problem does this content solve?"
- "What results have you seen when people follow this approach?"
- "How is your approach different from what competitors do?"
- "What happens when someone doesn't follow this process?"
- "Who in your organization uses this information most?"
`
The questions are too open ended, vague, requires the business owner to "think" and become insecure.

If the module could reliably select chunks and provide both the full question the chunk asks, and the full answer, that may work.
Remember the core benefit of our application: 

`### Core Benefit: AI That Preserves and Reflects Proprietary Knowledge
The platform transforms a business’s **proprietary expertise**—its philosophies, processes, methodologies, and unique voice—into a structured cognitive asset. This dataset captures not only operational know-how, but also the deeper layers of business wisdom: belief systems, value propositions, domain-specific knowledge, and communication style.
By fine-tuning AI models on this structured representation, small business owners and domain experts gain more than just technology—they gain an AI that **thinks with their business philosophy, communicates in their authentic voice, and applies their distinctive methodologies and processes**.
Instead of delivering generic, one-size-fits-all responses, the resulting models reflect the organization’s most seasoned expert—offering answers and insights that embody its **unique value propositions, proprietary processes, wisdom, and guiding philosophies**.`
ok do your analysis and answer the questions. Write your full response here: `C:\Users\james\Master\BrightHub\brun\categ-module\pmc\context-ai\pmct\04-data-gathering_v2.md`



