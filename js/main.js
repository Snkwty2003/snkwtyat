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
    const menu = document.querySelector(".nav-links");
    menu.classList.toggle("show");
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
    const inputs = form.querySelectorAll("input[required], select[required], textarea[required]");
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = "#ff4444";
        } else {
            input.style.borderColor = "#f0f0f0";
        }
    });

    return isValid;
}

// Show toast notification
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Format price
function formatPrice(price) {
    return "$" + price.toFixed(2);
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Local storage helpers
const storage = {
    get: (key) => {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (e) {
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },
    remove: (key) => {
        localStorage.removeItem(key);
    }
};

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", function() {
    // Add scroll effect to header
    const header = document.querySelector("header, nav");
    if (header) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
            } else {
                header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
            }
        });
    }

    // Initialize all tooltips
    const tooltips = document.querySelectorAll("[data-tooltip]");
    tooltips.forEach(tooltip => {
        tooltip.addEventListener("mouseenter", function() {
            const tooltipText = this.getAttribute("data-tooltip");
            const tooltipElement = document.createElement("div");
            tooltipElement.className = "tooltip";
            tooltipElement.textContent = tooltipText;
            document.body.appendChild(tooltipElement);

            const rect = this.getBoundingClientRect();
            tooltipElement.style.top = rect.bottom + 10 + "px";
            tooltipElement.style.left = rect.left + (rect.width / 2) - (tooltipElement.offsetWidth / 2) + "px";

            this.addEventListener("mouseleave", function() {
                document.body.removeChild(tooltipElement);
            }, { once: true });
        });
    });
});
