// Form Module - Handles form submission, validation, and sanitization
import { db } from '../firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class FormHandler {
  constructor() {
    this.form = null;
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.form = document.getElementById('contactForm');
      if (this.form) {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
      }
    });
  }

  async handleSubmit(event) {
    event.preventDefault();

    try {
      // Collect form data
      const formData = new FormData(this.form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value.trim();
      });

      // Sanitize input
      const sanitizedData = this.sanitizeData(data);

      // Validate form data
      if (!this.validateForm(sanitizedData)) {
        return;
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, "forms"), {
        ...sanitizedData,
        createdAt: new Date()
      });

      // Show success message
      this.showToast("تم إرسال طلبك بنجاح! سنتواصل معك قريباً ✅");

      // Reset form
      this.form.reset();

      // Clear validation messages
      this.clearValidationMessages(this.form);

    } catch (error) {
      console.error('Error submitting form:', error);
      this.showToast('حدث خطأ أثناء إرسال النموذج. يرجى المحاولة مرة أخرى.');
    }
  }

  sanitizeData(data) {
    const sanitized = {};
    for (const key in data) {
      if (typeof data[key] === 'string') {
        sanitized[key] = data[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      } else {
        sanitized[key] = data[key];
      }
    }
    return sanitized;
  }

  validateForm(data) {
    let isValid = true;
    this.clearValidationMessages(this.form);

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'phone', 'serviceType', 'projectDetails'];
    requiredFields.forEach(field => {
      const input = this.form.querySelector(`[name="${field}"]`);
      if (!data[field] || data[field].trim() === '') {
        this.showValidationError(input, 'هذا الحقل مطلوب');
        isValid = false;
      }
    });

    // Validate email format
    const emailInput = this.form.querySelector('[name="email"]');
    if (data.email && !this.isValidEmail(data.email)) {
      this.showValidationError(emailInput, 'يرجى إدخال بريد إلكتروني صحيح');
      isValid = false;
    }

    // Validate phone format
    const phoneInput = this.form.querySelector('[name="phone"]');
    if (data.phone && !this.isValidPhone(data.phone)) {
      this.showValidationError(phoneInput, 'يرجى إدخال رقم هاتف صحيح');
      isValid = false;
    }

    return isValid;
  }

  isValidPhone(phone) {
    const re = /^[0-9+\-\s]{8,20}$/;
    return re.test(phone);
  }

  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  showValidationError(input, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#f44336';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';

    const parent = input.parentElement;
    parent.appendChild(errorDiv);
    input.style.borderColor = '#f44336';
  }

  clearValidationMessages(form) {
    const errors = form.querySelectorAll('.validation-error');
    errors.forEach(error => error.remove());

    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.style.borderColor = '';
    });
  }

  showToast(message) {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.display = 'block';

    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
}

// Initialize form handler
const formHandler = new FormHandler();
export default formHandler;
