# Panduan Presentasi Code — Tugas Praktik 2 SITTA UT (Vue.js)

**Alur penjelasan:** HTML → JS → CSS
**Strategi:** Mulai dari tampilan (HTML), telusuri ke logika (JS), terakhir ke styling (CSS).
**Pembukaan:** "Saya akan jelaskan code dari sisi HTML dulu sebagai struktur tampilan, lalu turun ke file JS sebagai logika Vue.js, dan terakhir CSS sebagai pewarnaan."

---

## BAGIAN 1 — `index.html` (Halaman Beranda)

Halaman ini hanya berisi navigasi sederhana ke dua halaman utama. Tidak ada logika Vue.js di sini karena fungsinya cuma sebagai pintu masuk.

```html
<nav class="menu-grid">
    <a href="stok.html" class="menu-card">
        <div class="menu-icon">BA</div>
        <h2>Stok Bahan Ajar</h2>
        <p>Kelola, filter, dan pantau stok bahan ajar...</p>
        <span class="menu-link">Buka Halaman &rarr;</span>
    </a>
    <a href="tracking.html" class="menu-card">...</a>
</nav>
```

**Penjelasan:**
Saya buat dua kartu menu menggunakan tag `<a>` agar seluruh kartu bisa diklik. Class `menu-grid` adalah CSS Grid yang otomatis menyusun kartu agar responsif. Kartu pertama mengarah ke `stok.html`, kartu kedua ke `tracking.html`. Halaman ini tidak punya `id="app"` karena tidak ada interaksi Vue.

---

## BAGIAN 2 — `stok.html` (Halaman Utama Pertama)

Inilah halaman utama Tugas Praktik 2 yang menggunakan paling banyak fitur Vue.js.

### 2.1 Pembungkus Vue & Navigasi

```html
<div id="app" class="container">
    <nav class="topnav">
        <a href="index.html" class="brand">SITTA UT</a>
        <div class="nav-links">
            <a href="index.html">Beranda</a>
            <a href="stok.html" class="active">Stok Bahan Ajar</a>
            <a href="tracking.html">Tracking DO</a>
        </div>
    </nav>
```

**Penjelasan:**
Seluruh konten halaman dibungkus oleh `<div id="app">`. ID ini penting karena nanti di file `stok-app.js` kita pasang `new Vue({ el: '#app', ... })` — artinya semua yang ada di dalam div ini bisa menggunakan directive Vue seperti `{{ }}`, `v-if`, `v-for`, dan sebagainya.

Di dalamnya ada navbar dengan tiga link. Link halaman aktif diberi class `active` agar pengguna tahu sedang ada di halaman mana.

---

### 2.2 Panel Ringkasan (Summary Cards)

```html
<section class="summary-row">
    <div class="summary-card summary-aman">
        <span class="summary-label">Aman</span>
        <span class="summary-value">{{ jumlahAman }}</span>
    </div>
    <div class="summary-card summary-menipis">
        <span class="summary-label">Menipis</span>
        <span class="summary-value">{{ jumlahMenipis }}</span>
    </div>
    <div class="summary-card summary-kosong">
        <span class="summary-label">Kosong</span>
        <span class="summary-value">{{ jumlahKosong }}</span>
    </div>
    <div class="summary-card summary-total">
        <span class="summary-label">Total Item</span>
        <span class="summary-value">{{ stok.length }}</span>
    </div>
</section>
```

**Penjelasan:**
Bagian ini menampilkan empat kartu ringkasan: stok Aman, Menipis, Kosong, dan Total Item. Saya menggunakan **mustaches `{{ }}`** untuk menampilkan data dari Vue.

Angka pada masing-masing kartu diambil dari **computed property** yang ada di file `stok-app.js`:

```javascript
computed: {
    jumlahAman: function () {
        return this.stok.filter(function (it) {
            return it.qty >= it.safety && it.qty > 0;
        }).length;
    },
    jumlahMenipis: function () {
        return this.stok.filter(function (it) {
            return it.qty > 0 && it.qty < it.safety;
        }).length;
    },
    jumlahKosong: function () {
        return this.stok.filter(function (it) {
            return it.qty === 0;
        }).length;
    }
}
```

**Lanjutan penjelasan:**
Fungsi `jumlahAman` menghitung jumlah bahan ajar yang qty-nya lebih besar atau sama dengan safety stock. `jumlahMenipis` menghitung yang qty-nya di bawah safety tapi belum nol. `jumlahKosong` menghitung yang qty-nya nol persis.

Saya pakai **computed**, bukan methods, karena Vue akan otomatis melakukan caching. Selama data `stok` tidak berubah, hasil perhitungan tidak akan dijalankan ulang. Ini efisien.

Data `stok` sendiri berasal dari file `js/dataBahanAjar.js`:

```javascript
window.dataBahanAjar = {
    stok: [
        { kode: "EKMA4116", judul: "Pengantar Manajemen", qty: 28, safety: 20, ... },
        { kode: "EKMA4115", judul: "Pengantar Akuntansi", qty: 7, safety: 15, ... },
        { kode: "BIOL4201", judul: "Biologi Umum (Praktikum)", qty: 12, safety: 10, ... },
        { kode: "FISIP4001", judul: "Dasar-Dasar Sosiologi", qty: 2, safety: 8, ... }
    ],
    ...
};
```

Jadi alurnya: data dummy disimpan di `window.dataBahanAjar.stok`, diambil oleh `stok-app.js` ke property `data.stok`, lalu dihitung oleh computed property, dan akhirnya ditampilkan di HTML melalui `{{ jumlahAman }}` dan seterusnya.

---

### 2.3 Toast Notifikasi

```html
<div v-if="notifikasi" class="toast" :class="'toast-' + notifikasi.tipe" v-text="notifikasi.pesan"></div>
```

**Penjelasan:**
Baris ini menampilkan notifikasi toast (pesan kecil pop-up) ketika ada aksi yang dilakukan pengguna. Saya menggunakan tiga directive sekaligus:

- **`v-if="notifikasi"`** — div ini hanya muncul kalau variabel `notifikasi` tidak null.
- **`:class="'toast-' + notifikasi.tipe"`** — ini adalah **v-bind** (singkatannya tanda titik dua). Class CSS-nya dinamis, tergantung tipenya: `toast-success` untuk hijau, `toast-error` untuk merah, `toast-info` untuk biru.
- **`v-text="notifikasi.pesan"`** — alternatif dari mustaches untuk menampilkan teks.

