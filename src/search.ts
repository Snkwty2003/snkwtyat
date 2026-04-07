// TypeScript Types for Search System
interface SearchResult {
    id: number;
    type: 'template' | 'service' | 'blog';
    title: string;
    category: string;
    price: number | null;
}

interface SearchOptions {
    searchInputId?: string;
    resultsContainerId?: string;
    minChars?: number;
    maxResults?: number;
    debounceTime?: number;
}

// Advanced Search System with TypeScript
class AdvancedSearch {
    private searchInput: HTMLInputElement | null;
    private resultsContainer: HTMLElement | null;
    private searchTerm: string = '';
    private debounceTimer: number | null = null;
    private isSearching: boolean = false;
    private readonly options: Required<SearchOptions>;

    constructor(options: SearchOptions = {}) {
        this.options = {
            searchInputId: 'searchInput',
            resultsContainerId: 'searchResults',
            minChars: 2,
            maxResults: 10,
            debounceTime: 300,
            ...options
        };

        this.searchInput = document.getElementById(this.options.searchInputId) as HTMLInputElement | null;
        this.resultsContainer = document.getElementById(this.options.resultsContainerId);

        this.init();
    }

    private init(): void {
        if (!this.searchInput) {
            console.warn('Search input not found');
            return;
        }

        // Event listeners
        this.searchInput.addEventListener('input', (e) => this.handleInput(e));
        this.searchInput.addEventListener('focus', () => this.showResults());
        this.searchInput.addEventListener('blur', () => this.hideResults());

        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Close results on click outside
        document.addEventListener('click', (e) => {
            if (!this.searchInput?.contains(e.target as Node) && 
                !this.resultsContainer?.contains(e.target as Node)) {
                this.hideResults();
            }
        });

        // Create results container if not exists
        if (!this.resultsContainer) {
            this.resultsContainer = document.createElement('div');
            this.resultsContainer.id = this.options.resultsContainerId;
            this.resultsContainer.className = 'search-results';
            this.searchInput.parentElement?.appendChild(this.resultsContainer);
        }
    }

    private handleInput(e: Event): void {
        const target = e.target as HTMLInputElement;
        const value = target.value.trim();

        // Clear previous timer
        if (this.debounceTimer !== null) {
            clearTimeout(this.debounceTimer);
        }

        if (value.length < this.options.minChars) {
            this.hideResults();
            return;
        }

        // Debounce search
        this.debounceTimer = window.setTimeout(() => {
            this.search(value);
        }, this.options.debounceTime);
    }

    private async search(term: string): Promise<void> {
        if (this.isSearching) return;

        this.isSearching = true;
        this.searchTerm = term;
        this.showLoading();

        try {
            // Simulate API call - replace with actual API call
            const results = await this.fetchResults(term);
            this.displayResults(results);
        } catch (error) {
            console.error('Search error:', error);
            this.showError();
        } finally {
            this.isSearching = false;
        }
    }

