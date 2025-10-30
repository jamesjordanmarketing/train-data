/**
 * Parameter Injection Tests
 * 
 * Tests for template parameter resolution, validation, and injection.
 */

import { Template, TemplateVariable } from '../../../lib/types';
import {
  injectParameters,
  extractPlaceholders,
  generatePreview,
  validateTemplateResolution,
  batchInjectParameters,
  generateSampleParameters,
} from '../parameter-injection';

describe('Parameter Injection - Placeholder Extraction', () => {
  describe('extractPlaceholders', () => {
    test('should extract simple placeholders', () => {
      const template = 'Hello {{name}}, welcome to {{city}}!';
      expect(extractPlaceholders(template)).toEqual(['name', 'city']);
    });

    test('should extract unique placeholders only', () => {
      const template = '{{name}} and {{name}} are friends';
      expect(extractPlaceholders(template)).toEqual(['name']);
    });

    test('should extract placeholders with dot notation', () => {
      const template = 'Email: {{user.email}}, Name: {{user.name}}';
      expect(extractPlaceholders(template)).toEqual(['user']);
    });

    test('should extract condition from ternary', () => {
      const template = "Status: {{active ? 'Active' : 'Inactive'}}";
      expect(extractPlaceholders(template)).toEqual(['active']);
    });

    test('should handle mixed placeholder types', () => {
      const template = "{{name}} - {{user.email}} - {{premium ? 'Pro' : 'Free'}}";
      expect(extractPlaceholders(template).sort()).toEqual(['name', 'premium', 'user'].sort());
    });

    test('should return empty array for template without placeholders', () => {
      expect(extractPlaceholders('Hello World')).toEqual([]);
    });

    test('should handle malformed placeholders gracefully', () => {
      const template = '{{invalid placeholder with spaces}}';
      expect(extractPlaceholders(template)).toEqual([]);
    });
  });
});

describe('Parameter Injection - Simple Placeholder Resolution', () => {
  const variables: TemplateVariable[] = [
    { name: 'name', type: 'text', defaultValue: '' },
    { name: 'age', type: 'number', defaultValue: '' },
    { name: 'city', type: 'text', defaultValue: 'Unknown' },
  ];

  test('should resolve simple placeholders', () => {
    const template = 'Hello {{name}}, you are {{age}} years old';
    const params = { name: 'Alice', age: 30 };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(true);
    expect(result.resolved).toBe('Hello Alice, you are 30 years old');
  });

  test('should apply default values for missing optional parameters', () => {
    const template = 'Hello {{name}} from {{city}}';
    const params = { name: 'Bob' };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(true);
    expect(result.resolved).toBe('Hello Bob from Unknown');
  });

  test('should leave placeholder if required parameter missing', () => {
    const template = 'Hello {{name}}';
    const params = {};
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(false);
    expect(result.missingRequired).toContain('name');
  });

  test('should escape HTML by default', () => {
    const template = 'Message: {{message}}';
    const vars: TemplateVariable[] = [
      { name: 'message', type: 'text', defaultValue: '' },
    ];
    const params = { message: '<script>alert(1)</script>' };
    
    // This should fail validation due to dangerous content
    const result = injectParameters(template, vars, params, { auditLog: false });
    
    expect(result.success).toBe(false);
  });

  test('should handle multiple occurrences of same placeholder', () => {
    const template = '{{name}} and {{name}} are the same person';
    const params = { name: 'Alice' };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(true);
    expect(result.resolved).toBe('Alice and Alice are the same person');
  });
});

describe('Parameter Injection - Dot Notation', () => {
  test('should resolve dot notation placeholders', () => {
    const template = 'Email: {{user.email}}';
    const variables: TemplateVariable[] = [
      { name: 'user', type: 'text', defaultValue: '' },
    ];
    const params = {
      user: {
        email: 'alice@example.com',
        name: 'Alice',
      },
    };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(true);
    expect(result.resolved).toBe('Email: alice@example.com');
  });

  test('should handle missing nested properties', () => {
    const template = 'Email: {{user.email}}';
    const variables: TemplateVariable[] = [
      { name: 'user', type: 'text', defaultValue: '' },
    ];
    const params = {
      user: {},
    };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.resolved).toContain('{{user.email}}');
  });
});