Toast ini dipanggil dari method `tampilkanNotifikasi` di JS:

```javascript
tampilkanNotifikasi: function (pesan, tipe) {
    var self = this;
    self.notifikasi = { pesan: pesan, tipe: tipe || 'info' };
    if (self.timerNotifikasi) clearTimeout(self.timerNotifikasi);
    self.timerNotifikasi = setTimeout(function () {
        self.notifikasi = null;
    }, 3000);
}
```

Method ini mengatur isi notifikasi lalu menghapusnya otomatis setelah 3 detik dengan `setTimeout`. Kalau ada notifikasi baru sebelum 3 detik habis, timer lama akan di-clear dulu agar tidak tumpang tindih.

---

### 2.4 Panel Filter dan Sort

```html
<section class="panel">
    <h2>Filter &amp; Pengurutan</h2>
    <div class="filter-grid">
        <div class="filter-item">
            <label for="filter-upbjj">Filter UT-Daerah</label>
            <select id="filter-upbjj" v-model="filterUpbjj">
                <option value="">-- Semua UT-Daerah --</option>
                <option v-for="d in upbjjList" :key="d" :value="d">{{ d }}</option>
            </select>
        </div>
```

**Penjelasan:**
Ini adalah dropdown filter UT-Daerah. Yang penting di sini:

- **`v-model="filterUpbjj"`** adalah **two-way data binding**. Artinya, kalau pengguna memilih sesuatu, variabel `filterUpbjj` di Vue otomatis terisi. Sebaliknya, kalau saya ubah `filterUpbjj` dari JS, dropdown ikut berubah.
- **`v-for="d in upbjjList"`** adalah **list rendering**. Vue mengulang `<option>` untuk setiap UPBJJ.
- **`:key="d"`** wajib ada agar Vue bisa melacak elemen dengan efisien.
- **`:value="d"`** mengikat value option ke nilai UPBJJ.

Data `upbjjList` berasal dari `dataBahanAjar.js`:
```javascript
upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"]
```

---

### 2.5 Dependent Options (Filter Kategori)

```html
<div class="filter-item" v-if="filterUpbjj">
    <label for="filter-kategori">Filter Kategori Mata Kuliah</label>
    <select id="filter-kategori" v-model="filterKategori">
        <option value="">-- Semua Kategori --</option>
        <option v-for="k in kategoriList" :key="k" :value="k">{{ k }}</option>
    </select>
</div>
```

**Penjelasan:**
Ini adalah implementasi **dependent options** yang diminta soal. Filter Kategori **hanya akan muncul** kalau `filterUpbjj` sudah dipilih, berkat directive `v-if="filterUpbjj"`. Selama UPBJJ kosong, elemen ini tidak dirender sama sekali oleh Vue.

Kalau pengguna mengosongkan kembali UPBJJ, filter Kategori juga harus direset agar tidak nyangkut. Ini saya tangani di **watcher** di `stok-app.js`:

```javascript
watch: {
    filterUpbjj: function (nilaiBaru, nilaiLama) {
        if (!nilaiBaru) {
            this.filterKategori = '';
        }
        if (nilaiBaru !== nilaiLama && nilaiBaru) {
            this.tampilkanNotifikasi('Filter UPBJJ diubah ke: ' + nilaiBaru, 'info');
        }
    },
    ...
}
```

**Lanjutan penjelasan:**
Watcher ini akan otomatis dipanggil setiap kali nilai `filterUpbjj` berubah. Kalau nilainya jadi kosong, `filterKategori` ikut dikosongkan. Kalau nilainya berubah ke UPBJJ baru, akan muncul notifikasi info. Inilah salah satu dari minimal 2 watcher yang diminta soal.

---

### 2.6 Sort dan Filter Re-order

```html
<div class="filter-item">
    <label for="sort-by">Urutkan Berdasarkan</label>
    <select id="sort-by" v-model="sortBy">
        <option value="">-- Tanpa Pengurutan --</option>
        <option value="judul">Judul (A-Z)</option>
        <option value="qty">Jumlah Stok</option>
        <option value="harga">Harga</option>
    </select>
</div>

<div class="filter-item filter-checkbox">
    <label>
        <input type="checkbox" v-model="filterReorder">
        Hanya tampilkan yang perlu Re-order
    </label>
    <small>(qty &lt; safety atau qty = 0)</small>
</div>
```

**Penjelasan:**
Sort menggunakan `<select>` dengan `v-model="sortBy"` — nilainya bisa kosong, "judul", "qty", atau "harga".

Filter re-order menggunakan `<input type="checkbox">` dengan `v-model="filterReorder"`. Karena checkbox, nilai variabelnya otomatis menjadi `true` atau `false`. Filter ini akan menampilkan hanya bahan ajar yang stoknya menipis atau habis — gunanya untuk mengingatkan staff agar segera melakukan re-order.

Tombol aksi:

```html
<div class="filter-actions">
    <button class="btn btn-secondary" @click="resetFilter">Reset Filter</button>
    <button class="btn btn-primary" @click="bukaFormTambah">+ Tambah Bahan Ajar</button>
</div>
```

**`@click`** adalah singkatan dari `v-on:click`. Tombol Reset memanggil method `resetFilter`, tombol Tambah memanggil `bukaFormTambah`.

```javascript
resetFilter: function () {
    this.filterUpbjj = '';
    this.filterKategori = '';
    this.filterReorder = false;
    this.sortBy = '';
    this.tampilkanNotifikasi('Filter telah direset', 'info');
},

bukaFormTambah: function () {
    this.modeForm = 'tambah';
    this.formData = {
        kode: '', judul: '', kategori: '', upbjj: '',
        lokasiRak: '', harga: 0, qty: 0, safety: 0, catatanHTML: ''
    };
    this.errors = {};
    this.formAktif = true;
},
```

**Penjelasan:**
`resetFilter` mengembalikan semua variabel filter ke nilai awal sekaligus. `bukaFormTambah` mengosongkan `formData`, menandai mode sebagai "tambah", membersihkan error, lalu mengaktifkan tampilan form (`formAktif = true`).

---

### 2.7 Form Tambah/Edit Bahan Ajar

