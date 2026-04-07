// Advanced Rating System
class RatingSystem {
    constructor(options = {}) {
        this.options = {
            containerId: "ratingContainer",
            maxRating: 5,
            allowHalfStars: false,
            readonly: false,
            ...options
        };

        this.container = document.getElementById(this.options.containerId);
        this.currentRating = 0;
        this.hoverRating = 0;

        this.init();
    }

    init() {
        if (!this.container) {
            console.warn("Rating container not found, creating it");
            this.container = document.createElement('div');
            this.container.id = this.options.containerId;
            document.body.appendChild(this.container);
        }

        // Create rating stars
        this.createStars();

        // Add event listeners if not readonly
        if (!this.options.readonly) {
            this.addEventListeners();
        }

        // Set initial rating
        const initialRating = parseFloat(this.container.dataset.rating) || 0;
        this.setRating(initialRating);
    }

    createStars() {
        const starsContainer = document.createElement("div");
        starsContainer.className = "rating-stars";
        starsContainer.setAttribute("role", "slider");
        starsContainer.setAttribute("aria-label", "التقييم");
        starsContainer.setAttribute("aria-valuemin", "0");
        starsContainer.setAttribute("aria-valuemax", this.options.maxRating);
        starsContainer.setAttribute("aria-valuenow", "0");

        for (let i = 1; i <= this.options.maxRating; i++) {
            const star = document.createElement("button");
            star.className = "rating-star";
            star.setAttribute("aria-label", `${i} نجوم`);
            star.dataset.rating = i;
            star.innerHTML = "<i class=\"far fa-star\"></i>";
            starsContainer.appendChild(star);
        }

        this.container.innerHTML = "";
        this.container.appendChild(starsContainer);
    }

    addEventListeners() {
        const stars = this.container.querySelectorAll(".rating-star");

        stars.forEach(star => {
            // Mouse enter
            star.addEventListener("mouseenter", () => {
                if (this.options.readonly) return;
                const rating = parseInt(star.dataset.rating);
                this.hoverRating = rating;
                this.updateStars(rating);
            });

            // Mouse leave
            star.addEventListener("mouseleave", () => {
                if (this.options.readonly) return;
                this.hoverRating = 0;
                this.updateStars(this.currentRating);
            });

            // Click
            star.addEventListener("click", () => {
                if (this.options.readonly) return;
                const rating = parseInt(star.dataset.rating);
                this.setRating(rating);
                this.triggerChange(rating);
            });

            // Keyboard navigation
            star.addEventListener("keydown", (e) => {
                if (this.options.readonly) return;

                let newRating = this.currentRating;

                switch (e.key) {
                case "ArrowRight":
                case "ArrowUp":
                    e.preventDefault();
                    newRating = Math.min(this.currentRating + 1, this.options.maxRating);
                    break;
                case "ArrowLeft":
                case "ArrowDown":
                    e.preventDefault();
                    newRating = Math.max(this.currentRating - 1, 0);
                    break;
                case "Home":
                    e.preventDefault();
                    newRating = 1;
                    break;
                case "End":
                    e.preventDefault();
                    newRating = this.options.maxRating;
                    break;
                }

                if (newRating !== this.currentRating) {
                    this.setRating(newRating);
                    this.triggerChange(newRating);
                }
            });
        });

        // Mouse leave container
        this.container.addEventListener("mouseleave", () => {
            if (this.options.readonly) return;
            this.hoverRating = 0;
            this.updateStars(this.currentRating);
        });
    }

    updateStars(rating) {
        const stars = this.container.querySelectorAll(".rating-star");

        stars.forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            const icon = star.querySelector("i");

            if (this.options.allowHalfStars) {
                // Handle half stars
                if (starRating <= Math.floor(rating)) {
                    icon.className = "fas fa-star";
                } else if (starRating === Math.ceil(rating) && rating % 1 >= 0.5) {
                    icon.className = "fas fa-star-half-alt";
                } else {
                    icon.className = "far fa-star";
                }
            } else {
                // Handle full stars only
                icon.className = starRating <= rating ? "fas fa-star" : "far fa-star";
            }
        });

        // Update ARIA value
        const starsContainer = this.container.querySelector(".rating-stars");
        if (starsContainer) {
            starsContainer.setAttribute("aria-valuenow", rating);
        }
    }

    setRating(rating) {
        this.currentRating = Math.min(Math.max(rating, 0), this.options.maxRating);
        this.updateStars(this.currentRating);

        // Update dataset
        this.container.dataset.rating = this.currentRating;
    }

    getRating() {
        return this.currentRating;
    }

    triggerChange(rating) {
        const event = new CustomEvent("ratingChange", {
            detail: { rating },
            bubbles: true
        });
        this.container.dispatchEvent(event);
    }

    reset() {
        this.setRating(0);
    }
}

// Review System
class ReviewSystem {
    constructor(options = {}) {
        this.options = {
            containerId: "reviewContainer",
            formId: "reviewForm",
            ...options
        };

        this.container = document.getElementById(this.options.containerId);
        this.form = document.getElementById(this.options.formId);
        this.reviews = [];

        this.init();
    }

