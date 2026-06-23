# 📱 Panduan Lengkap: Solusi & Langkah Build APK Toko Sipil Official

Berikut adalah panduan solusi atas kendala yang Anda hadapi dan langkah-langkah detail untuk memasang logo serta mencetak biner APK di komputer lokal Anda.

---

## 🎯 Solusi 1: Mengapa Aplikasi Otomatis Terbuka di Google Chrome?

### Penyebab:
Secara bawaan (*default*), Capacitor akan membuka alamat web eksternal (menggunakan `http://` atau `https://`) menggunakan browser bawaan sistem HP (seperti Chrome) demi keamanan jika domain tersebut tidak didaftarkan di konfigurasi internal aplikasi.

### Solusi Permanen (Sudah Diperbarui):
Saya telah memperbarui file konfigurasi di server Anda (`capacitor.config.json`) menjadi seperti berikut agar WebView di aplikasi memuat website Anda secara penuh tanpa keluar ke Chrome:

```json
{
  "appId": "com.tokosipil.official",
  "appName": "Toko Sipil Official",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "url": "https://toko-sipil-59600137609.asia-southeast1.run.app",
    "allowNavigation": [
      "toko-sipil-59600137609.asia-southeast1.run.app",
      "ais-dev-ao4ij3eqewiigwwcl4kr6t-934223265379.asia-southeast1.run.app"
    ]
  }
}
```

**Langkah Anda di komputer lokal:**
Silakan salin isi konfigurasi di atas ke file `capacitor.config.json` di komputer Anda, lalu jalankan sinkronisasi ulang di Terminal:
```bash
npx cap sync android
```

---

## 🛠️ Solusi 2: Android Studio Tidak Terbuka Otomatis

### Penyebab:
Perintah `npx cap open android` membutuhkan Android Studio terinstal di jalur (*default path*) sistem operasi Anda. Jika tidak ditemukan, perintah tersebut akan gagal meluncurkannya secara otomatis.

### Solusi Mudah:
Anda tidak harus membukanya lewat terminal! Anda bisa membukanya secara manual:
1. Jalankan aplikasi **Android Studio** dari desktop / start menu PC Anda.
2. Pilih menu **File > Open** atau klik **Open** di halaman selamat datang.
3. Arahkan dan pilih folder **`android`** yang berada di dalam folder proyek Anda (`C:\Users\Acer\Downloads\toko-sipilf\android`).
4. Klik **OK** dan tunggu proses sinkronisasi Gradle (biasanya muncul bar loading di kanan bawah) selesai sepenuhnya.

---

## 🎨 Solusi 3: Cara Memasang Logo Toko Sipil ke Aplikasi (Ikon Aplikasi)

Gunakan metode **Image Asset Studio** bawaan di Android Studio. Cara ini adalah yang paling cepat, rapi, dan otomatis menyesuaikan bentuk lingkaran, persegi, maupun squircle di semua jenis HP Android.

### Langkah-langkah:
1. Simpan logo yang Anda unggah di atas ke komputer Anda (beri nama misalnya `logo.png`).
2. Di sebelah kiri Android Studio, ubah tampilan struktur proyek dari **Android** menjadi **Project** (agar file terlihat jelas) atau biarkan tetap Android.
3. Klik kanan pada folder **`app`** (atau folder `res` di dalam `app/src/main/res`), lalu pilih:
   👉 **New > Image Asset**
4. Di jendela konfigurasi yang terbuka, atur parameter berikut:
   - **Icon Type:** `Launcher Icons (Adaptive and Legacy)`
   - **Name:** `ic_launcher` (biarkan default)
   - **Asset Type:** Pilih `Image`
   - **Path:** Klik ikon folder di sebelah kanannya, lalu cari dan pilih berkas `logo.png` Anda.
   - **Resize:** Geser persentase ke kiri atau kanan (misal ke `60%` atau `70%`) agar gambar logo Anda berada pas di dalam lingkaran aman (*safe zone*), tidak terpotong.
5. Klik tab **Background Layer**:
   - **Asset Type:** Pilih **Color**
   - **Color:** Masukkan warna putih (`#ffffff`) atau warna biru gelap elegan (`#0b2545`) sesuai dengan warna logo Anda agar latarnya menyatu indah.
6. Klik **Next**, lalu klik **Finish**.
7. Selesai! Semua ukuran ikon di HP Android sekarang sudah otomatis terbuat menggunakan gambar logo baru Anda.

---

## 📦 Solusi 4: Cara Mencetak APK (Build APK) di Android Studio

Setelah aset disinkronisasi dan logo selesai dipasang, ikuti langkah berikut untuk menghasilkan file `.apk` siap pasang ke publik:

1. Pada menu toolbar bagian atas di Android Studio, pilih menu:
   👉 **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
2. Tunggu beberapa saat (Android Studio sedang menyusun file). Anda bisa melihat progresnya di tab **Build** di pojok bawah.
3. Jika sudah selesai, di pojok kanan bawah komputer akan muncul kotak dialog pop-up bertuliskan:
   🎉 **"APK(s) generated successfully for 1 module"**
4. Klik tautan teks berwarna biru bertuliskan **"locate"** di dalam dialog pop-up tersebut.
5. Windows File Explorer Anda akan otomatis terbuka dan mengarahkan Anda ke lokasi file APK hasil buatan Anda.
6. File tersebut bernama **`app-debug.apk`**.

---

## 🚀 Langkah Terakhir (Publikasi ke Publik)

1. Ubah nama file **`app-debug.apk`** menjadi nama aplikasi resmi Anda, misalnya: **`TokoSipil_Official_v1.0.0.apk`**.
2. Unggah file tersebut ke hosting atau website Anda.
3. Buat tombol **"Unduh Aplikasi Android Toko Sipil"** yang tautannya mengarah ke file APK tersebut.
4. Publik/Pelanggan Anda tinggal menekan tombol tersebut, tunggu unduhan selesai, klik **Install**, dan aplikasi langsung *running* menampilkan website terbaru Anda dengan logo elok yang Anda inginkan!
