// Firebase imports
import {
  db,
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  auth,
  onAuthStateChanged,
  getDoc,
  signOut
} from "./firebase-config.js";

// التحقق من تسجيل الدخول
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
        window.location.href = 'admin-login.html';
        return;
    }

    // إظهار اسم المستخدم
    const userSpan = document.querySelector('.user-info span');
    if (userSpan) userSpan.textContent = user.email;
});

// تسجيل الخروج
window.logout = async function() {
    await signOut(auth);
    localStorage.removeItem('adminUser');
    window.location.href = 'admin-login.html';
}

// Businesses data from Firestore
let businesses = [];
let businessesUnsubscribe = null;

// Orders data from Firestore
let orders = [];
let ordersUnsubscribe = null;

// Stats data
let statsData = {
    revenue: { value: 0, change: 0, trend: "neutral" },
    orders: { value: 0, change: 0, trend: "neutral" },
    users: { value: 0, change: 0, trend: "neutral" },
    products: { value: 0, change: 0, trend: "neutral" }
};

function calculateTrend(change) {
    if (change > 0) return "positive";
    if (change < 0) return "negative";
    return "neutral";
}

function createStat(value, change = 0) {
    return { value, change, trend: calculateTrend(change) };
}

function calculateStats() {
    try {
        const totalRevenue = orders.reduce((sum, order) => {
            const amount = parseFloat(order.amount || order.total || 0);
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        const totalOrders = orders.length;
        const totalBusinesses = businesses.length;
        const totalProducts = businesses.reduce((sum, business) => 
            sum + (business.products?.length || 0), 0);

        statsData = {
            revenue: { value: totalRevenue, change: 0, trend: "neutral" },
            orders: { value: totalOrders, change: 0, trend: "neutral" },
            users: { value: totalBusinesses, change: 0, trend: "neutral" },
            products: { value: totalProducts, change: 0, trend: "neutral" }
        };
    } catch (error) {
        console.error("Error calculating stats:", error);
    }
}

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
                    <span>${order.date || new Date().toLocaleDateString("ar-SA")}</span>
                </div>
            </div>
            <div class="order-amount">${(order.amount || order.total || 0).toFixed(2)} ر.س</div>
        </li>
    `).join("");
}

function renderTopProducts() {
    const productsList = document.querySelector(".top-products");
    if (!productsList) return;

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

    const topProducts = allProducts.sort((a, b) => b.sales - a.sales).slice(0, 5);

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

function fetchBusinesses() {
    try {
        const q = query(collection(db, "businesses"));
        businessesUnsubscribe = onSnapshot(q, (snapshot) => {
            businesses = [];
            snapshot.forEach((doc) => {
                businesses.push({ id: doc.id, ...doc.data() });
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

function renderBusinesses() {
    const businessesContainer = document.getElementById("businessesContainer");
    if (!businessesContainer) {
        const mainContent = document.querySelector(".main-content");
        if (mainContent) {
            const businessesSection = document.createElement("div");
            businessesSection.id = "businessesContainer";
            businessesSection.innerHTML = `
                <div class="content-card" style="margin-top: 30px;">
                    <div class="card-header"><h3>الأنشطة التجارية</h3></div>
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

window.deleteBusiness = async function(businessId) {
    if (confirm("هل أنت متأكد من حذف هذا النشاط التجاري؟")) {
        try {
            await deleteDoc(doc(db, "businesses", businessId));
        } catch (error) {
            console.error("Error deleting business:", error);
            alert("حدث خطأ أثناء حذف النشاط التجاري");
        }
    }
};

function fetchOrders() {
    try {
        if (ordersUnsubscribe) {
            ordersUnsubscribe();
            ordersUnsubscribe = null;
        }

        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        ordersUnsubscribe = onSnapshot(q, (snapshot) => {
            try {
                orders = [];
                if (snapshot && snapshot.docs) {
                    snapshot.docs.forEach((doc) => {
                        if (doc && doc.exists) {
                            orders.push({ id: doc.id, ...doc.data() });
                        }
                    });
                }
                renderOrders();
                renderRecentOrders();
                calculateStats();
                renderStats();
            } catch (processingError) {
                console.error("Error processing orders data:", processingError);
            }
        }, (error) => {
            console.error("Error in orders listener:", error);
            orders = [];
        });
    } catch (error) {
        console.error("Error setting up orders listener:", error);
        orders = [];
    }
}

function renderOrders() {
    try {
        const ordersTable = document.querySelector(".orders-table tbody");
        if (!ordersTable) return;

        if (!orders || orders.length === 0) {
            ordersTable.innerHTML = `
                <tr><td colspan="6" class="no-orders">لا توجد طلبات حالياً</td></tr>
            `;
            return;
        }

        ordersTable.innerHTML = orders.map(order => {
            if (!order) return '';
            const orderId = order.id || '-';
            const customerName = order.customerName || order.customer || 'عميل غير مسجل';
            const businessName = order.businessName || order.restaurant || '-';
            const status = order.status || 'قيد المعالجة';
            const amount = parseFloat(order.amount || order.total || 0).toFixed(2);
            return `
                <tr>
                    <td>#${orderId}</td>
                    <td>${customerName}</td>
                    <td>${businessName}</td>
                    <td>${status}</td>
                    <td>${amount} ر.س</td>
                    <td>
                        <button class="btn btn-delete" onclick="deleteOrder('${order.id || ''}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error("Error rendering orders:", error);
    }
}

window.deleteOrder = async function(orderId) {
    if (!orderId) { alert("معرف الطلب غير صالح"); return; }
    if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
        try {
            await deleteDoc(doc(db, "orders", orderId));
        } catch (error) {
            console.error("Error deleting order:", error);
            alert("حدث خطأ أثناء حذف الطلب");
        }
    }
};

function updateDashboard() {
    calculateStats();
    renderStats();
    renderRecentOrders();
    renderTopProducts();
}

document.addEventListener("DOMContentLoaded", function() {
    try {
        updateDashboard();
        fetchBusinesses();
        fetchOrders();
        console.log("Dashboard initialized successfully");
    } catch (error) {
        console.error("Error initializing dashboard:", error);
    }
});