// Advanced Lazy Loading System
class LazyLoadSystem {
    private observers: Map<string, IntersectionObserver> = new Map();
    private loadedModules: Set<string> = new Set();

    constructor() {
        this.init();
    }

    private init(): void {
        // Set up default lazy loading for common components
        this.setupComponentLazyLoading();

        // Observe DOM changes for new lazy-load elements
        this.observeDOMChanges();
    }

    private setupComponentLazyLoading(): void {
        // Lazy load reviews
        this.lazyLoadComponent(
            '#reviews-section',
            () => import('./reviews').then(module => module.loadReviews())
        );

        // Lazy load comments
        this.lazyLoadComponent(
            '#comments-section',
            () => import('./comments').then(module => module.loadComments())
        );

        // Lazy load maps
        this.lazyLoadComponent(
            '#map-section',
            () => import('./map').then(module => module.loadMap())
        );

        // Lazy load charts
        this.lazyLoadComponent(
            '#charts-section',
            () => import('./charts').then(module => module.loadCharts())
        );
    }

    public lazyLoadComponent(
        selector: string,
        loadCallback: () => Promise<void>,
        options?: IntersectionObserverInit
    ): void {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element with selector "${selector}" not found`);
            return;
        }

        // Check if already loaded
        if (this.loadedModules.has(selector)) {
            return;
        }

        // Create observer if not exists
        if (!this.observers.has(selector)) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadComponent(selector, loadCallback);
                        }
                    });
                },
                {
                    rootMargin: '50px',
                    threshold: 0.1,
                    ...options
                }
            );

            this.observers.set(selector, observer);
            observer.observe(element);
        }
    }

    private async loadComponent(
        selector: string,
        loadCallback: () => Promise<void>
    ): Promise<void> {
        // Check if already loading or loaded
        if (this.loadedModules.has(selector)) {
            return;
        }

        // Mark as loading
        this.loadedModules.add(selector);

        try {
            // Show loading indicator
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add('loading');
            }

            // Load the component
            await loadCallback();

            // Remove loading indicator
            if (element) {
                element.classList.remove('loading');
                element.classList.add('loaded');
            }

            // Unobserve after loading
            const observer = this.observers.get(selector);
            if (observer) {
                observer.disconnect();
                this.observers.delete(selector);
            }
        } catch (error) {
            console.error(`Failed to load component for ${selector}:`, error);

            // Remove from loaded set to allow retry
            this.loadedModules.delete(selector);

            // Show error state
            const element = document.querySelector(selector);
            if (element) {
                element.classList.remove('loading');
                element.classList.add('error');
            }
        }
    }

    private observeDOMChanges(): void {
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;

                        // Check for lazy-load attributes
                        if (element.hasAttribute('data-lazy-load')) {
                            const selector = element.getAttribute('data-lazy-load') || `#${element.id}`;
                            const modulePath = element.getAttribute('data-lazy-module');

                            if (modulePath) {
                                this.lazyLoadComponent(
                                    selector,
                                    () => import(/* @vite-ignore */ modulePath).then(module => module.default())
                                );
                            }
                        }
                    }
                });
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    public preloadComponent(modulePath: string): void {
        // Preload component in background
        import(/* @vite-ignore */ modulePath).catch(error => {
            console.error(`Failed to preload component ${modulePath}:`, error);
        });
    }

    public prefetchResource(url: string): void {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    public preloadResource(url: string, as: string = 'script'): void {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = as;
        document.head.appendChild(link);
    }

    public cleanup(): void {
        // Disconnect all observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

// Initialize Lazy Load System
const lazyLoadSystem = new LazyLoadSystem();

export { lazyLoadSystem, LazyLoadSystem };
