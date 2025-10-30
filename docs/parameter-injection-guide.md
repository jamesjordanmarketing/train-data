# Parameter Injection Engine - Implementation Guide

## Overview

The Parameter Injection Engine is a security-first template parameter resolution system that safely injects user-provided values into conversation generation templates. It includes comprehensive validation, HTML escaping, and protection against common attack vectors.

## ⚠️ Security Notice

This system handles user input and template resolution. All changes must be reviewed for security implications before deployment.

## Architecture

```
src/lib/ai/
├── security-utils.ts          # HTML escaping, sanitization, pattern detection
├── parameter-validation.ts    # Type validation, required parameter checks
├── parameter-injection.ts     # Core template resolution logic
└── __tests__/
    ├── security.test.ts       # Security vulnerability tests
    └── parameter-injection.test.ts  # Functionality tests
```

## Features

### 1. Template Placeholder Resolution

Supports three types of placeholders:

#### Simple Placeholders
```typescript
Template: "Hello {{name}}, welcome!"
Parameters: { name: "Alice" }
Result: "Hello Alice, welcome!"
```

#### Dot Notation
```typescript
Template: "Email: {{user.email}}"
Parameters: { user: { email: "alice@example.com" } }
Result: "Email: alice@example.com"
```

#### Ternary Conditionals
```typescript
Template: "Status: {{active ? 'Active' : 'Inactive'}}"
Parameters: { active: true }
Result: "Status: Active"
```

### 2. Parameter Validation

- **Type Validation**: Ensures parameters match expected types (text, number, dropdown)
- **Required Parameters**: Validates all required parameters are present
- **Range Validation**: Numbers must be finite and within acceptable ranges
- **Enum Validation**: Dropdown values must match defined options

### 3. Security Features

#### XSS Protection
All user input is HTML-escaped by default:
```typescript
Input: "<script>alert('xss')</script>"
Output: "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
```

#### SQL Injection Prevention
Detects and rejects SQL injection patterns:
```typescript
❌ Rejected: "'; DROP TABLE users;--"
❌ Rejected: "' UNION SELECT password FROM users"
❌ Rejected: "admin' OR '1'='1"
```

#### Template Injection Prevention
Only safe template expressions allowed:
```typescript
✅ Allowed: {{name}}
✅ Allowed: {{user.email}}
✅ Allowed: {{active ? 'Yes' : 'No'}}
❌ Blocked: {{eval("evil")}}
❌ Blocked: {{__import__("os").system("rm -rf /")}}
❌ Blocked: {{array[0]}}
```

#### DoS Protection
Rejects extremely long strings (>10,000 characters) to prevent memory exhaustion attacks.

## Usage Examples

### Basic Usage

```typescript
import { injectParameters } from '@/lib/ai';
import { Template, TemplateVariable } from '@/lib/types';

const template = "Hello {{name}}, you are {{age}} years old.";

const variables: TemplateVariable[] = [
  { name: 'name', type: 'text', defaultValue: '' },
  { name: 'age', type: 'number', defaultValue: '' },
];

const parameters = {
  name: 'Alice',
  age: 30,
};

const result = injectParameters(template, variables, parameters);

if (result.success) {
  console.log(result.resolved);
  // Output: "Hello Alice, you are 30 years old."
} else {
  console.error('Errors:', result.errors);
  console.error('Missing:', result.missingRequired);
}
```

### With Options

```typescript
const result = injectParameters(template, variables, parameters, {
  escapeHtml: true,        // Escape HTML entities (default: true)
  throwOnMissing: false,   // Throw error on missing required params (default: false)
  auditLog: true,          // Log security events (default: true)
  userId: 'user123',       // For audit logging
  templateId: 'template1', // For audit logging
});
```

### Preview Generation

```typescript
import { generatePreview } from '@/lib/ai';

const preview = generatePreview(template, parameters);

console.log('Preview:', preview.preview);
console.log('Valid:', preview.valid);
console.log('Errors:', preview.errors);
```

### Pre-flight Validation

```typescript
import { validateTemplateResolution } from '@/lib/ai';

const validation = validateTemplateResolution(template, parameters);

if (validation.valid) {
  // Safe to proceed with generation
  const result = injectParameters(template.structure, template.variables, parameters);
} else {
  // Show errors to user
  console.error('Validation errors:', validation.errors);
}
```

