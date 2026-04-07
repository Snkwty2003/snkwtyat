// Dynamic A/B Testing System
class ABTestingSystem {
    private static instance: ABTestingSystem;
    private activeTests: Map<string, ABTest> = new Map();
    private userVariants: Map<string, string> = new Map();
    private isInitialized: boolean = false;
    private reportEndpoint: string = '/api/analytics/ab-testing';
    private userId: string;

    private constructor() {
        this.userId = this.getUserId();
        this.init();
    }

    public static getInstance(): ABTestingSystem {
        if (!ABTestingSystem.instance) {
            ABTestingSystem.instance = new ABTestingSystem();
        }
        return ABTestingSystem.instance;
    }

    private async init(): Promise<void> {
        if (this.isInitialized) return;

        // Load active tests from server
        await this.loadActiveTests();

        // Load user's assigned variants
        this.loadUserVariants();

        // Apply variants
        this.applyVariants();

        // Setup tracking
        this.setupTracking();

        this.isInitialized = true;
    }

    private getUserId(): string {
        let userId = localStorage.getItem('abTestingUserId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('abTestingUserId', userId);
        }
        return userId;
    }

    private async loadActiveTests(): Promise<void> {
        try {
            const response = await fetch('/api/ab-tests/active');
            const tests: ABTest[] = await response.json();

            tests.forEach(test => {
                this.activeTests.set(test.id, test);
            });
        } catch (error) {
            console.error('Failed to load active A/B tests:', error);
        }
    }

    private loadUserVariants(): void {
        try {
            const variants = localStorage.getItem('abTestingVariants');
            if (variants) {
                this.userVariants = new Map(JSON.parse(variants));
            }
        } catch (error) {
            console.error('Failed to load user variants:', error);
        }
    }

    private saveUserVariants(): void {
        try {
            localStorage.setItem(
                'abTestingVariants',
                JSON.stringify(Array.from(this.userVariants.entries()))
            );
        } catch (error) {
            console.error('Failed to save user variants:', error);
        }
    }

    private applyVariants(): void {
        this.activeTests.forEach((test, testId) => {
            // Get or assign variant for this test
            const variant = this.getVariant(testId);
            if (!variant) return;

            // Apply variant changes
            this.applyVariant(test, variant);
        });
    }

    private getVariant(testId: string): string | null {
        // Check if user already has a variant assigned
        if (this.userVariants.has(testId)) {
            return this.userVariants.get(testId)!;
        }

        // Get test configuration
        const test = this.activeTests.get(testId);
        if (!test) return null;

        // Randomly assign variant based on traffic allocation
        const random = Math.random() * 100;
        let cumulative = 0;

        for (const variant of test.variants) {
            cumulative += variant.trafficPercentage;
            if (random <= cumulative) {
                // Assign variant to user
                this.userVariants.set(testId, variant.id);
                this.saveUserVariants();

                // Track assignment
                this.trackAssignment(testId, variant.id);

                return variant.id;
            }
        }

        return null;
    }

    private applyVariant(test: ABTest, variantId: string): void {
        const variant = test.variants.find(v => v.id === variantId);
        if (!variant) return;

        // Apply CSS changes
        if (variant.changes.css) {
            this.applyCSSChanges(variant.changes.css);
        }

        // Apply content changes
        if (variant.changes.content) {
            this.applyContentChanges(variant.changes.content);
        }

        // Apply JavaScript changes
        if (variant.changes.javascript) {
            this.applyJavaScriptChanges(variant.changes.javascript);
        }
    }

    private applyCSSChanges(cssChanges: CSSChange[]): void {
        cssChanges.forEach(change => {
            const elements = document.querySelectorAll(change.selector);
            elements.forEach(element => {
                Object.assign((element as HTMLElement).style, change.properties);
            });
        });
    }

