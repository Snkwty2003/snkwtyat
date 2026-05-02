// UI Module - Handles modal, cart, search, and other UI interactions
class UIHandler {
  constructor() {
    this.modal = null;
    this.cartBox = null;
    this.searchInput = null;
    this.filterSelect = null;
    this.currentProduct = null;
    this.cart = [];
    this.products = [];
    this.currentFilter = 'all';
    this.currentSearch = '';
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.modal = document.getElementById('modal');
      this.cartBox = document.getElementById('cartBox');
      this.searchInput = document.getElementById('search');
      this.filterSelect = document.getElementById('filter');

      this.setupModal();
      this.setupCart();
      this.setupSearchAndFilter();
      this.setupKeyboardNavigation();
      this.setupMobileMenu();
    });
  }

  // Modal Functions
  setupModal() {
    if (!this.modal) return;

    // Close modal when clicking outside
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Close modal button
    const closeBtn = this.modal.querySelector('.close-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }
  }

  openModal(productData) {
    if (!this.modal || !productData) return;

    this.currentProduct = productData;

    const nameEl = this.modal.querySelector('#mName');
    const descEl = this.modal.querySelector('#mDesc');
    const priceEl = this.modal.querySelector('#mPrice');

    if (nameEl) nameEl.textContent = productData.name;
    if (descEl) descEl.textContent = productData.desc;
    if (priceEl) priceEl.textContent = "$" + productData.price;

    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.style.display = 'none';
    document.body.style.overflow = '';
    this.currentProduct = null;
  }

  // Cart Functions
  setupCart() {
    if (!this.cartBox) return;

    // Toggle cart button
    const toggleBtn = document.querySelector('[data-action="toggle-cart"]');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleCart());
    }

    // Clear cart button
    const clearBtn = this.cartBox.querySelector('[data-action="clear-cart"]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearCart());
    }

    // Checkout button
    const checkoutBtn = this.cartBox.querySelector('[data-action="checkout"]');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.goToCheckout());
    }

    // Cart item controls
    this.cartBox.addEventListener('click', (e) => {
      const target = e.target;
      const index = target.dataset.index;

      if (target.matches('[data-action="change-qty"]')) {
        const change = parseInt(target.dataset.change);
        this.changeQty(index, change);
      }

      if (target.matches('[data-action="remove-item"]')) {
        this.removeFromCart(index);
      }
    });
  }

  toggleCart() {
    if (!this.cartBox) return;
    this.cartBox.style.display = this.cartBox.style.display === 'block' ? 'none' : 'block';
  }

  clearCart() {
    if (confirm('هل أنت متأكد من تفريغ السلة؟')) {
      this.cart = [];
      this.updateCart();
    }
  }

  goToCheckout() {
    if (!this.cart || this.cart.length === 0) {
      alert('السلة فارغة!');
      return;
    }
    window.location.href = 'checkout.html';
  }

  changeQty(index, change) {
    if (!this.cart[index]) return;
    this.cart[index].qty = (this.cart[index].qty || 1) + change;

    if (this.cart[index].qty <= 0) {
      this.cart.splice(index, 1);
    }

    this.updateCart();
  }

  removeFromCart(index) {
    if (index < 0 || index >= this.cart.length) return;
    this.cart.splice(index, 1);
    this.updateCart();
  }

  updateCart() {
    if (!this.cartBox) return;

    const cartItems = this.cartBox.querySelector('#cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = this.cartBox.querySelector('#cart-total');

    if (!cartItems || !cartCount || !cartTotal) return;

    let html = '';
    let total = 0;

    this.cart.forEach((p, index) => {
      const qty = p.qty || 1;
      total += p.price * qty;

      html += `
        <div class="cart-item">
          <img src="${p.img}" alt="${p.name}">
          <div class="cart-item-details">
            <div class="cart-item-name">${p.name}</div>
            <div class="cart-item-price">$${p.price}</div>
            <div class="cart-item-controls">
              <button data-action="change-qty" data-index="${index}" data-change="-1">-</button>
              <span>${qty}</span>
              <button data-action="change-qty" data-index="${index}" data-change="1">+</button>
            </div>
          </div>
          <button class="cart-remove-btn" data-action="remove-item" data-index="${index}">حذف</button>
        </div>
      `;
    });

    cartItems.innerHTML = html;
    cartCount.textContent = this.cart.length;
    cartTotal.textContent = "الإجمالي: $" + total.toFixed(2);

    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  addToCart(product) {
    if (!product) return;

    const found = this.cart.find(item => item.id === product.id);

    if (found) {
      found.qty++;
    } else {
      this.cart.push({...product, qty: 1});
    }

    this.updateCart();
    this.closeModal();
    this.showToast('تمت الإضافة للسلة ✅');
  }

  // Search and Filter Functions
  setupSearchAndFilter() {
    if (!this.searchInput || !this.filterSelect) return;

    this.searchInput.addEventListener('input', (e) => {
      this.currentSearch = e.target.value.toLowerCase().trim();
      this.applyFilters();
    });

    this.filterSelect.addEventListener('change', (e) => {
      this.currentFilter = e.target.value;
      this.applyFilters();
    });

    // Setup cart toggle button
    const cartToggleBtn = document.querySelector('[data-action="toggle-cart"]');
    if (cartToggleBtn && this.cartBox) {
      cartToggleBtn.addEventListener('click', () => {
        this.cartBox.style.display = this.cartBox.style.display === 'block' ? 'none' : 'block';
      });
    }

    // Setup clear cart button
    const clearCartBtn = document.querySelector('[data-action="clear-cart"]');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => {
        if (confirm('هل أنت متأكد من تفريغ السلة؟')) {
          this.clearCart();
        }
      });
    }

    // Setup checkout button
    const checkoutBtn = document.querySelector('[data-action="go-checkout"]');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (this.cart.length === 0) {
          this.showToast('السلة فارغة!', 'error');
          return;
        }
        window.location.href = 'checkout.html';
      });
    }

    // Setup modal buttons
    const closeModalBtn = document.querySelector('[data-action="close-modal"]');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    const addToCartModalBtn = document.querySelector('[data-action="add-to-cart-modal"]');
    if (addToCartModalBtn) {
      addToCartModalBtn.addEventListener('click', () => {
        if (this.currentProduct) {
          this.addToCart(this.currentProduct);
          this.closeModal();
        }
      });
    }

    // Setup preview buttons
    document.addEventListener('click', (e) => {
      const previewBtn = e.target.closest('[data-action="preview-product"]');
      if (previewBtn) {
        const productId = parseInt(previewBtn.dataset.id);
        const product = this.products.find(p => p.id === productId);
        if (product) {
          this.openModal(product);
        }
      }
    });
  }

  applyFilters() {
    if (!this.products) return;

    let filtered = [...this.products];

    // Apply category filter
    if (this.currentFilter && this.currentFilter !== 'all') {
      filtered = filtered.filter(p => p.cat === this.currentFilter);
    }

    // Apply search filter
    if (this.currentSearch) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(this.currentSearch) ||
        p.desc.toLowerCase().includes(this.currentSearch)
      );
    }

    this.renderProducts(filtered);
  }

  renderProducts(products) {
    const container = document.getElementById('products');
    if (!container) return;

    let html = '';

    products.forEach(p => {
      html += `
        <div class="product" data-product-id="${p.id}">
          <img src="${p.img}" alt="${p.name}">
          <div class="product-content">
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
            <div class="product-price">$${p.price}</div>
            <button data-action="preview-product" data-id="${p.id}">معاينة</button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // Keyboard Navigation
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.style.display === 'flex') {
        this.closeModal();
      }
    });
  }

  // Mobile Menu
  setupMobileMenu() {
    const menuToggle = document.querySelector('[data-action="toggle-menu"]');
    const menu = document.querySelector('.nav-links');

    if (menuToggle && menu) {
      menuToggle.addEventListener('click', () => {
        menu.classList.toggle('show');
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
          menu.classList.remove('show');
        }
      });

      // Close menu on link click
      menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          menu.classList.remove('show');
        });
      });
    }

    // Setup back to top button
    const backToTopBtn = document.querySelector('[data-action="scroll-to-top"]');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });

      // Show/hide button on scroll
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          backToTopBtn.classList.add('show');
        } else {
          backToTopBtn.classList.remove('show');
        }
      });
    }

    // Setup go to templates button
    const goTemplatesBtn = document.querySelector('[data-action="go-templates"]');
    if (goTemplatesBtn) {
      goTemplatesBtn.addEventListener('click', () => {
        window.location.href = 'template-store.html';
      });
    }
  }

  // Toast Notification
  showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 12px 20px;
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
    }, 2000);
  }

  // Initialize cart from localStorage
  loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        this.cart = JSON.parse(savedCart);
        this.updateCart();
      } catch (e) {
        console.error('Error loading cart:', e);
        this.cart = [];
      }
    } else {
      this.cart = [];
    }
  }

  // Set products data
  setProducts(products) {
    this.products = products;
    this.currentFilter = 'all';
    this.currentSearch = '';
    this.renderProducts(products);
  }
}

// Export as default module
export default UIHandler;
