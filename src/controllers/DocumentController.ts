import { Document, SortField } from '../models/Document';
import { Store } from '../store/Store';
import { DocumentView } from '../views/DocumentView';
import { WebSocketService } from '../services/WebSocketService';

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
    const sortOrder = this.store.getSortOrder();
    const viewMode = this.store.getViewMode();
    
    this.view.render(
      documents,
      sortField,
      sortOrder,
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
    const title = prompt('Enter document name:');
    if (!title) return;

    const document: Document = {
      ID: crypto.randomUUID(),
      Title: title,
      Contributors: [
        {
          ID: crypto.randomUUID(),
          Name: 'Current User',
        }
      ],
      Version: Math.floor(Math.random() * 100001),
      Attachments: [],
      CreatedAt: new Date(),
      UpdatedAt: new Date()
    };

    this.store.addDocument(document);
  }

  private handleNewDocument(document: Document): void {
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
