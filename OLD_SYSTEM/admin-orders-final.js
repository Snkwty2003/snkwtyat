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
    const statusFilter = document.getElementById("statusFilter")?.value || "all";
    const dateFilter = document.getElementById("dateFilter")?.value || "";
    const searchFilter = document.getElementById("searchFilter")?.value?.toLowerCase() || "";

    return orders.filter(order => {
        const statusMatch = statusFilter === "all" || order.status === statusFilter;
        const dateMatch = !dateFilter || order.date === dateFilter;
        const searchMatch = !searchFilter ||
            order.id?.toString().includes(searchFilter) ||
            order.customerName?.toLowerCase().includes(searchFilter) ||
            order.customer?.toLowerCase().includes(searchFilter);

        return statusMatch && dateMatch && searchMatch;
    });
}

// Render orders table
function renderOrders() {
    try {
        const tbody = document.getElementById("ordersTableBody");
        if (!tbody) {
            console.error("ordersTableBody not found");
            return;
        }

        const filteredOrders = filterOrders();
        const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

        // Clear table
        tbody.innerHTML = "";

        // Check if no orders
        if (paginatedOrders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="no-orders">لا توجد طلبات</td></tr>`;
            document.getElementById("pagination").innerHTML = "";
            return;
        }

        // Render orders
        paginatedOrders.forEach(order => {
            const statusClass = order.status || "pending";
            const statusText = {
                "pending": "قيد الانتظار",
                "processing": "قيد المعالجة",
                "completed": "مكتمل",
                "cancelled": "ملغي"
            }[order.status] || order.status || "غير محدد";

            const customerName = order.customerName || order.customer || "غير محدد";
            const phone = order.phone || "غير محدد";
            const itemsCount = order.items ? order.items.length : (order.products || 0);
            const amount = order.amount || order.total || 0;
            const date = order.date || order.createdAt ? 
                new Date(order.createdAt.seconds * 1000).toLocaleDateString("ar-SA") : 
                "غير محدد";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>#${order.id || "غير محدد"}</td>
                <td>${date}</td>
                <td>${customerName}</td>
                <td>${phone}</td>
                <td>${itemsCount} عنصر</td>
                <td>${amount.toFixed(2)} ر.س</td>
                <td><span class="order-status ${statusClass}">${statusText}</span></td>
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
            tbody.appendChild(row);
        });

        // Render pagination
        renderPagination(totalPages);
    } catch (error) {
        console.error("Error rendering orders:", error);
    }
}

// Render pagination
function renderPagination(totalPages) {
    try {
        const pagination = document.getElementById("pagination");
        if (!pagination) return;

        pagination.innerHTML = "";

        if (totalPages <= 1) return;

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
    } catch (error) {
        console.error("Error rendering pagination:", error);
    }
}

// View order details
window.viewOrder = function(orderId) {
    try {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            const itemsText = order.items ? order.items.map(item =>
                `- ${item.name || item.productName || "منتج"} (${item.quantity || 1}x) ${item.price || 0} ر.س`
            ).join("\n") : "لا توجد منتجات";

            alert(`تفاصيل الطلب #${order.id}:\n\nالعميل: ${order.customerName || order.customer || "غير محدد"}\nرقم الهاتف: ${order.phone || "غير محدد"}\nالعناصر:\n${itemsText}\nالحالة: ${order.status || "غير محدد"}`);
        }
    } catch (error) {
        console.error("Error viewing order:", error);
    }
};

// Edit order
window.editOrder = async function(orderId) {
    try {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            const newStatus = prompt("تعديل حالة الطلب (pending/processing/completed/cancelled):", order.status);
            if (newStatus && ["pending", "processing", "completed", "cancelled"].includes(newStatus)) {
                try {
                    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
                } catch (error) {
                    console.error("Error updating order:", error);
                    alert("حدث خطأ أثناء تحديث الطلب");
                }
            }
        }
    } catch (error) {
        console.error("Error editing order:", error);
    }
};

// Delete order
window.deleteOrder = async function(orderId) {
    if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
        try {
            await deleteDoc(doc(db, "orders", orderId));
        } catch (error) {
            console.error("Error deleting order:", error);
            alert("حدث خطأ أثناء حذف الطلب");
        }
    }
};

// Fetch orders from Firestore
function fetchOrders() {
    try {
        if (ordersUnsubscribe) {
            ordersUnsubscribe();
            ordersUnsubscribe = null;
        }

        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

        ordersUnsubscribe = onSnapshot(
            q,
            (snapshot) => {
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
                } catch (processingError) {
                    console.error("Error processing orders data:", processingError);
                    try {
                        renderOrders();
                    } catch (renderError) {
                        console.error("Error rendering orders:", renderError);
                    }
                }
            },
            (error) => {
                console.error("Error in orders listener:", error);
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
        fetchOrders();

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
        try {
            renderOrders();
        } catch (renderError) {
            console.error("Error rendering initial UI:", renderError);
        }
    }
});
