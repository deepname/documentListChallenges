import type { Document, SortField, ViewMode } from '../models/document';
import { CardComponent } from './components/cardComponent';
import { ControlsComponent } from './components/controlsComponent';
import { NotificationComponent } from './components/notificationComponent';
import { ModalComponent } from './components/modalComponent';
import { escapeHtml } from '../utils/htmlUtils';

export class DocumentView {
  private container: HTMLElement;
  private cardComponent: CardComponent;
  private controlsComponent: ControlsComponent;
  private notificationComponent: NotificationComponent;
  private modalComponent: ModalComponent;
  private cleanupFunctions: (() => void)[] = [];

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    this.container = element;
    this.cardComponent = new CardComponent();
    this.controlsComponent = new ControlsComponent();
    this.notificationComponent = new NotificationComponent();
    this.modalComponent = new ModalComponent();
  }

  render(
    documents: Document[],
    sortField: SortField,
    viewMode: ViewMode,
    onSort: (field: SortField) => void,
    onCreate: () => void,
    onViewModeChange: (mode: ViewMode) => void
  ): void {
    // Clean up previous event listeners to prevent memory leaks
    this.cleanup();

    this.container.innerHTML = `
      <div class="app-container" role="main" aria-labelledby="documentsHeading">
        <header class="header">
          <h1 id="documentsHeading">Documents</h1>
        </header>
        
        ${this.controlsComponent.render(sortField, viewMode)}

        <div id="documentContainer" class="document-container ${viewMode}" role="list" aria-live="polite">
          ${viewMode === 'list' ? this.renderListView(documents) : this.renderGridView(documents)}
        </div>

        <button
          class="btn-add"
          id="createBtn"
          type="button"
          aria-haspopup="dialog"
          aria-controls="modal"
        >
          + Add document
        </button>

        ${this.notificationComponent.render()}
      </div>
    `;

    this.attachEventListeners(onSort, onCreate, onViewModeChange);
  }

  private renderDocumentCard(doc: Document): string {
    return this.cardComponent.render(doc, this.getDocumentTitleId(doc));
  }

  private renderListView(documents: Document[]): string {
    if (documents.length === 0) {
      return '<div class="empty-state">No documents yet</div>';
    }

    return `
      <div class="list-header" role="presentation" aria-hidden="true">
        <div class="col-name">Name</div>
        <div class="col-contributors">Contributors</div>
        <div class="col-attachments">Attachments</div>
      </div>
      ${documents.map(doc => this.renderListItem(doc)).join('')}
    `;
  }

  private renderListItem(doc: Document): string {
    const headingId = this.getDocumentTitleId(doc);

    return `
      <div class="list-item" role="listitem" aria-labelledby="${headingId}">
        <div class="col-name" data-label="Name">
          <div class="doc-name" id="${headingId}">${escapeHtml(doc.Title)}</div>
          <div class="doc-version">Version ${escapeHtml(String(doc.Version))}</div>
        </div>
        <div class="col-contributors" data-label="Contributors">
          ${doc.Contributors.map(c => `<div class="contributor-name">${escapeHtml(c.Name)}</div>`).join('')}
        </div>
        <div class="col-attachments" data-label="Attachments">
          ${
            doc.Attachments.length > 0
              ? doc.Attachments.map(
                  a => `<div class="attachment-name">${escapeHtml(a)}</div>`
                ).join('')
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
    // Attach controls listeners and get cleanup function
    const controlsCleanup = this.controlsComponent.attachListeners(
      this.container,
      onSort,
      onViewModeChange
    );
    this.cleanupFunctions.push(controlsCleanup);

    // Attach create button listener
    const createBtn = this.container.querySelector('#createBtn') as HTMLButtonElement;
    if (createBtn) {
      createBtn.addEventListener('click', onCreate);
      this.cleanupFunctions.push(() => {
        createBtn.removeEventListener('click', onCreate);
      });
    }
  }

  /**
   * Cleans up all event listeners to prevent memory leaks
   */
  private cleanup(): void {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
  }

  showNotification(message: string): void {
    this.notificationComponent.show(this.container, message);
  }

  showModal(onSubmit: (doc: Document) => void): void {
    this.modalComponent.show(this.container, onSubmit);
  }

  private getDocumentTitleId(doc: Document): string {
    return `doc-${String(doc.ID).replace(/[^a-zA-Z0-9_-]/g, '-')}-title`;
  }
}
