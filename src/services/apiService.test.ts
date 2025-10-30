import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ApiService } from './apiService';
import { Document } from '../models/document';

vi.mock('../utils/documentUtils', () => ({
    parseDocumentDates: vi.fn((doc: Document) => doc),
}));

describe('ApiService', () => {
    let apiService: ApiService;
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockFetch = vi.fn();
        global.fetch = mockFetch;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with default baseUrl', () => {
            // Arrange & Act
            const service = new ApiService();

            // Assert
            expect(service).toBeDefined();
        });

        it('should initialize with custom baseUrl', () => {
            // Arrange & Act
            const customUrl = 'http://custom-api.com';
            const service = new ApiService(customUrl);

            // Assert
            expect(service).toBeDefined();
        });
    });

    describe('fetchDocuments', () => {
        const mockDocuments: Document[] = [
            {
                ID: 'doc-1',
                Title: 'Test Document 1',
                Contributors: [{ ID: 'user-1', Name: 'John' }],
                Version: '1.0.0',
                Attachments: [],
                CreatedAt: new Date('2024-01-15T10:30:00Z'),
                UpdatedAt: new Date('2024-01-15T10:30:00Z'),
            },
            {
                ID: 'doc-2',
                Title: 'Test Document 2',
                Contributors: [],
                Version: 2,
                Attachments: ['file.pdf'],
                CreatedAt: new Date('2024-01-16T10:30:00Z'),
                UpdatedAt: new Date('2024-01-16T10:30:00Z'),
            },
        ];

        it('should fetch documents successfully', async () => {
            // Arrange
            apiService = new ApiService();
            const mockResponse = {
                ok: true,
                json: vi.fn().mockResolvedValue(mockDocuments),
            };
            mockFetch.mockResolvedValue(mockResponse);

            // Act
            const result = await apiService.fetchDocuments();

            // Assert
            expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/documents');
            expect(result).toEqual(mockDocuments);
            expect(result).toHaveLength(2);
        });

        it('should use custom baseUrl when fetching documents', async () => {
            // Arrange
            const customUrl = 'http://custom-api.com';
            apiService = new ApiService(customUrl);
            const mockResponse = {
                ok: true,
                json: vi.fn().mockResolvedValue(mockDocuments),
            };
            mockFetch.mockResolvedValue(mockResponse);

            // Act
            await apiService.fetchDocuments();

            // Assert
            expect(mockFetch).toHaveBeenCalledWith(`${customUrl}/documents`);
        });

        it('should throw error when response is not ok', async () => {
            // Arrange
            apiService = new ApiService();
            const mockResponse = {
                ok: false,
                statusText: 'Internal Server Error',
            };
            mockFetch.mockResolvedValue(mockResponse);

            // Act & Assert
            await expect(apiService.fetchDocuments()).rejects.toThrow(
                'Failed to fetch documents: Internal Server Error'
            );
        });

        it('should throw error when fetch fails', async () => {
            // Arrange
            apiService = new ApiService();
            const fetchError = new Error('Network error');
            mockFetch.mockRejectedValue(fetchError);

            // Act & Assert
            await expect(apiService.fetchDocuments()).rejects.toThrow('Network error');
        });

        it('should parse document dates after fetching', async () => {
            // Arrange
            apiService = new ApiService();
            const mockResponse = {
                ok: true,
                json: vi.fn().mockResolvedValue(mockDocuments),
            };
            mockFetch.mockResolvedValue(mockResponse);
            const { parseDocumentDates } = await import('../utils/documentUtils');

            // Act
            await apiService.fetchDocuments();

            // Assert
            expect(parseDocumentDates).toHaveBeenCalledTimes(2);
        });

        it('should return empty array when no documents are returned', async () => {
            // Arrange
            apiService = new ApiService();
            const mockResponse = {
                ok: true,
                json: vi.fn().mockResolvedValue([]),
            };
            mockFetch.mockResolvedValue(mockResponse);

            // Act
            const result = await apiService.fetchDocuments();

            // Assert
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });
    });
});
