// Advanced Resource Management System
class ResourceManager {
    private preloadedResources: Set<string> = new Set();
    private prefetchedResources: Set<string> = new Set();
    private criticalResources: Set<string> = new Set();

    constructor() {
        this.init();
    }

    private init(): void {
        // Preload critical resources
        this.preloadCriticalResources();

        // Setup resource hints for navigation
        this.setupNavigationHints();
    }

    private preloadCriticalResources(): void {
        // Define critical CSS and JS files
        const criticalCSS = [
            '/css/variables.css',
            '/css/base.css',
            '/css/components.css',
            '/css/navbar.css',
            '/css/hero.css'
        ];

        const criticalJS = [
            '/js/navbar.js',
            '/js/advanced.js',
            '/js/notifications.js'
        ];

        // Preload critical CSS
        criticalCSS.forEach(url => {
            this.preloadResource(url, 'style');
            this.criticalResources.add(url);
        });

        // Preload critical JS
        criticalJS.forEach(url => {
            this.preloadResource(url, 'script');
            this.criticalResources.add(url);
        });

        // Preload fonts
        this.preloadFont('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
        this.preloadFont('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
    }

    public preloadResource(url: string, as: string = 'script'): void {
        if (this.preloadedResources.has(url)) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = as;

        // Add crossorigin for fonts
        if (as === 'font') {
            link.crossOrigin = 'anonymous';
        }

        document.head.appendChild(link);
        this.preloadedResources.add(url);
    }

    public prefetchResource(url: string): void {
        if (this.prefetchedResources.has(url)) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
        this.prefetchedResources.add(url);
    }

    public preloadFont(url: string): void {
        this.preloadResource(url, 'style');
    }

    public prefetchPage(url: string): void {
        // Prefetch page resources
        this.prefetchResource(url);

        // Prefetch likely resources on the page
        const pageResources = this.getPageResources(url);
        pageResources.forEach(resource => {
            this.prefetchResource(resource);
        });
    }

    private getPageResources(url: string): string[] {
        // Define resources for different pages
        const pageResources: Record<string, string[]> = {
            '/templates': [
                '/js/filters.js',
                '/css/features.css'
            ],
            '/about': [
                '/css/about.css',
                '/css/testimonials.css'
            ],
            '/contact': [
                '/js/form-validator.js',
                '/css/forms.css'
            ]
        };

        // Get resources for the specific page
        const pathname = new URL(url, window.location.origin).pathname;
        return pageResources[pathname] || [];
    }

    private setupNavigationHints(): void {
        // Add prefetch hints for navigation links
        const navLinks = document.querySelectorAll('a[href^="/"]');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            // Prefetch on hover
            link.addEventListener('mouseenter', () => {
                this.prefetchPage(href);
            }, { once: true });

            // Preload on touch start for mobile
            link.addEventListener('touchstart', () => {
                this.prefetchPage(href);
            }, { once: true });
        });
    }

    public preloadImage(url: string): void {
        this.preloadResource(url, 'image');
    }

    public prefetchImages(urls: string[]): void {
        urls.forEach(url => {
            this.prefetchResource(url);
        });
    }

    public preloadImages(urls: string[]): void {
        urls.forEach(url => {
            this.preloadResource(url, 'image');
        });
    }

    public getPreloadedResources(): string[] {
        return Array.from(this.preloadedResources);
    }

    public getPrefetchedResources(): string[] {
        return Array.from(this.prefetchedResources);
    }

    public getCriticalResources(): string[] {
        return Array.from(this.criticalResources);
    }

    public clearCache(): void {
        this.preloadedResources.clear();
        this.prefetchedResources.clear();
    }
}

// Initialize Resource Manager
const resourceManager = new ResourceManager();

export { resourceManager, ResourceManager };
