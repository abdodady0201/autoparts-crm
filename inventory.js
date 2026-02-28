// ===== INVENTORY =====

function openInvModal(clear = true) {
  if (clear) {
    ['inv-id', 'inv-code', 'inv-name', 'inv-cars'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('inv-qty').value = 0;
    document.getElementById('inv-buy').value = 0;
    document.getElementById('inv-sell').value = 0;
    document.getElementById('inv-alert').value = 3;
    document.getElementById('inv-cat').value = 'فلاتر';
  }
  openModal('invModal');
}

function saveInventory() {
  const code = document.getElementById('inv-code').value.trim();
  const name = document.getElementById('inv-name').value.trim();
  if (!code || !name) { toast('الكود والاسم مطلوبان!', true); return; }

  const id = document.getElementById('inv-id').value;
  const data = {
    code,
    name,
    cat: document.getElementById('inv-cat').value,
    qty: document.getElementById('inv-qty').value,
    buy: document.getElementById('inv-buy').value,
    sell: document.getElementById('inv-sell').value,
    alert: document.getElementById('inv-alert').value,
    cars: document.getElementById('inv-cars').value
  };

  if (id) {
    Object.assign(db.inventory.find(x => x.id === id), data);
    toast('✅ تم التحديث');
  } else {
    db.inventory.push({ id: uid(), ...data });
    toast('✅ تمت الإضافة');
  }

  saveDb();
  closeModal('invModal');
  renderInventory();
  renderDashboard();
}

function editInventory(id) {
  const item = db.inventory.find(x => x.id === id);
  document.getElementById('inv-id').value = item.id;
  document.getElementById('inv-code').value = item.code;
  document.getElementById('inv-name').value = item.name;
  document.getElementById('inv-cat').value = item.cat;
  document.getElementById('inv-qty').value = item.qty;
  document.getElementById('inv-buy').value = item.buy;
  document.getElementById('inv-sell').value = item.sell;
  document.getElementById('inv-alert').value = item.alert;
  document.getElementById('inv-cars').value = item.cars || '';
  openInvModal(false);
}

function deleteInventory(id) {
  if (!confirm('حذف هذه القطعة من المخزون؟')) return;
  db.inventory = db.inventory.filter(x => x.id !== id);
  saveDb();
  renderInventory();
  renderDashboard();
  toast('تم الحذف', 'error');
}

function renderInventory() {
  const q = (document.getElementById('inventorySearch').value || '').toLowerCase();
  const list = db.inventory.filter(i =>
    i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)
  );
  const tb = document.getElementById('inventory-table');

  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="7">
      <div class="empty-state"><div class="empty-icon">📦</div><div>لا توجد قطع — أضف أول قطعة!</div></div>
    </td></tr>`;
    return;
  }

  tb.innerHTML = list.map(i => {
    const isLow = Number(i.qty) <= Number(i.alert);
    const isOut = Number(i.qty) === 0;

    let qtyCell;
    if (isOut) {
      qtyCell = `<span class="badge badge-red alert-low">نفدت</span>`;
    } else if (isLow) {
      qtyCell = `<span style="color:var(--yellow);font-weight:700">${i.qty} ⚠️</span>`;
    } else {
      qtyCell = `<strong>${i.qty}</strong>`;
    }

    return `<tr>
      <td><code style="color:var(--accent)">${i.code}</code></td>
      <td>
        <strong>${i.name}</strong>
        ${i.cars ? `<br><small style="color:var(--text2)">🚗 ${i.cars}</small>` : ''}
      </td>
      <td><span class="badge badge-blue">${i.cat}</span></td>
      <td>${qtyCell}</td>
      <td>${fmt(i.buy)} دج</td>
      <td style="color:var(--green);font-weight:700">${fmt(i.sell)} دج</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="editInventory('${i.id}')">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="deleteInventory('${i.id}')">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}
