import { SortField } from '../models/document';

export interface SortResult {
  field: SortField;
  order: 'asc' | 'desc';
}

/**
 * Service responsible for sorting logic
 * Handles toggle behavior: clicking same field reverses order, new field starts with 'asc'
 */
export class SortingService {
  /**
   * Determines the new sort field and order based on current state and user selection
   * @param currentField - The currently active sort field
   * @param currentOrder - The current sort order ('asc' or 'desc')
   * @param newField - The field the user wants to sort by
   * @returns The new sort field and order
   */
  toggleSort(
    currentField: SortField,
    currentOrder: 'asc' | 'desc',
    newField: SortField
  ): SortResult {
    // If clicking the same field, toggle the order
    if (newField === currentField) {
      return {
        field: currentField,
        order: currentOrder === 'asc' ? 'desc' : 'asc',
      };
    }

    // If clicking a different field, start with ascending order
    return {
      field: newField,
      order: 'asc',
    };
  }
}
