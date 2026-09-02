/**
 * Malo Garments — Admin Order Management
 * View all orders, filter/search, view details, update status.
 */

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
let orderFilterState = { search: '', status: '' };

document.addEventListener('DOMContentLoaded', async () => {
  if (!AdminApp.initAdminPage('orders.html', 'Order Management')) return;

  await renderOrdersTable();
  bindOrderEvents();
});

async function renderOrdersTable() {
  let orders = (await MaloStore.getOrders()).sort((a, b) => new Date(b.date) - new Date(a.date));

  if (orderFilterState.search) {
    const q = orderFilterState.search.toLowerCase();
    orders = orders.filter(o => o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q));
  }
  if (orderFilterState.status) {
    orders = orders.filter(o => o.status === orderFilterState.status);
  }

  const tbody = document.getElementById('ordersTableBody');

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--text-muted); padding: var(--sp-xl);">No orders found.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer.name}</td>
      <td>${AdminApp.formatDate(o.date)}</td>
      <td>${o.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)</td>
      <td>${MaloApp.formatPrice(o.total)}</td>
      <td>${o.paymentMethod === 'cod' ? 'COD' : 'Card'}</td>
      <td>
        <select class="form-select status-select" data-id="${o.id}" style="padding: 6px 10px; font-size: var(--fs-xs);">
          ${ORDER_STATUSES.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td>
        <button class="admin-icon-btn view-order-btn" data-id="${o.id}" title="View Details">👁</button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      try {
        await MaloStore.updateOrderStatus(sel.dataset.id, sel.value);
        MaloApp.showToast(`Order ${sel.dataset.id} marked as ${sel.value}.`, 'success');
        renderOrdersTable();
      } catch (err) {
        MaloApp.showToast(err.message || 'Failed to update order status.', 'error');
      }
    });
  });

  document.querySelectorAll('.view-order-btn').forEach(btn => {
    btn.addEventListener('click', () => openOrderModal(btn.dataset.id));
  });
}

function bindOrderEvents() {
  document.getElementById('orderSearch').addEventListener('input', (e) => {
    orderFilterState.search = e.target.value;
    renderOrdersTable();
  });
  document.getElementById('statusFilterSelect').addEventListener('change', (e) => {
    orderFilterState.status = e.target.value;
    renderOrdersTable();
  });
  document.getElementById('closeOrderModal').addEventListener('click', closeOrderModal);
  document.getElementById('orderModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'orderModalOverlay') closeOrderModal();
  });
}

async function openOrderModal(id) {
  const o = await MaloStore.getOrderById(id);
  if (!o) return;

  document.getElementById('orderModalBody').innerHTML = `
    <div class="form-row">
      <div>
        <h4 style="margin-bottom: var(--sp-sm);">Customer</h4>
        <p style="font-size: var(--fs-sm); color: var(--text-light);">
          ${o.customer.name}<br />
          ${o.customer.email}<br />
          ${o.customer.phone}
        </p>
      </div>
      <div>
        <h4 style="margin-bottom: var(--sp-sm);">Shipping Address</h4>
        <p style="font-size: var(--fs-sm); color: var(--text-light);">
          ${o.customer.address}<br />
          ${o.customer.city}${o.customer.state ? ', ' + o.customer.state : ''} ${o.customer.zip || ''}<br />
          ${o.customer.country}
        </p>
      </div>
    </div>

    <h4 style="margin: var(--sp-xl) 0 var(--sp-md);">Items</h4>
    ${o.items.map(item => `
      <div class="checkout-summary-item" style="display:flex; gap: var(--sp-md); margin-bottom: var(--sp-md); align-items:center;">
        <img src="${item.image}" alt="${item.name}" style="width:48px; height:58px; object-fit:cover; border-radius:6px;" />
        <div style="flex:1;">
          <div style="font-weight:500;">${item.name}</div>
          <div style="font-size: var(--fs-xs); color: var(--text-muted);">Size: ${item.size} · Color: ${item.color} · Qty: ${item.quantity}</div>
        </div>
        <div>${MaloApp.formatPrice(item.price * item.quantity)}</div>
      </div>
    `).join('')}

    <div style="margin-top: var(--sp-lg); padding-top: var(--sp-lg); border-top: 1px solid var(--border-light);">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span>Subtotal</span><span>${MaloApp.formatPrice(o.subtotal)}</span></div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span>Shipping</span><span>${o.shipping === 0 ? 'Free' : MaloApp.formatPrice(o.shipping)}</span></div>
      <div style="display:flex; justify-content:space-between; font-weight:700; font-size: var(--fs-md);"><span>Total</span><span>${MaloApp.formatPrice(o.total)}</span></div>
    </div>

    ${o.notes ? `<div style="margin-top: var(--sp-lg);"><strong>Notes:</strong> <span style="color: var(--text-light);">${o.notes}</span></div>` : ''}
  `;

  document.getElementById('orderModalOverlay').classList.add('active');
}

function closeOrderModal() {
  document.getElementById('orderModalOverlay').classList.remove('active');
}
