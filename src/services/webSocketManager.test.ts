import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { WebSocketManager } from './webSocketManager';
import { WebSocketService } from './webSocketService';
import type { Document } from '../models/document';
import type { SocketsNotification } from '../models/sockets';
import * as documentUtils from '../utils/documentUtils';

// Mock dependencies
vi.mock('./webSocketService');
vi.mock('../utils/documentUtils');

const MockedWebSocketService = vi.mocked(WebSocketService);

interface MockWebSocketService {
  connect: MockedFunction<() => void>;
  disconnect: MockedFunction<() => void>;
  send: MockedFunction<(data: unknown) => void>;
}

describe('WebSocketManager', () => {
  let mockWsService: MockWebSocketService;
  let mockOnDocumentReceived: MockedFunction<(document: Document) => void>;
  let sampleNotification: SocketsNotification;
  let sampleDocument: Document;

  beforeEach(() => {
    vi.clearAllMocks();

    // Arrange - Create mock WebSocket service
    mockWsService = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      send: vi.fn(),
    };

    // Arrange - Create mock callback
    mockOnDocumentReceived = vi.fn();

    // Arrange - Create sample notification
    sampleNotification = {
      Timestamp: '2024-01-01T10:00:00Z',
      UserID: 'user-123',
      UserName: 'John Doe',
      DocumentID: 'doc-456',
      DocumentTitle: 'Test Document',
    };

    // Arrange - Create sample document
    sampleDocument = {
      ID: 'doc-456',
      Title: 'Test Document',
      Contributors: [
        {
          ID: 'user-123',
          Name: 'John Doe',
        },
      ],
      Version: 1,
      Attachments: [],
      CreatedAt: new Date('2024-01-01T10:00:00Z'),
      UpdatedAt: new Date('2024-01-01T10:00:00Z'),
    };

    // Mock WebSocketService constructor
    MockedWebSocketService.mockImplementation(function (this: WebSocketService) {
      Object.assign(this, mockWsService);
      return this;
    } as unknown as typeof WebSocketService);

    // Mock fromSocketNotification function
    vi.spyOn(documentUtils, 'fromSocketNotification').mockReturnValue(sampleDocument);
  });

  describe('constructor', () => {
    it('should create instance with callback and default WebSocketService', () => {
      // Arrange & Act
      const manager = new WebSocketManager(mockOnDocumentReceived);

      // Assert
      expect(manager).toBeInstanceOf(WebSocketManager);
      expect(MockedWebSocketService).toHaveBeenCalledTimes(1);
      expect(MockedWebSocketService).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should create instance with provided WebSocketService', () => {
      // Arrange
      const customWsService = mockWsService as unknown as WebSocketService;

      // Act
      const manager = new WebSocketManager(mockOnDocumentReceived, customWsService);

      // Assert
      expect(manager).toBeInstanceOf(WebSocketManager);
      expect(MockedWebSocketService).not.toHaveBeenCalled();
    });

    it('should bind handleNotification callback to WebSocketService', () => {
      // Arrange & Act
      new WebSocketManager(mockOnDocumentReceived);

      // Assert
      expect(MockedWebSocketService).toHaveBeenCalledWith(expect.any(Function));
      const callback = MockedWebSocketService.mock.calls[0][0];
      expect(typeof callback).toBe('function');
    });
  });

  describe('connect', () => {
    it('should call wsService connect method', () => {
      // Arrange
      const manager = new WebSocketManager(mockOnDocumentReceived);

      // Act
      manager.connect();

      // Assert
      expect(mockWsService.connect).toHaveBeenCalledTimes(1);
    });

    it('should call connect only once when called once', () => {
      // Arrange
      const manager = new WebSocketManager(mockOnDocumentReceived);

      // Act
      manager.connect();

      // Assert
      expect(mockWsService.connect).toHaveBeenCalledTimes(1);
    });

    it('should call connect multiple times when called multiple times', () => {
      // Arrange
      const manager = new WebSocketManager(mockOnDocumentReceived);

      // Act
      manager.connect();
      manager.connect();
      manager.connect();

      // Assert
      expect(mockWsService.connect).toHaveBeenCalledTimes(3);
    });
  });

  describe('disconnect', () => {
    it('should call wsService disconnect method', () => {
      // Arrange
      const manager = new WebSocketManager(mockOnDocumentReceived);

      // Act
      manager.disconnect();

      // Assert
      expect(mockWsService.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should call disconnect after connect', () => {
      // Arrange
      const manager = new WebSocketManager(mockOnDocumentReceived);
      manager.connect();

      // Act
      manager.disconnect();

      // Assert
      expect(mockWsService.connect).toHaveBeenCalledTimes(1);
      expect(mockWsService.disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('send', () => {
    it('should call wsService send method with data', () => {
      // Arrange
      const manager = new WebSocketManager(mockOnDocumentReceived);
      const testData = { message: 'test' };

      // Act
      manager.send(testData);

      // Assert
      expect(mockWsService.send).toHaveBeenCalledTimes(1);
      expect(mockWsService.send).toHaveBeenCalledWith(testData);
    });

    it('should send string data', () => {
      // Arrange
      const manager = new WebSocketManager(mockOnDocumentReceived);
      const testData = 'test message';

      // Act
      manager.send(testData);

      // Assert
      expect(mockWsService.send).toHaveBeenCalledWith(testData);
    });

    it('should send object data', () => {
      // Arrange
      const manager = new WebSocketManager(mockOnDocumentReceived);
      const testData = { type: 'ping', timestamp: Date.now() };

      // Act
      manager.send(testData);

      // Assert
      expect(mockWsService.send).toHaveBeenCalledWith(testData);
    });

    it('should send array data', () => {
      // Arrange
      const manager = new WebSocketManager(mockOnDocumentReceived);
      const testData = [1, 2, 3, 4, 5];

      // Act
      manager.send(testData);

      // Assert
      expect(mockWsService.send).toHaveBeenCalledWith(testData);
    });

    it('should send null data', () => {
      // Arrange
      const manager = new WebSocketManager(mockOnDocumentReceived);

      // Act
      manager.send(null);

      // Assert
      expect(mockWsService.send).toHaveBeenCalledWith(null);
    });
  });

  describe('handleNotification (private method)', () => {
    it('should transform notification and call onDocumentReceived callback', () => {
      // Arrange
      new WebSocketManager(mockOnDocumentReceived);
      const handleNotificationCallback = MockedWebSocketService.mock.calls[0][0];

      // Act
      handleNotificationCallback(sampleNotification);

      // Assert
      expect(documentUtils.fromSocketNotification).toHaveBeenCalledTimes(1);
      expect(documentUtils.fromSocketNotification).toHaveBeenCalledWith(sampleNotification);
      expect(mockOnDocumentReceived).toHaveBeenCalledTimes(1);
      expect(mockOnDocumentReceived).toHaveBeenCalledWith(sampleDocument);
    });

    it('should handle multiple notifications', () => {
      // Arrange
      new WebSocketManager(mockOnDocumentReceived);
      const handleNotificationCallback = MockedWebSocketService.mock.calls[0][0];
      const notification2: SocketsNotification = {
        ...sampleNotification,
        DocumentID: 'doc-789',
        DocumentTitle: 'Second Document',
      };
      const document2: Document = {
        ...sampleDocument,
        ID: 'doc-789',
        Title: 'Second Document',
      };
      const mapperSpy = vi.spyOn(documentUtils, 'fromSocketNotification');
      mapperSpy.mockReturnValueOnce(sampleDocument).mockReturnValueOnce(document2);

      // Act
      handleNotificationCallback(sampleNotification);
      handleNotificationCallback(notification2);

      // Assert
      expect(documentUtils.fromSocketNotification).toHaveBeenCalledTimes(2);
      expect(mockOnDocumentReceived).toHaveBeenCalledTimes(2);
      expect(mockOnDocumentReceived).toHaveBeenNthCalledWith(1, sampleDocument);
      expect(mockOnDocumentReceived).toHaveBeenNthCalledWith(2, document2);
    });

    it('should handle notification with different user', () => {
      // Arrange
      new WebSocketManager(mockOnDocumentReceived);
      const handleNotificationCallback = MockedWebSocketService.mock.calls[0][0];
      const notificationDifferentUser: SocketsNotification = {
        Timestamp: '2024-01-02T15:30:00Z',
        UserID: 'user-999',
        UserName: 'Jane Smith',
        DocumentID: 'doc-111',
        DocumentTitle: 'Another Document',
      };

      // Act
      handleNotificationCallback(notificationDifferentUser);

      // Assert
      expect(documentUtils.fromSocketNotification).toHaveBeenCalledTimes(1);
      expect(documentUtils.fromSocketNotification).toHaveBeenCalledWith(notificationDifferentUser);
      expect(mockOnDocumentReceived).toHaveBeenCalledTimes(1);
    });

    it('should preserve callback context when handling notification', () => {
      // Arrange
      const callbackSpy = vi.fn();
      new WebSocketManager(callbackSpy);
      const handleNotificationCallback = MockedWebSocketService.mock.calls[0][0];

      // Act
      handleNotificationCallback(sampleNotification);

      // Assert
      expect(callbackSpy).toHaveBeenCalledWith(sampleDocument);
    });
  });

  describe('integration scenarios', () => {
    it('should handle full lifecycle: connect, receive, disconnect', () => {
      // Arrange
      const manager = new WebSocketManager(mockOnDocumentReceived);
      const handleNotificationCallback = MockedWebSocketService.mock.calls[0][0];

      // Act
      manager.connect();
      handleNotificationCallback(sampleNotification);
      manager.disconnect();

      // Assert
      expect(mockWsService.connect).toHaveBeenCalledTimes(1);
      expect(mockOnDocumentReceived).toHaveBeenCalledWith(sampleDocument);
      expect(mockWsService.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should handle send after connect', () => {
      // Arrange
      const manager = new WebSocketManager(mockOnDocumentReceived);
      const testData = { action: 'subscribe' };

      // Act
      manager.connect();
      manager.send(testData);

      // Assert
      expect(mockWsService.connect).toHaveBeenCalledTimes(1);
      expect(mockWsService.send).toHaveBeenCalledWith(testData);
    });

    it('should handle multiple connect and disconnect cycles', () => {
      // Arrange
      const manager = new WebSocketManager(mockOnDocumentReceived);

      // Act
      manager.connect();
      manager.disconnect();
      manager.connect();
      manager.disconnect();

      // Assert
      expect(mockWsService.connect).toHaveBeenCalledTimes(2);
      expect(mockWsService.disconnect).toHaveBeenCalledTimes(2);
    });
  });
});
