// ===== DATABASE =====
// All data is stored in localStorage under the key 'ap_db'

const DB_KEY = 'ap_db';

let db = {
  inventory: [],
  orders: [],
  suppliers: [],
  nextSaleNum: 1
};

function loadDb() {
  try {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) db = JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load database:', e);
  }
}

function saveDb() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save database:', e);
  }
}

// Load on startup
loadDb();
