// ===== SUPPLIERS =====

function openSupModal(clear = true) {
  if (clear) {
    ['sup-id', 'sup-name', 'sup-phone', 'sup-spec', 'sup-addr', 'sup-notes']
      .forEach(id => document.getElementById(id).value = '');
  }
  openModal('supModal');
}

function saveSupplier() {
  const name = document.getElementById('sup-name').value.trim();
  if (!name) { toast('اسم المورد مطلوب!', true); return; }

  const id = document.getElementById('sup-id').value;
  const data = {
    name,
    phone: document.getElementById('sup-phone').value,
    spec: document.getElementById('sup-spec').value,
    addr: document.getElementById('sup-addr').value,
    notes: document.getElementById('sup-notes').value
  };

  if (id) {
    Object.assign(db.suppliers.find(x => x.id === id), data);
    toast('✅ تم التحديث');
  } else {
    db.suppliers.push({ id: uid(), ...data });
    toast('✅ تمت الإضافة');
  }

  saveDb();
  closeModal('supModal');
  renderSuppliers();
}

function editSupplier(id) {
  const s = db.suppliers.find(x => x.id === id);
  document.getElementById('sup-id').value = s.id;
  document.getElementById('sup-name').value = s.name;
  document.getElementById('sup-phone').value = s.phone || '';
  document.getElementById('sup-spec').value = s.spec || '';
  document.getElementById('sup-addr').value = s.addr || '';
  document.getElementById('sup-notes').value = s.notes || '';
  openSupModal(false);
}

function deleteSupplier(id) {
  if (!confirm('حذف هذا المورد؟')) return;
  db.suppliers = db.suppliers.filter(x => x.id !== id);
  saveDb();
  renderSuppliers();
  toast('تم الحذف', 'error');
}

function renderSuppliers() {
  const q = (document.getElementById('supplierSearch').value || '').toLowerCase();
  const list = db.suppliers.filter(s => s.name.toLowerCase().includes(q));
  const tb = document.getElementById('suppliers-table');

  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="5">
      <div class="empty-state"><div class="empty-icon">🚛</div><div>لا يوجد موردون</div></div>
    </td></tr>`;
    return;
  }

  tb.innerHTML = list.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>
        <strong>${s.name}</strong>
        ${s.addr ? `<br><small style="color:var(--text2)">${s.addr}</small>` : ''}
      </td>
      <td dir="ltr">${s.phone || '—'}</td>
      <td>${s.spec || '—'}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="editSupplier('${s.id}')">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="deleteSupplier('${s.id}')">🗑️</button>
      </td>
    </tr>`).join('');
}
