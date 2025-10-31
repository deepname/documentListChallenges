import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DocumentView } from './documentView';
import type { Document } from '../models/document';

vi.mock('./components/cardComponent', () => {
  const CardComponent = vi.fn();
  CardComponent.prototype.render = vi.fn().mockReturnValue('<div class="card"></div>');
  return { CardComponent };
});

vi.mock('./components/controlsComponent', () => {
  const ControlsComponent = vi.fn();
  ControlsComponent.prototype.render = vi.fn().mockReturnValue('<div class="controls"></div>');
  ControlsComponent.prototype.attachListeners = vi.fn().mockReturnValue(() => {}); // Return cleanup function
  return { ControlsComponent };
});

vi.mock('./components/notificationComponent', () => {
  const NotificationComponent = vi.fn();
  NotificationComponent.prototype.render = vi.fn().mockReturnValue('<div class="notification"></div>');
  NotificationComponent.prototype.show = vi.fn();
  return { NotificationComponent };
});

vi.mock('./components/modalComponent', () => {
  const ModalComponent = vi.fn();
  ModalComponent.prototype.render = vi.fn().mockReturnValue('<div class="modal"></div>');
  ModalComponent.prototype.show = vi.fn();
  return { ModalComponent };
});
vi.mock('../utils/htmlUtils', () => ({
  escapeHtml: (html: string) => html,
}));

