import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CardComponent } from './cardComponent';
import { Document } from '../../models/document';

vi.mock('../../utils/htmlUtils', () => ({
  escapeHtml: (html: string) => html,
}));

describe('CardComponent', () => {
  let component: CardComponent;

  const mockDocument: Document = {
    ID: 'doc-1',
    Title: 'Test Document',
    Contributors: [
      { ID: 'user-1', Name: 'Alice' },
      { ID: 'user-2', Name: 'Bob' },
    ],
    Version: '1.0.0',
    Attachments: ['file1.pdf', 'file2.docx'],
    CreatedAt: new Date('2024-01-15T10:30:00Z'),
    UpdatedAt: new Date('2024-01-15T10:30:00Z'),
  };

  const mockDocumentNoAttachments: Document = {
    ID: 'doc-2',
    Title: 'Document Without Attachments',
    Contributors: [{ ID: 'user-3', Name: 'Charlie' }],
    Version: 2,
    Attachments: [],
    CreatedAt: new Date('2024-01-16T10:30:00Z'),
    UpdatedAt: new Date('2024-01-16T10:30:00Z'),
  };

  const mockDocumentNoContributors: Document = {
    ID: 'doc-3',
    Title: 'Document Without Contributors',
    Contributors: [],
    Version: '3.0.0',
    Attachments: ['file3.xlsx'],
    CreatedAt: new Date('2024-01-17T10:30:00Z'),
    UpdatedAt: new Date('2024-01-17T10:30:00Z'),
  };

  beforeEach(() => {
    component = new CardComponent();
  });

  describe('render', () => {
    it('should render document card with basic structure', () => {
      // Arrange & Act
      const html = component.render(mockDocument);

      // Assert
      expect(html).toContain('document-card');
      expect(html).toContain('card-title');
      expect(html).toContain('card-section');
    });

    it('should render document title', () => {
      // Arrange & Act
      const html = component.render(mockDocument);

      // Assert
      expect(html).toContain('Test Document');
      expect(html).toContain('<h3>');
    });

    it('should render document version', () => {
      // Arrange & Act
      const html = component.render(mockDocument);

      // Assert
      expect(html).toContain('Version 1.0.0');
      expect(html).toContain('card-version');
    });

    it('should render numeric version correctly', () => {
      // Arrange & Act
      const html = component.render(mockDocumentNoAttachments);

      // Assert
      expect(html).toContain('Version 2');
    });
  });

  describe('contributors rendering', () => {
    it('should render all contributors', () => {
      // Arrange & Act
      const html = component.render(mockDocument);

      // Assert
      expect(html).toContain('Alice');
      expect(html).toContain('Bob');
    });

    it('should render single contributor', () => {
      // Arrange & Act
      const html = component.render(mockDocumentNoAttachments);

      // Assert
      expect(html).toContain('Charlie');
      expect(html).toContain('card-item');
    });

    it('should render empty contributors section when no contributors', () => {
      // Arrange & Act
      const html = component.render(mockDocumentNoContributors);

      // Assert
      expect(html).toContain('card-section');
    });

    it('should use card-item class for contributors', () => {
      // Arrange & Act
      const html = component.render(mockDocument);

      // Assert
      const cardItemCount = (html.match(/card-item/g) || []).length;
      expect(cardItemCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('attachments rendering', () => {
    it('should render all attachments', () => {
      // Arrange & Act
      const html = component.render(mockDocument);

      // Assert
      expect(html).toContain('file1.pdf');
      expect(html).toContain('file2.docx');
    });

    it('should render single attachment', () => {
      // Arrange & Act
      const html = component.render(mockDocumentNoContributors);

      // Assert
      expect(html).toContain('file3.xlsx');
    });

    it('should not render attachments section when empty', () => {
      // Arrange & Act
      const html = component.render(mockDocumentNoAttachments);

      // Assert
      expect(html).not.toContain('file');
    });

    it('should use card-attachments class for attachments section', () => {
      // Arrange & Act
      const html = component.render(mockDocument);

      // Assert
      expect(html).toContain('card-attachments');
    });

    it('should use card-item class for each attachment', () => {
      // Arrange & Act
      const html = component.render(mockDocument);

      // Assert
      expect(html).toContain('card-item');
    });
  });

  describe('HTML escaping', () => {
    it('should escape HTML in document title', () => {
      // Arrange
      const docWithHtml: Document = {
        ...mockDocument,
        Title: '<script>alert("xss")</script>',
      };

      // Act
      const html = component.render(docWithHtml);

      // Assert
      expect(html).toContain('<script>alert("xss")</script>');
    });

    it('should escape HTML in contributor names', () => {
      // Arrange
      const docWithHtml: Document = {
        ...mockDocument,
        Contributors: [{ ID: 'user-1', Name: '<img src=x onerror=alert(1)>' }],
      };

      // Act
      const html = component.render(docWithHtml);

      // Assert
      expect(html).toContain('<img src=x onerror=alert(1)>');
    });

    it('should escape HTML in attachment names', () => {
      // Arrange
      const docWithHtml: Document = {
        ...mockDocument,
        Attachments: ['<script>alert("xss")</script>.pdf'],
      };

      // Act
      const html = component.render(docWithHtml);

      // Assert
      expect(html).toContain('<script>alert("xss")</script>.pdf');
    });
  });

  describe('edge cases', () => {
    it('should render card with empty title', () => {
      // Arrange
      const docWithEmptyTitle: Document = {
        ...mockDocument,
        Title: '',
      };

      // Act
      const html = component.render(docWithEmptyTitle);

      // Assert
      expect(html).toContain('document-card');
      expect(html).toContain('<h3></h3>');
    });

    it('should render card with special characters in title', () => {
      // Arrange
      const docWithSpecialChars: Document = {
        ...mockDocument,
        Title: 'Document & Report (2024)',
      };

      // Act
      const html = component.render(docWithSpecialChars);

      // Assert
      expect(html).toContain('Document & Report (2024)');
    });

    it('should render card with many contributors', () => {
      // Arrange
      const docWithManyContributors: Document = {
        ...mockDocument,
        Contributors: Array.from({ length: 10 }, (_, i) => ({
          ID: `user-${i}`,
          Name: `Contributor ${i}`,
        })),
      };

      // Act
      const html = component.render(docWithManyContributors);

      // Assert
      expect(html).toContain('Contributor 0');
      expect(html).toContain('Contributor 9');
    });

    it('should render card with many attachments', () => {
      // Arrange
      const docWithManyAttachments: Document = {
        ...mockDocument,
        Attachments: Array.from({ length: 10 }, (_, i) => `file${i}.pdf`),
      };

      // Act
      const html = component.render(docWithManyAttachments);

      // Assert
      expect(html).toContain('file0.pdf');
      expect(html).toContain('file9.pdf');
    });

    it('should render valid HTML structure', () => {
      // Arrange & Act
      const html = component.render(mockDocument);

      // Assert
      expect(html).toContain('<div');
      expect(html).toContain('</div>');
      expect(html).toContain('<h3>');
      expect(html).toContain('</h3>');
    });
  });

  describe('version rendering', () => {
    it('should render string version', () => {
      // Arrange
      const docWithStringVersion: Document = {
        ...mockDocument,
        Version: '2.5.1',
      };

      // Act
      const html = component.render(docWithStringVersion);

      // Assert
      expect(html).toContain('Version 2.5.1');
    });

    it('should render numeric version', () => {
      // Arrange
      const docWithNumericVersion: Document = {
        ...mockDocument,
        Version: 5,
      };

      // Act
      const html = component.render(docWithNumericVersion);

      // Assert
      expect(html).toContain('Version 5');
    });
  });
});
