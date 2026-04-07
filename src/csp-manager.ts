// Dynamic Content Security Policy Manager
class CSPManager {
    private static instance: CSPManager;
    private defaultDirectives: CSPDirectives;
    private nonce: string;
    private reportEndpoint: string;

    private constructor() {
        this.nonce = this.generateNonce();
        this.reportEndpoint = '/api/csp-report';

        this.defaultDirectives = {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'nonce-" + this.nonce + "'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'img-src': ["'self'", 'data:', 'https:'],
            'font-src': ["'self'", 'https://fonts.gstatic.com'],
            'connect-src': ["'self'"],
            'media-src': ["'self'"],
            'object-src': ["'none'"],
            'frame-src': ["'none'"],
            'base-uri': ["'self'"],
            'form-action': ["'self'"],
            'frame-ancestors': ["'none'"],
            'report-uri': [this.reportEndpoint],
            'report-to': ['csp-endpoint']
        };

        this.init();
    }

    public static getInstance(): CSPManager {
        if (!CSPManager.instance) {
            CSPManager.instance = new CSPManager();
        }
        return CSPManager.instance;
    }

    private init(): void {
        // Apply default CSP
        this.applyCSP(this.defaultDirectives);

        // Setup CSP violation reporting
        this.setupReporting();

        // Add nonce to inline scripts
        this.addNonceToScripts();
    }

    private generateNonce(): string {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    public getNonce(): string {
        return this.nonce;
    }

    public applyCSP(directives: CSPDirectives): void {
        const policy = this.buildPolicy(directives);

        // Set CSP meta tag
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = policy;
        document.head.appendChild(meta);

        // Also set Report-Only for monitoring
        const metaReportOnly = document.createElement('meta');
        metaReportOnly.httpEquiv = 'Content-Security-Policy-Report-Only';
        metaReportOnly.content = policy;
        document.head.appendChild(metaReportOnly);
    }

    private buildPolicy(directives: CSPDirectives): string {
        return Object.entries(directives)
            .map(([directive, sources]) => {
                return `${directive} ${sources.join(' ')}`;
            })
            .join('; ');
    }

    public updateDirective(directive: string, sources: string[]): void {
        this.defaultDirectives[directive] = sources;
        this.applyCSP(this.defaultDirectives);
    }

    public addSource(directive: string, source: string): void {
        if (!this.defaultDirectives[directive]) {
            this.defaultDirectives[directive] = [];
        }
        this.defaultDirectives[directive].push(source);
        this.applyCSP(this.defaultDirectives);
    }

    public removeSource(directive: string, source: string): void {
        if (this.defaultDirectives[directive]) {
            this.defaultDirectives[directive] = this.defaultDirectives[directive].filter(
                s => s !== source
            );
            this.applyCSP(this.defaultDirectives);
        }
    }

    private addNonceToScripts(): void {
        const scripts = document.querySelectorAll('script[nonce]');
        scripts.forEach(script => {
            script.setAttribute('nonce', this.nonce);
        });
    }

    private setupReporting(): void {
        // Listen for CSP violations
        document.addEventListener('securitypolicyviolation', (event) => {
            this.handleViolation(event);
        });

        // Setup Reporting API
        if ('ReportingObserver' in window) {
            const observer = new ReportingObserver((reports) => {
                reports.forEach(report => {
                    this.handleReport(report);
                });
            }, { buffered: true });

            observer.observe();
        }
    }

    private handleViolation(event: SecurityPolicyViolationEvent): void {
        const violation = {
            blockedURI: event.blockedURI,
            columnNumber: event.columnNumber,
            documentURI: event.documentURI,
            effectiveDirective: event.effectiveDirective,
            lineNumber: event.lineNumber,
            originalPolicy: event.originalPolicy,
            referrer: event.referrer,
            sample: event.sample,
            sourceFile: event.sourceFile,
            statusCode: event.statusCode,
            violatedDirective: event.violatedDirective
        };

        // Log violation
        console.warn('CSP Violation:', violation);

        // Send to server
        this.sendReport(violation);
    }

    private handleReport(report: Report): void {
        if (report.type === 'csp-violation') {
            console.warn('CSP Report:', report.body);
            this.sendReport(report.body);
        }
    }

    private async sendReport(data: any): Promise<void> {
        try {
            await fetch(this.reportEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'csp-violation',
                    data,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                })
            });
        } catch (error) {
            console.error('Failed to send CSP report:', error);
        }
    }

    public addTrustedDomain(domain: string): void {
        // Add to script-src
        this.addSource('script-src', domain);

        // Add to connect-src
        this.addSource('connect-src', domain);

        // Add to img-src
        this.addSource('img-src', domain);
    }

    public removeTrustedDomain(domain: string): void {
        // Remove from all directives
        ['script-src', 'connect-src', 'img-src'].forEach(directive => {
            this.removeSource(directive, domain);
        });
    }

    public getCurrentPolicy(): string {
        return this.buildPolicy(this.defaultDirectives);
    }

    public getDirectives(): CSPDirectives {
        return { ...this.defaultDirectives };
    }
}

// Type definitions
interface CSPDirectives {
    [directive: string]: string[];
}

// Export singleton instance
export const cspManager = CSPManager.getInstance();
export { CSPManager, CSPDirectives };
