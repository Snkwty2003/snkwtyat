// =======================
// NAVBAR JAVASCRIPT
// =======================

// Navbar scroll effect
const initNavbarScroll = () => {
    try {
        const navbar = document.querySelector(".navbar");
        if (!navbar) {
            console.debug("Navbar element not found");
            return;
        }

        window.addEventListener("scroll", () => {
            try {
                if (window.scrollY > 50) {
                    navbar.classList.add("scrolled");
                } else {
                    navbar.classList.remove("scrolled");
                }
            } catch (error) {
                console.debug("Error in navbar scroll handler:", error);
            }
        });
    } catch (error) {
        console.debug("Error initializing navbar scroll:", error);
    }
};

// Mobile menu toggle
const initMobileMenu = () => {
    try {
        const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
        const mobileMenu = document.querySelector(".mobile-menu");
        let navOverlay = document.querySelector(".nav-overlay");

        // Create overlay if not exists
        if (!navOverlay && document.body) {
            try {
                const overlay = document.createElement("div");
                overlay.className = "nav-overlay";
                document.body.appendChild(overlay);
                navOverlay = overlay;
            } catch (error) {
                console.debug("Error creating nav overlay:", error);
            }
        }

        const toggleMenu = () => {
            try {
                if (!mobileMenu) return;
                mobileMenu.classList.toggle("active");
                const overlay = document.querySelector(".nav-overlay");
                if (overlay) {
                    overlay.classList.toggle("active");
                }
                if (document.body) {
                    document.body.style.overflow = mobileMenu.classList.contains("active") ? "hidden" : "";
                }
            } catch (error) {
                console.debug("Error toggling mobile menu:", error);
            }
        };

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener("click", toggleMenu);
        }

        // Close menu when clicking overlay
        const overlay = document.querySelector(".nav-overlay");
        if (overlay) {
            overlay.addEventListener("click", toggleMenu);
        }

        // Close menu on window resize
        window.addEventListener("resize", () => {
            try {
                if (mobileMenu && window.innerWidth > 992 && mobileMenu.classList.contains("active")) {
                    toggleMenu();
                }
            } catch (error) {
                console.debug("Error in resize handler:", error);
            }
        });
    } catch (error) {
        console.debug("Error initializing mobile menu:", error);
    }
};

// Active link highlighting
const initActiveLinks = () => {
    try {
        const sections = document.querySelectorAll("section[id]");
        const navLinks = document.querySelectorAll(".nav-link");

        window.addEventListener("scroll", () => {
            try {
                let current = "";

                sections.forEach(section => {
                    try {
                        if (!section) return;
                        const sectionTop = section.offsetTop || 0;
                        const sectionHeight = section.clientHeight || 0;

                        if (window.scrollY >= sectionTop - 200) {
                            current = section.getAttribute("id") || "";
                        }
                    } catch (error) {
                        console.debug("Error processing section:", error);
                    }
                });

                navLinks.forEach(link => {
                    try {
                        if (!link) return;
                        link.classList.remove("active");
                        if (link.getAttribute("href") === `#${current}`) {
                            link.classList.add("active");
                        }
                    } catch (error) {
                        console.debug("Error updating nav link:", error);
                    }
                });
            } catch (error) {
                console.debug("Error in scroll handler for active links:", error);
            }
        });
    } catch (error) {
        console.debug("Error initializing active links:", error);
    }
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
try {
    document.addEventListener("DOMContentLoaded", () => {
        try {
            initNavbarScroll();
            initMobileMenu();
            initActiveLinks();
            initSmoothScroll();
        } catch (error) {
            console.debug("Error initializing navbar functions:", error);
        }
    });
} catch (error) {
    console.debug("Error setting up DOMContentLoaded listener for navbar:", error);
}
