// Advanced User Flow Tracking System
class UserFlowTracker {
    private static instance: UserFlowTracker;
    private isTracking: boolean = false;
    private flowEvents: FlowEvent[] = [];
    private currentSession: UserSession | null = null;
    private sessionStartTime: number = Date.now();
    private maxEvents: number = 500;
    private reportInterval: number | null = null;
    private reportEndpoint: string = '/api/analytics/user-flow';
    private funnelSteps: FunnelStep[] = [];
    private currentFunnelStep: number = -1;

    private constructor() {
        this.init();
    }

    public static getInstance(): UserFlowTracker {
        if (!UserFlowTracker.instance) {
            UserFlowTracker.instance = new UserFlowTracker();
        }
        return UserFlowTracker.instance;
    }

    private init(): void {
        // Check if tracking is enabled
        if (!this.isTrackingEnabled()) {
            return;
        }

        // Start tracking
        this.startTracking();

        // Setup periodic reporting
        this.setupReporting();

        // Setup default funnel
        this.setupDefaultFunnel();
    }

    private isTrackingEnabled(): boolean {
        // Check user consent
        const consent = localStorage.getItem('analyticsConsent');
        if (consent !== 'granted') {
            return false;
        }

        // Check if in development mode
        if (process.env.NODE_ENV === 'development') {
            return false;
        }

        return true;
    }

    public startTracking(): void {
        if (this.isTracking) return;

        this.isTracking = true;
        this.sessionStartTime = Date.now();

        // Start new session
        this.currentSession = {
            id: this.getSessionId(),
            startTime: this.sessionStartTime,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            initialUrl: window.location.href,
            deviceType: this.getDeviceType(),
            browser: this.getBrowser()
        };

        // Track page view
        this.trackPageView();

        // Track navigation
        this.setupNavigationTracking();

        // Track form interactions
        this.setupFormTracking();

        // Track button clicks
        this.setupButtonTracking();

        // Track before unload
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }

