// Firebase imports
import { db, collection, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy, auth, onAuthStateChanged, getDoc, signOut } from "./firebase-config.js";

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
});

// تسجيل الخروج
window.logout = async function() {
    await signOut(auth);
    localStorage.removeItem('adminUser');
    window.location.href = 'admin-login.html';
}

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
            (order.customerName || order.customer || "").toLowerCase().includes(searchFilter);
        return statusMatch && dateMatch && searchMatch;
    });
}

// Render orders table
function renderOrders() {
    const tbody = document.getElementById("ordersTableBody");
    const filteredOrders = filterOrders();
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    tbody.innerHTML = "";

    paginatedOrders.forEach(order => {
        const customerName = order.customerName || order.customer || "غير محدد";
        const phone = order.phone || "غير محدد";
        const itemsCount = order.items ? order.items.length : (order.products || 0);
        const amount = order.amount || order.total || 0;
        const date = order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("ar-SA") : (order.date || "غير محدد");

        const row = document.createElement("tr");

        const statusSelect = document.createElement("select");
        statusSelect.className = "status-select";
        statusSelect.innerHTML = `
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>قيد المعالجة</option>
            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>مكتمل</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
        `;
        statusSelect.addEventListener("change", async (e) => {
            await updateOrderStatus(order.id, e.target.value);
        });

        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${date}</td>
            <td>${customerName}</td>
            <td>${phone}</td>
            <td>${itemsCount} عنصر</td>
            <td>${Number(amount).toFixed(2)} ر.س</td>
            <td class="status-cell"></td>
            <td>
                <button class="btn btn-view" onclick="viewOrder('${order.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-delete" onclick="deleteOrder('${order.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;

        row.querySelector(".status-cell").appendChild(statusSelect);
        tbody.appendChild(row);
    });

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const prevBtn = document.createElement("button");
    prevBtn.innerHTML = "<i class='fas fa-chevron-right'></i>";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderOrders(); } };
    pagination.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        pageBtn.classList.toggle("active", i === currentPage);
        pageBtn.onclick = () => { currentPage = i; renderOrders(); };
        pagination.appendChild(pageBtn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.innerHTML = "<i class='fas fa-chevron-left'></i>";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderOrders(); } };
    pagination.appendChild(nextBtn);
}

window.viewOrder = function(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const itemsText = order.items ? order.items.map(item => 
            `- ${item.name || "منتج"} (${item.quantity || 1}x) ${item.price || 0} ر.س`
        ).join("\n") : "لا توجد منتجات";
        alert(`تفاصيل الطلب #${order.id}:\nالعميل: ${order.customerName || "غير محدد"}\nالهاتف: ${order.phone || "غير محدد"}\nالعناصر:\n${itemsText}\nالحالة: ${order.status}`);
    }
};

window.updateOrderStatus = async function(orderId, newStatus) {
    if (!orderId) return;
    const validStatuses = ["pending", "processing", "completed", "cancelled"];
    if (!validStatuses.includes(newStatus)) return;
    try {
        await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    } catch (error) {
        console.error("Error updating order status:", error);
        alert("حدث خطأ أثناء تحديث حالة الطلب");
    }
};

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

function fetchOrders() {
    try {
        if (ordersUnsubscribe) { ordersUnsubscribe(); ordersUnsubscribe = null; }
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        ordersUnsubscribe = onSnapshot(q, (snapshot) => {
            orders = [];
            if (snapshot && snapshot.docs) {
                snapshot.docs.forEach((doc) => {
                    if (doc && doc.exists) {
                        orders.push({ id: doc.id, ...doc.data() });
                    }
                });
            }
            renderOrders();
        }, (error) => {
            console.error("Error in orders listener:", error);
            orders = [];
        });
    } catch (error) {
        console.error("Error setting up orders listener:", error);
        orders = [];
    }
}

document.addEventListener("DOMContentLoaded", function() {
    fetchOrders();

    const statusFilter = document.getElementById("statusFilter");
    const dateFilter = document.getElementById("dateFilter");
    const searchFilter = document.getElementById("searchFilter");

    if (statusFilter) statusFilter.addEventListener("change", () => { currentPage = 1; renderOrders(); });
    if (dateFilter) dateFilter.addEventListener("change", () => { currentPage = 1; renderOrders(); });
    if (searchFilter) searchFilter.addEventListener("input", () => { currentPage = 1; renderOrders(); });
});