/**
 * Malo Garments — Product Detail Page Logic
 * Gallery, size/color selection, quantity, add to cart, buy now, tabs, related products.
 */

let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let selectedQty = 1;

document.addEventListener('DOMContentLoaded', () => {
  MaloApp.initPage();
  initProductPage();
});

async function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const product = await MaloStore.getProductById(id);

  if (!product) {
    document.getElementById('productDetailGrid').innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">😕</div>
        <h3>Product not found</h3>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <a href="./shop.html" class="btn btn-outline">Back to Shop</a>
      </div>
    `;
    return;
  }

  currentProduct = product;
  selectedSize = product.sizes[0];
  selectedColor = product.colors[0]?.name || '';
  selectedQty = 1;

  document.title = `${product.name} — Malo Garments`;
  document.getElementById('breadcrumbCurrent').textContent = product.name;

  await renderProductDetail(product);
  renderProductTabs(product);
  await renderRelatedProducts(product);
  MaloApp.initScrollAnimations();
}

async function renderProductDetail(p) {
  const discount = p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  const category = await MaloStore.getCategoryById(p.category);
  const stockStatus = p.stock === 0 ? 'out-of-stock' : (p.stock < 10 ? 'low-stock' : 'in-stock');
  const stockLabel = p.stock === 0 ? 'Out of Stock' : (p.stock < 10 ? `Only ${p.stock} left in stock` : 'In Stock');

  const grid = document.getElementById('productDetailGrid');
  grid.innerHTML = `
    <div class="product-gallery">
      <div class="product-main-image">
        <img src="${p.images[0]}" alt="${p.name}" id="mainImage" />
      </div>
      <div class="product-thumbnails" id="thumbnails">
        ${p.images.map((img, i) => `
          <div class="product-thumb ${i === 0 ? 'active' : ''}" data-img="${img}">
            <img src="${img}" alt="${p.name} ${i + 1}" />
          </div>
        `).join('')}
      </div>
    </div>

    <div class="product-info">
      ${category ? `<a href="./shop.html?category=${category.id}" class="product-category-link">${category.name}</a>` : ''}
      <h1 class="product-title">${p.name}</h1>
      <div class="product-rating">
        <span class="stars">${MaloApp.renderStars(p.rating)}</span>
        <span class="rating-text">${p.rating} (${p.reviews} reviews)</span>
      </div>

      <div class="product-price-block">
        <span class="product-current-price">${MaloApp.formatPrice(p.price)}</span>
        ${p.originalPrice > p.price ? `<span class="product-original-price">${MaloApp.formatPrice(p.originalPrice)}</span>` : ''}
        ${discount > 0 ? `<span class="product-discount">-${discount}% OFF</span>` : ''}
      </div>

      <p class="product-description">${p.description}</p>

      <div class="product-option">
        <div class="option-label">
          <span>Size: <strong id="selectedSizeLabel">${selectedSize}</strong></span>
          <a href="#sizeChartTab" id="sizeChartLink">Size Chart</a>
        </div>
        <div class="size-options" id="sizeOptions">
          ${p.sizes.map(size => `
            <button class="size-option ${size === selectedSize ? 'active' : ''}" data-size="${size}">${size}</button>
          `).join('')}
        </div>
      </div>

      ${p.colors.length > 0 ? `
      <div class="product-option">
        <div class="option-label"><span>Color: <strong id="selectedColorLabel">${selectedColor}</strong></span></div>
        <div class="color-options" id="colorOptions">
          ${p.colors.map(c => `
            <div class="color-option ${c.name === selectedColor ? 'active' : ''}" data-color="${c.name}">
              <span class="color-option-swatch" style="background-color: ${c.hex};"></span>
              <span class="color-option-name">${c.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <div class="product-option">
        <div class="option-label"><span>Quantity</span></div>
        <div class="quantity-selector">
          <button class="qty-btn" id="qtyMinus">−</button>
          <input type="number" class="qty-input" id="qtyInput" value="1" min="1" max="${p.stock || 1}" />
          <button class="qty-btn" id="qtyPlus">+</button>
        </div>
      </div>

      <div class="product-actions">
        <button class="btn btn-outline btn-lg" id="addToCartBtn" ${p.stock === 0 ? 'disabled' : ''}>Add to Cart</button>
        <button class="btn btn-primary btn-lg" id="buyNowBtn" ${p.stock === 0 ? 'disabled' : ''}>Buy Now</button>
      </div>

      <div class="stock-info">
        <span class="stock-dot ${stockStatus}"></span>
        <span>${stockLabel}</span>
      </div>
    </div>
  `;

  bindProductInteractions(p);
}

function bindProductInteractions(p) {
  // Thumbnails
  document.querySelectorAll('.product-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.product-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      document.getElementById('mainImage').src = thumb.dataset.img;
    });
  });

  // Size selection
  document.querySelectorAll('.size-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size;
      document.getElementById('selectedSizeLabel').textContent = selectedSize;
    });
  });

  // Color selection
  document.querySelectorAll('.color-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      selectedColor = opt.dataset.color;
      const label = document.getElementById('selectedColorLabel');
      if (label) label.textContent = selectedColor;
    });
  });

  // Quantity
  const qtyInput = document.getElementById('qtyInput');
  document.getElementById('qtyMinus').addEventListener('click', () => {
    selectedQty = Math.max(1, selectedQty - 1);
    qtyInput.value = selectedQty;
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    selectedQty = Math.min(p.stock || 99, selectedQty + 1);
    qtyInput.value = selectedQty;
  });
  qtyInput.addEventListener('change', () => {
    selectedQty = Math.max(1, Math.min(p.stock || 99, parseInt(qtyInput.value) || 1));
    qtyInput.value = selectedQty;
  });

  // Add to cart
  document.getElementById('addToCartBtn').addEventListener('click', () => {
    MaloStore.addToCart(p.id, selectedSize, selectedColor, selectedQty);
    MaloApp.updateCartBadge();
    MaloApp.showToast(`${p.name} added to cart! 🛍️`, 'success');
  });
  // (Cart stays in the browser until checkout, so this doesn't need the network.)

  // Buy now
  document.getElementById('buyNowBtn').addEventListener('click', () => {
    MaloStore.addToCart(p.id, selectedSize, selectedColor, selectedQty);
    window.location.href = './checkout.html';
  });

  // Size chart link scrolls to tab
  const sizeChartLink = document.getElementById('sizeChartLink');
  if (sizeChartLink) {
    sizeChartLink.addEventListener('click', (e) => {
      e.preventDefault();
      const tabBtn = document.querySelector('.tab-btn[data-tab="sizeChart"]');
      if (tabBtn) {
        tabBtn.click();
        document.getElementById('productTabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

function renderProductTabs(p) {
  const isUndergarment = p.category === 'cat-2';
  const sizeChartRows = isUndergarment
    ? [['32B', '32', '72'], ['32C', '32', '74'], ['34B', '34', '76'], ['34C', '34', '78'], ['36B', '36', '80'], ['36C', '36', '82'], ['38B', '38', '84'], ['38C', '38', '86']]
    : [['XS', '32', '24', '34'], ['S', '34', '26', '36'], ['M', '36', '28', '38'], ['L', '38', '30', '40'], ['XL', '40', '32', '42'], ['XXL', '42', '34', '44']];

  const container = document.getElementById('productTabs');
  container.innerHTML = `
    <div class="tabs-header">
      <button class="tab-btn active" data-tab="description">Description</button>
      <button class="tab-btn" data-tab="sizeChart">Size Chart</button>
      <button class="tab-btn" data-tab="shipping">Shipping & Returns</button>
      <button class="tab-btn" data-tab="reviews">Reviews (${p.reviews})</button>
    </div>

    <div class="tab-content active" id="tab-description">
      <p>${p.description}</p>
      <p style="margin-top: var(--sp-md);">Crafted with premium fabrics and attention to detail, this piece is designed to offer both comfort and elegance for everyday wear or special occasions.</p>
    </div>

    <div class="tab-content" id="tab-sizeChart">
      <table class="size-chart-table">
        <thead>
          <tr>
            <th>Size</th>
            ${isUndergarment ? '<th>Band (in)</th><th>Bust (cm)</th>' : '<th>Bust (in)</th><th>Waist (in)</th><th>Hip (in)</th>'}
          </tr>
        </thead>
        <tbody>
          ${sizeChartRows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <p style="margin-top: var(--sp-md); font-size: var(--fs-xs); color: var(--text-muted);">Measurements are approximate. For the best fit, we recommend measuring yourself and comparing to the chart above.</p>
    </div>

    <div class="tab-content" id="tab-shipping">
      <p><strong>Shipping:</strong> Free shipping on orders above Rs. 5,000. Standard delivery takes 3–5 business days across Pakistan.</p>
      <p style="margin-top: var(--sp-md);"><strong>Returns:</strong> We offer a 30-day hassle-free return policy. Items must be unworn, unwashed, and with original tags attached.</p>
    </div>

    <div class="tab-content" id="tab-reviews">
      <p>⭐ ${p.rating} out of 5 based on ${p.reviews} reviews.</p>
      <p style="margin-top: var(--sp-md); color: var(--text-light);">Customer reviews help other shoppers make informed decisions. Have you purchased this item? Log in to your account to leave a review.</p>
    </div>
  `;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });
}

async function renderRelatedProducts(p) {
  const container = document.getElementById('relatedGrid');
  const allProducts = await MaloStore.getProducts();
  const related = allProducts
    .filter(x => x.id !== p.id && (x.category === p.category || x.subcategory === p.subcategory))
    .slice(0, 4);

  const fallback = related.length < 4
    ? allProducts.filter(x => x.id !== p.id && !related.includes(x)).slice(0, 4 - related.length)
    : [];

  container.innerHTML = [...related, ...fallback].map(prod => MaloApp.createProductCard(prod)).join('');
}
