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

// Businesses data from Firestore
let businesses = [];
let businessesUnsubscribe = null;

// Orders data from Firestore
let orders = [];
let ordersUnsubscribe = null;

// Stats data (will be calculated from real data)
let statsData = {
    revenue: { value: 0, change: 0, trend: "neutral" },
    orders: { value: 0, change: 0, trend: "neutral" },
    users: { value: 0, change: 0, trend: "neutral" },
    products: { value: 0, change: 0, trend: "neutral" }
};

// Helper function to calculate trend based on change value
function calculateTrend(change) {
    if (change > 0) return "positive";
    if (change < 0) return "negative";
    return "neutral";
}

// Helper function to create stat object with dynamic trend
function createStat(value, change = 0) {
    return {
        value,
        change,
        trend: calculateTrend(change)
    };
}

// Calculate stats from real data
function calculateStats() {
    try {
        // Calculate total revenue from orders
        const totalRevenue = orders.reduce((sum, order) => {
            const amount = parseFloat(order.amount || order.total || 0);
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        // Calculate total orders
        const totalOrders = orders.length;

        // Calculate total businesses
        const totalBusinesses = businesses.length;

        // Calculate total products from all businesses
        const totalProducts = businesses.reduce((sum, business) => {
            const productsCount = Array.isArray(business.products) ? business.products.length : 0;
            return sum + productsCount;
        }, 0);

        // Update stats data with real values
        // Note: Currently change is set to 0 for all stats
        // In the future, this can be calculated by comparing with historical data
        statsData = {
            revenue: createStat(totalRevenue, 0),
            orders: createStat(totalOrders, 0),
            users: createStat(totalBusinesses, 0),
            products: createStat(totalProducts, 0)
        };
    } catch (error) {
        console.error("Error calculating stats:", error);
        // Set default values on error
        statsData = {
            revenue: createStat(0, 0),
            orders: createStat(0, 0),
            users: createStat(0, 0),
            products: createStat(0, 0)
        };
    }
}
