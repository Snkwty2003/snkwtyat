// Intelligent Recommendation System
class RecommendationSystem {
    private userHistory: Map<string, any[]> = new Map();
    private userPreferences: Map<string, any> = new Map();
    private popularItems: any[] = [];
    private maxHistorySize: number = 100;

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        // Load user history from localStorage
        this.loadUserHistory();

        // Load popular items
        await this.loadPopularItems();

        // Setup event listeners for tracking
        this.setupTracking();
    }

    private loadUserHistory(): void {
        try {
            const historyData = localStorage.getItem('userHistory');
            if (historyData) {
                const history = JSON.parse(historyData);
                this.userHistory = new Map(Object.entries(history));
            }
        } catch (error) {
            console.error('Failed to load user history:', error);
        }
    }

    private saveUserHistory(): void {
        try {
            const historyObj = Object.fromEntries(this.userHistory);
            localStorage.setItem('userHistory', JSON.stringify(historyObj));
        } catch (error) {
            console.error('Failed to save user history:', error);
        }
    }

    private async loadPopularItems(): Promise<void> {
        try {
            const response = await fetch('/api/items/popular');
            this.popularItems = await response.json();
        } catch (error) {
            console.error('Failed to load popular items:', error);
        }
    }

    private setupTracking(): void {
        // Track item views
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const itemElement = target.closest('[data-item-id]');

            if (itemElement) {
                const itemId = itemElement.getAttribute('data-item-id');
                const itemData = this.extractItemData(itemElement);

                if (itemId && itemData) {
                    this.trackItemView(itemId, itemData);
                }
            }
        });

        // Track search queries
        document.addEventListener('search', (e: any) => {
            if (e.detail && e.detail.query) {
                this.trackSearch(e.detail.query);
            }
        });

        // Track filter usage
        document.addEventListener('filterChange', (e: any) => {
            if (e.detail && e.detail.filters) {
                this.trackFilterUsage(e.detail.filters);
            }
        });
    }

    private extractItemData(element: HTMLElement): any {
        return {
            id: element.getAttribute('data-item-id'),
            category: element.getAttribute('data-category'),
            price: parseFloat(element.getAttribute('data-price') || '0'),
            rating: parseFloat(element.getAttribute('data-rating') || '0'),
            tags: element.getAttribute('data-tags')?.split(',') || []
        };
    }

    private trackItemView(itemId: string, itemData: any): void {
        const userId = this.getUserId();

        if (!this.userHistory.has(userId)) {
            this.userHistory.set(userId, []);
        }

        const history = this.userHistory.get(userId)!;

        // Add to history if not already viewed recently
        const recentView = history.find(h => h.id === itemId);
        if (!recentView) {
            history.push({
                ...itemData,
                timestamp: Date.now(),
                type: 'view'
            });

            // Limit history size
            if (history.length > this.maxHistorySize) {
                history.shift();
            }

            this.saveUserHistory();
            this.updatePreferences(itemData);
        }
    }

    private trackSearch(query: string): void {
        const userId = this.getUserId();

        if (!this.userHistory.has(userId)) {
            this.userHistory.set(userId, []);
        }

        const history = this.userHistory.get(userId)!;

        history.push({
            type: 'search',
            query,
            timestamp: Date.now()
        });

        if (history.length > this.maxHistorySize) {
            history.shift();
        }

        this.saveUserHistory();
    }

    private trackFilterUsage(filters: Record<string, any>): void {
        const userId = this.getUserId();

        if (!this.userHistory.has(userId)) {
            this.userHistory.set(userId, []);
        }

        const history = this.userHistory.get(userId)!;

        history.push({
            type: 'filter',
            filters,
            timestamp: Date.now()
        });

        if (history.length > this.maxHistorySize) {
            history.shift();
        }

        this.saveUserHistory();
    }

    private updatePreferences(itemData: any): void {
        const userId = this.getUserId();

        if (!this.userPreferences.has(userId)) {
            this.userPreferences.set(userId, {
                categories: {},
                priceRange: { min: Infinity, max: -Infinity },
                tags: {},
                rating: 0
            });
        }

        const prefs = this.userPreferences.get(userId)!;

        // Update category preferences
        if (itemData.category) {
            prefs.categories[itemData.category] = (prefs.categories[itemData.category] || 0) + 1;
        }

        // Update price range
        if (itemData.price) {
            prefs.priceRange.min = Math.min(prefs.priceRange.min, itemData.price);
            prefs.priceRange.max = Math.max(prefs.priceRange.max, itemData.price);
        }

        // Update tag preferences
        if (itemData.tags) {
            itemData.tags.forEach((tag: string) => {
                prefs.tags[tag] = (prefs.tags[tag] || 0) + 1;
            });
        }

        // Update average rating preference
        if (itemData.rating) {
            const totalViews = this.userHistory.get(userId)!.filter(h => h.type === 'view').length;
            prefs.rating = (prefs.rating * (totalViews - 1) + itemData.rating) / totalViews;
        }

        this.userPreferences.set(userId, prefs);
    }

    public getRecommendations(count: number = 10): any[] {
        const userId = this.getUserId();
        const prefs = this.userPreferences.get(userId);
        const history = this.userHistory.get(userId) || [];

        if (!prefs || history.length === 0) {
            // Return popular items if no user history
            return this.popularItems.slice(0, count);
        }

        // Score items based on preferences
        const scoredItems = this.popularItems.map(item => {
            let score = 0;

            // Category match
            if (item.category && prefs.categories[item.category]) {
                score += prefs.categories[item.category] * 2;
            }

            // Price range match
            if (item.price) {
                const priceScore = this.calculatePriceScore(item.price, prefs.priceRange);
                score += priceScore;
            }

            // Tag matches
            if (item.tags) {
                item.tags.forEach((tag: string) => {
                    if (prefs.tags[tag]) {
                        score += prefs.tags[tag];
                    }
                });
            }

            // Rating match
            if (item.rating) {
                const ratingDiff = Math.abs(item.rating - prefs.rating);
                score += (5 - ratingDiff);
            }

            // Boost recently viewed items
            const recentlyViewed = history.find(h => h.id === item.id);
            if (recentlyViewed) {
                const daysSinceView = (Date.now() - recentlyViewed.timestamp) / (1000 * 60 * 60 * 24);
                score += Math.max(0, 10 - daysSinceView);
            }

            return { ...item, score };
        });

        // Sort by score and return top items
        return scoredItems
            .sort((a, b) => b.score - a.score)
            .slice(0, count)
            .map(({ score, ...item }) => item);
    }

    private calculatePriceScore(price: number, priceRange: { min: number; max: number }): number {
        if (priceRange.min === Infinity || priceRange.max === -Infinity) {
            return 0;
        }

        const range = priceRange.max - priceRange.min;
        if (range === 0) return 5;

        const distanceFromCenter = Math.abs(price - (priceRange.min + range / 2));
        const normalizedDistance = distanceFromCenter / range;

        return Math.max(0, 5 - normalizedDistance * 10);
    }

    private getUserId(): string {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }

    public clearHistory(): void {
        const userId = this.getUserId();
        this.userHistory.delete(userId);
        this.userPreferences.delete(userId);
        this.saveUserHistory();
    }
}

// Initialize Recommendation System
const recommendationSystem = new RecommendationSystem();

export { recommendationSystem, RecommendationSystem };
