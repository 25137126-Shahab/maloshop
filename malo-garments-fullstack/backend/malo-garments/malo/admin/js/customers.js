/**
 * Malo Garments — Admin Customer Management
 * View registered customers, search, and drill into order history.
 */

let customerSearchTerm = '';

document.addEventListener('DOMContentLoaded', async () => {
  if (!AdminApp.initAdminPage('customers.html', 'Customer Management')) return;

  await renderCustomersTable();
  bindCustomerEvents();
});

async function renderCustomersTable() {
  let users = await MaloStore.getUsers();

  if (customerSearchTerm) {
    const q = customerSearchTerm.toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  const tbody = document.getElementById('customersTableBody');

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: var(--sp-xl);">No registered customers yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td><strong>${u.name}</strong></td>
      <td>${u.email}</td>
      <td>${u.phone || '—'}</td>
      <td>${AdminApp.formatDate(u.dateJoined)}</td>
      <td>${u.orderCount}</td>
      <td>${MaloApp.formatPrice(u.totalSpent)}</td>
      <td><button class="admin-icon-btn view-customer-btn" data-id="${u.id}" title="View">👁</button></td>
    </tr>
  `).join('');

  document.querySelectorAll('.view-customer-btn').forEach(btn => {
    btn.addEventListener('click', () => openCustomerModal(btn.dataset.id));
  });
}

function bindCustomerEvents() {
  document.getElementById('customerSearch').addEventListener('input', (e) => {
    customerSearchTerm = e.target.value;
    renderCustomersTable();
  });
  document.getElementById('closeCustomerModal').addEventListener('click', closeCustomerModal);
  document.getElementById('customerModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'customerModalOverlay') closeCustomerModal();
  });
}

async function openCustomerModal(id) {
  const u = await MaloStore.getUserById(id);
  if (!u) return;
  const orders = (u.orders || []).sort((a, b) => new Date(b.date) - new Date(a.date));

  document.getElementById('customerModalTitle').textContent = u.name;
  document.getElementById('customerModalBody').innerHTML = `
    <p style="color: var(--text-light); margin-bottom: var(--sp-lg);">${u.email} · ${u.phone || 'No phone on file'}</p>
    <h4 style="margin-bottom: var(--sp-md);">Order History</h4>
    ${orders.length === 0 ? '<p style="color: var(--text-muted);">No orders placed yet.</p>' : orders.map(o => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding: var(--sp-md) 0; border-bottom: 1px solid var(--border-light);">
        <div>
          <strong>${o.id}</strong>
          <div style="font-size: var(--fs-xs); color: var(--text-muted);">${AdminApp.formatDate(o.date)}</div>
        </div>
        <span class="admin-badge ${o.status}">${o.status}</span>
        <span>${MaloApp.formatPrice(o.total)}</span>
      </div>
    `).join('')}
    ${u.addresses && u.addresses.length ? `
      <h4 style="margin: var(--sp-xl) 0 var(--sp-md);">Saved Addresses</h4>
      ${u.addresses.map(a => `<p style="font-size: var(--fs-sm); color: var(--text-light); margin-bottom: var(--sp-sm);">${a.label}: ${a.street}, ${a.city}</p>`).join('')}
    ` : ''}
  `;

  document.getElementById('customerModalOverlay').classList.add('active');
}

function closeCustomerModal() {
  document.getElementById('customerModalOverlay').classList.remove('active');
}
