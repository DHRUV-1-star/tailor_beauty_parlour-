// ============================================
// admin.js - Shringar Admin Dashboard Logic
// ============================================

const API = 'http://localhost:5000/api';
let authToken = localStorage.getItem('shringar_admin_token') || null;
let allBookings = [];
let currentBookingId = null;
let selectedStatus = null;

// ---- Utility ----
const $ = id => document.getElementById(id);
const showToast = (msg, type = 'success') => {
  const t = $('toast');
  t.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
  t.className = `toast ${type}`;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3500);
};

const formatDate = iso => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = t => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
};

const serviceLabels = {
  covered_blouse: 'Covered Blouse', salwar_suit: 'Salwar Suit',
  lehenga: 'Lehenga', kurti: 'Kurti', saree_blouse: 'Saree Blouse',
  indo_western: 'Indo Western', alteration: 'Alteration',
  bridal_makeup: 'Bridal Makeup', party_makeup: 'Party Makeup',
  facial: 'Facial', threading_waxing: 'Threading/Waxing',
  hair: 'Hair', mehendi: 'Mehendi', manicure: 'Manicure',
};

const badgeClass = status => ({
  pending: 'badge-pending', confirmed: 'badge-confirmed',
  completed: 'badge-completed', cancelled: 'badge-cancelled',
}[status] || 'badge-pending');

// ---- Auth ----
const checkAuth = () => {
  if (authToken) {
    $('loginScreen').classList.add('hidden');
    $('dashboard').classList.remove('hidden');
    loadAllData();
  }
};

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('adminEmail').value.trim();
  const password = $('adminPassword').value;
  const errEl = $('loginError');
  errEl.classList.remove('show');
  $('loginBtnText').textContent = 'Signing in...';
  $('loginSpinner').classList.remove('hidden');

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      authToken = data.token;
      localStorage.setItem('shringar_admin_token', authToken);
      if (data.admin?.name) $('adminName').textContent = data.admin.name;
      $('loginScreen').classList.add('hidden');
      $('dashboard').classList.remove('hidden');
      loadAllData();
    } else {
      errEl.textContent = data.message || 'Invalid credentials';
      errEl.classList.add('show');
    }
  } catch {
    errEl.textContent = 'Cannot connect to server. Is the backend running?';
    errEl.classList.add('show');
  } finally {
    $('loginBtnText').textContent = 'Sign In';
    $('loginSpinner').classList.add('hidden');
  }
});

$('togglePass').addEventListener('click', () => {
  const inp = $('adminPassword');
  inp.type = inp.type === 'password' ? 'text' : 'password';
});

$('logoutBtn').addEventListener('click', () => {
  authToken = null;
  localStorage.removeItem('shringar_admin_token');
  $('dashboard').classList.add('hidden');
  $('loginScreen').classList.remove('hidden');
  $('adminEmail').value = '';
  $('adminPassword').value = '';
});

// ---- Navigation ----
const pages = ['overview', 'bookings', 'today'];
const pageTitles = { overview: 'Overview', bookings: 'All Bookings', today: "Today's Appointments" };

const navigateTo = pageName => {
  pages.forEach(p => {
    $(`page-${p}`).classList.add('hidden');
    $(`page-${p}`).classList.remove('active');
    $(`nav-${p}`).classList.remove('active');
  });
  $(`page-${pageName}`).classList.remove('hidden');
  $(`page-${pageName}`).classList.add('active');
  $(`nav-${pageName}`).classList.add('active');
  $('pageTitle').textContent = pageTitles[pageName];

  if (window.innerWidth <= 768) {
    $('sidebar').classList.remove('open');
  }
};

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(item.dataset.page);
  });
});

document.querySelectorAll('.view-all').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(el.dataset.page);
  });
});

$('sidebarToggle').addEventListener('click', () => {
  $('sidebar').classList.toggle('open');
});

// ---- Topbar Date ----
const updateDate = () => {
  const now = new Date();
  $('topbarDate').textContent = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  $('todayDateLabel').textContent = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};
updateDate();