```html
<section class="panel form-panel" v-if="formAktif">
    <h2 v-if="modeForm === 'tambah'">Tambah Bahan Ajar Baru</h2>
    <h2 v-else>Edit Bahan Ajar - {{ formData.kode }}</h2>

    <form @submit.prevent="simpanForm" class="form-grid" novalidate>
        <div class="form-item">
            <label for="f-kode">Kode Mata Kuliah <span class="req">*</span></label>
            <input id="f-kode" type="text" v-model.trim="formData.kode"
                :disabled="modeForm === 'edit'" placeholder="cth: EKMA4116">
            <span class="error" v-if="errors.kode" v-text="errors.kode"></span>
        </div>
        ...
```

**Penjelasan:**
Form ini punya beberapa hal penting:

- **`v-if="formAktif"`** — section form hanya tampil kalau ada permintaan tambah/edit.
- **`v-if="modeForm === 'tambah'"` dan `v-else`** — judul form berubah dinamis antara mode tambah dan edit.
- **`@submit.prevent="simpanForm"`** — modifier `.prevent` mencegah form reload halaman (default behavior browser), lalu memanggil method `simpanForm`.
- **`v-model.trim="formData.kode"`** — modifier `.trim` otomatis menghapus spasi di awal/akhir.
- **`:disabled="modeForm === 'edit'"`** — kalau mode edit, field Kode dinonaktifkan agar tidak bisa diubah (karena Kode adalah identitas unik).
- **`v-if="errors.kode"`** — pesan error hanya muncul kalau ada error pada field tersebut.

Untuk input angka:

```html
<input id="f-harga" type="number" min="0" v-model.number="formData.harga">
```

Modifier `.number` otomatis mengkonversi input string menjadi tipe data number — jadi `"65000"` jadi `65000`.

Untuk catatan HTML:

```html
<input id="f-catatan" type="text" v-model="formData.catatanHTML"
    placeholder="cth: <em>Edisi 2024</em>">
<small>Preview: <span v-html="formData.catatanHTML || '<i>(kosong)</i>'"></span></small>
```

**`v-html`** berbeda dengan mustaches biasa. Mustaches akan menampilkan tag HTML sebagai teks, sedangkan `v-html` merender-nya sebagai HTML asli. Sesuai permintaan soal yang menyebut field `catatanHTML`.

---

### 2.8 Validasi & Simpan Form

```javascript
validasiForm: function () {
    var e = {};
    var f = this.formData;

    if (!f.kode) e.kode = 'Kode wajib diisi.';
    else if (f.kode.length < 4) e.kode = 'Kode minimal 4 karakter.';
    else if (this.modeForm === 'tambah' && this.stok.some(function (it) { return it.kode === f.kode; })) {
        e.kode = 'Kode sudah digunakan.';
    }

    if (!f.judul) e.judul = 'Judul wajib diisi.';
    else if (f.judul.length < 3) e.judul = 'Judul minimal 3 karakter.';

    if (!f.kategori) e.kategori = 'Kategori wajib dipilih.';
    if (!f.upbjj) e.upbjj = 'UPBJJ wajib dipilih.';
    if (!f.lokasiRak) e.lokasiRak = 'Lokasi rak wajib diisi.';

    if (isNaN(f.harga) || f.harga < 0) e.harga = 'Harga harus angka >= 0.';
    if (isNaN(f.qty) || f.qty < 0) e.qty = 'Qty harus angka >= 0.';
    if (isNaN(f.safety) || f.safety < 0) e.safety = 'Safety stock harus angka >= 0.';

    this.errors = e;
    return Object.keys(e).length === 0;
}
```

**Penjelasan:**
Method `validasiForm` melakukan validasi sederhana sebelum data disimpan:
- Field wajib tidak boleh kosong
- Kode minimal 4 karakter, judul minimal 3 karakter
- Kode tidak boleh duplikat (hanya cek saat mode tambah)
- Angka tidak boleh negatif

Semua error dikumpulkan di object `e`, lalu disimpan ke `this.errors`. Fungsi return `true` kalau tidak ada error, `false` kalau ada.

```javascript
simpanForm: function () {
    if (!this.validasiForm()) {
        this.tampilkanNotifikasi('Form belum valid, periksa kembali isian.', 'error');
        return;
    }

    if (this.modeForm === 'tambah') {
        this.stok.push(Object.assign({}, this.formData));
        this.tampilkanNotifikasi('Bahan ajar baru berhasil ditambahkan!', 'success');
    } else {
        var idx = this.stok.findIndex(function (it) {
            return it.kode === this.formData.kode;
        }.bind(this));
        if (idx !== -1) {
            this.$set(this.stok, idx, Object.assign({}, this.formData));
            this.tampilkanNotifikasi('Bahan ajar ' + this.formData.kode + ' berhasil diperbarui!', 'success');
        }
    }

    this.formAktif = false;
}
```

**Penjelasan:**
Method `simpanForm` pertama-tama memanggil `validasiForm`. Kalau tidak valid, tampilkan toast error dan berhenti. Kalau valid:
- Mode "tambah" → push data baru ke array `stok`
- Mode "edit" → cari index data berdasarkan kode, lalu update pakai `this.$set` agar Vue mendeteksi perubahan dengan benar (reaktivitas)

`Object.assign({}, this.formData)` membuat copy object agar data form tidak nyangkut ke data stok.

---

### 2.9 Tabel Stok (List Rendering)

```html
<table class="data-table" v-if="stokTampil.length > 0">
    <thead>
        <tr>
            <th>Kode</th>
            <th>Judul</th>
            <th>Kategori</th>
            <th>UT-Daerah</th>
            <th>Lokasi Rak</th>
            <th class="num">Qty</th>
            <th class="num">Safety</th>
            <th class="num">Harga</th>
            <th>Status</th>
            <th>Catatan</th>
            <th>Aksi</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="item in stokTampil" :key="item.kode">
            <td v-text="item.kode"></td>
            <td>{{ item.judul }}</td>
            <td>{{ item.kategori }}</td>
            <td>{{ item.upbjj }}</td>
            <td>{{ item.lokasiRak }}</td>
            <td class="num">{{ item.qty }}</td>
            <td class="num">{{ item.safety }}</td>
            <td class="num">{{ formatRupiah(item.harga) }}</td>
```

**Penjelasan:**
Tabel hanya ditampilkan kalau `stokTampil` punya data (`v-if`). Kalau tidak, akan muncul empty state (lihat bagian berikutnya).

Sengaja saya gunakan beberapa cara menampilkan data agar lengkap menjawab kriteria penilaian 1.2:
- **`v-text="item.kode"`** untuk kolom Kode
- **`{{ item.judul }}`** (mustaches) untuk kolom-kolom lain
- **`{{ formatRupiah(item.harga) }}`** memanggil method `formatRupiah` agar angka tampil sebagai "Rp 65.000"

