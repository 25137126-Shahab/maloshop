/**
 * Malo Garments — Store Module (API Client)
 * Talks to the Node/Express + MySQL backend instead of localStorage.
 * Keeps the same function names the rest of the app already calls —
 * but every function that hits the network now returns a Promise.
 */

const MaloStore = (() => {
  // ─── Change this if your backend runs somewhere else ───
  const API_BASE = 'http://localhost:5000/api';

  const KEYS = {
    CART: 'malo_cart',
    TOKEN: 'malo_token',
    USER: 'malo_user',
    ADMIN_TOKEN: 'malo_admin_token',
    ADMIN: 'malo_admin'
  };

  // ─── Generic localStorage helpers (still used for cart + session cache) ───
  function getItem(key, fallback) {
    try {
      const val = JSON.parse(localStorage.getItem(key));
      return val === null || val === undefined ? fallback : val;
    } catch {
      return fallback;
    }
  }
  function setItem(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  // ─── Low-level fetch helper ───
  async function apiFetch(path, { method = 'GET', body, auth = false, adminAuth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = localStorage.getItem(KEYS.TOKEN);
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    if (adminAuth) {
      const token = localStorage.getItem(KEYS.ADMIN_TOKEN);
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined
      });
    } catch (err) {
      throw new Error('Could not reach the server. Is the backend running?');
    }

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json().catch(() => ({})) : null;

    if (!res.ok) {
      throw new Error((data && data.error) || `Request failed (${res.status})`);
    }
    return data;
  }

  // ─── Products ───
  async function getProducts(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === false) return;
      if (Array.isArray(v)) {
        if (v.length) params.set(k, v.join(','));
      } else {
        params.set(k, v);
      }
    });
    const qs = params.toString();
    return apiFetch(`/products${qs ? `?${qs}` : ''}`);
  }

  async function getProductById(id) {
    try {
      return await apiFetch(`/products/${id}`);
    } catch {
      return null;
    }
  }

  async function saveProduct(product) {
    if (product.id) {
      return apiFetch(`/products/${product.id}`, { method: 'PUT', body: product, adminAuth: true });
    }
    return apiFetch('/products', { method: 'POST', body: product, adminAuth: true });
  }

  async function deleteProduct(id) {
    return apiFetch(`/products/${id}`, { method: 'DELETE', adminAuth: true });
  }

  async function searchProducts(query) {
    return getProducts({ q: query });
  }

  async function filterProducts(opts = {}) {
    return getProducts({
      category: opts.category,
      subcategory: opts.subcategory,
      onSale: opts.onSale,
      minPrice: opts.minPrice,
      maxPrice: opts.maxPrice,
      sizes: opts.sizes,
      colors: opts.colors,
      sort: opts.sort
    });
  }

  // ─── Categories ───
  async function getCategories() {
    return apiFetch('/categories');
  }

  async function getCategoryById(id) {
    if (!id) return null;
    try {
      return await apiFetch(`/categories/${id}`);
    } catch {
      return null;
    }
  }

  async function getCategoryBySlug(slug) {
    return getCategoryById(slug); // backend accepts id OR slug on the same route
  }

  async function saveCategory(category) {
    if (category.id) {
      return apiFetch(`/categories/${category.id}`, { method: 'PUT', body: category, adminAuth: true });
    }
    return apiFetch('/categories', { method: 'POST', body: category, adminAuth: true });
  }

  async function deleteCategory(id) {
    return apiFetch(`/categories/${id}`, { method: 'DELETE', adminAuth: true });
  }

  // ─── Cart (still local — no login required to shop) ───
  function getCart() {
    return getItem(KEYS.CART, []);
  }

  function addToCart(productId, size, color, quantity = 1) {
    const cart = getCart();
    const existing = cart.find(i => i.productId === productId && i.size === size && i.color === color);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: generateId('cart'), productId, size, color, quantity });
    }
    setItem(KEYS.CART, cart);
    return cart;
  }

  function updateCartItem(cartItemId, quantity) {
    const cart = getCart();
    const item = cart.find(i => i.id === cartItemId);
    if (item) item.quantity = Math.max(1, quantity);
    setItem(KEYS.CART, cart);
    return cart;
  }

  function removeFromCart(cartItemId) {
    const cart = getCart().filter(i => i.id !== cartItemId);
    setItem(KEYS.CART, cart);
    return cart;
  }

  function clearCart() {
    setItem(KEYS.CART, []);
  }

  function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  async function getCartTotal() {
    const cart = getCart();
    let subtotal = 0;
    for (const item of cart) {
      const product = await getProductById(item.productId);
      if (product) subtotal += product.price * item.quantity;
    }
    return subtotal;
  }

  // ─── Customer Auth ───
  function cacheSession(user, token) {
    setItem(KEYS.USER, user);
    localStorage.setItem(KEYS.TOKEN, token);
  }

  async function registerUser(userData) {
    try {
      const result = await apiFetch('/auth/register', { method: 'POST', body: userData });
      cacheSession(result.user, result.token);
      return { success: true, user: result.user };
    } catch (err) {
      return { error: err.message };
    }
  }

  async function loginUser(email, password) {
    try {
      const result = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
      cacheSession(result.user, result.token);
      return { success: true, user: result.user };
    } catch (err) {
      return { error: err.message };
    }
  }

  function getCurrentUser() {
    return getItem(KEYS.USER, null);
  }

  async function getMyProfile() {
    const profile = await apiFetch('/auth/me', { auth: true });
    // keep the cached session fresh (adds addresses, joined date, etc.)
    setItem(KEYS.USER, { ...getCurrentUser(), ...profile });
    return profile;
  }

  async function updateUser(userId, updates) {
    await apiFetch('/auth/me', { method: 'PUT', body: updates, auth: true });
    const merged = { ...getCurrentUser(), ...updates };
    setItem(KEYS.USER, merged);
    return merged;
  }

  async function addUserAddress(userId, address) {
    const saved = await apiFetch('/auth/me/addresses', { method: 'POST', body: address, auth: true });
    const user = getCurrentUser();
    user.addresses = [...(user.addresses || []), saved];
    setItem(KEYS.USER, user);
    return saved;
  }

  function logoutUser() {
    localStorage.removeItem(KEYS.TOKEN);
    localStorage.removeItem(KEYS.USER);
  }

  // ─── Orders ───
  async function placeOrder(orderData) {
    const cart = getCart();
    const items = cart.map(i => ({ productId: i.productId, size: i.size, color: i.color, quantity: i.quantity }));
    const order = await apiFetch('/orders', {
      method: 'POST',
      body: { ...orderData, items },
      auth: !!getCurrentUser()
    });
    clearCart();
    return order;
  }

  async function getMyOrders() {
    return apiFetch('/orders/mine', { auth: true });
  }

  async function getOrderById(id) {
    try {
      return await apiFetch(`/orders/${id}`);
    } catch {
      return null;
    }
  }

  async function getOrders() {
    return apiFetch('/orders', { adminAuth: true });
  }

  async function updateOrderStatus(orderId, status) {
    return apiFetch(`/orders/${orderId}/status`, { method: 'PATCH', body: { status }, adminAuth: true });
  }

  // ─── Admin ───
  function cacheAdminSession(admin, token) {
    setItem(KEYS.ADMIN, admin);
    localStorage.setItem(KEYS.ADMIN_TOKEN, token);
  }

  async function adminLogin(username, password) {
    try {
      const result = await apiFetch('/admin/login', { method: 'POST', body: { username, password } });
      cacheAdminSession(result.admin, result.token);
      return true;
    } catch {
      return false;
    }
  }

  function isAdminLoggedIn() {
    return !!localStorage.getItem(KEYS.ADMIN_TOKEN);
  }

  function adminLogout() {
    localStorage.removeItem(KEYS.ADMIN_TOKEN);
    localStorage.removeItem(KEYS.ADMIN);
  }

  function getAdminName() {
    const admin = getItem(KEYS.ADMIN, null);
    return admin ? admin.name : 'Admin';
  }

  // getUsers/getUserById are admin-only lookups (customer management page)
  async function getUsers() {
    const rows = await apiFetch('/admin/customers', { adminAuth: true });
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      dateJoined: r.date_joined,
      orderCount: r.order_count,
      totalSpent: Number(r.lifetime_spend)
    }));
  }

  async function getUserById(id) {
    try {
      const u = await apiFetch(`/admin/customers/${id}`, { adminAuth: true });
      return { ...u, dateJoined: u.date_joined };
    } catch {
      return null;
    }
  }

  async function getStats() {
    return apiFetch('/admin/stats', { adminAuth: true });
  }

  // ─── Newsletter ───
  async function subscribeNewsletter(email) {
    try {
      await apiFetch('/newsletter', { method: 'POST', body: { email } });
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  }

  // Public API
  return {
    // Products
    getProducts, getProductById, saveProduct, deleteProduct, searchProducts, filterProducts,
    // Categories
    getCategories, getCategoryById, getCategoryBySlug, saveCategory, deleteCategory,
    // Cart
    getCart, addToCart, updateCartItem, removeFromCart, clearCart, getCartCount, getCartTotal,
    // Customer auth
    registerUser, loginUser, getCurrentUser, getMyProfile, updateUser, addUserAddress, logoutUser,
    // Orders
    placeOrder, getMyOrders, getOrderById, getOrders, updateOrderStatus,
    // Admin
    adminLogin, isAdminLoggedIn, adminLogout, getAdminName, getUsers, getUserById, getStats,
    // Newsletter
    subscribeNewsletter,
    // Utils
    generateId
  };
})();
