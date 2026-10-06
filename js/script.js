/* SITTA UT - script bersama (data dari js/data.js) */
const $ = (id) => document.getElementById(id);
const page = document.body.dataset.page;
const user = JSON.parse(sessionStorage.getItem('sitta_user') || 'null');

/* ---------- Modal & toast ---------- */
function openModal(id) { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }
window.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) e.target.classList.remove('open'); });
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

/* ---------- Navbar (dipakai semua halaman setelah login) ---------- */
function renderNav() {
  const link = (href, text, key) =>
    `<li><a class="nav-link ${page === key ? 'active' : ''}" href="${href}">${text}</a></li>`;
  $('navbar').innerHTML = `
  <div class="nav-inner">
    <a class="brand" href="dashboard.html">
      <span class="logo"><img src="assets/logo-ut.png" alt="Logo UT" onerror="this.parentNode.textContent='UT'"></span>
      <span><strong>SITTA UT</strong><small>Universitas Terbuka</small></span>
    </a>
    <button class="nav-toggle" id="navToggle" aria-label="Menu">☰</button>
    <ul class="nav-menu" id="navMenu">
      ${link('stok.html', 'Informasi Bahan Ajar', 'stok')}
      ${link('tracking.html', 'Tracking Pengiriman', 'tracking')}
      <li><button class="nav-link" id="lapBtn">Laporan ▾</button>
        <div class="dropdown" id="lapMenu">
          <a href="#" class="soon">Monitoring Progress DO Bahan Ajar</a>
          <a href="#" class="soon">Rekap Bahan Ajar</a>
        </div></li>
      <li><a class="nav-link soon" href="#">Histori Transaksi Bahan Ajar</a></li>
      <li><button class="btn-logout" id="logoutBtn">Logout</button></li>
    </ul>
  </div>`;
  $('navToggle').onclick = () => $('navMenu').classList.toggle('open');
  $('lapBtn').onclick = (e) => { e.stopPropagation(); $('lapMenu').classList.toggle('open'); };
  document.addEventListener('click', () => $('lapMenu').classList.remove('open'));
  document.querySelectorAll('.soon').forEach((a) =>
    a.addEventListener('click', (e) => { e.preventDefault(); alert('Halaman ini belum tersedia pada Tugas Praktik 1.'); }));
  $('logoutBtn').onclick = () => {
    if (confirm('Yakin ingin keluar?')) { sessionStorage.removeItem('sitta_user'); location.href = 'index.html'; }
  };
}

/* ---------- Proteksi halaman ---------- */
if (page !== 'login') {
  if (!user) { location.replace('index.html'); }
  else renderNav();
}

/* ---------- 1. Login ---------- */
if (page === 'login') {
  if (user) location.replace('dashboard.html');
  $('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('email').value.trim().toLowerCase();
    const pass = $('password').value;
    $('emailErr').textContent = ''; $('passErr').textContent = '';
    let ok = true;
    if (!/^\S+@\S+\.\S+$/.test(email)) { $('emailErr').textContent = 'Format email tidak valid.'; ok = false; }
    if (pass.length < 1) { $('passErr').textContent = 'Password wajib diisi.'; ok = false; }
    if (!ok) return;
    const found = dataPengguna.find((u) => u.email === email && u.password === pass);
    if (!found) { alert('Email/password yang Anda masukkan salah'); return; }
    sessionStorage.setItem('sitta_user', JSON.stringify(found));
    location.href = 'dashboard.html';
  });
}

/* ---------- 2. Dashboard ---------- */
if (page === 'dashboard' && user) {
  const jam = new Date().getHours();
  const sapa = jam < 11 ? 'pagi' : jam < 15 ? 'siang' : jam < 18 ? 'sore' : 'malam';
  $('greeting').textContent = `Selamat ${sapa}, ${user.nama}!`;
  $('role').textContent = `${user.role} · ${user.lokasi}`;
  $('statJudul').textContent = dataBahanAjar.length;
  $('statStok').textContent = dataBahanAjar.reduce((t, b) => t + b.stok, 0).toLocaleString('id-ID');
  $('statDO').textContent = Object.keys(dataTracking).length;
  const tick = () => {
    const d = new Date();
    $('clock').textContent = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    $('date').textContent = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };
  tick(); setInterval(tick, 30000);
}

