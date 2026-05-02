// =====================================================
// SITTA - Script utama (DOM, validasi, interaksi UI)
// =====================================================

// ---------- AUTH GUARD ----------
function getCurrentUser() {
  const data = sessionStorage.getItem("sitta_user");
  return data ? JSON.parse(data) : null;
}

function requireLogin() {
  if (!getCurrentUser()) {
    alert("Anda belum login. Silakan login terlebih dahulu.");
    window.location.href = "index.html";
  }
}

function logout() {
  if (confirm("Apakah Anda yakin ingin logout?")) {
    sessionStorage.removeItem("sitta_user");
    window.location.href = "index.html";
  }
}

// ---------- GREETING BERDASARKAN WAKTU ----------
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return "Selamat Pagi";
  if (hour >= 11 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 19) return "Selamat Sore";
  return "Selamat Malam";
}

// ---------- LOGIN PAGE ----------
function initLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Email dan password tidak boleh kosong!");
      return;
    }
    if (!email.includes("@")) {
      alert("Format email tidak valid!");
      return;
    }

    const user = dataPengguna.find(
      (u) => u.email.toLowerCase() === email && u.password === password,
    );
    if (!user) {
      alert("Email/password yang anda masukkan salah");
      return;
    }

    sessionStorage.setItem("sitta_user", JSON.stringify(user));
    alert("Login berhasil! Selamat datang, " + user.nama);
    window.location.href = "dashboard.html";
  });

  // Modal lupa password
  const lupaBtn = document.getElementById("btnLupa");
  const daftarBtn = document.getElementById("btnDaftar");
  if (lupaBtn) lupaBtn.onclick = () => openModal("modalLupa");
  if (daftarBtn) daftarBtn.onclick = () => openModal("modalDaftar");

  // Form lupa password
  const lupaForm = document.getElementById("formLupa");
  if (lupaForm) {
    lupaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const em = document.getElementById("lupaEmail").value.trim();
      if (!em.includes("@")) {
        alert("Format email tidak valid!");
        return;
      }
      alert("Tautan reset password sudah dikirim ke: " + em);
      closeModal("modalLupa");
      lupaForm.reset();
    });
  }

  // Form daftar
  const daftarForm = document.getElementById("formDaftar");
  if (daftarForm) {
    daftarForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const nm = document.getElementById("daftarNama").value.trim();
      const em = document.getElementById("daftarEmail").value.trim();
      const pw = document.getElementById("daftarPassword").value.trim();
      if (!nm || !em || !pw) {
        alert("Semua field wajib diisi!");
        return;
      }
      if (!em.includes("@")) {
        alert("Format email tidak valid!");
        return;
      }
      if (pw.length < 6) {
        alert("Password minimal 6 karakter!");
        return;
      }
      alert(
        "Pendaftaran berhasil!\nNama: " +
          nm +
          "\nEmail: " +
          em +
          "\nSilakan login dengan akun baru Anda.",
      );
      closeModal("modalDaftar");
      daftarForm.reset();
    });
  }
}

// ---------- MODAL HELPERS ----------
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add("active");
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove("active");
}

// Close modal kalau klik area gelap di luar isi
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active");
  }
});

// ---------- DASHBOARD ----------
function initDashboard() {
  requireLogin();
  const user = getCurrentUser();
  const greetEl = document.getElementById("greeting");
  const nameEl = document.getElementById("userName");
  const roleEl = document.getElementById("userRole");
  if (greetEl) greetEl.textContent = getGreeting() + ", " + user.nama + " 👋";
  if (nameEl) nameEl.textContent = user.nama;
  if (roleEl) roleEl.textContent = user.role + " — " + user.lokasi;

  // Statistik singkat
  const totalBuku = document.getElementById("totalBuku");
  const totalStok = document.getElementById("totalStok");
  const totalDO = document.getElementById("totalDO");
  if (totalBuku) totalBuku.textContent = dataBahanAjar.length;
  if (totalStok)
    totalStok.textContent = dataBahanAjar
      .reduce((s, b) => s + b.stok, 0)
      .toLocaleString("id-ID");
  if (totalDO) totalDO.textContent = Object.keys(dataTracking).length;
}

// ---------- STOK ----------
let stokData = [];

