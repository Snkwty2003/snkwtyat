// Sample orders data
const orders = [
    {
        id: 1001,
        date: "2024-01-15",
        customer: "أحمد محمد",
        products: 3,
        amount: 149.97,
        status: "pending"
    },
    {
        id: 1002,
        date: "2024-01-14",
        customer: "سارة العلي",
        products: 1,
        amount: 49.99,
        status: "processing"
    },
    {
        id: 1003,
        date: "2024-01-13",
        customer: "خالد الحربي",
        products: 2,
        amount: 79.98,
        status: "completed"
    },
    {
        id: 1004,
        date: "2024-01-12",
        customer: "منى السعيد",
        products: 1,
        amount: 29.99,
        status: "cancelled"
    },
    {
        id: 1005,
        date: "2024-01-11",
        customer: "فهد العتيبي",
        products: 4,
        amount: 199.96,
        status: "pending"
    }
];

// Pagination state
let currentPage = 1;
const itemsPerPage = 10;

// Filter orders
function filterOrders() {
    const statusFilter = document.getElementById("statusFilter").value;
    const dateFilter = document.getElementById("dateFilter").value;
    const searchFilter = document.getElementById("searchFilter").value.toLowerCase();

    return orders.filter(order => {
        const statusMatch = statusFilter === "all" || order.status === statusFilter;
        const dateMatch = !dateFilter || order.date === dateFilter;
        const searchMatch = !searchFilter || 
            order.id.toString().includes(searchFilter) || 
            order.customer.toLowerCase().includes(searchFilter);

        return statusMatch && dateMatch && searchMatch;
    });
}

// Render orders table
function renderOrders() {
    const tbody = document.getElementById("ordersTableBody");
    const filteredOrders = filterOrders();
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    // Clear table
    tbody.innerHTML = "";

    // Render orders
    paginatedOrders.forEach(order => {
        const statusClass = order.status;
        const statusText = {
            "pending": "قيد الانتظار",
            "processing": "قيد المعالجة",
            "completed": "مكتمل",
            "cancelled": "ملغي"
        }[order.status];

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.date}</td>
            <td>${order.customer}</td>
            <td>${order.products} منتج</td>
            <td>${order.amount.toFixed(2)} ر.س</td>
            <td><span class="order-status ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn btn-view" onclick="viewOrder(${order.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-edit" onclick="editOrder(${order.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-delete" onclick="deleteOrder(${order.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Render pagination
    renderPagination(totalPages);
}

// Render pagination
function renderPagination(totalPages) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    // Previous button
    const prevBtn = document.createElement("button");
    prevBtn.innerHTML = "<i class=\"fas fa-chevron-right\"></i>";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderOrders();
        }
    };
    pagination.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        pageBtn.classList.toggle("active", i === currentPage);
        pageBtn.onclick = () => {
            currentPage = i;
            renderOrders();
        };
        pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.innerHTML = "<i class=\"fas fa-chevron-left\"></i>";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderOrders();
        }
    };
    pagination.appendChild(nextBtn);
}

// View order details
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        alert(`تفاصيل الطلب #${order.id}:

العميل: ${order.customer}
التاريخ: ${order.date}
عدد المنتجات: ${order.products}
المبلغ: ${order.amount.toFixed(2)} ر.س
الحالة: ${order.status}`);
    }
}

// Edit order
function editOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const newStatus = prompt("تعديل حالة الطلب (pending/processing/completed/cancelled):", order.status);
        if (newStatus && ["pending", "processing", "completed", "cancelled"].includes(newStatus)) {
            order.status = newStatus;
            renderOrders();
        }
    }
}

// Delete order
function deleteOrder(orderId) {
    if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
        const index = orders.findIndex(o => o.id === orderId);
        if (index > -1) {
            orders.splice(index, 1);
            renderOrders();
        }
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    renderOrders();

    // Add event listeners for filters
    document.getElementById("statusFilter").addEventListener("change", () => {
        currentPage = 1;
        renderOrders();
    });

    document.getElementById("dateFilter").addEventListener("change", () => {
        currentPage = 1;
        renderOrders();
    });

    document.getElementById("searchFilter").addEventListener("input", () => {
        currentPage = 1;
        renderOrders();
    });
});
