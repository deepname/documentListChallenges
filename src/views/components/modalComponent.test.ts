import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ModalComponent } from './modalComponent';
import { Document } from '../../models/document';

vi.mock('../../utils/htmlUtils', () => ({
    escapeHtml: (html: string) => html,
}));

describe('ModalComponent', () => {
    let component: ModalComponent;
    let container: HTMLElement;

    beforeEach(() => {
        component = new ModalComponent();
        container = document.createElement('div');
        document.body.appendChild(container);
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.removeChild(container);
        vi.clearAllMocks();
    });

    describe('render', () => {
        it('should render modal structure', () => {
            // Arrange & Act
            const html = component.render();

            // Assert
            expect(html).toContain('modal');
            expect(html).toContain('modal-content');
            expect(html).toContain('modal-header');
        });

        it('should render modal with hidden class initially', () => {
            // Arrange & Act
            const html = component.render();

            // Assert
            expect(html).toContain('hidden');
        });

        it('should render form elements', () => {
            // Arrange & Act
            const html = component.render();

            // Assert
            expect(html).toContain('documentForm');
            expect(html).toContain('docTitle');
            expect(html).toContain('docVersion');
        });

        it('should render modal title', () => {
            // Arrange & Act
            const html = component.render();

            // Assert
            expect(html).toContain('Add New Document');
        });

        it('should render close button', () => {
            // Arrange & Act
            const html = component.render();

            // Assert
            expect(html).toContain('modalClose');
            expect(html).toContain('&times;');
        });

        it('should render contributors section', () => {
            // Arrange & Act
            const html = component.render();

            // Assert
            expect(html).toContain('Contributors');
            expect(html).toContain('contributorsList');
            expect(html).toContain('contributorInput');
        });

        it('should render attachments section', () => {
            // Arrange & Act
            const html = component.render();

            // Assert
            expect(html).toContain('Attachments');
            expect(html).toContain('attachmentsList');
            expect(html).toContain('attachmentInput');
        });

        it('should render action buttons', () => {
            // Arrange & Act
            const html = component.render();

            // Assert
            expect(html).toContain('Cancel');
            expect(html).toContain('Create Document');
        });

        it('should render empty contributors message initially', () => {
            // Arrange & Act
            const html = component.render();

            // Assert
            expect(html).toContain('No contributors added yet');
        });

        it('should render empty attachments message initially', () => {
            // Arrange & Act
            const html = component.render();

            // Assert
            expect(html).toContain('No attachments added yet');
        });
    });

    describe('show', () => {
        it('should insert modal into container', () => {
            // Arrange
            const onSubmit = vi.fn();

            // Act
            component.show(container, onSubmit);

            // Assert
            expect(container.querySelector('#modal')).toBeDefined();
        });

        it('should remove hidden class when showing', () => {
            // Arrange
            const onSubmit = vi.fn();

            // Act
            component.show(container, onSubmit);

            // Assert
            const modal = container.querySelector('#modal');
            expect(modal?.classList.contains('hidden')).toBe(false);
        });

        it('should remove existing modal before showing new one', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);
            const firstModal = container.querySelector('#modal');

            // Act
            component.show(container, onSubmit);
            const secondModal = container.querySelector('#modal');

            // Assert
            expect(firstModal).not.toBe(secondModal);
        });

        it('should reset contributors on show', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            // Add a contributor
            const addBtn = container.querySelector('#addContributor') as HTMLElement;
            const input = container.querySelector('#contributorInput') as HTMLInputElement;
            input.value = 'Alice';
            addBtn?.click();

            // Act - Show modal again
            component.show(container, onSubmit);

            // Assert
            expect(container.querySelector('.empty-message')).toBeDefined();
        });

        it('should reset attachments on show', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            // Add an attachment
            const addBtn = container.querySelector('#addAttachment') as HTMLElement;
            const input = container.querySelector('#attachmentInput') as HTMLInputElement;
            input.value = 'file.pdf';
            addBtn?.click();

            // Act - Show modal again
            component.show(container, onSubmit);

            // Assert
            expect(container.querySelector('.empty-message')).toBeDefined();
        });
    });

    describe('form submission', () => {
        it('should call onSubmit with document data', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const titleInput = container.querySelector('#docTitle') as HTMLInputElement;
            titleInput.value = 'Test Document';

            const form = container.querySelector('#documentForm') as HTMLFormElement;

            // Act
            form?.dispatchEvent(new Event('submit'));

            // Assert
            expect(onSubmit).toHaveBeenCalled();
            const doc = onSubmit.mock.calls[0][0] as Document;
            expect(doc.Title).toBe('Test Document');
        });

        it('should include title in submitted document', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const titleInput = container.querySelector('#docTitle') as HTMLInputElement;
            titleInput.value = 'My Document';

            const form = container.querySelector('#documentForm') as HTMLFormElement;

            // Act
            form?.dispatchEvent(new Event('submit'));

            // Assert
            const doc = onSubmit.mock.calls[0][0] as Document;
            expect(doc.Title).toBe('My Document');
        });

        it('should include version in submitted document', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const titleInput = container.querySelector('#docTitle') as HTMLInputElement;
            titleInput.value = 'Test';
            const versionInput = container.querySelector('#docVersion') as HTMLInputElement;
            versionInput.value = '2.0.0';

            const form = container.querySelector('#documentForm') as HTMLFormElement;

            // Act
            form?.dispatchEvent(new Event('submit'));

            // Assert
            const doc = onSubmit.mock.calls[0][0] as Document;
            expect(doc.Version).toBe('2.0.0');
        });

        it('should not submit if title is empty', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const titleInput = container.querySelector('#docTitle') as HTMLInputElement;
            titleInput.value = '';

            const form = container.querySelector('#documentForm') as HTMLFormElement;

            // Act
            form?.dispatchEvent(new Event('submit'));

            // Assert
            expect(onSubmit).not.toHaveBeenCalled();
        });

        it('should include contributors in submitted document', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const titleInput = container.querySelector('#docTitle') as HTMLInputElement;
            titleInput.value = 'Test';

            const contributorInput = container.querySelector(
                '#contributorInput'
            ) as HTMLInputElement;
            const addContributorBtn = container.querySelector('#addContributor') as HTMLElement;
            contributorInput.value = 'Alice';
            addContributorBtn?.click();

            const form = container.querySelector('#documentForm') as HTMLFormElement;

            // Act
            form?.dispatchEvent(new Event('submit'));

            // Assert
            const doc = onSubmit.mock.calls[0][0] as Document;
            expect(doc.Contributors).toHaveLength(1);
            expect(doc.Contributors[0].Name).toBe('Alice');
        });

        it('should include attachments in submitted document', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const titleInput = container.querySelector('#docTitle') as HTMLInputElement;
            titleInput.value = 'Test';

            const attachmentInput = container.querySelector('#attachmentInput') as HTMLInputElement;
            const addAttachmentBtn = container.querySelector('#addAttachment') as HTMLElement;
            attachmentInput.value = 'file.pdf';
            addAttachmentBtn?.click();

            const form = container.querySelector('#documentForm') as HTMLFormElement;

            // Act
            form?.dispatchEvent(new Event('submit'));

            // Assert
            const doc = onSubmit.mock.calls[0][0] as Document;
            expect(doc.Attachments).toHaveLength(1);
            expect(doc.Attachments[0]).toBe('file.pdf');
        });
    });

    describe('contributors management', () => {
        it('should add contributor', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const input = container.querySelector('#contributorInput') as HTMLInputElement;
            const addBtn = container.querySelector('#addContributor') as HTMLElement;

            // Act
            input.value = 'Alice';
            addBtn?.click();

            // Assert
            expect(container.innerHTML).toContain('Alice');
        });

        it('should not add empty contributor', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const input = container.querySelector('#contributorInput') as HTMLInputElement;
            const addBtn = container.querySelector('#addContributor') as HTMLElement;

            // Act
            input.value = '';
            addBtn?.click();

            // Assert
            expect(container.innerHTML).toContain('No contributors added yet');
        });

        it('should clear input after adding contributor', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const input = container.querySelector('#contributorInput') as HTMLInputElement;
            const addBtn = container.querySelector('#addContributor') as HTMLElement;

            // Act
            input.value = 'Alice';
            addBtn?.click();

            // Assert
            expect(input.value).toBe('');
        });

        it('should remove contributor', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const input = container.querySelector('#contributorInput') as HTMLInputElement;
            const addBtn = container.querySelector('#addContributor') as HTMLElement;
            input.value = 'Alice';
            addBtn?.click();

            // Act
            const removeBtn = container.querySelector('[data-type="contributor"]') as HTMLElement;
            removeBtn?.click();

            // Assert
            expect(container.innerHTML).toContain('No contributors added yet');
        });
    });

    describe('attachments management', () => {
        it('should add attachment', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const input = container.querySelector('#attachmentInput') as HTMLInputElement;
            const addBtn = container.querySelector('#addAttachment') as HTMLElement;

            // Act
            input.value = 'file.pdf';
            addBtn?.click();

            // Assert
            expect(container.innerHTML).toContain('file.pdf');
        });

        it('should not add empty attachment', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const input = container.querySelector('#attachmentInput') as HTMLInputElement;
            const addBtn = container.querySelector('#addAttachment') as HTMLElement;

            // Act
            input.value = '';
            addBtn?.click();

            // Assert
            expect(container.innerHTML).toContain('No attachments added yet');
        });

        it('should clear input after adding attachment', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const input = container.querySelector('#attachmentInput') as HTMLInputElement;
            const addBtn = container.querySelector('#addAttachment') as HTMLElement;

            // Act
            input.value = 'file.pdf';
            addBtn?.click();

            // Assert
            expect(input.value).toBe('');
        });

        it('should remove attachment', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const input = container.querySelector('#attachmentInput') as HTMLInputElement;
            const addBtn = container.querySelector('#addAttachment') as HTMLElement;
            input.value = 'file.pdf';
            addBtn?.click();

            // Act
            const removeBtn = container.querySelector('[data-type="attachment"]') as HTMLElement;
            removeBtn?.click();

            // Assert
            expect(container.innerHTML).toContain('No attachments added yet');
        });
    });

    describe('modal closing', () => {
        it('should close modal on close button click', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const closeBtn = container.querySelector('#modalClose') as HTMLElement;

            // Act
            closeBtn?.click();

            // Assert
            const modal = container.querySelector('#modal');
            expect(modal?.classList.contains('hidden')).toBe(true);
        });

        it('should close modal on cancel button click', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const cancelBtn = container.querySelector('#modalCancel') as HTMLElement;

            // Act
            cancelBtn?.click();

            // Assert
            const modal = container.querySelector('#modal');
            expect(modal?.classList.contains('hidden')).toBe(true);
        });

        it('should close modal on overlay click', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const overlay = container.querySelector('.modal-overlay') as HTMLElement;

            // Act
            overlay?.click();

            // Assert
            const modal = container.querySelector('#modal');
            expect(modal?.classList.contains('hidden')).toBe(true);
        });

        it('should close modal after form submission', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const titleInput = container.querySelector('#docTitle') as HTMLInputElement;
            titleInput.value = 'Test';

            const form = container.querySelector('#documentForm') as HTMLFormElement;

            // Act
            form?.dispatchEvent(new Event('submit'));

            // Assert
            const modal = container.querySelector('#modal');
            expect(modal?.classList.contains('hidden')).toBe(true);
        });
    });

    describe('version input validation', () => {
        it('should accept valid semantic version', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const versionInput = container.querySelector('#docVersion') as HTMLInputElement;

            // Act
            versionInput.value = '2.5.1';
            versionInput.dispatchEvent(new Event('input'));

            // Assert
            expect(versionInput.value).toBe('2.5.1');
        });

        it('should remove non-numeric characters from version', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const versionInput = container.querySelector('#docVersion') as HTMLInputElement;

            // Act
            versionInput.value = '2a.5b.1c';
            versionInput.dispatchEvent(new Event('input'));

            // Assert
            expect(versionInput.value).toBe('2.5.1');
        });

        it('should limit version to 3 parts', () => {
            // Arrange
            const onSubmit = vi.fn();
            component.show(container, onSubmit);

            const versionInput = container.querySelector('#docVersion') as HTMLInputElement;

            // Act
            versionInput.value = '2.5.1.0';
            versionInput.dispatchEvent(new Event('input'));

            // Assert
            expect(versionInput.value).toBe('2.5.1');
        });
    });
});
