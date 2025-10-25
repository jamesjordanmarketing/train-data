Your Task Approach creation instructions are to:

1. Read the current active task in: pmc\core\active-task.md. Act as a senior software engineer who wants to produce the highest quality code and think about how you will approach the current active task. Also read the task carry over information here {{CONTEXT_CARRY_FILE_PATH}} for any additional information or special context from the agent that tested the previous task.

2. Replace the content in pmc\system\plans\task-approach\current-task-approach.md with your implementation approach for the current active task.

3. Extract the task ID from pmc\core\active-task.md line 1 and use it in the Task ID section of pmc\system\plans\task-approach\current-task-approach.md.

4. Follow these strict character limits:
   - Overview: Maximum 500 characters
   - Implementation Strategy: Maximum 3000 characters
   - Each Key Consideration bullet point: Maximum 200 characters

5. After analyzing the task, assign a confidence level (1-10) that reflects how confident you are that you can successfully implement the task with your proposed approach.

In the Overview:
- Write 2-3 concise sentences explaining your implementation approach
- Focus on how you'll solve the problem, not just restating requirements
- Highlight architectural patterns or technical approaches you'll use

In the Implementation Strategy:
- Break implementation into 3-5 numbered steps with bullet points for details
- Be specific about technical implementation details, not vague descriptions
- Reference specific task elements by their IDs where applicable
- Include implementation order if relevant

In the Key Considerations:
- List 3-5 critical technical constraints or requirements
- Include backward compatibility needs and dependencies
- Mention performance, security, or accessibility considerations if relevant

In the Confidence Level section:
- Rate your confidence from 1-10 that you can successfully complete this task using your proposed approach
- Consider complexity, your familiarity with similar tasks, and dependencies
- Be realistic - this will update the task's confidence field in active-task.md

When complete:
1. Save your approach to: pmc\system\plans\task-approach\current-task-approach.md
2. Remove ALL template comments (lines starting with <!--)
3. Delete this entire instruction section (everything between === markers)
4. Check character counts to ensure they're within limits

=======================