Kolom Status menggunakan conditional v-if/v-else-if/v-else:

```html
<td>
    <span v-if="statusStok(item) === 'Kosong'" class="status status-kosong">
        Kosong
    </span>
    <span v-else-if="statusStok(item) === 'Menipis'" class="status status-menipis">
        Menipis
    </span>
    <span v-else class="status status-aman">
        Aman
    </span>
</td>
```

**Penjelasan:**
Ini implementasi **conditional rendering**. Untuk setiap baris, status diambil dari method `statusStok` di JS:

```javascript
statusStok: function (item) {
    if (item.qty === 0) return 'Kosong';
    if (item.qty < item.safety) return 'Menipis';
    return 'Aman';
}
```

Method ini menerima parameter `item` (baris yang sedang dirender), lalu mengembalikan string sesuai logika: Kosong kalau qty 0, Menipis kalau qty di bawah safety, sisanya Aman.

Kenapa pakai method, bukan computed? Karena fungsinya butuh **parameter berbeda untuk setiap baris**. Computed tidak menerima parameter, sedangkan method bisa.

Kolom Catatan:

```html
<td><span v-html="item.catatanHTML"></span></td>
```

Saya pakai **`v-html`** karena `catatanHTML` di data dummy berisi tag HTML seperti `<em>Edisi 2024</em>` atau `<strong>Cover baru</strong>`. Kalau pakai mustaches, tag-nya akan tampil sebagai teks mentah, bukan format yang sebenarnya.

Kolom Aksi:

```html
<td>
    <button class="btn btn-small btn-edit" @click="bukaFormEdit(item)">Edit</button>
</td>
```

`@click="bukaFormEdit(item)"` memanggil method dengan parameter `item` (data baris yang ditekan), sehingga form bisa terisi otomatis dengan data tersebut:

```javascript
bukaFormEdit: function (item) {
    this.modeForm = 'edit';
    this.formData = Object.assign({}, item);
    this.errors = {};
    this.formAktif = true;
    window.scrollTo({ top: 200, behavior: 'smooth' });
}
```

---

### 2.10 Empty State

```html
<div v-else class="empty-state">
    <p>Tidak ada data yang sesuai dengan filter.</p>
</div>
```

**Penjelasan:**
`v-else` ini pasangan dari `v-if="stokTampil.length > 0"` di tag `<table>` sebelumnya. Kalau hasil filter kosong, pengguna mendapat pesan yang ramah, bukan tabel kosong yang membingungkan.

---

## BAGIAN 3 — `js/stok-app.js` (Logika Vue untuk Stok)

Sekarang masuk ke file logika. Struktur Vue.js umumnya terdiri dari 4 bagian: `data`, `computed`, `watch`, dan `methods`.

### 3.1 Mengambil Data & Inisialisasi Vue

```javascript
var data = window.dataBahanAjar;

var stokApp = new Vue({
    el: '#app',
    data: {
        upbjjList: data.upbjjList,
        kategoriList: data.kategoriList,
        stok: data.stok,

        filterUpbjj: '',
        filterKategori: '',
        filterReorder: false,
        sortBy: '',

        formAktif: false,
        modeForm: 'tambah',
        formData: { kode: '', judul: '', ... },
        errors: {},

        notifikasi: null,
        timerNotifikasi: null
    },
```

**Penjelasan:**
Baris pertama `var data = window.dataBahanAjar` mengambil data dummy yang sudah disiapkan di file `dataBahanAjar.js`. Saya simpan di window agar bisa dipakai bersama oleh halaman tracking juga, tanpa duplikasi data.

`el: '#app'` artinya Vue akan mengelola elemen dengan id="app" — sama dengan div pembungkus di HTML.

Property `data` berisi semua state aplikasi:
- **3 array master** (upbjjList, kategoriList, stok) — diambil dari data dummy
- **4 variabel filter** (filterUpbjj, filterKategori, filterReorder, sortBy) — kosong di awal
- **State form** (formAktif, modeForm, formData, errors) — formAktif false agar form tidak muncul saat halaman pertama dibuka
- **State notifikasi** (notifikasi, timerNotifikasi) — untuk toast

---

### 3.2 Computed Property Utama: `stokTampil`

```javascript
computed: {
    stokTampil: function () {
        var hasil = this.stok.slice();

        if (this.filterUpbjj) {
            hasil = hasil.filter(function (it) {
                return it.upbjj === this.filterUpbjj;
            }.bind(this));
        }

        if (this.filterUpbjj && this.filterKategori) {
            hasil = hasil.filter(function (it) {
                return it.kategori === this.filterKategori;
            }.bind(this));
        }

        if (this.filterReorder) {
            hasil = hasil.filter(function (it) {
                return it.qty === 0 || it.qty < it.safety;
            });
        }

        if (this.sortBy === 'judul') {
            hasil.sort(function (a, b) { return a.judul.localeCompare(b.judul); });
        } else if (this.sortBy === 'qty') {
            hasil.sort(function (a, b) { return a.qty - b.qty; });
        } else if (this.sortBy === 'harga') {
            hasil.sort(function (a, b) { return a.harga - b.harga; });
        }

        return hasil;
    },
    ...
}
```

**Penjelasan:**
Ini adalah jantung halaman stok. Computed `stokTampil` adalah hasil akhir setelah semua filter dan sort diterapkan.

Alurnya:
1. **Copy array** dengan `.slice()` agar tidak mengubah data asli.
2. **Filter UPBJJ** — kalau filterUpbjj diisi, ambil hanya yang UPBJJ-nya cocok.
3. **Filter Kategori** — hanya berjalan kalau UPBJJ juga sudah dipilih (dependent options).
4. **Filter Re-order** — kalau checkbox aktif, ambil hanya yang qty 0 atau qty < safety.
5. **Sort** — urutkan sesuai pilihan: judul (alfabetis), qty (kecil ke besar), harga (murah ke mahal).

Karena ini computed, Vue otomatis melakukan **caching**. Selama tidak ada filter atau sortBy yang berubah, hasilnya disimpan dan dipakai ulang. Inilah jawaban soal "filter tidak perlu recompute kembali".

`.bind(this)` digunakan karena di dalam fungsi callback `.filter()`, kata `this` berubah konteksnya. Dengan `.bind(this)`, kita memastikan `this` tetap merujuk ke Vue instance.

---

