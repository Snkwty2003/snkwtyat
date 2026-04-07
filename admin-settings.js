// Settings tabs functionality
function setupSettingsTabs() {
    const tabs = document.querySelectorAll(".settings-tab");
    const sections = document.querySelectorAll(".settings-section");

    tabs.forEach(tab => {
        tab.addEventListener("click", function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove("active"));
            // Add active class to clicked tab
            this.classList.add("active");

            // Hide all sections
            sections.forEach(section => {
                section.style.display = "none";
            });

            // Show the selected section
            const tabName = this.getAttribute("data-tab");
            const targetSection = document.getElementById(tabName);
            if (targetSection) {
                targetSection.style.display = "block";
            }
        });
    });
}

// Form submission handlers
function setupFormHandlers() {
    // General settings form
    const generalForm = document.getElementById("generalSettingsForm");
    if (generalForm) {
        generalForm.addEventListener("submit", function(e) {
            e.preventDefault();

            // Collect form data
            const formData = {
                siteName: document.getElementById("siteName").value,
                siteDescription: document.getElementById("siteDescription").value,
                contactEmail: document.getElementById("contactEmail").value,
                contactPhone: document.getElementById("contactPhone").value,
                currency: document.getElementById("currency").value
            };

            // Save to localStorage (in real app, this would be sent to server)
            localStorage.setItem("generalSettings", JSON.stringify(formData));

            // Show success message
            alert("تم حفظ الإعدادات العامة بنجاح");
        });
    }

    // Security settings form
    const securityForm = document.getElementById("securitySettingsForm");
    if (securityForm) {
        securityForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const currentPassword = document.getElementById("currentPassword").value;
            const newPassword = document.getElementById("newPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            // Validate passwords
            if (newPassword !== confirmPassword) {
                alert("كلمة المرور الجديدة غير متطابقة");
                return;
            }

            // In real app, this would verify current password and update on server
            alert("تم تحديث كلمة المرور بنجاح");

            // Clear form
            securityForm.reset();
        });
    }

    // Payment settings form
    const paymentForm = document.getElementById("paymentSettingsForm");
    if (paymentForm) {
        paymentForm.addEventListener("submit", function(e) {
            e.preventDefault();

            // Collect form data
            const formData = {
                paymentMethod: document.getElementById("paymentMethod").value,
                stripePublicKey: document.getElementById("stripePublicKey").value,
                stripeSecretKey: document.getElementById("stripeSecretKey").value
            };

            // Save to localStorage (in real app, this would be sent to server)
            localStorage.setItem("paymentSettings", JSON.stringify(formData));

            // Show success message
            alert("تم حفظ إعدادات الدفع بنجاح");
        });
    }
}

// Load saved settings
function loadSavedSettings() {
    // Load general settings
    const generalSettings = localStorage.getItem("generalSettings");
    if (generalSettings) {
        const settings = JSON.parse(generalSettings);

        if (document.getElementById("siteName")) {
            document.getElementById("siteName").value = settings.siteName || "";
        }
        if (document.getElementById("siteDescription")) {
            document.getElementById("siteDescription").value = settings.siteDescription || "";
        }
        if (document.getElementById("contactEmail")) {
            document.getElementById("contactEmail").value = settings.contactEmail || "";
        }
        if (document.getElementById("contactPhone")) {
            document.getElementById("contactPhone").value = settings.contactPhone || "";
        }
        if (document.getElementById("currency")) {
            document.getElementById("currency").value = settings.currency || "SAR";
        }
    }

    // Load payment settings
    const paymentSettings = localStorage.getItem("paymentSettings");
    if (paymentSettings) {
        const settings = JSON.parse(paymentSettings);

        if (document.getElementById("paymentMethod")) {
            document.getElementById("paymentMethod").value = settings.paymentMethod || "stripe";
        }
        if (document.getElementById("stripePublicKey")) {
            document.getElementById("stripePublicKey").value = settings.stripePublicKey || "";
        }
        if (document.getElementById("stripeSecretKey")) {
            document.getElementById("stripeSecretKey").value = settings.stripeSecretKey || "";
        }
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    setupSettingsTabs();
    setupFormHandlers();
    loadSavedSettings();
});
