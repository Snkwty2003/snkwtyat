// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzlJRfoFi8jBevT6fZb6cMTcEslOazmN8",
  authDomain: "snkwtyat.firebaseapp.com",
  projectId: "snkwtyat",
  storageBucket: "snkwtyat.appspot.com",
  messagingSenderId: "582497228076",
  appId: "1:582497228076:web:b7373413aa6ddb9d1a0889"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export db only
export { db };
