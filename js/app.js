// =======================
// APPLICATION ENTRY POINT
// =======================

// Import modules
import formHandler from './form.js';
import uiHandler from './ui.js';
import adminHandler from './admin.js';

// =======================
// UTILITY FUNCTIONS
// =======================

// Debounce function for search
function debounce(func, wait) {
    if (typeof func !== 'function') {
        console.debug("Invalid function provided to debounce");
        return function() {};
    }

    if (typeof wait !== 'number' || wait < 0) {
        console.debug("Invalid wait time provided to debounce");
        wait = 300; // Default to 300ms
    }

    let timeout;
    return function executedFunction(...args) {
        try {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        } catch (error) {
            console.debug("Error in debounced function:", error);
        }
    };
}

// Format price
function formatPrice(price) {
    try {
        if (typeof price !== 'number' || isNaN(price)) {
            console.debug("Invalid price value:", price);
            return "$0.00";
        }
        return "$" + price.toFixed(2);
    } catch (error) {
        console.debug("Error formatting price:", error);
        return "$0.00";
    }
}

// Local storage helpers
const storage = {
    get: (key) => {
        try {
            if (!key) {
                console.debug("No key provided for storage.get");
                return null;
            }
            if (typeof localStorage === 'undefined') {
                console.debug("localStorage not available");
                return null;
            }
            return JSON.parse(localStorage.getItem(key));
        } catch (e) {
            console.debug("Error getting from storage:", e);
            return null;
        }
    },
    set: (key, value) => {
        try {
            if (!key) {
                console.debug("No key provided for storage.set");
                return false;
            }
            if (typeof localStorage === 'undefined') {
                console.debug("localStorage not available");
                return false;
            }
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.debug("Error setting to storage:", e);
            return false;
        }
    },
    remove: (key) => {
        try {
            if (!key) {
                console.debug("No key provided for storage.remove");
                return;
            }
            if (typeof localStorage === 'undefined') {
                console.debug("localStorage not available");
                return;
            }
            localStorage.removeItem(key);
        } catch (e) {
            console.debug("Error removing from storage:", e);
        }
    }
};

// =======================
// APPLICATION CLASS
// =======================

class Application {
    constructor() {
        this.modules = {
            form: formHandler,
            ui: uiHandler,
            admin: adminHandler
        };
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;

        document.addEventListener('DOMContentLoaded', () => {
            this.setupGlobalEventListeners();
            this.initializePage();
            this.isInitialized = true;
        });
    }

    setupGlobalEventListeners() {
        // Smooth scroll for anchor links
        document.querySelectorAll("a[href^="#"]").forEach(anchor => {
            anchor.addEventListener("click", function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute("href"));
                if (target) {
                    target.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            });
        });

        // Handle escape key globally
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals
                const modals = document.querySelectorAll('.modal[style*="display: flex"]');
                modals.forEach(modal => {
                    modal.style.display = 'none';
                });

                // Restore body scroll
                document.body.style.overflow = '';
            }
        });

        // Add scroll effect to header
        const header = document.querySelector("header, nav");
        if (header) {
            window.addEventListener("scroll", () => {
                try {
                    if (window.scrollY > 50) {
                        header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
                    } else {
                        header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
                    }
                } catch (error) {
                    console.debug("Error in scroll handler:", error);
                }
            });
        }

        // Initialize all tooltips
        const tooltips = document.querySelectorAll("[data-tooltip]");
        tooltips.forEach(tooltip => {
            if (!tooltip) return;

            tooltip.addEventListener("mouseenter", function() {
                try {
                    const tooltipText = this.getAttribute("data-tooltip");
                    if (!tooltipText) return;

                    const tooltipElement = document.createElement("div");
                    tooltipElement.className = "tooltip";
                    tooltipElement.textContent = tooltipText;
                    document.body.appendChild(tooltipElement);

                    const rect = this.getBoundingClientRect();
                    tooltipElement.style.top = rect.bottom + 10 + "px";
                    tooltipElement.style.left = rect.left + (rect.width / 2) - (tooltipElement.offsetWidth / 2) + "px";

                    this.addEventListener("mouseleave", function() {
                        try {
                            if (tooltipElement && tooltipElement.parentNode) {
                                document.body.removeChild(tooltipElement);
                            }
                        } catch (error) {
                            console.debug("Error removing tooltip:", error);
                        }
                    }, { once: true });
                } catch (error) {
                    console.debug("Error showing tooltip:", error);
                }
            });
        });
    }

    initializePage() {
        const path = window.location.pathname;

        // Initialize based on current page
        if (path.includes('admin.html')) {
            this.modules.admin.init();
        } else if (path.includes('store.html') || path.includes('template-store.html')) {
            this.initializeStore();
        } else {
            this.modules.form.init();
        }
    }

    initializeStore() {
        // Load cart from localStorage
        this.modules.ui.loadCart();

        // Set products data
        const products = [
            {id:1,name:"القالب الأول",desc:"قالب HTML احترافي مع تصميم متجاوب",price:19.99,cat:"HTML",img:"https://via.placeholder.com/300x200"},
            {id:2,name:"القالب الثاني",desc:"قالب CSS حديث مع تأثيرات مذهلة",price:24.99,cat:"CSS",img:"https://via.placeholder.com/300x200"},
            {id:3,name:"القالب الثالث",desc:"قالب HTML متكامل مع ميزات متقدمة",price:29.99,cat:"HTML",img:"https://via.placeholder.com/300x200"}
        ];

        this.modules.ui.setProducts(products);

        // Setup add to cart functionality
        document.addEventListener('click', (e) => {
            const addToCartBtn = e.target.closest('[data-action="add-to-cart"]');
            if (addToCartBtn) {
                const productId = parseInt(addToCartBtn.dataset.id);
                const product = products.find(p => p.id === productId);
                if (product) {
                    this.modules.ui.addToCart(product);
                }
            }
        });
    }
}

// Create and export application instance
const app = new Application();
export default app;

// Export utilities for use in other modules
export { debounce, formatPrice, storage };
