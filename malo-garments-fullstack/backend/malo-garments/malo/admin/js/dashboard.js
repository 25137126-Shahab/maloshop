/**
 * Malo Garments — Admin Dashboard Logic
 * Stat cards, revenue chart, category breakdown chart, recent orders.
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!AdminApp.initAdminPage('dashboard.html', 'Dashboard Overview')) return;

  const stats = await MaloStore.getStats();
  renderStatCards(stats);
  renderRevenueChart(stats);
  renderCategoryChart(stats);
  await renderRecentOrders();
});

function renderStatCards(stats) {
  const grid = document.getElementById('statsGrid');
  grid.innerHTML = `
    <div class="admin-stat-card">
      <div class="admin-stat-icon revenue">💰</div>
      <div>
        <div class="admin-stat-value">${MaloApp.formatPrice(stats.totalRevenue)}</div>
        <div class="admin-stat-label">Total Revenue</div>
      </div>
    </div>
    <div class="admin-stat-card">
      <div class="admin-stat-icon orders">📦</div>
      <div>
        <div class="admin-stat-value">${stats.totalOrders}</div>
        <div class="admin-stat-label">Total Orders</div>
      </div>
    </div>
    <div class="admin-stat-card">
      <div class="admin-stat-icon products">👗</div>
      <div>
        <div class="admin-stat-value">${stats.totalProducts}</div>
        <div class="admin-stat-label">Total Products</div>
      </div>
    </div>
    <div class="admin-stat-card">
      <div class="admin-stat-icon customers">👥</div>
      <div>
        <div class="admin-stat-value">${stats.totalCustomers}</div>
        <div class="admin-stat-label">Total Customers</div>
      </div>
    </div>
  `;
}

function renderRevenueChart(stats) {
  const ctx = document.getElementById('revenueChart');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: stats.monthlyRevenue.map(m => m.month),
      datasets: [{
        label: 'Revenue (Rs.)',
        data: stats.monthlyRevenue.map(m => m.revenue),
        borderColor: '#C97B7B',
        backgroundColor: 'rgba(201, 123, 123, 0.12)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#C97B7B'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function renderCategoryChart(stats) {
  const ctx = document.getElementById('categoryChart');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: stats.categoryBreakdown.map(c => c.name),
      datasets: [{
        data: stats.categoryBreakdown.map(c => c.count),
        backgroundColor: ['#C97B7B', '#C9A96E', '#E8D5C4', '#F2B5B5']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function renderRecentOrders() {
  return MaloStore.getOrders().then(allOrders => {
    const orders = allOrders
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);

    const tbody = document.getElementById('recentOrdersBody');

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: var(--sp-xl);">No orders yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${o.customer.name}</td>
        <td>${AdminApp.formatDate(o.date)}</td>
        <td>${MaloApp.formatPrice(o.total)}</td>
        <td><span class="admin-badge ${o.status}">${o.status}</span></td>
      </tr>
    `).join('');
  });
}
