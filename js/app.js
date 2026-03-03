/**
 * TechBazaar - Core App (Navigation, Utilities, Init)
 */
let monitorIv = null;
let currentCat = 'all';

// ===== UTILITIES =====
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.textContent = msg;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function randIP() {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
}

// ===== NAVIGATION =====
function showPage(p) {
  ['homePage', 'shopPage', 'cartPage', 'checkoutPage', 'profilePage', 'adminPage']
    .forEach(x => document.getElementById(x).classList.add('hidden'));
  document.getElementById(p + 'Page').classList.remove('hidden');
  document.getElementById('navLinks').classList.remove('show');

  if (monitorIv) { clearInterval(monitorIv); monitorIv = null; }

  if (p === 'home' || p === 'shop') { currentCat = 'all'; renderCats(); renderAllProducts(); }
  if (p === 'cart') renderCart();
  if (p === 'profile') renderProfile();
  if (p === 'admin') switchAdmin('overview', document.querySelector('[data-tab="overview"]'));
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
  renderCats();
  renderAllProducts();
});
