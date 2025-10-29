import { Document } from '../models/Document';
import { SocketsNotification } from '../models/Sockets';

export class DocumentMapper {
  static fromSocketNotification(notification: SocketsNotification): Document {
    return {
      ID: notification.DocumentID,
      Title: notification.DocumentTitle,
      Contributors: [
        {
          ID: notification.UserID,
          Name: notification.UserName,
        },
      ],
      Version: 1,
      Attachments: [],
      CreatedAt: new Date(notification.Timestamp),
      UpdatedAt: new Date(notification.Timestamp),
    };
  }
}

export function parseDocumentDates(doc: Document): Document {
  return {
    ...doc,
    CreatedAt: new Date(doc.CreatedAt),
    UpdatedAt: new Date(doc.UpdatedAt),
  };
}
