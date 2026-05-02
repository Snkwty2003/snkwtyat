// admin-dashboard.js - Dynamic data loading
// Sample data (replace with Firebase/localStorage later)

const dashboardData = {
    stats: [
        { title: 'إجمالي المبيعات', value: '15,420 ر.س', change: '+12.5%', icon: 'fas fa-dollar-sign', color: 'revenue' },
        { title: 'عدد الطلبات', value: '245', change: '+8.3%', icon: 'fas fa-shopping-bag', color: 'orders' },
        { title: 'المستخدمون الجدد', value: '128', change: '+15.2%', icon: 'fas fa-users', color: 'users' },
        { title: 'المنتجات المباعة', value: '567', change: '-3.1%', icon: 'fas fa-box', color: 'products' }
    ],
    recentOrders: [
        { id: '#001', customer: 'أحمد محمد', time: 'منذ ساعتين', amount: '149.97 ر.س' },
        { id: '#002', customer: 'سارة العلي', time: 'منذ 5 ساعات', amount: '79.98 ر.س' },
        { id: '#003', customer: 'خالد الحربي', time: 'منذ يوم', amount: '29.99 ر.س' },
        { id: '#004', customer: 'منى السعيد', time: 'منذ يومين', amount: '199.99 ر.س' },
        { id: '#005', customer: 'فهد العتيبي', time: 'منذ 3 أيام', amount: '49.99 ر.س' }
    ]
};

// Render stats
function renderStats() {
    const grid = document.querySelector('.stats-grid');
    grid.innerHTML = dashboardData.stats.map(stat => `
        <div class="stat-card">
            <div class="stat-header">
                <span class="stat-title">${stat.title}</span>
                <div class="stat-icon ${stat.color}">
                    <i class="${stat.icon}"></i>
                </div>
            </div>
            <div class="stat-value">${stat.value}</div>
            <div class="stat-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}">
                <i class="fas ${stat.change.startsWith('+') ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                <span>${stat.change}</span>
            </div>
        </div>
    `).join('');
}

// Render recent orders
function renderRecentOrders() {
    const tbody = document.querySelector('.recent-orders');
    tbody.innerHTML = dashboardData.recentOrders.map(order => `
        <li>
            <div class="order-info">
                <div class="order-avatar">${order.customer.charAt(0)}</div>
                <div class="order-details">
                    <h4>${order.customer}</h4>
                    <span>${order.time}</span>
                </div>
            </div>
            <div class="order-amount">${order.amount}</div>
        </li>
    `).join('');
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    renderStats();
    renderRecentOrders();
    
    // Sidebar toggle for mobile
    const sidebar = document.querySelector('.sidebar');
    const toggleBtns = document.querySelectorAll('[data-toggle-sidebar]');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !e.target.matches('[data-toggle-sidebar]')) {
            sidebar.classList.remove('show');
        }
    });
});

