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

// حساب وعرض الإحصائيات الحقيقية
function calculateStats() {
    try {
        const totalRevenue = orders.reduce((sum, order) => {
            const amount = parseFloat(order.amount || order.total || 0);
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        const totalOrders = orders.length;
        const uniqueCustomers = new Set(orders.map(o => o.phone || o.customerName)).size;
        const completedOrders = orders.filter(o => o.status === 'completed').length;

        const revenueEl = document.getElementById('stat-revenue');
        const ordersEl = document.getElementById('stat-orders');
        const customersEl = document.getElementById('stat-customers');
        const completedEl = document.getElementById('stat-completed');

        if (revenueEl) revenueEl.textContent = `${totalRevenue.toFixed(2)} ر.س`;
        if (ordersEl) ordersEl.textContent = totalOrders;
        if (customersEl) customersEl.textContent = uniqueCustomers;
        if (completedEl) completedEl.textContent = completedOrders;

    } catch (error) {
        console.error("Error calculating stats:", error);
    }
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
                    <span>${order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("ar-SA") : "غير محدد"}</span>
                </div>
            </div>
            <div class="order-amount">${(order.amount || order.total || 0).toFixed(2)} ر.س</div>
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
        });
    } catch (error) {
        console.error("Error fetching businesses:", error);
    }
}

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
                renderRecentOrders();
                calculateStats();
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

document.addEventListener("DOMContentLoaded", function() {
    try {
        fetchBusinesses();
        fetchOrders();
        console.log("Dashboard initialized successfully");
    } catch (error) {
        console.error("Error initializing dashboard:", error);
    }
});