    private applyContentChanges(contentChanges: ContentChange[]): void {
        contentChanges.forEach(change => {
            const element = document.querySelector(change.selector);
            if (!element) return;

            if (change.type === 'text') {
                element.textContent = change.value;
            } else if (change.type === 'html') {
                element.innerHTML = change.value;
            } else if (change.type === 'attribute') {
                element.setAttribute(change.attribute!, change.value);
            }
        });
    }

    private applyJavaScriptChanges(jsChanges: JSChange[]): void {
        jsChanges.forEach(change => {
            try {
                // Execute JavaScript code
                const func = new Function(change.code);
                func();
            } catch (error) {
                console.error('Failed to execute JavaScript change:', error);
            }
        });
    }

    private setupTracking(): void {
        // Track goal completions
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const testId = target.getAttribute('data-ab-test');
            const goal = target.getAttribute('data-ab-goal');

            if (testId && goal) {
                this.trackGoal(testId, goal);
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target as HTMLFormElement;
            const testId = form.getAttribute('data-ab-test');
            const goal = form.getAttribute('data-ab-goal');

            if (testId && goal) {
                this.trackGoal(testId, goal);
            }
        });
    }

    private trackAssignment(testId: string, variantId: string): void {
        this.sendEvent({
            type: 'assignment',
            testId,
            variantId,
            userId: this.userId,
            timestamp: Date.now()
        });
    }

    private trackGoal(testId: string, goal: string): void {
        const variantId = this.userVariants.get(testId);
        if (!variantId) return;

        this.sendEvent({
            type: 'goal',
            testId,
            variantId,
            goal,
            userId: this.userId,
            timestamp: Date.now()
        });
    }

    private async sendEvent(event: ABTestEvent): Promise<void> {
        try {
            await fetch(this.reportEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event),
                keepalive: true
            });
        } catch (error) {
            console.error('Failed to send A/B test event:', error);
        }
    }

    public getVariantForTest(testId: string): string | null {
        return this.userVariants.get(testId) || null;
    }

    public getAllVariants(): Map<string, string> {
        return new Map(this.userVariants);
    }

    public async createTest(test: ABTest): Promise<void> {
        try {
            await fetch('/api/ab-tests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(test)
            });

            this.activeTests.set(test.id, test);
        } catch (error) {
            console.error('Failed to create A/B test:', error);
        }
    }

    public async endTest(testId: string): Promise<void> {
        try {
            await fetch(`/api/ab-tests/${testId}`, {
                method: 'DELETE'
            });

            this.activeTests.delete(testId);
            this.userVariants.delete(testId);
            this.saveUserVariants();
        } catch (error) {
            console.error('Failed to end A/B test:', error);
        }
    }

    public getActiveTests(): ABTest[] {
        return Array.from(this.activeTests.values());
    }

    public resetUserVariants(): void {
        this.userVariants.clear();
        this.saveUserVariants();
        this.applyVariants();
    }
}

// Type definitions
interface ABTest {
    id: string;
    name: string;
    description: string;
    variants: Variant[];
    startDate: string;
    endDate?: string;
    status: 'active' | 'paused' | 'completed';
}

interface Variant {
    id: string;
    name: string;
    trafficPercentage: number;
    changes: VariantChanges;
}

interface VariantChanges {
    css?: CSSChange[];
    content?: ContentChange[];
    javascript?: JSChange[];
}

interface CSSChange {
    selector: string;
    properties: Record<string, string>;
}

interface ContentChange {
    selector: string;
    type: 'text' | 'html' | 'attribute';
    value: string;
    attribute?: string;
}

interface JSChange {
    code: string;
}

interface ABTestEvent {
    type: 'assignment' | 'goal';
    testId: string;
    variantId: string;
    userId: string;
    timestamp: number;
    goal?: string;
}

// Export singleton instance
export const abTestingSystem = ABTestingSystem.getInstance();
export { ABTestingSystem, ABTest, Variant, VariantChanges, ABTestEvent };
