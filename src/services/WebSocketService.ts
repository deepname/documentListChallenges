import { SocketsNotification } from '../models/Sockets';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private onDocumentReceived: (notification: SocketsNotification) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor(onDocumentReceived: (notification: SocketsNotification) => void) {
    this.onDocumentReceived = onDocumentReceived;
  }

  connect(): void {
    const wsUrl = 'ws://localhost:8080/notifications';

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected - real-time updates enabled');
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
        console.log('🔌 WebSocket disconnected - attempting reconnection...');
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
      console.log(
        `🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`
      );
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.log('📴 Running in offline mode - data saved locally');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}
