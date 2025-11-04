import type { Document } from '../../models/document';
import { escapeHtml } from '../../utils/htmlUtils';

export class CardComponent {
  render(doc: Document, headingId?: string): string {
    const titleId = headingId ?? `card-${String(doc.ID).replace(/[^a-zA-Z0-9_-]/g, '-')}-title`;

    return `
      <article class="document-card" role="listitem" aria-labelledby="${titleId}">
        <div class="card-title">
          <h3 id="${titleId}">${escapeHtml(doc.Title)}</h3>
          <div class="card-version">Version ${escapeHtml(String(doc.Version))}</div>
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
      </article>
    `;
  }
}