### Batch Processing

```typescript
import { batchInjectParameters } from '@/lib/ai';

const parameterSets = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 },
];

const results = batchInjectParameters(template, parameterSets);

results.forEach((result, index) => {
  if (result.success) {
    console.log(`Result ${index}:`, result.resolved);
  }
});
```

### Sample Value Generation

```typescript
import { generateSampleParameters } from '@/lib/ai';

const samples = generateSampleParameters(template.variables);

console.log('Sample values:', samples);
// { name: 'Sample name', age: 42 }
```

## Integration with UI Components

### SingleGenerationForm Integration

The parameter injection engine is integrated into `SingleGenerationForm.tsx`:

1. **Template Selection**: User selects a template with variables
2. **Parameter Inputs**: Dynamic form fields generated based on template variables
3. **Real-time Preview**: Shows resolved template as user types
4. **Validation Display**: Shows errors for invalid or missing parameters
5. **Auto-fill**: Generates sample values for quick testing

Example component usage:

```tsx
// Template parameter state
const [templateParameters, setTemplateParameters] = useState<Record<string, any>>({});
const [previewText, setPreviewText] = useState('');
const [previewErrors, setPreviewErrors] = useState<string[]>([]);

// Update preview when parameters change
useEffect(() => {
  if (selectedTemplate) {
    const preview = generatePreview(selectedTemplate, templateParameters);
    setPreviewText(preview.preview);
    setPreviewErrors(preview.errors);
  }
}, [selectedTemplate, templateParameters]);

// Handle parameter change
const handleParameterChange = (paramName: string, value: any) => {
  setTemplateParameters(prev => ({
    ...prev,
    [paramName]: value,
  }));
};
```

## API Reference

### Core Functions

#### `injectParameters()`
Main function for parameter injection.

```typescript
function injectParameters(
  template: string,
  variables: TemplateVariable[],
  parameterValues: Record<string, any>,
  options?: InjectionOptions
): ResolvedTemplate
```

**Returns:**
```typescript
interface ResolvedTemplate {
  original: string;
  resolved: string;
  parameters: Record<string, any>;
  missingRequired: string[];
  errors: ParameterError[];
  success: boolean;
  warnings: string[];
}
```

#### `generatePreview()`
Generate template preview for UI display.

```typescript
function generatePreview(
  template: Template,
  parameterValues: Record<string, any>
): {
  preview: string;
  valid: boolean;
  errors: string[];
}
```

#### `validateTemplateResolution()`
Pre-flight validation before generation.

```typescript
function validateTemplateResolution(
  template: Template,
  parameterValues: Record<string, any>
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

### Security Functions

#### `escapeHtml()`
Escapes HTML special characters.

```typescript
function escapeHtml(input: string): string
```

#### `sanitizeInput()`
Sanitizes and validates user input.

```typescript
function sanitizeInput(
  input: string,
  fieldName?: string
): string
// Throws: Error if dangerous patterns detected
```

#### `isSafeTemplateString()`
Validates template structure for security.

```typescript
function isSafeTemplateString(template: string): boolean
```

### Validation Functions

#### `validateAllParameters()`
Validates all parameters against template definitions.

```typescript
function validateAllParameters(
  variables: TemplateVariable[],
  parameterValues: Record<string, any>,
  requiredParams?: string[]
): ValidationReport
```

#### `preGenerationValidation()`
Comprehensive validation before template generation.

```typescript
function preGenerationValidation(
  variables: TemplateVariable[],
  parameterValues: Record<string, any>
): ValidationReport
```

## Security Testing

### Running Tests

```bash
# Run all tests
npm test

# Run security tests only
npm test security.test.ts

