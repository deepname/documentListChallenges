import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationService } from './notificationService';
import { Document } from '../models/document';
import { DocumentView } from '../views/documentView';

describe('NotificationService', () => {
  let mockView: { showNotification: ReturnType<typeof vi.fn> };
  let notificationService: NotificationService;
  let sampleDocument: Document;

  beforeEach(() => {
    // Arrange - Create mock view
    mockView = {
      showNotification: vi.fn(),
    };

    // Arrange - Create service instance with mock view
    notificationService = new NotificationService(mockView as unknown as DocumentView);

    // Arrange - Create sample document for testing
    sampleDocument = {
      ID: '123',
      Title: 'Test Document',
      Contributors: [
        { ID: '1', Name: 'John Doe' },
        { ID: '2', Name: 'Jane Smith' },
      ],
      Version: 1,
      Attachments: ['file1.pdf', 'file2.docx'],
      CreatedAt: new Date('2024-01-01'),
      UpdatedAt: new Date('2024-01-02'),
    };
  });

  describe('notifyDocumentCreated', () => {
    it('should show notification with correct message when document is created', () => {
      // Arrange
      const expectedMessage = `Document created: ${sampleDocument.Title}`;

      // Act
      notificationService.notifyDocumentCreated(sampleDocument);

      // Assert
      expect(mockView.showNotification).toHaveBeenCalledTimes(1);
      expect(mockView.showNotification).toHaveBeenCalledWith(expectedMessage);
    });

    it('should handle document with special characters in title', () => {
      // Arrange
      const docWithSpecialChars = {
        ...sampleDocument,
        Title: 'Test & Document <Special>',
      };
      const expectedMessage = `Document created: ${docWithSpecialChars.Title}`;

      // Act
      notificationService.notifyDocumentCreated(docWithSpecialChars);

      // Assert
      expect(mockView.showNotification).toHaveBeenCalledWith(expectedMessage);
    });

    it('should handle document with empty title', () => {
      // Arrange
      const docWithEmptyTitle = {
        ...sampleDocument,
        Title: '',
      };
      const expectedMessage = 'Document created: ';

      // Act
      notificationService.notifyDocumentCreated(docWithEmptyTitle);

      // Assert
      expect(mockView.showNotification).toHaveBeenCalledWith(expectedMessage);
    });
  });

  describe('notifyDocumentReceived', () => {
    it('should show notification with correct message when document is received', () => {
      // Arrange
      const expectedMessage = `New document added: ${sampleDocument.Title}`;

      // Act
      notificationService.notifyDocumentReceived(sampleDocument);

      // Assert
      expect(mockView.showNotification).toHaveBeenCalledTimes(1);
      expect(mockView.showNotification).toHaveBeenCalledWith(expectedMessage);
    });

    it('should handle document with long title', () => {
      // Arrange
      const longTitle = 'A'.repeat(200);
      const docWithLongTitle = {
        ...sampleDocument,
        Title: longTitle,
      };
      const expectedMessage = `New document added: ${longTitle}`;

      // Act
      notificationService.notifyDocumentReceived(docWithLongTitle);

      // Assert
      expect(mockView.showNotification).toHaveBeenCalledWith(expectedMessage);
    });

    it('should handle document with unicode characters in title', () => {
      // Arrange
      const docWithUnicode = {
        ...sampleDocument,
        Title: '文档测试 📄',
      };
      const expectedMessage = `New document added: ${docWithUnicode.Title}`;

      // Act
      notificationService.notifyDocumentReceived(docWithUnicode);

      // Assert
      expect(mockView.showNotification).toHaveBeenCalledWith(expectedMessage);
    });
  });

  describe('notify', () => {
    it('should show notification with custom message', () => {
      // Arrange
      const customMessage = 'This is a custom notification';

      // Act
      notificationService.notify(customMessage);

      // Assert
      expect(mockView.showNotification).toHaveBeenCalledTimes(1);
      expect(mockView.showNotification).toHaveBeenCalledWith(customMessage);
    });

    it('should handle empty message', () => {
      // Arrange
      const emptyMessage = '';

      // Act
      notificationService.notify(emptyMessage);

      // Assert
      expect(mockView.showNotification).toHaveBeenCalledWith(emptyMessage);
    });

    it('should handle message with special characters', () => {
      // Arrange
      const specialMessage = 'Error: <script>alert("test")</script>';

      // Act
      notificationService.notify(specialMessage);

      // Assert
      expect(mockView.showNotification).toHaveBeenCalledWith(specialMessage);
    });

    it('should handle multiline message', () => {
      // Arrange
      const multilineMessage = 'Line 1\nLine 2\nLine 3';

      // Act
      notificationService.notify(multilineMessage);

      // Assert
      expect(mockView.showNotification).toHaveBeenCalledWith(multilineMessage);
    });
  });

  describe('constructor', () => {
    it('should create instance with provided view', () => {
      // Arrange & Act
      const service = new NotificationService(mockView as unknown as DocumentView);

      // Assert
      expect(service).toBeInstanceOf(NotificationService);
    });
  });
});
