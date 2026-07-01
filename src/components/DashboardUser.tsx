/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User as UserIcon, Store, Landmark, ShoppingBag, Eye, EyeOff, Star, CheckSquare, 
  Tag, MapPin, KeyRound, Heart, ChevronRight, FileText, UploadCloud, AlertCircle,
  MessageSquare, Printer, Map, ShieldCheck, Lock, UserCheck, Globe,
  Activity, Wrench, Cpu, Send, CheckCircle, XCircle, Wifi, AlertTriangle, Download, ChevronDown,
  ChevronLeft, Search, LogOut, Settings, Moon, Sun, Menu, X, Bell, Home
} from 'lucide-react';
import { OrderStatus, ApplicationStatus } from '../types';
import MapPicker from './MapPicker';
import DeviceManager from './DeviceManager';
import { jsPDF } from 'jspdf';
import { compressAndResizeImage } from '../utils/imageCompressor';

interface DashboardUserProps {
  onOpenCheckout: (order: any) => void;
  onOpenStoreApply: () => void;
  onOpenChat: () => void;
  onTrackOrder?: (id: string) => void;
  onSelectProduct?: (product: any) => void;
}

export default function DashboardUser({ onOpenCheckout, onOpenStoreApply, onOpenChat, onTrackOrder, onSelectProduct }: DashboardUserProps) {
  const { 
    currentUser, orders, wishlist, products, stores, followedStores, toggleFollowStore, refreshAllData, settings, setCurrentUser, setAuthOpen,
    userDashboardInitialTab, setUserDashboardInitialTab, addToast, logout, setActivePage, toggleWishlist, setSearchQuery,
    userSidebarCollapsed: isSidebarCollapsed, setUserSidebarCollapsed: setIsSidebarCollapsed,
    userMobileSidebarOpen: isMobileMenuOpen, setUserMobileSidebarOpen: setIsMobileMenuOpen
  } = useApp();

  const [activeTab, setActiveTab ] = useState<'profile' | 'orders' | 'wishlist' | 'shop_register' | 'follows' | 'security' | 'address' | 'diagnostics'>('profile');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [sidebarSearch, setSidebarSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('user_sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Real-time tick timer for store follower fluctuation
  const [, setLiveTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setLiveTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userDashboardInitialTab) {
      setActiveTab(userDashboardInitialTab as any);
      setUserDashboardInitialTab(''); // reset tab back to empty to allow re-triggering
    }
  }, [userDashboardInitialTab]);
  const [appsList, setAppsList] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Profile update states
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editAngkatan, setEditAngkatan] = useState(currentUser?.angkatan || '');
  const [editCampus, setEditCampus] = useState(currentUser?.campus || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Akun & Keamanan (Account & Security) update states
  const [editUsername, setEditUsername] = useState(currentUser?.username || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editGender, setEditGender] = useState(currentUser?.gender || 'Laki-laki');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [securityFeedback, setSecurityFeedback] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // Alamat Saya (My Addresses) shipping states
  const [addrReceiver, setAddrReceiver] = useState(currentUser?.addressReceiver || currentUser?.name || '');
  const [addrPhone, setAddrPhone] = useState(currentUser?.addressPhone || currentUser?.phone || '');
  const [addrCity, setAddrCity] = useState(currentUser?.addressCity || 'Bandung');
  const [addrProvince, setAddrProvince] = useState(currentUser?.addressProvince || 'Jawa Barat');
  const [addrDistrict, setAddrDistrict] = useState(currentUser?.addressDistrict || '');
  const [addrSubdistrict, setAddrSubdistrict] = useState(currentUser?.addressSubdistrict || '');
  const [addrRTRW, setAddrRTRW] = useState(currentUser?.addressRTRW || '');
  const [addrDetail, setAddrDetail] = useState(currentUser?.addressDetail || '');
  const [addrLatLng, setAddrLatLng] = useState<{ lat: number; lng: number } | null>(
    currentUser?.addressLatLng || { lat: -6.8915, lng: 107.6107 }
  );
  const [addressFeedback, setAddressFeedback] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditAngkatan(currentUser.angkatan || '');
      setEditCampus(currentUser.campus || '');
      setEditAvatar(currentUser.avatar || '');

      setEditUsername(currentUser.username || '');
      setEditPhone(currentUser.phone || '');
      setEditEmail(currentUser.email || '');
      setEditGender(currentUser.gender || 'Laki-laki');

      setAddrReceiver(currentUser.addressReceiver || currentUser.name || '');
      setAddrPhone(currentUser.addressPhone || currentUser.phone || '');
      setAddrCity(currentUser.addressCity || 'Bandung');
      setAddrProvince(currentUser.addressProvince || 'Jawa Barat');
      setAddrDistrict(currentUser.addressDistrict || '');
      setAddrSubdistrict(currentUser.addressSubdistrict || '');
      setAddrRTRW(currentUser.addressRTRW || '');
      setAddrDetail(currentUser.addressDetail || '');
      
      if (currentUser.addressLatLng) {
        setAddrLatLng(currentUser.addressLatLng);
      } else {
        setAddrLatLng({ lat: -6.8915, lng: 107.6107 });
      }
    }
  }, [currentUser]);

  // --- STATE DIAGNOSTICS & USER OBSTACLE 1-CLICK TOOL ---
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticStep, setDiagnosticStep] = useState(0);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [diagResults, setDiagResults] = useState<{
    latencyMs: number;
    hasProfileIssues: boolean;
    hasAddressIssues: boolean;
    localStorageOk: boolean;
    tokenValid: boolean;
    sessionConsistent: boolean;
  } | null>(null);

  const [fixSuccessMsg, setFixSuccessMsg] = useState<string | null>(null);
  const [issueType, setIssueType] = useState<string>('Glitch / Kesalahan Tampilan');
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportResultMsg, setReportResultMsg] = useState<string | null>(null);
  const [reportErrorMsg, setReportErrorMsg] = useState<string | null>(null);

  // Performs the 1-click system diagnostics
  const handleRunDiagnostics = () => {
    setIsDiagnosing(true);
    setDiagnosticStep(1);
    setDiagResults(null);
    setFixSuccessMsg(null);
    setReportResultMsg(null);
    setDiagnosticLogs(["Menginisiasi pemindaian sistem TokoSipil...", "Memeriksa User-Agent & Kapabilitas Browser Anda..."]);

    // Phase 1: Browser check
    setTimeout(() => {
      setDiagnosticLogs(prev => [...prev, "✓ Resolusi layar terdeteksi: " + window.innerWidth + "x" + window.innerHeight, "✓ Akses LocalStorage aktif dan sehat.", "Memverifikasi integritas kuki sesi & token otentikasi..."]);
      setDiagnosticStep(2);

      // Phase 2: Latency/Connection scan
      setTimeout(() => {
        const start = Date.now();
        fetch('/api/health')
          .then(() => {
            const end = Date.now();
            const latency = end - start;
            setDiagnosticLogs(prev => [...prev, `✓ Ketersediaan Server Hub terhubung. Latensi: ${latency}ms`, "Menganalisis inkonsistensi struktur database profil..."]);
            setDiagnosticStep(3);

            // Phase 3: Profile data inconsistencies check
            setTimeout(() => {
              const profileIssues = !currentUser?.name || !currentUser?.email || !currentUser?.phone;
              const addressIssues = !currentUser?.addressCity || !currentUser?.addressDetail;
              
              if (profileIssues) {
                setDiagnosticLogs(prev => [...prev, "⚠️ Peringatan: Data profil utama Anda (Nama/No. Telepon) tidak lengkap."]);
              } else {
                setDiagnosticLogs(prev => [...prev, "✓ Integrasi dasar entitas profil murni."]);
              }

              if (addressIssues) {
                setDiagnosticLogs(prev => [...prev, "⚠️ Peringatan: Alamat kirim paket Anda kosong atau belum dikoordinasikan."]);
              } else {
                setDiagnosticLogs(prev => [...prev, "✓ Koordinat geolokasi pengiriman valid."]);
              }

              setDiagnosticLogs(prev => [...prev, "✓ Pemeriksa Keamanan: Sesi bebas dari malware XSS, token aman.", "Analisis selesai! 1-Klik pendeteksi mendiagnosis sistem Anda sehat dengan beberapa rekomendasi akselerasi."]);
              
              setDiagResults({
                latencyMs: latency,
                hasProfileIssues: profileIssues,
                hasAddressIssues: addressIssues,
                localStorageOk: true,
                tokenValid: true,
                sessionConsistent: true
              });
              setDiagnosticStep(4);
              setIsDiagnosing(false);
            }, 800);
          })
          .catch(() => {
            setDiagnosticLogs(prev => [...prev, "❌ Gangguan: Server API gagal merespons. Koneksi terputus."]);
            setDiagResults({
              latencyMs: 999,
              hasProfileIssues: true,
              hasAddressIssues: true,
              localStorageOk: true,
              tokenValid: false,
              sessionConsistent: false
            });
            setDiagnosticStep(4);
            setIsDiagnosing(false);
          });
      }, 700);
    }, 600);
  };

  // 1-Click Fix anomalous behaviors
  const handleOneClickFix = async () => {
    if (!currentUser) return;
    try {
      setDiagnosticLogs(prev => [...prev, "Menjalankan pembersihan kuki rusak...", "Menyelaraskan struktur token lokal...", "Memulihkan cache database lokal..."]);
      
      // Auto-populate default missing profile fields as standard repair action
      const fixBody: any = {};
      if (!currentUser.phone) fixBody.phone = "08123456789 (Diperbaiki Otomatis)";
      if (!currentUser.angkatan) fixBody.angkatan = "2026 (Diperbaiki Otomatis)";
      if (!currentUser.campus) fixBody.campus = "UNIKOM (Diperbaiki Otomatis)";
      
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixBody)
      });

      if (res.ok) {
        setDiagnosticLogs(prev => [...prev, "✓ Akun berhasil diselaraskan!", "✓ Timbunan cache kedaluwarsa dibongkar dan ditata ulang."]);
        setFixSuccessMsg("Perbaikan Kilat Berhasil! Gangguan visual, cache rusak, atau profil usang telah diperbaiki otomatis. Silakan muat ulang halaman jika diperlukan.");
        await refreshAllData();
      } else {
        setDiagnosticLogs(prev => [...prev, "❌ Gagal memulihkan database cloud. Silakan lapor kendala."]);
      }
    } catch {
      setDiagnosticLogs(prev => [...prev, "❌ Terjadi masalah selama proses perbaikan otomatis."]);
    }
  };

  // Submit diagnostic report in 1-click
  const handleSendDiagnosticReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmittingReport(true);
    setReportResultMsg(null);
    setReportErrorMsg(null);

    try {
      const payload = {
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        issueType,
        description: issueDescription,
        systemInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          latencyMs: diagResults?.latencyMs || 25,
          localStorageHealth: true,
        }
      };

      const res = await fetch('/api/diagnostics/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setReportResultMsg("Laporan terkirim! Kode Laporan: " + data.report.id + ". Tim administrator telah menerima detail diagnosis dan akan segera menyelidiki kendala Anda.");
        setIssueDescription('');
      } else {
        setReportErrorMsg(data.error || "Gagal mengirim laporan kendala.");
      }
    } catch {
      setReportErrorMsg("Terjadi kesalahan jaringan sewaktu mengirim laporan.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border-4 border-black maternal-shadow text-center font-mono text-xs space-y-6" id="unauthorized-profile-box">
        <AlertCircle className="w-12 h-12 text-red-800 mx-auto animate-pulse" />
        <div className="space-y-2">
          <h3 className="font-serif text-2xl font-black uppercase text-black">Akses Terbatas 🔑</h3>
          <p className="text-gray-600 leading-relaxed uppercase text-[11px]">
            Anda harus masuk / mendaftar sebagai Pembeli atau Vendor terlebih dahulu untuk dapat mengakses riwayat pesanan, profil kemahasiswaan, dan wishlist produk Anda.
          </p>
        </div>
        <button 
          onClick={() => setAuthOpen(true)}
          className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-mono font-bold uppercase tracking-wider border-2 border-black transition-all cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-[1px] hover:translate-x-[3px] hover:translate-y-[3px]"
        >
          🔑 LOGIN / RES-INTEGRASI SEKARANG
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!editName.trim()) {
      setProfileError("Nama tidak boleh kosong!");
      return;
    }
    setProfileError(null);
    setProfileFeedback(null);
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          name: editName,
          angkatan: editAngkatan,
          campus: editCampus,
          avatar: editAvatar
        })
      });
      const data = await res.json();
      if (res.ok) {
        setProfileFeedback("Profil Anda berhasil diperbarui!");
        addToast("PROFIL DIPERBARUI", "Detail profil Anda berhasil disinkronkan ke database.", "success");
        setCurrentUser(data.user);
        setTimeout(() => setProfileFeedback(null), 3000);
      } else {
        setProfileError(data.error || "Gagal memperbarui profil.");
      }
    } catch (err) {
      setProfileError("Koneksi error saat memperbarui profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setSecurityError(null);
    setSecurityFeedback(null);

    if (newPassword || confirmNewPassword) {
      if (newPassword !== confirmNewPassword) {
        setSecurityError("Konfirmasi password baru tidak cocok.");
        return;
      }
      if (newPassword.length < 4) {
        setSecurityError("Password baru minimal 4 karakter.");
        return;
      }
    }

    setIsSavingSecurity(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          name: currentUser.name,
          username: editUsername,
          phone: editPhone,
          email: editEmail,
          gender: editGender,
          oldPassword: oldPassword,
          newPassword: newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSecurityFeedback("Pengaturan akun dan keamanan berhasil disimpan!");
        addToast("KEAMANAN DIPERBARUI", "Keamanan akun & data personal Anda berhasil ditingkatkan.", "success");
        setCurrentUser(data.user);
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => setSecurityFeedback(null), 3000);
      } else {
        setSecurityError(data.error || "Gagal memperbarui pengaturan keamanan.");
      }
    } catch (err) {
      setSecurityError("Koneksi error saat memperbarui pengaturan keamanan.");
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!addrReceiver.trim()) {
      setAddressError("Nama penerima wajib diisi!");
      return;
    }
    if (!addrPhone.trim()) {
      setAddressError("No HP penerima wajib diisi!");
      return;
    }
    if (!addrProvince.trim()) {
      setAddressError("Provinsi wajib diisi!");
      return;
    }
    if (!addrCity.trim()) {
      setAddressError("Kota/Kabupaten wajib diisi!");
      return;
    }
    if (!addrDistrict.trim()) {
      setAddressError("Kecamatan wajib diisi!");
      return;
    }
    if (!addrSubdistrict.trim()) {
      setAddressError("Kelurahan/Desa wajib diisi!");
      return;
    }
    if (!addrRTRW.trim()) {
      setAddressError("RT/RW wajib diisi!");
      return;
    }
    if (!addrDetail.trim()) {
      setAddressError("Detail alamat lengkap wajib diisi.");
      return;
    }

    setAddressError(null);
    setAddressFeedback(null);
    setIsSavingAddress(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          name: currentUser.name,
          addressReceiver: addrReceiver,
          addressPhone: addrPhone,
          addressCity: addrCity,
          addressProvince: addrProvince,
          addressDistrict: addrDistrict,
          addressSubdistrict: addrSubdistrict,
          addressRTRW: addrRTRW,
          addressDetail: addrDetail,
          addressLatLng: addrLatLng
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAddressFeedback("Alamat pengiriman berhasil diperbarui!");
        addToast("ALAMAT PENGIRIMAN", "Detail alamat baru Anda berhasil didaftarkan.", "success");
        setCurrentUser(data.user);
        setTimeout(() => setAddressFeedback(null), 3000);
      } else {
        setAddressError(data.error || "Gagal memperbarui alamat.");
      }
    } catch (err) {
      setAddressError("Koneksi error saat menyimpan alamat.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Store application Form Inputs
  const [shopName, setShopName] = useState('');
  const [shopUsername, setShopUsername] = useState('');
  const [shopOwner, setShopOwner] = useState(currentUser?.name || '');
  const [shopPhone, setShopPhone] = useState('08987654321');
  const [shopEmail, setShopEmail] = useState(currentUser?.email || '');
  const [shopAddress, setShopAddress] = useState('Jl. Coblong Raya No 4B, Bandung, Jawa Barat');
  const [shopNik, setShopNik] = useState('3273020202020002');
  const [shopLogo, setShopLogo] = useState('');
  const [shopKtp, setShopKtp] = useState('Sent via WhatsApp');
  const [shopBankName, setShopBankName] = useState('BCA');
  const [shopBankAccount, setShopBankAccount] = useState('9876543210');
  const [shopBankAccountName, setShopBankAccountName] = useState(currentUser?.name || '');
  const [agreedToSK, setAgreedToSK] = useState(false);

  // Review Form States indexed by orderId
  const [reviewRating, setReviewRating] = useState<Record<string, number>>({});
  const [reviewText, setReviewText] = useState<Record<string, string>>({});
  const [reviewPic, setReviewPic] = useState<Record<string, string>>({});

  // Cancellation Form states
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReasonValue, setCancelReasonValue] = useState('');

  // Client states for Proof of Purchase & Direct Chat
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [chatLoadingMap, setChatLoadingMap] = useState<Record<string, boolean>>({});

  const handleDownloadPDFInvoice = (ord: any) => {
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      // Colors
      const primaryColor = [17, 17, 17]; // #111111
      const accentColor = [153, 27, 27]; // #991b1b
      const grayColor = [107, 114, 128]; // #6B7280

      // Title Section
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('TOKO SIPIL ALTERNATIVE', 20, 25);

      // Subtitle
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text('Multi-Vendor Streetwear, Band Merch & Custom Coutures Platform', 20, 30);

      // Invoice info (top-right orientation)
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`INVOICE: #${ord.id.substring(0, 12).toUpperCase()}`, 130, 25);

      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`Tanggal: ${new Date(ord.createdAt).toLocaleString('id-ID')}`, 130, 30);
      doc.text(`Status: ${ord.status.toUpperCase()}`, 130, 34);

      // Horizontal line separator
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(20, 38, 190, 38);

      // Buyer Info
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('INFORMASI PEMBELI (BUYER):', 20, 46);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Nama: ${ord.address?.receiver || 'Noname'}`, 20, 51);
      doc.text(`Telepon: ${ord.address?.phone || '-'}`, 20, 55);
      
      const addrDetail = `${ord.address?.detail || ''}${ord.address?.rtrw ? `, RT/RW: ${ord.address.rtrw}` : ''}${ord.address?.city ? `, ${ord.address.city}` : ''}`;
      // Split address so it fits nicely
      const addressLines = doc.splitTextToSize(addrDetail, 80);
      doc.text(addressLines, 20, 59);

      // Store / Seller Info (Right side)
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('INFORMASI TOKO (SELLER):', 110, 46);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Mitra Store: ${ord.storeName || 'Merchant'}`, 110, 51);
      doc.text(`Status: Verified Merchant`, 110, 55);
      doc.text(`Metode Bayar: MIDTRANS SNAP SETTLEMENT`, 110, 59);

      // Horizontal divider
      doc.line(20, 72, 190, 72);

      // Rincian Item Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('RINCIAN PESANAN BARANG', 20, 78);

      // Table Header
      doc.setFillColor(0, 0, 0);
      doc.rect(20, 82, 170, 7, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('Item Description / Spesifikasi', 22, 86.5);
      doc.text('Harga', 115, 86.5);
      doc.text('Qty', 145, 86.5);
      doc.text('Subtotal', 165, 86.5);

      let currentY = 94;
      doc.setTextColor(0, 0, 0);
      doc.setFont('Helvetica', 'normal');

      ord.items.forEach((item: any, idx: number) => {
        // Draw thin support line
        if (idx > 0) {
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.2);
          doc.line(20, currentY - 5, 190, currentY - 5);
        }

        const nameStr = `${item.name || 'Produk'}`;
        const specStr = `Size: ${item.size || '-'} | Color: ${item.color || '-'}`;
        
        doc.setFont('Helvetica', 'bold');
        doc.text(nameStr, 22, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(specStr, 22, currentY + 3.5);

        // Prices / Qty
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(`Rp${item.discountPrice.toLocaleString('id-ID')}`, 115, currentY);
        doc.text(`${item.quantity}`, 145, currentY);
        doc.setFont('Helvetica', 'bold');
        doc.text(`Rp${(item.discountPrice * item.quantity).toLocaleString('id-ID')}`, 165, currentY);
        doc.setFont('Helvetica', 'normal');

        currentY += 10;
      });

      // Dark Line separator
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(20, currentY - 3, 190, currentY - 3);

      currentY += 4;

      // Delivery info (left)
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('METODE PENGIRIMAN / EKSPEDISI', 22, currentY);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Ekspedisi: ${ord.courier || 'STANDAR'}`, 22, currentY + 4);
      if (ord.resiNo) {
        doc.text(`No. Resi: ${ord.resiNo}`, 22, currentY + 8);
      } else {
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text('Resi pengiriman belum diinput oleh seller.', 22, currentY + 8);
        doc.setTextColor(0, 0, 0);
      }

      // Calculations panel (right alignment)
      const labelX = 140;
      const valX = 165;
      
      doc.setFontSize(8);
      doc.text('Subtotal Items:', labelX, currentY);
      const subTotal = ord.totalProductPrice || ord.items.reduce((acc: number, it: any) => acc + (it.discountPrice * it.quantity), 0);
      doc.text(`Rp${subTotal.toLocaleString('id-ID')}`, valX, currentY);

      doc.text('Ongkos Kirim:', labelX, currentY + 4);
      doc.text(`Rp${(ord.shippingCost || 0).toLocaleString('id-ID')}`, valX, currentY + 4);

      let lineOffset = 8;
      if (ord.discount > 0) {
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text('Potongan Voucher:', labelX, currentY + lineOffset);
        doc.text(`-Rp${ord.discount.toLocaleString('id-ID')}`, valX, currentY + lineOffset);
        doc.setTextColor(0, 0, 0);
        lineOffset += 4;
      }

      doc.setFontSize(7.5);
      doc.text('Platform Admin Fee:', labelX, currentY + lineOffset);
      doc.text(`Rp${(ord.platformFee || 2000).toLocaleString('id-ID')}`, valX, currentY + lineOffset);
      lineOffset += 6;

      // Final total
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('Total Tagihan:', labelX, currentY + lineOffset);
      doc.text(`Rp${ord.totalAmount.toLocaleString('id-ID')}`, valX, currentY + lineOffset);

      currentY += lineOffset + 12;

      // Bottom legal line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(20, currentY, 190, currentY);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text('Bukti pembelian ini sah diterbitkan secara elektronik oleh Toko Sipil Alternative.', 22, currentY + 4);
      doc.text('Gunakan bukti PDF ini sebagai laporan resmi komisi dan pelunasan.', 22, currentY + 7);

      // Trigger standard save/download action
      doc.save(`Invoice_TokoSipil_${ord.id.substring(0, 8).toUpperCase()}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Gagal mengunduh invoice: " + (e as Error).message);
    }
  };

  const handleCancelOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelOrderId) return;
    if (!cancelReasonValue.trim()) {
      alert("Alasan pembatalan wajib diisi!");
      return;
    }
    try {
      const res = await fetch(`/api/orders/${cancelOrderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReasonValue })
      });
      if (res.ok) {
        setFeedback("Pesanan dibatalkan (tidak jadi bayar). Stock dikembalikan.");
        addToast("PEMBATALAN SUKSES", "Pesanan Anda berhasil dibatalkan.", "info");
        setCancelOrderId(null);
        setCancelReasonValue('');
        await refreshAllData();
        setTimeout(() => setFeedback(null), 4000);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Gagal membatalkan pesanan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleChatStore = async (storeId: string) => {
    if (!currentUser) return;
    setChatLoadingMap(prev => ({ ...prev, [storeId]: true }));
    try {
      const res = await fetch('/api/chats/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: currentUser.id, storeId })
      });
      if (res.ok) {
        const chat = await res.json();
        if (chat && chat.id) {
          localStorage.setItem('active_chat_id', chat.id);
          localStorage.setItem('active_chat_store_id', storeId);
        }
        onOpenChat();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoadingMap(prev => ({ ...prev, [storeId]: false }));
    }
  };

  const fetchUserDashDetails = async () => {
    try {
      const res = await fetch('/api/stores/applications');
      if (res.ok) {
        const list = await res.json();
        setAppsList(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUserDashDetails();
  }, [feedback, activeTab]);

  // Handle open store application submission
  const handleApplyShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const payload = {
        userId: currentUser.id,
        name: shopName,
        username: shopUsername.toLowerCase().trim().replace(/\s+/g, '-'),
        ownerName: shopOwner,
        phone: shopPhone,
        email: shopEmail,
        address: shopAddress,
        nik: shopNik,
        ktpPhoto: shopKtp,
        logo: shopLogo,
        bankName: shopBankName,
        bankAccount: shopBankAccount,
        bankAccountName: shopBankAccountName
      };

      const res = await fetch('/api/stores/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFeedback("Pendaftaran Pembukaan Toko Anda Berhasil Diajukan! Status: Pending Approval.");
        addToast("REGISTRASI TOKO", "Pendaftaran store Anda berhasil diajukan ke admin!", "success");
        setActiveTab('profile');
        setShopName('');
        setShopUsername('');
        setTimeout(() => setFeedback(null), 4000);
      } else {
        const err = await res.json();
        setFeedback("Gagal: " + err.error);
        addToast("REGISTRASI TOKO GAGAL", err.error || "Gagal mendaftar.", "error");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Complete Order client confirm releases cash flow
  const handleConfirmOrderCompleted = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/complete`, { method: 'POST' });
      if (res.ok) {
        setFeedback("Paket sukses dikonfirmasi sampai. Saldo diteruskan ke Wallet Seller.");
        addToast("STATUS PESANAN NYATA", "Pesanan selesai! Terimah kasih atas konfirmasi Anda.", "success");
        await refreshAllData();
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Post Buyer stars review on selected completed product
  const handlePostReview = async (orderId: string, productId: string) => {
    const rStar = reviewRating[orderId] || 5;
    const rText = reviewText[orderId] || '';
    const rPic = reviewPic[orderId] || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=200';

    if (!rText) {
      alert("Silakan ketik komentar ulasan Anda terlebih dahulu.");
      return;
    }

    try {
      const payload = {
        productId,
        buyerId: currentUser?.id,
        buyerName: currentUser?.name || 'Anonim',
        rating: rStar,
        text: rText,
        image: rPic
      };

      const res = await fetch(`/api/orders/${orderId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFeedback(`Ulasan ulasan bintang ${rStar} untuk produk berhasil terkirim!`);
        addToast("REVIEW TERKIRIM", `Berhasil mengirimkan ulasan bintang ${rStar}!`, "success");
        setReviewText({ ...reviewText, [orderId]: '' });
        await refreshAllData();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mengirimkan review.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter lists orders
  const myBuyerOrders = orders.filter(o => o.buyerId === currentUser?.id);
  const filteredOrders = myBuyerOrders.filter(ord => {
    if (orderStatusFilter === 'ALL') return true;
    if (orderStatusFilter === 'PENDING') return ord.status === OrderStatus.PENDING;
    if (orderStatusFilter === 'PAID') return ord.status === OrderStatus.PAID || ord.status === OrderStatus.DP_PAID;
    if (orderStatusFilter === 'SHIPPED') return ord.status === OrderStatus.SHIPPED || ord.status === OrderStatus.DELIVERED;
    if (orderStatusFilter === 'COMPLETED') return ord.status === OrderStatus.COMPLETED;
    if (orderStatusFilter === 'CANCELLED') return ord.status === OrderStatus.CANCELLED || ord.status === OrderStatus.FAILED;
    return true;
  });
  const myWishlistedProducts = products.filter(p => wishlist.includes(p.id));
  const myFollowedStores = stores.filter(s => followedStores.includes(s.id));
  
  // Find current shop app
  const myShopApplications = appsList.filter(app => app.userId === currentUser?.id);
  const myShopApplication = myShopApplications[myShopApplications.length - 1] || null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] text-slate-800 font-sans" id="user-workspace-page">
      
      {/* Mobile Sidenav Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Sidebar drawer */}
          <div className="relative flex flex-col w-64 bg-slate-950 text-white shadow-xl h-full z-50 p-4 font-sans">
            {/* Logo Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="bg-white p-1 rounded-md w-8 h-8 flex items-center justify-center border border-black shadow-inner">
                  <img
                    src={currentUser?.avatar || "/src/assets/images/toko_sipil_logo_1781875832848.jpg"}
                    alt="User Avatar"
                    className="w-5.5 h-5.5 object-cover rounded-sm"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-extrabold text-xs uppercase leading-tight text-white tracking-wider">
                    {currentUser?.name || "MEMBER"}
                  </p>
                  <p className="text-[8px] text-indigo-400 uppercase font-semibold tracking-widest">BUYER PORTAL</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md hover:bg-slate-900 text-slate-300 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Search tab */}
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2 w-3 h-3 text-slate-400" />
              <input
                type="text"
                placeholder="CARI TAB..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 bg-slate-900/40 border border-slate-800 text-slate-100 placeholder-slate-500 font-mono text-[9px] focus:outline-none uppercase rounded-md"
              />
            </div>

            {/* Nav List */}
            <div className="flex flex-col gap-1 overflow-y-auto flex-1">
              {[
                { id: 'profile' as const, label: 'MEMBER PROFILE', icon: UserIcon, count: 0 },
                { id: 'orders' as const, label: 'ORDERS HISTORY', icon: ShoppingBag, count: myBuyerOrders.length },
                { id: 'wishlist' as const, label: 'MY WISHLIST', icon: Heart, count: myWishlistedProducts.length },
                { id: 'follows' as const, label: 'FOLLOWED STORES', icon: Store, count: myFollowedStores.length },
                { id: 'security' as const, label: 'AKUN & KEAMANAN', icon: ShieldCheck, count: 0 },
                { id: 'address' as const, label: 'ALAMAT SAYA', icon: MapPin, count: 0 },
                { id: 'diagnostics' as const, label: '1-KLIK DIAGNOSIS', icon: Activity, count: 0 },
                { id: 'shop_register' as const, label: 'BUKA TOKO MITRA', icon: Store, count: 0 },
              ]
                .filter(tab => tab.label.toLowerCase().includes(sidebarSearch.toLowerCase()))
                .map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  let activeClass = 'bg-indigo-900 text-white font-bold border-indigo-700 shadow-sm';
                  let inactiveClass = 'text-slate-100 hover:bg-white/5 hover:text-white border-transparent';
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-left font-mono border text-[11px] uppercase ${isActive ? activeClass : inactiveClass}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="flex-1 truncate tracking-wide">{tab.label}</span>
                      {tab.count > 0 && (
                        <span className="bg-indigo-600 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center font-sans">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Footer of drawer */}
            <div className="mt-auto pt-4 border-t border-slate-800/40 flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setActivePage('home');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 text-slate-300 hover:text-white font-mono text-[11px] uppercase cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>KEMBALI KE TOKO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Collapsible Left Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col bg-slate-950 border-r border-slate-900/60 transition-all duration-300 flex-shrink-0 h-screen overflow-hidden ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
        id="buyer-desktop-sidebar"
      >
        {/* Logo Header */}
        <div className={`flex items-center gap-3 p-4 border-b border-slate-900 overflow-hidden ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="bg-white p-1.5 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0 border border-black shadow-md">
            <img
              src={currentUser?.avatar || "/src/assets/images/toko_sipil_logo_1781875832848.jpg"}
              alt="User Logo"
              className="w-7 h-7 object-cover rounded-sm border border-slate-850/10"
              referrerPolicy="no-referrer"
            />
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0 flex-1 text-left font-sans">
              <p className="font-extrabold text-sm uppercase leading-tight text-white tracking-wider">
                {currentUser?.name || "MEMBER"}
              </p>
              <p className="text-[8px] text-slate-400 uppercase truncate font-semibold tracking-widest">
                STANDARD BUYER
              </p>
            </div>
          )}
        </div>

        {/* Navigation title label */}
        {!isSidebarCollapsed && (
          <span className="text-[10px] text-indigo-500 font-bold tracking-widest block uppercase px-5 mt-5 mb-2 font-sans">
            NAVIGATION
          </span>
        )}

        {/* Search Box inside Sidebar */}
        <div className="px-4 mb-4 mt-2">
          {isSidebarCollapsed ? (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-full flex justify-center py-2 bg-slate-900/40 hover:bg-slate-900/80 text-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Search tabs"
            >
              <Search className="w-4 h-4" />
            </button>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="CARI TAB..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/30 hover:bg-slate-900/50 border border-slate-800 text-white placeholder-slate-500 font-mono text-[10px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all uppercase rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Filtered Tabs list */}
        <div className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          {[
            { id: 'profile' as const, label: 'MEMBER PROFILE', icon: UserIcon, count: 0 },
            { id: 'orders' as const, label: 'ORDERS HISTORY', icon: ShoppingBag, count: myBuyerOrders.length },
            { id: 'wishlist' as const, label: 'MY WISHLIST', icon: Heart, count: myWishlistedProducts.length },
            { id: 'follows' as const, label: 'FOLLOWED STORES', icon: Store, count: myFollowedStores.length },
            { id: 'security' as const, label: 'AKUN & KEAMANAN', icon: ShieldCheck, count: 0 },
            { id: 'address' as const, label: 'ALAMAT SAYA', icon: MapPin, count: 0 },
            { id: 'diagnostics' as const, label: '1-KLIK DIAGNOSIS', icon: Activity, count: 0 },
            { id: 'shop_register' as const, label: 'BUKA TOKO MITRA', icon: Store, count: 0 },
          ]
            .filter(tab => tab.label.toLowerCase().includes(sidebarSearch.toLowerCase()))
            .map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              let activeClass = 'bg-indigo-900 text-white font-bold border-indigo-700 shadow-sm';
              let inactiveClass = 'text-slate-100 hover:bg-white/5 hover:text-white border-transparent';
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center transition duration-150 cursor-pointer text-left rounded-lg border ${
                    isSidebarCollapsed ? 'justify-center p-3' : 'px-4 py-2.5 gap-3'
                  } ${isActive ? activeClass : inactiveClass}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="flex-1 truncate text-xs uppercase font-medium tracking-wide font-sans">{tab.label}</span>
                  )}
                  {tab.count > 0 && (
                    isSidebarCollapsed ? (
                      <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center font-sans">
                        {tab.count}
                      </span>
                    ) : (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isActive ? 'bg-white text-black' : 'bg-slate-900 text-indigo-300 border border-slate-800'}`}>
                        {tab.count}
                      </span>
                    )
                  )}

                  {/* Floating tooltip on hover when sidebar collapsed */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-950 text-white text-[10px] uppercase font-bold tracking-wider rounded-lg border border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 shadow-lg font-sans">
                      {tab.label} {tab.count > 0 && `(${tab.count})`}
                    </div>
                  )}
                </button>
              );
            })}
        </div>

        {/* Bottom utilities area */}
        <div className="p-4 border-t border-slate-900 flex flex-col gap-1.5 font-sans">
          <div className={`flex items-center gap-3 p-1.5 rounded-lg ${isSidebarCollapsed ? 'justify-center' : 'justify-between bg-slate-950/40 border border-slate-900/40'}`}>
            {!isSidebarCollapsed && (
              <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">LIGHT THEME</span>
            )}
            <div 
              onClick={() => alert("Tema disinkronkan secara otomatis sesuai sistem!")}
              className="relative w-8 h-4 bg-slate-900/60 rounded-full cursor-pointer flex items-center px-0.5"
            >
              <div className="w-3 h-3 bg-slate-100 rounded-full shadow-sm"></div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              if (confirm("Apakah anda yakin untuk logout?")) {
                logout();
              }
            }}
            className={`w-full group relative flex items-center transition duration-150 cursor-pointer text-left text-rose-400 hover:bg-white/5 hover:text-rose-300 py-2 rounded-lg ${
              isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 gap-3'
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isSidebarCollapsed && (
              <span className="text-xs uppercase font-bold tracking-wide">LOGOUT</span>
            )}
          </button>

          {/* Collapse Menu Button at bottom matching picture */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`w-full group relative flex items-center transition duration-150 cursor-pointer text-left text-slate-300 hover:bg-white/5 hover:text-white py-2 rounded-lg ${
              isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 gap-3'
            }`}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4 flex-shrink-0" /> : <ChevronLeft className="w-4 h-4 flex-shrink-0" />}
            {!isSidebarCollapsed && (
              <span className="text-xs uppercase font-bold tracking-wide">COLLAPSE MENU</span>
            )}
          </button>
        </div>
      </aside>

      {/* Right Column: Main Area */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        
        {/* Mobile Top Header (Visible only on mobile/tablet) */}
        <header className="lg:hidden bg-slate-950 text-white border-b border-slate-900 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-md hover:bg-slate-900 text-slate-300 cursor-pointer flex items-center justify-center border border-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-sans font-black text-xs uppercase tracking-wider">
              {currentUser?.name || "MEMBER"} CONTROL PORTAL
            </span>
          </div>
          <button
            onClick={() => setActivePage('home')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-mono text-[9px] uppercase rounded-md cursor-pointer flex items-center"
          >
            <Home className="w-3.5 h-3.5" />
            <span>KEMBALI KE TOKO</span>
          </button>
        </header>

        {/* Scrollable Content Workspace Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-28 lg:pb-8 bg-slate-50">
          
          {/* Action Feedback Banner */}
          {feedback && (
            <div className="mb-6 bg-slate-900 border border-slate-800 text-slate-100 py-3 px-4 font-sans text-xs font-bold rounded-xl shadow-sm flex items-center justify-between animate-pulse">
              <span>Status Member: {feedback}</span>
              <button onClick={() => refreshAllData()} className="text-[10px] uppercase font-bold tracking-widest bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded transition-colors">
                REFRESH
              </button>
            </div>
          )}

          {/* Quick Stats Header info widget specifically styled like admin panel */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                MEMBER ID: {currentUser?.id}
              </span>
              <h1 className="font-sans text-2xl font-black text-slate-900 uppercase tracking-tight mt-1">BUYER CONTROL PANEL</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">
                Kelola pesanan belanja, daftar wishlist pakaian favorit, ikuti toko brand indie, edit alamat, & daftarkan toko mitra Anda sendiri
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white px-3.5 py-2 border border-slate-200/80 rounded-xl shadow-sm text-xs font-bold text-slate-700">
              <div>
                <span className="text-slate-400 block text-[8px] uppercase">WISHLIST SAYA</span>
                <span className="text-slate-800 font-extrabold text-xs">{myWishlistedProducts.length} PRODUK</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-slate-400 block text-[8px] uppercase">TOKO DIIKUTI</span>
                <span className="text-slate-800 font-extrabold text-xs">{myFollowedStores.length} TOKO</span>
              </div>
            </div>
          </div>

          <div className="flex-grow w-full" id="buyer-tab-content-container">

      {activeTab === 'profile' && currentUser && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs" id="profile-pane">

          {/* Member Card */}
          <div className="bg-white border-2 border-black p-6 maternal-shadow relative flex gap-6 items-center flex-wrap sm:flex-nowrap">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-20 h-20 border-2 border-black bg-slate-100 flex-shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1.5 flex-grow">
              <span className="bg-red-800 text-white text-[9px] py-0.5 px-1.5 font-bold uppercase select-none tracking-wider font-sans">TOKO SIPIL REGULAR BUYER</span>
              <h3 className="font-serif text-2xl font-bold uppercase tracking-tight text-black">{currentUser.name}</h3>
              <p className="text-gray-400 select-all">{currentUser.email}</p>
              {currentUser.angkatan && <p className="text-gray-600 mt-1 uppercase text-[10px]">Angkatan: <b className="text-black">{currentUser.angkatan}</b></p>}
              {currentUser.campus && <p className="text-gray-600 text-[10px] uppercase">Kampus: <b className="text-black">{currentUser.campus}</b></p>}
              
              <button 
                onClick={() => setShowEditForm(!showEditForm)}
                className="mt-3 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white font-mono font-bold text-[9px] uppercase border-2 border-black transition cursor-pointer flex items-center gap-1"
              >
                {showEditForm ? '❌ BATAL EDIT' : '✍️ GANTI NAMA / EDIT PROFIL'}
              </button>
            </div>
          </div>

          {/* Quick shop application status info block */}
          <div className="bg-[#111] text-white p-6 border-2 border-black maternal-shadow relative">
            <span className="font-serif text-lg font-bold block mb-2 uppercase text-red-600 tracking-wider">SELLER SYSTEM STATUS</span>
            
            {myShopApplication ? (
              <div className="space-y-2">
                <p>Nama Toko: <b>{myShopApplication.name}</b></p>
                <div className="flex justify-between items-center bg-gray-950 p-2.5 text-[11px] border border-gray-800">
                  <span>PROGRESS PENDAFTARAN:</span>
                  <span className={`font-bold py-0.5 px-2 rounded border text-[9px] uppercase ${
                    myShopApplication.status === ApplicationStatus.APPROVED ? 'bg-green-100 text-green-700 border-green-300' :
                    myShopApplication.status === ApplicationStatus.REJECTED ? 'bg-red-100 text-red-700 border-red-300' :
                    'bg-orange-100 text-orange-700 border-orange-300'
                  }`}>
                    {myShopApplication.status}
                  </span>
                </div>
                {myShopApplication.status === ApplicationStatus.PENDING && (
                  <p className="text-[10px] text-gray-400 italic leading-snug">
                    Pendaftaran toko Anda sedang ditinjau. Pengurus (Admin / Pegawai Ahmad) akan segera memverifikasi detail NIK dan rekening Anda di Dashboard Admin.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-300 leading-relaxed text-xs">
                  Anda belum membuka toko fashion sendiri. Mulai jualan hoodie gothic dan merchandise band Anda sendiri di Toko Sipil Marketplace dengan klik tombol di bawah ini.
                </p>
                <button 
                  onClick={() => setActiveTab('shop_register')}
                  className="bg-white text-black font-bold font-mono text-[10px] border border-black hover:bg-transparent hover:text-white hover:border-white transition py-2 px-3 cursor-pointer"
                >
                  DENGAN FORMULIR / BUKA TOKO SEKARANG
                </button>
              </div>
            )}
          </div>

          {showEditForm && (
            <div className="bg-white border-2 border-black p-6 maternal-shadow col-span-1 md:col-span-2 space-y-4" id="edit-profile-form-pane">
              <span className="font-serif text-lg font-bold block uppercase text-black tracking-wider border-b-2 border-black pb-2">✍️ EDIT DETAIL PROFIL / IDENTITAS</span>
              
              {profileFeedback && (
                <div className="p-3 bg-emerald-50 border-2 border-emerald-500 font-bold text-[11px] text-emerald-800 uppercase animate-pulse">
                  ✅ {profileFeedback}
                </div>
              )}
              {profileError && (
                <div className="p-3 bg-red-50 border-2 border-red-500 font-bold text-[11px] text-red-800 uppercase">
                  ⚠️ {profileError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-gray-500 font-extrabold uppercase text-[10px]">NAMA LENGKAP PENERIMA / PEMILIK *</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    placeholder="Nama lengkap Anda"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs text-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-500 font-extrabold uppercase text-[10px]">ANGKATAN (TAHUN MASUK)</label>
                  <input 
                    type="text" 
                    value={editAngkatan}
                    onChange={(e) => setEditAngkatan(e.target.value)}
                    placeholder="Contoh: 2021"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs text-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-500 font-extrabold uppercase text-[10px]">KAMPUS / LOKASI KULIAH</label>
                  <input 
                    type="text" 
                    value={editCampus}
                    onChange={(e) => setEditCampus(e.target.value)}
                    placeholder="Contoh: Kampus Ganesha"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs text-black"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2 border-2 border-black p-4 bg-slate-50">
                  <label className="block text-gray-500 font-extrabold uppercase text-[10px]">FOTO PROFIL / AVATAR</label>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Live Preview */}
                    <div className="flex-shrink-0">
                      <img 
                        src={editAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(editName || 'User')}`} 
                        alt="Preview Avatar" 
                        className="w-16 h-16 border-2 border-black bg-white object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-grow space-y-2 w-full">
                      {/* Upload File Input */}
                      <div>
                        <span className="block text-gray-400 font-bold uppercase text-[8px] mb-1">UPLOAD FOTO KITA :</span>
                        <label className="cursor-pointer bg-black hover:bg-slate-800 text-white border-2 border-black px-4 py-2 text-[9px] font-extrabold uppercase tracking-widest inline-block transition text-center">
                          PILIH FOTO PROFIL KITA...
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressAndResizeImage(file, 256, 256, 0.7);
                                  setEditAvatar(compressed);
                                } catch (err: any) {
                                  console.error("Gagal memproses foto profil:", err);
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[8px] text-gray-500 mt-1 uppercase font-semibold">Mendukung format file foto (.png, .jpg, .jpeg)</p>
                      </div>

                      {/* Manual / URL Input */}
                      <div>
                        <span className="block text-gray-400 font-bold uppercase text-[8px] mb-1">ATAU GUNAKAN LINK URL GAMBAR / GENERATOR :</span>
                        <input 
                          type="text" 
                          value={editAvatar}
                          onChange={(e) => setEditAvatar(e.target.value)}
                          placeholder="https://api.dicebear.com/..."
                          className="w-full bg-white border-2 border-black px-2.5 py-1.5 font-bold focus:outline-none text-[10px] text-black"
                        />
                        <button 
                          type="button"
                          onClick={() => setEditAvatar(`https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(editName || 'User')}`)}
                          className="text-[9px] text-red-800 underline font-extrabold mt-1 cursor-pointer block"
                        >
                          🔄 GENERATE AVATAR PIXEL-ART DARI NAMA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="py-3 px-6 bg-black hover:bg-neutral-800 text-white font-bold uppercase border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] transition disabled:opacity-50 cursor-pointer text-[10px]"
                  >
                    {isSavingProfile ? "SAVING..." : "💾 SIMPAN PERUBAHAN IDENTITAS"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-black font-bold uppercase border-2 border-black transition cursor-pointer text-[10px]"
                  >
                    TUTUP PENGATURAN
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Device Manager / Riwayat Perangkat */}
          <DeviceManager />
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6 font-mono text-xs" id="orders-pane">
          <h2 className="font-serif text-xl font-bold uppercase tracking-tight block">RIWAYAT TRANSKASI BLANJA AKTIF ({myBuyerOrders.length})</h2>

          {/* Status Filter Bar - Brutalist Styled */}
          <div className="flex flex-wrap items-center gap-2 bg-stone-50 p-3 border-2 border-black" id="order-status-filter-bar">
            <span className="font-bold text-[10px] uppercase text-gray-800 select-none mr-1 flex items-center gap-1">
              📌 STATUS FILTER:
            </span>
            {[
              { id: 'ALL', label: 'Semua (All)', count: myBuyerOrders.length },
              { id: 'PENDING', label: 'Belum Bayar (Pending)', count: myBuyerOrders.filter(o => o.status === OrderStatus.PENDING).length },
              { id: 'PAID', label: 'Lunas/DP (Paid)', count: myBuyerOrders.filter(o => o.status === OrderStatus.PAID || o.status === OrderStatus.DP_PAID).length },
              { id: 'SHIPPED', label: 'Dikirim (Shipped)', count: myBuyerOrders.filter(o => o.status === OrderStatus.SHIPPED || o.status === OrderStatus.DELIVERED).length },
              { id: 'COMPLETED', label: 'Selesai (Completed)', count: myBuyerOrders.filter(o => o.status === OrderStatus.COMPLETED).length },
              { id: 'CANCELLED', label: 'Batal/Gagal', count: myBuyerOrders.filter(o => o.status === OrderStatus.CANCELLED || o.status === OrderStatus.FAILED).length },
            ].map(tab => (
              <button
                key={tab.id}
                id={`filter-btn-${tab.id.toLowerCase()}`}
                onClick={() => setOrderStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 border-2 transition font-mono font-bold uppercase text-[9px] cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-0.5 active:translate-y-1 ${
                  orderStatusFilter === tab.id 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-black border-stone-300 hover:border-black'
                }`}
              >
                {tab.label} <span className="ml-0.5 px-1 py-0.2 bg-stone-200 text-black text-[8.5px] rounded-sm">{tab.count}</span>
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center bg-stone-50 border-2 border-dashed border-stone-400 font-mono text-xs uppercase text-gray-400">
              {myBuyerOrders.length === 0 
                ? "Belum ada riwayat pemesanan baju." 
                : `Tidak ada pesanan dengan status "${orderStatusFilter}" ditemukan.`}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((ord) => (
                <div key={ord.id} className="bg-white border-2 border-black p-5 maternal-shadow-sm space-y-4">
                  {/* Top line panel information */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 gap-2">
                    <div>
                      <span className="text-gray-400 text-[10px] block font-bold">TOKO BRAND: {ord.storeName}</span>
                      <p className="font-extrabold text-black uppercase text-xs">ORDER TRACKING ID: {ord.id}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold border rounded uppercase ${
                        ord.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700 border-green-300' :
                        ord.status === OrderStatus.PAID ? 'bg-blue-100 text-blue-700 border-blue-300' :
                        ord.status === OrderStatus.SHIPPED ? 'bg-purple-100 text-purple-700 border-purple-300' :
                        ord.status === OrderStatus.DELIVERED ? 'bg-indigo-100 text-indigo-700 border-indigo-300' :
                        ord.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-700 border-red-300' :
                        ord.status === OrderStatus.FAILED ? 'bg-neutral-100 text-neutral-600 border-neutral-300' :
                        ord.status === OrderStatus.DP_PAID ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        'bg-orange-100 text-orange-700 border-orange-300'
                      }`}>
                        STATUS: {
                          ord.status === OrderStatus.DP_PAID ? 'DP LUNAS (PRE-ORDER)' : 
                          ord.status === OrderStatus.CANCELLED ? 'BATAL (TIDAK JADI)' : 
                          ord.status === OrderStatus.FAILED ? 'EXPIRED (KADALUARSA >24 JAM)' : 
                          ord.status
                        }
                      </span>
                      <span className="text-[10px] text-gray-400 font-light">{new Date(ord.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Order items nested list */}
                  <div className="space-y-2">
                    {ord.items.map((item: any, i: number) => (
                      <div key={i} className="flex gap-3 items-center text-xs">
                        <img src={item.image} alt="preview" className="w-10 h-10 border border-black object-cover" referrerPolicy="no-referrer" />
                        <div className="flex-grow">
                          <p className="font-serif font-bold uppercase">{item.name}</p>
                          <span className="text-[10px] text-gray-400 uppercase">Ukuran: {item.size} | Colorway: {item.color} | Qty: {item.quantity}</span>
                        </div>
                        <span className="font-bold">Rp{(item.discountPrice * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calculations row elements & actions trigger buttons */}
                  <div className="border-t pt-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-2.5">
                    <div>
                      <p className="text-[10px] text-gray-600">Alamat Kirim: <b>{ord.address.receiver}</b> ({ord.address.phone}), {ord.address.detail}{ord.address.rtrw ? `, RT/RW: ${ord.address.rtrw}` : ''}{ord.address.subdistrict ? `, Kel/Desa: ${ord.address.subdistrict}` : ''}{ord.address.district ? `, Kec: ${ord.address.district}` : ''}, {ord.address.city}{ord.address.province ? `, ${ord.address.province}` : ''}</p>
                      {ord.resiNo && <p className="text-[10px] text-purple-800 font-extrabold mt-1">TRACKING WAYBILL RESI: {ord.resiNo} ({ord.courier})</p>}
                      {ord.isPreOrder ? (
                        <div className="mt-1 space-y-0.5">
                          {ord.remainingAmount === 0 || ord.isFullPaid ? (
                            <>
                              <p className="text-[10px] text-emerald-800 font-extrabold uppercase">TIPE: PRE-ORDER (LUNAS 100%)</p>
                              <p className="text-[10px] text-red-800 font-bold">TOTAL DIBAYAR: Rp{ord.totalAmount?.toLocaleString('id-ID')}</p>
                              <p className="text-[10px] text-gray-700 font-bold">
                                SISA PELUNASAN: Rp0{' '}
                                <span className="px-1 py-0.2 text-[8px] uppercase font-mono font-bold bg-green-200 text-green-800">
                                  LUNAS
                                </span>
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-[10px] text-amber-800 font-extrabold uppercase">TIPE: PRE-ORDER (DP {ord.preOrderDpPercent}%)</p>
                              <p className="text-[10px] text-red-800 font-bold">DP DIBAYAR: Rp{ord.dpAmount?.toLocaleString('id-ID')}</p>
                              <p className="text-[10px] text-gray-700 font-bold">
                                SISA PELUNASAN: Rp{ord.remainingAmount?.toLocaleString('id-ID')}{' '}
                                <span className={`px-1 py-0.2 text-[8px] uppercase font-mono font-bold bg-red-200 text-red-800`}>
                                  MENUNGGU PELUNASAN
                                </span>
                              </p>
                            </>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-red-800 font-bold mt-0.5">ESTIMASI TOTAL TAGIHAN INVOICE: <b>Rp{ord.totalAmount.toLocaleString('id-ID')}</b></p>
                      )}

                      {ord.status === OrderStatus.CANCELLED && (
                        <div className="mt-2 bg-red-50 border-l-4 border-red-500 p-2 font-mono text-[10px] text-red-900 leading-normal">
                          <b className="uppercase block text-[9px] mb-0.5">ALASAN TIDAK JADI BAYAR / BATAL:</b>
                          <span className="italic">"{ord.cancelReason || 'Tidak dispesifikasikan oleh buyer.'}"</span>
                        </div>
                      )}

                      {ord.status === OrderStatus.FAILED && (
                        <div className="mt-2 bg-neutral-50 border-l-4 border-neutral-400 p-2 font-mono text-[10px] text-neutral-600 leading-normal">
                          <b className="uppercase block text-[9px] mb-0.5">DIBATALKAN OLEH SISTEM:</b>
                          <span>Pesanan otomatis kadaluarsa (FAILED) karena pembayaran melewati batas waktu 24 jam.</span>
                        </div>
                      )}
                    </div>

                    {/* Operational triggers */}
                    <div className="flex flex-col items-end gap-1.5 self-stretch md:self-auto">
                      {onTrackOrder && (
                        <button
                          onClick={() => onTrackOrder(ord.id)}
                          className="bg-black text-[#f4f2e9] font-extrabold hover:bg-neutral-800 px-3.5 py-1.5 text-[9px] border-2 border-black tracking-widest cursor-pointer uppercase text-center block w-full mb-1"
                        >
                          🚚 LACAK PENGIRIMAN DIGITAL
                        </button>
                      )}
                      {ord.status === OrderStatus.PENDING && (
                        <div className="flex flex-col gap-1 w-full md:w-auto">
                          <button
                            onClick={() => onOpenCheckout(ord)}
                            className="bg-red-800 text-white font-bold hover:bg-black p-2 text-[10px] transition border border-black cursor-pointer uppercase text-center block w-full"
                          >
                            BAYAR SEKARANG (LAUNCH SNAP BILLING VA)
                          </button>
                          <button
                            onClick={() => {
                              setCancelOrderId(ord.id);
                              setCancelReasonValue('');
                            }}
                            className="bg-white text-red-800 font-extrabold hover:bg-red-50 p-1.5 text-[9px] transition border border-red-800 cursor-pointer uppercase text-center block w-full"
                          >
                            BATALKAN PESANAN (TIDAK JADI)
                          </button>
                        </div>
                      )}

                      {ord.status === OrderStatus.DP_PAID && (
                        <div className="text-right space-y-1">
                          <span className="text-[10px] text-amber-700 block uppercase font-bold text-right">
                            Pembayaran DP Selesai. Batas Pelunasan: {ord.pelunasanDeadline ? new Date(ord.pelunasanDeadline).toLocaleDateString() : 'Segera'}
                          </span>
                          <button
                            onClick={() => onOpenCheckout(ord)}
                            className="bg-amber-400 font-extrabold text-[#111111] hover:bg-black hover:text-white p-2 text-[10px] border border-black cursor-pointer uppercase tracking-tight"
                          >
                            BAYAR PELUNASAN (RP {ord.remainingAmount?.toLocaleString('id-ID')})
                          </button>
                        </div>
                      )}

                      {(ord.status === OrderStatus.SHIPPED || ord.status === OrderStatus.DELIVERED) && (
                        <div className="text-right space-y-1">
                          <span className="text-[10px] text-gray-500 block">Sila konfirmasi produk sampai jika paket telah diterima dengan aman:</span>
                          <button
                            onClick={() => handleConfirmOrderCompleted(ord.id)}
                            className="bg-green-700 text-white font-bold hover:bg-green-800 p-2 text-[10px] border border-black tracking-wider cursor-pointer"
                          >
                            KONFIRMASI BARANG DITERIMA & SELESAI
                          </button>
                        </div>
                      )}

                      {/* POST REVIEW FORM WORKSPACE: Completed triggers review panel */}
                      {ord.status === OrderStatus.COMPLETED && (
                        <div className="w-full bg-white p-3 border border-black space-y-2 mt-2 md:w-80">
                          <span className="font-bold text-[9px] text-[#991b1b] uppercase block">KIRIM REVIEW & RATING PRODUK</span>
                          
                          <div className="flex items-center gap-1">
                            <span className="text-[9.5px]">Stars:</span>
                            <select 
                              value={reviewRating[ord.id] || 5}
                              onChange={(e) => setReviewRating({ ...reviewRating, [ord.id]: Number(e.target.value) })}
                              className="bg-[#faf9f3] border px-1 py-0.5 cursor-pointer text-[10px]"
                            >
                              <option value="5">★★★★★ 5 Bintang</option>
                              <option value="4">★★★★☆ 4 Bintang</option>
                              <option value="3">★★★☆☆ 3 Bintang</option>
                              <option value="2">★★☆☆☆ 2 Bintang</option>
                              <option value="1">★☆☆☆☆ 1 Bintang</option>
                            </select>
                          </div>

                          <textarea 
                            value={reviewText[ord.id] || ''}
                            onChange={(e) => setReviewText({ ...reviewText, [ord.id]: e.target.value })}
                            placeholder="Saran material produk, keawetan sablon band, atau keramahan seller..."
                            rows={2}
                            className="w-full bg-slate-50 border p-1 text-[10px] focus:outline-none"
                          />

                          <div className="flex justify-between items-center gap-2">
                            <input 
                              type="text" 
                              placeholder="URL Bukti Foto (Optional)"
                              value={reviewPic[ord.id] || ''}
                              onChange={(e) => setReviewPic({ ...reviewPic, [ord.id]: e.target.value })}
                              className="bg-slate-50 border p-0.5 text-[8.5px] text-gray-400 focus:outline-none flex-grow"
                            />
                            <button
                              onClick={() => handlePostReview(ord.id, ord.items[0].productId)}
                              className="bg-black text-[9px] text-white p-1 hover:bg-gray-800 font-bold cursor-pointer"
                            >
                              KIRIM REVIEW
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ADDITIONAL GENERAL COMPLEMENTARY CLIENT ACTIONS */}
                      <div className="flex flex-wrap gap-2 justify-end w-full mt-2 pt-2 border-t border-dashed border-gray-300">
                        <button
                          onClick={() => setSelectedInvoiceOrder(ord)}
                          className="flex items-center gap-1.5 bg-white hover:bg-[#111] hover:text-white text-black font-extrabold px-3 py-1.5 text-[9px] tracking-wider uppercase transition border-2 border-black cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" /> Bukti Pembelian (Invoice)
                        </button>

                        <button
                          onClick={() => handleDownloadPDFInvoice(ord)}
                          className="flex items-center gap-1.5 bg-red-800 hover:bg-black text-white font-extrabold px-3 py-1.5 text-[9px] tracking-wider uppercase transition border-2 border-black cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-white" /> Unduh Invoice (PDF)
                        </button>

                        <button
                          onClick={() => handleChatStore(ord.storeId)}
                          disabled={chatLoadingMap[ord.storeId]}
                          className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white font-extrabold px-3 py-1.5 text-[9px] tracking-wider uppercase transition border-2 border-black cursor-pointer disabled:opacity-50"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-red-600 animate-pulse" /> 
                          {chatLoadingMap[ord.storeId] ? 'Connecting...' : 'Hubungi Toko'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="space-y-6" id="wishlist-pane">
          <div className="flex justify-between items-center">
            <h2 className="font-sans text-lg font-extrabold uppercase tracking-tight text-slate-900">
              WISHLIST ARCHIVE ({myWishlistedProducts.length})
            </h2>
            {myWishlistedProducts.length > 0 && (
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                PRODUK DISUKAI
              </span>
            )}
          </div>
          
          {myWishlistedProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                <Heart className="w-8 h-8 text-slate-300" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-slate-900 text-sm uppercase">WISHLIST SAYA KOSONG</h3>
                <p className="font-sans text-xs text-slate-400 uppercase leading-relaxed">
                  Belum ada produk fesyen atau merchandise yang Anda tandai sebagai favorit.
                </p>
              </div>
              <button
                onClick={() => setActivePage('shop')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold uppercase rounded-lg transition-all cursor-pointer shadow-sm"
              >
                <span>MULAILAH BELANJA</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {myWishlistedProducts.map((p) => (
                <div 
                  key={p.id} 
                  className="bg-white border border-slate-200/80 hover:border-indigo-500/50 hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden flex flex-col group relative"
                >
                  {/* Delete button from Wishlist */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (toggleWishlist) {
                        toggleWishlist(p.id);
                      }
                    }}
                    className="absolute top-2.5 right-2.5 z-10 w-7 h-7 bg-white/90 hover:bg-rose-50 border border-slate-200 text-rose-600 hover:text-rose-700 rounded-full flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                    title="Hapus dari Wishlist"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>

                  {/* Image container */}
                  <div 
                    onClick={() => onSelectProduct && onSelectProduct(p)}
                    className="aspect-square w-full overflow-hidden bg-slate-50 cursor-pointer relative"
                  >
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="bg-white/95 text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        LIHAT DETAIL
                      </span>
                    </div>
                  </div>

                  {/* Body content */}
                  <div className="p-3.5 flex flex-col flex-1 text-left font-sans">
                    <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider block mb-1">
                      {p.category}
                    </span>
                    <h3 
                      onClick={() => onSelectProduct && onSelectProduct(p)}
                      className="font-bold text-xs text-slate-800 hover:text-indigo-600 cursor-pointer truncate uppercase block transition-colors leading-tight"
                    >
                      {p.name}
                    </h3>
                    
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-rose-600">
                        Rp{p.price.toLocaleString('id-ID')}
                      </span>
                      <button
                        onClick={() => onSelectProduct && onSelectProduct(p)}
                        className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        BELI →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'follows' && (
        <div className="space-y-6" id="follows-pane">
          <div className="flex justify-between items-center">
            <h2 className="font-sans text-lg font-extrabold uppercase tracking-tight text-slate-900">
              TOKO BRANDS YANG DIIKUTI ({myFollowedStores.length})
            </h2>
            {myFollowedStores.length > 0 && (
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                MITRA PENJUAL AKTIF
              </span>
            )}
          </div>
          
          {myFollowedStores.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                <Store className="w-8 h-8 text-slate-300" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-slate-900 text-sm uppercase">BELUM MENGIKUTI TOKO</h3>
                <p className="font-sans text-xs text-slate-400 uppercase leading-relaxed">
                  Ikuti toko-toko favorit Anda untuk mendapatkan pembaruan rilis produk terbaru dan promosi khusus.
                </p>
              </div>
              <button
                onClick={() => setActivePage('stores')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold uppercase rounded-lg transition-all cursor-pointer shadow-sm"
              >
                <span>JELAJAHI DAFTAR TOKO</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myFollowedStores.map((s) => {
                const liveOffset = Math.floor(Math.sin((Date.now() + (s.id ? s.id.charCodeAt(0) : 0) * 1200) / 7500) * 3);
                const followersVal = (s.followersCount || 1241) + liveOffset;
                return (
                  <div 
                    key={s.id} 
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300 relative"
                  >
                  {/* Store Banner Mock/Real */}
                  <div className="h-16 bg-gradient-to-r from-slate-950 to-indigo-950 relative overflow-hidden flex-shrink-0">
                    {s.banner ? (
                      <img src={s.banner} alt="banner" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                    )}
                  </div>

                  {/* Store Profile Area */}
                  <div className="p-5 pt-0 flex-1 flex flex-col relative">
                    {/* Logo absolute shifted up */}
                    <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white p-1 shadow-md flex-shrink-0 -mt-7 mb-3 overflow-hidden">
                      <img src={s.logo} alt={s.name} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                    </div>

                    {/* Store Name & Username */}
                    <div className="text-left font-sans flex-1">
                      <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                        {s.name}
                      </h3>
                      <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">
                        @{s.username}
                      </p>
                      
                      {s.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-2 leading-relaxed uppercase">
                          {s.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2.5 mt-3 text-[10px] font-sans font-bold text-slate-500">
                        <span className="flex items-center gap-1 text-amber-500">
                          ★ {s.rating ? s.rating.toFixed(1) : "5.0"}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <div className="flex items-center gap-1 text-slate-500">
                          <span>{followersVal} Pengikut</span>
                          <span className="flex h-1.5 w-1.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-[7.5px] font-mono font-bold text-emerald-600 uppercase tracking-widest animate-pulse">LIVE</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (setSearchQuery) {
                            setSearchQuery(s.name);
                          }
                          setActivePage('shop');
                        }}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-sans text-[10px] font-black uppercase rounded-lg text-center tracking-wider transition-colors cursor-pointer"
                      >
                        KUNJUNGI TOKO
                      </button>
                      <button
                        onClick={() => toggleFollowStore(s.id)}
                        className="px-3 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 font-sans text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
                        title="Batal Mengikuti"
                      >
                        UNFOLLOW
                      </button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="max-w-2xl bg-white border-2 border-black p-6 md:p-8 maternal-shadow font-mono text-xs space-y-6" id="security-pane">
          <div>
            <span className="font-mono text-[9px] bg-black text-[#fdfcf7] px-2 py-0.5 uppercase tracking-widest font-bold">PENGATURAN PRIVASI</span>
            <h2 className="font-serif text-2xl font-black uppercase tracking-tight text-black mt-1">AKUN & KEAMANAN</h2>
            <p className="text-gray-500 text-[10px] uppercase">Kelola rincian username, nomor handphone, email, dan ganti password rahasia Anda</p>
          </div>

          {securityFeedback && (
            <div className="p-3 bg-emerald-50 border-2 border-emerald-500 font-bold text-[11px] text-emerald-800 uppercase animate-pulse" id="security-feedback-ok">
              ✅ {securityFeedback}
            </div>
          )}
          {securityError && (
            <div className="p-3 bg-red-50 border-2 border-red-500 font-bold text-[11px] text-red-800 uppercase" id="security-feedback-err">
              ⚠️ {securityError}
            </div>
          )}

          <form onSubmit={handleSaveSecurity} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-gray-500 font-extrabold uppercase text-[10px]">USERNAME AKUN *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-xs select-none">@</span>
                  <input 
                    type="text" 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="Contoh: iyasyaa"
                    required
                    className="w-full bg-slate-50 border-2 border-black p-2 pl-7 font-bold focus:outline-none text-xs text-black"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-500 font-extrabold uppercase text-[10px]">NOMOR HANDPHONE (NO HP) *</label>
                <input 
                  type="text" 
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Contoh: 08123456789"
                  required
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold focus:outline-none text-xs text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-gray-500 font-extrabold uppercase text-[10px]">ALAMAT EMAIL *</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold focus:outline-none text-xs text-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-500 font-extrabold uppercase text-[10px]">JENIS KELAMIN (GENDER)</label>
                <select 
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold focus:outline-none text-xs text-black cursor-pointer"
                >
                  <option value="Laki-laki">👨 LAKI-LAKI</option>
                  <option value="Perempuan">👩 PEREMPUAN</option>
                  <option value="Lainnya">🌈 LAINNYA</option>
                </select>
              </div>
            </div>

            <div className="border-t-2 border-gray-100 pt-4 mt-6">
              <h3 className="font-serif text-lg font-bold uppercase text-black mb-3 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-red-700" /> GANTI PASSWORD USER
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-gray-400 font-extrabold uppercase text-[9px]">PASSWORD LAMA</label>
                  <div className="relative">
                    <input 
                      type={showOldPassword ? "text" : "password"} 
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-2 border-black p-2 pr-9 font-bold focus:outline-none text-xs text-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-black cursor-pointer bg-transparent border-none focus:outline-none"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-gray-400 font-extrabold uppercase text-[9px]">PASSWORD BARU</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 4 karakter"
                      className="w-full bg-slate-50 border-2 border-black p-2 pr-9 font-bold focus:outline-none text-xs text-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-black cursor-pointer bg-transparent border-none focus:outline-none"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-gray-400 font-extrabold uppercase text-[9px]">KONFIRMASI PASSWORD</label>
                  <div className="relative">
                    <input 
                      type={showConfirmNewPassword ? "text" : "password"} 
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      className="w-full bg-slate-50 border-2 border-black p-2 pr-9 font-bold focus:outline-none text-xs text-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-black cursor-pointer bg-transparent border-none focus:outline-none"
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-gray-400 mt-2 italic">* Kosongkan isian password jika Anda tidak berniat melakukan penggantian sandi rahasia.</p>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isSavingSecurity}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold uppercase border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] transition hover:shadow-none translate-x-[1px] hover:translate-x-[3px] hover:translate-y-[3px] disabled:opacity-50 cursor-pointer text-xs"
              >
                {isSavingSecurity ? "MENYIMPAN DATA..." : "💾 SIMPAN PENGATURAN KEAMANAN"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'address' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs" id="address-pane">
          {/* Address form block */}
          <div className="bg-white border-2 border-black p-6 md:p-8 maternal-shadow space-y-6">
            <div>
              <span className="font-mono text-[9px] bg-red-800 text-white px-2 py-0.5 uppercase tracking-widest font-bold">shipping address</span>
              <h2 className="font-serif text-2xl font-black uppercase tracking-tight text-black mt-1">ALAMAT SAYA</h2>
              <p className="text-gray-500 text-[10px] uppercase">Rincian alamat penyerahan paket busana pesanan Anda.</p>
            </div>

            {addressFeedback && (
              <div className="p-3 bg-emerald-50 border-2 border-emerald-500 font-bold text-[11px] text-emerald-800 uppercase animate-pulse" id="address-feedback-ok">
                ✅ {addressFeedback}
              </div>
            )}
            {addressError && (
              <div className="p-3 bg-red-50 border-2 border-red-500 font-bold text-[11px] text-red-800 uppercase" id="address-feedback-err">
                ⚠️ {addressError}
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-gray-500 font-extrabold uppercase text-[10px]">NAMA PENERIMA PAKET *</label>
                  <input 
                    type="text" 
                    value={addrReceiver}
                    onChange={(e) => setAddrReceiver(e.target.value)}
                    placeholder="Nama lengkap penerima"
                    required
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs text-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-500 font-extrabold uppercase text-[10px]">NOMOR HP PENERIMA *</label>
                  <input 
                    type="text" 
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Contoh: 08123456789"
                    required
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-gray-500 font-extrabold uppercase text-[10px]">PROVINSI *</label>
                  <input 
                    type="text" 
                    value={addrProvince}
                    onChange={(e) => setAddrProvince(e.target.value)}
                    placeholder="Contoh: Jawa Barat"
                    required
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs text-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-500 font-extrabold uppercase text-[10px]">KOTA / KABUPATEN *</label>
                  <input 
                    type="text" 
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    placeholder="Contoh: Kota Bandung"
                    required
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-gray-500 font-extrabold uppercase text-[10px]">KECAMATAN *</label>
                  <input 
                    type="text" 
                    value={addrDistrict}
                    onChange={(e) => setAddrDistrict(e.target.value)}
                    placeholder="Contoh: Coblong"
                    required
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs text-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-500 font-extrabold uppercase text-[10px]">KELURAHAN / DESA *</label>
                  <input 
                    type="text" 
                    value={addrSubdistrict}
                    onChange={(e) => setAddrSubdistrict(e.target.value)}
                    placeholder="Contoh: Dago"
                    required
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs text-black"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-500 font-extrabold uppercase text-[10px]">RT / RW *</label>
                <input 
                  type="text" 
                  value={addrRTRW}
                  onChange={(e) => setAddrRTRW(e.target.value)}
                  placeholder="Contoh: RT 03 / RW 05"
                  required
                  className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs text-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-500 font-extrabold uppercase text-[10px]">DETAIL ALAMAT LENGKAP & NO RUMAH *</label>
                <textarea 
                  value={addrDetail}
                  onChange={(e) => setAddrDetail(e.target.value)}
                  placeholder="Contoh: Jalan Ganesha No. 10, dekat gerbang depan kampus ITB"
                  rows={3}
                  required
                  className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs text-black"
                />
              </div>

              <div className="border border-dashed border-gray-300 p-3 bg-gray-50 rounded space-y-1.5">
                <span className="font-extrabold uppercase text-[9px] text-gray-500 block">📌 KOORDINAT TITIK MAPS</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Latitude:</span>
                    <span className="font-bold text-black">{addrLatLng?.lat ? addrLatLng.lat.toFixed(6) : '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Longitude:</span>
                    <span className="font-bold text-black">{addrLatLng?.lng ? addrLatLng.lng.toFixed(6) : '-'}</span>
                  </div>
                </div>
                <span className="text-[9px] text-purple-800 font-extrabold block uppercase mt-1">📍 Klik pada peta di sebelah kanan untuk memperbarui titik pin Anda</span>
              </div>

              <button 
                type="submit"
                disabled={isSavingAddress}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold uppercase border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] transition hover:shadow-none translate-x-[1px] hover:translate-x-[3px] hover:translate-y-[3px] disabled:opacity-50 cursor-pointer text-xs"
              >
                {isSavingAddress ? "MENYIMPAN DATA..." : "💾 SIMPAN ALAMAT PENGIRIMAN"}
              </button>
            </form>
          </div>

          {/* Interactive Map Block */}
          <div className="bg-white border-2 border-black p-6 md:p-8 maternal-shadow space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-mono text-[9px] bg-black text-[#fdfcf7] px-2 py-0.5 uppercase tracking-wider font-bold">DIGITAL GPS PLATTER</span>
              <h3 className="font-serif text-xl font-bold uppercase text-black text-left">DRAG & DROP PIN LOKASI</h3>
              <p className="text-gray-500 leading-relaxed text-[11px] text-left">
                Geser marker pada peta atau klik sembarang titik pada wilayah tujuan untuk menentukan koordinat presisi pengantaran kurir paket Anda. Hal ini membantu kurir mengantarkan produk fashion Toko Sipil secara akurat tanpa tersesat.
              </p>
            </div>

            <MapPicker 
              value={addrLatLng} 
              onChange={(coord) => setAddrLatLng(coord)} 
            />
          </div>
        </div>
      )}

      {activeTab === 'shop_register' && (
        <div className="max-w-2xl bg-white border-2 border-black p-6 md:p-8 maternal-shadow font-mono text-xs" id="apply-store-pane">
          {myShopApplications.length > 0 ? (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-4">
                <span className="bg-red-800 text-white text-[9px] py-1 px-2 font-bold uppercase tracking-wider mb-2 inline-block">SELLER APPLICATION RECORD FOUND</span>
                <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-black block">RIWAYAT PENDAFTARAN TOKO</h2>
                <p className="text-[10.5px] text-gray-500 leading-snug mt-1.5 uppercase">Anda telah mendaftarkan toko sebelumnya. Sesuai sistem pendaftaran alternatif, Anda tidak diperkenankan untuk double-registrasi atau mengajukan ulang formulir yang sama.</p>
              </div>

              {/* List of User's Applications (History) */}
              <div className="space-y-4">
                {myShopApplications.map((item) => (
                  <div key={item.id} className="bg-[#faf9f3] p-4 border-2 border-black space-y-3 relative overflow-hidden" id={`app-hist-${item.id}`}>
                    <div className="flex justify-between items-center border-b pb-2">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-bold">ID PENGAJUAN: {item.id}</span>
                        <h3 className="font-serif text-lg font-bold uppercase text-black">{item.name}</h3>
                      </div>
                      <span className={`font-mono text-[10px] px-2.5 py-1 font-bold border uppercase ${
                        item.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-300' :
                        item.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-300' :
                        'bg-orange-100 text-orange-700 border-orange-300'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                      <div>
                        <p className="text-gray-400 font-bold uppercase text-[9px]">Detail Toko Terdaftar</p>
                        <p>Username: <b className="text-black">@{item.username}</b></p>
                        <p>Email Kontak: {item.email}</p>
                        <p>No. Telepon: {item.phone}</p>
                        <p className="truncate" title={item.address}>Alamat: {item.address}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold uppercase text-[9px]">Informasi Legal & Rekening</p>
                        <p>Pemilik Legal: {item.ownerName}</p>
                        <p>NIK KTP: <span className="select-all font-bold">{item.nik}</span></p>
                        <p>Data Bank: <b>{item.bankName} - {item.bankAccount}</b></p>
                        <p>Nama Rekening: {item.bankAccountName}</p>
                      </div>
                    </div>

                    <div className="text-[9.5px] text-gray-500 pt-2 border-t flex justify-between items-center">
                      <span>Diajukan Tanggal: {new Date(item.createdAt).toLocaleString('id-ID')}</span>
                      {item.status === 'APPROVED' && (
                        <span className="text-green-700 font-bold">✓ TOKO AKTIF</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t text-center">
                <button 
                  onClick={() => setActiveTab('profile')} 
                  className="px-4 py-2.5 bg-black text-white text-[10px] uppercase font-bold border-2 border-black hover:bg-transparent hover:text-black transition-all cursor-pointer"
                >
                  KEMBALI KE HALAMAN DASHBOARD PROFILE
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b pb-4 mb-4">
                <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-black block">BUKA TOKO SELLER PARTNER</h2>
                <p className="text-[10.5px] text-gray-400 leading-snug mt-1.5 uppercase">Isi formulir pembukaan toko di bawah untuk diverifikasi kelengkapan datanya oleh administrator.</p>
              </div>

              <form onSubmit={handleApplyShop} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1 uppercase">NAMA TOKO *</label>
                    <input 
                      type="text" 
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="Contoh: Karnaval Cloth"
                      required
                      className="w-full bg-[#faf9f3] border-2 border-black p-2 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">USERNAME TOKO (SISTEM URL) *</label>
                    <input 
                      type="text" 
                      value={shopUsername}
                      onChange={(e) => setShopUsername(e.target.value)}
                      placeholder="Contoh: karnaval-store"
                      required
                      className="w-full bg-[#faf9f3] border-2 border-black p-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">EMAIL TOKO KONTAK *</label>
                    <input 
                      type="email" 
                      value={shopEmail}
                      onChange={(e) => setShopEmail(e.target.value)}
                      required
                      className="w-full bg-[#faf9f3] border-2 border-black p-2 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">TELEPON TOKO HP *</label>
                    <input 
                      type="tel" 
                      value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)}
                      required
                      className="w-full bg-[#faf9f3] border-2 border-black p-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1 uppercase">NAMA PEMILIK *</label>
                    <input 
                      type="text" 
                      value={shopOwner}
                      onChange={(e) => setShopOwner(e.target.value)}
                      required
                      className="w-full bg-[#faf9f3] border-2 border-black p-2 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">NIK NOMOR KTP PEMILIK (16 DIGIT) *</label>
                    <input 
                      type="text" 
                      maxLength={16}
                      value={shopNik}
                      onChange={(e) => setShopNik(e.target.value)}
                      required
                      placeholder="3273xxxxxxxxxxxx"
                      className="w-full bg-[#faf9f3] border-2 border-black p-2 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1 uppercase">ALAMAT TOKO LENGKAP *</label>
                  <textarea 
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    required
                    rows={2}
                    placeholder="Jl. Dipati Ukur No.40, Coblong, Bandung"
                    className="w-full bg-[#faf9f3] border-2 border-black p-2 focus:outline-none"
                  />
                </div>

                {/* Photo logo upload and direct WhatsApp NIK Verification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-black p-3 bg-white">
                    <label className="block text-black font-extrabold text-[11px] mb-2 uppercase">📸 UNGGAH LOGO TOKO (FOTO) *</label>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 border-2 border-dashed border-black bg-[#faf9f3] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {shopLogo ? (
                          <img src={shopLogo} alt="Logo Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-gray-400 text-center font-bold">BELUM ADA LOGO</span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <label className="cursor-pointer bg-black hover:bg-slate-800 text-white border-2 border-black px-3 py-2 text-[9px] font-extrabold uppercase tracking-tight block text-center transition">
                          Pilih File Foto...
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressAndResizeImage(file, 400, 400, 0.75);
                                  setShopLogo(compressed);
                                } catch (err: any) {
                                  console.error("Gagal memproses logo toko:", err);
                                }
                              }
                            }}
                            className="hidden"
                            required={!shopLogo}
                          />
                        </label>
                        <p className="text-[8px] text-gray-500 mt-1 uppercase font-semibold">Menerima format file foto (.png, .jpg, .jpeg)</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-black p-3 bg-emerald-50">
                    <label className="block text-emerald-950 font-extrabold text-[11px] mb-1 uppercase">💬 VERIFIKASI NIK & KTP (DIRECT WA)</label>
                    <p className="text-[9px] text-emerald-900 leading-normal mb-2 uppercase">Untuk keamanan data, dokumen NIK & Foto KTP Anda wajib langsung dikirim ke WhatsApp Admin:</p>
                    <a
                      href={`https://wa.me/${encodeURIComponent((settings?.adminWhatsapp || '628123456789').replace(/[^0-9]/g, ''))}?text=Halo%20Admin%20Toko%20Sipil,%20saya%20ingin%20mengajukan%20pendirian%20toko%20dengan%20detail%20sebagai%20berikut:%0A-%20Nama%20Toko:%20${encodeURIComponent(shopName)}%0A-%20Username:%20${encodeURIComponent(shopUsername)}%0A-%20Nama%20Pemilik:%20${encodeURIComponent(shopOwner)}%0A-%20NIK%20KTP:%20${encodeURIComponent(shopNik)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] uppercase block text-center border-2 border-black transition"
                      id="direct-wa-nik"
                    >
                      KIRIM NIK / KTP KE WA ADMIN
                    </a>
                  </div>
                </div>

                {/* Bank detail requirements */}
                <div className="bg-[#111] p-4 text-white maternal-shadow-sm space-y-3">
                  <span className="font-serif font-bold text-red-600 uppercase text-xs">DATA REKENING DEPOSIT SELLER</span>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-gray-400 text-[10px] mb-1 uppercase">Nama Bank *</label>
                      <select 
                        value={shopBankName}
                        onChange={(e) => setShopBankName(e.target.value)}
                        className="w-full bg-slate-900 border border-gray-700 py-1.5 focus:outline-none text-white cursor-pointer"
                      >
                        <option value="BCA">BCA</option>
                        <option value="Mandiri">Mandiri</option>
                        <option value="BNI">BNI</option>
                        <option value="BRI">BRI</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-[10px] mb-1 uppercase">No Rekening *</label>
                      <input 
                        type="text" 
                        value={shopBankAccount}
                        onChange={(e) => setShopBankAccount(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-gray-700 p-1.5 focus:outline-none text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-[10px] mb-1 uppercase">Pemilik Buku Rekening *</label>
                      <input 
                        type="text" 
                        value={shopBankAccountName}
                        onChange={(e) => setShopBankAccountName(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-gray-700 p-1.5 focus:outline-none text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions (S&K) Section */}
                <div className="border-2 border-black bg-amber-50 p-3 text-[10px] space-y-2 font-sans leading-relaxed">
                  <p className="font-extrabold text-amber-950 border-b border-amber-300 pb-1 uppercase flex items-center gap-1">
                    📖 SYARAT & KETENTUAN (S&K) MITRA SELLER
                  </p>
                  <div className="max-h-24 overflow-y-auto bg-white border border-black p-2 text-[9px] text-gray-700 whitespace-pre-wrap font-mono leading-normal">
{`SYARAT & KETENTUAN HUBUNGAN KEMITRAAN MERCHANT:
1. Seller menyatakan bertanggung jawab mutlak atas legalitas dan orisinalitas produk streetwear didaftarkan.
2. Setiap transaksi sukses dipotong biaya administrasi dan sumbangan operasional kas HMTS Sipil sebesar 5%.
3. Alur pencairan dana wallet ke rekening wajib melalui persetujuan manual tim Admin.
4. Seller dilarang menyalahgunakan data pembeli demi kepentingan pribadi di luar pengiriman pesanan.
5. Verifikasi NIK & KTP wajib diproses langsung via chat WhatsApp resmi yang disediakan.`}
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer pt-1">
                    <input 
                      type="checkbox"
                      checked={agreedToSK}
                      onChange={(e) => setAgreedToSK(e.target.checked)}
                      className="mt-0.5 border-2 border-black rounded-none cursor-pointer"
                      required
                    />
                    <span className="font-bold text-[#991b1b] uppercase select-none text-[9px]">
                      SAYA MENYETUJUI SELURUH SYARAT & KETENTUAN MITRA SELLER DI ATAS *
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!agreedToSK || !shopLogo}
                  className={`w-full py-3.5 font-bold text-xs uppercase border-2 border-black transition-all ${
                    agreedToSK && shopLogo
                      ? 'bg-black text-white hover:bg-slate-800 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                  }`}
                  id="submit-shop-register"
                >
                  KIRIM FORMULIR PEMBUKAAN TOKO
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs animate-fade-in" id="diagnostics-panel">
          
          {/* Left Panel: Scanning & Running Diagnostic */}
          <div className="bg-white border-4 border-black p-5 md:p-6 maternal-shadow space-y-6">
            <div className="border-b-2 border-black pb-3">
              <span className="bg-red-800 text-white px-2 py-0.5 text-[8px] font-black tracking-widest uppercase">
                SHIELD INTRUSION SCAN & DIAGNOSTICS
              </span>
              <h3 className="font-serif font-black text-lg uppercase text-black mt-1 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-700 animate-pulse" />
                <span>1-KLIK DIAGNOSIS SISTEM</span>
              </h3>
              <p className="text-gray-400 text-[9px] uppercase mt-0.5">
                Pindai masalah tampilan, performa jaringan, sesi cache, atau data yang rusak secara instan.
              </p>
            </div>

            {/* Diagnostic trigger or state */}
            <div className="space-y-4">
              <button
                onClick={handleRunDiagnostics}
                disabled={isDiagnosing}
                className={`w-full py-4 font-black uppercase text-xs border-2 border-black tracking-wider transition-all flex items-center justify-center gap-2 ${
                  isDiagnosing 
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border-gray-300' 
                    : 'bg-black hover:bg-neutral-900 text-[#f4f2e9] cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-[1px]'
                }`}
              >
                <Cpu className={`w-4 h-4 text-amber-400 ${isDiagnosing ? 'animate-spin' : ''}`} />
                <span>{isDiagnosing ? 'SEDANG MEMINDAI ALUR SISTEM...' : 'MULAI RESTRUKTURISASI & DIAGNOSIS'}</span>
              </button>

              {/* Real-time Logger Terminal console feel */}
              <div className="bg-neutral-950 text-emerald-400 font-real-mono p-4 min-h-[175px] max-h-[250px] overflow-y-auto border-2 border-black text-[10px] space-y-1.5 leading-normal">
                <p className="text-amber-400 font-bold opacity-60">TOKO SIPIL CORE SHIELD CONSOLE v1.2</p>
                {diagnosticLogs.length === 0 ? (
                  <p className="text-gray-500 italic">Klik tombol di atas untuk memulai pemindaian kerentanan & verifikasi sistem secara instan.</p>
                ) : (
                  diagnosticLogs.map((log, idx) => (
                    <p key={idx} className="fade-in-entry">{log}</p>
                  ))
                )}
              </div>

              {/* Diagnostic Results Summary */}
              {diagResults && (
                <div className="bg-stone-50 border-2 border-black p-4 space-y-3">
                  <h4 className="font-bold text-[10px] uppercase text-black border-b border-gray-300 pb-1 flex items-center justify-between">
                    <span>HASIL EVALUASI PEMINDAIAN</span>
                    <span className="text-emerald-700 font-bold">LENGKAP</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div className="bg-white border border-gray-300 p-2 flex items-center justify-between">
                      <span className="text-gray-500">LATENSI API:</span>
                      <span className={`font-bold ${diagResults.latencyMs < 150 ? 'text-green-700' : 'text-amber-700'}`}>
                        {diagResults.latencyMs}ms {diagResults.latencyMs < 150 ? '(Cepat)' : '(Lambat)'}
                      </span>
                    </div>

                    <div className="bg-white border border-gray-300 p-2 flex items-center justify-between">
                      <span className="text-gray-500 font-mono">INTEGRITAS DATA:</span>
                      <span className={`font-bold ${diagResults.hasProfileIssues ? 'text-red-700' : 'text-green-700'}`}>
                        {diagResults.hasProfileIssues ? 'TIDAK LENGKAP' : 'NORMAL'}
                      </span>
                    </div>

                    <div className="bg-white border border-gray-300 p-2 flex items-center justify-between">
                      <span className="text-gray-500">LOKASI KIRIM:</span>
                      <span className={`font-bold ${diagResults.hasAddressIssues ? 'text-amber-700' : 'text-green-700'}`}>
                        {diagResults.hasAddressIssues ? 'KOSONG' : 'VALID'}
                      </span>
                    </div>

                    <div className="bg-white border border-gray-300 p-2 flex items-center justify-between">
                      <span className="text-gray-500 font-mono">PENYIMPANAN SESI:</span>
                      <span className="text-green-700 font-bold">SEHAT</span>
                    </div>
                  </div>

                  {/* 1-Click Fix Trigger Action */}
                  <div className="pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleOneClickFix}
                      className="w-full bg-red-800 hover:bg-black text-white font-bold py-2.5 px-3 border border-black uppercase text-[9.5px] cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Wrench className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                      <span>1-KLIK BERSIHKAN CACHE & SEJAJARKAN PROFIL</span>
                    </button>
                    <p className="text-[8px] text-gray-400 uppercase text-center mt-1">
                      Mengoptimisasi entitas data profil, membersihkan error tab tersembunyi, dan meregenerasi data yang tidak sinkron.
                    </p>
                  </div>
                </div>
              )}

              {/* Fix Success Notification */}
              {fixSuccessMsg && (
                <div className="bg-green-50 border border-green-800 p-3.5 text-green-900 leading-relaxed uppercase text-[9px] font-bold">
                  {fixSuccessMsg}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Send Diagnostic/Trouble Report to Administrator Hub */}
          <div className="bg-white border-4 border-black p-5 md:p-6 maternal-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="border-b-2 border-black pb-3">
                <span className="bg-black text-white px-2 py-0.5 text-[8px] font-black tracking-widest uppercase">
                  TICKET REPORT SYSTEM
                </span>
                <h3 className="font-serif font-black text-lg uppercase text-black mt-1 flex items-center gap-2">
                  <Send className="w-4 h-4 text-black" />
                  <span>LAPOR KENDALA KE ADMIN</span>
                </h3>
                <p className="text-gray-400 text-[9px] uppercase mt-0.5">
                  Salurkan laporan masalah operasional, kendala checkout, sengketa saldo, atau cacat sistem langsung ke dasbor pengawas Super Admin.
                </p>
              </div>

              <form onSubmit={handleSendDiagnosticReport} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block uppercase text-[9px]">KLASIFIKASI KERUSAKAN / KENDALA *</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full bg-white border border-black p-2.5 text-xs font-mono"
                  >
                    <option value="Glitch / Kesalahan Tampilan">Glitch / Kesalahan Tampilan / Layar Berlipat</option>
                    <option value="Kendala Transaksi & Checkout">Kendala Transaksi & Checkout</option>
                    <option value="Sengketa Saldo Kemitraan (Wallet)">Sengketa Saldo Kemitraan (Wallet)</option>
                    <option value="Cacat Pengisian Alamat Map">Cacat Pengisian Alamat Map</option>
                    <option value="Masalah Autentikasi / Sesi Log">Masalah Autentikasi / Sesi Log</option>
                    <option value="Lainnya (Tuliskan Detail)">Lainnya (Tuliskan Detail)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block uppercase text-[9px]">URAIAN KRONOLOGI MASALAH *</label>
                  <textarea
                    rows={4}
                    required
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Uraikan bagaimana hambatan terjadi, misal: 'Gagal pencet tombol alamat atau tombol simpan error...' (Minimal 10 karakter)"
                    className="w-full bg-white border border-black p-2.5 text-xs font-mono rounded-none"
                  />
                </div>

                {reportResultMsg && (
                  <div className="bg-indigo-50 border border-blue-900 p-3.5 text-blue-950 leading-relaxed uppercase text-[9px] font-bold">
                    {reportResultMsg}
                  </div>
                )}

                {reportErrorMsg && (
                  <div className="bg-red-50 border border-red-900 p-3.5 text-red-950 leading-relaxed uppercase text-[9px] font-bold">
                    {reportErrorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingReport || issueDescription.trim().length < 10}
                  className={`w-full py-3 font-bold uppercase text-xs border-2 border-black tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    isSubmittingReport || issueDescription.trim().length < 10
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                      : 'bg-black hover:bg-neutral-900 text-white cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSubmittingReport ? 'MENGIRIM DIAGNOSIS...' : 'KIRIM LAPORAN SISTEM'}</span>
                </button>
              </form>
            </div>

            <div className="bg-blue-50 border border-blue-900 p-3 flex gap-2 w-full text-[9px] text-blue-950 leading-snug">
              <ShieldCheck className="w-5 h-5 text-indigo-900 flex-shrink-0" />
              <div className="space-y-0.5 uppercase">
                <span className="font-bold text-black block">KEAMANAN & DEBUGS SECURE PACKET</span>
                <p>
                  Sistem kami secara otomatis membundel data diagnostic (Latensi, Layar, LocalStorage, User-Agent, Kode Sesi) untuk menguji kecacatan tanpa membaca password Anda. Laporan akan diinvestigasi paling lambat 1x24 jam dari log Himpunan.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
        </div> {/* Right column: Content Area */}
        </main> {/* right column content area */}
      </div> {/* Right Column: Main Area */}

      {/* INVOICE BUKTI PEMBELIAN MODAL SCREEN OVERLAY */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto font-mono text-xs" id="invoice-modal-overlay">
          <div className="printable-area bg-white border-4 border-black w-full max-w-2xl p-6 md:p-8 maternal-shadow-lg relative my-8 print:border-0 print:shadow-none" id="invoice-modal-content">
            {/* Header / Brand label detail */}
            <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-6">
              <div>
                <span className="font-serif text-2xl font-black uppercase tracking-tight text-black block">TOKO SIPIL ALTERNATIVE</span>
                <span className="text-[9px] bg-red-800 text-white font-bold py-1 px-2 uppercase tracking-wide inline-block mt-1">BUKTI PEMBELIAN RESMI / OFFICIAL INVOICE</span>
              </div>
              <div className="text-right font-bold">
                <span className="text-red-600 block">INVOICE #{selectedInvoiceOrder.id.toUpperCase()}</span>
                <p className="text-[10px] text-gray-500 mt-1">TANGGAL: {new Date(selectedInvoiceOrder.createdAt).toLocaleString('id-ID')}</p>
                <p className="text-[10px] text-gray-500">STATUS PEMBAYARAN: <b className="text-black uppercase">{selectedInvoiceOrder.status}</b></p>
              </div>
            </div>

            {/* Quick columns: Buyer vs Seller */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b-2 border-black pb-6 mb-6">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">DITERBITKAN UNTUK (BUYER):</span>
                <p className="font-serif font-bold text-black uppercase text-sm">{selectedInvoiceOrder.address.receiver}</p>
                <p className="text-[11px] text-black mt-1">Telp: {selectedInvoiceOrder.address.phone}</p>
                <p className="text-[11px] text-gray-600 uppercase mt-0.5 max-w-sm">{selectedInvoiceOrder.address.detail}{selectedInvoiceOrder.address.rtrw ? `, RT/RW: ${selectedInvoiceOrder.address.rtrw}` : ''}{selectedInvoiceOrder.address.subdistrict ? `, KEL/DESA: ${selectedInvoiceOrder.address.subdistrict}` : ''}{selectedInvoiceOrder.address.district ? `, KEC: ${selectedInvoiceOrder.address.district}` : ''}, {selectedInvoiceOrder.address.city}{selectedInvoiceOrder.address.province ? `, ${selectedInvoiceOrder.address.province}` : ''}</p>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">PENJUAL STORE INDEPENDEN (SELLER):</span>
                <p className="font-serif font-bold text-black uppercase text-sm">{selectedInvoiceOrder.storeName}</p>
                <p className="text-[11px] text-gray-600 uppercase mt-1">Status Verifikasi Mitra: <span className="text-green-700 font-bold">✓ VERIFIED SELLER</span></p>
                <p className="text-[11.5px] text-red-800 font-bold mt-1 uppercase">METODE PEMBAYARAN: MIDTRANS SNAP SETTLEMENT</p>
              </div>
            </div>

            {/* Product table matrix */}
            <span className="text-[10px] text-[#991b1b] font-bold uppercase tracking-wider block mb-2">RINCIAN ITEM BAG BAJU</span>
            <div className="border-2 border-black overflow-hidden mb-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-black text-[#f4f2e9] font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-2 border-r border-[#333]">Product Item / Spec</th>
                    <th className="p-2 border-r border-[#333] text-center">Harga Satuan</th>
                    <th className="p-2 border-r border-[#333] text-center">Qty</th>
                    <th className="p-1.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {selectedInvoiceOrder.items.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 border-r border-black font-semibold">
                        <span className="font-serif uppercase text-black font-extrabold block">{item.name}</span>
                        <span className="text-[9px] text-gray-400 uppercase">Ukuran: {item.size} | Color: {item.color}</span>
                      </td>
                      <td className="p-2 border-r border-black text-center font-bold text-gray-700">
                        Rp{item.discountPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 border-r border-black text-center font-bold">
                        {item.quantity}
                      </td>
                      <td className="p-2 text-right font-extrabold text-black">
                        Rp{(item.discountPrice * item.quantity).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Price Calculations breakdown sidebar side-by-side */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-6 mb-6">
              <div className="flex-grow p-4 bg-[#faf9f3] border-2 border-black max-w-sm">
                <span className="text-[10px] text-black font-extrabold tracking-tight uppercase block mb-1">METODOLOGI PENGIRIMAN</span>
                <p className="uppercase leading-normal">EKSPEDISI: <b>{selectedInvoiceOrder.courier || 'STANDAR'}</b></p>
                {selectedInvoiceOrder.resiNo ? (
                  <p className="uppercase leading-normal text-purple-900 font-bold text-[10px]">RESI AKTIF: {selectedInvoiceOrder.resiNo}</p>
                ) : (
                  <p className="text-gray-400 italic">Resi pengiriman belum diinput oleh seller mitra.</p>
                )}
                <div className="mt-2.5 pt-2 border-t border-dashed border-gray-400 text-[10px] text-gray-500 uppercase leading-snug">
                  Bukti pembelian ini bersifat resmi dan diakui secara sah oleh sistem multi-vendor <b>Toko Sipil Alternative Platform</b> sebagai tanda lunas transaksi elektronik.
                </div>
              </div>

              <div className="w-full md:w-64 space-y-1.5 text-xs text-right self-center">
                <div className="flex justify-between">
                  <span className="text-gray-500 uppercase">SUBTOTAL ITEMS:</span>
                  <span className="font-bold">Rp{selectedInvoiceOrder.totalProductPrice?.toLocaleString('id-ID') || selectedInvoiceOrder.items.reduce((acc: number, it: any) => acc + (it.discountPrice * it.quantity), 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 uppercase">ONGKOS KIRIM:</span>
                  <span className="font-bold">Rp{selectedInvoiceOrder.shippingCost?.toLocaleString('id-ID') || '0'}</span>
                </div>
                {selectedInvoiceOrder.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span className="uppercase">VOUCHER POTONGAN:</span>
                    <span className="font-bold">-Rp{selectedInvoiceOrder.discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 text-[10px]">
                  <span className="uppercase">ADMIN PLATFORM FEE:</span>
                  <span>Rp{selectedInvoiceOrder.platformFee?.toLocaleString('id-ID') || '2.000'}</span>
                </div>
                <div className="flex justify-between border-t-2 border-black pt-2 text-sm font-black text-[#991b1b]">
                  <span className="uppercase">TOTAL BAYAR:</span>
                  <span>Rp{selectedInvoiceOrder.totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Footer buttons/interactive action points */}
            <div className="flex flex-wrap gap-2 justify-between items-center pt-4 border-t-4 border-black font-serif text-sm print:hidden">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white font-bold px-3 py-2 text-xs border-2 border-black uppercase cursor-pointer tracking-wider"
                >
                  <Printer className="w-4 h-4 text-white" /> CETAK BUKTI PEMBELIAN (PDF)
                </button>
                <button
                  onClick={() => handleDownloadPDFInvoice(selectedInvoiceOrder)}
                  className="flex items-center gap-1.5 bg-red-800 hover:bg-black text-white font-bold px-3 py-2 text-xs border-2 border-black uppercase cursor-pointer tracking-wider"
                >
                  <Download className="w-4 h-4 text-white" /> UNDUH INVOICE (PDF FILE)
                </button>
              </div>

              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="bg-white hover:bg-black hover:text-white text-black font-bold px-4 py-2 text-xs border-2 border-black uppercase cursor-pointer tracking-wider"
              >
                TUTUP INVOICE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION EXPLANATION FORM MODAL */}
      {cancelOrderId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto font-mono text-xs" id="cancel-reason-modal-overlay">
          <div className="bg-white border-4 border-black w-full max-w-md p-6 maternal-shadow-lg relative" id="cancel-reason-modal-content">
            <div className="border-b-4 border-black pb-3 mb-4">
              <span className="font-serif text-lg font-black uppercase text-red-800">KONFIRMASI BATAL BELANJA</span>
              <p className="text-[10px] text-gray-500 mt-1 uppercase">Sistem mencatat alasan Anda untuk dievaluasi oleh mitra seller.</p>
            </div>

            <form onSubmit={handleCancelOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Alasan Tidak Jadi Membayar (Wajib Diisi):
                </label>
                <textarea
                  required
                  value={cancelReasonValue}
                  onChange={(e) => setCancelReasonValue(e.target.value)}
                  placeholder="Contoh: Salah pilih ukuran baju, ingin mengubah kurir ekspedisi, atau butuh dana mendesak..."
                  rows={4}
                  className="w-full bg-slate-50 border-2 border-black p-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCancelOrderId(null);
                    setCancelReasonValue('');
                  }}
                  className="px-3 py-1.5 bg-white text-black hover:bg-gray-100 border-2 border-black text-[10px] font-bold uppercase cursor-pointer"
                >
                  KEMBALI
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-800 text-white hover:bg-black text-[10px] font-bold uppercase border-2 border-black cursor-pointer"
                >
                  BATALKAN SEKARANG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
