// Firebase imports
import {
  db,
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from "./firebase-config.js";

// Orders data from Firestore
let orders = [];
let ordersUnsubscribe = null;

// Status labels
const statusLabels = {
  pending: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  completed: 'مكتمل',
  cancelled: 'ملغي'
};

// Fetch orders from Firestore
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

// Render orders table
function renderOrders() {
  try {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    // Handle empty orders state
    if (!orders || orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="no-orders">لا توجد طلبات حالياً</td>
        </tr>
      `;
      return;
    }

    // Safely render orders with optional chaining
    tbody.innerHTML = orders.map(order => {
      // Ensure order object exists
      if (!order) return '';

      // Safely get order ID
      const orderId = order.id || order.orderId || '-';

      // Safely get date
      const date = order.date || order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("ar-SA") : '-';

      // Safely get customer name
      const customerName = order.customerName || order.customer || 'عميل غير مسجل';

      // Safely get phone number
      const phone = order.phone || order.customerPhone || '-';

      // Safely get products count
      const productsCount = order.items ? order.items.length : (order.products || 0);

      // Safely get amount
      const amount = parseFloat(order.amount || order.total || 0).toFixed(2);

      // Safely get status
      const status = order.status || 'pending';
      const statusLabel = statusLabels[status] || status;

      // Safely get order ID for delete button
      const deleteOrderId = order.id || '';

      return `
        <tr>
          <td>#${orderId}</td>
          <td>${date}</td>
          <td>${customerName}</td>
          <td>${phone}</td>
          <td>${productsCount} عنصر</td>
          <td>${amount} ر.س</td>
          <td><span class="order-status ${status}">${statusLabel}</span></td>
          <td>
            <button class="btn btn-view" onclick="viewOrder('${deleteOrderId}')" ${!deleteOrderId ? 'disabled' : ''}>
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-delete" onclick="deleteOrder('${deleteOrderId}')" ${!deleteOrderId ? 'disabled' : ''}>
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error("Error rendering orders:", error);
    // Attempt to show error state in table if possible
    try {
      const tbody = document.getElementById('ordersTableBody');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="error-message">حدث خطأ في عرض الطلبات</td>
          </tr>
        `;
      }
    } catch (innerError) {
      console.error("Error showing error state:", innerError);
    }
  }
}

// View order details
window.viewOrder = function(orderId) {
  try {
    if (!orderId) {
      console.error("Invalid order ID");
      return;
    }
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const itemsText = order.items ? order.items.map(item =>
        `- ${item.name || item.productName || "منتج"} (${item.quantity || 1}x) ${item.price || 0} ر.س`
      ).join("
") : "لا توجد منتجات";

      alert(`تفاصيل الطلب #${order.id}:

العميل: ${order.customerName || order.customer || "غير محدد"}
رقم الهاتف: ${order.phone || "غير محدد"}
العناصر:
${itemsText}
الحالة: ${order.status}`);
    } else {
      alert('الطلب غير موجود');
    }
  } catch (error) {
    console.error("Error viewing order:", error);
    alert('حدث خطأ أثناء عرض تفاصيل الطلب');
  }
};

// Delete order
window.deleteOrder = async function(orderId) {
  try {
    // Validate orderId
    if (!orderId || typeof orderId !== 'string') {
      console.error("Invalid order ID:", orderId);
      alert("معرف الطلب غير صالح");
      return;
    }

    // Confirm deletion
    if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
        // Data will be automatically updated via onSnapshot
      } catch (deleteError) {
        console.error("Error deleting order document:", deleteError);
        alert("حدث خطأ أثناء حذف الطلب من قاعدة البيانات");
      }
    }
  } catch (error) {
    console.error("Error in deleteOrder function:", error);
    alert("حدث خطأ غير متوقع أثناء حذف الطلب");
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Fetch orders from Firestore
    fetchOrders();

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
