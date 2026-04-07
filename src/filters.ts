// TypeScript Types for Filter System
interface FilterInput {
    element: HTMLInputElement;
    value: string;
    label: string;
}

interface FilterGroup {
    [key: string]: FilterInput[];
}

interface ItemData {
    id: string;
    category: string;
    price: number;
    rating: number;
    tags: string[];
}

interface FilterItem {
    element: HTMLElement;
    data: ItemData;
}

interface FilterOptions {
    containerId?: string;
    itemsContainerId?: string;
}

// Advanced Filter System with TypeScript
class FilterSystem {
    private container: HTMLElement | null;
    private itemsContainer: HTMLElement | null;
    private filters: FilterGroup = {};
    private activeFilters: Record<string, string[]> = {};
    private items: FilterItem[] = [];

    constructor(options: FilterOptions = {}) {
        const defaultOptions: Required<FilterOptions> = {
            containerId: 'filterContainer',
            itemsContainerId: 'itemsContainer',
            ...options
        };

        this.container = document.getElementById(defaultOptions.containerId);
        this.itemsContainer = document.getElementById(defaultOptions.itemsContainerId);

        this.init();
    }

    private init(): void {
        if (!this.container || !this.itemsContainer) {
            console.warn('Filter container or items container not found');
            return;
        }

        // Collect all filter inputs
        this.collectFilters();

        // Collect all items
        this.collectItems();

        // Add event listeners
        this.addEventListeners();
    }

    private collectFilters(): void {
        const filterGroups = this.container.querySelectorAll('.filter-group');

        filterGroups.forEach(group => {
            const groupName = group.dataset.filter;
            if (!groupName) return;

            const inputs = group.querySelectorAll('input[type="checkbox"], input[type="radio"]');

            this.filters[groupName] = Array.from(inputs).map(input => ({
                element: input as HTMLInputElement,
                value: input.value,
                label: input.nextElementSibling?.textContent || input.value
            }));
        });
    }

    private collectItems(): void {
        const items = this.itemsContainer.querySelectorAll('.filter-item');

        this.items = Array.from(items).map(item => ({
            element: item as HTMLElement,
            data: this.getItemData(item as HTMLElement)
        }));
    }

    private getItemData(item: HTMLElement): ItemData {
        return {
            id: item.dataset.id || '',
            category: item.dataset.category || '',
            price: parseFloat(item.dataset.price || '0'),
            rating: parseFloat(item.dataset.rating || '0'),
            tags: item.dataset.tags?.split(',') || []
        };
    }

    private addEventListeners(): void {
        // Add change event listeners to all filter inputs
        Object.values(this.filters).flat().forEach(filter => {
            filter.element.addEventListener('change', () => this.applyFilters());
        });

        // Add clear filters button listener
        const clearButton = this.container.querySelector('.clear-filters');
        clearButton?.addEventListener('click', () => this.clearFilters());

        // Add apply filters button listener
        const applyButton = this.container.querySelector('.apply-filters');
        applyButton?.addEventListener('click', () => this.applyFilters());
    }

    public applyFilters(): void {
        // Collect active filters
        this.activeFilters = {};

        Object.entries(this.filters).forEach(([groupName, filters]) => {
            const activeValues = filters
                .filter(f => f.element.checked)
                .map(f => f.value);

            if (activeValues.length > 0) {
                this.activeFilters[groupName] = activeValues;
            }
        });

        // Filter items
        this.filterItems();

        // Update UI
        this.updateUI();
    }

    private filterItems(): void {
        this.items.forEach(item => {
            const isVisible = this.isItemVisible(item);
            item.element.style.display = isVisible ? '' : 'none';
            item.element.classList.toggle('hidden', !isVisible);
        });
    }

    private isItemVisible(item: FilterItem): boolean {
        const data = item.data;

        // Check if item matches all active filters
        return Object.entries(this.activeFilters).every(([filterName, values]) => {
            return this.matchesFilter(data, filterName, values);
        });
    }

    private matchesFilter(itemData: ItemData, filterName: string, values: string[]): boolean {
        switch (filterName) {
            case 'category':
                return values.includes(itemData.category);

            case 'price':
                return this.matchesPriceFilter(itemData.price, values);

            case 'rating':
                return this.matchesRatingFilter(itemData.rating, values);

            case 'tags':
                return values.some(tag => itemData.tags.includes(tag));

            default:
                return true;
        }
    }

    private matchesPriceFilter(price: number, values: string[]): boolean {
        return values.some(value => {
            const [min, max] = value.split('-').map(Number);
            return price >= min && price <= max;
        });
    }

    private matchesRatingFilter(rating: number, values: string[]): boolean {
        return values.some(value => {
            const minRating = parseFloat(value);
            return rating >= minRating;
        });
    }

    private updateUI(): void {
        // Update filter counts
        this.updateFilterCounts();

        // Update results count
        this.updateResultsCount();

        // Show/hide no results message
        this.toggleNoResultsMessage();
    }

    private updateFilterCounts(): void {
        Object.entries(this.filters).forEach(([groupName, filters]) => {
            filters.forEach(filter => {
                const count = this.countMatchingItems(groupName, filter.value);
                const countElement = filter.element.nextElementSibling?.querySelector('.filter-count');
                if (countElement) {
                    countElement.textContent = count.toString();
                }
            });
        });
    }

    private countMatchingItems(filterName: string, filterValue: string): number {
        return this.items.filter(item => {
            const data = item.data;
            return this.matchesFilter(data, filterName, [filterValue]);
        }).length;
    }

    private updateResultsCount(): void {
        const visibleCount = this.items.filter(item =>
            !item.element.classList.contains('hidden')
        ).length;

        const countElement = this.container?.querySelector('.results-count');
        if (countElement) {
            countElement.textContent = `${visibleCount} نتيجة`;
        }
    }

    private toggleNoResultsMessage(): void {
        const visibleItems = this.items.filter(item =>
            !item.element.classList.contains('hidden')
        );

        const noResultsElement = this.itemsContainer?.querySelector('.no-results');

        if (visibleItems.length === 0 && noResultsElement) {
            noResultsElement.style.display = 'block';
        } else if (noResultsElement) {
            noResultsElement.style.display = 'none';
        }
    }

    public clearFilters(): void {
        // Uncheck all filter inputs
        Object.values(this.filters).flat().forEach(filter => {
            filter.element.checked = false;
        });

        // Clear active filters
        this.activeFilters = {};

        // Show all items
        this.items.forEach(item => {
            item.element.style.display = '';
            item.element.classList.remove('hidden');
        });

        // Update UI
        this.updateUI();
    }

    public getActiveFilters(): Record<string, string[]> {
        return { ...this.activeFilters };
    }

    public setActiveFilters(filters: Record<string, string[]>): void {
        this.activeFilters = { ...filters };

        // Update filter inputs
        Object.entries(this.activeFilters).forEach(([groupName, values]) => {
            if (this.filters[groupName]) {
                this.filters[groupName].forEach(filter => {
                    filter.element.checked = values.includes(filter.value);
                });
            }
        });

        // Apply filters
        this.filterItems();
        this.updateUI();
    }
}

// Initialize filter system
document.addEventListener('DOMContentLoaded', () => {
    const filterSystem = new FilterSystem({
        containerId: 'filterContainer',
        itemsContainerId: 'itemsContainer'
    });
});

export { FilterSystem, FilterItem, ItemData, FilterOptions };
