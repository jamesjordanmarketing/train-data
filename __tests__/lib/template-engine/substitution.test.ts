/**
 * Template Substitution Engine Tests
 * 
 * Tests for the variable substitution engine with various syntax options
 */

import { TemplateSubstitution } from '@/lib/template-engine/substitution';
import { TemplateParser } from '@/lib/template-engine/parser';

describe('TemplateParser', () => {
  describe('Simple Variables', () => {
    it('should parse simple variables', () => {
      const parser = new TemplateParser('Hello {{name}}!');
      const tokens = parser.parse();
      
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ type: 'text', value: 'Hello ' });
      expect(tokens[1]).toMatchObject({ 
        type: 'variable', 
        value: 'name',
        path: ['name']
      });
      expect(tokens[2]).toMatchObject({ type: 'text', value: '!' });
    });
    
    it('should parse multiple variables', () => {
      const parser = new TemplateParser('{{greeting}}, {{name}}!');
      const tokens = parser.parse();
      
      expect(tokens).toHaveLength(4);
      expect(tokens[0]).toMatchObject({ type: 'variable', value: 'greeting' });
      expect(tokens[2]).toMatchObject({ type: 'variable', value: 'name' });
    });
  });
  
  describe('Nested Variables', () => {
    it('should parse nested variables', () => {
      const parser = new TemplateParser('{{user.name}}');
      const tokens = parser.parse();
      
      expect(tokens[0]).toMatchObject({
        type: 'variable',
        value: 'user.name',
        path: ['user', 'name']
      });
    });
    
    it('should parse deeply nested variables', () => {
      const parser = new TemplateParser('{{config.api.endpoint.url}}');
      const tokens = parser.parse();
      
      expect(tokens[0].path).toEqual(['config', 'api', 'endpoint', 'url']);
    });
  });
  
  describe('Optional Variables', () => {
    it('should parse optional variables', () => {
      const parser = new TemplateParser('{{nickname?}}');
      const tokens = parser.parse();
      
      expect(tokens[0]).toMatchObject({
        type: 'variable',
        value: 'nickname',
        modifier: 'optional',
        path: ['nickname']
      });
    });
  });
  
  describe('Default Values', () => {
    it('should parse variables with defaults', () => {
      const parser = new TemplateParser('{{name:Anonymous}}');
      const tokens = parser.parse();
      
      expect(tokens[0]).toMatchObject({
        type: 'variable',
        value: 'name',
        modifier: 'default',
        defaultValue: 'Anonymous',
        path: ['name']
      });
    });
    
    it('should parse numeric defaults', () => {
      const parser = new TemplateParser('{{count:0}}');
      const tokens = parser.parse();
      
      expect(tokens[0]).toMatchObject({
        defaultValue: '0'
      });
    });
  });
  
  describe('Conditionals', () => {
    it('should parse conditional blocks', () => {
      const parser = new TemplateParser('{{#if premium}}');
      const tokens = parser.parse();
      
      expect(tokens[0]).toMatchObject({
        type: 'conditional',
        value: 'premium'
      });
    });
  });
});

