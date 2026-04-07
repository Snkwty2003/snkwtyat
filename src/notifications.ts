// TypeScript Types for Notification System
interface NotificationOptions {
    duration?: number;
    details?: string;
}

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    options: NotificationOptions;
    element: HTMLElement;
}

// Advanced Notification System with TypeScript
class NotificationSystem {
    private container: HTMLElement;
    private notifications: Notification[] = [];
    private maxNotifications: number = 5;
    private defaultDuration: number = 3000;
    private notificationIdCounter: number = 0;

    constructor() {
        this.container = this.createContainer();
    }

    private createContainer(): HTMLElement {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    }

    public show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', options: NotificationOptions = {}): Notification {
        const notification = this.createNotification(message, type, options);
        this.addNotification(notification);
        return notification;
    }

    private createNotification(message: string, type: 'success' | 'error' | 'warning' | 'info', options: NotificationOptions): Notification {
        const id = `notification-${this.notificationIdCounter++}`;
        const element = document.createElement('div');
        element.className = `notification notification-${type}`;
        element.id = id;

        const icon = this.getIcon(type);
        const duration = options.duration || this.defaultDuration;

        element.innerHTML = `
            <div class="notification-icon">
                <i class="${icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${this.sanitize(message)}</div>
                ${options.details ? `<div class="notification-details">${this.sanitize(options.details)}</div>` : ''}
            </div>
            <button class="notification-close" aria-label="إغلاق">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add close button functionality
        const closeBtn = element.querySelector('.notification-close') as HTMLElement;
        closeBtn.addEventListener('click', () => this.removeNotification(id));

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => this.removeNotification(id), duration);
        }

        return {
            id,
            type,
            message,
            options,
            element
        };
    }

    private addNotification(notification: Notification): void {
        // Remove oldest if max reached
        if (this.notifications.length >= this.maxNotifications) {
            this.removeNotification(this.notifications[0].id);
        }

        this.notifications.push(notification);
        this.container.appendChild(notification.element);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.element.classList.add('show');
        });
    }

    public removeNotification(id: string): void {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index === -1) return;

        const notification = this.notifications[index];
        this.notifications.splice(index, 1);

        notification.element.classList.remove('show');
        notification.element.classList.add('hide');

        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
        }, 300);
    }

    private getIcon(type: 'success' | 'error' | 'warning' | 'info'): string {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    private sanitize(input: string): string {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Convenience methods
    public success(message: string, options?: NotificationOptions): Notification {
        return this.show(message, 'success', options);
    }

    public error(message: string, options?: NotificationOptions): Notification {
        return this.show(message, 'error', options);
    }

    public warning(message: string, options?: NotificationOptions): Notification {
        return this.show(message, 'warning', options);
    }

    public info(message: string, options?: NotificationOptions): Notification {
        return this.show(message, 'info', options);
    }
}

// Initialize notification system
const notifications = new NotificationSystem();

// Export for use in other modules
export { notifications, NotificationSystem, Notification, NotificationOptions };
