import { describe, it, expect, beforeEach, vi, afterEach, MockedFunction } from 'vitest';
import { DocumentController } from './documentController';
import { Document, SortField } from '../models/document';
import { Store, ViewMode } from '../store/store';
import { DocumentView } from '../views/documentView';
import { WebSocketService } from '../services/webSocketService';

// Mock dependencies
vi.mock('../store/store');
vi.mock('../views/documentView');
vi.mock('../services/webSocketService');
vi.mock('../utils/documentUtils', () => ({
    DocumentMapper: {
        fromSocketNotification: vi.fn(),
    },
}));

const MockedStore = vi.mocked(Store);
const MockedDocumentView = vi.mocked(DocumentView);
const MockedWebSocketService = vi.mocked(WebSocketService);

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

interface MockWSService {
    connect: MockedFunction<() => void>;
    disconnect: MockedFunction<() => void>;
}

describe('DocumentController', () => {
    let mockStore: MockStore;
    let mockView: MockView;
    let mockWSService: MockWSService;
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

        mockWSService = {
            connect: vi.fn(),
            disconnect: vi.fn(),
        };

        containerId = 'test-container';

        MockedStore.getInstance.mockReturnValue(mockStore as unknown as Store);
        MockedDocumentView.mockImplementation(function mockDocumentView() {
            return mockView as MockView;
        });
        MockedWebSocketService.mockImplementation(function mockWebSocketService() {
            return mockWSService as MockWSService;
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
            expect(MockedDocumentView).toHaveBeenCalledTimes(1); // Changed toTimesCalledWith to toHaveBeenCalledTimes
            expect(MockedWebSocketService).toHaveBeenCalledTimes(1);
            expect(mockStore.subscribe).toHaveBeenCalledTimes(1);
        });

        it('should use provided dependencies when available', () => {
            // Arrange
            const customStore = { ...mockStore };
            const customView = { ...mockView };
            const customWS = { ...mockWSService };

            // Act
            new DocumentController(
                containerId,
                customStore as unknown as Store,
                customView as unknown as DocumentView,
                customWS as unknown as WebSocketService
            );

            // Assert
            expect(MockedStore.getInstance).not.toHaveBeenCalled();
            expect(MockedDocumentView).not.toHaveBeenCalled();
            expect(MockedWebSocketService).not.toHaveBeenCalled();
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
        it('should call wsService connect method', () => {
            // Arrange
            const controller = new DocumentController(containerId);

            // Act
            controller.connect();

            // Assert
            expect(mockWSService.connect).toHaveBeenCalledTimes(1);
        }); // controller is used in the test
    });

    describe('disconnect', () => {
        it('should call wsService disconnect method', () => {
            // Arrange
            const controller = new DocumentController(containerId);

            // Act
            controller.disconnect();

            // Assert
            expect(mockWSService.disconnect).toHaveBeenCalledTimes(1);
        }); // controller is used in the test
    });

    // Additional integration tests could be added here
    // For example, testing that store changes trigger view updates
    // Or testing WebSocket message handling
    // But for basic tests, the above covers the main public API
});
