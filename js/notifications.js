// Advanced Notification System
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 3000;
    }

    createContainer() {
        try {
            if (!document || !document.body) {
                console.debug("Document or body not available for notification container");
                return null;
            }
            
            let container = document.getElementById("notification-container");
            if (!container) {
                container = document.createElement("div");
                container.id = "notification-container";
                container.className = "notification-container";
                document.body.appendChild(container);
            }
            return container;
        } catch (error) {
            console.debug("Error creating notification container:", error);
            return null;
        }
    }

    show(message, type = "info", options = {}) {
        try {
            if (!this.container) {
                console.debug("Notification container not available");
                return null;
            }
            
            const notification = this.createNotification(message, type, options);
            if (!notification) {
                console.debug("Failed to create notification");
                return null;
            }
            
            this.addNotification(notification);
            return notification;
        } catch (error) {
            console.debug("Error showing notification:", error);
            return null;
        }
    }

    createNotification(message, type, options) {
        try {
            const notification = document.createElement("div");
            notification.className = `notification notification-${type || "info"}`;

            const icon = this.getIcon(type) || "fas fa-info-circle";
            const duration = options && options.duration ? options.duration : this.defaultDuration;
            const sanitizedMessage = this.sanitize(message) || "";
            const sanitizedDetails = options && options.details ? this.sanitize(options.details) : "";

            notification.innerHTML = `
                <div class="notification-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-message">${sanitizedMessage}</div>
                    ${sanitizedDetails ? `<div class="notification-details">${sanitizedDetails}</div>` : ""}
                </div>
                <button class="notification-close" aria-label="إغلاق">
                    <i class="fas fa-times"></i>
                </button>
            `;

            // Add close button functionality
            const closeBtn = notification.querySelector(".notification-close");
            if (closeBtn) {
                closeBtn.addEventListener("click", () => this.removeNotification(notification));
            }

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => this.removeNotification(notification), duration);
        }

        return notification;
        } catch (error) {
            console.error("Error creating notification:", error);
            return null;
        }
    }

    addNotification(notification) {
        try {
            if (!notification) {
                console.debug("No notification provided to add");
                return;
            }
            
            if (!this.container) {
                console.debug("Notification container not available");
                return;
            }
            
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
        } catch (error) {
            console.error("Notification error:", error);
        }
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
