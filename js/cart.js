/**
 * TechBazaar - Cart & Checkout Module
 */

// ===== CART =====
function addCart(id) {
  const c = S.cart.find(x => x.id === id);
  if (c) c.qty++;
  else S.cart.push({ id, qty: 1 });
  updCartCount();
  toast('Added to cart! 🛒');
}

function updCartCount() {
  document.getElementById('cartCount').textContent = S.cart.reduce((s, c) => s + c.qty, 0);
}

function renderCart() {
  const ci = document.getElementById('cartItems');
  const cs = document.getElementById('cartSummary');

  if (!S.cart.length) {
    ci.innerHTML = `<div style="text-align:center;padding:50px">
      <p style="font-size:3em">🛒</p><h3>Cart is empty</h3>
      <button class="btn btn-primary" style="margin-top:12px" onclick="showPage('shop')">Shop Now</button>
    </div>`;
    cs.innerHTML = '';
    return;
  }

  ci.innerHTML = S.cart.map(c => {
    const p = S.products.find(x => x.id === c.id);
    return `<div class="cart-item">
      <div class="item-emoji">${p.emoji}</div>
      <div class="item-details">
        <h3>${p.name}</h3>
        <div class="price">₹${p.price.toLocaleString()}</div>
        <div class="qty-controls">
          <button onclick="chgQty(${c.id},-1)">−</button>
          <span>${c.qty}</span>
          <button onclick="chgQty(${c.id},1)">+</button>
        </div>
      </div>
      <span class="remove-item" onclick="rmCart(${c.id})">🗑️</span>
    </div>`;
  }).join('');

  const sub = S.cart.reduce((s, c) => {
    const p = S.products.find(x => x.id === c.id);
    return s + p.price * c.qty;
  }, 0);
  const ship = sub > 2000 ? 0 : 99;
  const tax = Math.round(sub * 0.18);
  const total = sub + ship + tax;

  cs.innerHTML = `<h3>Order Summary</h3>
    <div class="summary-row"><span>Subtotal</span><span>₹${sub.toLocaleString()}</span></div>
    <div class="summary-row"><span>Shipping</span><span>${ship ? '₹' + ship : 'FREE'}</span></div>
    <div class="summary-row"><span>Tax (18% GST)</span><span>₹${tax.toLocaleString()}</span></div>
    <div class="summary-row total"><span>Total</span><span>₹${total.toLocaleString()}</span></div>
    <button class="btn btn-primary btn-full" style="margin-top:14px" onclick="startCheckout()">Proceed to Checkout 📦</button>`;
}

function chgQty(id, d) {
  const c = S.cart.find(x => x.id === id);
  if (c) { c.qty += d; if (c.qty <= 0) S.cart = S.cart.filter(x => x.id !== id); }
  updCartCount();
  renderCart();
}

function rmCart(id) {
  S.cart = S.cart.filter(x => x.id !== id);
  updCartCount();
  renderCart();
  toast('Removed', 'danger');
}

// ===== CHECKOUT =====
function startCheckout() {
  if (!S.cart.length) return toast('Cart empty', 'danger');
  S.checkoutStep = 1;
  S.checkoutData = {};
  showPage('checkout');
  renderCheckout();
}

