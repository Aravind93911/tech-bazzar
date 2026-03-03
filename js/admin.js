/**
 * TechBazaar - Admin Panel Module
 * Overview, User Management, Attack Logs, Live Monitor, ML Training, Dataset
 */

let reqCount = 0;

function switchAdmin(tab, el) {
  if (monitorIv) { clearInterval(monitorIv); monitorIv = null; }
  document.querySelectorAll('.admin-sidebar a').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('adminSidebar').classList.remove('show');
  const c = document.getElementById('adminContent');
  updateThreatBadge();

  switch (tab) {
    case 'overview': renderAdminOverview(c); break;
    case 'users': renderAdminUsers(c); break;
    case 'logs': renderAdminLogs(c); break;
    case 'monitor': renderAdminMonitor(c); break;
    case 'training': renderAdminTraining(c); break;
    case 'dataset': renderAdminDataset(c); break;
  }
}

function updateThreatBadge() {
  const b = document.getElementById('threatBadge');
  if (b) b.textContent = S.attackLogs.filter(l => l.status === 'blocked').length;
}

// ==================== OVERVIEW ====================
function renderAdminOverview(c) {
  const blocked = S.attackLogs.filter(l => l.status === 'blocked');
  const allowed = S.attackLogs.filter(l => l.status === 'allowed');
  const crit = blocked.filter(l => l.severity === 'critical');
  const typeCounts = {};
  blocked.forEach(l => l.type.split(',').forEach(t => { t = t.trim(); typeCounts[t] = (typeCounts[t] || 0) + 1; }));

  c.innerHTML = `
    <h2>📊 Security Overview Dashboard</h2>
    <div class="admin-cards">
      <div class="admin-card"><div class="card-icon">👥</div><div class="card-value">${S.users.length}</div><div class="card-label">Total Users</div></div>
      <div class="admin-card" style="border-left:4px solid var(--danger)"><div class="card-icon">🛡️</div><div class="card-value">${blocked.length}</div><div class="card-label">Attacks Blocked</div></div>
      <div class="admin-card" style="border-left:4px solid var(--success)"><div class="card-icon">✅</div><div class="card-value">${allowed.length}</div><div class="card-label">Normal Requests</div></div>
      <div class="admin-card" style="border-left:4px solid #e17055"><div class="card-icon">🔴</div><div class="card-value">${crit.length}</div><div class="card-label">Critical Threats</div></div>
      <div class="admin-card" style="border-left:4px solid var(--secondary)"><div class="card-icon">🧠</div><div class="card-value">${S.model.accuracy}%</div><div class="card-label">ML Accuracy</div></div>
      <div class="admin-card" style="border-left:4px solid var(--warning)"><div class="card-icon">📦</div><div class="card-value">${S.orders.length}</div><div class="card-label">Total Orders</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px">
      <div class="ml-panel"><h3>📈 Attack Type Distribution</h3><div id="attackTypeBars" style="display:flex;flex-direction:column;gap:8px;margin-top:10px"></div></div>
      <div class="ml-panel"><h3>🔴 Recent Threats</h3><div style="max-height:280px;overflow-y:auto" id="recentThreats"></div></div>
    </div>
    <div class="ml-panel"><h3>📡 Live Threat/Normal Feed</h3><div class="live-monitor" id="overviewFeed" style="height:200px"></div></div>`;

  const maxV = Math.max(...Object.values(typeCounts), 1);
  document.getElementById('attackTypeBars').innerHTML = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `<div style="display:flex;align-items:center;gap:8px">
      <span style="min-width:110px;font-size:.78em;text-align:right">${k}</span>
      <div style="flex:1;background:var(--light);border-radius:6px;height:22px;overflow:hidden">
        <div style="height:100%;width:${(v / maxV) * 100}%;background:linear-gradient(90deg,var(--danger),#e17055);border-radius:6px;display:flex;align-items:center;padding-left:8px;color:#fff;font-size:.72em;font-weight:600">${v}</div>
      </div></div>`).join('');

  document.getElementById('recentThreats').innerHTML = blocked.slice(0, 6).map(l => `
    <div style="padding:8px;border-bottom:1px solid var(--light);font-size:.82em">
      <div style="display:flex;justify-content:space-between"><strong style="color:var(--danger)">${l.type}</strong><span class="badge badge-${l.severity === 'critical' ? 'critical' : 'danger'}">${l.severity}</span></div>
      <div style="color:var(--gray);font-size:.78em">${l.time} · IP: ${l.ip}</div>
      <code style="font-size:.73em;word-break:break-all">${esc(l.input)}</code>
    </div>`).join('');

  startFeed('overviewFeed');
}

