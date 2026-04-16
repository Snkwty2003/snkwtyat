
// Firebase imports
import { db, collection, getDocs, doc, deleteDoc, onSnapshot, query, orderBy } from "./firebase-config.js";

// Restaurants data from Firestore
let restaurants = [];
let restaurantsUnsubscribe = null;

// Fetch restaurants from Firestore
function fetchRestaurants() {
    const q = query(collection(db, "restaurants"), orderBy("name", "asc"));
    restaurantsUnsubscribe = onSnapshot(q, (snapshot) => {
        restaurants = [];
        snapshot.forEach((doc) => {
            restaurants.push({
                id: doc.id,
                ...doc.data()
            });
        });
        renderRestaurants();
    });
}

// Render restaurants cards
function renderRestaurants() {
    const restaurantsContainer = document.getElementById("restaurantsContainer");
    if (!restaurantsContainer) {
        // Create restaurants container if it doesn't exist
        const mainContent = document.querySelector(".main-content");
        if (mainContent) {
            const restaurantsSection = document.createElement("div");
            restaurantsSection.id = "restaurantsContainer";
            restaurantsSection.innerHTML = `
                <div class="content-card" style="margin-top: 30px;">
                    <div class="card-header">
                        <h3>المطاعم</h3>
                    </div>
                    <div class="restaurants-grid" id="restaurantsGrid"></div>
                </div>
            `;
            mainContent.appendChild(restaurantsSection);
        }
    }

    const restaurantsGrid = document.getElementById("restaurantsGrid");
    if (restaurantsGrid) {
        restaurantsGrid.innerHTML = restaurants.map(restaurant => `
            <div class="restaurant-card">
                <div class="restaurant-info">
                    <h4>${restaurant.name || "بدون اسم"}</h4>
                    <p><i class="fas fa-phone"></i> ${restaurant.phone || "لا يوجد رقم"}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${restaurant.location || "لا يوجد موقع"}</p>
                    <p><i class="fas fa-utensils"></i> ${restaurant.type || "غير محدد"}</p>
                </div>
                <button class="btn btn-delete" onclick="deleteRestaurant('${restaurant.id}')">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        `).join("");
    }
}

// Delete restaurant
window.deleteRestaurant = async function(restaurantId) {
    if (confirm("هل أنت متأكد من حذف هذا المطعم؟")) {
        try {
            await deleteDoc(doc(db, "restaurants", restaurantId));
            // Data will be automatically updated via onSnapshot
        } catch (error) {
            console.error("Error deleting restaurant:", error);
            alert("حدث خطأ أثناء حذف المطعم");
        }
    }
};

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    fetchRestaurants();
});
