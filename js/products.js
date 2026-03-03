/**
 * TechBazaar - Products & Profile Module
 */

// ===== CATEGORIES =====
function renderCats() {
  const cats = ['all', 'smartwatch', 'earbuds', 'earphones', 'speaker', 'charger'];
  const icons = { all: '🔥', smartwatch: '⌚', earbuds: '🎧', earphones: '🎵', speaker: '🔊', charger: '🔋' };
  const html = cats.map(c =>
    `<span class="cat-btn${currentCat === c ? ' active' : ''}" onclick="currentCat='${c}';renderCats();renderAllProducts()">${icons[c]} ${c === 'all' ? 'All' : c[0].toUpperCase() + c.slice(1) + 's'}</span>`
  ).join('');
  const hc = document.getElementById('homeCats');
  const sc = document.getElementById('shopCats');
  if (hc) hc.innerHTML = html;
  if (sc) sc.innerHTML = html;
}

// ===== RENDER PRODUCTS =====
function renderAllProducts() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
  let prods = S.products;
  if (currentCat !== 'all') prods = prods.filter(p => p.cat === currentCat);
  if (q) prods = prods.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));

  const html = prods.length ? prods.map(p => {
    const disc = Math.round((1 - p.price / p.old) * 100);
    return `<div class="product-card" onclick="showProductModal(${p.id})">
      <div class="product-img">${p.emoji}</div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="rating">${'⭐'.repeat(Math.floor(p.rating))} ${p.rating}</div>
        <div><span class="price">₹${p.price.toLocaleString()}</span><span class="old-price">₹${p.old.toLocaleString()}</span></div>
        <button class="add-cart" onclick="event.stopPropagation();addCart(${p.id})">Add to Cart 🛒</button>
      </div></div>`;
  }).join('') : '<p style="text-align:center;color:var(--gray);grid-column:1/-1;padding:40px">No products found 😔</p>';

  const hg = document.getElementById('homeGrid');
  const sg = document.getElementById('shopGrid');
  if (hg && !document.getElementById('homePage').classList.contains('hidden')) hg.innerHTML = html;
  if (sg && !document.getElementById('shopPage').classList.contains('hidden')) sg.innerHTML = html;
}

// ===== PRODUCT MODAL =====
function showProductModal(id) {
  const p = S.products.find(x => x.id === id);
  if (!p) return;
  const disc = Math.round((1 - p.price / p.old) * 100);
  const m = document.createElement('div');
  m.className = 'modal-overlay';
  m.onclick = e => { if (e.target === m) m.remove(); };
  m.innerHTML = `<div class="modal">
    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
    <div style="text-align:center;font-size:5em;margin:15px 0">${p.emoji}</div>
    <h3>${p.name}</h3>
    <div style="margin:6px 0;color:var(--warning)">${'⭐'.repeat(Math.floor(p.rating))} ${p.rating}/5</div>
    <p style="color:var(--gray);margin:8px 0;font-size:.92em">${p.desc}</p>
    <div style="margin:14px 0">
      <span style="font-size:1.5em;font-weight:800;color:var(--primary)">₹${p.price.toLocaleString()}</span>
      <span class="old-price" style="font-size:1em">₹${p.old.toLocaleString()}</span>
      <span class="badge badge-success" style="margin-left:8px">${disc}% OFF</span>
    </div>
    <p style="font-size:.82em;color:var(--gray)">In Stock: ${p.stock} units</p>
    <button class="btn btn-primary btn-full" style="margin-top:14px" onclick="addCart(${p.id});this.closest('.modal-overlay').remove()">Add to Cart 🛒</button>
  </div>`;
  document.body.appendChild(m);
}

// ===== PROFILE =====
function renderProfile() {
  const u = S.currentUser;
  if (!u) return;
  const ords = S.orders.filter(o => o.user === u.id);
  document.getElementById('profileContent').innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">👤</div>
      <h2>${u.name}</h2>
      <p style="color:var(--gray)">${u.email}</p>
      <span class="badge badge-${u.role === 'admin' ? 'warning' : 'info'}">${u.role.toUpperCase()}</span>
    </div>
    <div class="profile-section">
      <h3>📝 Personal Info</h3>
      <div class="form-group"><label>Name</label><input id="pName" value="${u.name}"></div>
      <div class="form-group"><label>Email</label><input value="${u.email}" disabled></div>
      <div class="form-group"><label>Phone</label><input id="pPhone" value="${u.phone || ''}"></div>
      <div class="form-group"><label>Address</label><textarea id="pAddr" rows="2">${u.address || ''}</textarea></div>
      <button class="btn btn-primary" onclick="S.currentUser.name=document.getElementById('pName').value;S.currentUser.phone=document.getElementById('pPhone').value;S.currentUser.address=document.getElementById('pAddr').value;toast('Profile saved! ✅')">💾 Save</button>
    </div>
    <div class="profile-section">
      <h3>📦 Orders (${ords.length})</h3>
      ${ords.length ? ords.map(o => `
        <div style="display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid var(--light)">
          <div><strong>${o.id}</strong><br><span style="font-size:.78em;color:var(--gray)">${o.date}</span></div>
          <div><span class="badge badge-success">${o.status}</span></div>
        </div>`).join('') : '<p style="color:var(--gray)">No orders yet.</p>'}
    </div>`;
}
