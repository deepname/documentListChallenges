export class NotificationComponent {
  private notificationCount: number = 0;

  render(): string {
    return `
      <div
        id="notification"
        class="notification-container hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-hidden="true"
      >
        <div class="notification-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="notification-badge" id="notificationBadge">0</span>
        </div>
        <span class="notification-text" id="notificationText"></span>
      </div>
    `;
  }

  show(container: HTMLElement, message: string): void {
    this.notificationCount++;

    const notification = container.querySelector('#notification');
    const notificationText = container.querySelector('#notificationText');
    const notificationBadge = container.querySelector('#notificationBadge');

    if (notification && notificationText && notificationBadge) {
      notificationText.textContent = message;
      notificationBadge.textContent = this.notificationCount.toString();
      notificationBadge.setAttribute('aria-hidden', 'true');

      notification.classList.remove('hidden');
      notification.classList.add('show');
      notification.setAttribute('aria-hidden', 'false');

      setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hidden');
        notification.setAttribute('aria-hidden', 'true');
      }, 4000);
    }
  }
}