### 3.3 Watcher (Minimal 2)

```javascript
watch: {
    filterUpbjj: function (nilaiBaru, nilaiLama) {
        if (!nilaiBaru) {
            this.filterKategori = '';
        }
        if (nilaiBaru !== nilaiLama && nilaiBaru) {
            this.tampilkanNotifikasi('Filter UPBJJ diubah ke: ' + nilaiBaru, 'info');
        }
    },

    stok: {
        deep: true,
        handler: function () {
            var kritis = this.stok.filter(function (it) { return it.qty === 0; });
            if (kritis.length > 0) {
                console.warn('[SITTA] Ada ' + kritis.length + ' bahan ajar dengan stok kosong, segera re-order.');
            }
        }
    },

    'formData.qty': function (val) {
        if (typeof val === 'number' && val < 0) this.formData.qty = 0;
    },
    'formData.safety': function (val) {
        if (typeof val === 'number' && val < 0) this.formData.safety = 0;
    }
}
```

**Penjelasan:**
Soal meminta minimal 2 watcher, saya pasang 4 untuk halaman stok:

**Watcher 1 — `filterUpbjj`**
Memantau perubahan filter UPBJJ. Setiap kali UPBJJ berubah, fungsi ini dijalankan dengan parameter `nilaiBaru` dan `nilaiLama`. Kalau pengguna mengosongkan UPBJJ, filter Kategori juga ikut dikosongkan agar konsisten. Kalau UPBJJ diganti ke nilai baru, muncul notifikasi info.

**Watcher 2 — `stok` (deep watch)**
Memantau seluruh isi array `stok`. Property `deep: true` artinya Vue ikut memantau perubahan di dalam tiap object, bukan hanya kalau seluruh array diganti. Setiap kali ada perubahan qty di stok, watcher mengecek apakah ada bahan ajar yang stoknya 0, dan menampilkan peringatan di console.

**Watcher 3 & 4 — `formData.qty` dan `formData.safety`**
Menggunakan path notation (string dengan tanda kutip karena ada titik). Watcher ini mencegah pengguna memasukkan angka negatif — kalau diketik nilai minus, langsung dijadikan 0.

---

### 3.4 Methods Pendukung

```javascript
methods: {
    statusStok: function (item) {
        if (item.qty === 0) return 'Kosong';
        if (item.qty < item.safety) return 'Menipis';
        return 'Aman';
    },

    formatRupiah: function (angka) {
        if (typeof angka !== 'number') return angka;
        return 'Rp ' + angka.toLocaleString('id-ID');
    },
    ...
}
```

**Penjelasan:**
- **`statusStok(item)`** — sudah dibahas tadi. Menentukan label status untuk setiap baris.
- **`formatRupiah(angka)`** — mengubah angka 65000 menjadi "Rp 65.000" dengan locale Indonesia.
- **`resetFilter`**, **`bukaFormTambah`**, **`bukaFormEdit`**, **`batalForm`**, **`simpanForm`**, **`validasiForm`** — sudah dibahas di bagian HTML masing-masing.
- **`tampilkanNotifikasi`** — sudah dibahas di bagian toast.

---

## BAGIAN 4 — `tracking.html` (Halaman Tracking DO)

### 4.1 Pembungkus & Pencarian DO

```html
<div id="app" class="container">
    ...
    <section class="panel">
        <h2>Lacak Status DO</h2>
        <div class="filter-grid">
            <div class="filter-item filter-item-wide">
                <label for="cari-do">Masukkan Nomor DO</label>
                <input id="cari-do" type="text" v-model.trim="kataKunci"
                       placeholder="cth: DO2025-0001">
            </div>
            <div class="filter-item">
                <label>&nbsp;</label>
                <button class="btn btn-secondary" @click="kataKunci = ''">Bersihkan</button>
            </div>
        </div>

        <p class="info-hasil">
            Menampilkan <strong>{{ daftarDOTampil.length }}</strong> dari {{ daftarDO.length }} DO.
        </p>
    </section>
```

**Penjelasan:**
Input pencarian DO terikat ke variabel `kataKunci` melalui `v-model.trim`. Tombol "Bersihkan" pakai inline handler `@click="kataKunci = ''"` — boleh juga method, tapi karena sederhana saya tulis langsung.

Teks "Menampilkan X dari Y" mengambil panjang array dari `daftarDOTampil` (hasil filter pencarian) dan `daftarDO` (data lengkap).

---

### 4.2 Daftar DO (Kartu)

```html
<section class="panel" v-if="daftarDOTampil.length > 0">
    <h2>Daftar Delivery Order</h2>
    <div class="do-list">
        <article v-for="do_ in daftarDOTampil" :key="do_.nomor" class="do-card">
            <header class="do-header">
                <div>
                    <h3>{{ do_.nomor }}</h3>
                    <small>{{ do_.tanggalKirim }}</small>
                </div>
                <span class="badge"
                      :class="{
                        'badge-jalan': do_.status === 'Dalam Perjalanan',
                        'badge-sampai': do_.status === 'Sampai Tujuan',
                        'badge-proses': do_.status === 'Diproses'
                      }">
                    {{ do_.status }}
                </span>
            </header>
```

**Penjelasan:**
Saya gunakan nama variabel `do_` (dengan underscore) karena `do` adalah kata kunci JavaScript yang dipesan.

Bagian penting di sini adalah **class binding dengan object syntax**:

```html
:class="{
    'badge-jalan': do_.status === 'Dalam Perjalanan',
    'badge-sampai': do_.status === 'Sampai Tujuan',
    'badge-proses': do_.status === 'Diproses'
}"
```

Vue akan otomatis menambahkan class kalau kondisinya `true`. Jadi badge berubah warna sesuai status DO — biru untuk "Dalam Perjalanan", hijau untuk "Sampai Tujuan", kuning untuk "Diproses".

---

### 4.3 Body Kartu & Timeline

```html
<div class="do-body">
    <div class="do-info">
        <p><strong>NIM:</strong> {{ do_.nim }}</p>
        <p><strong>Nama:</strong> {{ do_.nama }}</p>
        <p><strong>Ekspedisi:</strong> {{ do_.ekspedisi }}</p>
        <p><strong>Paket:</strong> {{ do_.paket }} - {{ namaPaket(do_.paket) }}</p>
        <p><strong>Total:</strong> {{ formatRupiah(do_.total) }}</p>
    </div>

    <div class="do-tracking">
        <h4>Riwayat Perjalanan</h4>
        <ul class="timeline" v-if="do_.perjalanan && do_.perjalanan.length > 0">
            <li v-for="(jejak, idx) in do_.perjalanan" :key="idx">
                <span class="timeline-time">{{ jejak.waktu }}</span>
                <span class="timeline-desc" v-text="jejak.keterangan"></span>
            </li>
        </ul>
        <p v-else class="text-muted">Belum ada riwayat perjalanan.</p>
    </div>
</div>
```

