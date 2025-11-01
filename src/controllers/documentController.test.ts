import { describe, it, expect, beforeEach, vi, afterEach, MockedFunction } from 'vitest';
import { DocumentController } from './documentController';
import { Document, SortField } from '../models/document';
import { Store, ViewMode } from '../store/store';
import { DocumentView } from '../views/documentView';
import { SortingService } from '../services/sortingService';
import { NotificationService } from '../services/notificationService';
import { WebSocketManager } from '../services/webSocketManager';

// Mock dependencies
vi.mock('../store/store');
vi.mock('../views/documentView');
vi.mock('../services/sortingService');
vi.mock('../services/notificationService');
vi.mock('../services/webSocketManager');

const MockedStore = vi.mocked(Store);
const MockedDocumentView = vi.mocked(DocumentView);
const MockedSortingService = vi.mocked(SortingService);
const MockedNotificationService = vi.mocked(NotificationService);
const MockedWebSocketManager = vi.mocked(WebSocketManager);

interface MockStore {
  subscribe: MockedFunction<(listener: () => void) => () => void>;
  getDocuments: MockedFunction<() => Document[]>;
  getSortField: MockedFunction<() => SortField>;
  getSortOrder: MockedFunction<() => 'asc' | 'desc'>;
  getViewMode: MockedFunction<() => ViewMode>;
  addDocument: MockedFunction<(document: Document) => void>;
  setSortField: MockedFunction<(field: SortField) => void>;
  setSortOrder: MockedFunction<(order: 'asc' | 'desc') => void>;
  setViewMode: MockedFunction<(mode: ViewMode) => void>;
}

interface MockView {
  render: MockedFunction<
    (
      documents: Document[],
      sortField: SortField,
      viewMode: ViewMode,
      onSort: (field: SortField) => void,
      onCreate: () => void,
      onViewModeChange: (mode: ViewMode) => void
    ) => void
  >;
  showNotification: MockedFunction<(message: string) => void>;
  showModal: MockedFunction<(onSubmit: (doc: Document) => void) => void>;
}

interface MockWSManager {
  connect: MockedFunction<() => void>;
  disconnect: MockedFunction<() => void>;
}

interface MockSortingService {
  toggleSort: MockedFunction<
    (
      currentField: SortField,
      currentOrder: 'asc' | 'desc',
      newField: SortField
    ) => { field: SortField; order: 'asc' | 'desc' }
  >;
}

interface MockNotificationService {
  notifyDocumentCreated: MockedFunction<(document: Document) => void>;
  notifyDocumentReceived: MockedFunction<(document: Document) => void>;
  notify: MockedFunction<(message: string) => void>;
}

