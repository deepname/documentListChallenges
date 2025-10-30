import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveDocuments, loadDocuments } from './storageUtils';
import { Document } from '../models/document';

describe('storageUtils', () => {
    // Fast: Uses mocked localStorage
    // Independent: Each test clears localStorage
    // Repeatable: Mocked storage ensures consistency
    // Self-validating: Clear assertions
    // Timely: Tests persistence layer

    beforeEach(() => {
        // Clear localStorage before each test to ensure independence
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('saveDocuments', () => {
        it('should save documents to localStorage', () => {
            const documents: Document[] = [
                {
                    ID: 'doc-1',
                    Title: 'Document 1',
                    Contributors: [{ ID: 'user-1', Name: 'Alice' }],
                    Version: 1,
                    Attachments: [],
                    CreatedAt: new Date('2024-01-15T10:30:00Z'),
                    UpdatedAt: new Date('2024-01-15T10:30:00Z'),
                },
            ];

            saveDocuments(documents);

            const stored = localStorage.getItem('documents');
            expect(stored).not.toBeNull();

            const parsed = JSON.parse(stored!);
            expect(parsed).toHaveLength(1);
            expect(parsed[0].ID).toBe('doc-1');
            expect(parsed[0].Title).toBe('Document 1');
        });

        it('should save multiple documents', () => {
            const documents: Document[] = [
                {
                    ID: 'doc-1',
                    Title: 'Document 1',
                    Contributors: [],
                    Version: 1,
                    Attachments: [],
                    CreatedAt: new Date('2024-01-15T10:30:00Z'),
                    UpdatedAt: new Date('2024-01-15T10:30:00Z'),
                },
                {
                    ID: 'doc-2',
                    Title: 'Document 2',
                    Contributors: [],
                    Version: 2,
                    Attachments: ['file.pdf'],
                    CreatedAt: new Date('2024-01-16T10:30:00Z'),
                    UpdatedAt: new Date('2024-01-16T10:30:00Z'),
                },
            ];

            saveDocuments(documents);

            const stored = localStorage.getItem('documents');
            const parsed = JSON.parse(stored!);
            expect(parsed).toHaveLength(2);
            expect(parsed[0].ID).toBe('doc-1');
            expect(parsed[1].ID).toBe('doc-2');
        });

        it('should save empty array', () => {
            saveDocuments([]);

            const stored = localStorage.getItem('documents');
            expect(stored).toBe('[]');
        });

        it('should overwrite existing documents', () => {
            const firstBatch: Document[] = [
                {
                    ID: 'doc-1',
                    Title: 'First',
                    Contributors: [],
                    Version: 1,
                    Attachments: [],
                    CreatedAt: new Date(),
                    UpdatedAt: new Date(),
                },
            ];

            const secondBatch: Document[] = [
                {
                    ID: 'doc-2',
                    Title: 'Second',
                    Contributors: [],
                    Version: 1,
                    Attachments: [],
                    CreatedAt: new Date(),
                    UpdatedAt: new Date(),
                },
            ];

            saveDocuments(firstBatch);
            saveDocuments(secondBatch);

            const stored = localStorage.getItem('documents');
            const parsed = JSON.parse(stored!);
            expect(parsed).toHaveLength(1);
            expect(parsed[0].ID).toBe('doc-2');
        });

        it('should handle documents with special characters', () => {
            const documents: Document[] = [
                {
                    ID: 'doc-1',
                    Title: 'Test "quotes" & <tags>',
                    Contributors: [{ ID: 'user-1', Name: "O'Brien" }],
                    Version: 1,
                    Attachments: [],
                    CreatedAt: new Date('2024-01-15T10:30:00Z'),
                    UpdatedAt: new Date('2024-01-15T10:30:00Z'),
                },
            ];

            saveDocuments(documents);

            const stored = localStorage.getItem('documents');
            const parsed = JSON.parse(stored!);
            expect(parsed[0].Title).toBe('Test "quotes" & <tags>');
            expect(parsed[0].Contributors[0].Name).toBe("O'Brien");
        });
    });

    describe('loadDocuments', () => {
        it('should load documents from localStorage', () => {
            const documents: Document[] = [
                {
                    ID: 'doc-1',
                    Title: 'Document 1',
                    Contributors: [{ ID: 'user-1', Name: 'Alice' }],
                    Version: 1,
                    Attachments: [],
                    CreatedAt: new Date('2024-01-15T10:30:00Z'),
                    UpdatedAt: new Date('2024-01-15T10:30:00Z'),
                },
            ];

            saveDocuments(documents);
            const loaded = loadDocuments();

            expect(loaded).toHaveLength(1);
            expect(loaded[0].ID).toBe('doc-1');
            expect(loaded[0].Title).toBe('Document 1');
            expect(loaded[0].Contributors[0].Name).toBe('Alice');
        });

        it('should return empty array when no documents exist', () => {
            const loaded = loadDocuments();

            expect(loaded).toEqual([]);
        });

        it('should parse dates correctly', () => {
            const documents: Document[] = [
                {
                    ID: 'doc-1',
                    Title: 'Document 1',
                    Contributors: [],
                    Version: 1,
                    Attachments: [],
                    CreatedAt: new Date('2024-01-15T10:30:00Z'),
                    UpdatedAt: new Date('2024-01-20T15:45:00Z'),
                },
            ];

            saveDocuments(documents);
            const loaded = loadDocuments();

            expect(loaded[0].CreatedAt).toBeInstanceOf(Date);
            expect(loaded[0].UpdatedAt).toBeInstanceOf(Date);
            expect(loaded[0].CreatedAt.toISOString()).toBe('2024-01-15T10:30:00.000Z');
            expect(loaded[0].UpdatedAt.toISOString()).toBe('2024-01-20T15:45:00.000Z');
        });

        it('should load multiple documents', () => {
            const documents: Document[] = [
                {
                    ID: 'doc-1',
                    Title: 'Document 1',
                    Contributors: [],
                    Version: 1,
                    Attachments: [],
                    CreatedAt: new Date('2024-01-15T10:30:00Z'),
                    UpdatedAt: new Date('2024-01-15T10:30:00Z'),
                },
                {
                    ID: 'doc-2',
                    Title: 'Document 2',
                    Contributors: [],
                    Version: 2,
                    Attachments: ['file.pdf'],
                    CreatedAt: new Date('2024-01-16T10:30:00Z'),
                    UpdatedAt: new Date('2024-01-16T10:30:00Z'),
                },
            ];

            saveDocuments(documents);
            const loaded = loadDocuments();

            expect(loaded).toHaveLength(2);
            expect(loaded[0].ID).toBe('doc-1');
            expect(loaded[1].ID).toBe('doc-2');
            expect(loaded[1].Attachments).toEqual(['file.pdf']);
        });

        it('should handle corrupted data gracefully', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            localStorage.setItem('documents', 'invalid json{');

            const loaded = loadDocuments();

            expect(loaded).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to load documents:',
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });

        it('should preserve all document properties', () => {
            const documents: Document[] = [
                {
                    ID: 'doc-1',
                    Title: 'Complex Document',
                    Contributors: [
                        { ID: 'user-1', Name: 'Alice' },
                        { ID: 'user-2', Name: 'Bob' },
                    ],
                    Version: 5,
                    Attachments: ['file1.pdf', 'file2.docx', 'image.png'],
                    CreatedAt: new Date('2024-01-15T10:30:00Z'),
                    UpdatedAt: new Date('2024-01-20T15:45:00Z'),
                },
            ];

            saveDocuments(documents);
            const loaded = loadDocuments();

            expect(loaded[0].ID).toBe('doc-1');
            expect(loaded[0].Title).toBe('Complex Document');
            expect(loaded[0].Contributors).toHaveLength(2);
            expect(loaded[0].Contributors[0].Name).toBe('Alice');
            expect(loaded[0].Contributors[1].Name).toBe('Bob');
            expect(loaded[0].Version).toBe(5);
            expect(loaded[0].Attachments).toEqual(['file1.pdf', 'file2.docx', 'image.png']);
        });
    });

    describe('integration tests', () => {
        it('should maintain data integrity through save and load cycle', () => {
            const original: Document[] = [
                {
                    ID: 'doc-1',
                    Title: 'Test Document',
                    Contributors: [{ ID: 'user-1', Name: 'Alice' }],
                    Version: 3,
                    Attachments: ['file.pdf'],
                    CreatedAt: new Date('2024-01-15T10:30:00Z'),
                    UpdatedAt: new Date('2024-01-20T15:45:00Z'),
                },
            ];

            saveDocuments(original);
            const loaded = loadDocuments();

            expect(loaded[0].ID).toBe(original[0].ID);
            expect(loaded[0].Title).toBe(original[0].Title);
            expect(loaded[0].Version).toBe(original[0].Version);
            expect(loaded[0].Attachments).toEqual(original[0].Attachments);
            expect(loaded[0].CreatedAt.getTime()).toBe(original[0].CreatedAt.getTime());
            expect(loaded[0].UpdatedAt.getTime()).toBe(original[0].UpdatedAt.getTime());
        });
    });
});
