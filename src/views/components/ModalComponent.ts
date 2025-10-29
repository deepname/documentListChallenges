import { Document } from '../../models/Document';
import { escapeHtml } from '../../utils/htmlUtils';

export class ModalComponent {
  private contributors: Array<{ id: string; name: string }> = [];
  private attachments: string[] = [];

  render(): string {
    return `
      <div id="modal" class="modal hidden">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2>Add New Document</h2>
            <button class="modal-close" id="modalClose">&times;</button>
          </div>
          
          <form id="documentForm" class="modal-form">
            <div class="form-group">
              <label for="docTitle">Document Title *</label>
              <input type="text" id="docTitle" required placeholder="Enter document title">
            </div>

            <div class="form-group">
              <label for="docVersion">Version *</label>
              <input type="text" id="docVersion" required placeholder="1.0.0" value="1.0.0" pattern="\\d+\\.\\d+\\.\\d+">
            </div>

            <div class="form-group">
              <label>Contributors</label>
              <div id="contributorsList" class="contributors-list">
                ${this.renderContributors()}
              </div>
              <button type="button" class="btn-secondary" id="addContributor">+ Add Contributor</button>
            </div>

            <div class="form-group">
              <label>Attachments</label>
              <div id="attachmentsList" class="attachments-list">
                ${this.renderAttachments()}
              </div>
              <button type="button" class="btn-secondary" id="addAttachment">+ Add Attachment</button>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" id="modalCancel">Cancel</button>
              <button type="submit" class="btn-primary">Create Document</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  private renderContributors(): string {
    if (this.contributors.length === 0) {
      return '<p class="empty-message">No contributors added yet</p>';
    }
    return this.contributors
      .map(
        (c, index) => `
      <div class="list-item-row">
        <span>${escapeHtml(c.name)}</span>
        <button type="button" class="btn-remove" data-index="${index}" data-type="contributor">&times;</button>
      </div>
    `
      )
      .join('');
  }

  private renderAttachments(): string {
    if (this.attachments.length === 0) {
      return '<p class="empty-message">No attachments added yet</p>';
    }
    return this.attachments
      .map(
        (a, index) => `
      <div class="list-item-row">
        <span>${escapeHtml(a)}</span>
        <button type="button" class="btn-remove" data-index="${index}" data-type="attachment">&times;</button>
      </div>
    `
      )
      .join('');
  }

  show(container: HTMLElement, onSubmit: (doc: Document) => void): void {
    this.contributors = [];
    this.attachments = [];

    const modalHtml = this.render();
    const existingModal = container.querySelector('#modal');
    if (existingModal) {
      existingModal.remove();
    }

    container.insertAdjacentHTML('beforeend', modalHtml);
    const modal = container.querySelector('#modal');

    if (modal) {
      modal.classList.remove('hidden');
      this.attachListeners(modal as HTMLElement, onSubmit);
    }
  }

  private attachListeners(modal: HTMLElement, onSubmit: (doc: Document) => void): void {
    const closeBtn = modal.querySelector('#modalClose');
    const cancelBtn = modal.querySelector('#modalCancel');
    const overlay = modal.querySelector('.modal-overlay');
    const form = modal.querySelector('#documentForm') as HTMLFormElement;
    const addContributorBtn = modal.querySelector('#addContributor');
    const addAttachmentBtn = modal.querySelector('#addAttachment');
    const versionInput = modal.querySelector('#docVersion') as HTMLInputElement;

    const closeModal = () => {
      modal.classList.add('hidden');
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    // Version input mask handler
    versionInput?.addEventListener('input', e => {
      const input = e.target as HTMLInputElement;
      const value = input.value.replace(/[^\d.]/g, ''); // Only numbers and dots
      const parts = value.split('.');

      // Limit to 3 parts and format as x.x.x
      if (parts.length > 3) {
        input.value = parts.slice(0, 3).join('.');
      } else {
        input.value = value;
      }
    });

    addContributorBtn?.addEventListener('click', () => {
      const name = prompt('Enter contributor name:');
      if (name?.trim()) {
        this.contributors.push({ id: crypto.randomUUID(), name: name.trim() });
        this.updateContributorsList(modal);
      }
    });

    addAttachmentBtn?.addEventListener('click', () => {
      const attachment = prompt('Enter attachment name:');
      if (attachment?.trim()) {
        this.attachments.push(attachment.trim());
        this.updateAttachmentsList(modal);
      }
    });

    modal.addEventListener('click', e => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('btn-remove')) {
        const index = parseInt(target.dataset.index || '0');
        const type = target.dataset.type;

        if (type === 'contributor') {
          this.contributors.splice(index, 1);
          this.updateContributorsList(modal);
        } else if (type === 'attachment') {
          this.attachments.splice(index, 1);
          this.updateAttachmentsList(modal);
        }
      }
    });

    form?.addEventListener('submit', e => {
      e.preventDefault();
      const titleInput = modal.querySelector('#docTitle') as HTMLInputElement;
      const versionInput = modal.querySelector('#docVersion') as HTMLInputElement;
      const title = titleInput.value.trim();
      const version = versionInput.value.trim() || '1.0.0';

      if (!title) return;

      const document: Document = {
        ID: crypto.randomUUID(),
        Title: title,
        Contributors: this.contributors.map(c => ({ ID: c.id, Name: c.name })),
        Version: version,
        Attachments: [...this.attachments],
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      };

      onSubmit(document);
      closeModal();
    });
  }

  private updateContributorsList(modal: HTMLElement): void {
    const list = modal.querySelector('#contributorsList');
    if (list) {
      list.innerHTML = this.renderContributors();
    }
  }

  private updateAttachmentsList(modal: HTMLElement): void {
    const list = modal.querySelector('#attachmentsList');
    if (list) {
      list.innerHTML = this.renderAttachments();
    }
  }
}
