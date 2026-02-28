// ===== SELL & CART =====

let cart = [];
let payMode = 'نقدي';

function setPay(method) {
  payMode = method;
  const map = { 'نقدي': 'cash', 'بنك': 'bank', 'دين': 'debt' };
  ['cash', 'bank', 'debt'].forEach(k => {
    document.getElementById('pay-' + k).classList.toggle('active', map[method] === k);
  });
}

function renderParts() {
  const q = (document.getElementById('sellSearch').value || '').toLowerCase();
  const list = db.inventory.filter(i =>
    i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)
  );
  const el = document.getElementById('parts-grid');

  if (!list.length) {
    const msg = db.inventory.length ? 'لا نتائج للبحث' : 'أضف قطعاً من صفحة المخزون أولاً';
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">${db.inventory.length ? '🔍' : '📦'}</div>
      <div>${msg}</div>
    </div>`;
    return;
  }

  el.innerHTML = list.map(i => `
    <div class="part-card ${Number(i.qty) === 0 ? 'out' : ''}" onclick="addToCart('${i.id}')">
      <div class="add-badge">+</div>
      <div class="part-code">${i.code}</div>
      <div class="part-name">${i.name}</div>
      ${i.cars ? `<div style="font-size:11px;color:var(--text2);margin-bottom:6px">🚗 ${i.cars}</div>` : ''}
      <div class="part-price">${fmt(i.sell)} دج</div>
      <div class="part-qty ${Number(i.qty) <= Number(i.alert) && Number(i.qty) > 0 ? 'alert-low' : ''}">
        ${Number(i.qty) === 0 ? '⛔ نفدت' : 'متوفر: ' + i.qty}
      </div>
    </div>`).join('');
}

function addToCart(id) {
  const inv = db.inventory.find(i => i.id === id);
  if (!inv || Number(inv.qty) === 0) { toast('هذه القطعة نفدت!', true); return; }

  const existing = cart.find(c => c.id === id);
  if (existing) {
    if (existing.qty >= Number(inv.qty)) { toast('لا يوجد مخزون كافٍ!', true); return; }
    existing.qty++;
  } else {
    cart.push({ id, name: inv.name, sell: Number(inv.sell), qty: 1 });
  }
  renderCart();
}

function changeQty(id, delta) {
  const inv = db.inventory.find(i => i.id === id);
  const item = cart.find(c => c.id === id);
  if (!item) return;

  item.qty += delta;
  if (delta > 0 && item.qty > Number(inv.qty)) {
    item.qty--;
    toast('لا يوجد مخزون كافٍ!', true);
    return;
  }
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  renderCart();
}

function renderCart() {
  const el = document.getElementById('cart-items');

  if (!cart.length) {
    el.innerHTML = '<div class="cart-empty">اضغط على قطعة لإضافتها ☝️</div>';
    document.getElementById('cart-count').textContent = '0';
    document.getElementById('cart-total').textContent = '0 دج';
    return;
  }

  el.innerHTML = cart.map(c => `
    <div class="cart-item">
      <div class="cart-item-name">${c.name}</div>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty('${c.id}', -1)">−</button>
        <span style="font-weight:700;min-width:18px;text-align:center">${c.qty}</span>
        <button class="qty-btn" onclick="changeQty('${c.id}', 1)">+</button>
      </div>
      <div class="cart-item-price">${fmt(c.qty * c.sell)} دج</div>
    </div>`).join('');

  const total = cart.reduce((a, c) => a + c.qty * c.sell, 0);
  document.getElementById('cart-count').textContent = cart.reduce((a, c) => a + c.qty, 0);
  document.getElementById('cart-total').textContent = fmt(total) + ' دج';
}

function clearCart() {
  cart = [];
  renderCart();
}

function confirmSale() {
  if (!cart.length) { toast('السلة فارغة!', true); return; }

  // Deduct from inventory
  cart.forEach(c => {
    const inv = db.inventory.find(i => i.id === c.id);
    if (inv) inv.qty = Number(inv.qty) - c.qty;
  });

  const total = cart.reduce((a, c) => a + c.qty * c.sell, 0);
  const now = new Date();

  const sale = {
    id: uid(),
    num: db.nextSaleNum++,
    items: cart.map(c => ({ ...c })),
    total,
    payment: payMode,
    note: document.getElementById('cart-note').value,
    date: isoToday(),
    time: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })
  };

  db.orders.push(sale);
  saveDb();

  showReceipt(sale);
  cart = [];
  renderCart();
  document.getElementById('cart-note').value = '';
  renderParts();
  toast('✅ تم تسجيل البيع!');
}

function showReceipt(sale) {
  document.getElementById('receiptContent').innerHTML = `
    <div class="receipt">
      <div class="receipt-title">🔧 قطعتي</div>
      <div class="receipt-sub">محل قطع غيار السيارات</div>
      <hr>
      <div class="receipt-row"><span>رقم الفاتورة</span><span>#${sale.num}</span></div>
      <div class="receipt-row"><span>التاريخ</span><span>${sale.date} ${sale.time}</span></div>
      <div class="receipt-row"><span>طريقة الدفع</span><span>${sale.payment}</span></div>
      <hr>
      ${sale.items.map(i => `
        <div class="receipt-row">
          <span>${i.name} × ${i.qty}</span>
          <span>${fmt(i.qty * i.sell)} دج</span>
        </div>`).join('')}
      <hr>
      <div class="receipt-row receipt-total">
        <span>💰 المجموع</span>
        <span>${fmt(sale.total)} دج</span>
      </div>
      ${sale.note ? `<div style="margin-top:10px;font-size:12px;color:#777">📝 ${sale.note}</div>` : ''}
      <div style="text-align:center;margin-top:14px;font-size:12px;color:#aaa">شكراً لتعاملكم معنا 🙏</div>
    </div>`;
  openModal('receiptModal');
}
