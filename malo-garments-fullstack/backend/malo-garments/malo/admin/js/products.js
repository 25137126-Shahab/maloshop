/**
 * Malo Garments — Admin Product Management
 * Add, edit, delete products; search and filter the product table.
 */

let productFilterState = { search: '', category: '' };
let categoryLookup = new Map(); // id -> category (cached per render, avoids refetching per row)

document.addEventListener('DOMContentLoaded', async () => {
  if (!AdminApp.initAdminPage('products.html', 'Product Management')) return;

  await populateCategoryFilter();
  await populateCategoryModalSelect();
  await renderProductsTable();
  bindProductEvents();
});

async function populateCategoryFilter() {
  const select = document.getElementById('categoryFilterSelect');
  const categories = await MaloStore.getCategories();
  select.innerHTML = `<option value="">All Categories</option>` +
    categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function renderProductsTable() {
  let products = await MaloStore.getProducts();
  const categories = await MaloStore.getCategories();
  categoryLookup = new Map(categories.map(c => [c.id, c]));

  if (productFilterState.search) {
    const q = productFilterState.search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q));
  }
  if (productFilterState.category) {
    products = products.filter(p => p.category === productFilterState.category);
  }

  const tbody = document.getElementById('productsTableBody');

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--text-muted); padding: var(--sp-xl);">No products found.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => {
    const cat = categoryLookup.get(p.category);
    const stockClass = p.stock === 0 ? 'out-of-stock' : (p.stock < 10 ? 'low-stock' : 'in-stock');
    const stockLabel = p.stock === 0 ? 'Out of Stock' : (p.stock < 10 ? `Low (${p.stock})` : `${p.stock} in stock`);
    return `
      <tr>
        <td><img src="${p.images[0]}" class="admin-table-thumb" alt="${p.name}" /></td>
        <td><strong>${p.name}</strong></td>
        <td>${cat ? cat.name : '—'}</td>
        <td>${MaloApp.formatPrice(p.price)}</td>
        <td>${p.stock}</td>
        <td>⭐ ${p.rating}</td>
        <td><span class="admin-badge ${stockClass}">${stockLabel}</span></td>
        <td>
          <div class="admin-table-actions">
            <button class="admin-icon-btn edit-btn" data-id="${p.id}" title="Edit">✎</button>
            <button class="admin-icon-btn danger delete-btn" data-id="${p.id}" title="Delete">🗑</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openProductModal(btn.dataset.id));
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const product = await MaloStore.getProductById(btn.dataset.id);
      if (product && confirm(`Delete "${product.name}"? This cannot be undone.`)) {
        await MaloStore.deleteProduct(btn.dataset.id);
        MaloApp.showToast('Product deleted.', 'info');
        renderProductsTable();
      }
    });
  });
}

function bindProductEvents() {
  document.getElementById('productSearch').addEventListener('input', (e) => {
    productFilterState.search = e.target.value;
    renderProductsTable();
  });

  document.getElementById('categoryFilterSelect').addEventListener('change', (e) => {
    productFilterState.category = e.target.value;
    renderProductsTable();
  });

  document.getElementById('addProductBtn').addEventListener('click', () => openProductModal(null));
  document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
  document.getElementById('productModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'productModalOverlay') closeProductModal();
  });

  document.getElementById('prodCategory').addEventListener('change', populateSubcategorySelect);
  document.getElementById('addColorRow').addEventListener('click', () => addColorRow());
  document.getElementById('addImageRow').addEventListener('click', () => addImageRow());

  document.getElementById('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveProductFromForm();
  });
}

async function populateCategoryModalSelect() {
  const select = document.getElementById('prodCategory');
  const categories = await MaloStore.getCategories();
  select.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function populateSubcategorySelect() {
  const catId = document.getElementById('prodCategory').value;
  const category = await MaloStore.getCategoryById(catId);
  const select = document.getElementById('prodSubcategory');
  select.innerHTML = `<option value="">None</option>` +
    (category ? category.subcategories.map(s => `<option value="${s.id}">${s.name}</option>`).join('') : '');
}

function addColorRow(name = '', hex = '#C97B7B') {
  const container = document.getElementById('colorRows');
  const row = document.createElement('div');
  row.className = 'color-input-row';
  row.innerHTML = `
    <input type="color" class="color-hex-input" value="${hex}" />
    <input type="text" class="form-input color-name-input" placeholder="Color name" value="${name}" />
    <button type="button" class="remove-row-btn">✕</button>
  `;
  row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

function addImageRow(url = '') {
  const container = document.getElementById('imageRows');
  const row = document.createElement('div');
  row.className = 'image-input-row';
  row.innerHTML = `
    <input type="text" class="form-input image-url-input" placeholder="https://..." value="${url}" />
    <button type="button" class="remove-row-btn">✕</button>
  `;
  row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

async function openProductModal(id) {
  document.getElementById('productForm').reset();
  document.getElementById('colorRows').innerHTML = '';
  document.getElementById('imageRows').innerHTML = '';
  await populateSubcategorySelect();

  if (id) {
    const p = await MaloStore.getProductById(id);
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = p.id;
    document.getElementById('prodName').value = p.name;
    document.getElementById('prodStock').value = p.stock;
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodOriginalPrice').value = p.originalPrice;
    document.getElementById('prodCategory').value = p.category;
    await populateSubcategorySelect();
    document.getElementById('prodSubcategory').value = p.subcategory || '';
    document.getElementById('prodDescription').value = p.description;
    document.getElementById('prodSizes').value = p.sizes.join(', ');
    document.getElementById('prodFeatured').checked = !!p.featured;
    document.getElementById('prodOnSale').checked = !!p.onSale;
    p.colors.forEach(c => addColorRow(c.name, c.hex));
    p.images.forEach(img => addImageRow(img));
  } else {
    document.getElementById('productModalTitle').textContent = 'Add Product';
    document.getElementById('productId').value = '';
    addColorRow();
    addImageRow();
  }

  document.getElementById('productModalOverlay').classList.add('active');
}

function closeProductModal() {
  document.getElementById('productModalOverlay').classList.remove('active');
}

async function saveProductFromForm() {
  const id = document.getElementById('productId').value;
  const price = parseInt(document.getElementById('prodPrice').value);
  const originalPriceVal = document.getElementById('prodOriginalPrice').value;
  const originalPrice = originalPriceVal ? parseInt(originalPriceVal) : price;

  const sizes = document.getElementById('prodSizes').value.split(',').map(s => s.trim()).filter(Boolean);

  const colors = Array.from(document.querySelectorAll('.color-input-row')).map(row => ({
    name: row.querySelector('.color-name-input').value.trim(),
    hex: row.querySelector('.color-hex-input').value
  })).filter(c => c.name);

  const images = Array.from(document.querySelectorAll('.image-url-input'))
    .map(input => input.value.trim())
    .filter(Boolean);

  if (sizes.length === 0) {
    MaloApp.showToast('Please add at least one size.', 'error');
    return;
  }
  if (images.length === 0) {
    MaloApp.showToast('Please add at least one image URL.', 'error');
    return;
  }

  const existing = id ? await MaloStore.getProductById(id) : null;

  const product = {
    id: id || undefined,
    name: document.getElementById('prodName').value.trim(),
    price,
    originalPrice,
    category: document.getElementById('prodCategory').value,
    subcategory: document.getElementById('prodSubcategory').value,
    sizes,
    colors,
    stock: parseInt(document.getElementById('prodStock').value),
    images,
    description: document.getElementById('prodDescription').value.trim(),
    rating: existing ? existing.rating : 4.5,
    reviews: existing ? existing.reviews : 0,
    featured: document.getElementById('prodFeatured').checked,
    onSale: document.getElementById('prodOnSale').checked
  };

  try {
    await MaloStore.saveProduct(product);
    MaloApp.showToast(id ? 'Product updated! ✓' : 'Product added! ✓', 'success');
    closeProductModal();
    renderProductsTable();
  } catch (err) {
    MaloApp.showToast(err.message || 'Failed to save product.', 'error');
  }
}
