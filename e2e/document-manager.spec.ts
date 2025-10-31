import { test, expect } from '@playwright/test';
import { DocumentPage } from './helpers/page-objects';

test.describe('Document Manager - Basic Functionality', () => {
  let documentPage: DocumentPage;

  test.beforeEach(async ({ page }) => {
    // Arrange - Create page object and navigate
    documentPage = new DocumentPage(page);
    await documentPage.goto();
    await documentPage.waitForLoad();
  });

  test('should load the application successfully', async () => {
    // Arrange - Page already loaded in beforeEach

    // Act - Check if main elements are visible
    const headerVisible = await documentPage.header.isVisible();
    const containerVisible = await documentPage.container.isVisible();

    // Assert
    expect(headerVisible).toBe(true);
    expect(containerVisible).toBe(true);
    await expect(documentPage.header).toHaveText('Documents');
  });

  test('should display the add document button', async () => {
    // Arrange - Page already loaded in beforeEach

    // Act - Check if add button is visible
    const addButtonVisible = await documentPage.addButton.isVisible();

    // Assert
    expect(addButtonVisible).toBe(true);
    await expect(documentPage.addButton).toHaveText('+ Add document');
  });

  test('should display documents in list view by default', async () => {
    // Arrange - Page already loaded in beforeEach

    // Act - Check if list view is active
    const isListView = await documentPage.isListViewActive();

    // Assert
    expect(isListView).toBe(true);
  });

  test('should switch between list and grid views', async () => {
    // Arrange - Page already loaded in list view

    // Act - Switch to grid view
    await documentPage.switchToGridView();
    const isGridView = await documentPage.isGridViewActive();

    // Assert - Grid view is active
    expect(isGridView).toBe(true);

    // Act - Switch back to list view
    await documentPage.switchToListView();
    const isListView = await documentPage.isListViewActive();

    // Assert - List view is active
    expect(isListView).toBe(true);
  });

  test('should display documents when available', async ({ page }) => {
    // Arrange - Page already loaded in beforeEach
    
    // Act - Get document count
    const documentCount = await documentPage.getDocumentCount();

    // Assert - Documents are displayed or empty state is shown
    if (documentCount > 0) {
      expect(documentCount).toBeGreaterThan(0);
      const titles = await documentPage.getDocumentTitles();
      expect(titles.length).toBe(documentCount);
    } else {
      // Empty state
      const emptyState = page.locator('.empty-state');
      await expect(emptyState).toBeVisible();
      await expect(emptyState).toHaveText('No documents yet');
    }
  });

  test('should show modal when add document button is clicked', async ({ page }) => {
    // Arrange - Page already loaded in beforeEach

    // Act - Click add document button
    await documentPage.clickAddDocument();

    // Assert - Modal should be visible
    const modal = page.locator('.modal');
    await expect(modal).toBeVisible();
  });
});