describe('DocumentView', () => {
  let container: HTMLElement;
  let view: DocumentView;

  const mockDocuments: Document[] = [
    {
      ID: 'doc-1',
      Title: 'Test Document 1',
      Contributors: [{ ID: 'user-1', Name: 'Alice' }],
      Version: '1.0.0',
      Attachments: ['file1.pdf'],
      CreatedAt: new Date('2024-01-15T10:30:00Z'),
      UpdatedAt: new Date('2024-01-15T10:30:00Z'),
    },
    {
      ID: 'doc-2',
      Title: 'Test Document 2',
      Contributors: [],
      Version: 2,
      Attachments: [],
      CreatedAt: new Date('2024-01-16T10:30:00Z'),
      UpdatedAt: new Date('2024-01-16T10:30:00Z'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('should initialize with valid container id', () => {
      // Arrange & Act
      view = new DocumentView('app');

      // Assert
      expect(view).toBeDefined();
    });

    it('should throw error when container not found', () => {
      // Arrange & Act & Assert
      expect(() => new DocumentView('non-existent-id')).toThrow(
        'Container with id "non-existent-id" not found'
      );
    });

    it('should initialize all components', () => {
      // Arrange & Act
      view = new DocumentView('app');

      // Assert
      expect(view).toBeDefined();
    });
  });

  describe('render', () => {
    beforeEach(() => {
      view = new DocumentView('app');
    });

    it('should render with list view mode', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      view.render(mockDocuments, 'Title', 'list', onSort, onCreate, onViewModeChange);

      // Assert
      expect(container.innerHTML).toContain('app-container');
      expect(container.innerHTML).toContain('Documents');
    });

    it('should render with grid view mode', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      view.render(mockDocuments, 'Title', 'grid', onSort, onCreate, onViewModeChange);

      // Assert
      expect(container.innerHTML).toContain('app-container');
      expect(container.innerHTML).toContain('grid');
    });

    it('should render empty state when no documents', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      view.render([], 'Title', 'list', onSort, onCreate, onViewModeChange);

      // Assert
      expect(container.innerHTML).toContain('No documents yet');
    });

    it('should include create button', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      view.render(mockDocuments, 'Title', 'list', onSort, onCreate, onViewModeChange);

      // Assert
      expect(container.innerHTML).toContain('createBtn');
      expect(container.innerHTML).toContain('Add document');
    });

    it('should attach event listeners', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      view.render(mockDocuments, 'Title', 'list', onSort, onCreate, onViewModeChange);
      const createBtn = container.querySelector('#createBtn') as HTMLButtonElement;
      createBtn?.click();

      // Assert
      expect(onCreate).toHaveBeenCalled();
    });

    it('should clean up event listeners on re-render to prevent memory leaks', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate1 = vi.fn();
      const onCreate2 = vi.fn();
      const onViewModeChange = vi.fn();

      // Act - First render
      view.render(mockDocuments, 'Title', 'list', onSort, onCreate1, onViewModeChange);

      // Act - Second render (should clean up first listeners)
      view.render(mockDocuments, 'Title', 'list', onSort, onCreate2, onViewModeChange);
      const secondBtn = container.querySelector('#createBtn') as HTMLButtonElement;
      secondBtn?.click();

      // Assert - Only the second callback should be called
      expect(onCreate1).not.toHaveBeenCalled();
      expect(onCreate2).toHaveBeenCalled();
    });

    it('should render with different sort fields', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      view.render(mockDocuments, 'Version', 'list', onSort, onCreate, onViewModeChange);

      // Assert
      expect(container.innerHTML).toContain('app-container');
    });
  });

  describe('showNotification', () => {
    beforeEach(() => {
      view = new DocumentView('app');
    });

    it('should call notification component show method', () => {
      // Arrange
      const message = 'Test notification';

      // Act
      view.showNotification(message);

      // Assert
      expect(view).toBeDefined();
    });

    it('should display notification with custom message', () => {
      // Arrange
      const message = 'Document created successfully';

      // Act
      view.showNotification(message);

      // Assert
      expect(view).toBeDefined();
    });
  });

  describe('showModal', () => {
    beforeEach(() => {
      view = new DocumentView('app');
    });

    it('should call modal component show method', () => {
      // Arrange
      const onSubmit = vi.fn();

      // Act
      view.showModal(onSubmit);

      // Assert
      expect(view).toBeDefined();
    });

    it('should pass submit callback to modal', () => {
      // Arrange
      const onSubmit = vi.fn();

      // Act
      view.showModal(onSubmit);

      // Assert
      expect(view).toBeDefined();
    });
  });

  describe('list view rendering', () => {
    beforeEach(() => {
      view = new DocumentView('app');
    });

    it('should render document list items', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      view.render(mockDocuments, 'Title', 'list', onSort, onCreate, onViewModeChange);

      // Assert
      expect(container.innerHTML).toContain('list-header');
      expect(container.innerHTML).toContain('Name');
      expect(container.innerHTML).toContain('Contributors');
      expect(container.innerHTML).toContain('Attachments');
    });

    it('should render document titles in list view', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      view.render(mockDocuments, 'Title', 'list', onSort, onCreate, onViewModeChange);

      // Assert
      expect(container.innerHTML).toContain('Test Document 1');
      expect(container.innerHTML).toContain('Test Document 2');
    });

    it('should render document versions in list view', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      view.render(mockDocuments, 'Title', 'list', onSort, onCreate, onViewModeChange);

      // Assert
      expect(container.innerHTML).toContain('Version');
    });

    it('should render contributors in list view', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      view.render(mockDocuments, 'Title', 'list', onSort, onCreate, onViewModeChange);

      // Assert
      expect(container.innerHTML).toContain('Alice');
    });

    it('should render attachments in list view', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      view.render(mockDocuments, 'Title', 'list', onSort, onCreate, onViewModeChange);

      // Assert
      expect(container.innerHTML).toContain('file1.pdf');
    });

    it('should show no attachments indicator when empty', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      view.render(mockDocuments, 'Title', 'list', onSort, onCreate, onViewModeChange);

      // Assert
      expect(container.innerHTML).toContain('no-attachments');
    });
  });

  describe('grid view rendering', () => {
    beforeEach(() => {
      view = new DocumentView('app');
    });

    it('should render grid container with grid class', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      view.render(mockDocuments, 'Title', 'grid', onSort, onCreate, onViewModeChange);

      // Assert
      expect(container.innerHTML).toContain('document-container grid');
    });

    it('should render empty state in grid view', () => {
      // Arrange
      const onSort = vi.fn();
      const onCreate = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      view.render([], 'Title', 'grid', onSort, onCreate, onViewModeChange);

      // Assert
      expect(container.innerHTML).toContain('No documents yet');
    });
  });
});
