// ===== UTILITIES =====

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function fmt(n) {
  return Number(n || 0).toLocaleString('ar-DZ');
}

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function isoMonth() {
  return new Date().toISOString().slice(0, 7);
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function toast(msg, err = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (err ? ' error' : '');
  setTimeout(() => t.classList.add('show'), 30);
  setTimeout(() => t.classList.remove('show'), 2500);
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => {
      if (e.target === m) m.classList.remove('open');
    });
  });
});
