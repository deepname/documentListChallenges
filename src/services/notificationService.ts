import { Document } from '../models/document';
import { DocumentView } from '../views/documentView';

/**
 * Service responsible for displaying user notifications
 * Encapsulates notification logic and message formatting
 */
export class NotificationService {
  constructor(private view: DocumentView) {}

  /**
   * Shows a notification when a document is created by the user
   * @param document - The document that was created
   */
  notifyDocumentCreated(document: Document): void {
    this.view.showNotification(`Document created: ${document.Title}`);
  }

  /**
   * Shows a notification when a document is received via WebSocket
   * @param document - The document that was received
   */
  notifyDocumentReceived(document: Document): void {
    this.view.showNotification(`New document added: ${document.Title}`);
  }

  /**
   * Shows a custom notification message
   * @param message - The message to display
   */
  notify(message: string): void {
    this.view.showNotification(message);
  }
}