describe('TemplateSubstitution', () => {
  describe('Simple Substitution', () => {
    it('should substitute simple variables', () => {
      const sub = new TemplateSubstitution({ name: 'Alice' });
      const result = sub.substitute('Hello {{name}}!');
      
      expect(result).toBe('Hello Alice!');
    });
    
    it('should substitute multiple variables', () => {
      const sub = new TemplateSubstitution({ 
        greeting: 'Hi',
        name: 'Bob'
      });
      const result = sub.substitute('{{greeting}}, {{name}}!');
      
      expect(result).toBe('Hi, Bob!');
    });
    
    it('should keep placeholder for missing variables', () => {
      const sub = new TemplateSubstitution({});
      const result = sub.substitute('Hello {{name}}!');
      
      expect(result).toBe('Hello {{name}}!');
    });
  });
  
  describe('Nested Variable Substitution', () => {
    it('should substitute nested variables', () => {
      const sub = new TemplateSubstitution({
        user: { name: 'Charlie' }
      });
      const result = sub.substitute('Hello {{user.name}}!');
      
      expect(result).toBe('Hello Charlie!');
    });
    
    it('should substitute deeply nested variables', () => {
      const sub = new TemplateSubstitution({
        config: {
          api: {
            endpoint: {
              url: 'https://api.example.com'
            }
          }
        }
      });
      const result = sub.substitute('API: {{config.api.endpoint.url}}');
      
      expect(result).toBe('API: https://api.example.com');
    });
    
    it('should handle missing nested properties', () => {
      const sub = new TemplateSubstitution({
        user: {}
      });
      const result = sub.substitute('Hello {{user.name}}!');
      
      expect(result).toBe('Hello {{user.name}}!');
    });
    
    it('should handle null intermediate values', () => {
      const sub = new TemplateSubstitution({
        user: null
      });
      const result = sub.substitute('Hello {{user.name}}!');
      
      expect(result).toBe('Hello {{user.name}}!');
    });
  });
  
  describe('Optional Variables', () => {
    it('should return empty string for missing optional variables', () => {
      const sub = new TemplateSubstitution({});
      const result = sub.substitute('Hello{{nickname?}}!');
      
      expect(result).toBe('Hello!');
    });
    
    it('should substitute optional variables when present', () => {
      const sub = new TemplateSubstitution({ nickname: ' Dave' });
      const result = sub.substitute('Hello{{nickname?}}!');
      
      expect(result).toBe('Hello Dave!');
    });
  });
  
  describe('Default Values', () => {
    it('should use default for missing variables', () => {
      const sub = new TemplateSubstitution({});
      const result = sub.substitute('Hello {{name:Guest}}!');
      
      expect(result).toBe('Hello Guest!');
    });
    
    it('should use actual value over default', () => {
      const sub = new TemplateSubstitution({ name: 'Eve' });
      const result = sub.substitute('Hello {{name:Guest}}!');
      
      expect(result).toBe('Hello Eve!');
    });
    
    it('should handle numeric defaults', () => {
      const sub = new TemplateSubstitution({});
      const result = sub.substitute('Count: {{count:0}}');
      
      expect(result).toBe('Count: 0');
    });
  });
  
  describe('Conditional Substitution', () => {
    it('should evaluate truthy conditions', () => {
      const sub = new TemplateSubstitution({ premium: true });
      const result = sub.substitute('Status: {{#if premium}}');
      
      expect(result).toBe('Status: [conditional-true]');
    });
    
    it('should evaluate falsy conditions', () => {
      const sub = new TemplateSubstitution({ premium: false });
      const result = sub.substitute('Status: {{#if premium}}');
      
      expect(result).toBe('Status: [conditional-false]');
    });
  });
  
  describe('Type Handling', () => {
    it('should convert numbers to strings', () => {
      const sub = new TemplateSubstitution({ age: 30 });
      const result = sub.substitute('Age: {{age}}');
      
      expect(result).toBe('Age: 30');
    });
    
    it('should convert booleans to strings', () => {
      const sub = new TemplateSubstitution({ active: true });
      const result = sub.substitute('Active: {{active}}');
      
      expect(result).toBe('Active: true');
    });
    
    it('should handle zero values', () => {
      const sub = new TemplateSubstitution({ count: 0 });
      const result = sub.substitute('Count: {{count}}');
      
      expect(result).toBe('Count: 0');
    });
    
    it('should handle empty strings', () => {
      const sub = new TemplateSubstitution({ text: '' });
      const result = sub.substitute('Text: {{text}}');
      
      expect(result).toBe('Text: ');
    });
  });
  
  describe('Validation', () => {
    it('should validate all variables present', () => {
      const sub = new TemplateSubstitution({
        name: 'Alice',
        age: 30
      });
      const validation = sub.validate('{{name}} is {{age}} years old');
      
      expect(validation.valid).toBe(true);
      expect(validation.missing).toEqual([]);
    });
    
    it('should detect missing variables', () => {
      const sub = new TemplateSubstitution({ name: 'Alice' });
      const validation = sub.validate('{{name}} is {{age}} years old');
      
      expect(validation.valid).toBe(false);
      expect(validation.missing).toEqual(['age']);
    });
    
    it('should not report optional variables as missing', () => {
      const sub = new TemplateSubstitution({});
      const validation = sub.validate('Hello {{name?}}!');
      
      expect(validation.valid).toBe(true);
      expect(validation.missing).toEqual([]);
    });
    
    it('should not report variables with defaults as missing', () => {
      const sub = new TemplateSubstitution({});
      const validation = sub.validate('Hello {{name:Guest}}!');
      
      expect(validation.valid).toBe(true);
      expect(validation.missing).toEqual([]);
    });
    
    it('should detect multiple missing variables', () => {
      const sub = new TemplateSubstitution({});
      const validation = sub.validate('{{greeting}}, {{name}}! You are {{age}}.');
      
      expect(validation.valid).toBe(false);
      expect(validation.missing).toContain('greeting');
      expect(validation.missing).toContain('name');
      expect(validation.missing).toContain('age');
    });
  });
  
  describe('Complex Templates', () => {
    it('should handle templates with mixed syntax', () => {
      const sub = new TemplateSubstitution({
        user: { firstName: 'Alice', lastName: 'Smith' },
        greeting: 'Hello',
      });
      
      const template = '{{greeting}}, {{user.firstName}} {{user.lastName}}!{{nickname?}}';
      const result = sub.substitute(template);
      
      expect(result).toBe('Hello, Alice Smith!');
    });
    
    it('should handle templates with defaults and optionals', () => {
      const sub = new TemplateSubstitution({
        name: 'Bob',
      });
      
      const template = 'Hello {{name}}!{{title?}} Welcome back{{message:!}}';
      const result = sub.substitute(template);
      
      expect(result).toBe('Hello Bob! Welcome back!');
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle empty template', () => {
      const sub = new TemplateSubstitution({});
      const result = sub.substitute('');
      
      expect(result).toBe('');
    });
    
    it('should handle template with no variables', () => {
      const sub = new TemplateSubstitution({});
      const result = sub.substitute('Just plain text');
      
      expect(result).toBe('Just plain text');
    });
    
    it('should handle consecutive variables', () => {
      const sub = new TemplateSubstitution({ 
        a: 'A',
        b: 'B'
      });
      const result = sub.substitute('{{a}}{{b}}');
      
      expect(result).toBe('AB');
    });
    
    it('should handle variables with spaces in template', () => {
      const sub = new TemplateSubstitution({ name: 'Alice' });
      const result = sub.substitute('{{  name  }}');
      
      expect(result).toBe('Alice');
    });
    
    it('should handle malformed variables gracefully', () => {
      const sub = new TemplateSubstitution({});
      const result = sub.substitute('{{name');
      
      // Should return as-is since not properly closed
      expect(result).toBe('{{name');
    });
  });
});

