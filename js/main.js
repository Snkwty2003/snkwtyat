// =======================
// MAIN JAVASCRIPT
// =======================

// Smooth scroll for anchor links
document.querySelectorAll("a[href^=\"#\"]").forEach(anchor => {
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

// Mobile menu toggle
function toggleMenu() {
    try {
        const menu = document.querySelector(".nav-links");
        if (menu) {
            menu.classList.toggle("show");
        }
    } catch (error) {
        console.debug("Error toggling menu:", error);
    }
}

// Close mobile menu
function closeMenu() {
    const menu = document.querySelector(".nav-links");
    if (menu && menu.classList.contains("show")) {
        menu.classList.remove("show");
    }
}

// Form validation
function validateForm(form) {
    if (!form) {
        console.debug("Form not provided for validation");
        return false;
    }
    
    try {
        const inputs = form.querySelectorAll("input[required], select[required], textarea[required]");
        let isValid = true;

        inputs.forEach(input => {
            if (input && !input.value.trim()) {
                isValid = false;
                input.style.borderColor = "#ff4444";
            } else if (input) {
                input.style.borderColor = "#f0f0f0";
            }
        });

        return isValid;
    } catch (error) {
        console.debug("Error validating form:", error);
        return false;
    }
}

// Show toast notification
function showToast(message, type = "success") {
    try {
        if (!document || !document.body) {
            console.debug("Document or body not available for toast");
            return;
        }
        
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.textContent = message || "";

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.style.opacity = "0";
                setTimeout(() => {
                    if (toast && toast.parentNode) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }
        }, 3000);
    } catch (error) {
        console.debug("Error showing toast:", error);
    }
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

// Initialize on DOM ready
try {
    document.addEventListener("DOMContentLoaded", function() {
        try {
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
        } catch (error) {
            console.debug("Error initializing header scroll effect:", error);
        }

    // Initialize all tooltips
    try {
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
    } catch (error) {
        console.debug("Error initializing tooltips:", error);
    }
    });
} catch (error) {
    console.debug("Error setting up DOMContentLoaded listener:", error);
}
