import { SocketsNotification } from '../models/Sockets';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private onDocumentReceived: (notification: SocketsNotification) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(onDocumentReceived: (notification: SocketsNotification) => void) {
    this.onDocumentReceived = onDocumentReceived;
  }

  connect(): void {
    const wsUrl = 'ws://localhost:8080/notifications';

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.warn('✅ WebSocket connected - real-time updates enabled');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = event => {
        try {
          const notification: SocketsNotification = JSON.parse(event.data);
          this.onDocumentReceived(notification);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = () => {
        console.warn('⚠️ WebSocket connection failed - app continues in offline mode');
      };

      this.ws.onclose = () => {
        console.warn('🔌 WebSocket disconnected - attempting reconnection...');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.warn(
        `🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`
      );
      this.reconnectTimeout = setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.warn('📴 Running in offline mode - data saved locally');
    }
  }

  disconnect(): void {
    // Clear any pending reconnection attempts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
  }

  send(data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}
