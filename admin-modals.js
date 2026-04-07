// Modal management functionality

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
}

// Hide modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("show");
        document.body.style.overflow = "auto";
    }
}

// Close modal when clicking outside
function setupModalClickOutside() {
    const modals = document.querySelectorAll(".modal");
    modals.forEach(modal => {
        modal.addEventListener("click", function(e) {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}

// Setup close buttons for all modals
function setupModalCloseButtons() {
    const closeButtons = document.querySelectorAll(".modal-close");
    closeButtons.forEach(button => {
        button.addEventListener("click", function() {
            const modal = this.closest(".modal");
            if (modal) {
                hideModal(modal.id);
            }
        });
    });
}

// Create and show a dynamic modal
function createDynamicModal(options) {
    const {
        title = "عنوان",
        content = "",
        showFooter = true,
        footerButtons = [],
        onClose = null
    } = options;

    // Create modal structure
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = `dynamic-modal-${Date.now()}`;

    let footerHtml = "";
    if (showFooter) {
        const buttonsHtml = footerButtons.map(btn => `
            <button class="btn ${btn.className || "btn-primary"}" 
                    onclick="${btn.onclick || ""}">
                ${btn.text}
            </button>
        `).join("");

        footerHtml = `
            <div class="modal-footer">
                ${buttonsHtml}
            </div>
        `;
    }

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="hideModal('${modal.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${footerHtml}
        </div>
    `;

    // Add modal to document
    document.body.appendChild(modal);

    // Show modal
    showModal(modal.id);

    // Setup close functionality
    const closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) {
        closeBtn.addEventListener("click", function() {
            hideModal(modal.id);
            if (onClose) {
                onClose();
            }
        });
    }

    // Setup click outside to close
    modal.addEventListener("click", function(e) {
        if (e.target === modal) {
            hideModal(modal.id);
            if (onClose) {
                onClose();
            }
        }
    });

    return modal.id;
}

// Initialize modal functionality
document.addEventListener("DOMContentLoaded", function() {
    setupModalClickOutside();
    setupModalCloseButtons();
});

// Export functions for use in other files
window.adminModals = {
    showModal,
    hideModal,
    createDynamicModal
};
