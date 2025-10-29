import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocumentController } from './DocumentController';
import { Store } from '../store/Store';
import { DocumentView } from '../views/DocumentView';
import { WebSocketService } from '../services/WebSocketService';
import { Document, SortField } from '../models/Document';
import { SocketsNotification } from '../models/Sockets';

// Mock dependencies
vi.mock('../store/Store');
vi.mock('../views/DocumentView');
vi.mock('../services/WebSocketService');

describe('DocumentController', () => {
  // Fast: Uses mocked dependencies, no I/O
  // Independent: Fresh mocks before each test
  // Repeatable: Deterministic with mocked behavior
  // Self-validating: Clear assertions
  // Timely: Tests controller coordination logic

  let mockStore: Store;
  let mockView: DocumentView;
  let mockWsService: WebSocketService;
  let controller: DocumentController;

  const mockDocuments: Document[] = [
    {
      ID: 'doc-1',
      Title: 'Document 1',
      Contributors: [{ ID: 'user-1', Name: 'Alice' }],
      Version: 1,
      Attachments: [],
      CreatedAt: new Date('2024-01-15T10:30:00Z'),
      UpdatedAt: new Date('2024-01-15T10:30:00Z'),
    },
    {
      ID: 'doc-2',
      Title: 'Document 2',
      Contributors: [{ ID: 'user-2', Name: 'Bob' }],
      Version: 2,
      Attachments: [],
      CreatedAt: new Date('2024-01-16T10:30:00Z'),
      UpdatedAt: new Date('2024-01-16T10:30:00Z'),
    },
  ];

  beforeEach(() => {
    // Clear all mocks to ensure independence
    vi.clearAllMocks();

    // Create mock instances with proper typing
    mockStore = {
      subscribe: vi.fn().mockReturnValue(() => {}),
      getDocuments: vi.fn().mockReturnValue(mockDocuments),
      getSortField: vi.fn().mockReturnValue('CreatedAt' as SortField),
      getSortOrder: vi.fn().mockReturnValue('desc'),
      getViewMode: vi.fn().mockReturnValue('list'),
      addDocument: vi.fn(),
      setSortField: vi.fn(),
      setSortOrder: vi.fn(),
      setViewMode: vi.fn(),
    } as unknown as Store;

    mockView = {
      render: vi.fn(),
      showModal: vi.fn(),
      showNotification: vi.fn(),
    } as unknown as DocumentView;

    mockWsService = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as WebSocketService;
  });

  describe('constructor', () => {
    it('should initialize with provided dependencies', () => {
      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      expect(mockStore.subscribe).toHaveBeenCalledTimes(1);
      expect(mockStore.getDocuments).toHaveBeenCalled();
      expect(mockView.render).toHaveBeenCalled();
    });

    it('should subscribe to store updates', () => {
      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      expect(mockStore.subscribe).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should render initial view on construction', () => {
      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      expect(mockView.render).toHaveBeenCalledWith(
        mockDocuments,
        'CreatedAt',
        'list',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should pass correct callbacks to view render', () => {
      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      const renderCall = vi.mocked(mockView.render).mock.calls[0];
      expect(renderCall[3]).toBeInstanceOf(Function); // onSort
      expect(renderCall[4]).toBeInstanceOf(Function); // onCreate
      expect(renderCall[5]).toBeInstanceOf(Function); // onViewModeChange
    });
  });

  describe('store subscription', () => {
    it('should update view when store notifies changes', () => {
      let storeListener: (() => void) | undefined;
      vi.mocked(mockStore.subscribe).mockImplementation((listener: () => void) => {
        storeListener = listener;
        return () => {};
      });

      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      // Clear the initial render call
      vi.mocked(mockView.render).mockClear();

      // Trigger store update
      storeListener?.();

      expect(mockView.render).toHaveBeenCalledTimes(1);
      expect(mockStore.getDocuments).toHaveBeenCalled();
    });

    it('should fetch fresh data from store on each update', () => {
      let storeListener: (() => void) | undefined;
      vi.mocked(mockStore.subscribe).mockImplementation((listener: () => void) => {
        storeListener = listener;
        return () => {};
      });

      const updatedDocs = [
        ...mockDocuments,
        {
          ID: 'doc-3',
          Title: 'Document 3',
          Contributors: [],
          Version: 3,
          Attachments: [],
          CreatedAt: new Date(),
          UpdatedAt: new Date(),
        },
      ];

      vi.mocked(mockStore.getDocuments).mockReturnValue(updatedDocs);

      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);
      vi.mocked(mockView.render).mockClear();

      storeListener?.();

      expect(mockView.render).toHaveBeenCalledWith(
        updatedDocs,
        expect.any(String),
        expect.any(String),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  describe('handleSort', () => {
    it('should toggle sort order when clicking same field', () => {
      vi.mocked(mockStore.getSortField).mockReturnValue('Title');
      vi.mocked(mockStore.getSortOrder).mockReturnValue('asc');

      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      // Get the onSort callback from render
      const onSortCallback = vi.mocked(mockView.render).mock.calls[0][3];
      onSortCallback('Title');

      expect(mockStore.setSortOrder).toHaveBeenCalledWith('desc');
      expect(mockStore.setSortField).not.toHaveBeenCalled();
    });

    it('should set new field and asc order when clicking different field', () => {
      vi.mocked(mockStore.getSortField).mockReturnValue('CreatedAt');
      vi.mocked(mockStore.getSortOrder).mockReturnValue('desc');

      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      const onSortCallback = vi.mocked(mockView.render).mock.calls[0][3];
      onSortCallback('Title');

      expect(mockStore.setSortField).toHaveBeenCalledWith('Title');
      expect(mockStore.setSortOrder).toHaveBeenCalledWith('asc');
    });

    it('should toggle from desc to asc on same field', () => {
      vi.mocked(mockStore.getSortField).mockReturnValue('Version');
      vi.mocked(mockStore.getSortOrder).mockReturnValue('desc');

      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      const onSortCallback = vi.mocked(mockView.render).mock.calls[0][3];
      onSortCallback('Version');

      expect(mockStore.setSortOrder).toHaveBeenCalledWith('asc');
    });
  });

  describe('handleViewModeChange', () => {
    it('should update store with new view mode', () => {
      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      const onViewModeChangeCallback = vi.mocked(mockView.render).mock.calls[0][5];
      onViewModeChangeCallback('grid');

      expect(mockStore.setViewMode).toHaveBeenCalledWith('grid');
    });

    it('should handle switching to list mode', () => {
      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      const onViewModeChangeCallback = vi.mocked(mockView.render).mock.calls[0][5];
      onViewModeChangeCallback('list');

      expect(mockStore.setViewMode).toHaveBeenCalledWith('list');
    });
  });

  describe('handleCreate', () => {
    it('should show modal when create is triggered', () => {
      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      const onCreateCallback = vi.mocked(mockView.render).mock.calls[0][4];
      onCreateCallback();

      expect(mockView.showModal).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should add document to store when modal submits', () => {
      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      const onCreateCallback = vi.mocked(mockView.render).mock.calls[0][4];
      onCreateCallback();

      // Get the callback passed to showModal
      const modalCallback = vi.mocked(mockView.showModal).mock.calls[0][0];
      const newDoc: Document = {
        ID: 'doc-new',
        Title: 'New Document',
        Contributors: [],
        Version: 1,
        Attachments: [],
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      };

      modalCallback(newDoc);

      expect(mockStore.addDocument).toHaveBeenCalledWith(newDoc);
    });

    it('should show notification after document is created', () => {
      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      const onCreateCallback = vi.mocked(mockView.render).mock.calls[0][4];
      onCreateCallback();

      const modalCallback = vi.mocked(mockView.showModal).mock.calls[0][0];
      const newDoc: Document = {
        ID: 'doc-new',
        Title: 'Test Document',
        Contributors: [],
        Version: 1,
        Attachments: [],
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      };

      modalCallback(newDoc);

      expect(mockView.showNotification).toHaveBeenCalledWith('Document created: Test Document');
    });
  });

  describe('handleNewDocument', () => {
    it('should process WebSocket notification and add document', () => {
      // Capture the WebSocket callback
      let wsCallback: ((notification: SocketsNotification) => void) | undefined;
      const MockedWebSocketService = vi.mocked(WebSocketService);
      MockedWebSocketService.mockImplementation(
        (callback: (notification: SocketsNotification) => void) => {
          wsCallback = callback;
          return mockWsService;
        }
      );

      controller = new DocumentController('test-container', mockStore, mockView);

      const notification: SocketsNotification = {
        Timestamp: '2024-01-20T10:30:00Z',
        UserID: 'user-3',
        UserName: 'Charlie',
        DocumentID: 'doc-ws-1',
        DocumentTitle: 'WebSocket Document',
      };

      wsCallback?.(notification);

      expect(mockStore.addDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          ID: 'doc-ws-1',
          Title: 'WebSocket Document',
          Contributors: [{ ID: 'user-3', Name: 'Charlie' }],
        })
      );
    });

    it('should show notification when WebSocket document is received', () => {
      let wsCallback: ((notification: SocketsNotification) => void) | undefined;
      const MockedWebSocketService = vi.mocked(WebSocketService);
      MockedWebSocketService.mockImplementation(
        (callback: (notification: SocketsNotification) => void) => {
          wsCallback = callback;
          return mockWsService;
        }
      );

      controller = new DocumentController('test-container', mockStore, mockView);

      const notification: SocketsNotification = {
        Timestamp: '2024-01-20T10:30:00Z',
        UserID: 'user-3',
        UserName: 'Charlie',
        DocumentID: 'doc-ws-1',
        DocumentTitle: 'Real-time Doc',
      };

      wsCallback?.(notification);

      expect(mockView.showNotification).toHaveBeenCalledWith('New document added: Real-time Doc');
    });
  });

  describe('connect', () => {
    it('should delegate to WebSocket service', () => {
      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      controller.connect();

      expect(mockWsService.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('disconnect', () => {
    it('should delegate to WebSocket service', () => {
      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      controller.disconnect();

      expect(mockWsService.disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete sort workflow', () => {
      let storeListener: (() => void) | undefined;
      vi.mocked(mockStore.subscribe).mockImplementation((listener: () => void) => {
        storeListener = listener;
        return () => {};
      });

      vi.mocked(mockStore.getSortField).mockReturnValue('CreatedAt');
      vi.mocked(mockStore.getSortOrder).mockReturnValue('desc');

      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      // User clicks Title sort
      const onSortCallback = vi.mocked(mockView.render).mock.calls[0][3];
      onSortCallback('Title');

      expect(mockStore.setSortField).toHaveBeenCalledWith('Title');
      expect(mockStore.setSortOrder).toHaveBeenCalledWith('asc');

      // Store notifies change
      vi.mocked(mockStore.getSortField).mockReturnValue('Title');
      vi.mocked(mockStore.getSortOrder).mockReturnValue('asc');
      vi.mocked(mockView.render).mockClear();

      storeListener?.();

      // View should re-render with new sort
      expect(mockView.render).toHaveBeenCalledWith(
        mockDocuments,
        'Title',
        'list',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should handle complete document creation workflow', () => {
      let storeListener: (() => void) | undefined;
      vi.mocked(mockStore.subscribe).mockImplementation((listener: () => void) => {
        storeListener = listener;
        return () => {};
      });

      controller = new DocumentController('test-container', mockStore, mockView, mockWsService);

      // User clicks create button
      const onCreateCallback = vi.mocked(mockView.render).mock.calls[0][4];
      onCreateCallback();

      expect(mockView.showModal).toHaveBeenCalled();

      // User submits modal
      const modalCallback = vi.mocked(mockView.showModal).mock.calls[0][0];
      const newDoc: Document = {
        ID: 'doc-new',
        Title: 'Created Doc',
        Contributors: [],
        Version: 1,
        Attachments: [],
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      };

      modalCallback(newDoc);

      expect(mockStore.addDocument).toHaveBeenCalledWith(newDoc);
      expect(mockView.showNotification).toHaveBeenCalledWith('Document created: Created Doc');

      // Store notifies change
      const updatedDocs = [...mockDocuments, newDoc];
      vi.mocked(mockStore.getDocuments).mockReturnValue(updatedDocs);
      vi.mocked(mockView.render).mockClear();

      storeListener?.();

      // View should re-render with new document
      expect(mockView.render).toHaveBeenCalledWith(
        updatedDocs,
        expect.any(String),
        expect.any(String),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });
  });
});