// ---- Refresh ----
$('refreshBtn').addEventListener('click', () => {
  loadAllData();
  showToast('Data refreshed!');
});

// ---- API Calls ----
const apiFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${API}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}`, ...options.headers },
    ...options,
  });
  if (res.status === 401) {
    authToken = null;
    localStorage.removeItem('shringar_admin_token');
    $('dashboard').classList.add('hidden');
    $('loginScreen').classList.remove('hidden');
    throw new Error('Session expired');
  }
  return res.json();
};

const loadAllData = async () => {
  await Promise.all([loadBookings(), loadTodayBookings()]);
};

// ---- Load Bookings ----
const loadBookings = async () => {
  try {
    const data = await apiFetch('/bookings');
    if (data.success) {
      allBookings = data.data || [];
      renderStats();
      renderRecentTable();
      renderAllBookingsTable(allBookings);
    }
  } catch (err) {
    console.error(err);
  }
};

// ---- Render Stats ----
const renderStats = () => {
  const total = allBookings.length;
  const pending = allBookings.filter(b => b.status === 'pending').length;
  const confirmed = allBookings.filter(b => b.status === 'confirmed').length;

  // Today count
  const today = new Date().toISOString().split('T')[0];
  const todayCount = allBookings.filter(b => b.appointmentDate?.split('T')[0] === today).length;

  $('statTotal').textContent = total;
  $('statPending').textContent = pending;
  $('statConfirmed').textContent = confirmed;
  $('statToday').textContent = todayCount;
  $('pendingBadge').textContent = pending;
};

// ---- Build Table Row ----
const buildRow = (booking, cols) => {
  const name = booking.name || '—';
  const initial = name.charAt(0).toUpperCase();
  const serviceName = serviceLabels[booking.service] || booking.service;
  const cat = booking.serviceCategory || '';
  const dateStr = formatDate(booking.appointmentDate);
  const timeStr = formatTime(booking.appointmentTime);

  const customerCell = `
    <div class="customer-cell">
      <div class="customer-avatar">${initial}</div>
      <div>
        <div class="customer-name">${name}</div>
        ${cols === 'full' ? `<div class="customer-phone">${booking.phone || ''}</div>` : ''}
      </div>
    </div>`;

  const serviceCell = `
    <div class="service-label">
      ${serviceName}
      ${cat ? `<span class="service-cat">${cat}</span>` : ''}
    </div>`;

  const statusCell = `<span class="badge ${badgeClass(booking.status)}">${booking.status}</span>`;
  const updateBtn = `<button class="action-btn" onclick="openModal('${booking._id}')">Update</button>`;

  if (cols === 'full') {
    const paidCell = booking.isPaid
      ? '<span style="color:#2ecc71;font-size:0.8rem">✅ Paid</span>'
      : '<span style="color:#b89aaa;font-size:0.8rem">Unpaid</span>';
    return `<tr>
      <td>${customerCell}</td>
      <td><div class="customer-phone">${booking.phone || '—'}</div></td>
      <td>${serviceCell}</td>
      <td><div style="font-size:0.85rem">${dateStr}</div><div style="font-size:0.75rem;color:var(--text-muted)">${timeStr}</div></td>
      <td>${statusCell}</td>
      <td>${paidCell}</td>
      <td>${updateBtn}</td>
    </tr>`;
  } else {
    return `<tr>
      <td>${customerCell}</td>
      <td>${serviceCell}</td>
      <td><div style="font-size:0.85rem">${dateStr}</div><div style="font-size:0.75rem;color:var(--text-muted)">${timeStr}</div></td>
      <td>${statusCell}</td>
      <td>${updateBtn}</td>
    </tr>`;
  }
};

// ---- Recent Table (5 latest) ----
const renderRecentTable = () => {
  const tbody = $('recentTableBody');
  const recent = [...allBookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  if (!recent.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-loading">No bookings yet</td></tr>';
    return;
  }
  tbody.innerHTML = recent.map(b => buildRow(b, 'compact')).join('');
};

// ---- All Bookings Table ----
const renderAllBookingsTable = (bookings) => {
  const tbody = $('allBookingsBody');
  if (!bookings.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="table-loading">No bookings found</td></tr>';
    return;
  }
  const sorted = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  tbody.innerHTML = sorted.map(b => buildRow(b, 'full')).join('');
};

// ---- Load Today's Appointments ----
const loadTodayBookings = async () => {
  try {
    const data = await apiFetch('/bookings/today');
    const container = $('todayCards');
    const bookings = data.data || [];

    if (!bookings.length) {
      container.innerHTML = `
        <div class="no-appointments">
          <div class="no-emoji">🗓️</div>
          <p>No appointments scheduled for today.</p>
        </div>`;
      return;
    }

    const sorted = [...bookings].sort((a, b) => (a.appointmentTime || '').localeCompare(b.appointmentTime || ''));
    container.innerHTML = sorted.map((b, i) => {
      const serviceName = serviceLabels[b.service] || b.service;
      return `
        <div class="today-card" style="animation-delay:${i * 0.07}s">
          <div class="today-card-time">🕐 ${formatTime(b.appointmentTime)}</div>
          <div class="today-card-name">${b.name}</div>
          <div class="today-card-phone">📞 ${b.phone}</div>
          <div class="today-card-service">${serviceName}</div>
          <div class="today-card-footer">
            <span class="badge ${badgeClass(b.status)}">${b.status}</span>
            <button class="action-btn" onclick="openModal('${b._id}')">Update</button>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    console.error(err);
  }
};

