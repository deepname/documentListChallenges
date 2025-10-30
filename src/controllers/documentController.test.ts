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
  getViewMode: MockedFunction<() => ViewMode>;
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

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mocks
    mockStore = {
      subscribe: vi.fn(),
      getDocuments: vi.fn(),
      getSortField: vi.fn(),
      getViewMode: vi.fn(),
    };

    mockView = {
      render: vi.fn(),
      showNotification: vi.fn(),
      showModal: vi.fn(),
    };

    mockWSManager = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    mockSortingService = {
      toggleSort: vi.fn(),
    };

    mockNotificationService = {
      notifyDocumentCreated: vi.fn(),
      notifyDocumentReceived: vi.fn(),
      notify: vi.fn(),
    };

    containerId = 'test-container';

    MockedStore.getInstance.mockReturnValue(mockStore as unknown as Store);
    MockedDocumentView.mockImplementation(function (this: any) {
      return mockView as unknown as DocumentView;
    });
    MockedSortingService.mockImplementation(function (this: any) {
      return mockSortingService as unknown as SortingService;
    });
    MockedNotificationService.mockImplementation(function (this: any) {
      return mockNotificationService as unknown as NotificationService;
    });
    MockedWebSocketManager.mockImplementation(function (this: any) {
      return mockWSManager as unknown as WebSocketManager;
    });
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
      expect(MockedSortingService).toHaveBeenCalledTimes(1);
      expect(MockedNotificationService).toHaveBeenCalledTimes(1);
      expect(MockedWebSocketManager).toHaveBeenCalledTimes(1);
      expect(mockStore.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should use provided dependencies when available', () => {
      // Arrange
      const customStore = { ...mockStore };
      const customView = { ...mockView };
      const customSorting = { ...mockSortingService };
      const customNotification = { ...mockNotificationService };
      const customWS = { ...mockWSManager };

      // Act
      new DocumentController(
        containerId,
        customStore as unknown as Store,
        customView as unknown as DocumentView,
        customSorting as unknown as SortingService,
        customNotification as unknown as NotificationService,
        customWS as unknown as WebSocketManager
      );

      // Assert
      expect(MockedStore.getInstance).not.toHaveBeenCalled();
      expect(MockedDocumentView).not.toHaveBeenCalled();
      expect(MockedSortingService).not.toHaveBeenCalled();
      expect(MockedNotificationService).not.toHaveBeenCalled();
      expect(MockedWebSocketManager).not.toHaveBeenCalled();
      expect(customStore.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should call updateView on initialization', () => {
      // Arrange
      mockStore.getDocuments.mockReturnValue([]);
      mockStore.getSortField.mockReturnValue('Title');
      mockStore.getViewMode.mockReturnValue('list');

      // Act
      new DocumentController(containerId);

      // Assert
      expect(mockView.render).toHaveBeenCalledWith(
        [],
        'Title',
        'list',
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
  });

  // Additional integration tests could be added here
  // For example, testing that store changes trigger view updates
  // Or testing WebSocket message handling
  // But for basic tests, the above covers the main public API
});
