// Advanced Search and Filter System with Live Suggestions
class AdvancedSearchSystem {
    private static instance: AdvancedSearchSystem;
    private searchInput: HTMLInputElement | null = null;
    private suggestionsContainer: HTMLElement | null = null;
    private searchHistory: SearchHistoryItem[] = [];
    private popularSearches: string[] = [];
    private debounceTimer: number | null = null;
    private isSearching: boolean = false;
    private maxSuggestions: number = 8;
    private maxHistoryItems: number = 10;
    private searchEndpoint: string = '/api/search';
    private suggestionsEndpoint: string = '/api/search/suggestions';

    private constructor() {
        this.init();
    }

    public static getInstance(): AdvancedSearchSystem {
        if (!AdvancedSearchSystem.instance) {
            AdvancedSearchSystem.instance = new AdvancedSearchSystem();
        }
        return AdvancedSearchSystem.instance;
    }

    private async init(): Promise<void> {
        // Load search history
        this.loadSearchHistory();

        // Load popular searches
        await this.loadPopularSearches();

        // Setup search input
        this.setupSearchInput();

        // Setup keyboard navigation
        this.setupKeyboardNavigation();
    }

    private loadSearchHistory(): void {
        try {
            const history = localStorage.getItem('searchHistory');
            if (history) {
                this.searchHistory = JSON.parse(history);
            }
        } catch (error) {
            console.error('Failed to load search history:', error);
        }
    }

