import React, { useState } from 'react';
import { Heart, MessageCircle, Instagram, ExternalLink, Bookmark, Grid, Camera, Users, Award, Landmark } from 'lucide-react';

interface IGPost {
  id: string;
  imageUrl: string;
  likes: number;
  commentsCount: number;
  caption: string;
  date: string;
  tags: string[];
  comments: { user: string; text: string }[];
}

export default function InstagramFeed() {
  const [posts, setPosts] = useState<IGPost[]>([
    {
      id: 'ig_1',
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop&q=80',
      likes: 312,
      commentsCount: 18,
      caption: 'STUDI EKSKURSI HMTS 2026: Mengamati langsung perkembangan teknologi perkerasan dan erection girder pada Proyek Flyover Bandung Raya. Ilmu lapangan adalah kunci! 🏗️🔩 #HMTSUnikom #CivilEngineering #SipilSinergi',
      date: '12 JUNI 2026',
      tags: ['Civil', 'Ekskursi', 'Unikom'],
      comments: [
        { user: 'budi_sipil23', text: 'Keren banget kunjungan kemarin, dapet ilmu beton segar!' },
        { user: 'hmts_official', text: 'Nantikan studi ekskursi gelombang berikutnya ya!' },
        { user: 'doni_pratama', text: 'Girdernya mantap gila.' }
      ]
    },
    {
      id: 'ig_2',
      imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80',
      likes: 425,
      commentsCount: 32,
      caption: 'OFFICIAL MERCHANDISE EXCLUSIVE: Toko Sipil Official Hoodie "HARD-HAT 1995" dalam kolaborasi HMTS Sinergi. Bahan heavy cotton fleece, bordir presisi tinggi bersertifikat kebanggaan Almamater. ⚡🛒 Pre-Order dibuka sekarang melalui platform TokoSipil!',
      date: '10 JUNI 2026',
      tags: ['Streetwear', 'TokoSipil', 'Merchandise'],
      comments: [
        { user: 'andre_gothic', text: 'Sudah gas PO min, ditunggu kirimannya!' },
        { user: 'rara.amalia', text: 'Ada ukuran XXL ga min? Desain belakangnya sangar pol.' },
        { user: 'tokosipil_admin', text: 'Ada kak @rara.amalia ! Langsung cek di halaman Catalog ya.' }
      ]
    },
    {
      id: 'ig_3',
      imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80',
      likes: 289,
      commentsCount: 14,
      caption: 'PRAKTIKUM LABORATORIUM: Uji kuat tekan karakteristik beton mutu fc\' 30 MPa di Lab Bahan Konstruksi Unikom. Ketelitian silinder beton menentukan keandalan struktur masa depan! 🔬🧱 #ConcreteTesting #BetonSipil #LabStructure',
      date: '08 JUNI 2026',
      tags: ['Construction', 'Lab', 'Unikom'],
      comments: [
        { user: 'sipil_unikom24', text: 'Waduh praktikum pembawa berkah, laporannya asyik.' },
        { user: 'dosen_kece', text: 'Mantap, pertahankan ketelitian uji slump test nya juga ya.' }
      ]
    },
    {
      id: 'ig_4',
      imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80',
      likes: 198,
      commentsCount: 9,
      caption: 'PENGABDIAN MASYARAKAT HMTS: Penyerahan bantuan material semen, pasir beton, dan perbaikan sanitasi saluran air bersih bagi warga terdampak longsor mikro di kawasan Coblong. Bakti nyata mahasiswa teknik sipil untuk lingkungan sekitar! 🤝💧',
      date: '05 JUNI 2026',
      tags: ['SipilPeduli', 'Abdimas', 'Sosial'],
      comments: [
        { user: 'rt_rukun04', text: 'Hatur nuhun HMTS Unikom, saluran airnya sudah lancar kembali.' },
        { user: 'civil_hero', text: 'Ini baru mahasiswa, tidak hanya teori!' }
      ]
    },
    {
      id: 'ig_5',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
      likes: 367,
      commentsCount: 22,
      caption: 'CIVIL BRIEFCASE SERIES: Webinar Nasional Dinamika Rekayasa Gempa dan Perencanaan Struktur Tahan Gempa Berbasis SNI-1726-2020. Dihadiri oleh praktisi profesional HAKI. Mari tingkatkan skill mitigasi konstruksi kita! 📈🏢',
      date: '01 JUNI 2026',
      tags: ['Webinar', 'StructureEngineering', 'Gempa'],
      comments: [
        { user: 'ir_gunawan', text: 'Materi webinar yang sangat daging!' },
        { user: 'mahasiswa_akhir', text: 'Bahan sitasi yang sangat bagus untuk skripsi saya min.' }
      ]
    },
    {
      id: 'ig_6',
      imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
      likes: 495,
      commentsCount: 45,
      caption: 'HMTS CHAMPIONSHIP: Selamat atas keberhasilan Tim Beton Ringan Unikom menyabet Juara Harapan II di Kompetisi Rancang Bangun Nasional! Terus kepakkan sayap sipil di tingkat nasional! 🏆🦁 #SipilUnikomJuara #CivilAward',
      date: '28 MEI 2026',
      tags: ['Prestasi', 'UnikomSipil', 'Juara'],
      comments: [
        { user: 'rektorat_unikom', text: 'Selamat HMTS! Terus berprestasi mengharumkan nama kampus!' },
        { user: 'bangga_sipil', text: 'Beton seringan kapas sekuat baja! Kerennn.' }
      ]
    }
  ]);

  const [selectedPost, setSelectedPost] = useState<IGPost | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, likes: p.likes + 1 };
      }
      return p;
    }));
    if (selectedPost && selectedPost.id === id) {
      setSelectedPost(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedPost) return;

    const updatedComments = [...selectedPost.comments, { user: 'kamu_user', text: newCommentText }];
    const updatedPost = { ...selectedPost, commentsCount: selectedPost.commentsCount + 1, comments: updatedComments };

    setPosts(prev => prev.map(p => p.id === selectedPost.id ? updatedPost : p));
    setSelectedPost(updatedPost);
    setNewCommentText('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 font-mono text-xs" id="ig-media-portal-view">
      
      {/* IG Header Banner Info Card */}
      <div className="bg-white border-4 border-black p-6 md:p-8 maternal-shadow flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
        
        {/* Mock IG Profile Photo */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-black bg-red-800 p-1 flex-shrink-0 relative overflow-hidden select-none maternal-shadow-sm">
          <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center">
            <span className="font-serif font-black text-2xl md:text-3xl text-white tracking-widest">HMTS</span>
          </div>
          <div className="absolute bottom-1 right-1 bg-yellow-500 rounded-full p-1 border-2 border-black">
            <Award className="w-4 h-4 text-black" />
          </div>
        </div>

        {/* Profile Bio Details */}
        <div className="flex-grow text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3.5 justify-center md:justify-start">
            <h1 className="font-serif text-2xl md:text-3xl font-black text-black">@hmts_unikom</h1>
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-950 px-2 py-0.5 border border-emerald-500 rounded-none text-[9px] font-bold uppercase select-none self-center">
              ✓ VERIFIED STUDENT GROUP
            </span>
          </div>

          {/* Social Counts Analytics Row */}
          <div className="flex justify-center md:justify-start gap-6 border-y border-dashed border-gray-300 py-2.5 text-black">
            <div><b className="text-sm font-black text-red-800">{posts.length}</b> POSTS</div>
            <div><b className="text-sm font-black text-red-800">4.8K</b> FOLLOWERS</div>
            <div><b className="text-sm font-black text-red-800">128</b> FOLLOWING</div>
          </div>

          {/* Bio text */}
          <div className="space-y-1.5 text-gray-700 leading-normal uppercase text-[11px]">
            <p className="font-black text-black text-xs font-serif">HIMPUNAN MAHASISWA TEKNIK SIPIL UNIKOM</p>
            <p>🏗️ Ruang Komunikasi, Pengembangan Keprofesian, & Aksi Sosial Mahasiswa Sipil Unikom Bandung.</p>
            <p>🎨 Official Business Incubator: <span className="font-bold text-red-800">@tokosipil_unikom</span></p>
            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
              <span className="flex items-center gap-1 text-[10px] bg-neutral-100 px-2 py-1 border border-black font-black text-black">
                <Landmark className="w-3.5 h-3.5" /> KAMPUS UNIKOM BANDUNG
              </span>
              <span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-800 px-2 py-1 border border-red-800 font-black">
                <Users className="w-3.5 h-3.5" /> SINERGI KABINET 2026/2027
              </span>
            </div>
          </div>

          {/* Direct Link Options */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a 
              href="https://www.instagram.com/hmts_unikom/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#e1306c] hover:bg-[#c13584] text-white border-2 border-black font-bold uppercase px-5 py-3 tracking-wider transition-all maternal-shadow-sm hover:maternal-shadow-none cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
              <span>FOLLOW DI INSTAGRAM ↗</span>
            </a>
            <button 
              onClick={() => alert("Tautan berhasil disalin! Bagikan ke grup WhatsApp Anda.")}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-150 text-black border-2 border-black font-bold uppercase px-4 py-3 tracking-wider cursor-pointer transition-all maternal-shadow-sm hover:maternal-shadow-none"
            >
              <ExternalLink className="w-4 h-4" />
              <span>COPY GROUP LINKS</span>
            </button>
          </div>
        </div>

      </div>

      {/* Grid Post Header Ticker */}
      <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-6">
        <div className="flex items-center gap-2 font-bold font-serif text-lg text-black uppercase">
          <Grid className="w-5 h-5 text-red-800" />
          <span>GALERI KEGIATAN & MERCHANDISE</span>
        </div>
        <span className="text-[10px] text-gray-500 uppercase font-black">MENAMPILKAN {posts.length} MOMEN TERBARU</span>
      </div>

      {/* Interactive Photo Feed Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" id="instagram-posts-container">
        {posts.map((post) => (
          <div 
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group bg-white border-2 border-black maternal-shadow-sm hover:maternal-shadow transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
          >
            {/* Post Image with Hover overlay effect */}
            <div className="aspect-square relative overflow-hidden bg-neutral-900 border-b-2 border-black">
              <img 
                src={post.imageUrl} 
                alt="HMTS Post" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white font-bold text-sm">
                <button 
                  onClick={(e) => handleLike(post.id, e)}
                  className="flex items-center gap-1.5 bg-red-800 hover:bg-red-700 px-3 py-1.5 border border-white"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{post.likes}</span>
                </button>
                <div className="flex items-center gap-1.5 bg-black/80 px-3 py-1.5 border border-white">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentsCount}</span>
                </div>
              </div>
            </div>

            {/* Post Caption Footer Summary */}
            <div className="p-4 space-y-2.5">
              <p className="text-gray-700 text-[11px] line-clamp-2 leading-relaxed uppercase">
                {post.caption}
              </p>
              
              <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold border-t pt-2 border-dashed">
                <span>{post.date}</span>
                <span className="text-red-800 uppercase font-black">BUKA DETAIL ➔</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mock IG Detail Post Modal Backdrop */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" id="ig-detail-portal-modal">
          <div className="bg-white border-4 border-black max-w-3xl w-full flex flex-col md:flex-row maternal-shadow-lg max-h-[90vh] overflow-hidden">
            
            {/* Left Box Image Preview */}
            <div className="w-full md:w-1/2 aspect-square bg-[#111] border-b-2 md:border-b-0 md:border-r-2 border-black relative">
              <img 
                src={selectedPost.imageUrl} 
                alt="IG Post Zoom" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={(e) => handleLike(selectedPost.id, e)}
                className="absolute bottom-4 left-4 bg-red-800 py-1.5 px-3 text-white border-2 border-black font-bold uppercase tracking-wide flex items-center gap-1 hover:bg-red-700 animate-bounce"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>LIKE INI ({selectedPost.likes})</span>
              </button>
            </div>

            {/* Right Box Bio Comments and Submissions */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between max-h-[450px] md:max-h-none overflow-y-auto">
              <div>
                
                {/* Header Profile Ticker inside modal */}
                <div className="flex justify-between items-start border-b pb-3 border-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-800 flex items-center justify-center text-white text-[9px] font-bold">
                      HMTS
                    </div>
                    <div>
                      <h4 className="font-bold text-black text-xs leading-none">hmts_unikom</h4>
                      <span className="text-[8px] text-gray-500 uppercase tracking-widest">{selectedPost.date}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="bg-black hover:bg-red-800 text-white font-extrabold w-6 h-6 flex items-center justify-center text-xs border border-black rounded-none cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Caption View */}
                <div className="py-4 border-b border-gray-150">
                  <p className="text-gray-800 text-[11.5px] leading-relaxed uppercase font-sans">
                    {selectedPost.caption}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {selectedPost.tags.map(t => (
                      <span key={t} className="text-[9px] bg-gray-100 text-[#111] px-1.5 py-0.5 border border-black font-bold">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Real-time Interaction Comments Log list */}
                <div className="py-3 space-y-3 max-h-[160px] md:max-h-[220px] overflow-y-auto pr-1">
                  <span className="font-serif font-black uppercase text-[10px] text-gray-500 tracking-wider block mb-1">KOMENTAR ({selectedPost.comments.length})</span>
                  {selectedPost.comments.map((comment, index) => (
                    <div key={index} className="text-[10px] leading-snug uppercase">
                      <span className="font-extrabold text-red-800 mr-1.5">@{comment.user}</span>
                      <span className="text-gray-600 font-sans">{comment.text}</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Submit commentary line */}
              <div className="border-t pt-4 border-gray-300 bg-white">
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    required
                    maxLength={120}
                    placeholder="TULIS KOMENTAR SIPIL KAMU..."
                    className="flex-grow bg-[#f5f5f5] text-[10px] border-2 border-black p-2 focus:outline-none placeholder-gray-400 font-bold"
                  />
                  <button 
                    type="submit"
                    className="bg-black hover:bg-neutral-800 text-white font-mono font-bold px-4 text-[10px] border-2 border-black cursor-pointer"
                  >
                    KIRIM
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
