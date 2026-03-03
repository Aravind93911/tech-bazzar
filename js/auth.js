/**
 * TechBazaar - Authentication Module
 */
function switchTab(t) {
  document.querySelectorAll('.tabs button').forEach((b, i) =>
    b.classList.toggle('active', t === 'login' ? i === 0 : i === 1)
  );
  document.getElementById('loginForm').classList.toggle('hidden', t !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', t === 'login');
  document.getElementById('authAlert').style.display = 'none';
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  const al = document.getElementById('authAlert');

  // SQL Injection check
  const a1 = det.analyze(email);
  const a2 = det.analyze(pass);

  if (a1.sqli || a2.sqli) {
    const th = a1.sqli ? a1 : a2;
    const inp = a1.sqli ? email : pass;
    S.attackLogs.unshift({
      id: S.attackLogs.length + 1,
      time: new Date().toLocaleString(),
      ip: randIP(),
      input: inp,
      type: th.threats.join(', '),
      severity: th.risk,
      status: 'blocked',
      confidence: th.confidence
    });
    al.className = 'alert alert-danger';
    al.textContent = '⚠️ SQL Injection attempt detected and blocked! Incident logged.';
    al.style.display = 'block';
    return;
  }

  if (!email || !pass) {
    al.className = 'alert alert-danger';
    al.textContent = 'Fill in all fields.';
    al.style.display = 'block';
    return;
  }

  const u = S.users.find(x => x.email === email && x.password === pass);
  if (!u) {
    al.className = 'alert alert-danger';
    al.textContent = 'Invalid credentials.';
    al.style.display = 'block';
    return;
  }

  if (u.status === 'suspended') {
    al.className = 'alert alert-danger';
    al.textContent = 'Account suspended.';
    al.style.display = 'block';
    return;
  }

  // Log normal request
  S.attackLogs.push({
    id: S.attackLogs.length + 1,
    time: new Date().toLocaleString(),
    ip: '127.0.0.1',
    input: email,
    type: 'Normal',
    severity: 'none',
    status: 'allowed',
    confidence: a1.confidence
  });

  S.currentUser = u;
  document.getElementById('authPage').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  if (u.role === 'admin') document.getElementById('adminNavLink').classList.remove('hidden');
  showPage('home');
  toast('Welcome, ' + u.name + '! 🎉');
}

function doRegister() {
  const n = document.getElementById('regName').value.trim();
  const e = document.getElementById('regEmail').value.trim();
  const p = document.getElementById('regPass').value;
  const ph = document.getElementById('regPhone').value.trim();
  const al = document.getElementById('authAlert');

  if (!n || !e || !p) {
    al.className = 'alert alert-danger';
    al.textContent = 'Fill all required fields.';
    al.style.display = 'block';
    return;
  }

  if (S.users.find(u => u.email === e)) {
    al.className = 'alert alert-danger';
    al.textContent = 'Email already registered.';
    al.style.display = 'block';
    return;
  }

  S.users.push({
    id: S.nextId++, name: n, email: e, password: p,
    phone: ph, role: 'user', status: 'active',
    joined: new Date().toISOString().split('T')[0],
    address: '', orders: 0
  });

  al.className = 'alert alert-success';
  al.textContent = 'Account created! Please login.';
  al.style.display = 'block';
  switchTab('login');
  document.getElementById('loginEmail').value = e;
}

function doLogout() {
  S.currentUser = null;
  S.cart = [];
  if (monitorIv) clearInterval(monitorIv);
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('authPage').classList.remove('hidden');
  document.getElementById('adminNavLink').classList.add('hidden');
  ['loginEmail', 'loginPass'].forEach(x => document.getElementById(x).value = '');
  document.getElementById('authAlert').style.display = 'none';
}
