import { Document } from '../models/Document';

export function parseDocumentDates(doc: Document): Document {
  return {
    ...doc,
    CreatedAt: new Date(doc.CreatedAt),
    UpdatedAt: new Date(doc.UpdatedAt),
  };
}
