'use strict';

/* ════════════════════════════════════════════════════════════
   API LAYER
   All persistence is localStorage right now.
   Swap each method body for a fetch() call when the backend is ready.
════════════════════════════════════════════════════════════ */
const Api = {
  BASE: 'http://localhost:3000/api/items', // backend base URL

  async getItems() {
    const res = await fetch(`${this.BASE}`);
    return res.json();
  },

  async createItem(data) {
    const res = await fetch(`${this.BASE}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },

  async updateItem(id, data) {
    const res = await fetch(`${this.BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },

  async deleteItem(id) {
    const res = await fetch(`${this.BASE}/${id}`, { method: 'DELETE' });
    return res.json();
  },
};

/* ════════════════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════════════════ */
const state = {
  items:       [],
  page:        'dashboard',
  editingId:   null,
  deletingId:  null,
};

/* ════════════════════════════════════════════════════════════
   UTILITIES
════════════════════════════════════════════════════════════ */
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getStatus(item) {
  if (item.qty === 0)                           return 'out-stock';
  if (item.qty <= (item.threshold ?? 10))       return 'low-stock';
  return 'in-stock';
}

const STATUS_LABELS = {
  'in-stock':  'In Stock',
  'low-stock': 'Low Stock',
  'out-stock': 'Out of Stock',
};

function calcStats(items) {
  return {
    total:   items.length,
    inStock: items.filter(i => getStatus(i) === 'in-stock').length,
    low:     items.filter(i => getStatus(i) === 'low-stock').length,
    out:     items.filter(i => getStatus(i) === 'out-stock').length,
  };
}

/* Animated number counter */
function countUp(el, to) {
  const from = parseInt(el.textContent) || 0;
  if (from === to) return;
  const dur = 550;
  const t0  = performance.now();
  const tick = (now) => {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ════════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════════ */
function toast(msg, type = 'success') {
  const root = document.getElementById('toast-root');
  const el   = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<div class="toast-dot"></div><span>${esc(msg)}</span>`;
  root.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
    el.style.opacity    = '0';
    el.style.transform  = 'translateX(12px)';
    setTimeout(() => el.remove(), 290);
  }, 3200);
}

/* ════════════════════════════════════════════════════════════
   HTML BUILDERS
════════════════════════════════════════════════════════════ */
function emptyHTML(icon, title, sub) {
  return `<div class="empty">
    <div class="empty-ico"><i class="ri-${icon}"></i></div>
    <div class="empty-title">${esc(title)}</div>
    <div class="empty-sub">${esc(sub)}</div>
  </div>`;
}

function buildTable(rows, showLoc = true) {
  if (!rows.length) return emptyHTML('archive-line', 'No items found', 'Try adjusting your search or add a new item.');

  const thr = (item) => Math.max((item.threshold ?? 10) * 3, item.qty + 1);
  const pct = (item) => Math.min(100, Math.round((item.qty / thr(item)) * 100));

  const FILL = { 'in-stock': '#22c55e', 'low-stock': '#f59e0b', 'out-stock': '#ef4444' };

  const body = rows.map((item, i) => {
    const s = getStatus(item);
    return `
    <tr style="animation: row-in 0.22s ${(i * 38)}ms both ease">
      <td>
        <div class="item-name">${esc(item.name)}</div>
        <div class="item-sku">${esc(item.sku)}</div>
      </td>
      <td>${item.category
        ? `<span class="cat-chip">${esc(item.category)}</span>`
        : `<span style="color:var(--t-3)">—</span>`}
      </td>
      <td>
        <span class="qty-val">${item.qty}</span><span class="qty-unit">${esc(item.unit || 'pcs')}</span>
        <div class="qty-bar"><div class="qty-fill" style="width:${pct(item)}%;background:${FILL[s]}"></div></div>
      </td>
      <td><span class="pill ${s}">${STATUS_LABELS[s]}</span></td>
      ${showLoc ? `<td style="color:var(--t-3);font-size:13px;">${esc(item.location || '—')}</td>` : ''}
      <td class="price-val">${item.price ? '$' + Number(item.price).toFixed(2) : '—'}</td>
      <td>
        <div class="row-acts">
          <button class="btn btn-ghost btn-ico btn-sm" title="Edit" onclick="App.openEditModal('${esc(item._id)}')">
            <i class="ri-pencil-line"></i>
          </button>
          <button class="btn btn-danger btn-ico btn-sm" title="Delete" onclick="App.openDeleteModal('${esc(item._id)}')">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');

  const locTh = showLoc ? '<th>Location</th>' : '';

  return `<table>
    <thead>
      <tr>
        <th>Item / SKU</th>
        <th>Category</th>
        <th style="min-width:110px;">Quantity</th>
        <th>Status</th>
        ${locTh}
        <th>Price</th>
        <th style="width:80px;"></th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`;
}

/* ════════════════════════════════════════════════════════════
   APP CONTROLLER
════════════════════════════════════════════════════════════ */
const App = {

  async init() {
    state.items = await Api.getItems();

    // Nav clicks
    document.querySelectorAll('.nav-link').forEach(el => {
      el.addEventListener('click', () => this.navigate(el.dataset.page));
    });

    // Overlay backdrop close
    document.getElementById('item-overlay').addEventListener('click', e => {
      if (e.target.id === 'item-overlay') this.closeModal();
    });
    document.getElementById('del-overlay').addEventListener('click', e => {
      if (e.target.id === 'del-overlay') this.closeDeleteModal();
    });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { this.closeModal(); this.closeDeleteModal(); }
    });

    // Live search / filter
    document.getElementById('inv-search').addEventListener('input',  () => this.renderInventory());
    document.getElementById('inv-cat').addEventListener('change',    () => this.renderInventory());
    document.getElementById('inv-status').addEventListener('change', () => this.renderInventory());
    document.getElementById('cat-search').addEventListener('input',  () => this.renderCategories());

    this.navigate('dashboard');
  },

  /* ── Navigation ── */
  navigate(page) {
    state.page = page;

    document.querySelectorAll('.nav-link').forEach(el =>
      el.classList.toggle('active', el.dataset.page === page)
    );

    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(`page-${page}`);
    target.classList.remove('hidden');
    target.style.animation = 'none';
    void target.offsetHeight;       // reflow to restart animation
    target.style.animation = '';

    const TITLES = { dashboard: 'Dashboard', inventory: 'Inventory', categories: 'Categories' };
    document.getElementById('topbar-title').textContent = TITLES[page];
    document.getElementById('bc-page').textContent      = TITLES[page];
    document.getElementById('add-btn').style.display    = page === 'inventory' ? '' : 'none';

    if (page === 'dashboard')  this.renderDashboard();
    if (page === 'inventory')  this.renderInventory();
    if (page === 'categories') this.renderCategories();
  },

  /* ── Dashboard ── */
  renderDashboard() {
    const { total, inStock, low, out } = calcStats(state.items);
    countUp(document.getElementById('s-total'), total);
    countUp(document.getElementById('s-in'),    inStock);
    countUp(document.getElementById('s-low'),   low);
    countUp(document.getElementById('s-out'),   out);
    document.getElementById('count-num').textContent = total;

    const recent = [...state.items].reverse().slice(0, 8);
    document.getElementById('dash-table').innerHTML = buildTable(recent, false);
  },

  /* ── Inventory ── */
  renderInventory() {
    this._refreshCatFilter();
    const q   = document.getElementById('inv-search').value.toLowerCase();
    const cat = document.getElementById('inv-cat').value;
    const st  = document.getElementById('inv-status').value;

    const filtered = state.items.filter(item => {
      const mQ = !q  || item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q) || (item.category ?? '').toLowerCase().includes(q);
      const mC = !cat || item.category === cat;
      const mS = !st  || getStatus(item) === st;
      return mQ && mC && mS;
    });

    document.getElementById('count-num').textContent = state.items.length;
    document.getElementById('inv-table').innerHTML   = buildTable(filtered, true);
  },

  /* ── Categories ── */
  renderCategories() {
    const q = document.getElementById('cat-search').value.toLowerCase();

    const map = {};
    state.items.forEach(item => {
      const c = item.category || 'Uncategorized';
      if (!map[c]) map[c] = { count: 0, inStock: 0, low: 0, out: 0, value: 0 };
      const s = getStatus(item);
      map[c].count++;
      if (s === 'in-stock')  map[c].inStock++;
      if (s === 'low-stock') map[c].low++;
      if (s === 'out-stock') map[c].out++;
      map[c].value += (item.price || 0) * item.qty;
    });

    const entries = Object.entries(map).filter(([k]) => !q || k.toLowerCase().includes(q));
    const wrap    = document.getElementById('cat-table');

    if (!entries.length) {
      wrap.innerHTML = emptyHTML('price-tag-3-line', 'No categories yet', 'Add inventory items to see categories here.');
      return;
    }

    const rows = entries.map(([name, d], i) => `
      <tr style="animation: row-in 0.22s ${i * 38}ms both ease">
        <td><div class="item-name">${esc(name)}</div></td>
        <td style="font-weight:700;">${d.count}</td>
        <td><span class="pill in-stock">${d.inStock}</span></td>
        <td><span class="pill low-stock">${d.low}</span></td>
        <td><span class="pill out-stock">${d.out}</span></td>
        <td class="price-val">$${d.value.toFixed(2)}</td>
      </tr>`).join('');

    wrap.innerHTML = `<table>
      <thead><tr><th>Category</th><th>Items</th><th>In Stock</th><th>Low Stock</th><th>Out of Stock</th><th>Total Value</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  },

  /* ── Modal: Add ── */
  openAddModal() {
    state.editingId = null;
    this._clearForm();
    document.getElementById('modal-title').textContent = 'Add Item';
    document.getElementById('modal-sub').textContent   = 'Fill in the stock item details.';
    document.getElementById('item-overlay').classList.add('open');
    setTimeout(() => document.getElementById('f-name').focus(), 60);
  },

  /* ── Modal: Edit ── */
  openEditModal(id) {
    const item = state.items.find(i => i._id === id);
    if (!item) return;
    state.editingId = id;
    document.getElementById('modal-title').textContent = 'Edit Item';
    document.getElementById('modal-sub').textContent   = 'Update the stock item details.';
    document.getElementById('f-name').value      = item.name      ?? '';
    document.getElementById('f-sku').value       = item.sku       ?? '';
    document.getElementById('f-category').value  = item.category  ?? '';
    document.getElementById('f-location').value  = item.location  ?? '';
    document.getElementById('f-qty').value       = item.qty       ?? '';
    document.getElementById('f-threshold').value = item.threshold ?? '';
    document.getElementById('f-price').value     = item.price     ?? '';
    document.getElementById('f-unit').value      = item.unit      || 'pcs';
    document.getElementById('f-notes').value     = item.notes     ?? '';
    document.getElementById('item-overlay').classList.add('open');
  },

  closeModal() {
    document.getElementById('item-overlay').classList.remove('open');
    state.editingId = null;
  },

  /* ── Save (Add / Update) ── */
  async saveItem() {
    const name = document.getElementById('f-name').value.trim();
    const sku  = document.getElementById('f-sku').value.trim();
    const qty  = parseFloat(document.getElementById('f-qty').value);

    if (!name)             { toast('Item name is required.', 'error'); return; }
    if (!sku)              { toast('SKU is required.', 'error'); return; }
    if (isNaN(qty) || qty < 0) { toast('Enter a valid quantity.', 'error'); return; }
    if (state.items.some(i => i.sku === sku && i._id !== state.editingId)) {
      toast('SKU already exists.', 'error');
      return;
    }

    const data = {
      name, sku, qty,
      category:  document.getElementById('f-category').value.trim(),
      location:  document.getElementById('f-location').value.trim(),
      threshold: parseFloat(document.getElementById('f-threshold').value) || 10,
      price:     parseFloat(document.getElementById('f-price').value) || 0,
      unit:      document.getElementById('f-unit').value,
      notes:     document.getElementById('f-notes').value.trim(),
    };

    try {
      if (state.editingId) {
        await Api.updateItem(state.editingId, data);
        toast('Item updated successfully.');
      } else {
        await Api.createItem(data);
        toast('Item added successfully.');
      }
      state.items = await Api.getItems();
      this.closeModal();
      this.navigate(state.page);
    } catch (err) {
      toast(err.message || 'Something went wrong.', 'error');
    }
  },

  /* ── Delete ── */
  openDeleteModal(id) {
    const item = state.items.find(i => i._id === id);
    if (!item) return;
    state.deletingId = id;
    document.getElementById('del-name').textContent = item.name;
    document.getElementById('del-overlay').classList.add('open');
  },

  closeDeleteModal() {
    document.getElementById('del-overlay').classList.remove('open');
    state.deletingId = null;
  },

  async confirmDelete() {
    try {
      await Api.deleteItem(state.deletingId);
      state.items = await Api.getItems();
      toast('Item deleted.');
      this.closeDeleteModal();
      this.navigate(state.page);
    } catch (err) {
      toast(err.message || 'Delete failed.', 'error');
    }
  },

  /* ── Internal Helpers ── */
  _clearForm() {
    ['f-name','f-sku','f-category','f-location','f-qty','f-threshold','f-price','f-notes']
      .forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('f-unit').value = 'pcs';
  },

  _refreshCatFilter() {
    const sel     = document.getElementById('inv-cat');
    const current = sel.value;
    const cats    = [...new Set(state.items.map(i => i.category).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">All Categories</option>'
      + cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    sel.value = current;

    const dl = document.getElementById('cat-dl');
    if (dl) dl.innerHTML = cats.map(c => `<option value="${esc(c)}">`).join('');
  },
};

/* ════════════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════════════ */
App.init();
