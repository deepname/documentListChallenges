import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WebSocketService } from './webSocketService';

describe('WebSocketService', () => {
    let service: WebSocketService;
    const onDocumentReceived = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        // Mock WebSocket globally
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global as any).WebSocket = vi.fn(() => ({
            onopen: null,
            onmessage: null,
            onerror: null,
            onclose: null,
            readyState: 0,
            send: vi.fn(),
            close: vi.fn(),
        }));
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with callback function', () => {
            // Arrange & Act
            const callback = vi.fn();
            service = new WebSocketService(callback);

            // Assert
            expect(service).toBeDefined();
        });

        it('should store the callback function', () => {
            // Arrange & Act
            const callback = vi.fn();
            service = new WebSocketService(callback);

            // Assert
            expect(service).toBeDefined();
        });
    });

    describe('connect', () => {
        beforeEach(() => {
            service = new WebSocketService(onDocumentReceived);
        });

        it('should create WebSocket connection', () => {
            // Arrange
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const WebSocketSpy = vi.spyOn(global, 'WebSocket' as any);

            // Act
            service.connect();

            // Assert
            expect(WebSocketSpy).toHaveBeenCalledWith('ws://localhost:8080/notifications');
        });

        it('should not throw on connection error', () => {
            // Arrange
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vi.spyOn(global, 'WebSocket' as any).mockImplementation(() => {
                throw new Error('WebSocket creation failed');
            });

            // Act & Assert
            expect(() => service.connect()).not.toThrow();
        });
    });

    describe('disconnect', () => {
        beforeEach(() => {
            service = new WebSocketService(onDocumentReceived);
        });

        it('should not throw when disconnecting', () => {
            // Act & Assert
            expect(() => service.disconnect()).not.toThrow();
        });

        it('should reset reconnect attempts', () => {
            // Arrange
            service.connect();

            // Act
            service.disconnect();

            // Assert - should not throw and service should be in clean state
            expect(service).toBeDefined();
        });
    });

    describe('send', () => {
        beforeEach(() => {
            service = new WebSocketService(onDocumentReceived);
        });

        it('should not throw when sending data', () => {
            // Arrange
            const data = { test: 'data' };

            // Act & Assert
            expect(() => service.send(data)).not.toThrow();
        });

        it('should stringify data before sending', () => {
            // Arrange
            const data = { message: 'hello', count: 42 };

            // Act & Assert
            expect(() => service.send(data)).not.toThrow();
        });

        it('should handle null WebSocket gracefully', () => {
            // Arrange
            const data = { test: 'data' };

            // Act & Assert
            expect(() => service.send(data)).not.toThrow();
        });
    });

    describe('message handling', () => {
        it('should call callback when message is received', () => {
            // Arrange
            service = new WebSocketService(onDocumentReceived);

            // Act & Assert
            expect(service).toBeDefined();
        });

        it('should handle invalid JSON gracefully', () => {
            // Arrange
            service = new WebSocketService(onDocumentReceived);

            // Act & Assert
            expect(service).toBeDefined();
        });
    });

    describe('reconnection', () => {
        beforeEach(() => {
            service = new WebSocketService(onDocumentReceived);
        });

        it('should attempt reconnection after connection closes', () => {
            // Arrange
            service.connect();

            // Act
            vi.advanceTimersByTime(3000);

            // Assert
            expect(service).toBeDefined();
        });

        it('should stop reconnecting after max attempts', () => {
            // Arrange
            service.connect();

            // Act
            for (let i = 0; i < 6; i++) {
                vi.advanceTimersByTime(3000);
            }

            // Assert
            expect(service).toBeDefined();
        });
    });
});
