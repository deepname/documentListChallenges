import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ControlsComponent } from './controlsComponent';

describe('ControlsComponent', () => {
  let component: ControlsComponent;
  let container: HTMLElement;

  beforeEach(() => {
    component = new ControlsComponent();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('render', () => {
    it('should render controls container', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).toContain('controls');
    });

    it('should render sort controls section', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).toContain('sort-controls');
      expect(html).toContain('Sort by:');
    });

    it('should render view controls section', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).toContain('view-controls');
    });

    it('should render sort dropdown', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).toContain('sort-dropdown');
      expect(html).toContain('sortDropdown');
    });

    it('should render view buttons', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).toContain('view-btn');
      expect(html).toContain('data-view="list"');
      expect(html).toContain('data-view="grid"');
    });
  });

  describe('sort field selection', () => {
    it('should select Title option when sortField is Title', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).toContain('<option value="Title" selected>Name</option>');
    });

    it('should select Version option when sortField is Version', () => {
      // Arrange & Act
      const html = component.render('Version', 'list');

      // Assert
      expect(html).toContain('<option value="Version" selected>Version</option>');
    });

    it('should select CreatedAt option when sortField is CreatedAt', () => {
      // Arrange & Act
      const html = component.render('CreatedAt', 'list');

      // Assert
      expect(html).toContain('<option value="CreatedAt" selected>Date</option>');
    });

    it('should not select other options when Title is selected', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).not.toContain('<option value="Version" selected>');
      expect(html).not.toContain('<option value="CreatedAt" selected>');
    });

    it('should render all sort options', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).toContain('Name');
      expect(html).toContain('Version');
      expect(html).toContain('Date');
    });
  });

  describe('view mode selection', () => {
    it('should mark list button as active when viewMode is list', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).toContain('view-btn active" data-view="list"');
    });

    it('should mark grid button as active when viewMode is grid', () => {
      // Arrange & Act
      const html = component.render('Title', 'grid');

      // Assert
      expect(html).toContain('view-btn active" data-view="grid"');
    });

    it('should not mark list button as active when viewMode is grid', () => {
      // Arrange & Act
      const html = component.render('Title', 'grid');

      // Assert
      expect(html).not.toContain('view-btn active" data-view="list"');
    });

    it('should not mark grid button as active when viewMode is list', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).not.toContain('view-btn active" data-view="grid"');
    });

    it('should render both view buttons', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      const viewBtnCount = (html.match(/view-btn/g) || []).length;
      expect(viewBtnCount).toBe(2);
    });
  });

  describe('SVG icons', () => {
    it('should render SVG for list view button', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).toContain('<svg');
      expect(html).toContain('</svg>');
    });

    it('should render list view icon with lines', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).toContain('<line');
    });

    it('should render grid view icon with rectangles', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).toContain('<rect');
    });

    it('should have proper SVG attributes', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).toContain('width="20"');
      expect(html).toContain('height="20"');
      expect(html).toContain('viewBox="0 0 24 24"');
    });
  });

  describe('attachListeners', () => {
    it('should attach sort dropdown listener', () => {
      // Arrange
      const html = component.render('Title', 'list');
      container.innerHTML = html;
      const onSort = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      component.attachListeners(container, onSort, onViewModeChange);
      const dropdown = container.querySelector('#sortDropdown') as HTMLSelectElement;
      dropdown?.dispatchEvent(new Event('change'));

      // Assert
      expect(onSort).toHaveBeenCalled();
    });

    it('should pass correct sort field to callback', () => {
      // Arrange
      const html = component.render('Title', 'list');
      container.innerHTML = html;
      const onSort = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      component.attachListeners(container, onSort, onViewModeChange);
      const dropdown = container.querySelector('#sortDropdown') as HTMLSelectElement;
      dropdown.value = 'Version';
      dropdown.dispatchEvent(new Event('change'));

      // Assert
      expect(onSort).toHaveBeenCalledWith('Version');
    });

    it('should attach list view button listener', () => {
      // Arrange
      const html = component.render('Title', 'list');
      container.innerHTML = html;
      const onSort = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      component.attachListeners(container, onSort, onViewModeChange);
      const listBtn = container.querySelector('[data-view="list"]') as HTMLElement;
      listBtn?.click();

      // Assert
      expect(onViewModeChange).toHaveBeenCalled();
    });

    it('should attach grid view button listener', () => {
      // Arrange
      const html = component.render('Title', 'list');
      container.innerHTML = html;
      const onSort = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      component.attachListeners(container, onSort, onViewModeChange);
      const gridBtn = container.querySelector('[data-view="grid"]') as HTMLElement;
      gridBtn?.click();

      // Assert
      expect(onViewModeChange).toHaveBeenCalled();
    });

    it('should pass correct view mode to callback', () => {
      // Arrange
      const html = component.render('Title', 'list');
      container.innerHTML = html;
      const onSort = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      component.attachListeners(container, onSort, onViewModeChange);
      const gridBtn = container.querySelector('[data-view="grid"]') as HTMLElement;
      gridBtn?.click();

      // Assert
      expect(onViewModeChange).toHaveBeenCalledWith('grid');
    });

    it('should handle multiple sort changes', () => {
      // Arrange
      const html = component.render('Title', 'list');
      container.innerHTML = html;
      const onSort = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      component.attachListeners(container, onSort, onViewModeChange);
      const dropdown = container.querySelector('#sortDropdown') as HTMLSelectElement;
      dropdown.value = 'Version';
      dropdown.dispatchEvent(new Event('change'));
      dropdown.value = 'CreatedAt';
      dropdown.dispatchEvent(new Event('change'));

      // Assert
      expect(onSort).toHaveBeenCalledTimes(2);
      expect(onSort).toHaveBeenNthCalledWith(1, 'Version');
      expect(onSort).toHaveBeenNthCalledWith(2, 'CreatedAt');
    });

    it('should handle multiple view mode changes', () => {
      // Arrange
      const html = component.render('Title', 'list');
      container.innerHTML = html;
      const onSort = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      component.attachListeners(container, onSort, onViewModeChange);
      const listBtn = container.querySelector('[data-view="list"]') as HTMLElement;
      const gridBtn = container.querySelector('[data-view="grid"]') as HTMLElement;
      listBtn?.click();
      gridBtn?.click();
      listBtn?.click();

      // Assert
      expect(onViewModeChange).toHaveBeenCalledTimes(3);
      expect(onViewModeChange).toHaveBeenNthCalledWith(1, 'list');
      expect(onViewModeChange).toHaveBeenNthCalledWith(2, 'grid');
      expect(onViewModeChange).toHaveBeenNthCalledWith(3, 'list');
    });

    it('should handle invalid sort field', () => {
      // Arrange
      const html = component.render('Title', 'list');
      container.innerHTML = html;
      const onSort = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      component.attachListeners(container, onSort, onViewModeChange);
      const dropdown = container.querySelector('#sortDropdown') as HTMLSelectElement;
      dropdown.value = 'Invalid';
      dropdown.dispatchEvent(new Event('change'));

      // Assert
      expect(onSort).toHaveBeenCalled();
    });

    it('should handle invalid view mode', () => {
      // Arrange
      const html = component.render('Title', 'list');
      container.innerHTML = html;
      const onSort = vi.fn();
      const onViewModeChange = vi.fn();

      // Act
      component.attachListeners(container, onSort, onViewModeChange);
      const invalidBtn = container.querySelector('[data-view="invalid"]') as HTMLElement;
      invalidBtn?.click();

      // Assert
      expect(onViewModeChange).not.toHaveBeenCalled();
    });
  });

  describe('button titles', () => {
    it('should have list view button title', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).toContain('title="List view"');
    });

    it('should have grid view button title', () => {
      // Arrange & Act
      const html = component.render('Title', 'list');

      // Assert
      expect(html).toContain('title="Grid view"');
    });
  });

  describe('edge cases', () => {
    it('should handle missing container gracefully', () => {
      // Arrange
      const emptyContainer = document.createElement('div');

      // Act & Assert
      expect(() => component.attachListeners(emptyContainer, vi.fn(), vi.fn())).not.toThrow();
    });
  });
});
