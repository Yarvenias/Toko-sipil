import React, { useState } from 'react';
import { Shield, Lock, FileText, Scale, Landmark, CheckSquare } from 'lucide-react';

export default function LegalPolicies() {
  const [activeTab, setActiveTab] = useState<'general' | 'privacy' | 'terms'>('general');

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 font-mono text-xs text-justify" id="legal-policies-view">
      
      {/* Title & Decorative Header */}
      <div className="text-center space-y-3 mb-10">
        <span className="bg-red-800 text-white px-2.5 py-0.5 font-bold uppercase select-none tracking-widest inline-block text-[9px]">
          LEGAL & SYSTEM COMPLIANCE
        </span>
        <h1 className="font-serif text-3xl font-black text-black uppercase tracking-tight">
          KEBIJAKAN & SYARAT LAYANAN
        </h1>
        <p className="text-gray-500 uppercase max-w-lg mx-auto text-[10px] leading-normal">
          Perjanjian penggunaan platform jual-beli multi-vendor TokoSipil × Himpunan Mahasiswa Teknik Sipil UNIKOM. Harap baca seluruh klausul demi keamanan berbelanja Anda.
        </p>
      </div>

      {/* Tabs list switchers */}
      <div className="grid grid-cols-3 border-4 border-black mb-8 maternal-shadow" id="legal-tab-triggers">
        <button 
          onClick={() => setActiveTab('general')}
          className={`py-3.5 font-serif font-black text-xs md:text-sm uppercase transition border-r-2 border-black tracking-tight flex items-center justify-center gap-1.5 ${
            activeTab === 'general' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <Scale className="w-4 h-4 hidden sm:inline" />
          <span>KEBIJAKAN UMUM</span>
        </button>
        <button 
          onClick={() => setActiveTab('privacy')}
          className={`py-3.5 font-serif font-black text-xs md:text-sm uppercase transition border-r-2 border-black tracking-tight flex items-center justify-center gap-1.5 ${
            activeTab === 'privacy' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <Lock className="w-4 h-4 hidden sm:inline" />
          <span>KEBIJAKAN PRIVASI</span>
        </button>
        <button 
          onClick={() => setActiveTab('terms')}
          className={`py-3.5 font-serif font-black text-xs md:text-sm uppercase transition tracking-tight flex items-center justify-center gap-1.5 ${
            activeTab === 'terms' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <FileText className="w-4 h-4 hidden sm:inline" />
          <span>SYARAT LAYANAN</span>
        </button>
      </div>

      {/* Legal Output Area */}
      <div className="bg-white border-2 border-black p-6 md:p-10 maternal-shadow space-y-6 leading-relaxed text-gray-700 font-sans text-[11.5px] uppercase">
        
        {/* Tab 1: Kebijakan Umum */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-fade-in" id="general-policy-pane">
            <div className="flex items-center gap-2.5 border-b-2 border-black pb-3">
              <Scale className="w-6 h-6 text-red-800" />
              <h2 className="font-serif font-black text-black text-lg">KEBIJAKAN UMUM PLATFORM TOKOSIPIL</h2>
            </div>

            <div className="space-y-4">
              <h3 className="font-mono font-black text-black text-xs">PASAL 1: TUJUAN DAN FUNGSI PLATFORM</h3>
              <p>
                1.1. TokoSipil adalah ekosistem e-commerce multi-vendor yang diprakarsai oleh Himpunan Mahasiswa Teknik Sipil (HMTS) UNIKOM sebagai sarana pengembangan ekonomi kreatif mahasiswa, penjualan merchandise resmi almamater, serta pemberdayaan brand lokal alumni.
              </p>
              <p>
                1.2. Seluruh perputaran komisi dari setiap penjualan produk dikenakan potongan sebesar persentase yang disepakati untuk dialokasikan langsung ke kas organisasi HMTS guna mendukung pendanaan kegiatan kemahasiswaan, seminar nasional, serta bakti sosial lingkungan.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-mono font-black text-black text-xs">PASAL 2: KEBIJAKAN SELLER & KUALITAS PRODUK</h3>
              <p>
                2.1. Setiap seller/vendor yang terdaftar wajib melalui proses verifikasi Kartu Tanda Mahasiswa (KTM) atau identitas resmi yang disetujui Pengurus Biro Ekonomi Kreatif HMTS.
              </p>
              <p>
                2.2. Seller dilarang keras menjual barang-barang yang melanggar hukum hak cipta, barang bekas non-thrifting berijin, produk di luar identitas/target pasar sipil yang dinilai mencederai etika, serta material berbahaya yang tidak sesuai standar pengerjaan konstruksi.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-mono font-black text-black text-xs">PASAL 3: TRANSAKSI & JAMINAN REKENING BERSAMA (ESCROW)</h3>
              <p>
                3.1. Demi menghindarkan penipuan antar pengguna, semua transaksi wajib diselesaikan melalui bank transfer virtual account resmi yang terintegrasi di sistem checkout TokoSipil.
              </p>
              <p>
                3.2. Dana transaksi dijamin aman dalam pembukuan Escrow Kasir Bersama HMTS dan baru dicairkan ke saldo saldo akun Seller setelah Pembeli melakukan konfirmasi penerimaan barang secara sadar, atau sistem mencatatkan waktu 48 jam pasca pelacakan kurir logistik menyatakan pesanan sukses terkirim.
              </p>
            </div>

            <div className="border-t pt-4 flex items-center gap-3 text-gray-400 font-mono text-[9px] font-black">
              <Landmark className="w-5 h-5 flex-shrink-0 text-red-850" />
              <span>DITANDATANGANI SECARA ELEKTRONIK OLEH KETUA HMTS UNIKOM × BIRO EKOKRAF SINOAD 2026</span>
            </div>
          </div>
        )}

        {/* Tab 2: Kebijakan Privasi */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 animate-fade-in" id="privacy-policy-pane">
            <div className="flex items-center gap-2.5 border-b-2 border-black pb-3">
              <Lock className="w-6 h-6 text-red-800" />
              <h2 className="font-serif font-black text-black text-lg">KEBIJAKAN PRIVASI & PERLINDUNGAN DATA</h2>
            </div>

            <div className="space-y-4">
              <h3 className="font-mono font-black text-black text-xs">PASAL 1: INFORMASI DATA YANG KAMI KUMPULKAN</h3>
              <p>
                1.1. Kami mengumpulkan informasi dasar yang Anda masukkan pada saat registrasi akun berupa: Nama Lengkap resmi, alamat surat elektronik (email) aktif, kredensial password terenkripsi hash, tahun angkatan mahasiswa sipil, serta asal institusi kampus Anda.
              </p>
              <p>
                1.2. Untuk keperluan verifikasi kedudukan toko fisik vendor, kami menyimpan data penunjang berupa jepretan foto Kartu Tanda Penduduk (KTP) dan nomor rekening perbankan guna proses penarikan saldo pendapatan (withdraw).
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-mono font-black text-black text-xs">PASAL 2: PENGGUNAAN DAN PENYIMPANAN DATA</h3>
              <p>
                2.1. Kami menjamin kerahasiaan data pribadi Anda dalam sistem server database tersandi tepercaya. Kami tidak akan menjual, mendistribusikan, menyewakan, atau membocorkan data sensitif kepada pihak ketiga non-afiliasi tanpa persetujuan eksplisit tertulis dari Anda.
              </p>
              <p>
                2.2. Alamat pengiriman barang hasil checkout serta nomor kontak penerima hanya akan dibagikan kepada vendor penyedia merchandise terkait dan pihak eskpedisi logistik/kurir terpilih untuk melancarkan proses penempelan resi pelacakan kurir.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-mono font-black text-black text-xs">PASAL 3: PENYIMPANAN COOKIES DAN LOKAL</h3>
              <p>
                3.1. Aplikasi ini mempergunakan mekanisme client-side storage (seperti LocalStorage browser) untuk mencatat status sesi masuk (login state), isi keranjang belanja sementara, serta preferensi visual gelap/terang guna meningkatkan kecepatan muat halaman berulang Anda secara instan.
              </p>
            </div>

            <div className="border-t pt-4 flex items-center gap-3 text-gray-400 font-mono text-[9px] font-black">
              <Shield className="w-5 h-5 flex-shrink-0 text-red-850" />
              <span>SISTEM DEKRIPSI DAN KEAMANAN ENKRIPSI DISUPPORT COBLONG POLICIES VERSI 4.0</span>
            </div>
          </div>
        )}

        {/* Tab 3: Syarat Layanan */}
        {activeTab === 'terms' && (
          <div className="space-y-6 animate-fade-in" id="terms-of-service-pane">
            <div className="flex items-center gap-2.5 border-b-2 border-black pb-3">
              <FileText className="w-6 h-6 text-red-800" />
              <h2 className="font-serif font-black text-black text-lg">SYARAT LAYANAN & ATURAN PENGGUNAAN</h2>
            </div>

            <div className="space-y-4">
              <h3 className="font-mono font-black text-black text-xs">PASAL 1: KETENTUAN PENGGUNAAN PLATFORM</h3>
              <p>
                1.1. Dengan mengeklik mendaftar, mengakses, atau berbelanja di TokoSipil, Anda dengan sadar menyatakan setuju untuk tunduk pada seluruh syarat dan ketentuan yang diatur oleh HMTS UNIKOM.
              </p>
              <p>
                1.2. Pengguna berkewajiban merawat kerahasiaan password sandi akun masing-masing dan bertanggung jawab penuh atas segala aktivitas transaksi, pemesanan, atau ulasan produk yang dicatatkan atas nama akun terdaftarnya.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-mono font-black text-black text-xs">PASAL 2: PROSES RETUR / COMPLAINT BARANG CACAT</h3>
              <p>
                2.1. Klaim garansi barang cacat produksi, robek jahitan konveksi, atau ukuran yang tidak sesuai pesanan harus diajukan maksimal 3 hari sejak barang didapatkan, wajib menyertakan video unboxing utuh tanpa jeda potong.
              </p>
              <p>
                2.2. Jika dalam 3 hari pembeli tidak mengajukan keluhan melalui sistem, pesanan dianggap terselesaikan dengan sempurna (COMPLETED) dan sisa dana escrow dilepaskan ke saldo rekening seller secara permanen.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-mono font-black text-black text-xs">PASAL 3: SANKSI PELANGGARAN</h3>
              <p>
                3.1. Pengurus HMTS UNIKOM berhak menghentikan, menangguhkan, memblokir akses login, atau menghapus toko seller secara sepihak dan permanen tanpa pemberitahuan sebelumnya apabila terbukti melakukan manipulasi ulasan fiktif (fake review), penipuan resi pengiriman, atau pencucian uang hasil kejahatan.
              </p>
            </div>

            <div className="border-t pt-4 flex items-center gap-3 text-gray-400 font-mono text-[9px] font-black">
              <CheckSquare className="w-5 h-5 flex-shrink-0 text-red-850" />
              <span>DIPERBAHARUI BERKALA: 13 JUNI 2026. BERLAKU NASIONAL BAGI SELURUH CIVITAS KAUM SIPIL</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
