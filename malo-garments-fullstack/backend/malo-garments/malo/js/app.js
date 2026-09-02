/**
 * Malo Garments — Shared Application Logic
 * Handles navbar, footer, search, mobile menu, toast notifications, and auth state.
 * Included on every page.
 */

// ─── Utility: Determine base path for linking ───
const MaloApp = (() => {
  // Detect if we're in root or /pages/ subfolder
  const isSubPage = window.location.pathname.includes('/pages/');
  const isAdmin = window.location.pathname.includes('/admin/');
  const BASE = isSubPage ? '../' : (isAdmin ? '../' : './');
  const PAGES = isSubPage ? './' : './pages/';

  // ─── Currency Formatter ───
  function formatPrice(amount) {
    return 'Rs. ' + amount.toLocaleString('en-PK');
  }

  // ─── Star Rating HTML ───
  function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars += '<i class="star filled">★</i>';
      } else if (i - 0.5 <= rating) {
        stars += '<i class="star half">★</i>';
      } else {
        stars += '<i class="star">☆</i>';
      }
    }
    return stars;
  }

  // ─── Render Navbar ───
  function renderNavbar() {
    const user = MaloStore.getCurrentUser();
    const cartCount = MaloStore.getCartCount();

    const nav = document.getElementById('main-navbar');
    if (!nav) return;

    nav.innerHTML = `
      <div class="navbar-container">
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>

        <a href="${BASE}index.html" class="navbar-logo">
          <span class="logo-icon">✦</span>
          <span class="logo-text">Malo<span class="logo-accent">Garments</span></span>
        </a>

        <nav class="navbar-links" id="navLinks">
          <a href="${BASE}index.html" class="nav-link">Home</a>
          <a href="${PAGES}shop.html" class="nav-link">Shop</a>
          <a href="${PAGES}shop.html?category=cat-1" class="nav-link">Ladies Garments</a>
          <a href="${PAGES}shop.html?category=cat-2" class="nav-link">Undergarments</a>
          <a href="${PAGES}about.html" class="nav-link">About</a>
          <a href="${PAGES}contact.html" class="nav-link">Contact</a>
        </nav>

        <div class="navbar-actions">
          <button class="nav-search-btn" id="searchToggle" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          ${user ? `
            <a href="${PAGES}account.html" class="nav-icon-link" aria-label="Account" title="${user.name}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </a>
          ` : `
            <a href="${PAGES}login.html" class="nav-icon-link" aria-label="Login">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </a>
          `}

          <a href="${PAGES}cart.html" class="nav-icon-link cart-link" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            ${cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : ''}
          </a>
        </div>
      </div>

      <div class="search-overlay" id="searchOverlay">
        <div class="search-overlay-inner">
          <form class="search-form" id="searchForm">
            <input type="text" class="search-input" id="searchInput" placeholder="Search for dresses, tops, lingerie..." autocomplete="off" />
            <button type="submit" class="search-submit">Search</button>
            <button type="button" class="search-close" id="searchClose">✕</button>
          </form>
        </div>
      </div>
    `;

    // Bind events
    bindNavbarEvents();
  }

  function bindNavbarEvents() {
    // Mobile menu
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
      });
    }

    // Search overlay
    const searchToggle = document.getElementById('searchToggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');

    if (searchToggle && searchOverlay) {
      searchToggle.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        setTimeout(() => searchInput.focus(), 300);
      });
      searchClose.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
      });
      searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
          searchOverlay.classList.remove('active');
        }
      });
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `${PAGES}shop.html?search=${encodeURIComponent(query)}`;
        }
      });
    }
  }

  // ─── Render Footer ───
  function renderFooter() {
    const footer = document.getElementById('main-footer');
    if (!footer) return;

    footer.innerHTML = `
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-col footer-brand">
            <a href="${BASE}index.html" class="footer-logo">
              <span class="logo-icon">✦</span> Malo<span class="logo-accent">Garments</span>
            </a>
            <p class="footer-desc">Elevating everyday elegance with curated women's fashion and intimate apparel. Quality, comfort, and style — delivered to your doorstep.</p>
            <div class="footer-social">
              <a href="#" aria-label="Facebook" class="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" class="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="Twitter" class="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" aria-label="WhatsApp" class="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>

          <div class="footer-col">
            <h4 class="footer-title">Quick Links</h4>
            <ul class="footer-links">
              <li><a href="${BASE}index.html">Home</a></li>
              <li><a href="${PAGES}shop.html">Shop All</a></li>
              <li><a href="${PAGES}shop.html?category=cat-1">Ladies Garments</a></li>
              <li><a href="${PAGES}shop.html?category=cat-2">Undergarments</a></li>
              <li><a href="${PAGES}shop.html?sale=true">Sale</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-title">Customer Care</h4>
            <ul class="footer-links">
              <li><a href="${PAGES}about.html">About Us</a></li>
              <li><a href="${PAGES}contact.html">Contact Us</a></li>
              <li><a href="${PAGES}account.html">My Account</a></li>
              <li><a href="#">Shipping Policy</a></li>
              <li><a href="#">Return & Exchange</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-title">Contact Info</h4>
            <ul class="footer-contact">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                123 Fashion Street, Lahore, Pakistan
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +92 300 1234567
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                hello@malogarments.com
              </li>
            </ul>
          </div>
        </div>

        <div class="footer-newsletter">
          <h4>Subscribe to our Newsletter</h4>
          <p>Get the latest updates on new arrivals and exclusive offers.</p>
          <form class="newsletter-form" id="footerNewsletter">
            <input type="email" placeholder="Your email address" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2026 Malo Garments. All rights reserved.</p>
          <div class="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    `;

    // Newsletter form
    const nlForm = document.getElementById('footerNewsletter');
    if (nlForm) {
      nlForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = nlForm.querySelector('input').value;
        const result = await MaloStore.subscribeNewsletter(email);
        if (result.success) {
          showToast('Thank you for subscribing! ✨', 'success');
          nlForm.reset();
        } else {
          showToast(result.error, 'info');
        }
      });
    }
  }

  // ─── Toast Notification System ───
  function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toast
    const existing = document.querySelector('.malo-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `malo-toast malo-toast-${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('show'));

    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ─── Update Cart Badge ───
  function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    const count = MaloStore.getCartCount();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    } else if (count > 0) {
      const cartLink = document.querySelector('.cart-link');
      if (cartLink) {
        const newBadge = document.createElement('span');
        newBadge.className = 'cart-badge';
        newBadge.textContent = count;
        cartLink.appendChild(newBadge);
      }
    }
  }

  // ─── Product Card HTML Generator ───
  function createProductCard(product) {
    const discount = product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

    return `
      <div class="product-card" data-id="${product.id}">
        <a href="${PAGES}product.html?id=${product.id}" class="product-card-link">
          <div class="product-card-image">
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
            ${discount > 0 ? `<span class="product-badge sale">-${discount}%</span>` : ''}
            ${product.featured ? '<span class="product-badge featured">New</span>' : ''}
          </div>
          <div class="product-card-info">
            <h3 class="product-card-name">${product.name}</h3>
            <div class="product-card-rating">
              ${renderStars(product.rating)}
              <span class="rating-count">(${product.reviews})</span>
            </div>
            <div class="product-card-price">
              <span class="current-price">${formatPrice(product.price)}</span>
              ${product.originalPrice > product.price ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''}
            </div>
          </div>
        </a>
        <button class="product-card-cart-btn" onclick="MaloApp.quickAddToCart('${product.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Add to Cart
        </button>
      </div>
    `;
  }

  // ─── Quick Add to Cart ───
  async function quickAddToCart(productId) {
    const product = await MaloStore.getProductById(productId);
    if (!product) return;

    const defaultSize = product.sizes[0];
    const defaultColor = product.colors[0]?.name || '';
    MaloStore.addToCart(productId, defaultSize, defaultColor, 1);
    updateCartBadge();
    showToast(`${product.name} added to cart! 🛍️`, 'success');
  }

  // ─── Scroll Animations ───
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }

  // ─── Initialize Page ───
  function initPage() {
    renderNavbar();
    renderFooter();
    initScrollAnimations();

    // Mark active nav link
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('href') && currentPath.endsWith(link.getAttribute('href').replace('./', '').replace('../', ''))) {
        link.classList.add('active');
      }
    });
  }

  // Public API
  return {
    BASE,
    PAGES,
    formatPrice,
    renderStars,
    renderNavbar,
    renderFooter,
    showToast,
    updateCartBadge,
    createProductCard,
    quickAddToCart,
    initScrollAnimations,
    initPage
  };
})();
