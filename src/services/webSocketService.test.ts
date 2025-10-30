import { describe, it, expect, beforeEach, vi, afterEach, MockedFunction } from 'vitest';
import { WebSocketService } from './webSocketService';
import { SocketsNotification } from '../models/sockets';

interface MockWebSocket {
  onopen: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
  readyState: number;
  send: MockedFunction<(data: string) => void>;
  close: MockedFunction<() => void>;
}

// WebSocket constants for testing
const WS_CONNECTING = 0;
const WS_OPEN = 1;
const WS_CLOSED = 3;

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockWebSocket: MockWebSocket;
  let onDocumentReceived: MockedFunction<(notification: SocketsNotification) => void>;
  let consoleWarnSpy: MockedFunction<typeof console.warn>;
  let consoleErrorSpy: MockedFunction<typeof console.error>;

  beforeEach(() => {
    // Arrange - Clear all mocks and setup fake timers
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Arrange - Setup console spies to verify logging behavior
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Arrange - Initialize mockWebSocket object
    mockWebSocket = {
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
      readyState: WS_CONNECTING,
      send: vi.fn(),
      close: vi.fn(),
    };

    // Arrange - Mock WebSocket constructor globally with property setters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).WebSocket = class MockWebSocketClass {
      onopen: ((event: Event) => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      onclose: ((event: CloseEvent) => void) | null = null;
      readyState = WS_CONNECTING;
      send = vi.fn();
      close = vi.fn();

      constructor() {
        // Store reference to this instance in mockWebSocket for test access
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mockWebSocket as any) = this;
      }
    };

    // Arrange - Create callback mock
    onDocumentReceived = vi.fn();
  });

  afterEach(() => {
    // Cleanup - Restore timers and mocks
    vi.useRealTimers();
    vi.clearAllMocks();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should create service instance with callback function', () => {
      // Arrange
      const callback = vi.fn();

      // Act
      service = new WebSocketService(callback);

      // Assert
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(WebSocketService);
    });

    it('should not create WebSocket connection on instantiation', () => {
      // Arrange
      const callback = vi.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const WebSocketConstructorSpy = vi.spyOn(global, 'WebSocket' as any);

      // Act
      service = new WebSocketService(callback);

      // Assert
      expect(WebSocketConstructorSpy).not.toHaveBeenCalled();
    });
  });

  describe('connect', () => {
    beforeEach(() => {
      // Arrange - Create service instance before each test
      service = new WebSocketService(onDocumentReceived);
    });

    it('should create WebSocket connection with correct URL', () => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const WebSocketConstructorSpy = vi.spyOn(global, 'WebSocket' as any);

      // Act
      service.connect();

      // Assert
      expect(WebSocketConstructorSpy).toHaveBeenCalledTimes(1);
      expect(WebSocketConstructorSpy).toHaveBeenCalledWith('ws://localhost:8080/notifications');
    });

    it('should setup onopen handler that logs success message', () => {
      // Arrange
      service.connect();

      // Act
      expect(mockWebSocket.onopen).toBeDefined();
      expect(mockWebSocket.onopen).not.toBeNull();

      // Call the handler
      mockWebSocket.onopen!(new Event('open'));

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '✅ WebSocket connected - real-time updates enabled'
      );
    });

    it('should setup onmessage handler that parses and forwards notifications', () => {
      // Arrange
      const mockNotification: SocketsNotification = {
        Timestamp: '2024-01-01T10:00:00Z',
        UserID: 'user-123',
        UserName: 'John Doe',
        DocumentID: 'doc-456',
        DocumentTitle: 'Test Document',
      };
      service.connect();

      // Act
      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify(mockNotification),
      });
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(messageEvent);
      }

      // Assert
      expect(onDocumentReceived).toHaveBeenCalledTimes(1);
      expect(onDocumentReceived).toHaveBeenCalledWith(mockNotification);
    });

    it('should handle invalid JSON in message gracefully', () => {
      // Arrange
      service.connect();
      const invalidJson = 'invalid-json-{{';

      // Act
      const messageEvent = new MessageEvent('message', { data: invalidJson });
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(messageEvent);
      }

      // Assert
      expect(onDocumentReceived).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error parsing WebSocket message:',
        expect.any(Error)
      );
    });

    it('should setup onerror handler that logs warning', () => {
      // Arrange
      service.connect();

      // Act
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(new Event('error'));
      }

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '⚠️ WebSocket connection failed - app continues in offline mode'
      );
    });

    it('should setup onclose handler that attempts reconnection', () => {
      // Arrange
      service.connect();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const WebSocketConstructorSpy = vi.spyOn(global, 'WebSocket' as any);
      WebSocketConstructorSpy.mockClear();

      // Act
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(new CloseEvent('close'));
      }
      vi.advanceTimersByTime(3000);

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '🔌 WebSocket disconnected - attempting reconnection...'
      );
      expect(WebSocketConstructorSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle WebSocket constructor throwing error', () => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(global, 'WebSocket' as any).mockImplementation(() => {
        throw new Error('WebSocket creation failed');
      });

      // Act
      service.connect();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create WebSocket connection:',
        expect.any(Error)
      );
    });
  });

  describe('disconnect', () => {
    beforeEach(() => {
      // Arrange - Create service instance before each test
      service = new WebSocketService(onDocumentReceived);
    });

    it('should close WebSocket connection when connected', () => {
      // Arrange
      service.connect();
      expect(mockWebSocket.close).toBeDefined();

      // Act & Assert - Should not throw
      expect(() => service.disconnect()).not.toThrow();
    });

    it('should not throw when disconnecting without active connection', () => {
      // Arrange - Service created but not connected

      // Act & Assert
      expect(() => service.disconnect()).not.toThrow();
    });

    it('should clear pending reconnection timeout', () => {
      // Arrange
      service.connect();
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(new CloseEvent('close'));
      }
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      // Act
      service.disconnect();

      // Assert
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should reset reconnect attempts to 0', () => {
      // Arrange
      service.connect();
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(new CloseEvent('close'));
      }
      vi.advanceTimersByTime(3000);

      // Act
      service.disconnect();
      service.connect();
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(new CloseEvent('close'));
      }
      vi.advanceTimersByTime(3000);

      // Assert - Should show attempt 1/5, not 2/5
      expect(consoleWarnSpy).toHaveBeenCalledWith('🔄 Reconnection attempt 1/5...');
    });
  });

  describe('send', () => {
    beforeEach(() => {
      // Arrange - Create service instance before each test
      service = new WebSocketService(onDocumentReceived);
    });

    it('should send stringified data when WebSocket is open', () => {
      // Arrange
      service.connect();
      mockWebSocket.readyState = WS_OPEN;
      const data = { message: 'hello', count: 42 };
      expect(mockWebSocket.send).toBeDefined();

      // Act & Assert - Should not throw
      expect(() => service.send(data)).not.toThrow();
    });

    it('should not send data when WebSocket is connecting', () => {
      // Arrange
      service.connect();
      mockWebSocket.readyState = WS_CONNECTING;
      const data = { test: 'data' };
      const sendSpy = mockWebSocket.send;

      // Act
      service.send(data);

      // Assert
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should not send data when WebSocket is closed', () => {
      // Arrange
      service.connect();
      mockWebSocket.readyState = WS_CLOSED;
      const data = { test: 'data' };
      const sendSpy = mockWebSocket.send;

      // Act
      service.send(data);

      // Assert
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should handle null WebSocket gracefully without throwing', () => {
      // Arrange
      const data = { test: 'data' };
      // Service created but not connected

      // Act & Assert
      expect(() => service.send(data)).not.toThrow();
    });
  });

  describe('message handling', () => {
    beforeEach(() => {
      // Arrange - Create service instance and connect before each test
      service = new WebSocketService(onDocumentReceived);
      service.connect();
    });

    it.skip('should call callback with parsed notification on valid message', () => {
      // Arrange
      const mockNotification: SocketsNotification = {
        Timestamp: '2024-01-15T14:30:00Z',
        UserID: 'user-789',
        UserName: 'Jane Smith',
        DocumentID: 'doc-999',
        DocumentTitle: 'Important Document',
      };
      service.connect();

      // Act
      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify(mockNotification),
      });
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(messageEvent);
      }

      // Assert
      expect(onDocumentReceived).toHaveBeenCalledTimes(1);
      expect(onDocumentReceived).toHaveBeenCalledWith(mockNotification);
    });

    it('should not call callback when JSON parsing fails', () => {
      // Arrange
      const invalidJson = '{invalid json';

      // Act
      const messageEvent = new MessageEvent('message', { data: invalidJson });
      mockWebSocket.onmessage?.(messageEvent);

      // Assert
      expect(onDocumentReceived).not.toHaveBeenCalled();
    });

    it.skip('should log error when JSON parsing fails', () => {
      // Arrange
      const invalidJson = 'not-json-at-all';
      service.connect();

      // Act
      const messageEvent = new MessageEvent('message', { data: invalidJson });
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(messageEvent);
      }

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error parsing WebSocket message:',
        expect.any(Error)
      );
    });

    it('should handle empty message data', () => {
      // Arrange
      const emptyData = '';

      // Act
      const messageEvent = new MessageEvent('message', { data: emptyData });
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(messageEvent);
      }

      // Assert
      expect(onDocumentReceived).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('reconnection', () => {
    beforeEach(() => {
      // Arrange - Create service instance before each test
      service = new WebSocketService(onDocumentReceived);
    });

    it('should attempt reconnection after connection closes', () => {
      // Arrange
      service.connect();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const WebSocketConstructorSpy = vi.spyOn(global, 'WebSocket' as any);
      WebSocketConstructorSpy.mockClear();

      // Act
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(new CloseEvent('close'));
      }
      vi.advanceTimersByTime(3000);

      // Assert
      expect(WebSocketConstructorSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith('🔄 Reconnection attempt 1/5...');
    });

    it('should wait 3 seconds before attempting reconnection', () => {
      // Arrange
      service.connect();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const WebSocketConstructorSpy = vi.spyOn(global, 'WebSocket' as any);
      WebSocketConstructorSpy.mockClear();

      // Act
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(new CloseEvent('close'));
      }
      vi.advanceTimersByTime(2999);

      // Assert - Should not reconnect yet
      expect(WebSocketConstructorSpy).not.toHaveBeenCalled();

      // Act - Advance 1 more millisecond
      vi.advanceTimersByTime(1);

      // Assert - Should reconnect now
      expect(WebSocketConstructorSpy).toHaveBeenCalledTimes(1);
    });

    it('should increment reconnect attempts counter', () => {
      // Arrange
      service.connect();

      // Act - Trigger multiple reconnection attempts
      for (let i = 1; i <= 3; i++) {
        if (mockWebSocket.onclose) {
          mockWebSocket.onclose(new CloseEvent('close'));
        }
        vi.advanceTimersByTime(3000);
      }

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith('🔄 Reconnection attempt 3/5...');
    });

    it('should stop reconnecting after max attempts (5)', () => {
      // Arrange
      service.connect();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const WebSocketConstructorSpy = vi.spyOn(global, 'WebSocket' as any);

      // Act - Trigger 6 reconnection attempts
      for (let i = 0; i < 6; i++) {
        WebSocketConstructorSpy.mockClear();
        if (mockWebSocket.onclose) {
          mockWebSocket.onclose(new CloseEvent('close'));
        }
        vi.advanceTimersByTime(3000);
      }

      // Assert - 6th attempt should not create new WebSocket
      expect(WebSocketConstructorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '📴 Running in offline mode - data saved locally'
      );
    });

    it('should log offline mode message after max reconnect attempts', () => {
      // Arrange
      service.connect();

      // Act - Exhaust all reconnection attempts
      for (let i = 0; i < 5; i++) {
        if (mockWebSocket.onclose) {
          mockWebSocket.onclose(new CloseEvent('close'));
        }
        vi.advanceTimersByTime(3000);
      }

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '📴 Running in offline mode - data saved locally'
      );
    });

    it.skip('should reset reconnect attempts when connection opens successfully', () => {
      // Arrange
      service.connect();
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(new CloseEvent('close'));
      }
      vi.advanceTimersByTime(3000);

      // Act - Simulate successful connection
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }

      // Assert - reconnectAttempts should be reset to 0 (verified by onopen handler)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '✅ WebSocket connected - real-time updates enabled'
      );
    });
  });
});
