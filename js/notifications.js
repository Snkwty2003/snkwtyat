// Advanced Notification System
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 3000;
    }

    createContainer() {
        let container = document.getElementById("notification-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "notification-container";
            container.className = "notification-container";
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = "info", options = {}) {
        const notification = this.createNotification(message, type, options);
        this.addNotification(notification);
        return notification;
    }

    createNotification(message, type, options) {
        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;

        const icon = this.getIcon(type);
        const duration = options.duration || this.defaultDuration;

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${this.sanitize(message)}</div>
                ${options.details ? `<div class="notification-details">${this.sanitize(options.details)}</div>` : ""}
            </div>
            <button class="notification-close" aria-label="إغلاق">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add close button functionality
        const closeBtn = notification.querySelector(".notification-close");
        closeBtn.addEventListener("click", () => this.removeNotification(notification));

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => this.removeNotification(notification), duration);
        }

        return notification;
    }

    addNotification(notification) {
        // Remove oldest if max reached
        if (this.notifications.length >= this.maxNotifications) {
            this.removeNotification(this.notifications[0]);
        }

        this.notifications.push(notification);
        this.container.appendChild(notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add("show");
        });
    }

    removeNotification(notification) {
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }

        notification.classList.remove("show");
        notification.classList.add("hide");

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getIcon(type) {
        const icons = {
            success: "fas fa-check-circle",
            error: "fas fa-exclamation-circle",
            warning: "fas fa-exclamation-triangle",
            info: "fas fa-info-circle"
        };
        return icons[type] || icons.info;
    }

    sanitize(input) {
        if (typeof input !== "string") return input;
        const div = document.createElement("div");
        div.textContent = input;
        return div.innerHTML;
    }

    // Convenience methods
    success(message, options) {
        return this.show(message, "success", options);
    }

    error(message, options) {
        return this.show(message, "error", options);
    }

    warning(message, options) {
        return this.show(message, "warning", options);
    }

    info(message, options) {
        return this.show(message, "info", options);
    }
}

// Initialize notification system
const notifications = new NotificationSystem();

// Replace old toast function
function showToast(message, type = "success") {
    const typeMap = {
        "success": "success",
        "error": "error",
        "warning": "warning",
        "info": "info"
    };
    notifications.show(message, typeMap[type] || "info");
}
