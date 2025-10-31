import { Document } from '../models/document';
import { SocketsNotification } from '../models/sockets';
import { fromSocketNotification } from '../utils/documentUtils';
import { WebSocketService } from './webSocketService';

/**
 * Manager responsible for WebSocket lifecycle and data transformation
 * Handles connection management and maps socket notifications to documents
 */
export class WebSocketManager {
  private wsService: WebSocketService;

  /**
   * @param onDocumentReceived - Callback invoked when a document is received via WebSocket
   * @param wsService - Optional WebSocketService instance for dependency injection
   */
  constructor(
    private onDocumentReceived: (document: Document) => void,
    wsService?: WebSocketService
  ) {
    this.wsService = wsService || new WebSocketService(this.handleNotification.bind(this));
  }

  /**
   * Handles incoming WebSocket notifications
   * Transforms socket notification to document and forwards to callback
   * @param notification - The socket notification received
   */
  private handleNotification(notification: SocketsNotification): void {
    const document = fromSocketNotification(notification);
    this.onDocumentReceived(document);
  }

  /**
   * Establishes WebSocket connection
   */
  connect(): void {
    this.wsService.connect();
  }

  /**
   * Closes WebSocket connection
   */
  disconnect(): void {
    this.wsService.disconnect();
  }

  /**
   * Sends data through the WebSocket connection
   * @param data - The data to send
   */
  send(data: unknown): void {
    this.wsService.send(data);
  }
}