    init() {
        if (!this.container) {
            console.warn("Review container not found");
            return;
        }

        // Load existing reviews
        this.loadReviews();

        // Initialize form if exists
        if (this.form) {
            this.initForm();
        }

        // Initialize rating system
        this.initRatingSystem();
    }

    loadReviews() {
        // Load reviews from server or local storage
        // For demo, we'll use mock data
        this.reviews = [
            {
                id: 1,
                author: "أحمد محمد",
                rating: 5,
                title: "ممتاز جداً",
                content: "قالب رائع وسهل التعديل، أنصح به بشدة",
                date: "2024-01-15",
                helpful: 12
            },
            {
                id: 2,
                author: "سارة علي",
                rating: 4,
                title: "جيد لكن يحتاج تحسين",
                content: "القالب جيد بشكل عام، لكن هناك بعض الميزات التي يمكن إضافتها",
                date: "2024-01-10",
                helpful: 8
            }
        ];

        this.displayReviews();
    }

    displayReviews() {
        const reviewsContainer = this.container.querySelector(".reviews-list");
        if (!reviewsContainer) return;

        const html = this.reviews.map(review => this.createReviewHTML(review)).join("");
        reviewsContainer.innerHTML = html;
    }

    createReviewHTML(review) {
        const stars = this.createStarsHTML(review.rating);

        return `
            <div class="review-item" data-id="${review.id}">
                <div class="review-header">
                    <div class="review-author">
                        <div class="author-avatar">
                            ${review.author.charAt(0)}
                        </div>
                        <div class="author-info">
                            <div class="author-name">${this.escapeHtml(review.author)}</div>
                            <div class="review-date">${this.formatDate(review.date)}</div>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${stars}
                    </div>
                </div>
                <div class="review-content">
                    <h4 class="review-title">${this.escapeHtml(review.title)}</h4>
                    <p class="review-text">${this.escapeHtml(review.content)}</p>
                </div>
                <div class="review-footer">
                    <button class="btn-helpful" data-id="${review.id}">
                        <i class="far fa-thumbs-up"></i>
                        مفيد (${review.helpful})
                    </button>
                    <button class="btn-reply" data-id="${review.id}">
                        <i class="far fa-comment"></i>
                        رد
                    </button>
                </div>
            </div>
        `;
    }

    createStarsHTML(rating) {
        let html = "<div class=\"review-stars\">";
        for (let i = 1; i <= 5; i++) {
            html += `<i class="${i <= rating ? "fas" : "far"} fa-star"></i>`;
        }
        html += "</div>";
        return html;
    }

    initForm() {
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.submitReview();
        });

        // Add helpful and reply button listeners
        this.container.addEventListener("click", (e) => {
            const helpfulBtn = e.target.closest(".btn-helpful");
            if (helpfulBtn) {
                this.markHelpful(helpfulBtn.dataset.id);
            }

            const replyBtn = e.target.closest(".btn-reply");
            if (replyBtn) {
                this.showReplyForm(replyBtn.dataset.id);
            }
        });
    }

    initRatingSystem() {
        const ratingContainer = this.form?.querySelector(".rating-input");
        if (ratingContainer) {
            this.ratingSystem = new RatingSystem({
                containerId: ratingContainer.id,
                maxRating: 5,
                allowHalfStars: false,
                readonly: false
            });
        }
    }

    submitReview() {
        const formData = new FormData(this.form);
        const review = {
            id: Date.now(),
            author: formData.get("author"),
            rating: this.ratingSystem?.getRating() || 0,
            title: formData.get("title"),
            content: formData.get("content"),
            date: new Date().toISOString().split("T")[0],
            helpful: 0
        };

        // Validate review
        if (!this.validateReview(review)) {
            return;
        }

        // Add review
        this.reviews.unshift(review);
        this.displayReviews();
        this.form.reset();
        this.ratingSystem?.reset();

        // Show success message
        notifications.success("تم إضافة مراجعتك بنجاح!");
    }

    validateReview(review) {
        if (!review.author || review.author.trim() === "") {
            notifications.error("يرجى إدخال اسمك");
            return false;
        }

        if (review.rating === 0) {
            notifications.error("يرجى اختيار التقييم");
            return false;
        }

        if (!review.title || review.title.trim() === "") {
            notifications.error("يرجى إدخال عنوان المراجعة");
            return false;
        }

        if (!review.content || review.content.trim() === "") {
            notifications.error("يرجى إدخال محتوى المراجعة");
            return false;
        }

        return true;
    }

    markHelpful(reviewId) {
        const review = this.reviews.find(r => r.id == reviewId);
        if (review) {
            review.helpful++;
            this.displayReviews();
            notifications.success("شكراً على مشاركتك!");
        }
    }

    showReplyForm(reviewId) {
        // Implement reply form display
        notifications.info("ميزة الرد قيد التطوير");
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize review system
document.addEventListener("DOMContentLoaded", () => {
    const reviewSystem = new ReviewSystem({
        containerId: "reviewContainer",
        formId: "reviewForm"
    });
});
