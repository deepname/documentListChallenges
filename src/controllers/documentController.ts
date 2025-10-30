import { Document, SortField } from '../models/document';
import { Store } from '../store/store';
import { DocumentView } from '../views/documentView';
import { SortingService } from '../services/sortingService';
import { NotificationService } from '../services/notificationService';
import { WebSocketManager } from '../services/webSocketManager';

/**
 * Main controller coordinating document management
 * Delegates specific responsibilities to specialized services
 */
export class DocumentController {
  private store: Store;
  private view: DocumentView;
  private sortingService: SortingService;
  private notificationService: NotificationService;
  private wsManager: WebSocketManager;

  constructor(
    containerId: string,
    store?: Store,
    view?: DocumentView,
    sortingService?: SortingService,
    notificationService?: NotificationService,
    wsManager?: WebSocketManager
  ) {
    // Dependency Injection with defaults for backward compatibility
    this.store = store || Store.getInstance();
    this.view = view || new DocumentView(containerId);
    this.sortingService = sortingService || new SortingService();
    this.notificationService = notificationService || new NotificationService(this.view);
    this.wsManager = wsManager || new WebSocketManager(this.handleNewDocument.bind(this));

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

    const result = this.sortingService.toggleSort(currentField, currentOrder, field);
    this.store.setSortField(result.field);
    this.store.setSortOrder(result.order);
  }

  private handleViewModeChange(mode: 'list' | 'grid'): void {
    this.store.setViewMode(mode);
  }

  private handleCreate(): void {
    this.view.showModal((document: Document) => {
      this.store.addDocument(document);
      this.notificationService.notifyDocumentCreated(document);
    });
  }

  private handleNewDocument(document: Document): void {
    this.store.addDocument(document);
    this.notificationService.notifyDocumentReceived(document);
  }

  connect(): void {
    this.wsManager.connect();
  }

  disconnect(): void {
    this.wsManager.disconnect();
  }
}