function renderCheckout() {
  const st = document.getElementById('checkoutSteps');
  st.innerHTML = [['1. Address'], ['2. Payment'], ['3. Confirm']].map(([l], i) =>
    `<span class="step${i < S.checkoutStep ? ' active' : ''}${i < S.checkoutStep - 1 ? ' done' : ''}">${l}</span>`
  ).join('');

  const c = document.getElementById('checkoutContent');

  if (S.checkoutStep === 1) {
    c.innerHTML = `<h3>📍 Shipping Address</h3>
      <div class="form-group"><label>Full Name</label><input id="coName" value="${S.currentUser?.name || ''}"></div>
      <div class="form-row">
        <div class="form-group"><label>Phone</label><input id="coPhone" value="${S.currentUser?.phone || ''}"></div>
        <div class="form-group"><label>Pincode</label><input id="coPin" placeholder="6-digit"></div>
      </div>
      <div class="form-group"><label>Address</label><input id="coAddr" placeholder="House/Street"></div>
      <div class="form-row">
        <div class="form-group"><label>City</label><input id="coCity"></div>
        <div class="form-group"><label>State</label><input id="coState"></div>
      </div>
      <button class="btn btn-primary btn-full" onclick="nextStep()">Continue to Payment →</button>`;
  } else if (S.checkoutStep === 2) {
    c.innerHTML = `<h3>💳 Payment Details</h3>
      <div class="form-group"><label>Card Number</label><input id="coCard" placeholder="1234 5678 9012 3456" maxlength="19" oninput="this.value=this.value.replace(/\\D/g,'').replace(/(\\d{4})/g,'$1 ').trim()"></div>
      <div class="form-row">
        <div class="form-group"><label>Expiry</label><input id="coExp" placeholder="MM/YY" maxlength="5"></div>
        <div class="form-group"><label>CVV</label><input id="coCvv" type="password" placeholder="123" maxlength="3"></div>
      </div>
      <div class="form-group"><label>Cardholder Name</label><input id="coCardName"></div>
      <div style="display:flex;gap:10px;margin-top:14px">
        <button class="btn btn-secondary" onclick="S.checkoutStep=1;renderCheckout()">← Back</button>
        <button class="btn btn-primary" style="flex:1" onclick="nextStep()">Review Order →</button>
      </div>`;
  } else {
    const sub = S.cart.reduce((s, x) => { const p = S.products.find(y => y.id === x.id); return s + p.price * x.qty; }, 0);
    const ship = sub > 2000 ? 0 : 99;
    const tax = Math.round(sub * 0.18);
    const total = sub + ship + tax;

    c.innerHTML = `<h3>📋 Review Order</h3>
      <div style="background:var(--bg);padding:14px;border-radius:10px;margin-bottom:14px">
        <h4>📍 Ship To</h4>
        <p style="margin-top:6px">${S.checkoutData.name}<br>${S.checkoutData.addr}<br>${S.checkoutData.city}, ${S.checkoutData.state} ${S.checkoutData.pin}<br>📞 ${S.checkoutData.phone}</p>
      </div>
      <div style="background:var(--bg);padding:14px;border-radius:10px;margin-bottom:14px">
        <h4>💳 Payment</h4>
        <p style="margin-top:6px">Card ****${(S.checkoutData.card || '').replace(/\s/g, '').slice(-4)}</p>
      </div>
      <div style="background:var(--bg);padding:14px;border-radius:10px;margin-bottom:14px">
        <h4>📦 Items (${S.cart.reduce((s, c) => s + c.qty, 0)})</h4>
        ${S.cart.map(x => { const p = S.products.find(y => y.id === x.id); return `<div style="display:flex;justify-content:space-between;margin:4px 0"><span>${p.emoji} ${p.name} × ${x.qty}</span><span>₹${(p.price * x.qty).toLocaleString()}</span></div>`; }).join('')}
        <div style="border-top:2px solid var(--light);margin-top:8px;padding-top:8px;font-weight:800;display:flex;justify-content:space-between"><span>Total</span><span>₹${total.toLocaleString()}</span></div>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-secondary" onclick="S.checkoutStep=2;renderCheckout()">← Back</button>
        <button class="btn btn-success" style="flex:1" onclick="placeOrder()">✅ Place Order</button>
      </div>`;
  }
}

function nextStep() {
  if (S.checkoutStep === 1) {
    const f = ['coName', 'coPhone', 'coAddr', 'coCity', 'coState'];
    if (f.some(x => !document.getElementById(x)?.value.trim())) return toast('Fill all fields', 'danger');
    S.checkoutData = {
      ...S.checkoutData,
      name: document.getElementById('coName').value,
      phone: document.getElementById('coPhone').value,
      pin: document.getElementById('coPin').value,
      addr: document.getElementById('coAddr').value,
      city: document.getElementById('coCity').value,
      state: document.getElementById('coState').value
    };
  } else if (S.checkoutStep === 2) {
    if (!document.getElementById('coCard')?.value || !document.getElementById('coExp')?.value || !document.getElementById('coCvv')?.value) {
      return toast('Fill payment details', 'danger');
    }
    S.checkoutData.card = document.getElementById('coCard').value;
    S.checkoutData.exp = document.getElementById('coExp').value;
  }
  S.checkoutStep++;
  renderCheckout();
}

function placeOrder() {
  const oid = 'TB' + Date.now().toString(36).toUpperCase();
  S.orders.push({
    id: oid, user: S.currentUser.id, items: [...S.cart],
    date: new Date().toLocaleString(), status: 'confirmed'
  });
  if (S.currentUser) S.currentUser.orders++;
  S.cart = [];
  updCartCount();
  document.getElementById('checkoutContent').innerHTML = `<div class="order-success">
    <div class="check">✅</div>
    <h2>Order Placed!</h2>
    <p style="color:var(--gray);margin:10px 0">Order ID: <strong>${oid}</strong></p>
    <button class="btn btn-primary" style="margin-top:16px" onclick="showPage('home')">Continue Shopping 🛍️</button>
  </div>`;
  toast('Order placed! 🎉');
}
