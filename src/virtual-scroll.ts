// Advanced Virtual Scrolling System
class VirtualScrollSystem {
    private container: HTMLElement | null = null;
    private viewport: HTMLElement | null = null;
    private content: HTMLElement | null = null;
    private items: any[] = [];
    private itemHeight: number = 50;
    private visibleItems: number = 10;
    private scrollTop: number = 0;
    private startIndex: number = 0;
    private endIndex: number = 0;
    private buffer: number = 5;
    private isInitialized: boolean = false;
    private resizeObserver: ResizeObserver | null = null;
    private itemRenderer: ((item: any, index: number) => HTMLElement) | null = null;

    constructor(options: VirtualScrollOptions = {}) {
        this.itemHeight = options.itemHeight || 50;
        this.visibleItems = options.visibleItems || 10;
        this.buffer = options.buffer || 5;
        this.itemRenderer = options.itemRenderer || null;
    }

    public initialize(containerSelector: string): void {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            console.warn('Virtual scroll container not found');
            return;
        }

        // Create viewport
        this.viewport = document.createElement('div');
        this.viewport.className = 'virtual-scroll-viewport';
        this.viewport.style.overflow = 'auto';
        this.viewport.style.height = '100%';
        this.viewport.style.position = 'relative';

        // Create content
        this.content = document.createElement('div');
        this.content.className = 'virtual-scroll-content';
        this.content.style.position = 'absolute';
        this.content.style.top = '0';
        this.content.style.left = '0';
        this.content.style.right = '0';
        this.content.style.width = '100%';

        this.viewport.appendChild(this.content);
        this.container.appendChild(this.viewport);

        // Setup event listeners
        this.setupEventListeners();

        // Setup resize observer
        this.setupResizeObserver();

        this.isInitialized = true;
    }

    private setupEventListeners(): void {
        if (!this.viewport) return;

        this.viewport.addEventListener('scroll', () => {
            this.handleScroll();
        });

        this.viewport.addEventListener('wheel', (e: WheelEvent) => {
            this.handleWheel(e);
        }, { passive: true });
    }

    private setupResizeObserver(): void {
        if (!this.viewport || !window.ResizeObserver) return;

        this.resizeObserver = new ResizeObserver(() => {
            this.updateVisibleItems();
            this.render();
        });

        this.resizeObserver.observe(this.viewport);
    }

    private handleScroll(): void {
        if (!this.viewport) return;

        this.scrollTop = this.viewport.scrollTop;
        this.updateVisibleItems();
        this.render();
    }

    private handleWheel(e: WheelEvent): void {
        // Smooth scrolling
        if (!this.viewport) return;

        const targetScrollTop = this.scrollTop + e.deltaY;
        const maxScrollTop = this.content!.scrollHeight - this.viewport.clientHeight;

        if (targetScrollTop >= 0 && targetScrollTop <= maxScrollTop) {
            e.preventDefault();
            this.viewport.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
        }
    }

    private updateVisibleItems(): void {
        if (!this.viewport || !this.content) return;

        const viewportHeight = this.viewport.clientHeight;
        this.visibleItems = Math.ceil(viewportHeight / this.itemHeight);

        // Calculate visible range with buffer
        const startScroll = Math.max(0, this.scrollTop - this.buffer * this.itemHeight);
        const endScroll = this.scrollTop + viewportHeight + this.buffer * this.itemHeight;

        this.startIndex = Math.floor(startScroll / this.itemHeight);
        this.endIndex = Math.min(
            Math.ceil(endScroll / this.itemHeight),
            this.items.length
        );
    }

    private render(): void {
        if (!this.content) return;

        // Update content height
        const totalHeight = this.items.length * this.itemHeight;
        this.content.style.height = `${totalHeight}px`;

        // Clear current content
        this.content.innerHTML = '';

        // Render visible items
        for (let i = this.startIndex; i < this.endIndex; i++) {
            const item = this.items[i];
            if (!item) continue;

            const itemElement = this.createItemElement(item, i);
            itemElement.style.position = 'absolute';
            itemElement.style.top = `${i * this.itemHeight}px`;
            itemElement.style.left = '0';
            itemElement.style.right = '0';
            itemElement.style.width = '100%';
            itemElement.style.height = `${this.itemHeight}px`;

            this.content.appendChild(itemElement);
        }
    }

    private createItemElement(item: any, index: number): HTMLElement {
        if (this.itemRenderer) {
            return this.itemRenderer(item, index);
        }

        // Default renderer
        const element = document.createElement('div');
        element.className = 'virtual-scroll-item';
        element.textContent = JSON.stringify(item);
        return element;
    }

    public setItems(items: any[]): void {
        this.items = items;
        this.scrollTop = 0;
        this.updateVisibleItems();
        this.render();
    }

    public appendItems(items: any[]): void {
        this.items = [...this.items, ...items];
        this.updateVisibleItems();
        this.render();
    }

    public prependItems(items: any[]): void {
        this.items = [...items, ...this.items];
        this.scrollTop += items.length * this.itemHeight;
        this.updateVisibleItems();
        this.render();
    }

    public updateItem(index: number, item: any): void {
        if (index >= 0 && index < this.items.length) {
            this.items[index] = item;
            this.render();
        }
    }

    public scrollToIndex(index: number): void {
        if (!this.viewport) return;

        const targetScrollTop = index * this.itemHeight;
        this.viewport.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
        });
    }

    public scrollToTop(): void {
        if (!this.viewport) return;

        this.viewport.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    public scrollToBottom(): void {
        if (!this.viewport || !this.content) return;

        const maxScrollTop = this.content.scrollHeight - this.viewport.clientHeight;
        this.viewport.scrollTo({
            top: maxScrollTop,
            behavior: 'smooth'
        });
    }

    public getItemRenderer(): ((item: any, index: number) => HTMLElement) | null {
        return this.itemRenderer;
    }

    public setItemRenderer(renderer: (item: any, index: number) => HTMLElement): void {
        this.itemRenderer = renderer;
        this.render();
    }

    public getItemHeight(): number {
        return this.itemHeight;
    }

    public setItemHeight(height: number): void {
        this.itemHeight = height;
        this.updateVisibleItems();
        this.render();
    }

    public getVisibleRange(): { start: number; end: number } {
        return {
            start: this.startIndex,
            end: this.endIndex
        };
    }

    public getItems(): any[] {
        return [...this.items];
    }

    public getVisibleItems(): any[] {
        return this.items.slice(this.startIndex, this.endIndex);
    }

    public destroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        if (this.viewport) {
            this.viewport.removeEventListener('scroll', this.handleScroll.bind(this));
            this.viewport.removeEventListener('wheel', this.handleWheel.bind(this) as any);
        }

        this.container?.innerHTML = '';
        this.isInitialized = false;
    }
}

// Type definitions
interface VirtualScrollOptions {
    itemHeight?: number;
    visibleItems?: number;
    buffer?: number;
    itemRenderer?: (item: any, index: number) => HTMLElement;
}

// Export for use in other modules
export { VirtualScrollSystem, VirtualScrollOptions };
