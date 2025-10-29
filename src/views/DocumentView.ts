import { Document, SortField } from '../models/Document';
import { ViewMode } from '../store/Store';

export class DocumentView {
  private container: HTMLElement;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = element;
  }

  render(
    documents: Document[],
    sortField: SortField,
    viewMode: ViewMode,
    onSort: (field: SortField) => void,
    onCreate: () => void,
    onViewModeChange: (mode: ViewMode) => void
  ): void {
    this.container.innerHTML = `
      <div class="app-container">
        <header class="header">
          <h1>Documents</h1>
        </header>
        
        <div class="controls">
          <div class="sort-controls">
            <label>Sort by:</label>
            <select class="sort-dropdown" id="sortDropdown">
              <option value="Title" ${sortField === 'Title' ? 'selected' : ''}>Name</option>
              <option value="Version" ${sortField === 'Version' ? 'selected' : ''}>Version</option>
              <option value="CreatedAt" ${sortField === 'CreatedAt' ? 'selected' : ''}>Date</option>
            </select>
          </div>
          <div class="view-controls">
            <button class="view-btn ${viewMode === 'list' ? 'active' : ''}" data-view="list" title="List view">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
            <button class="view-btn ${viewMode === 'grid' ? 'active' : ''}" data-view="grid" title="Grid view">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
          </div>
        </div>

        <div class="document-container ${viewMode}">
          ${viewMode === 'list' ? this.renderListView(documents) : this.renderGridView(documents)}
        </div>

        <button class="btn-add" id="createBtn">+ Add document</button>

        <div id="notification" class="notification hidden"></div>
      </div>
    `;

    this.attachEventListeners(onSort, onCreate, onViewModeChange);
  }

  private renderDocumentCard(doc: Document): string {
    return `
      <div class="document-card">
        <div class="card-title">
          <h3>${this.escapeHtml(doc.Title )}</h3>
          <div class="card-version">Version ${doc.Version}</div>
        </div>
        
        <div class="card-section">
          ${doc.Contributors.map(c => `
            <div class="card-item">${this.escapeHtml(c.Name)}</div>
          `).join('')}
        </div>
        
        <div class="card-section card-attachments">
          ${doc.Attachments.length > 0 
            ? doc.Attachments.map(a => `
              <div class="card-item">${this.escapeHtml(a)}</div>
            `).join('')
            : ''
          }
        </div>
      </div>
    `;
  }

  private renderListView(documents: Document[]): string {
    if (documents.length === 0) {
      return '<div class="empty-state">No documents yet</div>';
    }

    return `
      <div class="list-header">
        <div class="col-name">Name</div>
        <div class="col-contributors">Contributors</div>
        <div class="col-attachments">Attachments</div>
      </div>
      ${documents.map(doc => this.renderListItem(doc)).join('')}
    `;
  }

  private renderListItem(doc: Document): string {
    return `
      <div class="list-item">
        <div class="col-name">
          <div class="doc-name">${this.escapeHtml(doc.Title)}</div>
          <div class="doc-version">Version ${doc.Version}</div>
        </div>
        <div class="col-contributors">
          ${doc.Contributors.map(c => `<div class="contributor-name">${this.escapeHtml(c.Name)}</div>`).join('')}
        </div>
        <div class="col-attachments">
          ${doc.Attachments.length > 0 
            ? doc.Attachments.map(a => `<div class="attachment-name">${this.escapeHtml(a)}</div>`).join('')
            : '<span class="no-attachments">—</span>'
          }
        </div>
      </div>
    `;
  }

  private renderGridView(documents: Document[]): string {
    if (documents.length === 0) {
      return '<div class="empty-state">No documents yet</div>';
    }

    return documents.map(doc => this.renderDocumentCard(doc)).join('');
  }

  private attachEventListeners(
    onSort: (field: SortField) => void,
    onCreate: () => void,
    onViewModeChange: (mode: ViewMode) => void
  ): void {
    const sortDropdown = this.container.querySelector('#sortDropdown') as HTMLSelectElement;
    sortDropdown?.addEventListener('change', () => {
      onSort(sortDropdown.value as SortField);
    });

    const viewButtons = this.container.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = (btn as HTMLElement).dataset.view as ViewMode;
        onViewModeChange(mode);
      });
    });

    const createBtn = this.container.querySelector('#createBtn');
    createBtn?.addEventListener('click', onCreate);
  }

  showNotification(message: string): void {
    const notification = this.container.querySelector('#notification');
    if (notification) {
      notification.textContent = message;
      notification.classList.remove('hidden');
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hidden');
      }, 3000);
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

}
