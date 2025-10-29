import { Document, SortField } from '../models/Document';
import { ViewMode } from '../store/Store';
import { CardComponent } from './components/CardComponent';
import { ControlsComponent } from './components/ControlsComponent';
import { NotificationComponent } from './components/NotificationComponent';
import { ModalComponent } from './components/ModalComponent';
import { escapeHtml } from '../utils/htmlUtils';

export class DocumentView {
  private container: HTMLElement;
  private cardComponent: CardComponent;
  private controlsComponent: ControlsComponent;
  private notificationComponent: NotificationComponent;
  private modalComponent: ModalComponent;

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
    this.container.innerHTML = `
      <div class="app-container">
        <header class="header">
          <h1>Documents</h1>
        </header>
        
        ${this.controlsComponent.render(sortField, viewMode)}

        <div class="document-container ${viewMode}">
          ${viewMode === 'list' ? this.renderListView(documents) : this.renderGridView(documents)}
        </div>

        <button class="btn-add" id="createBtn">+ Add document</button>

        ${this.notificationComponent.render()}
      </div>
    `;

    this.attachEventListeners(onSort, onCreate, onViewModeChange);
  }

  private renderDocumentCard(doc: Document): string {
    return this.cardComponent.render(doc);
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
          <div class="doc-name">${escapeHtml(doc.Title)}</div>
          <div class="doc-version">Version ${doc.Version}</div>
        </div>
        <div class="col-contributors">
          ${doc.Contributors.map(c => `<div class="contributor-name">${escapeHtml(c.Name)}</div>`).join('')}
        </div>
        <div class="col-attachments">
          ${doc.Attachments.length > 0 
            ? doc.Attachments.map(a => `<div class="attachment-name">${escapeHtml(a)}</div>`).join('')
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
    this.controlsComponent.attachListeners(this.container, onSort, onViewModeChange);

    const createBtn = this.container.querySelector('#createBtn');
    createBtn?.addEventListener('click', onCreate);
  }

  showNotification(message: string): void {
    this.notificationComponent.show(this.container, message);
  }

  showModal(onSubmit: (doc: Document) => void): void {
    this.modalComponent.show(this.container, onSubmit);
  }

}
