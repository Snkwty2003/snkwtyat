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
        try {
            if (!this.container) {
                console.debug("Filter container not found, creating it");
                if (document && document.body) {
                    this.container = document.createElement('div');
                    this.container.id = this.options.containerId;
                    document.body.appendChild(this.container);
                }
            }

            if (!this.itemsContainer) {
                console.debug("Items container not found, creating it");
                if (document && document.body) {
                    this.itemsContainer = document.createElement('div');
                    this.itemsContainer.id = this.options.itemsContainerId;
                    document.body.appendChild(this.itemsContainer);
                }
            }

            // Collect all filter inputs
            this.collectFilters();

            // Collect all items
            this.collectItems();

            // Add event listeners
            this.addEventListeners();
        } catch (error) {
            console.debug("Error initializing filter system:", error);
        }
    }

    collectFilters() {
        try {
            if (!this.container) return;

            const filterGroups = this.container.querySelectorAll(".filter-group");

            filterGroups.forEach(group => {
                if (!group || !group.dataset) return;
                
                const groupName = group.dataset.filter;
                if (!groupName) return;
                
                const inputs = group.querySelectorAll("input[type=\"checkbox\"], input[type=\"radio\"]");

                this.filters[groupName] = Array.from(inputs).map(input => ({
                    element: input,
                    value: input.value || "",
                    label: input.nextElementSibling?.textContent || input.value || ""
                }));
            });
        } catch (error) {
            console.debug("Error collecting filters:", error);
        }
    }

    collectItems() {
        try {
            if (!this.itemsContainer) return;

            const items = this.itemsContainer.querySelectorAll(".filter-item");

            this.items = Array.from(items).map(item => {
                if (!item) return null;
                
                return {
                    element: item,
                    data: this.getItemData(item)
                };
            }).filter(item => item !== null);
        } catch (error) {
            console.debug("Error collecting items:", error);
        }
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
            if (this.container) {
                const clearButton = this.container.querySelector(".clear-filters");
                if (clearButton) {
                    clearButton.addEventListener("click", () => this.clearFilters());
                }

                // Add apply filters button listener
                const applyButton = this.container.querySelector(".apply-filters");
                if (applyButton) {
                    applyButton.addEventListener("click", () => this.applyFilters());
                }
            }
        } catch (error) {
            console.debug("Error adding event listeners:", error);
        }
    }

    applyFilters() {
        try {
            // Collect active filters
            this.activeFilters = {};

            if (!this.filters) return;

            Object.entries(this.filters).forEach(([groupName, filters]) => {
                if (!filters || !Array.isArray(filters)) return;
                
                const activeValues = filters
                    .filter(f => f && f.element && f.element.checked)
                    .map(f => f.value || "");

                if (activeValues.length > 0) {
                    this.activeFilters[groupName] = activeValues;
                }
            });

            // Filter items
            this.filterItems();

            // Update UI
            this.updateUI();
        } catch (error) {
            console.debug("Error applying filters:", error);
        }
    }

    filterItems() {
        try {
            if (!this.items || !Array.isArray(this.items)) return;

            this.items.forEach(item => {
                if (!item || !item.element) return;
                
                const isVisible = this.isItemVisible(item);
                item.element.style.display = isVisible ? "" : "none";
                item.element.classList.toggle("hidden", !isVisible);
            });
        } catch (error) {
            console.debug("Error filtering items:", error);
        }
    }

    isItemVisible(item) {
        try {
            if (!item || !item.data) return false;
            
            const data = item.data;

            // Check if item matches all active filters
            if (!this.activeFilters || Object.keys(this.activeFilters).length === 0) {
                return true;
            }

            return Object.entries(this.activeFilters).every(([filterName, values]) => {
                return this.matchesFilter(data, filterName, values);
            });
        } catch (error) {
            console.debug("Error checking item visibility:", error);
            return false;
        }
    }

    matchesFilter(itemData, filterName, values) {
        try {
            if (!itemData || !values || !Array.isArray(values)) {
                return true;
            }

            switch (filterName) {
            case "category":
                return values.includes(itemData.category);

            case "price":
                return this.matchesPriceFilter(itemData.price, values);

            case "rating":
                return this.matchesRatingFilter(itemData.rating, values);

            case "tags":
                if (!itemData.tags || !Array.isArray(itemData.tags)) {
                    return false;
                }
                return values.some(tag => itemData.tags.includes(tag));

            default:
                return true;
            }
        } catch (error) {
            console.debug("Error matching filter:", error);
            return true;
        }
    }

    matchesPriceFilter(price, values) {
        try {
            if (!values || !Array.isArray(values)) return false;
            if (typeof price !== "number" || isNaN(price)) return false;

            return values.some(value => {
                if (!value || typeof value !== "string") return false;
                
                const parts = value.split("-");
                if (parts.length !== 2) return false;
                
                const min = parseFloat(parts[0]);
                const max = parseFloat(parts[1]);
                
                if (isNaN(min) || isNaN(max)) return false;
                
                return price >= min && price <= max;
            });
        } catch (error) {
            console.debug("Error matching price filter:", error);
            return false;
        }
    }

    matchesRatingFilter(rating, values) {
        try {
            if (!values || !Array.isArray(values)) return false;
            if (typeof rating !== "number" || isNaN(rating)) return false;

            return values.some(value => {
                if (!value) return false;
                
                const minRating = parseFloat(value);
                if (isNaN(minRating)) return false;
                
                return rating >= minRating;
            });
        } catch (error) {
            console.debug("Error matching rating filter:", error);
            return false;
        }
    }

    updateUI() {
        try {
            // Update filter counts
            this.updateFilterCounts();

            // Update results count
            this.updateResultsCount();

            // Show/hide no results message
            this.toggleNoResultsMessage();
        } catch (error) {
            console.debug("Error updating UI:", error);
        }
    }

    updateFilterCounts() {
        try {
            if (!this.filters) return;

            Object.entries(this.filters).forEach(([groupName, filters]) => {
                if (!filters || !Array.isArray(filters)) return;
                
                filters.forEach(filter => {
                    if (!filter || !filter.element) return;
                    
                    const count = this.countMatchingItems(groupName, filter.value || "");
                    const countElement = filter.element.nextElementSibling?.querySelector(".filter-count");
                    if (countElement) {
                        countElement.textContent = count;
                    }
                });
            });
        } catch (error) {
            console.debug("Error updating filter counts:", error);
        }
    }

    countMatchingItems(filterName, filterValue) {
        try {
            if (!this.items || !Array.isArray(this.items)) return 0;
            
            return this.items.filter(item => {
                if (!item || !item.data) return false;
                
                const data = item.data;
                return this.matchesFilter(data, filterName, [filterValue]);
            }).length;
        } catch (error) {
            console.debug("Error counting matching items:", error);
            return 0;
        }
    }

    updateResultsCount() {
        try {
            if (!this.container) return;
            if (!this.items || !Array.isArray(this.items)) return;

            const visibleCount = this.items.filter(item => {
                if (!item || !item.element) return false;
                return !item.element.classList.contains("hidden");
            }).length;

            const countElement = this.container.querySelector(".results-count");
            if (countElement) {
                countElement.textContent = `${visibleCount} نتيجة`;
            }
        } catch (error) {
            console.debug("Error updating results count:", error);
        }
    }

    toggleNoResultsMessage() {
        try {
            if (!this.itemsContainer) return;
            if (!this.items || !Array.isArray(this.items)) return;

            const visibleItems = this.items.filter(item => {
                if (!item || !item.element) return false;
                return !item.element.classList.contains("hidden");
            });

            const noResultsElement = this.itemsContainer.querySelector(".no-results");
            
            if (!noResultsElement) return;
            
            if (visibleItems.length === 0) {
                noResultsElement.style.display = "block";
            } else {
                noResultsElement.style.display = "none";
            }
        } catch (error) {
            console.debug("Error toggling no results message:", error);
        }
    }

    clearFilters() {
        try {
            // Uncheck all filter inputs
            if (this.filters) {
                Object.values(this.filters).flat().forEach(filter => {
                    if (filter && filter.element) {
                        filter.element.checked = false;
                    }
                });
            }

            // Clear active filters
            this.activeFilters = {};

            // Show all items
            if (this.items && Array.isArray(this.items)) {
                this.items.forEach(item => {
                    if (item && item.element) {
                        item.element.style.display = "";
                        item.element.classList.remove("hidden");
                    }
                });
            }

            // Update UI
            this.updateUI();
        } catch (error) {
            console.debug("Error clearing filters:", error);
        }
    }

    getActiveFilters() {
        return { ...this.activeFilters };
    }

    setActiveFilters(filters) {
        try {
            if (!filters) return;
            
            this.activeFilters = { ...filters };

            // Update filter inputs
            if (this.filters) {
                Object.entries(this.activeFilters).forEach(([groupName, values]) => {
                    if (this.filters[groupName] && Array.isArray(values)) {
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
        } catch (error) {
            console.debug("Error setting active filters:", error);
        }
    }
}

// Initialize filter system
document.addEventListener("DOMContentLoaded", () => {
    const filterSystem = new FilterSystem({
        containerId: "filterContainer",
        itemsContainerId: "itemsContainer"
    });
});
