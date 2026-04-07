// Sample stats data
const statsData = {
    revenue: {
        value: 15420,
        change: 12.5,
        trend: "positive"
    },
    orders: {
        value: 245,
        change: 8.3,
        trend: "positive"
    },
    users: {
        value: 128,
        change: 15.2,
        trend: "positive"
    },
    products: {
        value: 567,
        change: -3.1,
        trend: "negative"
    }
};

// Sample recent orders data
const recentOrders = [
    { id: 1001, customer: "أحمد محمد", date: "2024-01-15", amount: 149.97 },
    { id: 1002, customer: "سارة العلي", date: "2024-01-14", amount: 49.99 },
    { id: 1003, customer: "خالد الحربي", date: "2024-01-13", amount: 79.98 },
    { id: 1004, customer: "منى السعيد", date: "2024-01-12", amount: 29.99 },
    { id: 1005, customer: "فهد العتيبي", date: "2024-01-11", amount: 199.96 }
];

// Sample top products data
const topProducts = [
    { id: 1, name: "قالب Landing Page احترافي", sales: 45, revenue: 2249.55 },
    { id: 2, name: "قالب متجر إلكتروني متكامل", sales: 38, revenue: 3799.62 },
    { id: 3, name: "قالب شركة احترافي", sales: 32, revenue: 2559.68 }
];

// Render stats cards
function renderStats() {
    const statsCards = document.querySelectorAll(".stat-card");

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

// Render recent orders
function renderRecentOrders() {
    const ordersList = document.querySelector(".recent-orders");
    if (ordersList) {
        ordersList.innerHTML = recentOrders.map(order => `
            <li>
                <div class="order-info">
                    <div class="order-avatar">
                        ${order.customer.charAt(0)}
                    </div>
                    <div class="order-details">
                        <h4>${order.customer}</h4>
                        <span>${order.date}</span>
                    </div>
                </div>
                <div class="order-amount">${order.amount.toFixed(2)} ر.س</div>
            </li>
        `).join("");
    }
}

// Render top products
function renderTopProducts() {
    const productsList = document.querySelector(".top-products");
    if (productsList) {
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
}

// Update dashboard data
function updateDashboard() {
    renderStats();
    renderRecentOrders();
    renderTopProducts();
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    updateDashboard();

    // Auto-refresh dashboard every 5 minutes (in real app)
    setInterval(updateDashboard, 300000);
});
