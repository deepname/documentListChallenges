import { SortField, ViewMode } from '../../models/document';

export class ControlsComponent {
  render(sortField: SortField, viewMode: ViewMode): string {
    return `
      <div class="controls">
        <div class="sort-controls">
          <label>Sort by:</label>
          <select class="sort-dropdown" id="sortDropdown">
            <option value="Title" ${sortField === 'Title' ? 'selected' : ''}>Name</option>
            <option value="Version" ${sortField === 'Version' ? 'selected' : ''}>Version</option>
            <option value="CreatedAt" ${sortField === 'CreatedAt' ? 'selected' : ''}>Date</option>
          </select>
        </div>
        <div class="view-controls">
          <button class="view-btn ${viewMode === 'list' ? 'active' : ''}" data-view="list" title="List view">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
          <button class="view-btn ${viewMode === 'grid' ? 'active' : ''}" data-view="grid" title="Grid view">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  attachListeners(
    container: HTMLElement,
    onSort: (field: SortField) => void,
    onViewModeChange: (mode: ViewMode) => void
  ): () => void {
    const cleanupFunctions: (() => void)[] = [];

    // Sort dropdown listener
    const sortDropdown = container.querySelector('#sortDropdown') as HTMLSelectElement;
    if (sortDropdown) {
      const sortHandler = () => {
        onSort(sortDropdown.value as SortField);
      };
      sortDropdown.addEventListener('change', sortHandler);
      cleanupFunctions.push(() => {
        sortDropdown.removeEventListener('change', sortHandler);
      });
    }

    // View mode buttons listeners
    const viewButtons = container.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      const clickHandler = () => {
        const mode = (btn as HTMLElement).dataset.view as ViewMode;
        onViewModeChange(mode);
      };
      btn.addEventListener('click', clickHandler);
      cleanupFunctions.push(() => {
        btn.removeEventListener('click', clickHandler);
      });
    });

    // Return cleanup function that removes all listeners
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }
}
