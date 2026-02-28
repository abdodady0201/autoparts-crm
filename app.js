// ===== APP - Navigation & Init =====

const PAGES = ['dashboard', 'sell', 'inventory', 'orders', 'suppliers'];
const PAGE_TITLES = {
  dashboard: 'لوحة التحكم',
  sell: 'بيع سريع',
  inventory: 'المخزون',
  orders: 'سجل المبيعات',
  suppliers: 'الموردون'
};
const PAGE_RENDER = {
  dashboard: renderDashboard,
  sell: renderParts,
  inventory: renderInventory,
  orders: renderOrders,
  suppliers: renderSuppliers
};

function showSection(id) {
  PAGES.forEach((p, i) => {
    document.getElementById('section-' + p).classList.toggle('active', p === id);
    document.querySelectorAll('.nav-item')[i].classList.toggle('active', p === id);
  });
  document.getElementById('pageTitle').textContent = PAGE_TITLES[id];
  document.getElementById('sidebar').classList.remove('open');
  if (PAGE_RENDER[id]) PAGE_RENDER[id]();
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('ar-DZ', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  renderDashboard();
});
