/**
 * Malo Garments — Checkout Page Logic
 * Customer details form, payment method selection, order summary, form validation, place order.
 */

document.addEventListener('DOMContentLoaded', () => {
  MaloApp.initPage();
  renderCheckoutPage();
});

async function renderCheckoutPage() {
  const container = document.getElementById('checkoutContent');
  const cart = MaloStore.getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some items to your cart before checking out.</p>
        <a href="./shop.html" class="btn btn-primary">Start Shopping</a>
      </div>
    `;
    return;
  }

  const user = MaloStore.getCurrentUser();
  const cartWithProducts = (await Promise.all(
    cart.map(async item => ({ ...item, product: await MaloStore.getProductById(item.productId) }))
  )).filter(item => item.product);

  const subtotal = cartWithProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 5000 ? 0 : 300;
  const total = subtotal + shipping;

  container.innerHTML = `
    <div class="checkout-layout">
      <div class="checkout-form-card">
        <form id="checkoutForm" novalidate>
          <div class="checkout-section">
            <div class="checkout-section-title"><span class="step-num">1</span> Contact & Shipping Details</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input type="text" class="form-input" id="custName" value="${user?.name || ''}" required />
                <div class="form-error" id="err-custName"></div>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address *</label>
                <input type="email" class="form-input" id="custEmail" value="${user?.email || ''}" required />
                <div class="form-error" id="err-custEmail"></div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Phone Number *</label>
                <input type="tel" class="form-input" id="custPhone" value="${user?.phone || ''}" placeholder="03XX-XXXXXXX" required />
                <div class="form-error" id="err-custPhone"></div>
              </div>
              <div class="form-group">
                <label class="form-label">City *</label>
                <input type="text" class="form-input" id="custCity" required />
                <div class="form-error" id="err-custCity"></div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Street Address *</label>
              <input type="text" class="form-input" id="custAddress" required />
              <div class="form-error" id="err-custAddress"></div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">State / Province</label>
                <input type="text" class="form-input" id="custState" />
              </div>
              <div class="form-group">
                <label class="form-label">Postal Code</label>
                <input type="text" class="form-input" id="custZip" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Order Notes (optional)</label>
              <textarea class="form-textarea" id="custNotes" placeholder="Delivery instructions, gift note, etc."></textarea>
            </div>
          </div>

          <div class="checkout-section">
            <div class="checkout-section-title"><span class="step-num">2</span> Payment Method</div>
            <div class="payment-options">
              <label class="payment-option active">
                <input type="radio" name="payment" value="cod" checked />
                <div>
                  <strong>Cash on Delivery</strong>
                  <div style="font-size: var(--fs-xs); color: var(--text-light);">Pay with cash when your order arrives</div>
                </div>
              </label>
              <label class="payment-option">
                <input type="radio" name="payment" value="card" />
                <div>
                  <strong>Credit / Debit Card</strong>
                  <div style="font-size: var(--fs-xs); color: var(--text-light);">Demo payment — no real transaction processed</div>
                </div>
              </label>
            </div>
            <div id="cardFields" style="display:none; margin-top: var(--sp-lg);">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Card Number</label>
                  <input type="text" class="form-input" id="cardNumber" placeholder="4242 4242 4242 4242" maxlength="19" />
                </div>
                <div class="form-group">
                  <label class="form-label">Name on Card</label>
                  <input type="text" class="form-input" id="cardName" placeholder="Jane Doe" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Expiry (MM/YY)</label>
                  <input type="text" class="form-input" id="cardExpiry" placeholder="12/28" maxlength="5" />
                </div>
                <div class="form-group">
                  <label class="form-label">CVV</label>
                  <input type="text" class="form-input" id="cardCvv" placeholder="123" maxlength="4" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg btn-block" id="placeOrderBtn">Place Order — ${MaloApp.formatPrice(total)}</button>
        </form>
      </div>

      <div class="order-summary">
        <h3>Order Summary</h3>
        <div class="checkout-summary-items">
          ${cartWithProducts.map(item => `
            <div class="checkout-summary-item">
              <img src="${item.product.images[0]}" alt="${item.product.name}" />
              <div class="checkout-summary-item-info">
                <div class="name">${item.product.name}</div>
                <div class="meta">Size: ${item.size} · Qty: ${item.quantity}</div>
              </div>
              <div>${MaloApp.formatPrice(item.product.price * item.quantity)}</div>
            </div>
          `).join('')}
        </div>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${MaloApp.formatPrice(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span>${shipping === 0 ? 'Free' : MaloApp.formatPrice(shipping)}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>${MaloApp.formatPrice(total)}</span>
        </div>
      </div>
    </div>
  `;

  bindCheckoutEvents();
}

function bindCheckoutEvents() {
  // Payment method toggle
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      opt.querySelector('input').checked = true;
      document.getElementById('cardFields').style.display =
        opt.querySelector('input').value === 'card' ? 'block' : 'none';
    });
  });

  const form = document.getElementById('checkoutForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateCheckoutForm()) return;

    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    const orderData = {
      name: document.getElementById('custName').value.trim(),
      email: document.getElementById('custEmail').value.trim(),
      phone: document.getElementById('custPhone').value.trim(),
      address: document.getElementById('custAddress').value.trim(),
      city: document.getElementById('custCity').value.trim(),
      state: document.getElementById('custState').value.trim(),
      zip: document.getElementById('custZip').value.trim(),
      notes: document.getElementById('custNotes').value.trim(),
      paymentMethod
    };

    const placeOrderBtn = document.getElementById('placeOrderBtn');
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Placing order...';

    try {
      const order = await MaloStore.placeOrder(orderData);
      MaloApp.updateCartBadge();
      window.location.href = `./order-confirmation.html?id=${order.id}`;
    } catch (err) {
      MaloApp.showToast(err.message || 'Could not place your order. Please try again.', 'error');
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = 'Place Order';
    }
  });
}

function validateCheckoutForm() {
  let valid = true;
  const clearError = (id) => {
    const el = document.getElementById(`err-${id}`);
    if (el) el.textContent = '';
    document.getElementById(id).classList.remove('error');
  };
  const setError = (id, msg) => {
    const el = document.getElementById(`err-${id}`);
    if (el) el.textContent = msg;
    document.getElementById(id).classList.add('error');
    valid = false;
  };

  ['custName', 'custEmail', 'custPhone', 'custCity', 'custAddress'].forEach(clearError);

  const name = document.getElementById('custName').value.trim();
  if (name.length < 2) setError('custName', 'Please enter your full name.');

  const email = document.getElementById('custEmail').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) setError('custEmail', 'Please enter a valid email address.');

  const phone = document.getElementById('custPhone').value.trim();
  if (phone.replace(/\D/g, '').length < 10) setError('custPhone', 'Please enter a valid phone number.');

  const city = document.getElementById('custCity').value.trim();
  if (city.length < 2) setError('custCity', 'Please enter your city.');

  const address = document.getElementById('custAddress').value.trim();
  if (address.length < 5) setError('custAddress', 'Please enter your full street address.');

  if (!valid) {
    MaloApp.showToast('Please fix the highlighted fields.', 'error');
  }

  return valid;
}
