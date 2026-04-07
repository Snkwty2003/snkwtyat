// Sample products data
const products = [
    {
        id: 1,
        name: "قالب Landing Page احترافي",
        description: "قالب صفحة هبوط احترافي مع تصميم عصري",
        price: 49.99,
        category: "landing",
        status: "active",
        image: "banner/banner1.png"
    },
    {
        id: 2,
        name: "قالب متجر إلكتروني متكامل",
        description: "قالب متجر إلكتروني مع جميع الميزات الأساسية",
        price: 99.99,
        category: "store",
        status: "active",
        image: "banner/banner3.png"
    },
    {
        id: 3,
        name: "قالب شركة احترافي",
        description: "قالب شركة مع تصميم عصري واحترافي",
        price: 79.99,
        category: "company",
        status: "active",
        image: "banner/banner5.png"
    },
    {
        id: 4,
        name: "قالب مدونة عصرية",
        description: "قالب مدونة مع تصميم عصري وجذاب",
        price: 39.99,
        category: "blog",
        status: "inactive",
        image: "banner/banner.png"
    }
];

// Category labels
const categoryLabels = {
    landing: "صفحة هبوط",
    store: "متجر إلكتروني",
    company: "شركة",
    blog: "مدونة"
};

// Render products grid
function renderProducts(filteredProducts) {
    const grid = document.getElementById("productsGrid");
    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <span class="product-status ${product.status}">
                    ${product.status === "active" ? "نشط" : "غير نشط"}
                </span>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-meta">
                    <span class="product-price">${product.price.toFixed(2)} ر.س</span>
                    <span class="product-category">${categoryLabels[product.category]}</span>
                </div>
                <div class="product-actions">
                    <button class="btn-action btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

// Filter products
function filterProducts() {
    const category = document.getElementById("categoryFilter").value;
    const status = document.getElementById("statusFilter").value;
    const search = document.getElementById("searchFilter").value.toLowerCase();

    let filtered = products;

    if (category !== "all") {
        filtered = filtered.filter(product => product.category === category);
    }

    if (status !== "all") {
        filtered = filtered.filter(product => product.status === status);
    }

    if (search) {
        filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(search) ||
            product.description.toLowerCase().includes(search)
        );
    }

    renderProducts(filtered);
}

// Add new product
function openAddProductModal() {
    alert("فتح نموذج إضافة منتج جديد");
}

// Edit product
function editProduct(productId) {
    alert(`تعديل المنتج #${productId}`);
}

// Delete product
function deleteProduct(productId) {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
        alert(`تم حذف المنتج #${productId}`);
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    renderProducts(products);

    // Add event listeners to filters
    document.getElementById("categoryFilter").addEventListener("change", filterProducts);
    document.getElementById("statusFilter").addEventListener("change", filterProducts);
    document.getElementById("searchFilter").addEventListener("input", filterProducts);
});
