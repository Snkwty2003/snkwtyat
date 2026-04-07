// Advanced Heatmap Tracking System
class HeatmapTracker {
    private static instance: HeatmapTracker;
    private isTracking: boolean = false;
    private clickData: HeatmapPoint[] = [];
    private scrollData: ScrollData[] = [];
    private mouseData: MouseData[] = [];
    private sessionStartTime: number = Date.now();
    private maxDataPoints: number = 10000;
    private sampleRate: number = 0.1; // Track 10% of mouse movements
    private lastSampleTime: number = 0;
    private reportInterval: number | null = null;
    private reportEndpoint: string = '/api/analytics/heatmap';

    private constructor() {
        this.init();
    }

    public static getInstance(): HeatmapTracker {
        if (!HeatmapTracker.instance) {
            HeatmapTracker.instance = new HeatmapTracker();
        }
        return HeatmapTracker.instance;
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

        // Track clicks
        document.addEventListener('click', this.handleClick.bind(this), true);

        // Track scroll
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });

        // Track mouse movement (sampled)
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });

        // Track page visibility
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Track before unload
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }

    public stopTracking(): void {
        if (!this.isTracking) return;

        this.isTracking = false;

        // Remove event listeners
        document.removeEventListener('click', this.handleClick.bind(this), true);
        window.removeEventListener('scroll', this.handleScroll.bind(this), { passive: true } as any);
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true } as any);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));

        // Send remaining data
        this.sendData();
    }

    private handleClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        const rect = document.body.getBoundingClientRect();

        const point: HeatmapPoint = {
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now(),
            type: 'click',
            element: this.getElementSelector(target),
            pageUrl: window.location.href,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        };

        this.addDataPoint('click', point);
    }

    private handleScroll(): void {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;

        const data: ScrollData = {
            scrollPercent,
            timestamp: Date.now(),
            pageUrl: window.location.href,
            viewportHeight: window.innerHeight
        };

        this.addDataPoint('scroll', data);
    }

    private handleMouseMove(event: MouseEvent): void {
        const now = Date.now();

        // Sample mouse movements
        if (now - this.lastSampleTime < 100) { // Sample every 100ms
            return;
        }

        if (Math.random() > this.sampleRate) {
            return;
        }

        this.lastSampleTime = now;

        const data: MouseData = {
            x: event.clientX,
            y: event.clientY,
            timestamp: now,
            pageUrl: window.location.href,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        };

        this.addDataPoint('mouse', data);
    }

    private handleVisibilityChange(): void {
        if (document.hidden) {
            // Page hidden, send data
            this.sendData();
        }
    }

    private handleBeforeUnload(): void {
        // Send data before page unload
        this.sendData();
    }

    private addDataPoint(type: string, data: any): void {
        // Limit data points
        if (this.clickData.length + this.scrollData.length + this.mouseData.length >= this.maxDataPoints) {
            this.sendData();
        }

        switch (type) {
            case 'click':
                this.clickData.push(data);
                break;
            case 'scroll':
                this.scrollData.push(data);
                break;
            case 'mouse':
                this.mouseData.push(data);
                break;
        }
    }

    private getElementSelector(element: HTMLElement): string {
        if (element.id) {
            return `#${element.id}`;
        }

        if (element.className) {
            return `.${element.className.split(' ').join('.')}`;
        }

        return element.tagName.toLowerCase();
    }

    private setupReporting(): void {
        // Send data every 30 seconds
        this.reportInterval = window.setInterval(() => {
            this.sendData();
        }, 30000);
    }

    private async sendData(): Promise<void> {
        if (this.clickData.length === 0 && 
            this.scrollData.length === 0 && 
            this.mouseData.length === 0) {
            return;
        }

        const data = {
            sessionId: this.getSessionId(),
            pageUrl: window.location.href,
            sessionDuration: Date.now() - this.sessionStartTime,
            clickData: this.clickData,
            scrollData: this.scrollData,
            mouseData: this.mouseData,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
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

            // Clear sent data
            this.clickData = [];
            this.scrollData = [];
            this.mouseData = [];
        } catch (error) {
            console.error('Failed to send heatmap data:', error);
        }
    }

    private getSessionId(): string {
        let sessionId = sessionStorage.getItem('heatmapSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('heatmapSessionId', sessionId);
        }
        return sessionId;
    }

    public setSampleRate(rate: number): void {
        this.sampleRate = Math.max(0, Math.min(1, rate));
    }

    public setMaxDataPoints(max: number): void {
        this.maxDataPoints = max;
    }

    public getData(): {
        clickData: HeatmapPoint[];
        scrollData: ScrollData[];
        mouseData: MouseData[];
    } {
        return {
            clickData: [...this.clickData],
            scrollData: [...this.scrollData],
            mouseData: [...this.mouseData]
        };
    }

    public clearData(): void {
        this.clickData = [];
        this.scrollData = [];
        this.mouseData = [];
    }

    public destroy(): void {
        this.stopTracking();
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
        }
    }
}

// Type definitions
interface HeatmapPoint {
    x: number;
    y: number;
    timestamp: number;
    type: string;
    element: string;
    pageUrl: string;
    viewportWidth: number;
    viewportHeight: number;
}

interface ScrollData {
    scrollPercent: number;
    timestamp: number;
    pageUrl: string;
    viewportHeight: number;
}

interface MouseData {
    x: number;
    y: number;
    timestamp: number;
    pageUrl: string;
    viewportWidth: number;
    viewportHeight: number;
}

// Export singleton instance
export const heatmapTracker = HeatmapTracker.getInstance();
export { HeatmapTracker, HeatmapPoint, ScrollData, MouseData };
