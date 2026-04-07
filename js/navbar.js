// =======================
// NAVBAR JAVASCRIPT
// =======================

// Navbar scroll effect
const initNavbarScroll = () => {
    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
};

// Mobile menu toggle
const initMobileMenu = () => {
    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");
    const navOverlay = document.querySelector(".nav-overlay");

    // Create overlay if not exists
    if (!navOverlay) {
        const overlay = document.createElement("div");
        overlay.className = "nav-overlay";
        document.body.appendChild(overlay);
    }

    const toggleMenu = () => {
        mobileMenu.classList.toggle("active");
        document.querySelector(".nav-overlay").classList.toggle("active");
        document.body.style.overflow = mobileMenu.classList.contains("active") ? "hidden" : "";
    };

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener("click", toggleMenu);
    }

    // Close menu when clicking overlay
    document.querySelector(".nav-overlay").addEventListener("click", toggleMenu);

    // Close menu on window resize
    window.addEventListener("resize", () => {
        if (window.innerWidth > 992 && mobileMenu.classList.contains("active")) {
            toggleMenu();
        }
    });
};

// Active link highlighting
const initActiveLinks = () => {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let current = "";

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });
};

// Smooth scroll for anchor links
const initSmoothScroll = () => {
    document.querySelectorAll("a[href^=\"#\"]").forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));

            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: "smooth"
                });
            }
        });
    });
};

// Initialize all navbar functions
document.addEventListener("DOMContentLoaded", () => {
    initNavbarScroll();
    initMobileMenu();
    initActiveLinks();
    initSmoothScroll();
});
