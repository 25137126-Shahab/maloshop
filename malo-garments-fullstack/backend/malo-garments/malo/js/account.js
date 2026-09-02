/**
 * Malo Garments — Account Page Logic
 * Order history, saved addresses, and profile editing.
 */

document.addEventListener('DOMContentLoaded', () => {
  MaloApp.initPage();
  initAccountPage();
});

async function initAccountPage() {
  let user = MaloStore.getCurrentUser();
  const container = document.getElementById('accountContent');

  if (!user) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔒</div>
        <h3>Please log in</h3>
        <p>You need to be logged in to view your account.</p>
        <a href="./login.html" class="btn btn-primary">Log In</a>
      </div>
    `;
    return;
  }

  // Fetch the full profile (includes saved addresses) from the server
  try {
    user = await MaloStore.getMyProfile();
  } catch {
    // session may have expired — fall back to the cached basic user
  }

  container.innerHTML = `
    <div class="account-layout">
      <aside class="account-sidebar">
        <div class="account-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <h3>${user.name}</h3>
        <p style="font-size: var(--fs-sm); color: var(--text-light);">${user.email}</p>
        <nav class="account-nav">
          <button class="active" data-panel="orders">📦 Order History</button>
          <button data-panel="addresses">📍 Saved Addresses</button>
          <button data-panel="profile">👤 Edit Profile</button>
          <button class="logout" id="logoutBtn">↪ Log Out</button>
        </nav>
      </aside>

      <div class="account-main">
        <div class="account-panel active" id="panel-orders">
          <h2 class="account-panel-title">Order History</h2>
          <div id="orderHistoryList"></div>
        </div>

        <div class="account-panel" id="panel-addresses">
          <h2 class="account-panel-title">Saved Addresses</h2>
          <div id="addressList"></div>
          <button class="btn btn-outline" id="addAddressBtn" style="margin-top: var(--sp-md);">+ Add New Address</button>
          <form id="addAddressForm" style="display:none; margin-top: var(--sp-xl); padding-top: var(--sp-xl); border-top: 1px solid var(--border-light);">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Label</label>
                <input type="text" class="form-input" id="addrLabel" placeholder="Home, Office, etc." required />
              </div>
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input type="tel" class="form-input" id="addrPhone" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Street Address</label>
              <input type="text" class="form-input" id="addrStreet" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">City</label>
                <input type="text" class="form-input" id="addrCity" required />
              </div>
              <div class="form-group">
                <label class="form-label">Postal Code</label>
                <input type="text" class="form-input" id="addrZip" />
              </div>
            </div>
            <button type="submit" class="btn btn-primary">Save Address</button>
          </form>
        </div>

        <div class="account-panel" id="panel-profile">
          <h2 class="account-panel-title">Edit Profile</h2>
          <form id="profileForm">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" id="profileName" value="${user.name}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" id="profileEmail" value="${user.email}" disabled />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="tel" class="form-input" id="profilePhone" value="${user.phone || ''}" />
            </div>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  `;

  await renderOrderHistory(user);
  renderAddresses(user);
  bindAccountEvents(user);
}

async function renderOrderHistory(user) {
  const orders = (await MaloStore.getMyOrders()).sort((a, b) => new Date(b.date) - new Date(a.date));
  const container = document.getElementById('orderHistoryList');

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h3>No orders yet</h3>
        <p>When you place an order, it will show up here.</p>
        <a href="./shop.html" class="btn btn-outline">Start Shopping</a>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="order-history-item">
      <div class="order-history-header">
        <div>
          <strong>${order.id}</strong>
          <div style="font-size: var(--fs-xs); color: var(--text-muted);">${new Date(order.date).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <span class="order-status-badge ${order.status}">${order.status}</span>
      </div>
      ${order.items.map(item => `
        <div class="checkout-summary-item">
          <img src="${item.image}" alt="${item.name}" />
          <div class="checkout-summary-item-info">
            <div class="name">${item.name}</div>
            <div class="meta">Size: ${item.size} · Qty: ${item.quantity}</div>
          </div>
          <div>${MaloApp.formatPrice(item.price * item.quantity)}</div>
        </div>
      `).join('')}
      <div class="summary-row total" style="margin-top: var(--sp-md); padding-top: var(--sp-md);">
        <span>Total</span><span>${MaloApp.formatPrice(order.total)}</span>
      </div>
    </div>
  `).join('');
}

function renderAddresses(user) {
  const container = document.getElementById('addressList');
  const addresses = user.addresses || [];

  if (addresses.length === 0) {
    container.innerHTML = `<p style="color: var(--text-light);">No saved addresses yet.</p>`;
    return;
  }

  container.innerHTML = addresses.map(addr => `
    <div class="address-card">
      <strong>${addr.label}</strong>
      <p style="font-size: var(--fs-sm); color: var(--text-light); margin-top: var(--sp-sm);">
        ${addr.street}, ${addr.city} ${addr.zip || ''}<br />
        ${addr.phone}
      </p>
    </div>
  `).join('');
}

function bindAccountEvents(user) {
  // Panel switching
  document.querySelectorAll('.account-nav button[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.account-nav button[data-panel]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.account-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`panel-${btn.dataset.panel}`).classList.add('active');
    });
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    MaloStore.logoutUser();
    MaloApp.showToast('You have been logged out.', 'info');
    setTimeout(() => window.location.href = '../index.html', 600);
  });

  // Add address toggle
  const addBtn = document.getElementById('addAddressBtn');
  const addForm = document.getElementById('addAddressForm');
  addBtn.addEventListener('click', () => {
    addForm.style.display = addForm.style.display === 'none' ? 'block' : 'none';
  });

  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const address = {
      label: document.getElementById('addrLabel').value.trim(),
      phone: document.getElementById('addrPhone').value.trim(),
      street: document.getElementById('addrStreet').value.trim(),
      city: document.getElementById('addrCity').value.trim(),
      zip: document.getElementById('addrZip').value.trim()
    };
    await MaloStore.addUserAddress(user.id, address);
    MaloApp.showToast('Address saved! ✓', 'success');
    await initAccountPage();
    // Re-open addresses panel
    document.querySelector('.account-nav button[data-panel="addresses"]').click();
  });

  // Profile form
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const updates = {
      name: document.getElementById('profileName').value.trim(),
      phone: document.getElementById('profilePhone').value.trim()
    };
    await MaloStore.updateUser(user.id, updates);
    MaloApp.showToast('Profile updated! ✓', 'success');
    MaloApp.renderNavbar();
  });
}
