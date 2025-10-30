import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotificationComponent } from './notificationComponent';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let container: HTMLElement;

  beforeEach(() => {
    component = new NotificationComponent();
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  describe('render', () => {
    it('should render notification container', () => {
      // Arrange & Act
      const html = component.render();

      // Assert
      expect(html).toContain('notification-container');
    });

    it('should render notification with hidden class initially', () => {
      // Arrange & Act
      const html = component.render();

      // Assert
      expect(html).toContain('hidden');
    });

    it('should render notification icon', () => {
      // Arrange & Act
      const html = component.render();

      // Assert
      expect(html).toContain('notification-icon');
      expect(html).toContain('<svg');
    });

    it('should render notification badge', () => {
      // Arrange & Act
      const html = component.render();

      // Assert
      expect(html).toContain('notification-badge');
      expect(html).toContain('notificationBadge');
    });

    it('should render notification text element', () => {
      // Arrange & Act
      const html = component.render();

      // Assert
      expect(html).toContain('notification-text');
      expect(html).toContain('notificationText');
    });

    it('should render badge with initial count of 0', () => {
      // Arrange & Act
      const html = component.render();

      // Assert
      expect(html).toContain('>0<');
    });

    it('should render SVG with proper attributes', () => {
      // Arrange & Act
      const html = component.render();

      // Assert
      expect(html).toContain('viewBox="0 0 24 24"');
      expect(html).toContain('stroke-width="2"');
    });

    it('should render bell icon paths', () => {
      // Arrange & Act
      const html = component.render();

      // Assert
      expect(html).toContain('<path');
      expect(html).toContain('</path>');
    });
  });

  describe('show', () => {
    beforeEach(() => {
      const html = component.render();
      container.innerHTML = html;
    });

    it('should display notification with message', () => {
      // Arrange & Act
      component.show(container, 'Test message');

      // Assert
      const text = container.querySelector('#notificationText');
      expect(text?.textContent).toBe('Test message');
    });

    it('should remove hidden class when showing', () => {
      // Arrange & Act
      component.show(container, 'Test message');

      // Assert
      const notification = container.querySelector('#notification');
      expect(notification?.classList.contains('hidden')).toBe(false);
    });

    it('should add show class when displaying', () => {
      // Arrange & Act
      component.show(container, 'Test message');

      // Assert
      const notification = container.querySelector('#notification');
      expect(notification?.classList.contains('show')).toBe(true);
    });

    it('should increment notification count', () => {
      // Arrange & Act
      component.show(container, 'Message 1');

      // Assert
      const badge = container.querySelector('#notificationBadge');
      expect(badge?.textContent).toBe('1');
    });

    it('should increment count on multiple notifications', () => {
      // Arrange & Act
      component.show(container, 'Message 1');
      component.show(container, 'Message 2');
      component.show(container, 'Message 3');

      // Assert
      const badge = container.querySelector('#notificationBadge');
      expect(badge?.textContent).toBe('3');
    });

    it('should update badge count with each notification', () => {
      // Arrange & Act
      component.show(container, 'Message 1');
      let badge = container.querySelector('#notificationBadge');
      expect(badge?.textContent).toBe('1');

      component.show(container, 'Message 2');
      badge = container.querySelector('#notificationBadge');
      expect(badge?.textContent).toBe('2');

      // Assert
      component.show(container, 'Message 3');
      badge = container.querySelector('#notificationBadge');
      expect(badge?.textContent).toBe('3');
    });

    it('should hide notification after 4 seconds', () => {
      // Arrange & Act
      component.show(container, 'Test message');
      const notification = container.querySelector('#notification');

      expect(notification?.classList.contains('show')).toBe(true);

      vi.advanceTimersByTime(4000);

      // Assert
      expect(notification?.classList.contains('show')).toBe(false);
      expect(notification?.classList.contains('hidden')).toBe(true);
    });

    it('should not hide notification before 4 seconds', () => {
      // Arrange & Act
      component.show(container, 'Test message');
      const notification = container.querySelector('#notification');

      vi.advanceTimersByTime(2000);

      // Assert
      expect(notification?.classList.contains('show')).toBe(true);
      expect(notification?.classList.contains('hidden')).toBe(false);
    });

    it('should handle empty message', () => {
      // Arrange & Act
      component.show(container, '');

      // Assert
      const text = container.querySelector('#notificationText');
      expect(text?.textContent).toBe('');
    });

    it('should handle special characters in message', () => {
      // Arrange & Act
      component.show(container, 'Document & Report (2024)');

      // Assert
      const text = container.querySelector('#notificationText');
      expect(text?.textContent).toBe('Document & Report (2024)');
    });

    it('should handle long messages', () => {
      // Arrange
      const longMessage =
        'This is a very long notification message that contains a lot of text to test how the component handles lengthy messages without breaking or causing layout issues.';

      // Act
      component.show(container, longMessage);

      // Assert
      const text = container.querySelector('#notificationText');
      expect(text?.textContent).toBe(longMessage);
    });

    it('should handle HTML entities in message', () => {
      // Arrange & Act
      component.show(container, '<script>alert("xss")</script>');

      // Assert
      const text = container.querySelector('#notificationText');
      expect(text?.textContent).toBe('<script>alert("xss")</script>');
    });

    it('should not throw when notification elements are missing', () => {
      // Arrange
      const emptyContainer = document.createElement('div');

      // Act & Assert
      expect(() => component.show(emptyContainer, 'Test')).not.toThrow();
    });
  });

  describe('notification lifecycle', () => {
    beforeEach(() => {
      const html = component.render();
      container.innerHTML = html;
    });

    it('should show and hide notification in sequence', () => {
      // Arrange & Act
      component.show(container, 'Message 1');
      const notification = container.querySelector('#notification');

      expect(notification?.classList.contains('show')).toBe(true);

      vi.advanceTimersByTime(4000);

      expect(notification?.classList.contains('hidden')).toBe(true);

      // Act - Show another notification
      component.show(container, 'Message 2');

      // Assert
      expect(notification?.classList.contains('show')).toBe(true);
      expect(notification?.classList.contains('hidden')).toBe(false);
    });

    it('should maintain count across multiple show/hide cycles', () => {
      // Arrange & Act
      component.show(container, 'Message 1');
      vi.advanceTimersByTime(4000);

      component.show(container, 'Message 2');
      vi.advanceTimersByTime(4000);

      component.show(container, 'Message 3');

      // Assert
      const badge = container.querySelector('#notificationBadge');
      expect(badge?.textContent).toBe('3');
    });

    it('should update message on new notification', () => {
      // Arrange & Act
      component.show(container, 'First message');
      let text = container.querySelector('#notificationText');
      expect(text?.textContent).toBe('First message');

      component.show(container, 'Second message');
      text = container.querySelector('#notificationText');

      // Assert
      expect(text?.textContent).toBe('Second message');
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      const html = component.render();
      container.innerHTML = html;
    });

    it('should handle rapid successive notifications', () => {
      // Arrange & Act
      component.show(container, 'Message 1');
      component.show(container, 'Message 2');
      component.show(container, 'Message 3');
      component.show(container, 'Message 4');
      component.show(container, 'Message 5');

      // Assert
      const badge = container.querySelector('#notificationBadge');
      expect(badge?.textContent).toBe('5');
    });

    it('should handle notification with whitespace', () => {
      // Arrange & Act
      component.show(container, '   Spaced message   ');

      // Assert
      const text = container.querySelector('#notificationText');
      expect(text?.textContent).toBe('   Spaced message   ');
    });

    it('should handle notification with newlines', () => {
      // Arrange & Act
      component.show(container, 'Line 1\nLine 2\nLine 3');

      // Assert
      const text = container.querySelector('#notificationText');
      expect(text?.textContent).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should handle very large notification count', () => {
      // Arrange & Act
      for (let i = 0; i < 100; i++) {
        component.show(container, `Message ${i}`);
      }

      // Assert
      const badge = container.querySelector('#notificationBadge');
      expect(badge?.textContent).toBe('100');
    });
  });

  describe('timer management', () => {
    beforeEach(() => {
      const html = component.render();
      container.innerHTML = html;
    });

    it('should set timeout for 4000ms', () => {
      // Arrange
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      // Act
      component.show(container, 'Test');

      // Assert
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 4000);

      setTimeoutSpy.mockRestore();
    });

    it('should only hide after exact timeout duration', () => {
      // Arrange & Act
      component.show(container, 'Test');
      const notification = container.querySelector('#notification');

      vi.advanceTimersByTime(3999);
      expect(notification?.classList.contains('show')).toBe(true);

      vi.advanceTimersByTime(1);

      // Assert
      expect(notification?.classList.contains('hidden')).toBe(true);
    });
  });
});