**Penjelasan:**
Setiap kartu DO menampilkan dua kolom: info pemesan di kiri, riwayat perjalanan di kanan.

- `{{ namaPaket(do_.paket) }}` — memanggil method `namaPaket(kode)` untuk mencari nama paket dari kode. Kalau cuma tampilkan "PAKET-UT-001" rasanya kurang informatif, jadi saya tambahkan nama paket di sebelahnya.
- **`v-for="(jejak, idx) in do_.perjalanan"`** — perhatikan ada index `idx`. Index dipakai untuk `:key` karena nilai `waktu` saja bisa duplikat.
- **`v-if`/`v-else`** — kalau ada riwayat tampil timeline, kalau tidak tampil pesan "Belum ada riwayat".

---

### 4.4 Form Tambah DO

```html
<section class="panel form-panel">
    <h2>Tambah Delivery Order Baru</h2>

    <form @submit.prevent="simpanDO" class="form-grid" novalidate>
        <div class="form-item">
            <label>Nomor DO (otomatis)</label>
            <input type="text" :value="nomorDOBaru" disabled>
            <small>Format: DO{Tahun}-{Sequence}</small>
        </div>
```

**Penjelasan:**
Field "Nomor DO" pakai **`:value="nomorDOBaru"`** (v-bind ke value), bukan `v-model`. Karena nilainya otomatis dari computed property, dan kita tidak mau pengguna mengubahnya. Atribut `disabled` mengunci input agar read-only.

```html
<div class="form-item">
    <label for="f-paket">Paket Bahan Ajar <span class="req">*</span></label>
    <select id="f-paket" v-model="form.paket">
        <option value="">-- Pilih Paket --</option>
        <option v-for="p in paket" :key="p.kode" :value="p.kode">
            {{ p.kode }} - {{ p.nama }}
        </option>
    </select>
    <span class="error" v-if="errors.paket" v-text="errors.paket"></span>

    <div v-if="paketTerpilih" class="paket-detail">
        <h4>Detail Paket: {{ paketTerpilih.nama }}</h4>
        <p><strong>Kode:</strong> {{ paketTerpilih.kode }}</p>
        <p><strong>Isi Paket:</strong></p>
        <ul>
            <li v-for="kodeMK in paketTerpilih.isi" :key="kodeMK">
                {{ kodeMK }} <span v-if="judulMK(kodeMK)">— {{ judulMK(kodeMK) }}</span>
            </li>
        </ul>
        <p><strong>Harga Paket:</strong> {{ formatRupiah(paketTerpilih.harga) }}</p>
    </div>
</div>
```

**Penjelasan:**
Sesuai permintaan soal:
- `<select>` menampilkan kode paket dan nama paket → `{{ p.kode }} - {{ p.nama }}`
- Setelah memilih paket, **detail isi paket muncul di bawah `<select>`** → diatur oleh `v-if="paketTerpilih"`

`paketTerpilih` adalah computed yang mencari object paket dari kode yang dipilih. Kalau belum ada yang dipilih, hasilnya null, dan div detail tidak muncul.

Di dalam detail, `v-for` mengulang `paketTerpilih.isi` (daftar kode MK), lalu untuk tiap kode dipanggil method `judulMK(kodeMK)` agar tampil judul mata kuliahnya juga.

Field tanggal:

```html
<div class="form-item">
    <label for="f-tgl">Tanggal Kirim <span class="req">*</span></label>
    <input id="f-tgl" type="date" v-model="form.tanggalKirim">
    <button type="button" class="btn btn-small btn-secondary" @click="isiTanggalHariIni">
        Gunakan Tanggal Hari Ini
    </button>
    <span class="error" v-if="errors.tanggalKirim" v-text="errors.tanggalKirim"></span>
</div>
```

**Penjelasan:**
Pengguna bisa isi manual lewat date picker, atau klik tombol untuk auto-fill tanggal hari ini menggunakan `new Date()` (lihat method `isiTanggalHariIni` nanti).

Field total:
```html
<input type="text" :value="formatRupiah(form.total)" disabled>
```
Disabled karena diisi otomatis oleh watcher saat paket dipilih.

---

## BAGIAN 5 — `js/tracking-app.js` (Logika Vue untuk Tracking)

### 5.1 Data Awal & Konversi Object ke Array

```javascript
var data = window.dataBahanAjar;

var trackingApp = new Vue({
    el: '#app',
    data: {
        pengirimanList: data.pengirimanList,
        paket: data.paket,
        stok: data.stok,

        daftarDO: Object.keys(data.tracking).map(function (nomor) {
            var t = data.tracking[nomor];
            return {
                nomor: nomor,
                nim: t.nim,
                nama: t.nama,
                status: t.status,
                ekspedisi: t.ekspedisi,
                tanggalKirim: t.tanggalKirim,
                paket: t.paket,
                total: t.total,
                perjalanan: t.perjalanan
            };
        }),

        kataKunci: '',
        form: { nim: '', nama: '', ekspedisi: '', paket: '', tanggalKirim: '', total: 0 },
        errors: {},
        notifikasi: null,
        timerNotifikasi: null
    },
```

**Penjelasan:**
Di data dummy, `tracking` berupa object dengan key nomor DO. Tapi untuk merender list di Vue, kita lebih nyaman pakai array. Jadi saya konversi pakai `Object.keys().map()`:
- `Object.keys(data.tracking)` menghasilkan `["DO2025-0001"]`
- `.map()` menjadikannya array of object dengan field `nomor` ditambahkan dari key.

Hasilnya bisa langsung di-`v-for` dan dimanipulasi (push DO baru, dll).

---

### 5.2 Computed `nomorDOBaru`

```javascript
computed: {
    nomorDOBaru: function () {
        var tahun = new Date().getFullYear();
        var prefix = 'DO' + tahun + '-';

        var seqMax = 0;
        this.daftarDO.forEach(function (d) {
            if (d.nomor.indexOf(prefix) === 0) {
                var seq = parseInt(d.nomor.substring(prefix.length), 10);
                if (!isNaN(seq) && seq > seqMax) seqMax = seq;
            }
        });

        var seqBaru = (seqMax + 1).toString().padStart(4, '0');
        return prefix + seqBaru;
    },
    ...
}
```

