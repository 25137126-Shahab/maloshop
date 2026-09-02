/**
 * Malo Garments — Admin Shared Logic
 * Auth guard, sidebar rendering, and shared admin utilities.
 * Included on every admin page except the login page.
 */

const AdminApp = (() => {
  const NAV_ITEMS = [
    { href: 'dashboard.html', icon: '📊', label: 'Dashboard' },
    { href: 'products.html', icon: '👗', label: 'Products' },
    { href: 'categories.html', icon: '🗂️', label: 'Categories' },
    { href: 'orders.html', icon: '📦', label: 'Orders' },
    { href: 'customers.html', icon: '👥', label: 'Customers' }
  ];

  function guard() {
    if (!MaloStore.isAdminLoggedIn()) {
      window.location.href = './index.html';
      return false;
    }
    return true;
  }

  function renderSidebar(activePage) {
    const sidebar = document.getElementById('adminSidebar');
    if (!sidebar) return;

    sidebar.innerHTML = `
      <div class="admin-sidebar-logo">
        <span class="logo-icon">✦</span> Malo Admin
      </div>
      <nav class="admin-nav">
        ${NAV_ITEMS.map(item => `
          <a href="${item.href}" class="${activePage === item.href ? 'active' : ''}">
            <span>${item.icon}</span> ${item.label}
          </a>
        `).join('')}
      </nav>
      <div class="admin-sidebar-footer">
        <button id="adminLogoutBtn">↪ Log Out</button>
      </div>
    `;

    document.getElementById('adminLogoutBtn').addEventListener('click', () => {
      MaloStore.adminLogout();
      window.location.href = './index.html';
    });
  }

  function renderTopbar(title) {
    const topbar = document.getElementById('adminTopbar');
    if (!topbar) return;
    topbar.innerHTML = `
      <h1>${title}</h1>
      <div class="admin-topbar-user">
        <span>👤</span> ${MaloStore.getAdminName()}
      </div>
    `;
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function initAdminPage(activePage, title) {
    if (!guard()) return false;
    renderSidebar(activePage);
    renderTopbar(title);
    return true;
  }

  return { guard, renderSidebar, renderTopbar, initAdminPage, formatDate };
})();