describe('Parameter Injection - Ternary Conditionals', () => {
  test('should evaluate ternary conditionals - truthy', () => {
    const template = "Status: {{active ? 'Active' : 'Inactive'}}";
    const variables: TemplateVariable[] = [
      { name: 'active', type: 'text', defaultValue: '' },
    ];
    const params = { active: true };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(true);
    expect(result.resolved).toBe('Status: Active');
  });

  test('should evaluate ternary conditionals - falsy', () => {
    const template = "Status: {{active ? 'Active' : 'Inactive'}}";
    const variables: TemplateVariable[] = [
      { name: 'active', type: 'text', defaultValue: '' },
    ];
    const params = { active: false };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(true);
    expect(result.resolved).toBe('Status: Inactive');
  });

  test('should treat empty string as falsy', () => {
    const template = "Type: {{premium ? 'Premium' : 'Free'}}";
    const variables: TemplateVariable[] = [
      { name: 'premium', type: 'text', defaultValue: '' },
    ];
    const params = { premium: '' };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(true);
    expect(result.resolved).toBe('Type: Free');
  });

  test('should escape ternary result values', () => {
    const template = "Message: {{flag ? 'Safe & Sound' : 'Rock & Roll'}}";
    const variables: TemplateVariable[] = [
      { name: 'flag', type: 'text', defaultValue: '' },
    ];
    const params = { flag: true };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(true);
    expect(result.resolved).toBe('Message: Safe &amp; Sound');
  });
});

describe('Parameter Injection - Validation', () => {
  test('should validate required parameters', () => {
    const template = 'Hello {{name}}';
    const variables: TemplateVariable[] = [
      { name: 'name', type: 'text', defaultValue: '' }, // Required
    ];
    const params = {};
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(false);
    expect(result.missingRequired).toContain('name');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should validate parameter types', () => {
    const template = 'Age: {{age}}';
    const variables: TemplateVariable[] = [
      { name: 'age', type: 'number', defaultValue: '' },
    ];
    const params = { age: 'not a number' };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.parameterName === 'age')).toBe(true);
  });

  test('should validate dropdown options', () => {
    const template = 'Status: {{status}}';
    const variables: TemplateVariable[] = [
      {
        name: 'status',
        type: 'dropdown',
        defaultValue: '',
        options: ['draft', 'published', 'archived'],
      },
    ];
    const params = { status: 'invalid_status' };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.parameterName === 'status')).toBe(true);
  });

  test('should succeed with valid dropdown option', () => {
    const template = 'Status: {{status}}';
    const variables: TemplateVariable[] = [
      {
        name: 'status',
        type: 'dropdown',
        defaultValue: '',
        options: ['draft', 'published', 'archived'],
      },
    ];
    const params = { status: 'published' };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(true);
    expect(result.resolved).toBe('Status: published');
  });
});

describe('Parameter Injection - Security', () => {
  test('should reject unsafe template strings', () => {
    const template = '{{eval("malicious")}}';
    const variables: TemplateVariable[] = [];
    const params = {};
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.error.includes('unsafe'))).toBe(true);
  });

  test('should reject XSS attempts in parameters', () => {
    const template = 'Hello {{name}}';
    const variables: TemplateVariable[] = [
      { name: 'name', type: 'text', defaultValue: '' },
    ];
    const params = { name: '<script>alert(1)</script>' };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.error.includes('dangerous'))).toBe(true);
  });

  test('should reject SQL injection attempts', () => {
    const template = 'Query: {{query}}';
    const variables: TemplateVariable[] = [
      { name: 'query', type: 'text', defaultValue: '' },
    ];
    const params = { query: "'; DROP TABLE users;--" };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(false);
  });

  test('should allow safe special characters', () => {
    const template = 'Message: {{message}}';
    const variables: TemplateVariable[] = [
      { name: 'message', type: 'text', defaultValue: '' },
    ];
    const params = { message: 'Hello & Welcome!' };
    
    const result = injectParameters(template, variables, params, { auditLog: false });
    
    expect(result.success).toBe(true);
    expect(result.resolved).toBe('Message: Hello &amp; Welcome!');
  });
});

describe('Parameter Injection - Options', () => {
  test('should respect escapeHtml option', () => {
    const template = 'Message: {{message}}';
    const variables: TemplateVariable[] = [
      { name: 'message', type: 'text', defaultValue: '' },
    ];
    const params = { message: 'A & B' };
    
    const withEscape = injectParameters(template, variables, params, {
      escapeHtml: true,
      auditLog: false,
    });
    expect(withEscape.resolved).toBe('Message: A &amp; B');
    
    const withoutEscape = injectParameters(template, variables, params, {
      escapeHtml: false,
      auditLog: false,
    });
    expect(withoutEscape.resolved).toBe('Message: A & B');
  });

  test('should throw when throwOnMissing is true', () => {
    const template = 'Hello {{name}}';
    const variables: TemplateVariable[] = [
      { name: 'name', type: 'text', defaultValue: '' },
    ];
    const params = {};
    
    expect(() => {
      injectParameters(template, variables, params, {
        throwOnMissing: true,
        auditLog: false,
      });
    }).toThrow();
  });
});

