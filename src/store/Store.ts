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
          comparison = this.compareVersions(a.Version, b.Version);
          break;
        case 'CreatedAt':
          comparison = a.CreatedAt.getTime() - b.CreatedAt.getTime();
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  private compareVersions(a: number | string, b: number | string): number {
    const aStr = String(a);
    const bStr = String(b);

    // If both are semantic versions (x.x.x), compare them properly
    if (aStr.includes('.') && bStr.includes('.')) {
      const aParts = aStr.split('.').map(n => parseInt(n) || 0);
      const bParts = bStr.split('.').map(n => parseInt(n) || 0);

      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const diff = (aParts[i] || 0) - (bParts[i] || 0);
        if (diff !== 0) return diff;
      }
      return 0;
    }

    // Fallback to numeric comparison
    return Number(a) - Number(b);
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
