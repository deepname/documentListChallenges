import { describe, it, expect, beforeEach } from 'vitest';
import { SortingService, SortResult } from './sortingService';
import { SortField } from '../models/document';

describe('SortingService', () => {
  let sortingService: SortingService;

  beforeEach(() => {
    // Arrange - Create a fresh instance before each test
    sortingService = new SortingService();
  });

  describe('toggleSort', () => {
    describe('when clicking the same field', () => {
      it('should toggle from ascending to descending', () => {
        // Arrange
        const currentField: SortField = 'Title';
        const currentOrder: 'asc' | 'desc' = 'asc';
        const newField: SortField = 'Title';

        // Act
        const result: SortResult = sortingService.toggleSort(
          currentField,
          currentOrder,
          newField
        );

        // Assert
        expect(result).toEqual({
          field: 'Title',
          order: 'desc',
        });
      });

      it('should toggle from descending to ascending', () => {
        // Arrange
        const currentField: SortField = 'Title';
        const currentOrder: 'asc' | 'desc' = 'desc';
        const newField: SortField = 'Title';

        // Act
        const result: SortResult = sortingService.toggleSort(
          currentField,
          currentOrder,
          newField
        );

        // Assert
        expect(result).toEqual({
          field: 'Title',
          order: 'asc',
        });
      });

      it('should toggle Version field from ascending to descending', () => {
        // Arrange
        const currentField: SortField = 'Version';
        const currentOrder: 'asc' | 'desc' = 'asc';
        const newField: SortField = 'Version';

        // Act
        const result: SortResult = sortingService.toggleSort(
          currentField,
          currentOrder,
          newField
        );

        // Assert
        expect(result).toEqual({
          field: 'Version',
          order: 'desc',
        });
      });

      it('should toggle CreatedAt field from descending to ascending', () => {
        // Arrange
        const currentField: SortField = 'CreatedAt';
        const currentOrder: 'asc' | 'desc' = 'desc';
        const newField: SortField = 'CreatedAt';

        // Act
        const result: SortResult = sortingService.toggleSort(
          currentField,
          currentOrder,
          newField
        );

        // Assert
        expect(result).toEqual({
          field: 'CreatedAt',
          order: 'asc',
        });
      });
    });

    describe('when clicking a different field', () => {
      it('should switch to new field with ascending order', () => {
        // Arrange
        const currentField: SortField = 'Title';
        const currentOrder: 'asc' | 'desc' = 'asc';
        const newField: SortField = 'Version';

        // Act
        const result: SortResult = sortingService.toggleSort(
          currentField,
          currentOrder,
          newField
        );

        // Assert
        expect(result).toEqual({
          field: 'Version',
          order: 'asc',
        });
      });

      it('should switch to new field with ascending order regardless of current order', () => {
        // Arrange
        const currentField: SortField = 'Title';
        const currentOrder: 'asc' | 'desc' = 'desc';
        const newField: SortField = 'CreatedAt';

        // Act
        const result: SortResult = sortingService.toggleSort(
          currentField,
          currentOrder,
          newField
        );

        // Assert
        expect(result).toEqual({
          field: 'CreatedAt',
          order: 'asc',
        });
      });

      it('should switch from Version to Title with ascending order', () => {
        // Arrange
        const currentField: SortField = 'Version';
        const currentOrder: 'asc' | 'desc' = 'desc';
        const newField: SortField = 'Title';

        // Act
        const result: SortResult = sortingService.toggleSort(
          currentField,
          currentOrder,
          newField
        );

        // Assert
        expect(result).toEqual({
          field: 'Title',
          order: 'asc',
        });
      });

      it('should switch from CreatedAt to Version with ascending order', () => {
        // Arrange
        const currentField: SortField = 'CreatedAt';
        const currentOrder: 'asc' | 'desc' = 'asc';
        const newField: SortField = 'Version';

        // Act
        const result: SortResult = sortingService.toggleSort(
          currentField,
          currentOrder,
          newField
        );

        // Assert
        expect(result).toEqual({
          field: 'Version',
          order: 'asc',
        });
      });

      it('should switch from Title to CreatedAt with ascending order', () => {
        // Arrange
        const currentField: SortField = 'Title';
        const currentOrder: 'asc' | 'desc' = 'desc';
        const newField: SortField = 'CreatedAt';

        // Act
        const result: SortResult = sortingService.toggleSort(
          currentField,
          currentOrder,
          newField
        );

        // Assert
        expect(result).toEqual({
          field: 'CreatedAt',
          order: 'asc',
        });
      });
    });

    describe('edge cases', () => {
      it('should handle multiple toggles on the same field', () => {
        // Arrange
        const field: SortField = 'Title';
        let currentOrder: 'asc' | 'desc' = 'asc';

        // Act - First toggle
        let result = sortingService.toggleSort(field, currentOrder, field);
        
        // Assert - First toggle
        expect(result.order).toBe('desc');

        // Act - Second toggle
        currentOrder = result.order;
        result = sortingService.toggleSort(field, currentOrder, field);

        // Assert - Second toggle
        expect(result.order).toBe('asc');

        // Act - Third toggle
        currentOrder = result.order;
        result = sortingService.toggleSort(field, currentOrder, field);

        // Assert - Third toggle
        expect(result.order).toBe('desc');
      });

      it('should always return ascending when switching fields multiple times', () => {
        // Arrange
        let currentField: SortField = 'Title';
        let currentOrder: 'asc' | 'desc' = 'desc';

        // Act & Assert - Switch to Version
        let result = sortingService.toggleSort(currentField, currentOrder, 'Version');
        expect(result).toEqual({ field: 'Version', order: 'asc' });

        // Act & Assert - Switch to CreatedAt
        currentField = result.field;
        currentOrder = result.order;
        result = sortingService.toggleSort(currentField, currentOrder, 'CreatedAt');
        expect(result).toEqual({ field: 'CreatedAt', order: 'asc' });

        // Act & Assert - Switch back to Title
        currentField = result.field;
        currentOrder = result.order;
        result = sortingService.toggleSort(currentField, currentOrder, 'Title');
        expect(result).toEqual({ field: 'Title', order: 'asc' });
      });
    });
  });

  describe('constructor', () => {
    it('should create instance of SortingService', () => {
      // Arrange & Act
      const service = new SortingService();

      // Assert
      expect(service).toBeInstanceOf(SortingService);
    });

    it('should create independent instances', () => {
      // Arrange & Act
      const service1 = new SortingService();
      const service2 = new SortingService();

      // Assert
      expect(service1).not.toBe(service2);
      expect(service1).toBeInstanceOf(SortingService);
      expect(service2).toBeInstanceOf(SortingService);
    });
  });
});
