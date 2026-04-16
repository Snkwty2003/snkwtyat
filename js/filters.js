// Advanced Filter System
class FilterSystem {
    constructor(options = {}) {
        this.options = {
            containerId: "filterContainer",
            itemsContainerId: "itemsContainer",
            ...options
        };

        this.container = document.getElementById(this.options.containerId);
        this.itemsContainer = document.getElementById(this.options.itemsContainerId);
        this.filters = {};
        this.activeFilters = {};
        this.items = [];

        this.init();
    }

    init() {
        if (!this.container) {
            console.warn("Filter container not found, creating it");
            this.container = document.createElement('div');
            this.container.id = this.options.containerId;
            document.body.appendChild(this.container);
        }

        if (!this.itemsContainer) {
            console.warn("Items container not found, creating it");
            this.itemsContainer = document.createElement('div');
            this.itemsContainer.id = this.options.itemsContainerId;
            document.body.appendChild(this.itemsContainer);
        }

        // Collect all filter inputs
        this.collectFilters();

        // Collect all items
        this.collectItems();

        // Add event listeners
        this.addEventListeners();
    }

    collectFilters() {
        if (!this.container) {
            console.debug("Filter container not found");
            return;
        }
        
        const filterGroups = this.container.querySelectorAll(".filter-group");

        filterGroups.forEach(group => {
            const groupName = group.dataset.filter;
            const inputs = group.querySelectorAll("input[type=\"checkbox\"], input[type=\"radio\"]");

            this.filters[groupName] = Array.from(inputs).map(input => ({
                element: input,
                value: input.value,
                label: input.nextElementSibling?.textContent || input.value
            }));
        });
    }

    collectItems() {
        if (!this.itemsContainer) {
            console.debug("Items container not found");
            return;
        }
        
        const items = this.itemsContainer.querySelectorAll(".filter-item");

        this.items = Array.from(items).map(item => ({
            element: item,
            data: this.getItemData(item)
        }));
    }

    getItemData(item) {
        try {
            return {
                id: item.dataset.id || "",
                category: item.dataset.category || "",
                price: parseFloat(item.dataset.price) || 0,
                rating: parseFloat(item.dataset.rating) || 0,
                tags: item.dataset.tags?.split(",") || []
            };
        } catch (error) {
            console.debug("Error getting item data:", error);
            return {
                id: "",
                category: "",
                price: 0,
                rating: 0,
                tags: []
            };
        }
    }

    addEventListeners() {
        try {
            // Add change event listeners to all filter inputs
            Object.values(this.filters).flat().forEach(filter => {
                try {
                    filter.element.addEventListener("change", () => this.applyFilters());
                } catch (error) {
                    console.debug("Error adding listener to filter:", error);
                }
            });

            // Add clear filters button listener
            const clearButton = this.container.querySelector(".clear-filters");
            if (clearButton) {
                clearButton.addEventListener("click", () => this.clearFilters());
            }

            // Add apply filters button listener
            const applyButton = this.container.querySelector(".apply-filters");
            if (applyButton) {
                applyButton.addEventListener("click", () => this.applyFilters());
            }
        } catch (error) {
            console.debug("Error adding event listeners:", error);
        }
    }

    applyFilters() {
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

    filterItems() {
        if (!this.items || this.items.length === 0) return;
        
        this.items.forEach(item => {
            if (!item.element) return;
            
            const isVisible = this.isItemVisible(item);
            item.element.style.display = isVisible ? "" : "none";
            item.element.classList.toggle("hidden", !isVisible);
        });
    }

    isItemVisible(item) {
        const data = item.data;

        // Check if item matches all active filters
        return Object.entries(this.activeFilters).every(([filterName, values]) => {
            return this.matchesFilter(data, filterName, values);
        });
    }

    matchesFilter(itemData, filterName, values) {
        switch (filterName) {
        case "category":
            return values.includes(itemData.category);

        case "price":
            return this.matchesPriceFilter(itemData.price, values);

        case "rating":
            return this.matchesRatingFilter(itemData.rating, values);

        case "tags":
            return values.some(tag => itemData.tags.includes(tag));

        default:
            return true;
        }
    }

    matchesPriceFilter(price, values) {
        return values.some(value => {
            const [min, max] = value.split("-").map(Number);
            return price >= min && price <= max;
        });
    }

    matchesRatingFilter(rating, values) {
        return values.some(value => {
            const minRating = parseFloat(value);
            return rating >= minRating;
        });
    }

    updateUI() {
        // Update filter counts
        this.updateFilterCounts();

        // Update results count
        this.updateResultsCount();

        // Show/hide no results message
        this.toggleNoResultsMessage();
    }

    updateFilterCounts() {
        if (!this.filters) return;
        
        Object.entries(this.filters).forEach(([groupName, filters]) => {
            if (!filters) return;
            
            filters.forEach(filter => {
                if (!filter || !filter.element) return;
                
                const count = this.countMatchingItems(groupName, filter.value);
                const countElement = filter.element.nextElementSibling?.querySelector(".filter-count");
                if (countElement) {
                    countElement.textContent = count;
                }
            });
        });
    }

    countMatchingItems(filterName, filterValue) {
        return this.items.filter(item => {
            const data = item.data;
            return this.matchesFilter(data, filterName, [filterValue]);
        }).length;
    }

    updateResultsCount() {
        const visibleCount = this.items.filter(item => 
            !item.element.classList.contains("hidden")
        ).length;

        const countElement = this.container.querySelector(".results-count");
        if (countElement) {
            countElement.textContent = `${visibleCount} نتيجة`;
        }
    }

    toggleNoResultsMessage() {
        const visibleItems = this.items.filter(item => 
            !item.element.classList.contains("hidden")
        );

        const noResultsElement = this.itemsContainer.querySelector(".no-results");

        if (visibleItems.length === 0 && noResultsElement) {
            noResultsElement.style.display = "block";
        } else if (noResultsElement) {
            noResultsElement.style.display = "none";
        }
    }

    clearFilters() {
        if (!this.filters) return;
        
        // Uncheck all filter inputs
        Object.values(this.filters).flat().forEach(filter => {
            if (filter && filter.element) {
                filter.element.checked = false;
            }
        });

        // Clear active filters
        this.activeFilters = {};

        // Show all items
        if (this.items) {
            this.items.forEach(item => {
                if (item.element) {
                    item.element.style.display = "";
                    item.element.classList.remove("hidden");
                }
            });
        }

        // Update UI
        this.updateUI();
    }

    getActiveFilters() {
        return { ...this.activeFilters };
    }

    setActiveFilters(filters) {
        if (!filters) return;
        
        this.activeFilters = { ...filters };

        // Update filter inputs
        if (this.filters) {
            Object.entries(this.activeFilters).forEach(([groupName, values]) => {
                if (this.filters[groupName]) {
                    this.filters[groupName].forEach(filter => {
                        if (filter && filter.element) {
                            filter.element.checked = values.includes(filter.value);
                        }
                    });
                }
            });
        }

        // Apply filters
        this.filterItems();
        this.updateUI();
    }
}

// Initialize filter system
document.addEventListener("DOMContentLoaded", () => {
    const filterSystem = new FilterSystem({
        containerId: "filterContainer",
        itemsContainerId: "itemsContainer"
    });
});
