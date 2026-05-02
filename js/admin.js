// Admin Module - Handles admin dashboard functionality
import { db } from '../firebase-config.js';
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class AdminHandler {
  constructor() {
    this.forms = [];
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupEventListeners();
      this.loadForms();
    });
  }

  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.querySelector('[data-action="refresh-forms"]');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadForms());
    }

    // Delete all button
    const deleteAllBtn = document.querySelector('[data-action="delete-all-forms"]');
    if (deleteAllBtn) {
      deleteAllBtn.addEventListener('click', () => this.deleteAllForms());
    }

    // Search input
    const searchInput = document.querySelector('[data-action="search-forms"]');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.filterForms(e.target.value));
    }

    // Filter select
    const filterSelect = document.querySelector('[data-action="filter-forms"]');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => this.filterByStatus(e.target.value));
    }
  }

  async loadForms() {
    try {
      const formsContainer = document.getElementById('forms-container');
      if (!formsContainer) return;

      // Show loading state
      formsContainer.innerHTML = '<div class="loading">جاري التحميل...</div>';

      // Query forms from Firestore
      const formsQuery = query(
        collection(db, 'forms'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(formsQuery);
      this.forms = [];

      querySnapshot.forEach((doc) => {
        this.forms.push({
          id: doc.id,
          ...doc.data()
        });
      });

      this.renderForms(this.forms);
    } catch (error) {
      console.error('Error loading forms:', error);
      this.showError('حدث خطأ أثناء تحميل النماذج');
    }
  }

  renderForms(forms) {
    const formsContainer = document.getElementById('forms-container');
    if (!formsContainer) return;

    if (forms.length === 0) {
      formsContainer.innerHTML = '<div class="empty-state">لا توجد نماذج حالياً</div>';
      return;
    }

    let html = '';
    forms.forEach(form => {
      const status = form.status || 'pending';
      const statusClass = this.getStatusClass(status);
      const statusText = this.getStatusText(status);

      html += `
        <div class="form-card" data-form-id="${form.id}">
          <div class="form-header">
            <h3>${this.escapeHtml(form.name || 'بدون اسم')}</h3>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>

          <div class="form-details">
            <p><strong>البريد الإلكتروني:</strong> ${this.escapeHtml(form.email || '')}</p>
            <p><strong>رقم الهاتف:</strong> ${this.escapeHtml(form.phone || '')}</p>
            <p><strong>الرسالة:</strong> ${this.escapeHtml(form.message || '')}</p>
            <p><strong>تاريخ الإرسال:</strong> ${this.formatDate(form.createdAt)}</p>
          </div>

          <div class="form-actions">
            <button data-action="update-status" data-id="${form.id}" data-status="approved">
              قبول
            </button>
            <button data-action="update-status" data-id="${form.id}" data-status="rejected">
              رفض
            </button>
            <button data-action="delete-form" data-id="${form.id}" class="delete-btn">
              حذف
            </button>
          </div>
        </div>
      `;
    });

    formsContainer.innerHTML = html;

    // Add event listeners to buttons
    formsContainer.querySelectorAll('[data-action="update-status"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const formId = e.target.dataset.id;
        const status = e.target.dataset.status;
        this.updateFormStatus(formId, status);
      });
    });

    formsContainer.querySelectorAll('[data-action="delete-form"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const formId = e.target.dataset.id;
        if (confirm('هل أنت متأكد من حذف هذا النموذج؟')) {
          this.deleteForm(formId);
        }
      });
    });
  }

  async updateFormStatus(formId, status) {
    try {
      const formRef = doc(db, 'forms', formId);
      await updateDoc(formRef, {
        status: status,
        updatedAt: new Date()
      });

      // Update local state
      const formIndex = this.forms.findIndex(f => f.id === formId);
      if (formIndex !== -1) {
        this.forms[formIndex].status = status;
        this.renderForms(this.forms);
      }

      this.showToast('تم تحديث حالة النموذج بنجاح');
    } catch (error) {
      console.error('Error updating form status:', error);
      this.showError('حدث خطأ أثناء تحديث الحالة');
    }
  }

  async deleteForm(formId) {
    try {
      await deleteDoc(doc(db, 'forms', formId));

      // Update local state
      this.forms = this.forms.filter(f => f.id !== formId);
      this.renderForms(this.forms);

      this.showToast('تم حذف النموذج بنجاح');
    } catch (error) {
      console.error('Error deleting form:', error);
      this.showError('حدث خطأ أثناء حذف النموذج');
    }
  }

  async deleteAllForms() {
    if (!confirm('هل أنت متأكد من حذف جميع النماذج؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }

    try {
      const deletePromises = this.forms.map(form => 
        deleteDoc(doc(db, 'forms', form.id))
      );

      await Promise.all(deletePromises);

      this.forms = [];
      this.renderForms(this.forms);

      this.showToast('تم حذف جميع النماذج بنجاح');
    } catch (error) {
      console.error('Error deleting all forms:', error);
      this.showError('حدث خطأ أثناء حذف النماذج');
    }
  }

  filterForms(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
      this.renderForms(this.forms);
      return;
    }

    const filtered = this.forms.filter(form => 
      (form.name && form.name.toLowerCase().includes(term)) ||
      (form.email && form.email.toLowerCase().includes(term)) ||
      (form.message && form.message.toLowerCase().includes(term))
    );

    this.renderForms(filtered);
  }

  filterByStatus(status) {
    if (status === 'all') {
      this.renderForms(this.forms);
      return;
    }

    const filtered = this.forms.filter(form => 
      (form.status || 'pending') === status
    );

    this.renderForms(filtered);
  }

  getStatusClass(status) {
    const classes = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected'
    };
    return classes[status] || 'status-pending';
  }

  getStatusText(status) {
    const texts = {
      'pending': 'قيد المراجعة',
      'approved': 'مقبول',
      'rejected': 'مرفوض'
    };
    return texts[status] || 'قيد المراجعة';
  }

  formatDate(date) {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showToast(message) {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-toast';
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

  showError(message) {
    let toast = document.getElementById('admin-error-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-error-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #f44336;
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

// Initialize admin handler
const adminHandler = new AdminHandler();
export default adminHandler;