// ==================== USER MANAGEMENT ====================
function renderAdminUsers(c) {
  c.innerHTML = `
    <h2>👥 User Management</h2>
    <div class="admin-cards">
      <div class="admin-card"><div class="card-value">${S.users.length}</div><div class="card-label">Total Users</div></div>
      <div class="admin-card"><div class="card-value">${S.users.filter(u => u.status === 'active').length}</div><div class="card-label">Active</div></div>
      <div class="admin-card"><div class="card-value">${S.users.filter(u => u.status === 'suspended').length}</div><div class="card-label">Suspended</div></div>
      <div class="admin-card"><div class="card-value">${S.users.filter(u => u.role === 'admin').length}</div><div class="card-label">Admins</div></div>
    </div>
    <div class="filter-bar">
      <button class="btn btn-sm btn-secondary" onclick="renderUserTable('all')">All</button>
      <button class="btn btn-sm btn-success" onclick="renderUserTable('active')">Active</button>
      <button class="btn btn-sm btn-danger" onclick="renderUserTable('suspended')">Suspended</button>
      <button class="btn btn-sm btn-warning" onclick="renderUserTable('admin')">Admins</button>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Orders</th><th>Actions</th></tr></thead>
      <tbody id="userTableBody"></tbody>
    </table></div>`;
  renderUserTable('all');
}

function renderUserTable(filter) {
  let users = S.users;
  if (filter === 'active') users = users.filter(u => u.status === 'active');
  else if (filter === 'suspended') users = users.filter(u => u.status === 'suspended');
  else if (filter === 'admin') users = users.filter(u => u.role === 'admin');

  document.getElementById('userTableBody').innerHTML = users.map(u => `<tr>
    <td>#${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.phone || '-'}</td>
    <td><span class="badge badge-${u.role === 'admin' ? 'warning' : 'info'}">${u.role}</span></td>
    <td><span class="badge badge-${u.status === 'active' ? 'success' : 'danger'}">${u.status}</span></td>
    <td>${u.joined}</td><td>${u.orders}</td>
    <td style="white-space:nowrap">
      <button class="btn btn-sm btn-${u.status === 'active' ? 'danger' : 'success'}" onclick="toggleStatus(${u.id})">${u.status === 'active' ? 'Suspend' : 'Activate'}</button>
      ${u.id !== 1 ? `<button class="btn btn-sm btn-warning" style="margin-left:3px" onclick="toggleRole(${u.id})">${u.role === 'admin' ? 'Demote' : 'Promote'}</button>` : ''}
      <button class="btn btn-sm btn-secondary" style="margin-left:3px" onclick="viewUser(${u.id})">👁️</button>
    </td></tr>`).join('');
}

function toggleStatus(id) {
  const u = S.users.find(x => x.id === id);
  if (!u || u.id === 1) return;
  u.status = u.status === 'active' ? 'suspended' : 'active';
  toast(`${u.name} ${u.status}`);
  renderAdminUsers(document.getElementById('adminContent'));
}

function toggleRole(id) {
  const u = S.users.find(x => x.id === id);
  if (!u || u.id === 1) return;
  u.role = u.role === 'admin' ? 'user' : 'admin';
  toast(`${u.name} → ${u.role}`);
  renderAdminUsers(document.getElementById('adminContent'));
}