describe('DocumentController', () => {
  let mockStore: MockStore;
  let mockView: MockView;
  let mockWSManager: MockWSManager;
  let mockSortingService: MockSortingService;
  let mockNotificationService: MockNotificationService;
  let containerId: string;
  let sampleDocument: Document;

  beforeEach(() => {
    vi.clearAllMocks();

    // Arrange - Create sample document
    sampleDocument = {
      ID: 'doc-123',
      Title: 'Test Document',
      Contributors: [{ ID: 'user-1', Name: 'John Doe' }],
      Version: 1,
      Attachments: ['file.pdf'],
      CreatedAt: new Date('2024-01-01'),
      UpdatedAt: new Date('2024-01-02'),
    };

    // Arrange - Create mock store
    mockStore = {
      subscribe: vi.fn(),
      getDocuments: vi.fn().mockReturnValue([]),
      getSortField: vi.fn().mockReturnValue('Title'),
      getSortOrder: vi.fn().mockReturnValue('asc'),
      getViewMode: vi.fn().mockReturnValue('list'),
      addDocument: vi.fn(),
      setSortField: vi.fn(),
      setSortOrder: vi.fn(),
      setViewMode: vi.fn(),
    };

    // Arrange - Create mock view
    mockView = {
      render: vi.fn(),
      showNotification: vi.fn(),
      showModal: vi.fn(),
    };

    // Arrange - Create mock WebSocket manager
    mockWSManager = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    // Arrange - Create mock sorting service
    mockSortingService = {
      toggleSort: vi.fn(),
    };

    // Arrange - Create mock notification service
    mockNotificationService = {
      notifyDocumentCreated: vi.fn(),
      notifyDocumentReceived: vi.fn(),
      notify: vi.fn(),
    };

    containerId = 'test-container';

    // Arrange - Setup mock implementations
    MockedStore.getInstance.mockReturnValue(mockStore as unknown as Store);
    MockedDocumentView.mockImplementation(function (this: DocumentView) {
      Object.assign(this, mockView);
      return this;
    } as unknown as typeof DocumentView);
    MockedSortingService.mockImplementation(function (this: SortingService) {
      Object.assign(this, mockSortingService);
      return this;
    } as unknown as typeof SortingService);
    MockedNotificationService.mockImplementation(function (this: NotificationService) {
      Object.assign(this, mockNotificationService);
      return this;
    } as unknown as typeof NotificationService);
    MockedWebSocketManager.mockImplementation(function (this: WebSocketManager) {
      Object.assign(this, mockWSManager);
      return this;
    } as unknown as typeof WebSocketManager);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('constructor', () => {
    it('should initialize with default dependencies when not provided', () => {
      // Arrange & Act
      new DocumentController(containerId);

      // Assert
      expect(MockedStore.getInstance).toHaveBeenCalledTimes(1);
      expect(MockedDocumentView).toHaveBeenCalledTimes(1);
      expect(MockedDocumentView).toHaveBeenCalledWith(containerId);
      expect(MockedSortingService).toHaveBeenCalledTimes(1);
      expect(MockedNotificationService).toHaveBeenCalledTimes(1);
      expect(MockedWebSocketManager).toHaveBeenCalledTimes(1);
    });

    it('should use provided dependencies when available', () => {
      // Arrange
      const customStore = mockStore as unknown as Store;
      const customView = mockView as unknown as DocumentView;
      const customSorting = mockSortingService as unknown as SortingService;
      const customNotification = mockNotificationService as unknown as NotificationService;
      const customWS = mockWSManager as unknown as WebSocketManager;

      // Act
      new DocumentController(
        containerId,
        customStore,
        customView,
        customSorting,
        customNotification,
        customWS
      );

      // Assert
      expect(MockedStore.getInstance).not.toHaveBeenCalled();
      expect(MockedDocumentView).not.toHaveBeenCalled();
      expect(MockedSortingService).not.toHaveBeenCalled();
      expect(MockedNotificationService).not.toHaveBeenCalled();
      expect(MockedWebSocketManager).not.toHaveBeenCalled();
    });

    it('should subscribe to store changes', () => {
      // Arrange & Act
      new DocumentController(containerId);

      // Assert
      expect(mockStore.subscribe).toHaveBeenCalledTimes(1);
      expect(mockStore.subscribe).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should call updateView on initialization', () => {
      // Arrange
      const documents = [sampleDocument];
      mockStore.getDocuments.mockReturnValue(documents);
      mockStore.getSortField.mockReturnValue('Title');
      mockStore.getViewMode.mockReturnValue('list');

      // Act
      new DocumentController(containerId);

      // Assert
      expect(mockView.render).toHaveBeenCalledTimes(1);
      expect(mockView.render).toHaveBeenCalledWith(
        documents,
        'Title',
        'list',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should render with empty documents array initially', () => {
      // Arrange
      mockStore.getDocuments.mockReturnValue([]);
      mockStore.getSortField.mockReturnValue('CreatedAt');
      mockStore.getViewMode.mockReturnValue('grid');

      // Act
      new DocumentController(containerId);

      // Assert
      expect(mockView.render).toHaveBeenCalledWith(
        [],
        'CreatedAt',
        'grid',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  describe('connect', () => {
    it('should call wsManager connect method', () => {
      // Arrange
      const controller = new DocumentController(containerId);

      // Act
      controller.connect();

      // Assert
      expect(mockWSManager.connect).toHaveBeenCalledTimes(1);
    });

    it('should not throw when called multiple times', () => {
      // Arrange
      const controller = new DocumentController(containerId);

      // Act & Assert
      expect(() => {
        controller.connect();
        controller.connect();
        controller.connect();
      }).not.toThrow();
      expect(mockWSManager.connect).toHaveBeenCalledTimes(3);
    });
  });

  describe('disconnect', () => {
    it('should call wsManager disconnect method', () => {
      // Arrange
      const controller = new DocumentController(containerId);

      // Act
      controller.disconnect();

      // Assert
      expect(mockWSManager.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should disconnect after connect', () => {
      // Arrange
      const controller = new DocumentController(containerId);
      controller.connect();

      // Act
      controller.disconnect();

      // Assert
      expect(mockWSManager.connect).toHaveBeenCalledTimes(1);
      expect(mockWSManager.disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleSort (via render callback)', () => {
    it('should toggle sort when sort callback is invoked', () => {
      // Arrange
      mockStore.getSortField.mockReturnValue('Title');
      mockStore.getSortOrder.mockReturnValue('asc');
      mockSortingService.toggleSort.mockReturnValue({ field: 'Version', order: 'asc' });

      new DocumentController(containerId);
      const sortCallback = mockView.render.mock.calls[0][3];

      // Act
      sortCallback('Version');

      // Assert
      expect(mockSortingService.toggleSort).toHaveBeenCalledTimes(1);
      expect(mockSortingService.toggleSort).toHaveBeenCalledWith('Title', 'asc', 'Version');
      expect(mockStore.setSortField).toHaveBeenCalledWith('Version');
      expect(mockStore.setSortOrder).toHaveBeenCalledWith('asc');
    });

    it('should toggle sort order when clicking same field', () => {
      // Arrange
      mockStore.getSortField.mockReturnValue('Title');
      mockStore.getSortOrder.mockReturnValue('asc');
      mockSortingService.toggleSort.mockReturnValue({ field: 'Title', order: 'desc' });

      new DocumentController(containerId);
      const sortCallback = mockView.render.mock.calls[0][3];

      // Act
      sortCallback('Title');

      // Assert
      expect(mockSortingService.toggleSort).toHaveBeenCalledWith('Title', 'asc', 'Title');
      expect(mockStore.setSortField).toHaveBeenCalledWith('Title');
      expect(mockStore.setSortOrder).toHaveBeenCalledWith('desc');
    });

    it('should handle sorting by CreatedAt field', () => {
      // Arrange
      mockStore.getSortField.mockReturnValue('Version');
      mockStore.getSortOrder.mockReturnValue('desc');
      mockSortingService.toggleSort.mockReturnValue({ field: 'CreatedAt', order: 'asc' });

      new DocumentController(containerId);
      const sortCallback = mockView.render.mock.calls[0][3];

      // Act
      sortCallback('CreatedAt');

      // Assert
      expect(mockSortingService.toggleSort).toHaveBeenCalledWith('Version', 'desc', 'CreatedAt');
      expect(mockStore.setSortField).toHaveBeenCalledWith('CreatedAt');
      expect(mockStore.setSortOrder).toHaveBeenCalledWith('asc');
    });
  });

  describe('handleViewModeChange (via render callback)', () => {
    it('should change view mode to grid when callback is invoked', () => {
      // Arrange
      new DocumentController(containerId);
      const viewModeCallback = mockView.render.mock.calls[0][5];

      // Act
      viewModeCallback('grid');

      // Assert
      expect(mockStore.setViewMode).toHaveBeenCalledTimes(1);
      expect(mockStore.setViewMode).toHaveBeenCalledWith('grid');
    });

    it('should change view mode to list when callback is invoked', () => {
      // Arrange
      new DocumentController(containerId);
      const viewModeCallback = mockView.render.mock.calls[0][5];

      // Act
      viewModeCallback('list');

      // Assert
      expect(mockStore.setViewMode).toHaveBeenCalledWith('list');
    });
  });

  describe('handleCreate (via render callback)', () => {
    it('should show modal when create callback is invoked', () => {
      // Arrange
      new DocumentController(containerId);
      const createCallback = mockView.render.mock.calls[0][4];

      // Act
      createCallback();

      // Assert
      expect(mockView.showModal).toHaveBeenCalledTimes(1);
      expect(mockView.showModal).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should add document to store when modal is submitted', () => {
      // Arrange
      new DocumentController(containerId);
      const createCallback = mockView.render.mock.calls[0][4];
      createCallback();
      const modalSubmitCallback = mockView.showModal.mock.calls[0][0];

      // Act
      modalSubmitCallback(sampleDocument);

      // Assert
      expect(mockStore.addDocument).toHaveBeenCalledTimes(1);
      expect(mockStore.addDocument).toHaveBeenCalledWith(sampleDocument);
    });

    it('should notify when document is created via modal', () => {
      // Arrange
      new DocumentController(containerId);
      const createCallback = mockView.render.mock.calls[0][4];
      createCallback();
      const modalSubmitCallback = mockView.showModal.mock.calls[0][0];

      // Act
      modalSubmitCallback(sampleDocument);

      // Assert
      expect(mockNotificationService.notifyDocumentCreated).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.notifyDocumentCreated).toHaveBeenCalledWith(sampleDocument);
    });

    it('should handle multiple document creations', () => {
      // Arrange
      const doc2 = { ...sampleDocument, ID: 'doc-456', Title: 'Second Document' };
      new DocumentController(containerId);
      const createCallback = mockView.render.mock.calls[0][4];

      // Act - Create first document
      createCallback();
      const modalSubmitCallback1 = mockView.showModal.mock.calls[0][0];
      modalSubmitCallback1(sampleDocument);

      // Act - Create second document
      createCallback();
      const modalSubmitCallback2 = mockView.showModal.mock.calls[1][0];
      modalSubmitCallback2(doc2);

      // Assert
      expect(mockStore.addDocument).toHaveBeenCalledTimes(2);
      expect(mockStore.addDocument).toHaveBeenNthCalledWith(1, sampleDocument);
      expect(mockStore.addDocument).toHaveBeenNthCalledWith(2, doc2);
      expect(mockNotificationService.notifyDocumentCreated).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleNewDocument (via WebSocketManager callback)', () => {
    it('should add document to store when received via WebSocket', () => {
      // Arrange
      new DocumentController(containerId);
      const wsCallback = MockedWebSocketManager.mock.calls[0][0];

      // Act
      wsCallback(sampleDocument);

      // Assert
      expect(mockStore.addDocument).toHaveBeenCalledTimes(1);
      expect(mockStore.addDocument).toHaveBeenCalledWith(sampleDocument);
    });

    it('should notify when document is received via WebSocket', () => {
      // Arrange
      new DocumentController(containerId);
      const wsCallback = MockedWebSocketManager.mock.calls[0][0];

      // Act
      wsCallback(sampleDocument);

      // Assert
      expect(mockNotificationService.notifyDocumentReceived).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.notifyDocumentReceived).toHaveBeenCalledWith(sampleDocument);
    });

    it('should handle multiple documents received via WebSocket', () => {
      // Arrange
      const doc2 = { ...sampleDocument, ID: 'doc-789', Title: 'Third Document' };
      new DocumentController(containerId);
      const wsCallback = MockedWebSocketManager.mock.calls[0][0];

      // Act
      wsCallback(sampleDocument);
      wsCallback(doc2);

      // Assert
      expect(mockStore.addDocument).toHaveBeenCalledTimes(2);
      expect(mockNotificationService.notifyDocumentReceived).toHaveBeenCalledTimes(2);
    });
  });

  describe('store subscription and view updates', () => {
    it('should update view when store notifies of changes', () => {
      // Arrange
      const documents = [sampleDocument];
      mockStore.getDocuments.mockReturnValue(documents);
      new DocumentController(containerId);
      const storeListener = mockStore.subscribe.mock.calls[0][0];
      mockView.render.mockClear();

      // Act
      storeListener();

      // Assert
      expect(mockView.render).toHaveBeenCalledTimes(1);
      expect(mockView.render).toHaveBeenCalledWith(
        documents,
        'Title',
        'list',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should update view with new documents after store change', () => {
      // Arrange
      const doc2 = { ...sampleDocument, ID: 'doc-999', Title: 'New Document' };
      mockStore.getDocuments.mockReturnValue([sampleDocument]);
      new DocumentController(containerId);
      const storeListener = mockStore.subscribe.mock.calls[0][0];
      mockView.render.mockClear();
      mockStore.getDocuments.mockReturnValue([sampleDocument, doc2]);

      // Act
      storeListener();

      // Assert
      expect(mockView.render).toHaveBeenCalledWith(
        [sampleDocument, doc2],
        expect.any(String),
        expect.any(String),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should update view with new sort field after store change', () => {
      // Arrange
      new DocumentController(containerId);
      const storeListener = mockStore.subscribe.mock.calls[0][0];
      mockView.render.mockClear();
      mockStore.getSortField.mockReturnValue('Version');

      // Act
      storeListener();

      // Assert
      expect(mockView.render).toHaveBeenCalledWith(
        expect.any(Array),
        'Version',
        expect.any(String),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should update view with new view mode after store change', () => {
      // Arrange
      new DocumentController(containerId);
      const storeListener = mockStore.subscribe.mock.calls[0][0];
      mockView.render.mockClear();
      mockStore.getViewMode.mockReturnValue('grid');

      // Act
      storeListener();

      // Assert
      expect(mockView.render).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(String),
        'grid',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle full document creation flow', () => {
      // Arrange
      new DocumentController(containerId);
      const createCallback = mockView.render.mock.calls[0][4];

      // Act - User clicks create button
      createCallback();

      // Act - User submits modal with document
      const modalSubmitCallback = mockView.showModal.mock.calls[0][0];
      modalSubmitCallback(sampleDocument);

      // Assert
      expect(mockView.showModal).toHaveBeenCalledTimes(1);
      expect(mockStore.addDocument).toHaveBeenCalledWith(sampleDocument);
      expect(mockNotificationService.notifyDocumentCreated).toHaveBeenCalledWith(sampleDocument);
    });

    it('should handle full WebSocket document reception flow', () => {
      // Arrange
      const controller = new DocumentController(containerId);

      // Act
      controller.connect();
      const wsCallback = MockedWebSocketManager.mock.calls[0][0];

      // Act - Document received via WebSocket
      wsCallback(sampleDocument);

      // Assert
      expect(mockWSManager.connect).toHaveBeenCalledTimes(1);
      expect(mockStore.addDocument).toHaveBeenCalledWith(sampleDocument);
      expect(mockNotificationService.notifyDocumentReceived).toHaveBeenCalledWith(sampleDocument);
    });

    it('should handle full sort change flow', () => {
      // Arrange
      mockStore.getSortField.mockReturnValue('Title');
      mockStore.getSortOrder.mockReturnValue('asc');
      mockSortingService.toggleSort.mockReturnValue({ field: 'Title', order: 'desc' });
      new DocumentController(containerId);
      const sortCallback = mockView.render.mock.calls[0][3];

      // Act - User clicks sort header
      sortCallback('Title');

      // Assert
      expect(mockSortingService.toggleSort).toHaveBeenCalledWith('Title', 'asc', 'Title');
      expect(mockStore.setSortField).toHaveBeenCalledWith('Title');
      expect(mockStore.setSortOrder).toHaveBeenCalledWith('desc');
    });

    it('should handle connect and disconnect lifecycle', () => {
      // Arrange
      const controller = new DocumentController(containerId);

      // Act
      controller.connect();
      controller.disconnect();

      // Assert
      expect(mockWSManager.connect).toHaveBeenCalledTimes(1);
      expect(mockWSManager.disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
