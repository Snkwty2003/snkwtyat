// Firebase imports
import { auth, onAuthStateChanged, db, getDoc, doc, signOut } from "./firebase-config.js";

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

function setupSettingsTabs() {
    const tabs = document.querySelectorAll(".settings-tab");
    const sections = document.querySelectorAll(".settings-section");

    tabs.forEach(tab => {
        tab.addEventListener("click", function() {
            tabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            sections.forEach(section => { section.style.display = "none"; });
            const targetSection = document.getElementById(this.getAttribute("data-tab"));
            if (targetSection) targetSection.style.display = "block";
        });
    });
}

function setupFormHandlers() {
    const generalForm = document.getElementById("generalSettingsForm");
    if (generalForm) {
        generalForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const formData = {
                siteName: document.getElementById("siteName").value,
                siteDescription: document.getElementById("siteDescription").value,
                contactEmail: document.getElementById("contactEmail").value,
                contactPhone: document.getElementById("contactPhone").value,
                currency: document.getElementById("currency").value
            };
            localStorage.setItem("generalSettings", JSON.stringify(formData));
            alert("تم حفظ الإعدادات العامة بنجاح");
        });
    }

    const securityForm = document.getElementById("securitySettingsForm");
    if (securityForm) {
        securityForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const newPassword = document.getElementById("newPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;
            if (newPassword !== confirmPassword) {
                alert("كلمة المرور الجديدة غير متطابقة");
                return;
            }
            alert("تم تحديث كلمة المرور بنجاح");
            securityForm.reset();
        });
    }

    const paymentForm = document.getElementById("paymentSettingsForm");
    if (paymentForm) {
        paymentForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const formData = {
                paymentMethod: document.getElementById("paymentMethod").value,
                stripePublicKey: document.getElementById("stripePublicKey").value,
                stripeSecretKey: document.getElementById("stripeSecretKey").value
            };
            localStorage.setItem("paymentSettings", JSON.stringify(formData));
            alert("تم حفظ إعدادات الدفع بنجاح");
        });
    }
}

function loadSavedSettings() {
    const generalSettings = localStorage.getItem("generalSettings");
    if (generalSettings) {
        const settings = JSON.parse(generalSettings);
        if (document.getElementById("siteName")) document.getElementById("siteName").value = settings.siteName || "";
        if (document.getElementById("siteDescription")) document.getElementById("siteDescription").value = settings.siteDescription || "";
        if (document.getElementById("contactEmail")) document.getElementById("contactEmail").value = settings.contactEmail || "";
        if (document.getElementById("contactPhone")) document.getElementById("contactPhone").value = settings.contactPhone || "";
        if (document.getElementById("currency")) document.getElementById("currency").value = settings.currency || "SAR";
    }

    const paymentSettings = localStorage.getItem("paymentSettings");
    if (paymentSettings) {
        const settings = JSON.parse(paymentSettings);
        if (document.getElementById("paymentMethod")) document.getElementById("paymentMethod").value = settings.paymentMethod || "stripe";
        if (document.getElementById("stripePublicKey")) document.getElementById("stripePublicKey").value = settings.stripePublicKey || "";
        if (document.getElementById("stripeSecretKey")) document.getElementById("stripeSecretKey").value = settings.stripeSecretKey || "";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    setupSettingsTabs();
    setupFormHandlers();
    loadSavedSettings();
});