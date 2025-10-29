import { Document } from '../models/Document';

const STORAGE_KEY = 'documents';

export function saveDocuments(documents: Document[]): void {
  try {
    const serialized = JSON.stringify(documents);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save documents:', error);
  }
}

export function loadDocuments(): Document[] {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return [];
    
    const data = JSON.parse(serialized);
    return data.map((doc: any) => ({
      ...doc,
      CreatedAt: new Date(doc.CreatedAt),
      UpdatedAt: new Date(doc.UpdatedAt)
    }));
  } catch (error) {
    console.error('Failed to load documents:', error);
    return [];
  }
}
