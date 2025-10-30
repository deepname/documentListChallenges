import { Document } from '../models/document';
import { parseDocumentDates } from './documentUtils';

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
    return data.map((doc: Document) => parseDocumentDates(doc));
  } catch (error) {
    console.error('Failed to load documents:', error);
    return [];
  }
}