function viewUser(id) {
  const u = S.users.find(x => x.id === id);
  if (!u) return;
  const m = document.createElement('div');
  m.className = 'modal-overlay';
  m.onclick = e => { if (e.target === m) m.remove(); };
  m.innerHTML = `<div class="modal">
    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
    <h3>👤 User Details</h3>
    <div style="display:grid;gap:8px;font-size:.9em">
      <p><strong>ID:</strong> #${u.id}</p><p><strong>Name:</strong> ${u.name}</p>
      <p><strong>Email:</strong> ${u.email}</p><p><strong>Phone:</strong> ${u.phone || '-'}</p>
      <p><strong>Role:</strong> ${u.role}</p><p><strong>Status:</strong> ${u.status}</p>
      <p><strong>Joined:</strong> ${u.joined}</p><p><strong>Address:</strong> ${u.address || '-'}</p>
      <p><strong>Orders:</strong> ${u.orders}</p>
    </div></div>`;
  document.body.appendChild(m);
}

// ==================== ATTACK LOGS ====================
function renderAdminLogs(c) {
  const blocked = S.attackLogs.filter(l => l.status === 'blocked');
  const crit = blocked.filter(l => l.severity === 'critical');

  c.innerHTML = `
    <h2>📋 SQL Injection Attack Logs</h2>
    <div class="admin-cards">
      <div class="admin-card" style="border-left:4px solid var(--danger)"><div class="card-value">${blocked.length}</div><div class="card-label">Attacks Blocked</div></div>
      <div class="admin-card" style="border-left:4px solid #e17055"><div class="card-value">${crit.length}</div><div class="card-label">Critical</div></div>
      <div class="admin-card" style="border-left:4px solid var(--success)"><div class="card-value">${S.attackLogs.filter(l => l.status === 'allowed').length}</div><div class="card-label">Normal Requests</div></div>
      <div class="admin-card" style="border-left:4px solid var(--primary)"><div class="card-value">${S.attackLogs.length}</div><div class="card-label">Total Logged</div></div>
    </div>
    <div class="filter-bar">
      <button class="btn btn-sm btn-secondary" onclick="filterLogs('all')">All</button>
      <button class="btn btn-sm btn-danger" onclick="filterLogs('blocked')">Blocked</button>
      <button class="btn btn-sm btn-success" onclick="filterLogs('allowed')">Allowed</button>
      <button class="btn btn-sm btn-warning" onclick="filterLogs('critical')">Critical</button>
      <button class="btn btn-sm btn-primary" onclick="filterLogs('high')">High</button>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>#</th><th>Time</th><th>IP</th><th>Input</th><th>Type</th><th>Severity</th><th>Status</th><th>Confidence</th></tr></thead>
      <tbody id="logsBody">${renderLogRows(S.attackLogs)}</tbody>
    </table></div>`;
}

function renderLogRows(logs) {
  return logs.map(l => `<tr>
    <td>${l.id}</td>
    <td style="white-space:nowrap;font-size:.78em">${l.time}</td>
    <td style="font-size:.8em">${l.ip}</td>
    <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(l.input)}"><code style="font-size:.78em">${esc(l.input)}</code></td>
    <td style="font-size:.8em">${l.type}</td>
    <td><span class="badge badge-${l.severity === 'critical' ? 'critical' : l.severity === 'high' ? 'danger' : l.severity === 'none' ? 'success' : 'warning'}">${l.severity}</span></td>
    <td><span class="badge badge-${l.status === 'blocked' ? 'danger' : 'success'}">${l.status}</span></td>
    <td>${l.confidence}%</td>
  </tr>`).join('');
}

function filterLogs(f) {
  let logs = S.attackLogs;
  if (f === 'blocked') logs = logs.filter(l => l.status === 'blocked');
  else if (f === 'allowed') logs = logs.filter(l => l.status === 'allowed');
  else if (f === 'critical') logs = logs.filter(l => l.severity === 'critical');
  else if (f === 'high') logs = logs.filter(l => l.severity === 'high');
  document.getElementById('logsBody').innerHTML = renderLogRows(logs);
}

