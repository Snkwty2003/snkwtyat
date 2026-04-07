// =======================
// STORE JAVASCRIPT
// =======================

// Products data
const products = [
    {
        id: 1,
        name: "قالب Landing Page احترافي",
        desc: "قالب صفحة هبوط عصري ومتجاوب مع جميع الأجهزة",
        price: 29.99,
        category: "landing",
        image: "banner/banner1.png",
        features: ["متجاوب", "سريع", "سهل التعديل"]
    },
    {
        id: 2,
        name: "قالب متجر إلكتروني",
        desc: "قالب متجر إلكتروني متكامل مع نظام سلة تسوق",
        price: 49.99,
        category: "store",
        image: "banner/banner3.png",
        features: ["متجر كامل", "سلة تسوق", "بوابة دفع"]
    },
    {
        id: 3,
        name: "قالب شركة",
        desc: "قالب احترافي للشركات والمشاريع",
        price: 39.99,
        category: "company",
        image: "banner/banner5.png",
        features: ["صفحات متعددة", "معرض أعمال", "اتصال بنا"]
    },
    {
        id: 4,
        name: "قالب مدونة",
        desc: "قالب مدونة عصرية مع تصميم أنيق",
        price: 24.99,
        category: "blog",
        image: "banner/banner.png",
        features: ["تصميم نظيف", "سهولة القراءة", "مشاركة اجتماعية"]
    }
];

// Cart state
let cart = storage.get("cart") || [];

// Initialize store
function initStore() {
    renderProducts(products);
    updateCartUI();
    setupEventListeners();
}

// Render products
function renderProducts(productsToRender) {
    const container = document.getElementById("products-container");
    if (!container) return;

    container.innerHTML = productsToRender.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-overlay">
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i>
                        أضف للسلة
                    </button>
                    <button class="btn btn-secondary" onclick="viewProduct(${product.id})">
                        <i class="fas fa-eye"></i>
                        معاينة
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.desc}</p>
                <div class="product-features">
                    ${product.features.map(f => `<span>${f}</span>`).join("")}
                </div>
                <div class="product-price">
                    <span class="price">${formatPrice(product.price)}</span>
                </div>
            </div>
        </div>
    `).join("");
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    storage.set("cart", cart);
    updateCartUI();
    showToast("تمت إضافة المنتج للسلة");
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    storage.set("cart", cart);
    updateCartUI();
}

// Update cart quantity
function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        storage.set("cart", cart);
        updateCartUI();
    }
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.getElementById("cart-count");
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = "<p class=\"empty-cart\">السلة فارغة</p>";
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>${formatPrice(item.price)}</p>
                        <div class="quantity-controls">
                            <button onclick="updateCartQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join("");
        }
    }

    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = formatPrice(total);
    }
}

// Clear cart
function clearCart() {
    if (confirm("هل أنت متأكد من تفريغ السلة؟")) {
        cart = [];
        storage.set("cart", cart);
        updateCartUI();
        showToast("تم تفريغ السلة");
    }
}

// View product details
function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Open modal with product details
    const modal = document.getElementById("product-modal");
    if (modal) {
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal" onclick="closeModal()">&times;</button>
                <div class="product-details">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="details">
                        <h2>${product.name}</h2>
                        <p>${product.desc}</p>
                        <div class="features">
                            ${product.features.map(f => `<span>${f}</span>`).join("")}
                        </div>
                        <div class="price">${formatPrice(product.price)}</div>
                        <button class="btn btn-primary" onclick="addToCart(${product.id}); closeModal();">
                            <i class="fas fa-cart-plus"></i>
                            أضف للسلة
                        </button>
                    </div>
                </div>
            </div>
        `;
        modal.style.display = "flex";
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById("product-modal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", debounce(function() {
            const searchTerm = this.value.toLowerCase();
            const filtered = products.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.desc.toLowerCase().includes(searchTerm)
            );
            renderProducts(filtered);
        }, 300));
    }

    // Filter functionality
    const filterSelect = document.getElementById("filter-select");
    if (filterSelect) {
        filterSelect.addEventListener("change", function() {
            const category = this.value;
            if (category === "all") {
                renderProducts(products);
            } else {
                const filtered = products.filter(p => p.category === category);
                renderProducts(filtered);
            }
        });
    }

    // Cart toggle
    const cartToggle = document.getElementById("cart-toggle");
    const cartBox = document.getElementById("cart-box");
    if (cartToggle && cartBox) {
        cartToggle.addEventListener("click", function() {
            cartBox.classList.toggle("show");
        });
    }

    // Close modal on outside click
    window.addEventListener("click", function(e) {
        const modal = document.getElementById("product-modal");
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Initialize store on DOM ready
document.addEventListener("DOMContentLoaded", initStore);