    private saveSearchHistory(): void {
        try {
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    }

    private async loadPopularSearches(): Promise<void> {
        try {
            const response = await fetch('/api/search/popular');
            this.popularSearches = await response.json();
        } catch (error) {
            console.error('Failed to load popular searches:', error);
        }
    }

    public initialize(inputSelector: string, suggestionsSelector: string): void {
        this.searchInput = document.querySelector(inputSelector) as HTMLInputElement;
        this.suggestionsContainer = document.querySelector(suggestionsSelector);

        if (!this.searchInput || !this.suggestionsContainer) {
            console.warn('Search input or suggestions container not found');
            return;
        }

        // Setup event listeners
        this.searchInput.addEventListener('input', (e) => this.handleInput(e));
        this.searchInput.addEventListener('focus', () => this.showSuggestions());
        this.searchInput.addEventListener('blur', () => this.hideSuggestions());

        // Close suggestions on click outside
        document.addEventListener('click', (e) => {
            if (!this.searchInput?.contains(e.target as Node) && 
                !this.suggestionsContainer?.contains(e.target as Node)) {
                this.hideSuggestions();
            }
        });
    }

    private setupSearchInput(): void {
        // Auto-initialize if elements exist
        const searchInput = document.getElementById('searchInput') as HTMLInputElement;
        const suggestionsContainer = document.getElementById('searchSuggestions');

        if (searchInput && suggestionsContainer) {
            this.initialize('#searchInput', '#searchSuggestions');
        }
    }

    private handleInput(e: Event): void {
        const target = e.target as HTMLInputElement;
        const query = target.value.trim();

        // Clear previous timer
        if (this.debounceTimer !== null) {
            clearTimeout(this.debounceTimer);
        }

        if (query.length === 0) {
            this.showDefaultSuggestions();
            return;
        }

        // Debounce search
        this.debounceTimer = window.setTimeout(() => {
            this.fetchSuggestions(query);
        }, 300);
    }

    private async fetchSuggestions(query: string): Promise<void> {
        if (this.isSearching) return;

        this.isSearching = true;
        this.showLoading();

        try {
            const response = await fetch(`${this.suggestionsEndpoint}?q=${encodeURIComponent(query)}`);
            const suggestions = await response.json();

            this.displaySuggestions(suggestions, query);
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
            this.showError();
        } finally {
            this.isSearching = false;
        }
    }

    private displaySuggestions(suggestions: Suggestion[], query: string): void {
        if (!this.suggestionsContainer) return;

        let html = '';

        // Add search history suggestions if available
        if (query.length === 0 && this.searchHistory.length > 0) {
            html += `
                <div class="suggestion-group">
                    <div class="suggestion-group-title">عمليات البحث الأخيرة</div>
                    ${this.searchHistory.slice(0, 5).map(item => `
                        <div class="suggestion-item" data-type="history" data-query="${this.escapeHtml(item.query)}">
                            <i class="fas fa-history"></i>
                            <span>${this.escapeHtml(item.query)}</span>
                            <button class="remove-history" data-query="${this.escapeHtml(item.query)}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Add popular searches if available
        if (query.length === 0 && this.popularSearches.length > 0) {
            html += `
                <div class="suggestion-group">
                    <div class="suggestion-group-title">عمليات البحث الشائعة</div>
                    ${this.popularSearches.slice(0, 5).map(search => `
                        <div class="suggestion-item" data-type="popular" data-query="${this.escapeHtml(search)}">
                            <i class="fas fa-fire"></i>
                            <span>${this.escapeHtml(search)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Add query suggestions
        if (suggestions.length > 0) {
            html += `
                <div class="suggestion-group">
                    <div class="suggestion-group-title">اقتراحات</div>
                    ${suggestions.slice(0, this.maxSuggestions).map(suggestion => `
                        <div class="suggestion-item" data-type="suggestion" data-query="${this.escapeHtml(suggestion.query)}">
                            <i class="fas fa-search"></i>
                            <span>${this.highlightMatch(suggestion.query, query)}</span>
                            ${suggestion.category ? `<span class="suggestion-category">${this.escapeHtml(suggestion.category)}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Add "Search for" option
        if (query.length > 0) {
            html += `
                <div class="suggestion-item search-action" data-type="search" data-query="${this.escapeHtml(query)}">
                    <i class="fas fa-search"></i>
                    <span>ابحث عن "${this.escapeHtml(query)}"</span>
                </div>
            `;
        }

        this.suggestionsContainer.innerHTML = html;
        this.suggestionsContainer.classList.add('show');

        // Add click handlers
        this.setupSuggestionHandlers();
    }

    private setupSuggestionHandlers(): void {
        if (!this.suggestionsContainer) return;

        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const query = target.dataset.query;
                const type = target.dataset.type;

                if (query) {
                    if (type === 'search') {
                        this.performSearch(query);
                    } else {
                        this.selectSuggestion(query);
                    }
                }
            });

            // Handle remove history button
            const removeBtn = item.querySelector('.remove-history');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const query = removeBtn.getAttribute('data-query');
                    if (query) {
                        this.removeFromHistory(query);
                    }
                });
            }
        });
    }

    private highlightMatch(text: string, query: string): string {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\]/g, '\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    private selectSuggestion(query: string): void {
        if (this.searchInput) {
            this.searchInput.value = query;
            this.performSearch(query);
        }
    }

    private performSearch(query: string): void {
        // Add to search history
        this.addToHistory(query);

        // Hide suggestions
        this.hideSuggestions();

        // Trigger search event
        const event = new CustomEvent('search', {
            detail: { query }
        });
        document.dispatchEvent(event);

        // Navigate to search results page
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }

    private addToHistory(query: string): void {
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);

        // Add to beginning
        this.searchHistory.unshift({
            query,
            timestamp: Date.now()
        });

        // Limit history size
        if (this.searchHistory.length > this.maxHistoryItems) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
        }

        this.saveSearchHistory();
    }

    private removeFromHistory(query: string): void {
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        this.saveSearchHistory();
        this.showDefaultSuggestions();
    }

    private showDefaultSuggestions(): void {
        this.displaySuggestions([], '');
    }

    private showLoading(): void {
        if (!this.suggestionsContainer) return;
        this.suggestionsContainer.innerHTML = `
            <div class="suggestion-loading">
                <div class="loading-spinner"></div>
                <span>جاري البحث...</span>
            </div>
        `;
        this.suggestionsContainer.classList.add('show');
    }

    private showError(): void {
        if (!this.suggestionsContainer) return;
        this.suggestionsContainer.innerHTML = `
            <div class="suggestion-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>حدث خطأ أثناء البحث</span>
            </div>
        `;
        this.suggestionsContainer.classList.add('show');
    }

    private showSuggestions(): void {
        if (this.suggestionsContainer) {
            this.suggestionsContainer.classList.add('show');
        }
    }

    private hideSuggestions(): void {
        if (this.suggestionsContainer) {
            this.suggestionsContainer.classList.remove('show');
        }
    }

    private setupKeyboardNavigation(): void {
        if (!this.searchInput) return;

        this.searchInput.addEventListener('keydown', (e) => {
            if (!this.suggestionsContainer) return;

            const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
            const focusedItem = this.suggestionsContainer.querySelector('.suggestion-item.focused');

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (!focusedItem) {
                        items[0]?.classList.add('focused');
                    } else {
                        const next = focusedItem.nextElementSibling as HTMLElement;
                        if (next) {
                            focusedItem.classList.remove('focused');
                            next.classList.add('focused');
                        }
                    }
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    if (focusedItem) {
                        const prev = focusedItem.previousElementSibling as HTMLElement;
                        if (prev) {
                            focusedItem.classList.remove('focused');
                            prev.classList.add('focused');
                        } else {
                            focusedItem.classList.remove('focused');
                            this.searchInput.focus();
                        }
                    }
                    break;

                case 'Enter':
                    e.preventDefault();
                    if (focusedItem) {
                        const query = focusedItem.dataset.query;
                        if (query) {
                            this.selectSuggestion(query);
                        }
                    } else if (this.searchInput.value.trim()) {
                        this.performSearch(this.searchInput.value.trim());
                    }
                    break;

                case 'Escape':
                    this.hideSuggestions();
                    break;
            }
        });
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    public getSearchHistory(): SearchHistoryItem[] {
        return [...this.searchHistory];
    }

    public clearSearchHistory(): void {
        this.searchHistory = [];
        this.saveSearchHistory();
    }

    public destroy(): void {
        if (this.debounceTimer !== null) {
            clearTimeout(this.debounceTimer);
        }
    }
}

// Type definitions
interface Suggestion {
    query: string;
    category?: string;
    type?: 'template' | 'service' | 'blog';
}

interface SearchHistoryItem {
    query: string;
    timestamp: number;
}

// Export singleton instance
export const advancedSearchSystem = AdvancedSearchSystem.getInstance();
export { AdvancedSearchSystem, Suggestion, SearchHistoryItem };