function initStokPage() {
  requireLogin();
  const user = getCurrentUser();
  const userInfo = document.getElementById("userInfoNav");
  if (userInfo) userInfo.textContent = user.nama;

  stokData = [...dataBahanAjar];
  renderStokTable();

  const formTambah = document.getElementById("formTambahStok");
  if (formTambah) {
    formTambah.addEventListener("submit", function (e) {
      e.preventDefault();
      const kodeLokasi = document.getElementById("kodeLokasi").value.trim();
      const kodeBarang = document.getElementById("kodeBarang").value.trim();
      const namaBarang = document.getElementById("namaBarang").value.trim();
      const jenisBarang = document.getElementById("jenisBarang").value.trim();
      const edisi = document.getElementById("edisi").value.trim();
      const stok = parseInt(document.getElementById("stok").value, 10);

      if (!kodeLokasi || !kodeBarang || !namaBarang || !jenisBarang || !edisi) {
        alert("Semua field wajib diisi!");
        return;
      }
      if (isNaN(stok) || stok < 0) {
        alert("Stok harus berupa angka >= 0!");
        return;
      }
      if (
        stokData.some(
          (b) => b.kodeBarang.toLowerCase() === kodeBarang.toLowerCase(),
        )
      ) {
        alert("Kode Barang sudah ada di daftar!");
        return;
      }

      stokData.push({
        kodeLokasi,
        kodeBarang,
        namaBarang,
        jenisBarang,
        edisi,
        stok,
        cover: "assets/pengantar_komunikasi.jpg",
      });
      renderStokTable();
      alert("Stok baru berhasil ditambahkan!");
      formTambah.reset();
      closeModal("modalTambahStok");
    });
  }

  const btnTambah = document.getElementById("btnTambahStok");
  if (btnTambah) btnTambah.onclick = () => openModal("modalTambahStok");
}

function renderStokTable() {
  const tbody = document.getElementById("stokTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (stokData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">Tidak ada data</td></tr>`;
    return;
  }

  stokData.forEach((b, i) => {
    let badge = "badge-success";
    let label = "Tersedia";
    if (b.stok < 200) {
      badge = "badge-warning";
      label = "Stok Menipis";
    }
    if (b.stok < 50) {
      badge = "badge-danger";
      label = "Hampir Habis";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td><img src="${b.cover}" alt="${b.namaBarang}" class="cover-thumb" onerror="this.style.display='none'"></td>
      <td>${b.kodeLokasi}</td>
      <td><strong>${b.kodeBarang}</strong></td>
      <td>${b.namaBarang}</td>
      <td>${b.jenisBarang}</td>
      <td>${b.edisi}</td>
      <td>${b.stok.toLocaleString("id-ID")} <span class="badge ${badge}">${label}</span></td>
      <td><button class="btn btn-danger" style="padding:6px 12px;font-size:12px" onclick="hapusStok(${i})">Hapus</button></td>
    `;
    tbody.appendChild(tr);
  });

  const totalEl = document.getElementById("totalStokInfo");
  if (totalEl)
    totalEl.textContent = `Total: ${stokData.length} item • Stok keseluruhan: ${stokData.reduce((s, b) => s + b.stok, 0).toLocaleString("id-ID")}`;
}

function hapusStok(i) {
  if (!confirm("Yakin ingin menghapus item ini?")) return;
  stokData.splice(i, 1);
  renderStokTable();
}

// ---------- TRACKING ----------
function initTrackingPage() {
  requireLogin();
  const user = getCurrentUser();
  const userInfo = document.getElementById("userInfoNav");
  if (userInfo) userInfo.textContent = user.nama;

  const form = document.getElementById("formTracking");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const noDO = document.getElementById("noDO").value.trim();
    if (!noDO) {
      alert("Masukkan Nomor Delivery Order!");
      return;
    }

    const data = dataTracking[noDO];
    const result = document.getElementById("trackingResult");
    if (!data) {
      result.classList.remove("active");
      alert("Nomor DO tidak ditemukan! Coba: 2023001234 atau 2023005678");
      return;
    }
    renderTracking(data);
  });
}

function renderTracking(data) {
  const r = document.getElementById("trackingResult");
  if (!r) return;

  // Hitung persen progress dari status
  let progress = 33;
  if (data.status === "Dikirim") progress = 100;
  else if (data.status === "Dalam Perjalanan") progress = 60;

  let timelineHTML = "";
  data.perjalanan
    .slice()
    .reverse()
    .forEach((p) => {
      timelineHTML += `
      <div class="timeline-item">
        <div class="timeline-time">${p.waktu}</div>
        <div class="timeline-desc">${p.keterangan}</div>
      </div>`;
    });

  r.innerHTML = `
    <div class="tracking-header">
      <h3>${data.nama}</h3>
      <div class="do-no">No. DO: ${data.nomorDO}</div>
    </div>
    <div class="tracking-info">
      <div class="info-grid">
        <div class="info-item"><span class="label">Status</span><span class="value">${data.status}</span></div>
        <div class="info-item"><span class="label">Ekspedisi</span><span class="value">${data.ekspedisi}</span></div>
        <div class="info-item"><span class="label">Tanggal Kirim</span><span class="value">${data.tanggalKirim}</span></div>
        <div class="info-item"><span class="label">Kode Paket</span><span class="value">${data.paket}</span></div>
        <div class="info-item"><span class="label">Total Pembayaran</span><span class="value">${data.total}</span></div>
      </div>
      <div>
        <strong>Progress Pengiriman</strong>
        <div class="progress"><div class="progress-bar" style="width:${progress}%"></div></div>
        <div style="font-size:13px;color:var(--muted)">${progress}% selesai</div>
      </div>
      <h4 style="margin:20px 0 12px;color:var(--primary)">Riwayat Perjalanan Paket</h4>
      <div class="timeline">${timelineHTML}</div>
    </div>
  `;
  r.classList.add("active");
}
