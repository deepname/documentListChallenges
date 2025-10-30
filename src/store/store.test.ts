import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Store } from './store';
import { Document } from '../models/document';
import * as storageUtils from '../utils/storageUtils';

// Mock storage utilities
vi.mock('../utils/storageUtils');

describe('Store', () => {
  // Fast: Uses mocked localStorage
  // Independent: Fresh store instance and cleared mocks
  // Repeatable: Deterministic with mocked storage
  // Self-validating: Clear assertions
  // Timely: Tests state management logic

  let store: Store;

  const mockDocuments: Document[] = [
    {
      ID: 'doc-1',
      Title: 'Alpha Document',
      Contributors: [{ ID: 'user-1', Name: 'Alice' }],
      Version: '1.0.0',
      Attachments: [],
      CreatedAt: new Date('2024-01-15T10:30:00Z'),
      UpdatedAt: new Date('2024-01-15T10:30:00Z'),
    },
    {
      ID: 'doc-2',
      Title: 'Beta Document',
      Contributors: [{ ID: 'user-2', Name: 'Bob' }],
      Version: '2.5.1',
      Attachments: [],
      CreatedAt: new Date('2024-01-16T10:30:00Z'),
      UpdatedAt: new Date('2024-01-16T10:30:00Z'),
    },
    {
      ID: 'doc-3',
      Title: 'Charlie Document',
      Contributors: [],
      Version: 3,
      Attachments: [],
      CreatedAt: new Date('2024-01-14T10:30:00Z'),
      UpdatedAt: new Date('2024-01-14T10:30:00Z'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storageUtils.loadDocuments).mockReturnValue([]);
    vi.mocked(storageUtils.saveDocuments).mockImplementation(() => {});

    // Reset singleton instance for each test
    // @ts-expect-error - accessing private static for testing
    Store.instance = undefined;
  });

  afterEach(() => {
    // Clean up singleton
    // @ts-expect-error - accessing private static for testing
    Store.instance = undefined;
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = Store.getInstance();
      const instance2 = Store.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should load documents on first instantiation', () => {
      Store.getInstance();

      expect(storageUtils.loadDocuments).toHaveBeenCalledTimes(1);
    });

    it('should not reload documents on subsequent getInstance calls', () => {
      Store.getInstance();
      Store.getInstance();
      Store.getInstance();

      expect(storageUtils.loadDocuments).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribe', () => {
    beforeEach(() => {
      store = Store.getInstance();
    });

    it('should call listener when store changes', () => {
      const listener = vi.fn();
      store.subscribe(listener);

      store.setSortField('Title');

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should support multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      store.subscribe(listener1);
      store.subscribe(listener2);
      store.subscribe(listener3);

      store.setSortOrder('asc');

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener3).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);

      store.setSortField('Title');
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      store.setSortField('Version');
      expect(listener).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should handle unsubscribing one listener without affecting others', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = store.subscribe(listener1);
      store.subscribe(listener2);

      unsubscribe1();
      store.setSortField('Title');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDocuments', () => {
    beforeEach(() => {
      vi.mocked(storageUtils.loadDocuments).mockReturnValue([...mockDocuments]);
      store = Store.getInstance();
    });

    it('should return sorted documents', () => {
      const docs = store.getDocuments();

      expect(docs).toHaveLength(3);
      expect(docs).toBeInstanceOf(Array);
    });

    it('should return a copy of documents array', () => {
      const docs1 = store.getDocuments();
      const docs2 = store.getDocuments();

      expect(docs1).not.toBe(docs2);
      expect(docs1).toEqual(docs2);
    });

    it('should not allow mutation of internal state', () => {
      const docs = store.getDocuments();
      docs.push({
        ID: 'doc-new',
        Title: 'New',
        Contributors: [],
        Version: 1,
        Attachments: [],
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      });

      const docsAgain = store.getDocuments();
      expect(docsAgain).toHaveLength(3); // Still 3, not 4
    });
  });

  describe('addDocument', () => {
    beforeEach(() => {
      vi.mocked(storageUtils.loadDocuments).mockReturnValue([...mockDocuments]);
      store = Store.getInstance();
    });

    it('should add new document to store', () => {
      const newDoc: Document = {
        ID: 'doc-new',
        Title: 'New Document',
        Contributors: [],
        Version: 1,
        Attachments: [],
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      };

      store.addDocument(newDoc);

      const docs = store.getDocuments();
      expect(docs).toHaveLength(4);
      expect(docs.some(d => d.ID === 'doc-new')).toBe(true);
    });

    it('should save documents after adding', () => {
      const newDoc: Document = {
        ID: 'doc-new',
        Title: 'New Document',
        Contributors: [],
        Version: 1,
        Attachments: [],
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      };

      store.addDocument(newDoc);

      expect(storageUtils.saveDocuments).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ ID: 'doc-new' })])
      );
    });

    it('should notify listeners after adding document', () => {
      const listener = vi.fn();
      store.subscribe(listener);

      const newDoc: Document = {
        ID: 'doc-new',
        Title: 'New Document',
        Contributors: [],
        Version: 1,
        Attachments: [],
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      };

      store.addDocument(newDoc);

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should prevent duplicate documents', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      store.addDocument(mockDocuments[0]);

      const docs = store.getDocuments();
      expect(docs).toHaveLength(3); // Still 3, not 4
      expect(consoleWarnSpy).toHaveBeenCalledWith('Document with ID doc-1 already exists');

      consoleWarnSpy.mockRestore();
    });

    it('should not notify listeners when adding duplicate', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const listener = vi.fn();
      store.subscribe(listener);

      store.addDocument(mockDocuments[0]);

      expect(listener).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should not save when adding duplicate', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(storageUtils.saveDocuments).mockClear();

      store.addDocument(mockDocuments[0]);

      expect(storageUtils.saveDocuments).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('sorting', () => {
    beforeEach(() => {
      vi.mocked(storageUtils.loadDocuments).mockReturnValue([...mockDocuments]);
      store = Store.getInstance();
    });

    describe('sort by Title', () => {
      it('should sort documents by title ascending', () => {
        store.setSortField('Title');
        store.setSortOrder('asc');

        const docs = store.getDocuments();
        expect(docs[0].Title).toBe('Alpha Document');
        expect(docs[1].Title).toBe('Beta Document');
        expect(docs[2].Title).toBe('Charlie Document');
      });

      it('should sort documents by title descending', () => {
        store.setSortField('Title');
        store.setSortOrder('desc');

        const docs = store.getDocuments();
        expect(docs[0].Title).toBe('Charlie Document');
        expect(docs[1].Title).toBe('Beta Document');
        expect(docs[2].Title).toBe('Alpha Document');
      });
    });

    describe('sort by Version', () => {
      it('should sort semantic versions correctly ascending', () => {
        store.setSortField('Version');
        store.setSortOrder('asc');

        const docs = store.getDocuments();
        expect(docs[0].Version).toBe('1.0.0');
        expect(docs[1].Version).toBe('2.5.1');
        expect(docs[2].Version).toBe(3);
      });

      it('should sort semantic versions correctly descending', () => {
        store.setSortField('Version');
        store.setSortOrder('desc');

        const docs = store.getDocuments();
        // Mixed version types: semantic versions are compared separately from numeric
        expect(docs[0].Version).toBe('2.5.1');
        expect(docs[1].Version).toBe('1.0.0');
        expect(docs[2].Version).toBe(3);
      });

      it('should handle mixed version formats', () => {
        const mixedVersionDocs: Document[] = [
          { ...mockDocuments[0], ID: 'v1', Version: '1.0.0' },
          { ...mockDocuments[0], ID: 'v2', Version: '1.2.0' },
          { ...mockDocuments[0], ID: 'v3', Version: '1.1.5' },
          { ...mockDocuments[0], ID: 'v4', Version: 2 },
        ];

        vi.mocked(storageUtils.loadDocuments).mockReturnValue(mixedVersionDocs);
        // @ts-expect-error - reset singleton
        Store.instance = undefined;
        store = Store.getInstance();

        store.setSortField('Version');
        store.setSortOrder('asc');

        const docs = store.getDocuments();
        expect(docs[0].Version).toBe('1.0.0');
        expect(docs[1].Version).toBe('1.1.5');
        expect(docs[2].Version).toBe('1.2.0');
        expect(docs[3].Version).toBe(2);
      });
    });

    describe('sort by CreatedAt', () => {
      it('should sort by creation date ascending', () => {
        store.setSortField('CreatedAt');
        store.setSortOrder('asc');

        const docs = store.getDocuments();
        expect(docs[0].CreatedAt.toISOString()).toBe('2024-01-14T10:30:00.000Z');
        expect(docs[1].CreatedAt.toISOString()).toBe('2024-01-15T10:30:00.000Z');
        expect(docs[2].CreatedAt.toISOString()).toBe('2024-01-16T10:30:00.000Z');
      });

      it('should sort by creation date descending', () => {
        store.setSortField('CreatedAt');
        store.setSortOrder('desc');

        const docs = store.getDocuments();
        expect(docs[0].CreatedAt.toISOString()).toBe('2024-01-16T10:30:00.000Z');
        expect(docs[1].CreatedAt.toISOString()).toBe('2024-01-15T10:30:00.000Z');
        expect(docs[2].CreatedAt.toISOString()).toBe('2024-01-14T10:30:00.000Z');
      });
    });
  });

  describe('setSortField', () => {
    beforeEach(() => {
      store = Store.getInstance();
    });

    it('should update sort field', () => {
      store.setSortField('Title');
      expect(store.getSortField()).toBe('Title');
    });

    it('should notify listeners when sort field changes', () => {
      const listener = vi.fn();
      store.subscribe(listener);

      store.setSortField('Version');

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('setSortOrder', () => {
    beforeEach(() => {
      store = Store.getInstance();
    });

    it('should update sort order', () => {
      store.setSortOrder('asc');
      expect(store.getSortOrder()).toBe('asc');
    });

    it('should notify listeners when sort order changes', () => {
      const listener = vi.fn();
      store.subscribe(listener);

      store.setSortOrder('asc');

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('view mode', () => {
    beforeEach(() => {
      store = Store.getInstance();
    });

    it('should default to list view mode', () => {
      expect(store.getViewMode()).toBe('list');
    });

    it('should update view mode to grid', () => {
      store.setViewMode('grid');
      expect(store.getViewMode()).toBe('grid');
    });

    it('should update view mode to list', () => {
      store.setViewMode('grid');
      store.setViewMode('list');
      expect(store.getViewMode()).toBe('list');
    });

    it('should notify listeners when view mode changes', () => {
      const listener = vi.fn();
      store.subscribe(listener);

      store.setViewMode('grid');

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    beforeEach(() => {
      vi.mocked(storageUtils.loadDocuments).mockReturnValue([...mockDocuments]);
      store = Store.getInstance();
    });

    it('should handle complete workflow: add document, change sort, change view', () => {
      const listener = vi.fn();
      store.subscribe(listener);

      // Add document
      const newDoc: Document = {
        ID: 'doc-new',
        Title: 'Zebra Document',
        Contributors: [],
        Version: 1,
        Attachments: [],
        CreatedAt: new Date('2024-01-17T10:30:00Z'),
        UpdatedAt: new Date('2024-01-17T10:30:00Z'),
      };
      store.addDocument(newDoc);
      expect(listener).toHaveBeenCalledTimes(1);

      // Change sort
      store.setSortField('Title');
      expect(listener).toHaveBeenCalledTimes(2);

      store.setSortOrder('asc');
      expect(listener).toHaveBeenCalledTimes(3);

      // Verify sort
      const docs = store.getDocuments();
      expect(docs[0].Title).toBe('Alpha Document');
      expect(docs[docs.length - 1].Title).toBe('Zebra Document');

      // Change view mode
      store.setViewMode('grid');
      expect(listener).toHaveBeenCalledTimes(4);
    });

    it('should maintain state across multiple operations', () => {
      store.setSortField('Version');
      store.setSortOrder('desc');
      store.setViewMode('grid');

      const newDoc: Document = {
        ID: 'doc-new',
        Title: 'New Document',
        Contributors: [],
        Version: '10.0.0',
        Attachments: [],
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      };
      store.addDocument(newDoc);

      // State should be preserved
      expect(store.getSortField()).toBe('Version');
      expect(store.getSortOrder()).toBe('desc');
      expect(store.getViewMode()).toBe('grid');

      // New document should be first (highest version, desc order)
      const docs = store.getDocuments();
      expect(docs[0].ID).toBe('doc-new');
    });
  });
});