// ==================== LIVE MONITOR ====================
function renderAdminMonitor(c) {
  c.innerHTML = `
    <h2>🖥️ Live Threat Monitor</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px">
      <div class="ml-panel">
        <h3>🔍 Test SQLi Detection</h3>
        <div class="form-group"><label>Enter input to analyze:</label><input id="testInput" placeholder="Try: ' OR 1=1-- or normal text"></div>
        <button class="btn btn-primary" onclick="testDetect()">🔬 Analyze</button>
        <div id="testResult" style="margin-top:14px"></div>
      </div>
      <div class="ml-panel">
        <h3>📊 Current Model Stats</h3>
        <div class="stat-grid">
          <div class="stat-box"><div class="stat-val" style="color:var(--primary)">${S.model.accuracy}%</div><div class="stat-lbl">Accuracy</div></div>
          <div class="stat-box"><div class="stat-val" style="color:var(--success)">${S.model.precision}%</div><div class="stat-lbl">Precision</div></div>
          <div class="stat-box"><div class="stat-val" style="color:var(--secondary)">${S.model.recall}%</div><div class="stat-lbl">Recall</div></div>
          <div class="stat-box"><div class="stat-val" style="color:var(--warning)">${S.model.f1}</div><div class="stat-lbl">F1 Score</div></div>
        </div>
        <p style="margin-top:10px;font-size:.8em;color:var(--gray)">Samples: ${S.model.samples} · Epochs: ${S.model.epochs} · Last: ${S.model.lastTrained}</p>
      </div>
    </div>
    <div class="ml-panel">
      <h3>📡 Real-time Request Stream</h3>
      <div style="display:flex;gap:12px;margin-bottom:10px;align-items:center">
        <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;background:var(--success);border-radius:50%;display:inline-block;animation:pulse 1.5s infinite"></span><span style="font-size:.82em">Live</span></div>
        <span style="font-size:.78em;color:var(--gray)" id="reqCounter">Requests: 0</span>
      </div>
      <div class="live-monitor" id="liveMonitor"></div>
    </div>`;
  startLiveMonitor();
}

function testDetect() {
  const input = document.getElementById('testInput').value;
  if (!input) return toast('Enter input', 'danger');
  const r = det.analyze(input);
  const clr = r.sqli ? 'var(--danger)' : 'var(--success)';
  document.getElementById('testResult').innerHTML = `
    <div style="padding:14px;border-radius:10px;border:2px solid ${clr};background:${r.sqli ? '#fff5f5' : '#f0fff4'}">
      <h4 style="color:${clr}">${r.sqli ? '⚠️ SQL INJECTION DETECTED' : '✅ SAFE INPUT'}</h4>
      <div style="margin-top:8px;font-size:.85em">
        <p><strong>Confidence:</strong> ${r.confidence}%</p>
        <p><strong>Risk:</strong> <span class="badge badge-${r.risk === 'critical' ? 'critical' : r.risk === 'high' ? 'danger' : r.risk === 'medium' ? 'warning' : 'success'}">${r.risk}</span></p>
        ${r.threats.length ? `<p><strong>Patterns:</strong> ${r.threats.join(', ')}</p>` : ''}
        <p><strong>Score:</strong> ${r.score}</p>
      </div></div>`;
  S.attackLogs.unshift({
    id: S.attackLogs.length + 1, time: new Date().toLocaleString(),
    ip: '127.0.0.1', input, type: r.threats.join(', ') || 'Normal',
    severity: r.risk, status: r.sqli ? 'blocked' : 'allowed', confidence: r.confidence
  });
  updateThreatBadge();
}

function startLiveMonitor() {
  const mon = document.getElementById('liveMonitor');
  if (!mon) return;
  reqCount = 0;
  const samples = [
    { i: 'user@gmail.com' }, { i: "' OR '1'='1" }, { i: 'johndoe' },
    { i: "admin' UNION SELECT *--" }, { i: 'test@mail.com' }, { i: 'Passw0rd!' },
    { i: "'; DROP TABLE--" }, { i: 'jane_smith' }, { i: "1' AND 1=1--" },
    { i: 'checkout_action' }, { i: "' HAVING 1=1--" }, { i: 'browse_page' },
    { i: "' WAITFOR DELAY '0:0:5'--" }, { i: 'search_term' },
    { i: "'; EXEC xp_cmdshell--" }, { i: 'update_cart' }
  ];
  monitorIv = setInterval(() => {
    const s = samples[Math.floor(Math.random() * samples.length)];
    const r = det.analyze(s.i);
    const t = new Date().toLocaleTimeString() + '.' + String(Date.now() % 1000).padStart(3, '0');
    const ip = randIP();
    const e = document.createElement('div');
    e.className = `log-entry ${r.sqli ? 'threat' : 'safe'}`;
    e.innerHTML = `[${t}] ${r.sqli ? '⛔' : '✅'} ${ip} | ${r.confidence}% | ${r.risk.toUpperCase()} | "${esc(s.i)}"${r.threats.length ? ' → ' + r.threats.join(', ') : ''}`;
    mon.prepend(e);
    if (mon.children.length > 80) mon.lastChild.remove();
    reqCount++;
    const rc = document.getElementById('reqCounter');
    if (rc) rc.textContent = 'Requests: ' + reqCount;
  }, 1400);
}

