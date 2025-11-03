import { Document } from '../models/document';
import { parseDocumentDates } from '../utils/documentUtils';

export class ApiService {
  private baseUrl: string;
  private fetchFn: typeof fetch;

  constructor(baseUrl = 'http://localhost:8080', fetchFn: typeof fetch = globalThis.fetch) {
    this.baseUrl = baseUrl;
    this.fetchFn = fetchFn;
  }

  async fetchDocuments(): Promise<Document[]> {
    const response = await this.fetchFn(`${this.baseUrl}/documents`);
    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }
    const data = await response.json();
    return data.map((doc: Document) => parseDocumentDates(doc));
  }
}
