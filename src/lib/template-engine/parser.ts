/**
 * Template Parser
 * 
 * Supports:
 * - Simple: {{variable}}
 * - Nested: {{user.name}}, {{config.api.endpoint}}
 * - Conditional: {{#if condition}}...{{/if}}
 * - Defaults: {{variable:default_value}}
 * - Optional: {{variable?}}
 */

export type TemplateToken = {
  type: 'text' | 'variable' | 'conditional';
  value: string;
  modifier?: 'optional' | 'default';
  defaultValue?: string;
  path?: string[]; // For nested access
};

export class TemplateParser {
  private template: string;
  private position: number = 0;
  
  constructor(template: string) {
    this.template = template;
  }
  
  parse(): TemplateToken[] {
    const tokens: TemplateToken[] = [];
    
    while (this.position < this.template.length) {
      const token = this.nextToken();
      if (token) {
        tokens.push(token);
      }
    }
    
    return tokens;
  }
  
  private nextToken(): TemplateToken | null {
    // Check for variable start
    if (this.peek(2) === '{{') {
      return this.parseVariable();
    }
    
    // Parse text until next variable
    return this.parseText();
  }
  
  private parseVariable(): TemplateToken {
    this.advance(2); // Skip {{
    
    let variable = '';
    while (this.position < this.template.length && this.peek(2) !== '}}') {
      variable += this.template[this.position];
      this.position++;
    }
    
    this.advance(2); // Skip }}
    
    // Parse variable syntax
    const token = this.parseVariableSyntax(variable.trim());
    return token;
  }
  
  private parseVariableSyntax(variable: string): TemplateToken {
    // Check for conditional: #if
    if (variable.startsWith('#if ')) {
      return {
        type: 'conditional',
        value: variable.substring(4).trim(),
      };
    }
    
    // Check for optional: variable?
    if (variable.endsWith('?')) {
      return {
        type: 'variable',
        value: variable.slice(0, -1),
        modifier: 'optional',
        path: variable.slice(0, -1).split('.'),
      };
    }
    
    // Check for default: variable:default
    if (variable.includes(':')) {
      const [varName, defaultValue] = variable.split(':');
      return {
        type: 'variable',
        value: varName.trim(),
        modifier: 'default',
        defaultValue: defaultValue.trim(),
        path: varName.trim().split('.'),
      };
    }
    
    // Check for nested: user.name
    if (variable.includes('.')) {
      return {
        type: 'variable',
        value: variable,
        path: variable.split('.'),
      };
    }
    
    // Simple variable
    return {
      type: 'variable',
      value: variable,
      path: [variable],
    };
  }
  
  private parseText(): TemplateToken {
    let text = '';
    
    while (this.position < this.template.length && this.peek(2) !== '{{') {
      text += this.template[this.position];
      this.position++;
    }
    
    return {
      type: 'text',
      value: text,
    };
  }
  
  private peek(length: number = 1): string {
    return this.template.substring(this.position, this.position + length);
  }
  
  private advance(count: number = 1): void {
    this.position += count;
  }
}

