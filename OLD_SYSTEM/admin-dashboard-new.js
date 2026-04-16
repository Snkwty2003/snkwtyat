// Firebase imports
import {
  db,
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from "./firebase-config.js";

// Businesses data from Firestore
let businesses = [];
let businessesUnsubscribe = null;

// Orders data from Firestore
let orders = [];
let ordersUnsubscribe = null;

// Stats data (will be calculated from real data)
let statsData = {
    revenue: { value: 0, change: 0, trend: "positive" },
    orders: { value: 0, change: 0, trend: "positive" },
    users: { value: 0, change: 0, trend: "positive" },
    products: { value: 0, change: 0, trend: "positive" }
};

// Calculate stats from real data
function calculateStats() {
    try {
        const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
        const totalOrders = orders.length;
        const totalBusinesses = businesses.length;
        const totalProducts = businesses.reduce((sum, business) => 
            sum + (business.products?.length || 0), 0);

        statsData = {
            revenue: { 
                value: totalRevenue, 
                change: 12.5, 
                trend: "positive" 
            },
            orders: { 
                value: totalOrders, 
                change: 8.3, 
                trend: "positive" 
            },
            users: { 
                value: totalBusinesses, 
                change: 15.2, 
                trend: "positive" 
            },
            products: { 
                value: totalProducts, 
                change: -3.1, 
                trend: "negative" 
            }
        };
    } catch (error) {
        console.error("Error calculating stats:", error);
    }
}

// Render stats cards
function renderStats() {
    const statsCards = document.querySelectorAll(".stat-card");

    if (statsCards.length === 0) return;

    statsCards.forEach((card, index) => {
        const statKey = Object.keys(statsData)[index];
        const stat = statsData[statKey];

        const valueElement = card.querySelector(".stat-value");
        const changeElement = card.querySelector(".stat-change");

        if (valueElement) {
            valueElement.textContent = statKey === "revenue"
                ? `${stat.value.toLocaleString()} ر.س`
                : stat.value.toLocaleString();
        }

        if (changeElement) {
            const trendIcon = stat.trend === "positive" ? "fa-arrow-up" : "fa-arrow-down";
            const trendClass = stat.trend === "positive" ? "positive" : "negative";

            changeElement.innerHTML = `
                <i class="fas ${trendIcon}"></i>
                <span>${Math.abs(stat.change)}% من الشهر الماضي</span>
            `;
            changeElement.className = `stat-change ${trendClass}`;
        }
    });
}

// Render orders in the dashboard
function renderRecentOrders() {
    const ordersList = document.querySelector(".recent-orders");
    if (!ordersList) return;

    if (orders.length === 0) {
        ordersList.innerHTML = `<li class="no-orders">لا توجد طلبات حالياً</li>`;
        return;
    }

    ordersList.innerHTML = orders.slice(0, 5).map(order => `
        <li>
            <div class="order-info">
                <div class="order-avatar">
                    ${(order.customerName || order.customer || "عميل").charAt(0)}
                </div>
                <div class="order-details">
                    <h4>${order.customerName || order.customer || "عميل غير مسجل"}</h4>
                    <span>${order.date || order.createdAt || new Date().toLocaleDateString("ar-SA")}</span>
                </div>
            </div>
            <div class="order-amount">${(order.amount || order.total || 0).toFixed(2)} ر.س</div>
        </li>
    `).join("");
}

// Render top products from real data
function renderTopProducts() {
    const productsList = document.querySelector(".top-products");
    if (!productsList) return;

    // Collect all products from all businesses
    const allProducts = [];
    businesses.forEach(business => {
        if (business.products && Array.isArray(business.products)) {
            business.products.forEach(product => {
                allProducts.push({
                    name: product.name || "منتج بدون اسم",
                    sales: product.sales || 0,
                    revenue: product.revenue || 0,
                    businessName: business.name || ""
                });
            });
        }
    });

    // Sort by sales and get top 5
    const topProducts = allProducts
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

    if (topProducts.length === 0) {
        productsList.innerHTML = `<li class="no-products">لا توجد منتجات حالياً</li>`;
        return;
    }

    productsList.innerHTML = topProducts.map(product => `
        <li>
            <div class="product-info">
                <h4>${product.name}</h4>
                <span>${product.sales} مبيعات</span>
            </div>
            <div class="product-revenue">${product.revenue.toFixed(2)} ر.س</div>
        </li>
    `).join("");
}

// Fetch businesses from Firestore
function fetchBusinesses() {
    try {
        const q = query(collection(db, "businesses"));
        businessesUnsubscribe = onSnapshot(q, (snapshot) => {
            businesses = [];
            snapshot.forEach((doc) => {
                businesses.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            renderBusinesses();
            calculateStats();
            renderStats();
            renderTopProducts();
        });
    } catch (error) {
        console.error("Error fetching businesses:", error);
    }
}

// Render businesses cards
function renderBusinesses() {
    const businessesContainer = document.getElementById("businessesContainer");
    if (!businessesContainer) {
        // Create businesses container if it doesn't exist
        const mainContent = document.querySelector(".main-content");
        if (mainContent) {
            const businessesSection = document.createElement("div");
            businessesSection.id = "businessesContainer";
            businessesSection.innerHTML = `
                <div class="content-card" style="margin-top: 30px;">
                    <div class="card-header">
                        <h3>الأنشطة التجارية</h3>
                    </div>
                    <div class="businesses-grid" id="businessesGrid"></div>
                </div>
            `;
            mainContent.appendChild(businessesSection);
        }
    }

    const businessesGrid = document.getElementById("businessesGrid");
    if (businessesGrid) {
        if (businesses.length === 0) {
            businessesGrid.innerHTML = `<div class="no-businesses">لا توجد أنشطة تجارية حالياً</div>`;
            return;
        }

        businessesGrid.innerHTML = businesses.map(business => `
            <div class="business-card">
                <div class="business-info">
                    <h4>${business.name || "بدون اسم"}</h4>
                    <p><i class="fas fa-phone"></i> ${business.phone || "لا يوجد رقم"}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${business.location || "لا يوجد موقع"}</p>
                    <p><i class="fas fa-store"></i> ${business.type || "غير محدد"}</p>
                </div>
                <button class="btn btn-delete" onclick="deleteBusiness('${business.id}')">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        `).join("");
    }
}

// Delete business
window.deleteBusiness = async function(businessId) {
    if (confirm("هل أنت متأكد من حذف هذا النشاط التجاري؟")) {
        try {
            await deleteDoc(doc(db, "businesses", businessId));
            // Data will be automatically updated via onSnapshot
        } catch (error) {
            console.error("Error deleting business:", error);
            alert("حدث خطأ أثناء حذف النشاط التجاري");
        }
    }
};

// Fetch orders from Firestore
function fetchOrders() {
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        ordersUnsubscribe = onSnapshot(q, (snapshot) => {
            orders = [];
            snapshot.forEach((doc) => {
                orders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            renderOrders();
            renderRecentOrders();
            calculateStats();
            renderStats();
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
    }
}

// Render orders in the orders management section
function renderOrders() {
    const ordersTable = document.querySelector(".orders-table tbody");
    if (!ordersTable) return;

    if (orders.length === 0) {
        ordersTable.innerHTML = `
            <tr>
                <td colspan="5" class="no-orders">لا توجد طلبات حالياً</td>
            </tr>
        `;
        return;
    }

    ordersTable.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id || order.orderId || "-"}</td>
            <td>${order.customerName || order.customer || "عميل غير مسجل"}</td>
            <td>${order.businessName || order.restaurant || "-"}</td>
            <td>${order.status || "قيد المعالجة"}</td>
            <td>${(order.amount || order.total || 0).toFixed(2)} ر.س</td>
            <td>
                <button class="btn btn-delete" onclick="deleteOrder('${order.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

// Delete order
window.deleteOrder = async function(orderId) {
    if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
        try {
            await deleteDoc(doc(db, "orders", orderId));
            // Data will be automatically updated via onSnapshot
        } catch (error) {
            console.error("Error deleting order:", error);
            alert("حدث خطأ أثناء حذف الطلب");
        }
    }
};

// Update dashboard data
function updateDashboard() {
    calculateStats();
    renderStats();
    renderRecentOrders();
    renderTopProducts();
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    updateDashboard();
    fetchBusinesses();
    fetchOrders();
});
