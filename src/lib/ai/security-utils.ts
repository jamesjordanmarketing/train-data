/**
 * Security Utilities for Parameter Injection
 * 
 * This module provides robust security functions to prevent:
 * - XSS (Cross-Site Scripting)
 * - Template injection attacks
 * - SQL injection (via parameterized query enforcement)
 * - Code injection
 * 
 * SECURITY NOTICE: Any changes to this file must be reviewed for security implications.
 */

/**
 * HTML special characters that must be escaped
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escapes HTML special characters to prevent XSS attacks
 * 
 * @param input - Raw user input that may contain malicious HTML
 * @returns Safely escaped string with HTML entities
 * 
 * @example
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  return input.replace(/[&<>"'\/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Detects potentially dangerous patterns in user input
 * 
 * This function checks for common attack vectors:
 * - Script tags
 * - Event handlers (onclick, onerror, etc.)
 * - Javascript: protocol
 * - Data: protocol with script
 * - SQL injection patterns
 * - Template injection patterns
 * 
 * @param input - User input to validate
 * @returns true if dangerous patterns detected, false otherwise
 */
export function containsDangerousPattern(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }
  
  const dangerousPatterns = [
    // Script tags (case insensitive)
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    
    // Event handlers
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /on\w+\s*=\s*[^\s>]*/gi,
    
    // Javascript protocol
    /javascript\s*:/gi,
    
    // Data protocol with script
    /data:text\/html[^,]*,[\s\S]*<script/gi,
    
    // Potentially dangerous SQL patterns (only in context that looks like SQL)
    // Look for SQL keywords followed by SQL-like syntax, not just the words themselves
    /(\bunion\s+select\b|\bselect\s+\*\s+from\b|\binsert\s+into\b|\bupdate\s+.*\s+set\b|\bdelete\s+from\b|\bdrop\s+table\b)/gi,
    // SQL comment patterns (but more specific to avoid false positives with regular punctuation)
    /(--\s*\w|\/\*.*\*\/)/gi,
    
    // Template injection patterns
    /\{\{.*(__import__|eval|exec|compile|globals|locals|open|file).*\}\}/gi,
    
    // Code execution patterns
    /(__.*__|\$\{.*\}|%\{.*\})/gi,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitizes user input by removing or escaping dangerous content
 * 
 * This is a more aggressive approach than escapeHtml - it rejects
 * inputs that contain dangerous patterns entirely.
 * 
 * @param input - Raw user input
 * @param fieldName - Name of the field (for error messages)
 * @returns Sanitized input
 * @throws Error if dangerous patterns detected
 */
export function sanitizeInput(input: string, fieldName: string = 'input'): string {
  if (typeof input !== 'string') {
    input = String(input);
  }
  
  // Check for dangerous patterns
  if (containsDangerousPattern(input)) {
    throw new Error(
      `Security violation: ${fieldName} contains potentially dangerous content. ` +
      `Please remove any script tags, event handlers, or SQL/code injection attempts.`
    );
  }
  
  // Escape HTML entities as additional safety layer
  return escapeHtml(input);
}

/**
 * Validates that a string is safe for use in template resolution
 * 
 * @param input - String to validate
 * @returns true if safe, false otherwise
 */
export function isSafeTemplateValue(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }
  
  // Check length (prevent DoS via extremely long strings)
  if (input.length > 10000) {
    return false;
  }
  
  // Check for dangerous patterns
  if (containsDangerousPattern(input)) {
    return false;
  }
  
  return true;
}

/**
 * Strips all HTML tags from input, leaving only text content
 * 
 * @param input - Input that may contain HTML
 * @returns Plain text with all HTML removed
 */
export function stripHtmlTags(input: string): string {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // First pass: remove all tags
  let cleaned = input.replace(/<[^>]*>/g, '');
  
  // Second pass: decode HTML entities
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&'); // Must be last
  
  return cleaned;
}

/**
 * Validates that template syntax is safe (no code execution)
 * 
 * Only allows simple placeholders like {{variableName}} and basic
 * ternary conditionals like {{condition ? 'yes' : 'no'}}
 * 
 * Blocks:
 * - Function calls
 * - Property access beyond simple dot notation
 * - Array access
 * - Mathematical operations (except in ternary)
 * - Any code execution patterns
 * 
 * @param template - Template string to validate
 * @returns true if safe, false otherwise
 */
export function isSafeTemplateString(template: string): boolean {
  if (typeof template !== 'string') {
    return false;
  }
  
  // Extract all placeholder expressions
  const placeholderRegex = /\{\{([^}]+)\}\}/g;
  const matches = Array.from(template.matchAll(placeholderRegex));
  
  for (const match of matches) {
    const expression = match[1].trim();
    
    // Allow simple variable names: letters, numbers, underscores
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expression)) {
      continue;
    }
    
    // Allow simple ternary: variable ? 'string' : 'string'
    // Must use single quotes, no nested expressions
    const ternaryPattern = /^[a-zA-Z_][a-zA-Z0-9_]*\s*\?\s*'[^']*'\s*:\s*'[^']*'$/;
    if (ternaryPattern.test(expression)) {
      continue;
    }
    
    // Allow simple dot notation: object.property
    const dotPattern = /^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (dotPattern.test(expression)) {
      continue;
    }
    
    // If we get here, the expression is not allowed
    return false;
  }
  
  return true;
}

/**
 * Security audit log entry
 */
export interface SecurityAuditLog {
  timestamp: string;
  action: 'parameter_injection' | 'template_validation' | 'input_sanitization';
  userId?: string;
  templateId?: string;
  parameters?: Record<string, any>;
  securityViolations?: string[];
  success: boolean;
}

/**
 * Logs security-relevant events for audit purposes
 * 
 * In production, this should write to a secure audit log.
 * For now, it uses console with structured format.
 * 
 * @param entry - Audit log entry
 */
export function logSecurityEvent(entry: SecurityAuditLog): void {
  // In production, send to secure logging service
  // For development, use structured console logging
  
  const logData = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
    severity: entry.securityViolations && entry.securityViolations.length > 0 ? 'WARNING' : 'INFO',
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[SECURITY_AUDIT]', JSON.stringify(logData, null, 2));
  }
  
  // TODO: In production, send to logging service like:
  // - AWS CloudWatch Logs
  // - Datadog
  // - Splunk
  // - ELK Stack
}

/**
 * Content Security Policy (CSP) headers for XSS protection
 * 
 * These should be set in your Next.js middleware or API routes
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: Remove unsafe-* in production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/**
 * Validates parameter type and coerces to expected type
 * 
 * @param value - Raw parameter value
 * @param expectedType - Expected type (text, number, dropdown)
 * @returns Coerced and validated value
 * @throws Error if type coercion fails
 */
export function validateAndCoerceType(
  value: any,
  expectedType: 'text' | 'number' | 'dropdown'
): string | number {
  if (value === null || value === undefined) {
    throw new Error('Parameter value cannot be null or undefined');
  }
  
  switch (expectedType) {
    case 'text':
    case 'dropdown':
      const textValue = String(value);
      if (!isSafeTemplateValue(textValue)) {
        throw new Error('Parameter value contains unsafe content');
      }
      return sanitizeInput(textValue);
    
    case 'number':
      const numValue = Number(value);
      if (isNaN(numValue) || !isFinite(numValue)) {
        throw new Error(`Cannot convert "${value}" to a valid number`);
      }
      return numValue;
    
    default:
      throw new Error(`Unknown parameter type: ${expectedType}`);
  }
}

