import type { Document } from '../models/document';

/**
 * Interface for notification display capability
 * Allows decoupling from specific view implementations
 */
export interface NotificationDisplayer {
  showNotification(message: string): void;
}

/**
 * Service responsible for displaying user notifications
 * Encapsulates notification logic and message formatting
 */
export class NotificationService {
  constructor(private notificationDisplayer: NotificationDisplayer) {}

  /**
   * Shows a notification when a document is created by the user
   * @param document - The document that was created
   */
  notifyDocumentCreated(document: Document): void {
    this.notificationDisplayer.showNotification(`Document created: ${document.Title}`);
  }

  /**
   * Shows a notification when a document is received via WebSocket
   * @param document - The document that was received
   */
  notifyDocumentReceived(document: Document): void {
    this.notificationDisplayer.showNotification(`New document added: ${document.Title}`);
  }

  /**
   * Shows a custom notification message
   * @param message - The message to display
   */
  notify(message: string): void {
    this.notificationDisplayer.showNotification(message);
  }
}
