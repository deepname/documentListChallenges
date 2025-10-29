import { describe, it, expect } from 'vitest';
import { DocumentMapper, parseDocumentDates } from './documentUtils';
import { SocketsNotification } from '../models/Sockets';
import { Document } from '../models/Document';

describe('DocumentMapper', () => {
  describe('fromSocketNotification', () => {
    // Fast: Simple transformation without I/O
    // Independent: No shared state
    // Repeatable: Same input always produces same output
    // Self-validating: Clear assertions
    // Timely: Tests core business logic
    it('should map socket notification to document with correct fields', () => {
      const notification: SocketsNotification = {
        Timestamp: '2024-01-15T10:30:00Z',
        UserID: 'user-123',
        UserName: 'John Doe',
        DocumentID: 'doc-456',
        DocumentTitle: 'Test Document',
      };

      const result = DocumentMapper.fromSocketNotification(notification);

      expect(result.ID).toBe('doc-456');
      expect(result.Title).toBe('Test Document');
      expect(result.Version).toBe(1);
      expect(result.Attachments).toEqual([]);
      expect(result.Contributors).toHaveLength(1);
      expect(result.Contributors[0].ID).toBe('user-123');
      expect(result.Contributors[0].Name).toBe('John Doe');
    });

    it('should convert timestamp string to Date objects for CreatedAt and UpdatedAt', () => {
      const notification: SocketsNotification = {
        Timestamp: '2024-01-15T10:30:00Z',
        UserID: 'user-123',
        UserName: 'John Doe',
        DocumentID: 'doc-456',
        DocumentTitle: 'Test Document',
      };

      const result = DocumentMapper.fromSocketNotification(notification);

      expect(result.CreatedAt).toBeInstanceOf(Date);
      expect(result.UpdatedAt).toBeInstanceOf(Date);
      expect(result.CreatedAt.toISOString()).toBe('2024-01-15T10:30:00.000Z');
      expect(result.UpdatedAt.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should handle special characters in title and username', () => {
      const notification: SocketsNotification = {
        Timestamp: '2024-01-15T10:30:00Z',
        UserID: 'user-123',
        UserName: "O'Brien & Co.",
        DocumentID: 'doc-456',
        DocumentTitle: '<Script> "Test" & More',
      };

      const result = DocumentMapper.fromSocketNotification(notification);

      expect(result.Title).toBe('<Script> "Test" & More');
      expect(result.Contributors[0].Name).toBe("O'Brien & Co.");
    });

    it('should handle empty strings in notification fields', () => {
      const notification: SocketsNotification = {
        Timestamp: '2024-01-15T10:30:00Z',
        UserID: '',
        UserName: '',
        DocumentID: '',
        DocumentTitle: '',
      };

      const result = DocumentMapper.fromSocketNotification(notification);

      expect(result.ID).toBe('');
      expect(result.Title).toBe('');
      expect(result.Contributors[0].ID).toBe('');
      expect(result.Contributors[0].Name).toBe('');
    });
  });
});

describe('parseDocumentDates', () => {
  // Fast: Simple date parsing without I/O
  // Independent: Pure function with no side effects
  // Repeatable: Deterministic output
  // Self-validating: Clear pass/fail
  // Timely: Tests data transformation logic
  it('should convert date strings to Date objects', () => {
    const doc: Document = {
      ID: 'doc-123',
      Title: 'Test Doc',
      Contributors: [],
      Version: 1,
      Attachments: [],
      CreatedAt: '2024-01-15T10:30:00Z' as unknown as Date,
      UpdatedAt: '2024-01-20T15:45:00Z' as unknown as Date,
    };

    const result = parseDocumentDates(doc);

    expect(result.CreatedAt).toBeInstanceOf(Date);
    expect(result.UpdatedAt).toBeInstanceOf(Date);
    expect(result.CreatedAt.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    expect(result.UpdatedAt.toISOString()).toBe('2024-01-20T15:45:00.000Z');
  });

  it('should preserve all other document properties', () => {
    const doc: Document = {
      ID: 'doc-123',
      Title: 'Test Doc',
      Contributors: [{ ID: 'user-1', Name: 'Alice' }],
      Version: 5,
      Attachments: ['file1.pdf', 'file2.docx'],
      CreatedAt: '2024-01-15T10:30:00Z' as unknown as Date,
      UpdatedAt: '2024-01-20T15:45:00Z' as unknown as Date,
    };

    const result = parseDocumentDates(doc);

    expect(result.ID).toBe('doc-123');
    expect(result.Title).toBe('Test Doc');
    expect(result.Contributors).toEqual([{ ID: 'user-1', Name: 'Alice' }]);
    expect(result.Version).toBe(5);
    expect(result.Attachments).toEqual(['file1.pdf', 'file2.docx']);
  });

  it('should handle Date objects that are already Date instances', () => {
    const now = new Date();
    const doc: Document = {
      ID: 'doc-123',
      Title: 'Test Doc',
      Contributors: [],
      Version: 1,
      Attachments: [],
      CreatedAt: now,
      UpdatedAt: now,
    };

    const result = parseDocumentDates(doc);

    expect(result.CreatedAt).toBeInstanceOf(Date);
    expect(result.UpdatedAt).toBeInstanceOf(Date);
    expect(result.CreatedAt.getTime()).toBe(now.getTime());
    expect(result.UpdatedAt.getTime()).toBe(now.getTime());
  });

  it('should not mutate the original document object', () => {
    const doc: Document = {
      ID: 'doc-123',
      Title: 'Test Doc',
      Contributors: [],
      Version: 1,
      Attachments: [],
      CreatedAt: '2024-01-15T10:30:00Z' as unknown as Date,
      UpdatedAt: '2024-01-20T15:45:00Z' as unknown as Date,
    };

    const originalCreatedAt = doc.CreatedAt;
    const originalUpdatedAt = doc.UpdatedAt;

    parseDocumentDates(doc);

    expect(doc.CreatedAt).toBe(originalCreatedAt);
    expect(doc.UpdatedAt).toBe(originalUpdatedAt);
  });
});
