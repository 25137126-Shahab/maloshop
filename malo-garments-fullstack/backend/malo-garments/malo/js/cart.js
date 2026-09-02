/**
 * Malo Garments — Cart Page Logic
 * Renders cart items, handles quantity updates, removal, and summary totals.
 */

document.addEventListener('DOMContentLoaded', () => {
  MaloApp.initPage();
  renderCartPage();
});

async function renderCartPage() {
  const container = document.getElementById('cartContent');
  const cart = MaloStore.getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛍️</div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <a href="./shop.html" class="btn btn-primary">Start Shopping</a>
      </div>
    `;
    return;
  }

  const cartWithProducts = (await Promise.all(
    cart.map(async item => ({ ...item, product: await MaloStore.getProductById(item.productId) }))
  )).filter(item => item.product);

  const subtotal = cartWithProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 5000 || subtotal === 0 ? 0 : 300;
  const total = subtotal + shipping;

  container.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items" id="cartItemsList">
        ${cartWithProducts.map(item => `
          <div class="cart-item" data-cart-id="${item.id}">
            <div class="cart-item-image">
              <img src="${item.product.images[0]}" alt="${item.product.name}" />
            </div>
            <div class="cart-item-info">
              <h4><a href="./product.html?id=${item.product.id}">${item.product.name}</a></h4>
              <div class="cart-item-meta">Size: ${item.size} ${item.color ? `· Color: ${item.color}` : ''}</div>
              <div class="cart-item-price">${MaloApp.formatPrice(item.product.price)}</div>
            </div>
            <div class="cart-item-qty">
              <button class="qty-dec" aria-label="Decrease quantity">−</button>
              <span>${item.quantity}</span>
              <button class="qty-inc" aria-label="Increase quantity">+</button>
            </div>
            <div class="cart-item-remove">
              <button class="remove-btn" aria-label="Remove item">✕</button>
              <div class="cart-item-subtotal">${MaloApp.formatPrice(item.product.price * item.quantity)}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="order-summary">
        <h3>Order Summary</h3>
        <div class="summary-row">
          <span>Subtotal</span>
          <span id="summarySubtotal">${MaloApp.formatPrice(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span id="summaryShipping">${shipping === 0 ? 'Free' : MaloApp.formatPrice(shipping)}</span>
        </div>
        <div class="summary-note">Free shipping on orders above Rs. 5,000</div>
        <div class="summary-row total">
          <span>Total</span>
          <span id="summaryTotal">${MaloApp.formatPrice(total)}</span>
        </div>
        <a href="./checkout.html" class="btn btn-primary btn-lg btn-block" style="margin-top: var(--sp-xl);">Proceed to Checkout</a>
        <a href="./shop.html" class="btn btn-ghost btn-block" style="margin-top: var(--sp-md);">Continue Shopping</a>
      </div>
    </div>
  `;

  bindCartEvents();
}

function bindCartEvents() {
  document.querySelectorAll('.cart-item').forEach(row => {
    const cartId = row.dataset.cartId;
    const item = MaloStore.getCart().find(i => i.id === cartId);
    if (!item) return;

    row.querySelector('.qty-inc').addEventListener('click', () => {
      MaloStore.updateCartItem(cartId, item.quantity + 1);
      MaloApp.updateCartBadge();
      renderCartPage();
    });

    row.querySelector('.qty-dec').addEventListener('click', () => {
      if (item.quantity <= 1) return;
      MaloStore.updateCartItem(cartId, item.quantity - 1);
      MaloApp.updateCartBadge();
      renderCartPage();
    });

    row.querySelector('.remove-btn').addEventListener('click', () => {
      MaloStore.removeFromCart(cartId);
      MaloApp.updateCartBadge();
      MaloApp.showToast('Item removed from cart', 'info');
      renderCartPage();
    });
  });
}