**Penjelasan:**
Ini computed yang menghasilkan Nomor DO otomatis sesuai format soal: `DO{Tahun}-{Sequence}`.

Algoritmanya:
1. Ambil tahun sekarang dengan `new Date().getFullYear()`.
2. Buat prefix, misal "DO2025-".
3. Loop semua daftarDO, ambil sequence dari nomor yang prefix-nya cocok.
4. Cari sequence terbesar, lalu tambah 1.
5. Format jadi 4 digit dengan `.padStart(4, '0')` → "0002" bukan "2".

Jadi kalau sudah ada DO2025-0001, yang berikutnya otomatis DO2025-0002, lalu DO2025-0003, dan seterusnya.

---

### 5.3 Computed `paketTerpilih` & `daftarDOTampil`

```javascript
paketTerpilih: function () {
    var kode = this.form.paket;
    if (!kode) return null;
    return this.paket.find(function (p) { return p.kode === kode; }) || null;
},

daftarDOTampil: function () {
    if (!this.kataKunci) return this.daftarDO;
    var k = this.kataKunci.toLowerCase();
    return this.daftarDO.filter(function (d) {
        return d.nomor.toLowerCase().indexOf(k) !== -1 ||
               (d.nama && d.nama.toLowerCase().indexOf(k) !== -1) ||
               (d.nim && d.nim.toLowerCase().indexOf(k) !== -1);
    });
}
```

**Penjelasan:**
**`paketTerpilih`** mencari object paket lengkap berdasarkan kode yang dipilih di form. Hasilnya null kalau belum ada pilihan. Computed ini dipakai untuk menampilkan detail paket di bawah `<select>`.

**`daftarDOTampil`** menyaring daftar DO berdasarkan kata kunci pencarian. Pencariannya tidak case-sensitive (`.toLowerCase()`) dan mencakup tiga field: nomor DO, nama, dan NIM. Ini memberikan pengalaman pencarian yang lebih fleksibel.

---

### 5.4 Watcher

```javascript
watch: {
    'form.paket': function (kodeBaru) {
        if (!kodeBaru) {
            this.form.total = 0;
            return;
        }
        var p = this.paket.find(function (it) { return it.kode === kodeBaru; });
        if (p) {
            this.form.total = p.harga;
            this.tampilkanNotifikasi('Total harga otomatis: ' + this.formatRupiah(p.harga), 'info');
        }
    },

    'form.nim': function (val) {
        if (val && /\D/.test(val)) {
            this.form.nim = val.replace(/\D/g, '');
        }
    },

    kataKunci: function (baru) {
        if (baru && this.daftarDOTampil.length === 0) {
            console.log('[SITTA] Tidak ada DO yang cocok dengan "' + baru + '"');
        }
    }
}
```

**Penjelasan:**

**Watcher 1 — `form.paket`**
Sesuai permintaan soal: total harga otomatis terisi dari `paket.harga` setelah paket dipilih. Saya pakai watcher karena efek yang diinginkan adalah **men-set property lain** (`form.total`). Kalau pakai computed, kita tidak bisa "men-set", hanya bisa "menghitung dan mengembalikan".

**Watcher 2 — `form.nim`**
Sanitasi NIM agar hanya berisi angka. Regex `/\D/` cocok dengan karakter non-digit. Setiap kali user mengetik, kalau ada huruf akan langsung dihapus.

**Watcher 3 — `kataKunci`**
Mencatat ke console kalau pencarian tidak ada hasilnya. Berguna untuk debugging.

---

### 5.5 Method `isiTanggalHariIni` & `simpanDO`

```javascript
isiTanggalHariIni: function () {
    var now = new Date();
    var yyyy = now.getFullYear();
    var mm = (now.getMonth() + 1).toString().padStart(2, '0');
    var dd = now.getDate().toString().padStart(2, '0');
    this.form.tanggalKirim = yyyy + '-' + mm + '-' + dd;
    this.tampilkanNotifikasi('Tanggal kirim diisi otomatis', 'info');
}
```

**Penjelasan:**
Sesuai permintaan soal yang menyebut "menggunakan fungsi Date untuk mengambil local time". Hasilnya diformat YYYY-MM-DD karena itu format yang diterima oleh `<input type="date">`.

```javascript
simpanDO: function () {
    if (!this.validasi()) {
        this.tampilkanNotifikasi('Form belum valid, periksa kembali isian.', 'error');
        return;
    }

    var doBaru = {
        nomor: this.nomorDOBaru,
        nim: this.form.nim,
        nama: this.form.nama,
        status: 'Diproses',
        ekspedisi: this.form.ekspedisi,
        tanggalKirim: this.form.tanggalKirim,
        paket: this.form.paket,
        total: this.form.total,
        perjalanan: [
            { waktu: this.waktuSekarang(), keterangan: 'DO dibuat dan diterima sistem' }
        ]
    };

    this.daftarDO.unshift(doBaru);
    this.tampilkanNotifikasi('DO ' + doBaru.nomor + ' berhasil dibuat!', 'success');
    this.resetForm();
}
```

**Penjelasan:**
Validasi dulu, kalau gagal hentikan. Kalau lolos, buat object DO baru. Nomor diambil dari computed `nomorDOBaru` (auto-generate). Status default-nya "Diproses" karena DO baru saja masuk. Saya juga tambahkan satu jejak perjalanan awal: "DO dibuat dan diterima sistem".

`.unshift()` memasukkan DO baru ke posisi paling depan array, agar muncul di paling atas daftar.

---

## BAGIAN 6 — `js/dataBahanAjar.js` (Sumber Data Dummy)

Ini adalah file paling sederhana — hanya berisi data dummy yang dipakai bersama oleh stok-app.js dan tracking-app.js.

