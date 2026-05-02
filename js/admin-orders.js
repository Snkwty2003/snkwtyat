// admin-orders.js - Orders management system

const statusLabels = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    completed: 'مكتمل',
    cancelled: 'ملغي'
};

// Sample orders data
let orders = [
    {
        id: 1001,
        date: '2024-01-25',
        customer: 'أحمد محمد',
        phone: '+966501234567',
        products: 'قالب Landing Page',
        amount: 29.99,
        status: 'pending'
    },
    {
        id: 1002,
        date: '2024-01-24',
        customer: 'سارة العلي',
        phone: '+966502345678',
        products: 'متجر إلكتروني',
        amount: 49.99,
        status: 'processing'
    },
    {
        id: 1003,
        date: '2024-01-23',
        customer: 'خالد الحربي',
        phone: '+966503456789',
        products: 'قالب Landing Page',
        amount: 29.99,
        status: 'completed'
    },
    {
        id: 1004,
        date: '2024-01-22',
        customer: 'منى السعيد',
        phone: '+966504567890',
        products: 'موقع شركة + متجر',
        amount: 89.98,
        status: 'cancelled'
    },
    {
        id: 1005,
        date: '2024-01-21',
        customer: 'فهد العتيبي',
        phone: '+966505678901',
        products: 'متجر إلكتروني',
        amount: 49.99,
        status: 'completed'
    },
    {
        id: 1006,
        date: '2024-01-20',
        customer: 'نورة العمري',
        phone: '+966506789012',
        products: 'قالب Landing Page (x2)',
        amount: 59.98,
        status: 'pending'
    }
];

// Pagination
let currentPage = 1;
const itemsPerPage = 10;

// Render orders table
function renderOrders(filteredOrders = orders) {
    const tbody = document.getElementById('ordersTableBody');
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    
    if (currentPage > totalPages) currentPage = totalPages || 1;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const ordersToShow = filteredOrders.slice(startIndex, endIndex);

    tbody.innerHTML = ordersToShow.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.date}</td>
            <td>${order.customer}</td>
            <td>${order.phone}</td>
            <td>${order.products}</td>
            <td>${order.amount.toLocaleString('ar-SA')} ر.س</td>
            <td><span class="order-status ${order.status}">${statusLabels[order.status]}</span></td>
            <td>
                <button class="btn btn-view" onclick="viewOrder(${order.id})">
                    <i class="fas fa-eye"></i> عرض
                </button>
                <button class="btn btn-edit" onclick="editOrderStatus(${order.id})">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn btn-delete" onclick="deleteOrder(${order.id})">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </td>
        </tr>
    `).join('');

    renderPagination(totalPages);
}

// Filter orders
function filterOrders() {
    const status = document.getElementById('statusFilter').value;
    const date = document.getElementById('dateFilter').value;
    const search = document.getElementById('searchFilter').value.toLowerCase();

    let filtered = orders;

    if (status !== 'all') {
        filtered = filtered.filter(order => order.status === status);
    }
    
    if (date) {
        filtered = filtered.filter(order => order.date === date);
    }

    if (search) {
        filtered = filtered.filter(order => 
            order.id.toString().includes(search) ||
            order.customer.toLowerCase().includes(search) ||
            order.phone.includes(search)
        );
    }

    currentPage = 1;
    renderOrders(filtered);
}

// Render pagination
function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    let html = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i> السابق
        </button>
    `;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }

    html += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            التالي <i class="fas fa-chevron-left"></i>
        </button>
    `;

    pagination.innerHTML = html;
}

// Change page
function changePage(page) {
    currentPage = page;
    filterOrders();
}

// Order actions
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    alert(`تفاصيل الطلب #${orderId}:\n\nعميل: ${order.customer}\nمنتجات: ${order.products}\nالمبلغ: ${order.amount} ر.س\nالحالة: ${statusLabels[order.status]}`);
}

function editOrderStatus(orderId) {
    const newStatus = prompt('الحالة الجديدة (pending, processing, completed, cancelled):', 'completed');
    if (newStatus && ['pending', 'processing', 'completed', 'cancelled'].includes(newStatus)) {
        const order = orders.find(o => o.id === orderId);
        order.status = newStatus;
        filterOrders();
        alert('تم تحديث حالة الطلب');
    }
}

function deleteOrder(orderId) {
    if (confirm(`هل تريد حذف الطلب #${orderId}؟`)) {
        orders = orders.filter(o => o.id !== orderId);
        filterOrders();
        alert('تم الحذف');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('statusFilter').addEventListener('change', filterOrders);
    document.getElementById('dateFilter').addEventListener('change', filterOrders);
    document.getElementById('searchFilter').addEventListener('input', filterOrders);
    
    renderOrders();
});

// Export to CSV
function exportOrders() {
    const headers = ['رقم الطلب', 'التاريخ', 'العميل', 'رقم الهاتف', 'المنتجات', 'المبلغ', 'الحالة'];
    const csv = [headers, ...orders.map(o => [
        o.id, o.date, o.customer, o.phone, o.products, o.amount, statusLabels[o.status]
    ])].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
}