    public stopTracking(): void {
        if (!this.isTracking) return;

        this.isTracking = false;

        // Send remaining data
        this.sendData();

        // Clear interval
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
        }
    }

    private setupNavigationTracking(): void {
        // Track page navigation
        window.addEventListener('popstate', () => {
            this.trackPageView();
        });

        // Intercept pushState and replaceState
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function(...args) {
            originalPushState.apply(this, args);
            window.dispatchEvent(new Event('pushstate'));
        };

        history.replaceState = function(...args) {
            originalReplaceState.apply(this, args);
            window.dispatchEvent(new Event('replacestate'));
        };

        window.addEventListener('pushstate', () => this.trackPageView());
        window.addEventListener('replacestate', () => this.trackPageView());
    }

    private setupFormTracking(): void {
        document.addEventListener('submit', (e) => {
            const form = e.target as HTMLFormElement;
            this.trackFormSubmit(form);
        });

        document.addEventListener('focus', (e) => {
            const target = e.target as HTMLInputElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                this.trackFormFieldFocus(target);
            }
        }, true);
    }

    private setupButtonTracking(): void {
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'BUTTON' || target.closest('button')) {
                this.trackButtonClick(target);
            }
        });
    }

    public trackPageView(): void {
        const event: FlowEvent = {
            type: 'pageview',
            timestamp: Date.now(),
            url: window.location.href,
            title: document.title,
            referrer: document.referrer
        };

        this.addEvent(event);
        this.updateFunnelStep('pageview');
    }

    public trackFormSubmit(form: HTMLFormElement): void {
        const event: FlowEvent = {
            type: 'form_submit',
            timestamp: Date.now(),
            formId: form.id || form.name || 'unknown',
            formAction: form.action,
            formData: this.getFormData(form)
        };

        this.addEvent(event);
        this.updateFunnelStep('form_submit');
    }

    public trackFormFieldFocus(field: HTMLInputElement): void {
        const form = field.form;
        const event: FlowEvent = {
            type: 'form_field_focus',
            timestamp: Date.now(),
            fieldName: field.name || field.id || 'unknown',
            formId: form?.id || form?.name || 'unknown',
            fieldType: field.type
        };

        this.addEvent(event);
    }

    public trackButtonClick(button: HTMLElement): void {
        const event: FlowEvent = {
            type: 'button_click',
            timestamp: Date.now(),
            buttonText: button.textContent?.trim() || '',
            buttonId: button.id || '',
            buttonClass: button.className
        };

        this.addEvent(event);
    }

    public trackCustomEvent(eventName: string, data: any = {}): void {
        const event: FlowEvent = {
            type: 'custom',
            timestamp: Date.now(),
            eventName,
            data
        };

        this.addEvent(event);
    }

    private addEvent(event: FlowEvent): void {
        // Limit events
        if (this.flowEvents.length >= this.maxEvents) {
            this.sendData();
        }

        this.flowEvents.push(event);
    }

    private getFormData(form: HTMLFormElement): any {
        const formData = new FormData(form);
        const data: any = {};

        formData.forEach((value, key) => {
            // Don't include sensitive data
            if (!this.isSensitiveField(key)) {
                data[key] = value;
            }
        });

        return data;
    }

    private isSensitiveField(fieldName: string): boolean {
        const sensitiveFields = ['password', 'creditcard', 'ssn', 'secret'];
        return sensitiveFields.some(field => 
            fieldName.toLowerCase().includes(field)
        );
    }

    private setupDefaultFunnel(): void {
        this.funnelSteps = [
            { name: 'pageview', step: 0 },
            { name: 'engagement', step: 1 },
            { name: 'form_field_focus', step: 2 },
            { name: 'form_submit', step: 3 },
            { name: 'conversion', step: 4 }
        ];
    }

    public setFunnel(steps: FunnelStep[]): void {
        this.funnelSteps = steps;
        this.currentFunnelStep = -1;
    }

    private updateFunnelStep(eventType: string): void {
        const step = this.funnelSteps.find(s => s.name === eventType);
        if (step && step.step > this.currentFunnelStep) {
            this.currentFunnelStep = step.step;

            const event: FlowEvent = {
                type: 'funnel_step',
                timestamp: Date.now(),
                funnelStep: step.step,
                funnelStepName: step.name
            };

            this.addEvent(event);
        }
    }

    private setupReporting(): void {
        // Send data every 60 seconds
        this.reportInterval = window.setInterval(() => {
            this.sendData();
        }, 60000);
    }

    private async sendData(): Promise<void> {
        if (this.flowEvents.length === 0 || !this.currentSession) {
            return;
        }

        const data = {
            session: this.currentSession,
            events: this.flowEvents,
            funnel: {
                steps: this.funnelSteps,
                currentStep: this.currentFunnelStep
            },
            timestamp: new Date().toISOString()
        };

        try {
            await fetch(this.reportEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                keepalive: true
            });

            // Clear sent events
            this.flowEvents = [];
        } catch (error) {
            console.error('Failed to send user flow data:', error);
        }
    }

    private handleBeforeUnload(): void {
        this.sendData();
    }

    private getSessionId(): string {
        let sessionId = sessionStorage.getItem('userFlowSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('userFlowSessionId', sessionId);
        }
        return sessionId;
    }

    private getDeviceType(): string {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    private getBrowser(): string {
        const ua = navigator.userAgent;
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    public getEvents(): FlowEvent[] {
        return [...this.flowEvents];
    }

    public getCurrentFunnelStep(): number {
        return this.currentFunnelStep;
    }

    public clearEvents(): void {
        this.flowEvents = [];
    }

    public destroy(): void {
        this.stopTracking();
    }
}

// Type definitions
interface FlowEvent {
    type: string;
    timestamp: number;
    [key: string]: any;
}

interface UserSession {
    id: string;
    startTime: number;
    referrer: string;
    userAgent: string;
    initialUrl: string;
    deviceType: string;
    browser: string;
}

interface FunnelStep {
    name: string;
    step: number;
}

// Export singleton instance
export const userFlowTracker = UserFlowTracker.getInstance();
export { UserFlowTracker, FlowEvent, UserSession, FunnelStep };