    private async fetchResults(term: string): Promise<SearchResult[]> {
        // Simulate API response - replace with actual API call
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock results - replace with actual data
                const mockResults: SearchResult[] = [
                    { id: 1, type: 'template', title: 'قالب صفحة هبوط احترافي', category: 'Landing Page', price: 29.99 },
                    { id: 2, type: 'template', title: 'قالب متجر إلكتروني', category: 'E-commerce', price: 49.99 },
                    { id: 3, type: 'service', title: 'تصميم مخصص', category: 'خدمات', price: 199.99 },
                    { id: 4, type: 'blog', title: 'كيف تبدأ مشروعك', category: 'مقالات', price: null },
                    { id: 5, type: 'template', title: 'قالب شركة', category: 'Corporate', price: 39.99 }
                ];

                // Filter results based on search term
                const filtered = mockResults.filter(item =>
                    item.title.toLowerCase().includes(term.toLowerCase()) ||
                    item.category.toLowerCase().includes(term.toLowerCase())
                );

                resolve(filtered.slice(0, this.options.maxResults));
            }, 300);
        });
    }

    private displayResults(results: SearchResult[]): void {
        if (results.length === 0) {
            this.showNoResults();
            return;
        }

        const html = results.map(result => this.createResultHTML(result)).join('');
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = html;
            this.resultsContainer.classList.add('show');
        }
    }

    private createResultHTML(result: SearchResult): string {
        const typeIcon = this.getTypeIcon(result.type);
        const price = result.price ? `$${result.price}` : 'مجاني';

        return `
            <div class="search-result" data-id="${result.id}">
                <div class="result-icon">
                    <i class="${typeIcon}"></i>
                </div>
                <div class="result-content">
                    <div class="result-title">${this.escapeHtml(result.title)}</div>
                    <div class="result-meta">
                        <span class="result-category">${this.escapeHtml(result.category)}</span>
                        <span class="result-price">${price}</span>
                    </div>
                </div>
                <div class="result-action">
                    <i class="fas fa-arrow-left"></i>
                </div>
            </div>
        `;
    }

    private getTypeIcon(type: string): string {
        const icons: Record<string, string> = {
            template: 'fas fa-palette',
            service: 'fas fa-cogs',
            blog: 'fas fa-newspaper'
        };
        return icons[type] || 'fas fa-file';
    }

    private showLoading(): void {
        if (!this.resultsContainer) return;
        this.resultsContainer.innerHTML = `
            <div class="search-loading">
                <div class="loading-spinner"></div>
                <span>جاري البحث...</span>
            </div>
        `;
        this.resultsContainer.classList.add('show');
    }

    private showError(): void {
        if (!this.resultsContainer) return;
        this.resultsContainer.innerHTML = `
            <div class="search-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>حدث خطأ أثناء البحث</span>
            </div>
        `;
        this.resultsContainer.classList.add('show');
    }

    private showNoResults(): void {
        if (!this.resultsContainer) return;
        this.resultsContainer.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <span>لا توجد نتائج</span>
            </div>
        `;
        this.resultsContainer.classList.add('show');
    }

    private showResults(): void {
        if (this.searchTerm && this.searchTerm.length >= this.options.minChars && this.resultsContainer) {
            this.resultsContainer.classList.add('show');
        }
    }

    private hideResults(): void {
        this.resultsContainer?.classList.remove('show');
    }

    private handleKeyboard(e: KeyboardEvent): void {
        if (!this.resultsContainer) return;

        const results = this.resultsContainer.querySelectorAll('.search-result');
        const focusedResult = this.resultsContainer.querySelector('.search-result.focused') as HTMLElement | null;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!focusedResult) {
                    results[0]?.classList.add('focused');
                } else {
                    const next = focusedResult.nextElementSibling as HTMLElement | null;
                    if (next) {
                        focusedResult.classList.remove('focused');
                        next.classList.add('focused');
                    }
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                if (focusedResult) {
                    const prev = focusedResult.previousElementSibling as HTMLElement | null;
                    if (prev) {
                        focusedResult.classList.remove('focused');
                        prev.classList.add('focused');
                    } else {
                        focusedResult.classList.remove('focused');
                        this.searchInput?.focus();
                    }
                }
                break;

            case 'Enter':
                e.preventDefault();
                if (focusedResult) {
                    this.selectResult(focusedResult);
                } else if (this.searchTerm) {
                    this.performSearch();
                }
                break;

            case 'Escape':
                this.hideResults();
                break;
        }
    }

    private selectResult(result: HTMLElement): void {
        const id = result.dataset.id;
        // Handle result selection - navigate to result page
        console.log('Selected result:', id);
        this.hideResults();
    }

    private performSearch(): void {
        // Perform full search - navigate to search results page
        console.log('Performing search for:', this.searchTerm);
        this.hideResults();
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize search system
document.addEventListener('DOMContentLoaded', () => {
    const searchSystem = new AdvancedSearch({
        searchInputId: 'searchInput',
        resultsContainerId: 'searchResults'
    });
});

export { AdvancedSearch, SearchResult, SearchOptions };