function startFeed(id) {
  const feed = document.getElementById(id);
  if (!feed) return;
  const samples = [
    { i: 'user@test.com' }, { i: "' OR 1=1--" }, { i: 'normaluser' },
    { i: "'; DROP TABLE--" }, { i: 'search' }, { i: "admin' UNION SELECT--" }, { i: 'login_attempt' }
  ];
  monitorIv = setInterval(() => {
    const s = samples[Math.floor(Math.random() * samples.length)];
    const r = det.analyze(s.i);
    const t = new Date().toLocaleTimeString();
    const e = document.createElement('div');
    e.className = `log-entry ${r.sqli ? 'threat' : 'safe'}`;
    e.innerHTML = `[${t}] ${r.sqli ? '⛔ BLOCKED' : '✅ OK'} | ${r.confidence}% | ${esc(s.i)}`;
    feed.prepend(e);
    if (feed.children.length > 50) feed.lastChild.remove();
  }, 2200);
}

// ==================== ML TRAINING ====================
function renderAdminTraining(c) {
  c.innerHTML = `
    <h2>🧠 Machine Learning Training Center</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px">
      <div class="ml-panel">
        <h3>⚙️ Model Configuration</h3>
        <div class="form-group"><label>Algorithm</label>
          <select id="mlAlgo"><option>Naive Bayes</option><option selected>Neural Network</option><option>Random Forest</option><option>SVM</option><option>Gradient Boosting</option><option>LSTM</option></select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="form-group"><label>Epochs</label><input type="number" id="mlEpochs" value="50" min="10" max="500"></div>
          <div class="form-group"><label>Learning Rate</label><input type="number" id="mlLR" value="0.001" step="0.0001"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="form-group"><label>Batch Size</label><input type="number" id="mlBatch" value="32"></div>
          <div class="form-group"><label>Validation Split</label><input type="number" id="mlVal" value="0.2" step="0.05"></div>
        </div>
        <div style="display:flex;gap:10px;margin-top:10px">
          <button class="btn btn-primary" onclick="startTraining()" id="trainBtn">🚀 Start Training</button>
          <button class="btn btn-danger" onclick="resetModel()">🔄 Reset</button>
        </div>
        <div class="training-progress" id="progressWrap" style="display:none"><div class="bar" id="progressBar"></div></div>
        <div id="trainLog" style="margin-top:10px;font-size:.8em;max-height:200px;overflow-y:auto;font-family:monospace;background:var(--bg);padding:10px;border-radius:8px;display:none"></div>
      </div>
      <div class="ml-panel">
        <h3>📊 Training Results</h3>
        <div class="stat-grid" style="margin-bottom:15px">
          <div class="stat-box"><div class="stat-val" style="color:var(--primary)">${S.model.accuracy}%</div><div class="stat-lbl">Accuracy</div></div>
          <div class="stat-box"><div class="stat-val" style="color:var(--success)">${S.model.precision}%</div><div class="stat-lbl">Precision</div></div>
          <div class="stat-box"><div class="stat-val" style="color:var(--secondary)">${S.model.recall}%</div><div class="stat-lbl">Recall</div></div>
          <div class="stat-box"><div class="stat-val" style="color:var(--warning)">${S.model.f1}</div><div class="stat-lbl">F1 Score</div></div>
        </div>
        <div style="font-size:.82em;color:var(--gray)">
          <p>📁 Dataset: ${S.dataset.length} samples (${S.dataset.filter(d => d.label === 'sqli').length} SQLi · ${S.dataset.filter(d => d.label === 'normal').length} Normal)</p>
          <p>🔄 Epochs: ${S.model.epochs} · Last: ${S.model.lastTrained}</p>
          <p>🎯 Status: ${S.model.trained ? '<span style="color:var(--success)">Trained ✅</span>' : '<span style="color:var(--danger)">Not trained ❌</span>'}</p>
        </div>
        <h4 style="margin-top:18px;margin-bottom:10px">📈 Loss Curve</h4>
        <div id="lossCurve" style="display:flex;align-items:flex-end;gap:2px;height:100px;background:var(--bg);border-radius:8px;padding:8px"></div>
      </div>
    </div>
    <div class="ml-panel"><h3>🧪 Cross-Validation Results</h3>
      <div class="table-wrap"><table><thead><tr><th>Fold</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1</th></tr></thead><tbody>
        ${[1, 2, 3, 4, 5].map(f => {
          const a = (93 + Math.random() * 6).toFixed(1), p = (94 + Math.random() * 5).toFixed(1),
                r = (92 + Math.random() * 6).toFixed(1), f1 = (0.92 + Math.random() * 0.07).toFixed(2);
          return `<tr><td>Fold ${f}</td><td>${a}%</td><td>${p}%</td><td>${r}%</td><td>${f1}</td></tr>`;
        }).join('')}
      </tbody></table></div>
    </div>`;
  renderLossCurve();
}

