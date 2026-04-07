// Advanced Search System
class AdvancedSearch {
    constructor(options = {}) {
        this.options = {
            searchInputId: "searchInput",
            resultsContainerId: "searchResults",
            minChars: 2,
            maxResults: 10,
            debounceTime: 300,
            ...options
        };

        this.searchInput = document.getElementById(this.options.searchInputId);
        this.resultsContainer = document.getElementById(this.options.resultsContainerId);
        this.searchTerm = "";
        this.debounceTimer = null;
        this.isSearching = false;

        this.init();
    }

    init() {
        if (!this.searchInput) {
            console.warn("Search input not found");
            return;
        }

        if (!this.resultsContainer) {
            console.warn("Search results container not found");
            // Create results container if it doesn't exist
            this.resultsContainer = document.createElement('div');
            this.resultsContainer.id = this.options.resultsContainerId;
            this.searchInput.parentNode.appendChild(this.resultsContainer);
        }

        // Event listeners
        this.searchInput.addEventListener("input", (e) => this.handleInput(e));
        this.searchInput.addEventListener("focus", () => this.showResults());
        this.searchInput.addEventListener("blur", () => this.hideResults());

        // Keyboard navigation
        this.searchInput.addEventListener("keydown", (e) => this.handleKeyboard(e));

        // Close results on click outside
        document.addEventListener("click", (e) => {
            if (!this.searchInput.contains(e.target) && 
                !this.resultsContainer.contains(e.target)) {
                this.hideResults();
            }
        });

        // Create results container if not exists
        if (!this.resultsContainer) {
            this.resultsContainer = document.createElement("div");
            this.resultsContainer.id = this.options.resultsContainerId;
            this.resultsContainer.className = "search-results";
            this.searchInput.parentElement.appendChild(this.resultsContainer);
        }
    }

    handleInput(e) {
        const value = e.target.value.trim();

        // Clear previous timer
        clearTimeout(this.debounceTimer);

        if (value.length < this.options.minChars) {
            this.hideResults();
            return;
        }

        // Debounce search
        this.debounceTimer = setTimeout(() => {
            this.search(value);
        }, this.options.debounceTime);
    }

    async search(term) {
        if (this.isSearching) return;

        this.isSearching = true;
        this.searchTerm = term;
        this.showLoading();

        try {
            // Simulate API call - replace with actual API call
            const results = await this.fetchResults(term);
            this.displayResults(results);
        } catch (error) {
            console.error("Search error:", error);
            this.showError();
        } finally {
            this.isSearching = false;
        }
    }

    async fetchResults(term) {
        // Simulate API response - replace with actual API call
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock results - replace with actual data
                const mockResults = [
                    { id: 1, type: "template", title: "قالب صفحة هبوط احترافي", category: "Landing Page", price: 29.99 },
                    { id: 2, type: "template", title: "قالب متجر إلكتروني", category: "E-commerce", price: 49.99 },
                    { id: 3, type: "service", title: "تصميم مخصص", category: "خدمات", price: 199.99 },
                    { id: 4, type: "blog", title: "كيف تبدأ مشروعك", category: "مقالات", price: null },
                    { id: 5, type: "template", title: "قالب شركة", category: "Corporate", price: 39.99 }
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

    displayResults(results) {
        if (results.length === 0) {
            this.showNoResults();
            return;
        }

        const html = results.map(result => this.createResultHTML(result)).join("");
        this.resultsContainer.innerHTML = html;
        this.resultsContainer.classList.add("show");
    }

    createResultHTML(result) {
        const typeIcon = this.getTypeIcon(result.type);
        const price = result.price ? `$${result.price}` : "مجاني";

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

    getTypeIcon(type) {
        const icons = {
            template: "fas fa-palette",
            service: "fas fa-cogs",
            blog: "fas fa-newspaper"
        };
        return icons[type] || "fas fa-file";
    }

    showLoading() {
        this.resultsContainer.innerHTML = `
            <div class="search-loading">
                <div class="loading-spinner"></div>
                <span>جاري البحث...</span>
            </div>
        `;
        this.resultsContainer.classList.add("show");
    }

    showError() {
        this.resultsContainer.innerHTML = `
            <div class="search-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>حدث خطأ أثناء البحث</span>
            </div>
        `;
        this.resultsContainer.classList.add("show");
    }

    showNoResults() {
        this.resultsContainer.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <span>لا توجد نتائج</span>
            </div>
        `;
        this.resultsContainer.classList.add("show");
    }

    showResults() {
        if (this.searchTerm && this.searchTerm.length >= this.options.minChars) {
            this.resultsContainer.classList.add("show");
        }
    }

    hideResults() {
        this.resultsContainer.classList.remove("show");
    }

    handleKeyboard(e) {
        const results = this.resultsContainer.querySelectorAll(".search-result");
        const focusedResult = this.resultsContainer.querySelector(".search-result.focused");

        switch(e.key) {
        case "ArrowDown":
            e.preventDefault();
            if (!focusedResult) {
                results[0]?.classList.add("focused");
            } else {
                const next = focusedResult.nextElementSibling;
                if (next) {
                    focusedResult.classList.remove("focused");
                    next.classList.add("focused");
                }
            }
            break;

        case "ArrowUp":
            e.preventDefault();
            if (focusedResult) {
                const prev = focusedResult.previousElementSibling;
                if (prev) {
                    focusedResult.classList.remove("focused");
                    prev.classList.add("focused");
                } else {
                    focusedResult.classList.remove("focused");
                    this.searchInput.focus();
                }
            }
            break;

        case "Enter":
            e.preventDefault();
            if (focusedResult) {
                this.selectResult(focusedResult);
            } else if (this.searchTerm) {
                this.performSearch();
            }
            break;

        case "Escape":
            this.hideResults();
            break;
        }
    }

    selectResult(result) {
        const id = result.dataset.id;
        // Handle result selection - navigate to result page
        console.log("Selected result:", id);
        this.hideResults();
    }

    performSearch() {
        // Perform full search - navigate to search results page
        console.log("Performing search for:", this.searchTerm);
        this.hideResults();
    }

    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize search system
document.addEventListener("DOMContentLoaded", () => {
    const searchSystem = new AdvancedSearch({
        searchInputId: "searchInput",
        resultsContainerId: "searchResults"
    });
});
