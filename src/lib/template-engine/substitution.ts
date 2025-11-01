import { TemplateParser, TemplateToken } from './parser';

export type SubstitutionContext = Record<string, any>;

export class TemplateSubstitution {
  private context: SubstitutionContext;
  
  constructor(context: SubstitutionContext) {
    this.context = context;
  }
  
  substitute(template: string): string {
    const parser = new TemplateParser(template);
    const tokens = parser.parse();
    
    return tokens.map(token => this.resolveToken(token)).join('');
  }
  
  private resolveToken(token: TemplateToken): string {
    if (token.type === 'text') {
      return token.value;
    }
    
    if (token.type === 'variable') {
      return this.resolveVariable(token);
    }
    
    if (token.type === 'conditional') {
      return this.resolveConditional(token);
    }
    
    return '';
  }
  
  private resolveVariable(token: TemplateToken): string {
    const value = this.getValue(token.path!);
    
    // Handle optional
    if (token.modifier === 'optional' && value === undefined) {
      return '';
    }
    
    // Handle default
    if (token.modifier === 'default' && value === undefined) {
      return token.defaultValue || '';
    }
    
    // Return value or placeholder if not found
    if (value === undefined) {
      return `{{${token.value}}}`;
    }
    
    return String(value);
  }
  
  private resolveConditional(token: TemplateToken): string {
    // Simple conditional evaluation
    const condition = token.value;
    const value = this.context[condition];
    
    // Truthy check
    return value ? '[conditional-true]' : '[conditional-false]';
  }
  
  private getValue(path: string[]): any {
    let current = this.context;
    
    for (const key of path) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }
  
  // Validation: Check if all variables can be resolved
  validate(template: string): { valid: boolean; missing: string[] } {
    const parser = new TemplateParser(template);
    const tokens = parser.parse();
    
    const missing: string[] = [];
    
    for (const token of tokens) {
      if (token.type === 'variable') {
        const value = this.getValue(token.path!);
        
        // Skip optional variables
        if (token.modifier === 'optional') continue;
        
        // Skip variables with defaults
        if (token.modifier === 'default') continue;
        
        if (value === undefined) {
          missing.push(token.value);
        }
      }
    }
    
    return {
      valid: missing.length === 0,
      missing,
    };
  }
}

