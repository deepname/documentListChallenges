import { Document } from '../../models/Document';
import { escapeHtml } from '../../utils/htmlUtils';

export class CardComponent {
  render(doc: Document): string {
    return `
      <div class="document-card">
        <div class="card-title">
          <h3>${escapeHtml(doc.Title)}</h3>
          <div class="card-version">Version ${doc.Version}</div>
        </div>
        
        <div class="card-section">
          ${doc.Contributors.map(
            c => `
            <div class="card-item">${escapeHtml(c.Name)}</div>
          `
          ).join('')}
        </div>
        
        <div class="card-section card-attachments">
          ${
            doc.Attachments.length > 0
              ? doc.Attachments.map(
                  a => `
              <div class="card-item">${escapeHtml(a)}</div>
            `
                ).join('')
              : ''
          }
        </div>
      </div>
    `;
  }
}
