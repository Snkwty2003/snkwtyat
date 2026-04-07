// Advanced Push Notifications System
class PushNotificationSystem {
    private subscription: PushSubscription | null = null;
    private isSubscribed: boolean = false;
    private registration: ServiceWorkerRegistration | null = null;

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        // Check if service workers are supported
        if (!('serviceWorker' in navigator)) {
            console.warn('Service workers are not supported');
            return;
        }

        // Check if push notifications are supported
        if (!('PushManager' in window)) {
            console.warn('Push notifications are not supported');
            return;
        }

        try {
            // Register service worker
            this.registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered');

            // Check for existing subscription
            this.subscription = await this.registration.pushManager.getSubscription();
            this.isSubscribed = this.subscription !== null;

            // Update UI based on subscription status
            this.updateSubscriptionUI();
        } catch (error) {
            console.error('Failed to initialize push notifications:', error);
        }
    }

    public async subscribe(): Promise<void> {
        if (!this.registration) {
            console.error('Service worker not registered');
            return;
        }

        try {
            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('Notification permission denied');
                return;
            }

            // Subscribe to push notifications
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    'YOUR_VAPID_PUBLIC_KEY_HERE'
                )
            });

            this.subscription = subscription;
            this.isSubscribed = true;

            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);

            // Update UI
            this.updateSubscriptionUI();

            console.log('Successfully subscribed to push notifications');
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
        }
    }

    public async unsubscribe(): Promise<void> {
        if (!this.subscription) {
            console.warn('No active subscription');
            return;
        }

        try {
            // Unsubscribe
            await this.subscription.unsubscribe();
            this.subscription = null;
            this.isSubscribed = false;

            // Remove subscription from server
            await this.removeSubscriptionFromServer();

            // Update UI
            this.updateSubscriptionUI();

            console.log('Successfully unsubscribed from push notifications');
        } catch (error) {
            console.error('Failed to unsubscribe from push notifications:', error);
        }
    }

    public async sendNotification(
        title: string,
        options: NotificationOptions = {}
    ): Promise<void> {
        if (!this.isSubscribed || !this.registration) {
            console.warn('Not subscribed to push notifications');
            return;
        }

        try {
            // Show notification
            await this.registration.showNotification(title, {
                icon: '/icon-192.png',
                badge: '/badge-72.png',
                vibrate: [200, 100, 200],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: 1
                },
                ...options
            });
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    }

    private async sendSubscriptionToServer(
        subscription: PushSubscription
    ): Promise<void> {
        try {
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            });

            if (!response.ok) {
                throw new Error('Failed to send subscription to server');
            }
        } catch (error) {
            console.error('Failed to send subscription to server:', error);
        }
    }

    private async removeSubscriptionFromServer(): Promise<void> {
        if (!this.subscription) return;

        try {
            const response = await fetch('/api/notifications/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.subscription)
            });

            if (!response.ok) {
                throw new Error('Failed to remove subscription from server');
            }
        } catch (error) {
            console.error('Failed to remove subscription from server:', error);
        }
    }

    private updateSubscriptionUI(): void {
        const subscribeButton = document.getElementById('subscribe-notifications');
        const unsubscribeButton = document.getElementById('unsubscribe-notifications');

        if (subscribeButton && unsubscribeButton) {
            if (this.isSubscribed) {
                subscribeButton.style.display = 'none';
                unsubscribeButton.style.display = 'block';
            } else {
                subscribeButton.style.display = 'block';
                unsubscribeButton.style.display = 'none';
            }
        }
    }

    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    public getSubscriptionStatus(): boolean {
        return this.isSubscribed;
    }
}

// Initialize Push Notification System
const pushNotificationSystem = new PushNotificationSystem();

// Export for use in other modules
export { pushNotificationSystem, PushNotificationSystem };
