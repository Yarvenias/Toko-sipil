import React, { useState } from 'react';
import { Search, HelpCircle, ChevronDown, ChevronUp, MessageSquare, PhoneCall, ShieldCheck, Mail, Sparkles, BookOpen } from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'payment' | 'shipping' | 'account' | 'returns';
  question: string;
  answer: string;
}

export default function HelpCenter() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'payment' | 'shipping' | 'account' | 'returns'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const [faqs] = useState<FAQItem[]>([
    {
      id: 'faq_1',
      category: 'payment',
      question: 'Bagaimana sistem keamanan pembayaran (Escrow Rekening Bersama) di TokoSipil?',
      answer: 'TokoSipil mengimplementasikan gerbang pengaman Escrow HMTS Sinergi. Setiap transaksi pembelian tidak langsung dikirim ke rekening penjual/vendor, melainkan ditampung di sistem kasir bersama. Dana baru akan diteruskan ke saldo dompet (wallet) penjual setelah pembeli mengonfirmasi bahwa produk telah diterima dengan baik di menu pesanan, atau dalam kurun waktu otomatis 2x24 jam setelah kurir menyatakan pesanan terkirim.'
    },
    {
      id: 'faq_2',
      category: 'payment',
      question: 'Dapatkah saya melakukan pembayaran uang muka / DP untuk produk Pre-Order?',
      answer: 'Ya! Untuk merchandise berlabel khusus Pre-Order (PO), kami mendukung opsi Down Payment (DP) dengan nominal persentase bervariasi sesuai regulasi vendor (misal 50% atau selebihnya). Sisanya wajib dilunasi melalui tombol Pelunasan di riwayat belanja pembeli sebelum pesanan dikirimkan oleh Seller.'
    },
    {
      id: 'faq_3',
      category: 'shipping',
      question: 'Kurir pengiriman apa saja yang digunakan oleh TokoSipil?',
      answer: 'Platform kami terintegrasi secara nasional untuk menghitung ongkos kirim standar dari JNE, J&T, Sicepat, Pos Indonesia, maupun layanan kurir hemat langsung di wilayah Universitas Komputer (Coblong Grab Instant) untuk area Bandung Sekitar bagi mahasiswa aktif.'
    },
    {
      id: 'faq_4',
      category: 'shipping',
      question: 'Berapa lama estimasi waktu pengerjaan merchandise Pre-Order?',
      answer: 'Estimasi pengerjaan bervariasi antara 7 hingga 21 hari kerja, tergantung pada volume cetakan kaos, jaket angkatan, atau silinder cor beton yang dikerjakan oleh unit konveksi tepercaya HMTS. Anda dapat memantau status pembuatan secara berkala di kolom riwayat transaksi pembeli.'
    },
    {
      id: 'faq_5',
      category: 'account',
      question: 'Bagaimana cara membuka toko/vendor baru di TokoSipil?',
      answer: 'Mahasiswa, alumni, maupun mitra binaan HMTS dapat mendaftarkan tokonya dengan masuk ke menu "My Profile & Orders" -> klik tab "Daftar Akun Seller / Ajukan Toko". Harap isi formulir pengajuan seperti nomor KTP, foto penjamin, nama toko kebanggaan Anda, serta nomor rekening valid. Agen admin kami akan melakukan verifikasi berkas selambat-lambatnya 1x24 jam.'
    },
    {
      id: 'faq_6',
      category: 'account',
      question: 'Mengapa saya diwajibkan untuk mendaftar akun terlebih dahulu sebelum bertransaksi?',
      answer: 'Sesuai dengan mandat keselamatan transaksi, verifikasi akun pembeli diperlukan untuk mempermudah monitoring logistik, pencatatan kas angkatan sipil yang transparan, pelacakan chat dengan vendor secara real-time, serta mencegah penyalahgunaan klaim voucher promosi.'
    },
    {
      id: 'faq_7',
      category: 'returns',
      question: 'Bagaimana jika barang yang saya terima cacat produksi atau salah ukuran?',
      answer: 'pembeli berhak melakukan klaim pengembalian (retur) atau perbaikan gratis dalam waktu 3x24 jam sejak paket mendarat. Buka riwayat pesanan Anda, tekan tombol "Ajukan Retur / Masalah", sertakan video unboxing autentik dan deskripsi keganjilan barang. Penjual wajib mengirimkan produk baru pengganti atau menyepakati pengembalian dana.'
    },
    {
      id: 'faq_8',
      category: 'returns',
      question: 'Apakah biaya ongkos kirim retur barang cacat ditanggung oleh pembeli?',
      answer: 'Apabila cacat terbukti berasal dari kelalaian seller/vendor (misalnya salah warna, jahitan lepas, atau retak material konstruksi), maka ongkos kirim balik dan pengiriman ulang sepenuhnya ditanggung oleh pihak seller terkait.'
    }
  ]);

  const toggleFAQ = (id: string) => {
    if (expandedFAQ === id) {
      setExpandedFAQ(null);
    } else {
      setExpandedFAQ(id);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 font-mono text-xs" id="help-center-portal-view">
      
      {/* Title Header with custom visual motif */}
      <div className="text-center space-y-3.5 mb-10">
        <span className="bg-red-800 text-white px-3 py-1 font-extrabold uppercase select-none tracking-widest inline-block text-[10px]">
          HMTS CLIENT SUPPORT CENTRAL
        </span>
        <h1 className="font-serif text-3xl md:text-4.5xl font-black text-black uppercase tracking-tight">
          PUSAT BANTUAN & FAQ
        </h1>
        <p className="text-gray-500 uppercase max-w-xl mx-auto leading-relaxed">
          Punya kendala mengenai pengamanan rekrutmen toko, status pembayaran tagihan virtual account, atau proses unboxing? Cari solusi cepat di bawah.
        </p>
      </div>

      {/* Heavy Search Layout Row */}
      <div className="bg-white border-4 border-black p-5 md:p-6 mb-8 maternal-shadow flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <input 
            type="text" 
            placeholder="KETIK TOPIK MASALAH ATAU KATA KUNCI (misal: 'dp', 'retur', 'escrow')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-100 border-2 border-black pl-10 pr-4 py-3 rounded-none focus:outline-none placeholder-gray-400 font-bold"
          />
          <Search className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
        </div>
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="bg-red-800 hover:bg-neutral-800 text-white font-bold py-3.5 px-6 border-2 border-black tracking-wide shrink-0 transition"
          >
            BERSIHKAN
          </button>
        )}
      </div>

      {/* Category Pivot Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-8" id="faq-categories">
        <button 
          onClick={() => { setActiveCategory('all'); setExpandedFAQ(null); }}
          className={`px-4 py-2.5 font-bold uppercase border-2 border-black transition ${
            activeCategory === 'all' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          🔍 Lihat Semua ({faqs.length})
        </button>
        <button 
          onClick={() => { setActiveCategory('payment'); setExpandedFAQ(null); }}
          className={`px-4 py-2.5 font-bold uppercase border-2 border-black transition ${
            activeCategory === 'payment' ? 'bg-[#991b1b] text-white' : 'bg-white text-black hover:bg-gray-105'
          }`}
        >
          💳 Pembayaran & Escrow
        </button>
        <button 
          onClick={() => { setActiveCategory('shipping'); setExpandedFAQ(null); }}
          className={`px-4 py-2.5 font-bold uppercase border-2 border-black transition ${
            activeCategory === 'shipping' ? 'bg-[#991b1b] text-white' : 'bg-white text-black hover:bg-gray-105'
          }`}
        >
          📦 Logistik & Kiriman
        </button>
        <button 
          onClick={() => { setActiveCategory('account'); setExpandedFAQ(null); }}
          className={`px-4 py-2.5 font-bold uppercase border-2 border-black transition ${
            activeCategory === 'account' ? 'bg-[#991b1b] text-white' : 'bg-white text-black hover:bg-gray-105'
          }`}
        >
          🦁 Member & Vendor
        </button>
        <button 
          onClick={() => { setActiveCategory('returns'); setExpandedFAQ(null); }}
          className={`px-4 py-2.5 font-bold uppercase border-2 border-black transition ${
            activeCategory === 'returns' ? 'bg-[#991b1b] text-white' : 'bg-white text-black hover:bg-gray-105'
          }`}
        >
          🎛️ Jaminan Pengembalian
        </button>
      </div>

      {/* Accordion FAQ Grid List */}
      <div className="space-y-4" id="faq-accordions-list">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedFAQ === faq.id;
            return (
              <div 
                key={faq.id} 
                className="bg-white border-2 border-black maternal-shadow-sm overflow-hidden transition-all duration-300"
              >
                {/* Trigger Button bar */}
                <button 
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full text-left p-4 md:p-5 flex justify-between items-center gap-4 hover:bg-neutral-50"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-red-800 flex-shrink-0 mt-0.5" />
                    <span className="font-serif font-black text-[#111] text-sm md:text-base tracking-tight uppercase leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-black flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-black flex-shrink-0" />
                  )}
                </button>

                {/* Secret Answer view collapsed */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1.5 md:px-8 border-t border-dashed border-gray-300 bg-zinc-50 leading-relaxed text-gray-700 font-sans text-[11.5px] uppercase">
                    <p className="whitespace-pre-line">{faq.answer}</p>
                    <div className="mt-3 text-[9.5px] text-gray-400 font-mono font-bold uppercase">
                      Kategori bantuan: {faq.category === 'payment' ? 'Pembayaran & Keuangan' : faq.category === 'shipping' ? 'Pengiriman & Pembuatan' : faq.category === 'account' ? 'Sesi Membership' : 'Retur Barang'}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-red-50 border-2 border-black p-8 text-center text-red-800 font-black flex flex-col items-center gap-2">
            <BookOpen className="w-10 h-10" />
            <p className="uppercase text-xs font-mono">TIDAK MENEMUKAN JAWABAN COCOK UNTUK KATA KUNCI "{searchQuery}".</p>
            <p className="text-[10px] text-gray-500 font-sans font-light">Coba ganti dengan kata kunci pencarian yang lebih umum seperti 'DP' atau 'Akun'.</p>
          </div>
        )}
      </div>

      {/* Support Direct Action Box */}
      <div className="mt-12 bg-black text-[#f4f2e9] border-4 border-black p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 maternal-shadow">
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Sparkles className="w-5 h-5" />
            <span className="uppercase text-[10px] tracking-widest font-mono">HOTLINE SIAGA TOKOSIPIL UNI-SYSTEM</span>
          </div>
          <h3 className="font-serif text-xl md:text-2xl font-black text-white uppercase leading-none">MASIH MEMILIKI KENDALA EKSTRA?</h3>
          <p className="text-[10px] text-gray-400 leading-relaxed uppercase">
            Hubungi penanggung jawab logistik kemahasiswaan ataupun perwakilan biro humas HMTS Unikom langsung melalui media pesan instant. Siaga jam kerja (Mon-Fri 09.00 - 17.00 WIB).
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
          <a 
            href="https://wa.me/628123456789" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-5 border-2 border-black flex items-center justify-center gap-2 text-[10px] tracking-wider transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>KIRIM WHATSAPP CHAT</span>
          </a>
          <a 
            href="mailto:hmts_unikom@mail.com"
            className="bg-[#222] hover:bg-[#333] text-white font-bold py-3 px-5 border-2 border-zinc-700 flex items-center justify-center gap-2 text-[10px] tracking-wider transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>KIRIM FORM EMAIL</span>
          </a>
        </div>
      </div>

    </div>
  );
}
