// Sample sales data for the chart
const salesData = {
    months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"],
    values: [12000, 15000, 13500, 18000, 16500, 20000]
};

// Sample top products data
const topProducts = [
    { id: 1, name: "قالب Landing Page احترافي", sales: 45, revenue: 2249.55 },
    { id: 2, name: "قالب متجر إلكتروني متكامل", sales: 38, revenue: 3799.62 },
    { id: 3, name: "قالب شركة احترافي", sales: 32, revenue: 2559.68 },
    { id: 4, name: "قالب مدونة عصرية", sales: 28, revenue: 1119.72 }
];

// Sample recent orders data
const recentOrders = [
    { id: 1001, customer: "أحمد محمد", date: "2024-01-15", amount: 149.97 },
    { id: 1002, customer: "سارة العلي", date: "2024-01-14", amount: 49.99 },
    { id: 1003, customer: "خالد الحربي", date: "2024-01-13", amount: 79.98 },
    { id: 1004, customer: "منى السعيد", date: "2024-01-12", amount: 29.99 },
    { id: 1005, customer: "فهد العتيبي", date: "2024-01-11", amount: 199.96 }
];

// Render sales chart
function renderSalesChart() {
    const chartContainer = document.querySelector(".chart-placeholder");
    if (chartContainer) {
        // Create a simple bar chart using HTML/CSS
        const maxValue = Math.max(...salesData.values);
        const bars = salesData.values.map((value, index) => {
            const height = (value / maxValue) * 100;
            return `
                <div class="chart-bar" style="height: ${height}%;">
                    <div class="bar-value">${value.toLocaleString()} ر.س</div>
                    <div class="bar-label">${salesData.months[index]}</div>
                </div>
            `;
        }).join("");

        chartContainer.innerHTML = `
            <div class="chart-bars">
                ${bars}
            </div>
        `;
    }
}

// Render top products table
function renderTopProducts() {
    const table = document.querySelector(".reports-table table tbody");
    if (table) {
        table.innerHTML = topProducts.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.sales}</td>
                <td>${product.revenue.toFixed(2)} ر.س</td>
            </tr>
        `).join("");
    }
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

// Handle chart filter buttons
function setupChartFilters() {
    const filterButtons = document.querySelectorAll(".chart-filter");
    filterButtons.forEach(button => {
        button.addEventListener("click", function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove("active"));
            // Add active class to clicked button
            this.classList.add("active");
            // Re-render chart with new data (in real app, this would fetch new data)
            renderSalesChart();
        });
    });
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    renderSalesChart();
    renderTopProducts();
    renderRecentOrders();
    setupChartFilters();
});
