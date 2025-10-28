import { Document, SortField, SortOrder } from '../models/Document';

type Listener = () => void;
export type ViewMode = 'list' | 'grid';

export class Store {
  private static instance: Store;
  private documents: Document[] = [];
  private listeners: Set<Listener> = new Set();
  private sortField: SortField = 'createdAt';
  private sortOrder: SortOrder = 'desc';
  private viewMode: ViewMode = 'list';

  private constructor() {}

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

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  getDocuments(): Document[] {
    return this.sortDocuments([...this.documents]);
  }

  addDocument(document: Document): void {
    this.documents.push(document);
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

  private sortDocuments(docs: Document[]): Document[] {
    return docs.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortField) {
        case 'Title':
          comparison = a.Title.localeCompare(b.Title);
          break;
        case 'version':
          comparison = a.Version - b.Version;
          break;
        case 'createdAt':
          comparison = a.CreatedAt.getTime() - b.CreatedAt.getTime();
          break;
      }
      
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }
}