// ---- Filters ----
$('applyFilter').addEventListener('click', () => {
  const status = $('filterStatus').value;
  const search = $('filterSearch').value.trim().toLowerCase();
  let filtered = allBookings;
  if (status) filtered = filtered.filter(b => b.status === status);
  if (search) filtered = filtered.filter(b =>
    b.name?.toLowerCase().includes(search) || b.phone?.includes(search)
  );
  renderAllBookingsTable(filtered);
});

// ---- Modal ----
window.openModal = (id) => {
  const booking = allBookings.find(b => b._id === id);
  if (!booking) return;
  currentBookingId = id;
  selectedStatus = booking.status;

  const serviceName = serviceLabels[booking.service] || booking.service;
  $('modalBookingInfo').innerHTML = `
    <strong>${booking.name}</strong><br>
    📞 ${booking.phone}<br>
    🪡 ${serviceName}<br>
    📅 ${formatDate(booking.appointmentDate)} at ${formatTime(booking.appointmentTime)}
  `;

  const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  $('statusButtons').innerHTML = statuses.map(s => `
    <button class="status-btn ${s === booking.status ? 'selected' : ''}" data-status="${s}" onclick="selectStatus('${s}', this)">
      ${s.charAt(0).toUpperCase() + s.slice(1)}
    </button>`).join('');

  $('modalPaid').checked = booking.isPaid || false;
  $('statusModal').classList.remove('hidden');
};

window.selectStatus = (status, btn) => {
  selectedStatus = status;
  document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
};

const closeModal = () => {
  $('statusModal').classList.add('hidden');
  currentBookingId = null;
  selectedStatus = null;
};

$('modalClose').addEventListener('click', closeModal);
$('modalCancel').addEventListener('click', closeModal);
$('statusModal').addEventListener('click', e => { if (e.target === $('statusModal')) closeModal(); });

$('modalSave').addEventListener('click', async () => {
  if (!currentBookingId || !selectedStatus) return;
  const isPaid = $('modalPaid').checked;
  try {
    const data = await apiFetch(`/bookings/${currentBookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: selectedStatus, isPaid }),
    });
    if (data.success) {
      // Update local data
      const idx = allBookings.findIndex(b => b._id === currentBookingId);
      if (idx !== -1) {
        allBookings[idx].status = selectedStatus;
        allBookings[idx].isPaid = isPaid;
      }
      showToast('Booking updated successfully!');
      closeModal();
      renderStats();
      renderRecentTable();
      renderAllBookingsTable(allBookings);
      loadTodayBookings();
    } else {
      showToast(data.message || 'Update failed', 'error');
    }
  } catch (err) {
    showToast('Server error. Try again.', 'error');
  }
});

// ---- Init ----
checkAuth();
