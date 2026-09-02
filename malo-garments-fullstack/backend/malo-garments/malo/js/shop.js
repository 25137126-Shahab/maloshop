/**
 * Malo Garments — Shop Page Logic
 * Handles product filtering, sorting, pagination, and dynamic rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  MaloApp.initPage();
  initShopPage();
});

async function initShopPage() {
  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  const state = {
    search: params.get('search') || '',
    category: params.get('category') || '',
    subcategory: params.get('subcategory') || '',
    sale: params.get('sale') === 'true',
    sort: params.get('sort') || 'default',
    sizes: [],
    colors: [],
    maxPrice: 10000,
    page: 1,
    perPage: 8
  };

  // Update page header if search
  if (state.search) {
    const headerEl = document.querySelector('.page-header h1');
    if (headerEl) headerEl.textContent = `Search: "${state.search}"`;
  }
  if (state.category) {
    const cat = await MaloStore.getCategoryById(state.category);
    if (cat) {
      const headerEl = document.querySelector('.page-header h1');
      if (headerEl) headerEl.textContent = cat.name;
    }
  }
  if (state.sale) {
    const headerEl = document.querySelector('.page-header h1');
    if (headerEl) headerEl.textContent = 'Sale Items';
  }

  await renderSidebar(state);
  await renderProducts(state);
  bindShopEvents(state);
}

async function renderSidebar(state) {
  const sidebar = document.getElementById('shopSidebar');
  if (!sidebar) return;

  const categories = await MaloStore.getCategories();
  const products = await MaloStore.getProducts();

  // Get unique sizes and colors from all products
  const allSizes = [...new Set(products.flatMap(p => p.sizes))];
  const allColors = [];
  const colorMap = {};
  products.forEach(p => {
    p.colors.forEach(c => {
      if (!colorMap[c.name]) {
        colorMap[c.name] = c.hex;
        allColors.push(c);
      }
    });
  });

  sidebar.innerHTML = `
    <div class="sidebar-close" style="display: none;">
      <h3>Filters</h3>
      <button id="closeSidebar">✕</button>
    </div>

    <!-- Categories -->
    <div class="filter-section">
      <h4 class="filter-title">Categories <span class="toggle-icon">▾</span></h4>
      <div class="filter-list" id="categoryFilters">
        ${categories.map(cat => `
          <label>
            <input type="radio" name="category" value="${cat.id}" ${state.category === cat.id ? 'checked' : ''} />
            ${cat.name}
            <span class="filter-count">(${products.filter(p => p.category === cat.id).length})</span>
          </label>
          ${cat.subcategories.map(sub => `
            <label style="padding-left: 24px;">
              <input type="radio" name="category" value="${cat.id}" data-sub="${sub.id}" ${state.subcategory === sub.id ? 'checked' : ''} />
              ${sub.name}
              <span class="filter-count">(${products.filter(p => p.subcategory === sub.id).length})</span>
            </label>
          `).join('')}
        `).join('')}
        <label>
          <input type="radio" name="category" value="" ${!state.category ? 'checked' : ''} />
          All Categories
        </label>
      </div>
    </div>

    <!-- Price Range -->
    <div class="filter-section">
      <h4 class="filter-title">Price Range <span class="toggle-icon">▾</span></h4>
      <div class="price-range-display">
        <span>Rs. 0</span>
        <span id="priceDisplay">Rs. ${state.maxPrice.toLocaleString()}</span>
      </div>
      <input type="range" class="price-range-slider" id="priceRange" min="500" max="10000" step="500" value="${state.maxPrice}" />
    </div>

    <!-- Sizes -->
    <div class="filter-section">
      <h4 class="filter-title">Sizes <span class="toggle-icon">▾</span></h4>
      <div class="size-buttons" id="sizeFilters">
        ${allSizes.slice(0, 8).map(size => `
          <button class="size-btn ${state.sizes.includes(size) ? 'active' : ''}" data-size="${size}">${size}</button>
        `).join('')}
      </div>
    </div>

    <!-- Colors -->
    <div class="filter-section">
      <h4 class="filter-title">Colors <span class="toggle-icon">▾</span></h4>
      <div class="color-swatches" id="colorFilters">
        ${allColors.map(c => `
          <button class="color-swatch ${state.colors.includes(c.name) ? 'active' : ''}" 
                  data-color="${c.name}" 
                  style="background-color: ${c.hex};" 
                  title="${c.name}">
          </button>
        `).join('')}
      </div>
    </div>

    <!-- On Sale -->
    <div class="filter-section">
      <div class="filter-list">
        <label>
          <input type="checkbox" id="saleFilter" ${state.sale ? 'checked' : ''} />
          On Sale Only
        </label>
      </div>
    </div>

    <!-- Clear Filters -->
    <button class="clear-filters-btn" id="clearFilters">✕ Clear All Filters</button>
  `;

  // Show close btn on mobile
  if (window.innerWidth <= 768) {
    sidebar.querySelector('.sidebar-close').style.display = 'flex';
  }
}

async function renderProducts(state) {
  const container = document.getElementById('productGrid');
  const countEl = document.getElementById('resultCount');
  if (!container) return;

  // Get filtered products
  let products;
  if (state.search) {
    products = await MaloStore.searchProducts(state.search);
  } else {
    products = await MaloStore.filterProducts({
      category: state.category,
      subcategory: state.subcategory,
      onSale: state.sale,
      maxPrice: state.maxPrice,
      sizes: state.sizes.length > 0 ? state.sizes : undefined,
      colors: state.colors.length > 0 ? state.colors : undefined,
      sort: state.sort
    });
  }

  // Apply sort to search results too
  if (state.search && state.sort !== 'default') {
    switch (state.sort) {
      case 'price-asc': products.sort((a, b) => a.price - b.price); break;
      case 'price-desc': products.sort((a, b) => b.price - a.price); break;
      case 'newest': products.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)); break;
      case 'name-asc': products.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
  }

  const total = products.length;
  const displayed = products.slice(0, state.page * state.perPage);

  if (countEl) {
    countEl.innerHTML = `Showing <strong>${displayed.length}</strong> of <strong>${total}</strong> products`;
  }

  if (displayed.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search terms.</p>
        <button class="btn btn-outline" onclick="document.getElementById('clearFilters').click()">Clear Filters</button>
      </div>
    `;
  } else {
    container.innerHTML = displayed.map(p => MaloApp.createProductCard(p)).join('');
  }

  // Load more button
  const loadMore = document.getElementById('loadMoreSection');
  if (loadMore) {
    if (displayed.length < total) {
      loadMore.innerHTML = `<button class="btn btn-outline" id="loadMoreBtn">Load More (${total - displayed.length} remaining)</button>`;
      document.getElementById('loadMoreBtn').addEventListener('click', () => {
        state.page++;
        renderProducts(state);
      });
    } else {
      loadMore.innerHTML = '';
    }
  }
}

function bindShopEvents(state) {
  // Sort change
  const sortSelect = document.getElementById('shopSort');
  if (sortSelect) {
    sortSelect.value = state.sort;
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      state.page = 1;
      renderProducts(state);
    });
  }

  // Category filter
  document.querySelectorAll('#categoryFilters input[type="radio"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.category = e.target.value;
      state.subcategory = e.target.dataset.sub || '';
      state.page = 1;
      renderProducts(state);
    });
  });

  // Price range
  const priceRange = document.getElementById('priceRange');
  const priceDisplay = document.getElementById('priceDisplay');
  if (priceRange) {
    priceRange.addEventListener('input', (e) => {
      state.maxPrice = parseInt(e.target.value);
      priceDisplay.textContent = `Rs. ${state.maxPrice.toLocaleString()}`;
    });
    priceRange.addEventListener('change', () => {
      state.page = 1;
      renderProducts(state);
    });
  }

  // Size buttons
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const size = btn.dataset.size;
      btn.classList.toggle('active');
      if (state.sizes.includes(size)) {
        state.sizes = state.sizes.filter(s => s !== size);
      } else {
        state.sizes.push(size);
      }
      state.page = 1;
      renderProducts(state);
    });
  });

  // Color swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      const color = swatch.dataset.color;
      swatch.classList.toggle('active');
      if (state.colors.includes(color)) {
        state.colors = state.colors.filter(c => c !== color);
      } else {
        state.colors.push(color);
      }
      state.page = 1;
      renderProducts(state);
    });
  });

  // Sale filter
  const saleFilter = document.getElementById('saleFilter');
  if (saleFilter) {
    saleFilter.addEventListener('change', (e) => {
      state.sale = e.target.checked;
      state.page = 1;
      renderProducts(state);
    });
  }

  // Clear filters
  const clearBtn = document.getElementById('clearFilters');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      state.category = '';
      state.subcategory = '';
      state.sale = false;
      state.sort = 'default';
      state.sizes = [];
      state.colors = [];
      state.maxPrice = 10000;
      state.search = '';
      state.page = 1;
      await renderSidebar(state);
      await renderProducts(state);
      bindShopEvents(state);
      if (sortSelect) sortSelect.value = 'default';
    });
  }

  // Mobile filter
  const mobileFilterBtn = document.getElementById('mobileFilterBtn');
  const sidebar = document.getElementById('shopSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const closeBtn = document.getElementById('closeSidebar');

  if (mobileFilterBtn && sidebar) {
    mobileFilterBtn.addEventListener('click', () => {
      sidebar.classList.add('active');
      if (overlay) overlay.classList.add('active');
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  }
}
