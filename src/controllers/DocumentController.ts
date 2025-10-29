import { Document, SortField } from '../models/Document';
import { Store } from '../store/Store';
import { DocumentView } from '../views/DocumentView';
import { WebSocketService } from '../services/WebSocketService';
import { SocketsNotification } from '../models/Sockets';

export class DocumentController {
  private store: Store;
  private view: DocumentView;
  private wsService: WebSocketService;

  constructor(containerId: string) {
    this.store = Store.getInstance();
    this.view = new DocumentView(containerId);
    this.wsService = new WebSocketService(this.handleNewDocument.bind(this));

    this.store.subscribe(() => this.updateView());
    this.updateView();
  }

  private updateView(): void {
    const documents = this.store.getDocuments();
    const sortField = this.store.getSortField();
    const viewMode = this.store.getViewMode();

    this.view.render(
      documents,
      sortField,
      viewMode,
      this.handleSort.bind(this),
      this.handleCreate.bind(this),
      this.handleViewModeChange.bind(this)
    );
  }

  private handleSort(field: SortField): void {
    const currentField = this.store.getSortField();
    const currentOrder = this.store.getSortOrder();

    if (field === currentField) {
      this.store.setSortOrder(currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      this.store.setSortField(field);
      this.store.setSortOrder('asc');
    }
  }

  private handleViewModeChange(mode: 'list' | 'grid'): void {
    this.store.setViewMode(mode);
  }

  private handleCreate(): void {
    this.view.showModal((document: Document) => {
      this.store.addDocument(document);
      this.view.showNotification(`Document created: ${document.Title}`);
    });
  }

  private handleNewDocument(notification: SocketsNotification): void {
    const document: Document = {
      ID: notification.DocumentID,
      Title: notification.DocumentTitle,
      Contributors: [
        {
          ID: notification.UserID,
          Name: notification.UserName,
        },
      ],
      Version: 1,
      Attachments: [],
      CreatedAt: new Date(notification.Timestamp),
      UpdatedAt: new Date(notification.Timestamp),
    };

    this.store.addDocument(document);
    this.view.showNotification(`New document added: ${document.Title}`);
  }

  connect(): void {
    this.wsService.connect();
  }

  disconnect(): void {
    this.wsService.disconnect();
  }
}