describe('Helper Functions', () => {
  describe('generatePreview', () => {
    test('should generate preview from template', () => {
      const template: Template = {
        id: '1',
        name: 'Test',
        description: 'Test template',
        category: 'test',
        structure: 'Hello {{name}}!',
        variables: [
          { name: 'name', type: 'text', defaultValue: '' },
        ],
        tone: 'friendly',
        complexityBaseline: 5,
        qualityThreshold: 8,
        requiredElements: [],
        usageCount: 0,
        rating: 5,
        lastModified: new Date().toISOString(),
        createdBy: 'test',
      };
      const params = { name: 'Alice' };
      
      const preview = generatePreview(template, params);
      
      expect(preview.valid).toBe(true);
      expect(preview.preview).toBe('Hello Alice!');
      expect(preview.errors).toHaveLength(0);
    });
  });

  describe('validateTemplateResolution', () => {
    test('should validate template can be resolved', () => {
      const template: Template = {
        id: '1',
        name: 'Test',
        description: 'Test template',
        category: 'test',
        structure: 'Hello {{name}}!',
        variables: [
          { name: 'name', type: 'text', defaultValue: 'World' },
        ],
        tone: 'friendly',
        complexityBaseline: 5,
        qualityThreshold: 8,
        requiredElements: [],
        usageCount: 0,
        rating: 5,
        lastModified: new Date().toISOString(),
        createdBy: 'test',
      };
      const params = { name: 'Alice' };
      
      const validation = validateTemplateResolution(template, params);
      
      expect(validation.valid).toBe(true);
    });

    test('should detect unsafe template', () => {
      const template: Template = {
        id: '1',
        name: 'Test',
        description: 'Test template',
        category: 'test',
        structure: '{{eval("evil")}}',
        variables: [],
        tone: 'friendly',
        complexityBaseline: 5,
        qualityThreshold: 8,
        requiredElements: [],
        usageCount: 0,
        rating: 5,
        lastModified: new Date().toISOString(),
        createdBy: 'test',
      };
      
      const validation = validateTemplateResolution(template, {});
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('unsafe'))).toBe(true);
    });
  });

  describe('batchInjectParameters', () => {
    test('should batch inject multiple parameter sets', () => {
      const template: Template = {
        id: '1',
        name: 'Test',
        description: 'Test template',
        category: 'test',
        structure: 'Hello {{name}}!',
        variables: [
          { name: 'name', type: 'text', defaultValue: '' },
        ],
        tone: 'friendly',
        complexityBaseline: 5,
        qualityThreshold: 8,
        requiredElements: [],
        usageCount: 0,
        rating: 5,
        lastModified: new Date().toISOString(),
        createdBy: 'test',
      };
      
      const paramSets = [
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
      ];
      
      const results = batchInjectParameters(template, paramSets, { auditLog: false });
      
      expect(results).toHaveLength(3);
      expect(results[0].resolved).toBe('Hello Alice!');
      expect(results[1].resolved).toBe('Hello Bob!');
      expect(results[2].resolved).toBe('Hello Charlie!');
    });
  });

  describe('generateSampleParameters', () => {
    test('should generate sample values based on variable definitions', () => {
      const variables: TemplateVariable[] = [
        { name: 'name', type: 'text', defaultValue: '' },
        { name: 'age', type: 'number', defaultValue: '' },
        { name: 'status', type: 'dropdown', defaultValue: '', options: ['active', 'inactive'] },
      ];
      
      const samples = generateSampleParameters(variables);
      
      expect(samples.name).toBe('Sample name');
      expect(samples.age).toBe(42);
      expect(samples.status).toBe('active');
    });

    test('should use default values when available', () => {
      const variables: TemplateVariable[] = [
        { name: 'greeting', type: 'text', defaultValue: 'Hello' },
        { name: 'count', type: 'number', defaultValue: '10' },
      ];
      
      const samples = generateSampleParameters(variables);
      
      expect(samples.greeting).toBe('Hello');
      expect(samples.count).toBe('10');
    });
  });
});

describe('Parameter Injection - Performance', () => {
  test('should resolve 10 variables in under 50ms', () => {
    const variables: TemplateVariable[] = Array.from({ length: 10 }, (_, i) => ({
      name: `var${i}`,
      type: 'text' as const,
      defaultValue: '',
    }));
    
    const template = variables.map(v => `{{${v.name}}}`).join(' ');
    const params = Object.fromEntries(variables.map(v => [v.name, 'value']));
    
    const start = Date.now();
    const result = injectParameters(template, variables, params, { auditLog: false });
    const duration = Date.now() - start;
    
    expect(result.success).toBe(true);
    expect(duration).toBeLessThan(50);
  });
});

