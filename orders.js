// ===== ORDERS / SALES LOG =====

function renderOrders() {
  const q = (document.getElementById('orderSearch').value || '').toLowerCase();
  const filter = document.getElementById('orderFilter').value;

  let list = [...db.orders].reverse();

  // Filter by date
  if (filter === 'today') {
    list = list.filter(o => o.date === isoToday());
  } else if (filter === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    list = list.filter(o => new Date(o.date) >= weekAgo);
  } else if (filter === 'month') {
    list = list.filter(o => o.date.startsWith(isoMonth()));
  }

  // Filter by search query
  if (q) {
    list = list.filter(o =>
      o.items.some(i => i.name.toLowerCase().includes(q)) ||
      String(o.num).includes(q)
    );
  }

  const tb = document.getElementById('orders-table');

  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="7">
      <div class="empty-state"><div class="empty-icon">🧾</div><div>لا توجد مبيعات</div></div>
    </td></tr>`;
    return;
  }

  tb.innerHTML = list.map(o => `
    <tr>
      <td><strong>#${o.num}</strong></td>
      <td style="font-size:12px;max-width:200px">${o.items.map(i => `${i.name} ×${i.qty}`).join('، ')}</td>
      <td style="color:var(--green);font-weight:700">${fmt(o.total)} دج</td>
      <td><span class="badge badge-blue">${o.payment}</span></td>
      <td>${o.date}</td>
      <td>${o.time || ''}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewReceipt('${o.id}')">🧾</button>
        <button class="btn btn-danger btn-sm" onclick="cancelSale('${o.id}')">↩️</button>
      </td>
    </tr>`).join('');
}

function viewReceipt(id) {
  const sale = db.orders.find(o => o.id === id);
  if (sale) showReceipt(sale);
}

function cancelSale(id) {
  if (!confirm('إلغاء هذا البيع وإرجاع الكميات للمخزون؟')) return;

  const sale = db.orders.find(x => x.id === id);
  if (!sale) return;

  // Return quantities to inventory
  sale.items.forEach(it => {
    const inv = db.inventory.find(i => i.id === it.id);
    if (inv) inv.qty = Number(inv.qty) + it.qty;
  });

  db.orders = db.orders.filter(x => x.id !== id);
  saveDb();
  renderOrders();
  renderDashboard();
  toast('تم إلغاء البيع وإرجاع الكميات');
}
