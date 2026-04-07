// TypeScript Types for Form Validation
interface Validator {
    (value: string): { isValid: boolean; message?: string };
}

interface FormValidatorOptions {
    validateOnBlur?: boolean;
    validateOnInput?: boolean;
    showErrors?: boolean;
}

interface FieldValidationResult {
    isValid: boolean;
    errorMessage?: string;
}

// Common validators
const validators: Record<string, Validator> = {
    email: (value: string) => ({
        isValid: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
        message: 'البريد الإلكتروني غير صحيح'
    }),

    phone: (value: string) => ({
        isValid: /^[0-9+\-\s]{8,20}$/.test(value),
        message: 'رقم الهاتف غير صحيح'
    }),

    arabicName: (value: string) => ({
        isValid: /^[؀-ۿ\s]{3,50}$/.test(value),
        message: 'الاسم يجب أن يكون بالعربية و بين 3-50 حرف'
    }),

    password: (value: string) => ({
        isValid: value.length >= 8,
        message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    }),

    confirmPassword: (value: string, originalPassword: string) => ({
        isValid: value === originalPassword,
        message: 'كلمات المرور غير متطابقة'
    })
};

// Advanced Form Validation System with TypeScript
class FormValidator {
    private form: HTMLFormElement;
    private options: Required<FormValidatorOptions>;
    private customValidators: Record<string, Validator> = {};
    private errorMessages: Record<string, string> = {};

    constructor(form: HTMLFormElement, options: FormValidatorOptions = {}) {
        this.form = form;
        this.options = {
            validateOnBlur: true,
            validateOnInput: false,
            showErrors: true,
            ...options
        };

        this.init();
    }

    private init(): void {
        // Add validation on blur
        if (this.options.validateOnBlur) {
            this.form.querySelectorAll('input, select, textarea').forEach(field => {
                field.addEventListener('blur', () => this.validateField(field as HTMLInputElement));
            });
        }

        // Add validation on input
        if (this.options.validateOnInput) {
            this.form.querySelectorAll('input, select, textarea').forEach(field => {
                field.addEventListener('input', () => this.validateField(field as HTMLInputElement));
            });
        }

        // Validate form on submit
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
                return false;
            }
        });
    }

    public addValidator(fieldName: string, validator: Validator, errorMessage: string): void {
        this.customValidators[fieldName] = validator;
        this.errorMessages[fieldName] = errorMessage;
    }

    public validateField(field: HTMLInputElement): FieldValidationResult {
        const fieldName = field.name || field.id;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Check required
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'هذا الحقل مطلوب';
        }

        // Check pattern
        if (isValid && field.hasAttribute('pattern') && value) {
            const pattern = new RegExp(field.getAttribute('pattern') || '');
            if (!pattern.test(value)) {
                isValid = false;
                errorMessage = field.getAttribute('title') || 'القيمة غير صحيحة';
            }
        }

        // Check min/max length
        if (isValid && value) {
            const minLength = field.getAttribute('minlength');
            const maxLength = field.getAttribute('maxlength');

            if (minLength && value.length < parseInt(minLength)) {
                isValid = false;
                errorMessage = `يجب أن يكون الحد الأدنى ${minLength} حرف`;
            }

            if (maxLength && value.length > parseInt(maxLength)) {
                isValid = false;
                errorMessage = `يجب أن يكون الحد الأقصى ${maxLength} حرف`;
            }
        }

        // Check email
        if (isValid && field.type === 'email' && value) {
            const emailValidation = validators.email(value);
            if (!emailValidation.isValid) {
                isValid = false;
                errorMessage = emailValidation.message || '';
            }
        }

        // Check phone
        if (isValid && field.type === 'tel' && value) {
            const phoneValidation = validators.phone(value);
            if (!phoneValidation.isValid) {
                isValid = false;
                errorMessage = phoneValidation.message || '';
            }
        }

        // Check custom validator
        if (isValid && this.customValidators[fieldName]) {
            const customValidation = this.customValidators[fieldName](value);
            if (!customValidation.isValid) {
                isValid = false;
                errorMessage = customValidation.message || this.errorMessages[fieldName];
            }
        }

        // Show/hide error
        if (this.options.showErrors) {
            this.showFieldError(field, isValid, errorMessage);
        }

        return { isValid, errorMessage };
    }

    public validateForm(): boolean {
        let isValid = true;
        const fields = this.form.querySelectorAll('input, select, textarea');

        fields.forEach(field => {
            if (!this.validateField(field as HTMLInputElement).isValid) {
                isValid = false;
            }
        });

        return isValid;
    }

    private showFieldError(field: HTMLInputElement, isValid: boolean, errorMessage: string): void {
        const feedbackElement = document.getElementById(`${field.name || field.id}Feedback`) ||
                               field.parentElement?.querySelector('.form-feedback');

        if (feedbackElement) {
            feedbackElement.textContent = isValid ? '' : errorMessage;
            feedbackElement.style.display = isValid ? 'none' : 'block';
            feedbackElement.className = 'form-feedback';

            if (!isValid) {
                feedbackElement.classList.add('error');
            }
        }

        // Add/remove error class to field
        if (isValid) {
            field.classList.remove('error');
            field.setAttribute('aria-invalid', 'false');
        } else {
            field.classList.add('error');
            field.setAttribute('aria-invalid', 'true');
        }
    }

    public clearErrors(): void {
        this.form.querySelectorAll('.form-feedback').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
            el.classList.remove('error');
        });

        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            field.classList.remove('error');
            field.setAttribute('aria-invalid', 'false');
        });
    }

    public reset(): void {
        this.form.reset();
        this.clearErrors();
    }
}

export { FormValidator, validators, FieldValidationResult, FormValidatorOptions, Validator };
