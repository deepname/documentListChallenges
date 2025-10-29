import { Document, SortField, SortOrder } from '../models/Document';
import { saveDocuments, loadDocuments } from '../utils/storageUtils';

type Listener = () => void;
export type ViewMode = 'list' | 'grid';

export class Store {
  private static instance: Store;
  private documents: Document[] = [];
  private listeners: Set<Listener> = new Set();
  private sortField: SortField = 'CreatedAt';
  private sortOrder: SortOrder = 'desc';
  private viewMode: ViewMode = 'list';

  private constructor() {
    this.documents = loadDocuments();
  }

  private sortDocuments(docs: Document[]): Document[] {
    return docs.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortField) {
        case 'Title':
          comparison = a.Title.localeCompare(b.Title);
          break;
        case 'Version':
          comparison = a.Version - b.Version;
          break;
        case 'CreatedAt':
          comparison = a.CreatedAt.getTime() - b.CreatedAt.getTime();
          break;
      }
      
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getDocuments(): Document[] {
    return this.sortDocuments([...this.documents]);
  }

  addDocument(document: Document): void {
    this.documents.push(document);
    saveDocuments(this.documents);
    this.notify();
  }

  setSortField(field: SortField): void {
    this.sortField = field;
    this.notify();
  }

  setSortOrder(order: SortOrder): void {
    this.sortOrder = order;
    this.notify();
  }

  getSortField(): SortField {
    return this.sortField;
  }

  getSortOrder(): SortOrder {
    return this.sortOrder;
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.notify();
  }

  getViewMode(): ViewMode {
    return this.viewMode;
  }
}
