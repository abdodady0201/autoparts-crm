// ===== DASHBOARD =====

function renderDashboard() {
  // Stats
  document.getElementById('stat-items').textContent = db.inventory.length;

  const todaySales = db.orders.filter(o => o.date === isoToday());
  const monthSales = db.orders.filter(o => o.date.startsWith(isoMonth()));

  document.getElementById('stat-orders').textContent = todaySales.length;
  document.getElementById('stat-revenue').textContent = fmt(todaySales.reduce((a, o) => a + o.total, 0));
  document.getElementById('stat-month').textContent = fmt(monthSales.reduce((a, o) => a + o.total, 0));

  // Low stock table
  const lowItems = db.inventory.filter(i => Number(i.qty) <= Number(i.alert));
  const lowTb = document.getElementById('low-stock-table');

  if (lowItems.length) {
    lowTb.innerHTML = lowItems.map(i => `
      <tr>
        <td>${i.name}</td>
        <td class="${Number(i.qty) === 0 ? 'alert-low' : ''}">${i.qty}</td>
        <td><span class="badge ${Number(i.qty) === 0 ? 'badge-red' : 'badge-yellow'}">
          ${Number(i.qty) === 0 ? 'نفدت' : 'منخفضة'}
        </span></td>
      </tr>`).join('');
  } else {
    lowTb.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text2);padding:16px">✅ المخزون بخير</td></tr>';
  }

  // Recent sales table
  const recentSales = [...db.orders].reverse().slice(0, 5);
  const recentTb = document.getElementById('recent-orders-table');

  if (recentSales.length) {
    recentTb.innerHTML = recentSales.map(o => `
      <tr>
        <td style="font-size:12px">${o.items.map(i => i.name).join('، ')}</td>
        <td style="color:var(--green);font-weight:700">${fmt(o.total)} دج</td>
        <td><span class="badge badge-blue">${o.payment}</span></td>
      </tr>`).join('');
  } else {
    recentTb.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text2);padding:16px">لا مبيعات بعد</td></tr>';
  }
}
