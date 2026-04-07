// =======================
// CHECKOUT JAVASCRIPT
// =======================

// Initialize checkout
function initCheckout() {
    loadCartItems();
    updateOrderSummary();
    setupEventListeners();
    validateCheckoutForm();
}

// Load cart items
function loadCartItems() {
    const cart = storage.get("cart") || [];
    const summaryItems = document.getElementById("summary-items");

    if (!summaryItems) return;

    if (cart.length === 0) {
        summaryItems.innerHTML = "<p class=\"empty-cart\">السلة فارغة</p>";
        return;
    }

    summaryItems.innerHTML = cart.map(item => `
        <div class="summary-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>${formatPrice(item.price)} × ${item.quantity}</p>
            </div>
            <div class="item-total">
                ${formatPrice(item.price * item.quantity)}
            </div>
        </div>
    `).join("");
}

// Update order summary
function updateOrderSummary() {
    const cart = storage.get("cart") || [];

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 10 : 0;
    const total = subtotal + shipping;

    const subtotalEl = document.getElementById("subtotal");
    const shippingEl = document.getElementById("shipping");
    const totalEl = document.getElementById("total");

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = formatPrice(shipping);
    if (totalEl) totalEl.textContent = formatPrice(total);
}

// Setup event listeners
function setupEventListeners() {
    // Payment method selection
    const paymentMethods = document.querySelectorAll(".payment-method");
    paymentMethods.forEach(method => {
        method.addEventListener("click", function() {
            paymentMethods.forEach(m => m.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // Form submission
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", handleCheckout);
    }
}

// Validate checkout form
function validateCheckoutForm() {
    const form = document.getElementById("checkout-form");
    if (!form) return;

    const inputs = form.querySelectorAll("input[required], select[required]");

    inputs.forEach(input => {
        input.addEventListener("blur", function() {
            validateField(this);
        });

        input.addEventListener("input", function() {
            if (this.classList.contains("error")) {
                validateField(this);
            }
        });
    });
}

// Validate single field
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = "";

    if (field.hasAttribute("required") && !value) {
        isValid = false;
        errorMessage = "هذا الحقل مطلوب";
    } else if (field.type === "email" && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = "البريد الإلكتروني غير صحيح";
    } else if (field.type === "tel" && value && !isValidPhone(value)) {
        isValid = false;
        errorMessage = "رقم الهاتف غير صحيح";
    }

    const errorElement = field.parentElement.querySelector(".error-message");

    if (!isValid) {
        field.classList.add("error");
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    } else {
        field.classList.remove("error");
        if (errorElement) {
            errorElement.textContent = "";
        }
    }

    return isValid;
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone
function isValidPhone(phone) {
    const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return re.test(phone);
}

// Handle checkout
function handleCheckout(e) {
    e.preventDefault();

    // Validate all fields
    const form = e.target;
    const inputs = form.querySelectorAll("input[required], select[required]");
    let isFormValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });

    if (!isFormValid) {
        showToast("يرجى تصحيح الأخطاء في النموذج", "error");
        return;
    }

    // Check if cart is empty
    const cart = storage.get("cart") || [];
    if (cart.length === 0) {
        showToast("السلة فارغة", "error");
        return;
    }

    // Process order
    processOrder();
}

// Process order
function processOrder() {
    // Show loading state
    const submitButton = document.querySelector("#checkout-form button[type=\"submit\"]");
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = "<i class=\"fas fa-spinner fa-spin\"></i> جاري معالجة الطلب...";
    }

    // Simulate API call
    setTimeout(() => {
        // Clear cart
        storage.remove("cart");

        // Show success message
        showToast("تم إرسال طلبك بنجاح!", "success");

        // Redirect to home page
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    }, 2000);
}

// Initialize checkout on DOM ready
document.addEventListener("DOMContentLoaded", initCheckout);