/* ---------- 3. Tracking ---------- */
if (page === 'tracking' && user) {
  const persen = { 'Dikirim': 40, 'Dalam Perjalanan': 70, 'Diterima': 100 };
  $('trackForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const no = $('nomorDO').value.trim();
    const out = $('hasil'); out.innerHTML = ''; $('doErr').textContent = '';
    $('nomorDO').classList.remove('invalid');
    if (!no) { $('doErr').textContent = 'Nomor Delivery Order wajib diisi.'; $('nomorDO').classList.add('invalid'); return; }
    const d = dataTracking[no];
    if (!d) { alert(`Nomor DO "${no}" tidak ditemukan.`); return; }
    const selesai = d.perjalanan.some((p) => /selesai antar/i.test(p.keterangan));
    const status = selesai ? 'Diterima' : d.status;
    const pct = persen[status] ?? 50;
    const riwayat = [...d.perjalanan].sort((a, b) => b.waktu.localeCompare(a.waktu));
    out.innerHTML = `
      <div class="result">
        <div class="res-head"><div><h3>${d.nama}</h3><small>No. DO ${no}</small></div>
          <div><span class="status ${selesai ? 'done' : ''}">${status}</span></div></div>
        <div class="progress"><i style="width:${pct}%"></i></div>
        <small>Progres pengiriman ${pct}%</small>
        <div class="details">
          <div><small>Ekspedisi</small><b>${d.ekspedisi}</b></div>
          <div><small>Tanggal kirim</small><b>${d.tanggalKirim}</b></div>
          <div><small>Jenis paket</small><b>${d.paket}</b></div>
          <div><small>Total pembayaran</small><b>${d.total}</b></div>
        </div>
        <h2>Perjalanan paket</h2>
        <ul class="timeline">${riwayat.map((p) => `<li><b>${p.keterangan}</b><br><time>${p.waktu}</time></li>`).join('')}</ul>
      </div>`;
  });
}

/* ---------- 4. Stok ---------- */
if (page === 'stok' && user) {
  const body = $('stokBody');
  const baris = (b) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${b.cover || ''}" alt="Cover ${b.namaBarang}" onerror="this.style.visibility='hidden'"></td>
      <td>${b.kodeLokasi}</td><td>${b.kodeBarang}</td><td><b>${b.namaBarang}</b></td>
      <td>${b.jenisBarang}</td><td>${b.edisi}</td>
      <td><span class="pill ${b.stok < 200 ? 'low' : ''}">${b.stok}</span></td>`;
    return tr;
  };
  const tampil = (daftar) => {
    body.innerHTML = '';
    if (!daftar.length) { body.innerHTML = '<tr><td colspan="7">Data tidak ditemukan.</td></tr>'; return; }
    daftar.forEach((b) => body.appendChild(baris(b)));
  };
  tampil(dataBahanAjar);

  $('cari').addEventListener('input', (e) => {
    const k = e.target.value.toLowerCase();
    tampil(dataBahanAjar.filter((b) => b.namaBarang.toLowerCase().includes(k) || b.kodeBarang.toLowerCase().includes(k)));
  });

  let coverBaru = '';
  const resetCover = () => { coverBaru = ''; $('coverPreview').style.display = 'none'; $('coverPreview').removeAttribute('src'); };
  $('btnTambah').onclick = () => { $('stokForm').reset(); $('stokErr').textContent = ''; resetCover(); openModal('modalStok'); };

  $('fCover').addEventListener('change', (e) => {
    const file = e.target.files[0];
    $('stokErr').textContent = '';
    if (!file) { resetCover(); return; }
    if (!file.type.startsWith('image/')) {
      $('stokErr').textContent = 'File cover harus berupa gambar.'; e.target.value = ''; resetCover(); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      $('stokErr').textContent = 'Ukuran cover maksimal 2 MB.'; e.target.value = ''; resetCover(); return;
    }
    const reader = new FileReader();
    reader.onload = () => { coverBaru = reader.result; $('coverPreview').src = coverBaru; $('coverPreview').style.display = 'block'; };
    reader.readAsDataURL(file);
  });
  $('stokForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (id) => $(id).value.trim();
    const b = { kodeLokasi: v('fLokasi'), kodeBarang: v('fKode'), namaBarang: v('fNama'),
                jenisBarang: v('fJenis'), edisi: v('fEdisi'), stok: parseInt(v('fStok'), 10), cover: coverBaru };
    if (!b.kodeLokasi || !b.kodeBarang || !b.namaBarang || !b.edisi) { $('stokErr').textContent = 'Semua kolom wajib diisi.'; return; }
    if (isNaN(b.stok) || b.stok < 0) { $('stokErr').textContent = 'Stok harus berupa angka 0 atau lebih.'; return; }
    if (dataBahanAjar.some((x) => x.kodeBarang.toLowerCase() === b.kodeBarang.toLowerCase())) {
      $('stokErr').textContent = 'Kode barang sudah ada.'; return;
    }
    dataBahanAjar.push(b);
    if ($('cari').value) { $('cari').value = ''; tampil(dataBahanAjar); } else body.appendChild(baris(b));
    closeModal('modalStok'); toast('Stok baru berhasil ditambahkan');
  });
}