```javascript
window.dataBahanAjar = {
    upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],

    kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],

    pengirimanList: [
        { kode: "REG", nama: "JNE Reguler (3-5 hari)" },
        { kode: "EXP", nama: "JNE Ekspres (1-2 hari)" }
    ],

    paket: [
        { kode: "PAKET-UT-001", nama: "PAKET IPS Dasar", isi: ["EKMA4116", "EKMA4115"], harga: 120000 },
        { kode: "PAKET-UT-002", nama: "PAKET IPA Dasar", isi: ["BIOL4201", "FISIP4001"], harga: 140000 }
    ],

    stok: [
        {
            kode: "EKMA4116",
            judul: "Pengantar Manajemen",
            kategori: "MK Wajib",
            upbjj: "Jakarta",
            lokasiRak: "R1-A3",
            harga: 65000,
            qty: 28,
            safety: 20,
            catatanHTML: "<em>Edisi 2024, cetak ulang</em>"
        },
        ...
    ],

    tracking: {
        "DO2025-0001": {
            nim: "123456789",
            nama: "Rina Wulandari",
            status: "Dalam Perjalanan",
            ekspedisi: "JNE Reguler",
            tanggalKirim: "2025-08-25",
            paket: "PAKET-UT-001",
            total: 120000,
            perjalanan: [
                { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGSEL" },
                ...
            ]
        }
    }
};
```

**Penjelasan:**
Semua data disimpan dalam satu object dan ditempel ke `window.dataBahanAjar` agar bisa diakses dari mana saja. Strukturnya sama persis dengan template di lampiran soal:

- **`upbjjList`** — array string, daftar 5 kantor UPBJJ UT.
- **`kategoriList`** — array string, kategori mata kuliah.
- **`pengirimanList`** — array of object, masing-masing punya kode dan nama ekspedisi.
- **`paket`** — array of object paket bahan ajar, lengkap dengan kode, nama, isi (list kode MK), dan harga.
- **`stok`** — array of object bahan ajar dengan field-field sesuai soal: kode, judul, kategori, upbjj, lokasiRak, harga, qty, safety, dan catatanHTML.
- **`tracking`** — object dengan key nomor DO. Setiap DO punya info pemesan, status, ekspedisi, paket, total, dan array perjalanan.

Karena disimpan di `window`, file ini cukup di-load sekali di `<script>` sebelum file aplikasi, dan langsung tersedia.

---

## BAGIAN 7 — `css/style.css` (Styling)

Saya jelaskan singkat saja karena fokus tugas ini di logika Vue.js. CSS-nya saya bagi menjadi beberapa blok.

### 7.1 Reset & Layout Dasar

```css
* { box-sizing: border-box; }

html, body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, sans-serif;
    background: #f4f6fa;
    color: #2b2d42;
    line-height: 1.5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}
```

**Penjelasan:**
`box-sizing: border-box` agar lebar element memperhitungkan padding. Container dibatasi 1200px dan ditengahkan dengan `margin: 0 auto`. Background abu-abu lembut agar kartu putih di atasnya terlihat menonjol.

---

### 7.2 Grid Layout untuk Filter & Form

```css
.filter-grid, .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin-bottom: 14px;
}
```

**Penjelasan:**
CSS Grid dengan `auto-fit` dan `minmax(220px, 1fr)` membuat layout otomatis menyesuaikan lebar layar. Di layar besar bisa 4 kolom, di tablet jadi 2 kolom, di HP jadi 1 kolom — tanpa media query khusus.

---

### 7.3 Warna Status (Aman, Menipis, Kosong)

```css
.status-aman {
    background: #d4edda;
    color: #1e7e4f;
}
.status-menipis {
    background: #fff3cd;
    color: #b16a14;
}
.status-kosong {
    background: #f8d7da;
    color: #b02a37;
}
```

**Penjelasan:**
Sesuai permintaan soal: hijau untuk aman, orange untuk menipis (saya pakai kuning yang lebih lembut), merah untuk kosong. Background dan teks kontras agar tetap terbaca.

---

### 7.4 Toast Notifikasi

```css
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: #fff;
    z-index: 1000;
    animation: slideIn .3s ease;
}
.toast-success { background: #2a9d8f; }
.toast-error { background: #e63946; }
.toast-info { background: #457b9d; }

@keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
}
```

**Penjelasan:**
Toast diposisikan fixed di pojok kanan atas. Animasi `slideIn` membuatnya geser masuk dari kanan dengan efek fade. Z-index tinggi agar selalu di atas elemen lain.

---

### 7.5 Timeline (Riwayat DO)

```css
.timeline {
    list-style: none;
    border-left: 2px solid #457b9d;
    padding-left: 14px;
}
.timeline li::before {
    content: '';
    position: absolute;
    left: -19px;
    top: 6px;
    width: 8px;
    height: 8px;
    background: #457b9d;
    border-radius: 50%;
}
```

**Penjelasan:**
Garis vertikal dari border-left, lalu titik bulat untuk tiap item dibuat dari `::before` dengan `position: absolute`. Efeknya seperti timeline pelacakan paket.

---

### 7.6 Responsive

```css
@media (max-width: 768px) {
    .do-body { grid-template-columns: 1fr; }
    .topnav { flex-direction: column; gap: 10px; }
    .data-table { font-size: .85rem; }
}
```

**Penjelasan:**
Pada layar di bawah 768px, kartu DO yang tadinya 2 kolom jadi 1 kolom, navbar jadi vertikal, dan ukuran teks tabel diperkecil agar tetap muat.

---

## RINGKASAN PENERAPAN KRITERIA

| Kriteria Soal | Implementasi di Code |
|---|---|
| Mustaches | `{{ jumlahAman }}`, `{{ item.judul }}`, dst |
| v-text | `<td v-text="item.kode">`, `<span v-text="errors.kode">` |
| v-html | `<td><span v-html="item.catatanHTML"></span></td>` |
| v-if / v-else-if / v-else | Status stok (Kosong/Menipis/Aman), v-if dependent filter |
| v-show | Tidak dipakai karena v-if lebih sesuai (kondisi jarang berubah) |
| v-bind | `:disabled`, `:value`, `:class`, `:key` |
| v-model | Semua input form (`v-model.trim`, `v-model.number`) |
| Computed property | `stokTampil`, `jumlahAman`, `nomorDOBaru`, `paketTerpilih`, dst |
| Methods | `statusStok`, `formatRupiah`, `validasiForm`, `simpanDO`, dst |
| Watcher | `filterUpbjj`, `stok` (deep), `form.paket`, `form.nim`, total 6 watcher |
| Form & validasi | Form tambah/edit stok, form DO, errors per field |

**Penutup:**
"Demikian penjelasan dari sisi code untuk Tugas Praktik 2 ini. Saya sudah berusaha menerapkan semua fitur Vue.js yang sudah kita pelajari dan menyesuaikan dengan kebutuhan SITTA UT seperti yang diminta soal. Terima kasih."