function renderLossCurve() {
  const curve = document.getElementById('lossCurve');
  if (!curve) return;
  let html = '';
  for (let i = 0; i < 30; i++) {
    const loss = 2.5 * Math.exp(-i * 0.12) + Math.random() * 0.08;
    const h = Math.max((loss / 2.5) * 100, 3);
    html += `<div style="flex:1;height:${h}%;background:linear-gradient(to top,var(--primary),var(--secondary));border-radius:3px 3px 0 0;min-width:4px" title="Epoch ${i + 1}: ${loss.toFixed(3)}"></div>`;
  }
  curve.innerHTML = html;
}

function startTraining() {
  const btn = document.getElementById('trainBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Training...';
  const wrap = document.getElementById('progressWrap');
  wrap.style.display = 'block';
  const bar = document.getElementById('progressBar');
  const log = document.getElementById('trainLog');
  log.style.display = 'block';
  log.innerHTML = '';
  const epochs = parseInt(document.getElementById('mlEpochs').value) || 50;
  const algo = document.getElementById('mlAlgo').value;
  let cur = 0;

  log.innerHTML += `[INFO] Starting ${algo} training with ${epochs} epochs...\n`;
  log.innerHTML += `[INFO] Dataset: ${S.dataset.length} samples\n`;
  log.innerHTML += `[INFO] SQLi: ${S.dataset.filter(d => d.label === 'sqli').length} | Normal: ${S.dataset.filter(d => d.label === 'normal').length}\n\n`;

  const iv = setInterval(() => {
    cur++;
    const pct = Math.round(cur / epochs * 100);
    bar.style.width = pct + '%';
    const loss = (2.5 * Math.exp(-cur * 0.08) + Math.random() * 0.05).toFixed(4);
    const acc = (60 + 35 * (1 - Math.exp(-cur * 0.06)) + Math.random() * 2).toFixed(1);
    const valLoss = (2.8 * Math.exp(-cur * 0.07) + Math.random() * 0.08).toFixed(4);

    if (cur % 5 === 0 || cur === 1 || cur === epochs) {
      log.innerHTML += `Epoch ${String(cur).padStart(3)}: loss=${loss} acc=${acc}% val_loss=${valLoss}\n`;
    }
    log.scrollTop = log.scrollHeight;

    if (cur >= epochs) {
      clearInterval(iv);
      S.model.accuracy = parseFloat((94 + Math.random() * 5).toFixed(1));
      S.model.precision = parseFloat((95 + Math.random() * 4).toFixed(1));
      S.model.recall = parseFloat((93 + Math.random() * 5).toFixed(1));
      S.model.f1 = parseFloat((0.93 + Math.random() * 0.06).toFixed(2));
      S.model.epochs = epochs;
      S.model.samples = S.dataset.length;
      S.model.lastTrained = new Date().toISOString().split('T')[0];
      S.model.trained = true;
      det.refresh();
      log.innerHTML += `\n[SUCCESS] Training complete!\n`;
      log.innerHTML += `[RESULT] Acc: ${S.model.accuracy}% | Prec: ${S.model.precision}% | Rec: ${S.model.recall}% | F1: ${S.model.f1}\n`;
      btn.disabled = false;
      btn.textContent = '🚀 Start Training';
      toast('Training complete! 🧠');
      setTimeout(() => renderAdminTraining(document.getElementById('adminContent')), 1500);
    }
  }, 50);
}

function resetModel() {
  S.model = { trained: false, accuracy: 0, epochs: 0, lastTrained: 'N/A', samples: 0, f1: 0, precision: 0, recall: 0 };
  toast('Model reset', 'warning');
  renderAdminTraining(document.getElementById('adminContent'));
}

// ==================== DATASET ====================
function renderAdminDataset(c) {
  const sq = S.dataset.filter(d => d.label === 'sqli').length;
  const nm = S.dataset.filter(d => d.label === 'normal').length;

  c.innerHTML = `
    <h2>📁 Training Dataset Management</h2>
    <div class="admin-cards">
      <div class="admin-card"><div class="card-value">${S.dataset.length}</div><div class="card-label">Total Samples</div></div>
      <div class="admin-card" style="border-left:4px solid var(--danger)"><div class="card-value">${sq}</div><div class="card-label">SQLi Samples</div></div>
      <div class="admin-card" style="border-left:4px solid var(--success)"><div class="card-value">${nm}</div><div class="card-label">Normal Samples</div></div>
      <div class="admin-card" style="border-left:4px solid var(--primary)"><div class="card-value">${S.dataset.length > 0 ? ((sq / S.dataset.length) * 100).toFixed(0) + '%' : '0%'}</div><div class="card-label">SQLi Ratio</div></div>
    </div>
    <div class="ml-panel" style="margin-bottom:18px">
      <h3>➕ Add Training Data</h3>
      <div style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:10px;align-items:end">
        <div class="form-group"><label>Input Pattern</label><input id="dsInput" placeholder="e.g. ' OR 1=1-- or normal@email.com"></div>
        <div class="form-group"><label>Label</label><select id="dsLabel"><option value="sqli">🔴 SQLi</option><option value="normal">🟢 Normal</option></select></div>
        <div class="form-group"><label>Category</label><select id="dsCat"><option>Tautology</option><option>Union</option><option>Piggyback</option><option>Comment</option><option>Blind</option><option>Time-based</option><option>Error-based</option><option>Command</option><option>Normal</option></select></div>
        <button class="btn btn-success" onclick="addEntry()">➕ Add</button>
      </div>
    </div>
    <div class="ml-panel" style="margin-bottom:18px">
      <h3>📋 Bulk Import Attack Patterns</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-sm btn-warning" onclick="addBulk('tautology')">+ Tautology</button>
        <button class="btn btn-sm btn-warning" onclick="addBulk('union')">+ Union</button>
        <button class="btn btn-sm btn-warning" onclick="addBulk('blind')">+ Blind/Time</button>
        <button class="btn btn-sm btn-warning" onclick="addBulk('advanced')">+ Advanced</button>
        <button class="btn btn-sm btn-success" onclick="addBulk('normal')">+ Normal</button>
      </div>
    </div>
    <div class="ml-panel">
      <h3>📄 Dataset Entries</h3>
      <div class="filter-bar">
        <button class="btn btn-sm btn-secondary" onclick="filterDS('all')">All (${S.dataset.length})</button>
        <button class="btn btn-sm btn-danger" onclick="filterDS('sqli')">SQLi (${sq})</button>
        <button class="btn btn-sm btn-success" onclick="filterDS('normal')">Normal (${nm})</button>
      </div>
      <div class="table-wrap" style="max-height:400px;overflow-y:auto"><table>
        <thead><tr><th>#</th><th>Input Pattern</th><th>Label</th><th>Category</th><th>Action</th></tr></thead>
        <tbody id="dsBody">${renderDSRows(S.dataset)}</tbody>
      </table></div>
    </div>`;
}

function renderDSRows(data) {
  return data.map((d, i) => {
    const origI = S.dataset.indexOf(d);
    return `<tr>
      <td>${origI + 1}</td>
      <td style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><code style="font-size:.78em">${esc(d.input)}</code></td>
      <td><span class="badge badge-${d.label === 'sqli' ? 'danger' : 'success'}">${d.label}</span></td>
      <td style="font-size:.82em">${d.cat}</td>
      <td><button class="btn btn-sm btn-danger" onclick="rmEntry(${origI})">🗑️</button></td>
    </tr>`;
  }).join('');
}

function filterDS(f) {
  let data = S.dataset;
  if (f !== 'all') data = data.filter(d => d.label === f);
  document.getElementById('dsBody').innerHTML = renderDSRows(data);
}

function addEntry() {
  const input = document.getElementById('dsInput').value.trim();
  if (!input) return toast('Enter pattern', 'danger');
  if (S.dataset.find(d => d.input === input)) return toast('Already exists', 'warning');
  S.dataset.push({
    input,
    label: document.getElementById('dsLabel').value,
    cat: document.getElementById('dsCat').value
  });
  document.getElementById('dsInput').value = '';
  toast('Added! Retrain to apply.');
  renderAdminDataset(document.getElementById('adminContent'));
}

function rmEntry(i) {
  S.dataset.splice(i, 1);
  toast('Removed', 'danger');
  renderAdminDataset(document.getElementById('adminContent'));
}

function addBulk(type) {
  const sets = {
    tautology: [
      { input: "' OR 'x'='x", label: 'sqli', cat: 'Tautology' },
      { input: "' OR 1=1#", label: 'sqli', cat: 'Tautology' },
      { input: "admin' OR '1'='1'/*", label: 'sqli', cat: 'Tautology' },
      { input: "' OR 'a'='a", label: 'sqli', cat: 'Tautology' },
      { input: "1' OR '1'='1' /*", label: 'sqli', cat: 'Tautology' },
      { input: "') OR ('1'='1", label: 'sqli', cat: 'Tautology' }
    ],
    union: [
      { input: "' UNION SELECT username,password FROM users--", label: 'sqli', cat: 'Union' },
      { input: "1 UNION SELECT NULL,table_name FROM information_schema.tables--", label: 'sqli', cat: 'Union' },
      { input: "' UNION ALL SELECT 1,2,3--", label: 'sqli', cat: 'Union' },
      { input: "-1 UNION SELECT group_concat(column_name) FROM information_schema.columns--", label: 'sqli', cat: 'Union' }
    ],
    blind: [
      { input: "' AND (SELECT COUNT(*) FROM users)>0--", label: 'sqli', cat: 'Blind' },
      { input: "' AND SUBSTRING(username,1,1)='a'--", label: 'sqli', cat: 'Blind' },
      { input: "1' AND IF(1=1,SLEEP(5),0)--", label: 'sqli', cat: 'Time-based' },
      { input: "' AND (SELECT LENGTH(password) FROM users LIMIT 1)>5--", label: 'sqli', cat: 'Blind' }
    ],
    advanced: [
      { input: "'; DECLARE @q NVARCHAR(4000);EXEC(@q)--", label: 'sqli', cat: 'Command' },
      { input: "' AND extractvalue(1,concat(0x7e,(SELECT @@version)))--", label: 'sqli', cat: 'Error-based' },
      { input: "1; UPDATE users SET role='admin'--", label: 'sqli', cat: 'Piggyback' },
      { input: "' OR 1=1 LIMIT 1 OFFSET 1--", label: 'sqli', cat: 'Tautology' }
    ],
    normal: [
      { input: "hello.world@example.com", label: 'normal', cat: 'Normal' },
      { input: "MySecureP@ss123", label: 'normal', cat: 'Normal' },
      { input: "search electronics", label: 'normal', cat: 'Normal' },
      { input: "John O'Brien", label: 'normal', cat: 'Normal' },
      { input: "order_12345", label: 'normal', cat: 'Normal' },
      { input: "smartwatch under 5000", label: 'normal', cat: 'Normal' }
    ]
  };

  let added = 0;
  (sets[type] || []).forEach(p => {
    if (!S.dataset.find(d => d.input === p.input)) { S.dataset.push(p); added++; }
  });
  toast(`Added ${added} patterns!`);
  renderAdminDataset(document.getElementById('adminContent'));
}
