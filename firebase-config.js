import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    deleteDoc, 
    updateDoc, 
    onSnapshot, 
    query, 
    orderBy,
    getDocs,
    addDoc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzlJRfoFi8jBevT6fZb6cMTcEslOazmN8",
  authDomain: "snkwtyat.firebaseapp.com",
  projectId: "snkwtyat",
  storageBucket: "snkwtyat.appspot.com",
  messagingSenderId: "582497228076",
  appId: "1:582497228076:web:b7373413aa6ddb9d1a0889"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy, getDocs, addDoc, setDoc, getDoc, signInWithEmailAndPassword, signOut, onAuthStateChanged };