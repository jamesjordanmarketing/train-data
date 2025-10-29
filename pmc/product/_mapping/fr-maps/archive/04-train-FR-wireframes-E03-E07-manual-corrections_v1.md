| 1 | fp_marcus_002 | Marcus | RSUs confusion | Overwhelm→Confidence | 3 | 5/5 | convo-10-first_v1 |
| 2 | fp_marcus_003 | Marcus | Benefits panic | Panic→Relief | 4 | 5/5 | convo-10-first_v1 |
| 3 | fp_marcus_004 | Marcus | Inheritance guilt | Guilt→Permission | 4 | 5/5 | convo-10-first_v1 |
| 4 | fp_marcus_005 | Marcus | Home buying fear | Anxiety→Clarity | 5 | 5/5 | convo-10-first_v1 |
| 5 | fp_marcus_006 | Marcus | Debt shame | Shame→Determination | 4 | 5/5 | convo-10-first_v1 |
| 6 | fp_jennifer_001 | Jennifer | Post-divorce investing | Skepticism→Hope | 4 | 5/5 | convo-10-first_v1 |
| 7 | fp_jennifer_002 | Jennifer | Life insurance anxiety | Anxiety→Confidence | 3 | 5/5 | convo-10-first_v1 |
| 8 | fp_jennifer_003 | Jennifer | College savings overwhelm | Inadequacy→Relief | 4 | 5/5 | convo-10-first_v1 |
| 9 | fp_david_001 | David | Career transition | Excitement+Concern→Empowerment | 4 | 5/5 | convo-10-first_v1 |
| 10 | fp_david_002 | David | Wedding debt vs house | Frustration→Clarity | 3 | 5/5 | convo-10-complete |


--------done below---------

ok this prompt is too long:


You need to make the following improvements and changes.

1. Sidebar navigation is not consistent with our current style (see @https://chunks-alpha.vercel.app/upload as an example of the current UI style)
Change the FIGMA prompt so that it requires a top level navigation style. Update any sections that need to now align with this requirement.


2. Remove the entire Coverage & Quality Analytics section
This is not what we want and is not relevant to this build. Remove the entire screen/page and any interfaces to it and the coverage analytics functionality.

3. The table scenario line items that need to be submitted do not have any submit buttons this is critical. For now it when pressed, it can say "coming soon" but they need to be there. It appears that the entire flow described here: ### Primary User Flows is not built

4. "The Templates" what is that supposed to be? Is it the prompt templates? If so call that screen "Scenario Prompts". There should only be 3:
  * [Templates]
  * [Scenarios]
  * [Edge Cases]

Also we must be able to edit them.

5. Scenarios on the scenario page
These scenarios are a collection of conversation topics + persona + emotional arc. Thus would be more helpful for the scenarios screen would be a table that shows all the possible scenarios as independent fields of each including the persona, topic, emotional arc. It also shows the status of that specific scenario as to whether a conversation JSON has been generated for that scenario. 


6. Core functionality
At root the required operational functionality is:

a. Generate one conversation = hit the "Generate" Conversation button on any table line item. When that happens the backend (not developed yet and you are not doing it yet either) it selects the best prompt Template for that option, it fills that template with the specific variables for that conversation (conversation topics + persona + emotional arc), then runs the prompt, then creates the JSON conversation and uploads it to the SupaBase database.

b. Generate multiple conversations = choose the checkboxes for all the conversation on the dashboard or review page the "Generate" Conversation button on any table line item. When that happens the backend it selects the best prompt Template for each scenario, it fills each template with the specific variables for that conversation (conversation topics + persona + emotional arc), then runs the prompts, sequentially, then creates the JSON conversation and uploads it to the SupaBase database. You can process all conversations by selecting all checkboxes (check all is an option)

7. The review page is only good for either selecting a conversation to generate, a error state for that conversation, or an export button that lets you export the JSON conversation for review (don't create new pages for JSON review yet)

8. For the main conversation dashboard. Don't have two rows of data display. Totally remove the "Conversation Tiers" row/box

Ok. Take all of this feedback and implement it into this current version of the data-train module.



-------above done-------------




