/**
 * Security Tests for Parameter Injection Engine
 * 
 * Tests for XSS, SQL injection, template injection, and other security vulnerabilities.
 * CRITICAL: These tests must all pass before deploying to production.
 */

import {
  escapeHtml,
  containsDangerousPattern,
  sanitizeInput,
  isSafeTemplateValue,
  stripHtmlTags,
  isSafeTemplateString,
  validateAndCoerceType,
} from '../security-utils';

describe('Security Utils - HTML Escaping', () => {
  describe('escapeHtml', () => {
    test('should escape basic HTML entities', () => {
      expect(escapeHtml('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    test('should escape ampersands', () => {
      expect(escapeHtml('A & B')).toBe('A &amp; B');
    });

    test('should escape single quotes', () => {
      expect(escapeHtml("It's a test")).toBe("It&#x27;s a test");
    });

    test('should escape all special characters together', () => {
      const input = `<div class="test">'A & B' / C</div>`;
      const expected = `&lt;div class=&quot;test&quot;&gt;&#x27;A &amp; B&#x27; &#x2F; C&lt;&#x2F;div&gt;`;
      expect(escapeHtml(input)).toBe(expected);
    });

    test('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });

    test('should handle non-string inputs', () => {
      expect(escapeHtml(123 as any)).toBe('123');
      expect(escapeHtml(null as any)).toBe('null');
    });
  });

  describe('stripHtmlTags', () => {
    test('should remove all HTML tags', () => {
      expect(stripHtmlTags('<p>Hello <b>World</b></p>')).toBe('Hello World');
    });

    test('should decode HTML entities', () => {
      expect(stripHtmlTags('&lt;script&gt;')).toBe('<script>');
    });

    test('should handle nested tags', () => {
      expect(stripHtmlTags('<div><span><b>Text</b></span></div>')).toBe('Text');
    });
  });
});

describe('Security Utils - Dangerous Pattern Detection', () => {
  describe('containsDangerousPattern', () => {
    test('should detect script tags', () => {
      expect(containsDangerousPattern('<script>alert("xss")</script>')).toBe(true);
      expect(containsDangerousPattern('<SCRIPT>alert("xss")</SCRIPT>')).toBe(true);
      expect(containsDangerousPattern('<ScRiPt>alert("xss")</sCrIpT>')).toBe(true);
    });

    test('should detect event handlers', () => {
      expect(containsDangerousPattern('onclick="alert(1)"')).toBe(true);
      expect(containsDangerousPattern('onerror="alert(1)"')).toBe(true);
      expect(containsDangerousPattern('onload="malicious()"')).toBe(true);
      expect(containsDangerousPattern('<img onerror=alert(1)>')).toBe(true);
    });

    test('should detect javascript: protocol', () => {
      expect(containsDangerousPattern('javascript:alert(1)')).toBe(true);
      expect(containsDangerousPattern('JAVASCRIPT:alert(1)')).toBe(true);
    });

    test('should detect data: protocol with script', () => {
      expect(containsDangerousPattern('data:text/html,<script>alert(1)</script>')).toBe(true);
    });

    test('should detect SQL injection patterns', () => {
      expect(containsDangerousPattern("'; DROP TABLE users;--")).toBe(true);
      expect(containsDangerousPattern('1 OR 1=1')).toBe(false); // This is too generic
      expect(containsDangerousPattern('SELECT * FROM users')).toBe(true);
      expect(containsDangerousPattern('UNION SELECT password')).toBe(true);
      expect(containsDangerousPattern("'; exec xp_cmdshell('dir')--")).toBe(true);
    });

    test('should detect template injection patterns', () => {
      expect(containsDangerousPattern('{{__import__("os").system("rm -rf /")}}')).toBe(true);
      expect(containsDangerousPattern('{{eval("malicious")}}')).toBe(true);
      expect(containsDangerousPattern('{{exec("evil")}}')).toBe(true);
    });

    test('should detect code execution patterns', () => {
      expect(containsDangerousPattern('${evil}')).toBe(true);
      expect(containsDangerousPattern('%{payload}')).toBe(true);
      expect(containsDangerousPattern('__proto__')).toBe(true);
    });

    test('should allow safe content', () => {
      expect(containsDangerousPattern('Hello World')).toBe(false);
      expect(containsDangerousPattern('user@example.com')).toBe(false);
      expect(containsDangerousPattern('Price: $10')).toBe(false);
      expect(containsDangerousPattern('A & B Company')).toBe(false);
    });
  });

  describe('isSafeTemplateValue', () => {
    test('should reject dangerous patterns', () => {
      expect(isSafeTemplateValue('<script>alert(1)</script>')).toBe(false);
      expect(isSafeTemplateValue('onclick=alert(1)')).toBe(false);
    });

    test('should reject extremely long strings (DoS protection)', () => {
      const longString = 'a'.repeat(10001);
      expect(isSafeTemplateValue(longString)).toBe(false);
    });

    test('should accept safe content', () => {
      expect(isSafeTemplateValue('Hello World')).toBe(true);
      expect(isSafeTemplateValue('user@example.com')).toBe(true);
      expect(isSafeTemplateValue('The quick brown fox')).toBe(true);
    });

    test('should reject non-strings', () => {
      expect(isSafeTemplateValue(123 as any)).toBe(false);
      expect(isSafeTemplateValue(null as any)).toBe(false);
      expect(isSafeTemplateValue(undefined as any)).toBe(false);
    });
  });
});

describe('Security Utils - Input Sanitization', () => {
  describe('sanitizeInput', () => {
    test('should throw on dangerous content', () => {
      expect(() => sanitizeInput('<script>alert(1)</script>', 'test'))
        .toThrow('Security violation');
    });

    test('should throw on SQL injection attempts', () => {
      expect(() => sanitizeInput("'; DROP TABLE users;--", 'test'))
        .toThrow('Security violation');
    });

    test('should escape safe content', () => {
      expect(sanitizeInput('Hello & Goodbye', 'test')).toBe('Hello &amp; Goodbye');
    });

    test('should handle empty strings', () => {
      expect(sanitizeInput('', 'test')).toBe('');
    });
  });
});

describe('Security Utils - Template String Validation', () => {
  describe('isSafeTemplateString', () => {
    test('should allow simple placeholders', () => {
      expect(isSafeTemplateString('Hello {{name}}')).toBe(true);
      expect(isSafeTemplateString('{{firstName}} {{lastName}}')).toBe(true);
    });

    test('should allow simple ternary conditionals', () => {
      expect(isSafeTemplateString("{{active ? 'Yes' : 'No'}}")).toBe(true);
      expect(isSafeTemplateString("Welcome {{loggedIn ? 'User' : 'Guest'}}")).toBe(true);
    });

    test('should allow dot notation', () => {
      expect(isSafeTemplateString('{{user.name}}')).toBe(true);
      expect(isSafeTemplateString('{{profile.email}}')).toBe(true);
    });

    test('should reject function calls', () => {
      expect(isSafeTemplateString('{{eval("evil")}}')).toBe(false);
      expect(isSafeTemplateString('{{alert(1)}}')).toBe(false);
      expect(isSafeTemplateString('{{console.log("test")}}')).toBe(false);
    });

    test('should reject array access', () => {
      expect(isSafeTemplateString('{{array[0]}}')).toBe(false);
      expect(isSafeTemplateString('{{items[index]}}')).toBe(false);
    });

    test('should reject complex expressions', () => {
      expect(isSafeTemplateString('{{1 + 1}}')).toBe(false);
      expect(isSafeTemplateString('{{a * b}}')).toBe(false);
      expect(isSafeTemplateString('{{obj.method()}}')).toBe(false);
    });

    test('should reject nested ternaries', () => {
      expect(isSafeTemplateString("{{a ? (b ? 'x' : 'y') : 'z'}}")).toBe(false);
    });

    test('should reject double quotes in ternaries', () => {
      expect(isSafeTemplateString('{{flag ? "yes" : "no"}}')).toBe(false);
    });

    test('should reject multiple levels of dot notation', () => {
      expect(isSafeTemplateString('{{a.b.c.d}}')).toBe(false);
    });

    test('should handle non-string inputs', () => {
      expect(isSafeTemplateString(123 as any)).toBe(false);
    });
  });
});

describe('Security Utils - Type Validation and Coercion', () => {
  describe('validateAndCoerceType', () => {
    test('should validate and sanitize text', () => {
      expect(validateAndCoerceType('Hello World', 'text')).toBe('Hello World');
    });

    test('should escape dangerous text', () => {
      expect(validateAndCoerceType('A & B', 'text')).toBe('A &amp; B');
    });

    test('should throw on dangerous content in text', () => {
      expect(() => validateAndCoerceType('<script>alert(1)</script>', 'text'))
        .toThrow();
    });

    test('should validate and coerce numbers', () => {
      expect(validateAndCoerceType('42', 'number')).toBe(42);
      expect(validateAndCoerceType(42, 'number')).toBe(42);
      expect(validateAndCoerceType('3.14', 'number')).toBe(3.14);
    });

    test('should reject invalid numbers', () => {
      expect(() => validateAndCoerceType('not a number', 'number')).toThrow();
      expect(() => validateAndCoerceType(NaN, 'number')).toThrow();
      expect(() => validateAndCoerceType(Infinity, 'number')).toThrow();
    });

    test('should validate dropdown values', () => {
      expect(validateAndCoerceType('option1', 'dropdown')).toBe('option1');
    });

    test('should throw on null/undefined', () => {
      expect(() => validateAndCoerceType(null, 'text')).toThrow();
      expect(() => validateAndCoerceType(undefined, 'text')).toThrow();
    });

    test('should throw on unknown type', () => {
      expect(() => validateAndCoerceType('test', 'unknown' as any)).toThrow();
    });
  });
});

describe('Security - XSS Attack Scenarios', () => {
  test('XSS Scenario 1: Script tag injection', () => {
    const maliciousInput = '<script>document.cookie</script>';
    expect(() => sanitizeInput(maliciousInput, 'test')).toThrow();
  });

  test('XSS Scenario 2: Image onerror injection', () => {
    const maliciousInput = '<img src=x onerror="alert(1)">';
    expect(() => sanitizeInput(maliciousInput, 'test')).toThrow();
  });

  test('XSS Scenario 3: JavaScript protocol in link', () => {
    const maliciousInput = '<a href="javascript:alert(1)">Click</a>';
    expect(() => sanitizeInput(maliciousInput, 'test')).toThrow();
  });

  test('XSS Scenario 4: Data URI with script', () => {
    const maliciousInput = '<object data="data:text/html,<script>alert(1)</script>">';
    expect(() => sanitizeInput(maliciousInput, 'test')).toThrow();
  });

  test('XSS Scenario 5: SVG with script', () => {
    const maliciousInput = '<svg><script>alert(1)</script></svg>';
    expect(() => sanitizeInput(maliciousInput, 'test')).toThrow();
  });
});

describe('Security - SQL Injection Scenarios', () => {
  test('SQL Injection Scenario 1: Classic OR 1=1', () => {
    const maliciousInput = "admin' OR '1'='1";
    // Should be detected as dangerous
    expect(containsDangerousPattern(maliciousInput)).toBe(true);
  });

  test('SQL Injection Scenario 2: DROP TABLE', () => {
    const maliciousInput = "'; DROP TABLE users;--";
    expect(containsDangerousPattern(maliciousInput)).toBe(true);
    expect(() => sanitizeInput(maliciousInput, 'test')).toThrow();
  });

  test('SQL Injection Scenario 3: UNION SELECT', () => {
    const maliciousInput = "' UNION SELECT password FROM users--";
    expect(containsDangerousPattern(maliciousInput)).toBe(true);
  });

  test('SQL Injection Scenario 4: Stored procedure execution', () => {
    const maliciousInput = "'; EXEC xp_cmdshell('dir');--";
    expect(containsDangerousPattern(maliciousInput)).toBe(true);
  });
});

describe('Security - Template Injection Scenarios', () => {
  test('Template Injection Scenario 1: Python __import__', () => {
    const maliciousTemplate = '{{__import__("os").system("rm -rf /")}}';
    expect(isSafeTemplateString(maliciousTemplate)).toBe(false);
  });

  test('Template Injection Scenario 2: eval function', () => {
    const maliciousTemplate = '{{eval("malicious_code")}}';
    expect(isSafeTemplateString(maliciousTemplate)).toBe(false);
  });

  test('Template Injection Scenario 3: exec function', () => {
    const maliciousTemplate = '{{exec("evil")}}';
    expect(isSafeTemplateString(maliciousTemplate)).toBe(false);
  });

  test('Template Injection Scenario 4: File access', () => {
    const maliciousTemplate = '{{open("/etc/passwd").read()}}';
    expect(isSafeTemplateString(maliciousTemplate)).toBe(false);
  });

  test('Template Injection Scenario 5: Globals access', () => {
    const maliciousTemplate = '{{globals()}}';
    expect(isSafeTemplateString(maliciousTemplate)).toBe(false);
  });
});

describe('Security - Prototype Pollution', () => {
  test('should detect __proto__ access attempts', () => {
    expect(containsDangerousPattern('__proto__')).toBe(true);
    expect(containsDangerousPattern('{"__proto__": {"admin": true}}')).toBe(true);
  });

  test('should reject __proto__ in template strings', () => {
    expect(isSafeTemplateString('{{__proto__}}')).toBe(false);
  });
});

describe('Security - Edge Cases', () => {
  test('should handle unicode and special characters safely', () => {
    expect(isSafeTemplateValue('Hello 世界')).toBe(true);
    expect(isSafeTemplateValue('Café ☕')).toBe(true);
  });

  test('should handle newlines and whitespace', () => {
    expect(isSafeTemplateValue('Line 1\nLine 2')).toBe(true);
    expect(isSafeTemplateValue('Tab\tSeparated')).toBe(true);
  });

  test('should handle very long but safe strings', () => {
    const longSafe = 'a'.repeat(9999);
    expect(isSafeTemplateValue(longSafe)).toBe(true);
  });

  test('should detect obfuscated script tags', () => {
    // Note: Our current implementation may not catch all obfuscation
    // This is a known limitation and more advanced filtering may be needed
    expect(containsDangerousPattern('<scr<script>ipt>')).toBe(true);
  });
});

describe('Security - Real-World Attack Payloads', () => {
  const realWorldPayloads = [
    '<img src=x onerror=alert(1)>',
    '<svg/onload=alert(1)>',
    '<iframe src="javascript:alert(1)">',
    '<body onload=alert(1)>',
    '<input onfocus=alert(1) autofocus>',
    '<select onfocus=alert(1) autofocus>',
    '<textarea onfocus=alert(1) autofocus>',
    '<keygen onfocus=alert(1) autofocus>',
    '<video><source onerror="alert(1)">',
    '<audio src=x onerror=alert(1)>',
  ];

  test.each(realWorldPayloads)('should detect payload: %s', (payload) => {
    expect(containsDangerousPattern(payload)).toBe(true);
  });
});

