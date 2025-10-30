# Parameter Injection Engine - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### 1. Basic Usage

```typescript
import { injectParameters } from '@/lib/ai';

const result = injectParameters(
  "Hello {{name}}!",
  [{ name: 'name', type: 'text', defaultValue: '' }],
  { name: 'Alice' }
);

console.log(result.resolved); // "Hello Alice!"
```

### 2. Check for Errors

```typescript
if (result.success) {
  // Use result.resolved
  console.log(result.resolved);
} else {
  // Show errors to user
  console.error(result.errors);
  console.error('Missing:', result.missingRequired);
}
```

### 3. Generate Preview (for UI)

```typescript
import { generatePreview } from '@/lib/ai';

const preview = generatePreview(template, parameters);

console.log(preview.preview);  // Resolved template
console.log(preview.valid);    // true/false
console.log(preview.errors);   // Array of error messages
```

## 📝 Template Syntax

### Simple Placeholders
```typescript
"Hello {{name}}"                    // ✅ Simple variable
"{{firstName}} {{lastName}}"        // ✅ Multiple variables
```

### Dot Notation
```typescript
"Email: {{user.email}}"             // ✅ Object property access
"{{profile.settings.theme}}"        // ❌ Only 1 level deep allowed
```

### Ternary Conditionals
```typescript
"{{active ? 'Yes' : 'No'}}"         // ✅ Simple ternary
"{{premium ? 'Pro' : 'Free'}}"      // ✅ Conditional text
"{{a ? (b ? 'x' : 'y') : 'z'}}"     // ❌ No nested ternaries
```

## 🛡️ Security Features (Automatic)

### HTML Escaping (On by Default)
```typescript
Input:  "<script>alert('xss')</script>"
Output: "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
```

### Dangerous Content Rejection
```typescript
❌ Rejected: "'; DROP TABLE users;--"      // SQL injection
❌ Rejected: "<img onerror=alert(1)>"      // XSS
❌ Rejected: "{{eval('evil')}}"            // Code injection
✅ Allowed:  "Hello & Welcome"             // Safe content (escaped)
```

## ⚡ Common Patterns

### Pattern 1: Validate Before Generation

```typescript
import { validateTemplateResolution, injectParameters } from '@/lib/ai';

// Pre-flight check
const validation = validateTemplateResolution(template, parameters);

if (!validation.valid) {
  toast.error(validation.errors.join(', '));
  return;
}

// Safe to proceed
const result = injectParameters(
  template.structure,
  template.variables,
  parameters
);
```

### Pattern 2: Real-time Preview in UI

```typescript
import { generatePreview } from '@/lib/ai';
import { useEffect, useState } from 'react';

function TemplateEditor() {
  const [params, setParams] = useState({});
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (selectedTemplate) {
      const result = generatePreview(selectedTemplate, params);
      setPreview(result.preview);
      setErrors(result.errors);
    }
  }, [selectedTemplate, params]);

  return (
    <div>
      {/* Parameter inputs */}
      {/* ... */}
      
      {/* Preview */}
      <div className="preview">{preview}</div>
      
      {/* Errors */}
      {errors.length > 0 && (
        <div className="errors">
          {errors.map(e => <div key={e}>{e}</div>)}
        </div>
      )}
    </div>
  );
}
```

### Pattern 3: Batch Processing

```typescript
import { batchInjectParameters } from '@/lib/ai';

const parameterSets = [
  { name: 'Alice', role: 'Admin' },
  { name: 'Bob', role: 'User' },
  { name: 'Charlie', role: 'Guest' },
];

const results = batchInjectParameters(template, parameterSets);

results.forEach((result, i) => {
  if (result.success) {
    console.log(`Result ${i}:`, result.resolved);
  } else {
    console.error(`Error ${i}:`, result.errors);
  }
});
```

### Pattern 4: Generate Sample Data

```typescript
import { generateSampleParameters } from '@/lib/ai';

// Auto-fill form with sample values
const handleAutoFill = () => {
  const samples = generateSampleParameters(template.variables);
  setParameters(samples);
};
```

## ⚠️ Common Mistakes

