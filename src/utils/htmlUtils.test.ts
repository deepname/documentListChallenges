import { describe, it, expect } from 'vitest';
import { escapeHtml } from './htmlUtils';

describe('escapeHtml', () => {
  // Fast: Simple DOM operation in happy-dom
  // Independent: No shared state between tests
  // Repeatable: Same input always produces same output
  // Self-validating: Clear assertions
  // Timely: Tests security-critical XSS prevention

  it('should escape HTML special characters', () => {
    const input = '<script>alert("XSS")</script>';
    const result = escapeHtml(input);

    expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    expect(result).not.toContain('<script>');
  });

  it('should escape ampersands', () => {
    const input = 'Tom & Jerry';
    const result = escapeHtml(input);

    expect(result).toBe('Tom &amp; Jerry');
  });

  it('should escape double quotes', () => {
    const input = 'He said "Hello"';
    const result = escapeHtml(input);

    expect(result).toBe('He said &quot;Hello&quot;');
  });

  it('should escape single quotes', () => {
    const input = "It's a test";
    const result = escapeHtml(input);

    expect(result).toBe('It&#039;s a test');
  });

  it('should escape less than and greater than symbols', () => {
    const input = '5 < 10 > 3';
    const result = escapeHtml(input);

    expect(result).toBe('5 &lt; 10 &gt; 3');
  });

  it('should handle empty string', () => {
    const input = '';
    const result = escapeHtml(input);

    expect(result).toBe('');
  });

  it('should handle plain text without special characters', () => {
    const input = 'Hello World';
    const result = escapeHtml(input);

    expect(result).toBe('Hello World');
  });

  it('should escape multiple special characters in one string', () => {
    const input = '<div class="test" data-value=\'5 & 10\'>Content</div>';
    const result = escapeHtml(input);

    expect(result).toBe(
      '&lt;div class=&quot;test&quot; data-value=&#039;5 &amp; 10&#039;&gt;Content&lt;/div&gt;'
    );
  });

  it('should prevent XSS with event handlers', () => {
    const input = '<img src=x onerror="alert(1)">';
    const result = escapeHtml(input);

    expect(result).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    expect(result).not.toContain('<img');
    // Note: 'onerror=' is still present but the dangerous characters are escaped
  });

  it('should handle unicode characters correctly', () => {
    const input = 'Hello 世界 🌍';
    const result = escapeHtml(input);

    expect(result).toBe('Hello 世界 🌍');
  });

  it('should escape nested HTML tags', () => {
    const input = '<div><span>Text</span></div>';
    const result = escapeHtml(input);

    expect(result).toBe('&lt;div&gt;&lt;span&gt;Text&lt;/span&gt;&lt;/div&gt;');
  });

  it('should handle strings with only special characters', () => {
    const input = '<>&"\'';
    const result = escapeHtml(input);

    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).toContain('&amp;');
  });
});
