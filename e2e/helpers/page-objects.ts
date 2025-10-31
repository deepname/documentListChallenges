import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Document Manager
 * Encapsulates common selectors and actions following DRY principle
 */
export class DocumentPage {
  readonly page: Page;
  readonly container: Locator;
  readonly header: Locator;
  readonly addButton: Locator;
  readonly listViewButton: Locator;
  readonly gridViewButton: Locator;
  readonly sortTitleButton: Locator;
  readonly sortVersionButton: Locator;
  readonly sortCreatedAtButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('#document-container');
    this.header = page.locator('h1');
    this.addButton = page.locator('#createBtn');
    this.listViewButton = page.locator('[data-view="list"]');
    this.gridViewButton = page.locator('[data-view="grid"]');
    this.sortTitleButton = page.locator('[data-sort="Title"]');
    this.sortVersionButton = page.locator('[data-sort="Version"]');
    this.sortCreatedAtButton = page.locator('[data-sort="CreatedAt"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async waitForLoad() {
    await this.container.waitFor({ state: 'visible' });
  }

  async getDocumentCount(): Promise<number> {
    const listItems = this.page.locator('.list-item, .card');
    return await listItems.count();
  }

  async getDocumentTitles(): Promise<string[]> {
    const titles = await this.page.locator('.doc-name, .card-title').allTextContents();
    return titles;
  }

  async clickAddDocument() {
    await this.addButton.click();
  }

  async switchToGridView() {
    await this.gridViewButton.click();
  }

  async switchToListView() {
    await this.listViewButton.click();
  }

  async sortByTitle() {
    await this.sortTitleButton.click();
  }

  async sortByVersion() {
    await this.sortVersionButton.click();
  }

  async sortByCreatedAt() {
    await this.sortCreatedAtButton.click();
  }

  async isGridViewActive(): Promise<boolean> {
    const container = this.page.locator('.document-container');
    const classes = await container.getAttribute('class');
    return classes?.includes('grid') ?? false;
  }

  async isListViewActive(): Promise<boolean> {
    const container = this.page.locator('.document-container');
    const classes = await container.getAttribute('class');
    return classes?.includes('list') ?? false;
  }
}