### ❌ Mistake 1: Not Checking Success
```typescript
// BAD - doesn't check for errors
const result = injectParameters(template, vars, params);
sendToAPI(result.resolved);  // Might contain unresolved placeholders!

// GOOD - check success first
const result = injectParameters(template, vars, params);
if (result.success) {
  sendToAPI(result.resolved);
} else {
  handleErrors(result.errors);
}
```

### ❌ Mistake 2: Disabling HTML Escaping
```typescript
// BAD - vulnerable to XSS
const result = injectParameters(template, vars, params, {
  escapeHtml: false  // ⚠️ DANGEROUS!
});

// GOOD - use default (escaping enabled)
const result = injectParameters(template, vars, params);
```

### ❌ Mistake 3: Not Validating User Input
```typescript
// BAD - directly injecting user input
const userInput = getUserInput();
const result = injectParameters(template, vars, { param: userInput });

// GOOD - validation happens automatically
// The system will reject dangerous content
const result = injectParameters(template, vars, { param: userInput });
if (!result.success) {
  // Show user-friendly error
  toast.error("Input contains invalid characters");
}
```

### ❌ Mistake 4: Complex Template Expressions
```typescript
// BAD - not supported
"{{user.profile.settings.theme}}"  // Only 1 level deep
"{{array[0]}}"                      // No array access
"{{a + b}}"                         // No math operations
"{{func()}}"                        // No function calls

// GOOD - keep it simple
"{{theme}}"                         // Simple variable
"{{user.theme}}"                    // One level dot notation
"{{isPremium ? 'Pro' : 'Free'}}"    // Simple ternary
```

## 🔍 Debugging

### Check What Was Parsed

```typescript
import { extractPlaceholders } from '@/lib/ai';

const placeholders = extractPlaceholders("Hello {{name}}, you are {{age}}");
console.log(placeholders); // ['name', 'age']
```

### Inspect Resolution Result

```typescript
const result = injectParameters(template, vars, params);

console.log('Original:', result.original);
console.log('Resolved:', result.resolved);
console.log('Parameters:', result.parameters);
console.log('Missing:', result.missingRequired);
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);
console.log('Success:', result.success);
```

### Enable Audit Logging

```typescript
const result = injectParameters(template, vars, params, {
  auditLog: true,              // Enable logging
  userId: 'user123',           // For audit trail
  templateId: 'template456',   // For audit trail
});

// Check console for [SECURITY_AUDIT] logs
```

## 📊 Performance Tips

### Tip 1: Memoize Preview Generation

```typescript
import { useMemo } from 'react';

const preview = useMemo(() => {
  return generatePreview(template, parameters);
}, [template, parameters]);
```

### Tip 2: Debounce Real-time Preview

```typescript
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const debouncedPreview = useMemo(
  () => debounce((t, p) => {
    const result = generatePreview(t, p);
    setPreview(result.preview);
  }, 300),
  []
);

useEffect(() => {
  debouncedPreview(template, parameters);
}, [template, parameters]);
```

### Tip 3: Validate Once, Inject Many

```typescript
// Validate template once
const validation = validateTemplateResolution(template, {});
if (!validation.valid) {
  throw new Error('Invalid template');
}

// Then inject many times without re-validating template structure
const results = parameterSets.map(params =>
  injectParameters(template.structure, template.variables, params)
);
```

## 🆘 Need Help?

### Documentation
- **Full Guide**: `docs/parameter-injection-guide.md`
- **API Reference**: See "API Reference" section in full guide
- **Examples**: See "Usage Examples" in full guide

### Testing
- **Security Tests**: `src/lib/ai/__tests__/security.test.ts`
- **Functionality Tests**: `src/lib/ai/__tests__/parameter-injection.test.ts`
- Run tests: `npm test`

### Common Issues
- Template syntax errors → Check allowed patterns above
- Validation failures → Check `result.errors` and `result.missingRequired`
- Performance issues → Use debouncing and memoization
- Security concerns → All handled automatically, just use default settings

## 📚 Next Steps

1. Read full guide: `docs/parameter-injection-guide.md`
2. Review examples in test files
3. Experiment in SingleGenerationForm component
4. Check implementation summary: `PARAMETER_INJECTION_IMPLEMENTATION.md`

---

**Last Updated:** October 30, 2025  
**Version:** 1.0.0