# Run parameter injection tests
npm test parameter-injection.test.ts
```

### Test Coverage

The test suite includes:

1. **XSS Attack Scenarios** (5+ real-world payloads)
2. **SQL Injection Scenarios** (4+ attack patterns)
3. **Template Injection Scenarios** (5+ code execution attempts)
4. **Prototype Pollution Tests**
5. **Real-world Attack Payloads** (10+ known XSS vectors)

### Adding New Security Tests

When adding new attack vectors:

```typescript
test('should detect [attack type]', () => {
  const maliciousInput = '[payload]';
  expect(containsDangerousPattern(maliciousInput)).toBe(true);
  expect(() => sanitizeInput(maliciousInput, 'test')).toThrow();
});
```

## Performance Benchmarks

### Target Metrics

- ✅ Parameter resolution: <50ms for 10 variables
- ✅ Validation: <20ms
- ✅ Preview updates: No visible lag

### Performance Test

```typescript
test('should resolve 10 variables in under 50ms', () => {
  const start = Date.now();
  const result = injectParameters(template, variables, params);
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(50);
});
```

## Best Practices

### 1. Always Validate Before Generation

```typescript
// ✅ Good
const validation = validateTemplateResolution(template, params);
if (validation.valid) {
  const result = injectParameters(template.structure, template.variables, params);
}

// ❌ Bad - no validation
const result = injectParameters(template.structure, template.variables, params);
```

### 2. Use Audit Logging in Production

```typescript
// ✅ Good - enables security audit trail
injectParameters(template, variables, params, {
  auditLog: true,
  userId: currentUser.id,
  templateId: template.id,
});

// ❌ Bad - no audit trail
injectParameters(template, variables, params, { auditLog: false });
```

### 3. Show User-Friendly Error Messages

```typescript
// ✅ Good
const result = injectParameters(template, variables, params);
if (!result.success) {
  const messages = formatValidationErrors({
    valid: false,
    errors: result.errors,
    missingRequired: result.missingRequired,
    warnings: result.warnings,
  });
  toast.error(messages.join(', '));
}

// ❌ Bad - raw error objects
if (!result.success) {
  toast.error(JSON.stringify(result.errors));
}
```

### 4. Sanitize All User Input

```typescript
// ✅ Good - validated and escaped
const result = injectParameters(template, variables, params, {
  escapeHtml: true, // default
});

// ❌ Bad - raw user input without escaping
const result = injectParameters(template, variables, params, {
  escapeHtml: false,
});
```

## Troubleshooting

### Common Issues

#### Issue: "Template contains unsafe expressions"

**Cause:** Template uses forbidden syntax like function calls or complex expressions.

**Solution:** Use only allowed placeholder types:
- Simple: `{{variable}}`
- Dot notation: `{{object.property}}`
- Ternary: `{{condition ? 'yes' : 'no'}}`

#### Issue: "Parameter contains potentially dangerous content"

**Cause:** User input contains XSS, SQL injection, or other malicious patterns.

**Solution:** 
1. Reject the input
2. Ask user to remove dangerous content
3. Show specific error message about what was detected

#### Issue: "Missing required parameters"

**Cause:** Required template variables not provided.

**Solution:**
1. Check `result.missingRequired` for list of missing parameters
2. Either provide the missing values or make them optional with default values

#### Issue: Preview not updating

**Cause:** React dependency array missing variables.

**Solution:**
```typescript
useEffect(() => {
  if (selectedTemplate && showPreview) {
    const preview = generatePreview(selectedTemplate, templateParameters);
    setPreviewText(preview.preview);
    setPreviewErrors(preview.errors);
  }
}, [selectedTemplate, templateParameters, showPreview]); // ✅ All dependencies
```

## Future Enhancements

### Planned Features

1. **Advanced Conditionals**: Support for more complex logic
2. **Filters/Formatters**: e.g., `{{date | format('YYYY-MM-DD')}}`
3. **Loops**: `{{#each items}}...{{/each}}`
4. **Localization**: Parameter injection with i18n support
5. **Custom Validators**: Plugin system for domain-specific validation

### Security Roadmap

1. ✅ HTML escaping (Implemented)
2. ✅ XSS protection (Implemented)
3. ✅ SQL injection detection (Implemented)
4. ✅ Template injection prevention (Implemented)
5. 🔄 Content Security Policy headers (Defined, needs backend integration)
6. ⏳ Rate limiting (Planned)
7. ⏳ Advanced obfuscation detection (Planned)

## Contributing

### Adding New Features

1. Write security tests first
2. Implement feature with security in mind
3. Update documentation
4. Run full test suite
5. Security review required

### Reporting Security Issues

**DO NOT** file public issues for security vulnerabilities.

Contact: security@example.com

## License

[Your License Here]

## Support

For questions or issues:
- Documentation: This file
- Tests: `src/lib/ai/__tests__/`
- Examples: See "Usage Examples" section above

