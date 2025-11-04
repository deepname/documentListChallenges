import { Document, SortField, SortOrder, ViewMode } from '../models/document';
import { saveDocuments, loadDocuments } from '../utils/storageUtils';

// Re-export for backward compatibility
export type { ViewMode };

type Listener = () => void;

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

  // Track documents by ID for faster lookup
  private documentMap = new Map<string, boolean>();

  addDocument(document: Document): void {
    // Fast duplicate check using Map
    if (this.documentMap.has(document.ID)) {
      console.warn(`Document with ID ${document.ID} already exists`);
      return;
    }

    // Add to documents array and map
    this.documents.push(document);
    this.documentMap.set(document.ID, true);
    saveDocuments(this.documents);

    // Notify listeners
    this.notify();
  }

  getDocuments(): Document[] {
    return this.sortDocuments([...this.documents]);
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
