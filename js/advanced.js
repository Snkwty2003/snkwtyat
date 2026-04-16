// =======================
// ADVANCED JAVASCRIPT
// =======================

// Lazy Loading Images
const lazyLoadImages = () => {
    const images = document.querySelectorAll("img[data-src]");

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add("loaded");
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
};

// Parallax Effect
const initParallax = () => {
    const parallaxElements = document.querySelectorAll(".parallax");

    window.addEventListener("scroll", () => {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(element => {
            const rate = element.dataset.rate || 0.5;
            element.style.transform = `translateY(${scrolled * rate}px)`;
        });
    });
};

// initScrollAnimations is defined in index.html

// Counter Animation


// Progress Bar Animation
const animateProgressBars = () => {
    const progressBars = document.querySelectorAll("[data-progress]");

    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const progress = bar.dataset.progress;
                bar.style.width = `${progress}%`;
                progressObserver.unobserve(bar);
            }
        });
    });

    progressBars.forEach(bar => progressObserver.observe(bar));
};

// Typing Effect
const initTypingEffect = () => {
    const elements = document.querySelectorAll("[data-typing]");

    elements.forEach(element => {
        const text = element.dataset.typing;
        const speed = parseInt(element.dataset.speed) || 100;
        let index = 0;

        const type = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            }
        };

        type();
    });
};

// Modal System
const Modal = {
    create(options) {
        const modal = document.createElement("div");
        modal.className = "modal";
        modal.id = options.id || "modal-" + Date.now();

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${options.title || ""}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${options.content || ""}
                </div>
                ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ""}
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector(".modal-close");
        closeBtn.addEventListener("click", () => this.close(modal.id));

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                this.close(modal.id);
            }
        });

        return modal.id;
    },

    show(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add("show");
            document.body.style.overflow = "hidden";
        }
    },

    close(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove("show");
            document.body.style.overflow = "";
        }
    }
};

// Toast System
const Toast = {
    show(message, type = "success", duration = 3000) {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("show");
        }, 10);

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    },

    success(message) {
        this.show(message, "success");
    },

    error(message) {
        this.show(message, "error");
    },

    warning(message) {
        this.show(message, "warning");
    },

    info(message) {
        this.show(message, "info");
    }
};

// Loading Spinner
const Spinner = {
    show(container) {
        const spinner = document.createElement("div");
        spinner.className = "spinner-overlay";
        spinner.innerHTML = "<div class=\"spinner\"></div>";

        if (container) {
            container.appendChild(spinner);
        } else {
            document.body.appendChild(spinner);
        }

        return spinner;
    },

    hide(spinner) {
        if (spinner) {
            spinner.remove();
        }
    }
};

// Form Validation
const Validator = {
    rules: {
        required: (value) => value.trim() !== "",
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        phone: (value) => /^05[0-9]{8}$/.test(value),
        min: (value, min) => value.length >= min,
        max: (value, max) => value.length <= max
    },

    validate(form) {
        const inputs = form.querySelectorAll("[data-validate]");
        let isValid = true;

        inputs.forEach(input => {
            const rules = input.dataset.validate.split("|");
            let inputValid = true;

            rules.forEach(rule => {
                const [ruleName, ruleValue] = rule.split(":");
                const ruleFunc = this.rules[ruleName];

                if (ruleFunc && !ruleFunc(input.value, ruleValue)) {
                    inputValid = false;
                }
            });

            if (!inputValid) {
                isValid = false;
                input.classList.add("is-invalid");
            } else {
                input.classList.remove("is-invalid");
                input.classList.add("is-valid");
            }
        });

        return isValid;
    }
};

// Local Storage Helper
const Storage = {
    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (e) {
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clear() {
        localStorage.clear();
    }
};

// Debounce Function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle Function
const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Format Utilities
const Format = {
    price(price) {
        return "$" + price.toFixed(2);
    },

    date(date) {
        return new Date(date).toLocaleDateString("ar-SA");
    },

    time(date) {
        return new Date(date).toLocaleTimeString("ar-SA");
    },

    number(num) {
        return num.toLocaleString("ar-SA");
    }
};

// Initialize all advanced features when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    lazyLoadImages();
    initParallax();
   if (typeof initSmoothScroll === "function") {
    initSmoothScroll();
}
if (typeof initScrollAnimations === "function") {
    initScrollAnimations();
}
  
    animateProgressBars();
    initTypingEffect();
});
