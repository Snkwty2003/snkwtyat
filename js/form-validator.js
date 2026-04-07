// Advanced Form Validation System
class FormValidator {
    constructor(form, options = {}) {
        this.form = form;
        this.options = {
            validateOnBlur: true,
            validateOnInput: false,
            showErrors: true,
            ...options
        };
        this.validators = {};
        this.errorMessages = {};
        this.init();
    }

    init() {
        // Add validation on blur
        if (this.options.validateOnBlur) {
            this.form.querySelectorAll("input, select, textarea").forEach(field => {
                field.addEventListener("blur", () => this.validateField(field));
            });
        }

        // Add validation on input
        if (this.options.validateOnInput) {
            this.form.querySelectorAll("input, select, textarea").forEach(field => {
                field.addEventListener("input", () => this.validateField(field));
            });
        }

        // Validate form on submit
        this.form.addEventListener("submit", (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
                return false;
            }
        });
    }

    addValidator(fieldName, validator, errorMessage) {
        this.validators[fieldName] = validator;
        this.errorMessages[fieldName] = errorMessage;
    }

    validateField(field) {
        const fieldName = field.name || field.id;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = "";

        // Check required
        if (field.hasAttribute("required") && !value) {
            isValid = false;
            errorMessage = "هذا الحقل مطلوب";
        }

        // Check pattern
        if (isValid && field.hasAttribute("pattern") && value) {
            const pattern = new RegExp(field.getAttribute("pattern"));
            if (!pattern.test(value)) {
                isValid = false;
                errorMessage = field.getAttribute("title") || "القيمة غير صحيحة";
            }
        }

        // Check min/max length
        if (isValid && value) {
            if (field.hasAttribute("minlength") && value.length < field.getAttribute("minlength")) {
                isValid = false;
                errorMessage = `يجب أن يكون الحد الأدنى ${field.getAttribute("minlength")} حرف`;
            }
            if (field.hasAttribute("maxlength") && value.length > field.getAttribute("maxlength")) {
                isValid = false;
                errorMessage = `يجب أن يكون الحد الأقصى ${field.getAttribute("maxlength")} حرف`;
            }
        }

        // Check email
        if (isValid && field.type === "email" && value) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = "البريد الإلكتروني غير صحيح";
            }
        }

        // Check phone
        if (isValid && field.type === "tel" && value) {
            const phoneRegex = /^[0-9+\-\s]{8,20}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = "رقم الهاتف غير صحيح";
            }
        }

        // Check custom validator
        if (isValid && this.validators[fieldName]) {
            const customValidation = this.validators[fieldName](value);
            if (!customValidation.isValid) {
                isValid = false;
                errorMessage = customValidation.message || this.errorMessages[fieldName];
            }
        }

        // Show/hide error
        if (this.options.showErrors) {
            this.showFieldError(field, isValid, errorMessage);
        }

        return isValid;
    }

    validateForm() {
        let isValid = true;
        const fields = this.form.querySelectorAll("input, select, textarea");

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    showFieldError(field, isValid, errorMessage) {
        const feedbackElement = document.getElementById(`${field.name || field.id}Feedback`) || 
                               field.parentElement.querySelector(".form-feedback");

        if (feedbackElement) {
            feedbackElement.textContent = isValid ? "" : errorMessage;
            feedbackElement.style.display = isValid ? "none" : "block";
            feedbackElement.className = "form-feedback";

            if (!isValid) {
                feedbackElement.classList.add("error");
            }
        }

        // Add/remove error class to field
        if (isValid) {
            field.classList.remove("error");
            field.setAttribute("aria-invalid", "false");
        } else {
            field.classList.add("error");
            field.setAttribute("aria-invalid", "true");
        }
    }

    clearErrors() {
        this.form.querySelectorAll(".form-feedback").forEach(el => {
            el.textContent = "";
            el.style.display = "none";
            el.classList.remove("error");
        });

        this.form.querySelectorAll("input, select, textarea").forEach(field => {
            field.classList.remove("error");
            field.setAttribute("aria-invalid", "false");
        });
    }

    reset() {
        this.form.reset();
        this.clearErrors();
    }
}

// Common validators
const validators = {
    email: (value) => ({
        isValid: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
        message: "البريد الإلكتروني غير صحيح"
    }),

    phone: (value) => ({
        isValid: /^[0-9+\-\s]{8,20}$/.test(value),
        message: "رقم الهاتف غير صحيح"
    }),

    arabicName: (value) => ({
        isValid: /^[؀-ۿ\s]{3,50}$/.test(value),
        message: "الاسم يجب أن يكون بالعربية و بين 3-50 حرف"
    }),

    password: (value) => ({
        isValid: value.length >= 8,
        message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
    }),

    confirmPassword: (value, originalPassword) => ({
        isValid: value === originalPassword,
        message: "كلمات المرور غير متطابقة"
    })
};
