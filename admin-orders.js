// Firebase imports
import { db, collection, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy } from "./firebase-config.js";

// Orders data from Firestore
let orders = [];
let ordersUnsubscribe = null;

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
        }[order.status] || order.status;

        const customerName = order.customerName || order.customer || "غير محدد";
        const phone = order.phone || "غير محدد";
        const itemsCount = order.items ? order.items.length : (order.products || 0);
        const amount = order.amount || order.total || 0;
        const date = order.date || order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("ar-SA") : "غير محدد";

        const row = document.createElement("tr");

        // Create status select element
        const statusSelect = document.createElement("select");
        statusSelect.className = "status-select";
        statusSelect.value = order.status;
        statusSelect.innerHTML = `
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>قيد المعالجة</option>
            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>مكتمل</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
        `;

        // Add change event listener to update status
        statusSelect.addEventListener("change", async (e) => {
            const newStatus = e.target.value;
            await updateOrderStatus(order.id, newStatus);
        });

        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${date}</td>
            <td>${customerName}</td>
            <td>${phone}</td>
            <td>${itemsCount} عنصر</td>
            <td>${amount.toFixed(2)} ر.س</td>
            <td class="status-cell"></td>
            <td>
                <button class="btn btn-view" onclick="viewOrder('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-edit" onclick="editOrder('${order.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-delete" onclick="deleteOrder('${order.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Append status select to status cell
        const statusCell = row.querySelector(".status-cell");
        statusCell.appendChild(statusSelect);

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
window.viewOrder = function(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const itemsText = order.items ? order.items.map(item => 
            `- ${item.name || item.productName || "منتج"} (${item.quantity || 1}x) ${item.price || 0} ر.س`
        ).join("\n") : "لا توجد منتجات";
        
        alert(`تفاصيل الطلب #${order.id}:

العميل: ${order.customerName || order.customer || "غير محدد"}
رقم الهاتف: ${order.phone || "غير محدد"}
العناصر:\n${itemsText}\nالحالة: ${order.status}`);
    }
};

// Update order status
window.updateOrderStatus = async function(orderId, newStatus) {
    // Validate orderId
    if (!orderId) {
        console.error("Invalid orderId:", orderId);
        alert("رقم الطلب غير صالح");
        return;
    }

    // Validate newStatus
    const validStatuses = ["pending", "processing", "completed", "cancelled"];
    if (!newStatus || !validStatuses.includes(newStatus)) {
        console.error("Invalid status:", newStatus);
        alert("حالة الطلب غير صالحة");
        return;
    }

    try {
        // Update status in Firestore
        await updateDoc(doc(db, "orders", orderId), {
            status: newStatus
        });

        // Data will be automatically updated via onSnapshot
        console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
        console.error("Error updating order status:", error);
        alert("حدث خطأ أثناء تحديث حالة الطلب");
    }
};

// Edit order
window.editOrder = async function(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const newStatus = prompt("تعديل حالة الطلب (pending/processing/completed/cancelled):", order.status);
        if (newStatus && ["pending", "processing", "completed", "cancelled"].includes(newStatus)) {
            try {
                await updateDoc(doc(db, "orders", orderId), {
                    status: newStatus
                });
                // Data will be automatically updated via onSnapshot
            } catch (error) {
                console.error("Error updating order:", error);
                alert("حدث خطأ أثناء تحديث الطلب");
            }
        }
    }
};

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

// Fetch orders from Firestore - Safe implementation
function fetchOrders() {
    try {
        // Ensure we unsubscribe from previous listener if exists
        if (ordersUnsubscribe) {
            ordersUnsubscribe();
            ordersUnsubscribe = null;
        }

        // Create query with error handling
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

        // Set up real-time listener with comprehensive error handling
        ordersUnsubscribe = onSnapshot(
            q,
            (snapshot) => {
                try {
                    // Reset orders array
                    orders = [];

                    // Safely process each document
                    if (snapshot && snapshot.docs) {
                        snapshot.docs.forEach((doc) => {
                            if (doc && doc.exists) {
                                orders.push({
                                    id: doc.id,
                                    ...doc.data()
                                });
                            }
                        });
                    }

                    // Update UI components safely
                    renderOrders();
                } catch (processingError) {
                    console.error("Error processing orders data:", processingError);
                    // Still attempt to render with whatever data we have
                    try {
                        renderOrders();
                    } catch (renderError) {
                        console.error("Error rendering orders:", renderError);
                    }
                }
            },
            (error) => {
                console.error("Error in orders listener:", error);
                // Handle listener errors gracefully
                orders = [];
                try {
                    renderOrders();
                } catch (renderError) {
                    console.error("Error rendering orders after listener error:", renderError);
                }
            }
        );
    } catch (error) {
        console.error("Error setting up orders listener:", error);
        // Ensure UI shows appropriate state
        orders = [];
        try {
            renderOrders();
        } catch (renderError) {
            console.error("Error rendering orders after setup error:", renderError);
        }
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    try {
        // Fetch orders from Firestore
        fetchOrders();

        // Add event listeners for filters with null checks
        const statusFilter = document.getElementById("statusFilter");
        const dateFilter = document.getElementById("dateFilter");
        const searchFilter = document.getElementById("searchFilter");

        if (statusFilter) {
            statusFilter.addEventListener("change", () => {
                currentPage = 1;
                renderOrders();
            });
        }

        if (dateFilter) {
            dateFilter.addEventListener("change", () => {
                currentPage = 1;
                renderOrders();
            });
        }

        if (searchFilter) {
            searchFilter.addEventListener("input", () => {
                currentPage = 1;
                renderOrders();
            });
        }

        console.log("Orders page initialized successfully");
    } catch (error) {
        console.error("Error initializing orders page:", error);
        // Attempt to render basic UI even if initialization fails
        try {
            renderOrders();
        } catch (renderError) {
            console.error("Error rendering initial UI:", renderError);
        }
    }
});
