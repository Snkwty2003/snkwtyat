// Common utility functions for admin panel

// Format date to Arabic format
function formatDate(date) {
    const options = { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
    };
    return new Date(date).toLocaleDateString("ar-SA", options);
}

// Format currency
function formatCurrency(amount) {
    return `${amount.toFixed(2)} ر.س`;
}

// Show notification
function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add("show");
    }, 100);

    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Confirm action
function confirmAction(message) {
    return confirm(message);
}

// Get user info from localStorage
function getUserInfo() {
    const userInfo = localStorage.getItem("adminUserInfo");
    return userInfo ? JSON.parse(userInfo) : null;
}

// Set user info in localStorage
function setUserInfo(userInfo) {
    localStorage.setItem("adminUserInfo", JSON.stringify(userInfo));
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem("adminLoggedIn") === "true";
}

// Logout
function logout() {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminUserInfo");
    window.location.href = "admin-login.html";
}

// Add logout functionality to logout button
function setupLogout() {
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
}

// Initialize common functionality
document.addEventListener("DOMContentLoaded", function() {
    setupLogout();

    // Check authentication
    if (!isLoggedIn() && !window.location.href.includes("admin-login.html")) {
        window.location.href = "admin-login.html";
    }
});

// Export functions for use in other files
window.adminCommon = {
    formatDate,
    formatCurrency,
    showNotification,
    confirmAction,
    getUserInfo,
    setUserInfo,
    isLoggedIn,
    logout
};
