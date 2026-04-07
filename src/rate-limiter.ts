// Advanced Rate Limiting System for Forms
class RateLimiter {
    private static instance: RateLimiter;
    private limits: Map<string, RateLimitConfig> = new Map();
    private attempts: Map<string, AttemptRecord[]> = new Map();
    private blockedIPs: Set<string> = new Set();
    private cleanupInterval: number | null = null;

    private constructor() {
        this.init();
    }

    public static getInstance(): RateLimiter {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter();
        }
        return RateLimiter.instance;
    }

    private init(): void {
        // Setup default limits
        this.setupDefaultLimits();

        // Load blocked IPs from localStorage
        this.loadBlockedIPs();

        // Setup cleanup interval
        this.setupCleanup();
    }

    private setupDefaultLimits(): void {
        // Contact form: 5 submissions per hour
        this.setLimit('contact', {
            maxAttempts: 5,
            windowMs: 60 * 60 * 1000, // 1 hour
            blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Registration form: 3 attempts per hour
        this.setLimit('register', {
            maxAttempts: 3,
            windowMs: 60 * 60 * 1000, // 1 hour
            blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Login form: 5 attempts per 15 minutes
        this.setLimit('login', {
            maxAttempts: 5,
            windowMs: 15 * 60 * 1000, // 15 minutes
            blockDurationMs: 60 * 60 * 1000 // 1 hour
        });

        // Search: 30 requests per minute
        this.setLimit('search', {
            maxAttempts: 30,
            windowMs: 60 * 1000, // 1 minute
            blockDurationMs: 5 * 60 * 1000 // 5 minutes
        });
    }

    public setLimit(identifier: string, config: RateLimitConfig): void {
        this.limits.set(identifier, config);
    }

    public async checkRateLimit(
        identifier: string,
        ip?: string
    ): Promise<RateLimitResult> {
        // Check if IP is blocked
        if (ip && this.blockedIPs.has(ip)) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: this.getBlockedUntil(ip),
                reason: 'IP blocked'
            };
        }

        const config = this.limits.get(identifier);
        if (!config) {
            // No limit configured, allow
            return { allowed: true, remaining: Infinity };
        }

        const key = `${identifier}:${ip || 'anonymous'}`;
        const now = Date.now();

        // Get existing attempts
        let attempts = this.attempts.get(key) || [];

        // Filter out old attempts
        attempts = attempts.filter(
            attempt => now - attempt.timestamp < config.windowMs
        );

        // Check if limit exceeded
        if (attempts.length >= config.maxAttempts) {
            // Block IP if configured
            if (ip && config.blockDurationMs) {
                this.blockIP(ip, config.blockDurationMs);
            }

            return {
                allowed: false,
                remaining: 0,
                resetTime: attempts[0].timestamp + config.windowMs,
                reason: 'Rate limit exceeded'
            };
        }

        // Record new attempt
        attempts.push({ timestamp: now });
        this.attempts.set(key, attempts);

        // Calculate remaining attempts
        const remaining = config.maxAttempts - attempts.length;

        return {
            allowed: true,
            remaining,
            resetTime: now + config.windowMs
        };
    }

    private blockIP(ip: string, durationMs: number): void {
        this.blockedIPs.add(ip);

        // Save to localStorage
        this.saveBlockedIPs();

        // Unblock after duration
        setTimeout(() => {
            this.blockedIPs.delete(ip);
            this.saveBlockedIPs();
        }, durationMs);
    }

    private getBlockedUntil(ip: string): number {
        const blockedAt = localStorage.getItem(`blocked_${ip}`);
        if (blockedAt) {
            const blockedUntil = parseInt(blockedAt);
            if (blockedUntil > Date.now()) {
                return blockedUntil;
            } else {
                this.blockedIPs.delete(ip);
                localStorage.removeItem(`blocked_${ip}`);
            }
        }
        return 0;
    }

    private loadBlockedIPs(): void {
        try {
            const blocked = localStorage.getItem('blockedIPs');
            if (blocked) {
                const blockedList = JSON.parse(blocked);
                const now = Date.now();

                // Filter out expired blocks
                blockedList.forEach((ip: string) => {
                    const blockedUntil = this.getBlockedUntil(ip);
                    if (blockedUntil > now) {
                        this.blockedIPs.add(ip);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load blocked IPs:', error);
        }
    }

    private saveBlockedIPs(): void {
        try {
            localStorage.setItem(
                'blockedIPs',
                JSON.stringify(Array.from(this.blockedIPs))
            );
        } catch (error) {
            console.error('Failed to save blocked IPs:', error);
        }
    }

    private setupCleanup(): void {
        // Clean up old attempts every hour
        this.cleanupInterval = window.setInterval(() => {
            this.cleanupOldAttempts();
        }, 60 * 60 * 1000);
    }

    private cleanupOldAttempts(): void {
        const now = Date.now();

        this.attempts.forEach((attempts, key) => {
            const config = this.limits.get(key.split(':')[0]);
            if (!config) return;

            // Filter out old attempts
            const filteredAttempts = attempts.filter(
                attempt => now - attempt.timestamp < config.windowMs
            );

            // Remove entry if no recent attempts
            if (filteredAttempts.length === 0) {
                this.attempts.delete(key);
            } else {
                this.attempts.set(key, filteredAttempts);
            }
        });
    }

    public clearAttempts(identifier: string, ip?: string): void {
        const key = `${identifier}:${ip || 'anonymous'}`;
        this.attempts.delete(key);
    }

    public unblockIP(ip: string): void {
        this.blockedIPs.delete(ip);
        localStorage.removeItem(`blocked_${ip}`);
        this.saveBlockedIPs();
    }

    public getBlockedIPs(): string[] {
        return Array.from(this.blockedIPs);
    }

    public destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}

// Type definitions
interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number;
    blockDurationMs?: number;
}

interface AttemptRecord {
    timestamp: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime?: number;
    reason?: string;
}

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance();
export { RateLimiter, RateLimitConfig, RateLimitResult };
