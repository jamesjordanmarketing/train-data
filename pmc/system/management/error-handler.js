const fs = require('fs');
const path = require('path');

// Track error attempts
const errorAttempts = new Map();

// Maximum retry attempts
const MAX_RETRIES = 3;

// Log an error and determine if we should retry
function handleError(taskId, elementId, error) {
  const errorKey = `${taskId}-${elementId}-${error.message}`;
  
  // Initialize if not tracked
  if (!errorAttempts.has(errorKey)) {
    errorAttempts.set(errorKey, 1);
  } else {
    errorAttempts.set(errorKey, errorAttempts.get(errorKey) + 1);
  }
  
  // Get current attempt count
  const attempts = errorAttempts.get(errorKey);
  
  // Log error to task-context.md
  appendErrorToTaskContext(taskId, elementId, error, attempts);
  
  // Return if we should retry
  return {
    shouldRetry: attempts <= MAX_RETRIES,
    attempts: attempts
  };
}

// Append error to task context
function appendErrorToTaskContext(taskId, elementId, error, attempts) {
  // Read task context file
  const taskContextPath = path.join(process.cwd(), 'task-context.md');
  let taskContext = fs.readFileSync(taskContextPath, 'utf8');
  
  // Check if Errors section exists
  const errorsSection = '## Errors Encountered';
  if (!taskContext.includes(errorsSection)) {
    taskContext += `\n${errorsSection}\nNone yet\n`;
  }
  
  // Format error entry
  const timestamp = new Date().toISOString();
  const errorEntry = `- [${timestamp}] Error in ${elementId}: ${error.message}\n  - Attempt: ${attempts}/${MAX_RETRIES}\n  - Stack: ${error.stack ? error.stack.split('\n')[0] : 'No stack trace'}\n`;
  
  // Replace "None yet" if present
  if (taskContext.includes(`${errorsSection}\nNone yet`)) {
    taskContext = taskContext.replace(`${errorsSection}\nNone yet`, `${errorsSection}\n${errorEntry}`);
  } else {
    // Otherwise append to errors section
    const errorsSectionIndex = taskContext.indexOf(errorsSection) + errorsSection.length;
    taskContext = taskContext.substring(0, errorsSectionIndex) + 
                 '\n' + errorEntry + 
                 taskContext.substring(errorsSectionIndex);
  }
  
  // Write updated task context
  fs.writeFileSync(taskContextPath, taskContext);
}

// Reset error tracking for a task/element
function resetErrorTracking(taskId, elementId) {
  // Remove all errors for this task/element
  for (const [key, _] of errorAttempts.entries()) {
    if (key.startsWith(`${taskId}-${elementId}`)) {
      errorAttempts.delete(key);
    }
  }
}

module.exports = {
  handleError,
  resetErrorTracking
};