import { Document } from '../models/Document';
import { parseDocumentDates } from '../utils/documentUtils';

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  async fetchDocuments(): Promise<Document[]> {
    const response = await fetch(`${this.baseUrl}/documents`);
    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }
    const data = await response.json();
    return data.map((doc: Document) => parseDocumentDates(doc));
  }
}
