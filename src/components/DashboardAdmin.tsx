/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role, ApplicationStatus, BankVerificationStatus, WithdrawalStatus } from '../types';
import { 
  ShieldCheck, AlertTriangle, Check, X, Tag, Settings as SettingsIcon, 
  Layers, CreditCard, Landmark, ArrowUpRight, BarChart2, Store, Users, ShoppingCart, Percent,
  ShieldAlert, Edit, Trash2, UserPlus, UserCheck, Search, Key, Eye, EyeOff, Image as ImageIcon, Wallet, BarChart3, TrendingUp, PieChart as PieIcon,
  Activity, RefreshCw, ChevronDown, ChevronRight, ChevronLeft, LogOut,
  Menu, MessageSquare, Bell, Home, User
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { compressAndResizeImage } from '../utils/imageCompressor';

export default function DashboardAdmin() {
  const { currentUser, categories, products, banners, refreshAllData, settings, setActivePage } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'bank_accounts' | 'withdrawals' | 'categories' | 'settings' | 'vouchers' | 'products' | 'rajaongkir' | 'users' | 'banners' | 'security_compliance'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });
  const [sidebarSearch, setSidebarSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);
  const [rajaongkirStatus, setRajaongkirStatus] = useState<any>(null);
  const [loadingRajaongkir, setLoadingRajaongkir] = useState(false);
  const [triggerDiagnosticCount, setTriggerDiagnosticCount] = useState(0);

  // Security compliance & Diagnostic states
  const [securityLogsList, setSecurityLogsList] = useState<any[]>([]);
  const [diagnosticReportsList, setDiagnosticReportsList] = useState<any[]>([]);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);

  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    completedOrdersValue: 0,
    platformEarning: 0,
    commissionPercent: 5
  });

  const [apps, setApps] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [withdraws, setWithdraws] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  
  // User creation & edit states
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  
  // User form fields
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormRole, setUserFormRole] = useState<Role>(Role.BUYER);
  const [userFormAngkatan, setUserFormAngkatan] = useState('');
  const [userFormCampus, setUserFormCampus] = useState('');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [showUserFormPassword, setShowUserFormPassword] = useState(false);
  const [userFormAvatar, setUserFormAvatar] = useState('');
  const [userFormPhone, setUserFormPhone] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('Shirt');
  const [commissionVal, setCommissionVal] = useState(5);
  const [adminWhatsappVal, setAdminWhatsappVal] = useState('628123456789');
  const [appLogoVal, setAppLogoVal] = useState('');
  const [appNameVal, setAppNameVal] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Banner states
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [bannerTag, setBannerTag] = useState('');
  const [bannerButtonText, setBannerButtonText] = useState('');
  const [isAddingBanner, setIsAddingBanner] = useState(false);

  // Voucher states
  const [adminVouchers, setAdminVouchers] = useState<any[]>([]);
  const [vchCode, setVchCode] = useState('');
  const [vchType, setVchType] = useState<'PLATFORM' | 'STORE'>('PLATFORM');
  const [vchDiscountType, setVchDiscountType] = useState<'NOMINAL' | 'PERCENTAGE'>('NOMINAL');
  const [vchAmount, setVchAmount] = useState('');
  const [vchMinPurchase, setVchMinPurchase] = useState('');

  // Fetch admin-level information
  const fetchAdminStats = async () => {
    try {
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
        setCommissionVal(data.commissionPercent);
        if (data.adminWhatsapp) {
          setAdminWhatsappVal(data.adminWhatsapp);
        }
        if (data.appLogo) {
          setAppLogoVal(data.appLogo);
        }
        if (data.appName) {
          setAppNameVal(data.appName);
        }
      }

      const appsRes = await fetch('/api/stores/applications');
      if (appsRes.ok) setApps(await appsRes.json());

      const banksRes = await fetch('/api/admin/bank-accounts');
      if (banksRes.ok) setBanks(await banksRes.json());

      const wdRes = await fetch('/api/withdrawals');
      if (wdRes.ok) setWithdraws(await wdRes.json());

      const vchRes = await fetch('/api/vouchers');
      if (vchRes.ok) setAdminVouchers(await vchRes.json());

      const usersRes = await fetch('/api/users');
      if (usersRes.ok) setUsersList(await usersRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRajaongkirStatus = async () => {
    setLoadingRajaongkir(true);
    try {
      const res = await fetch('/api/rajaongkir/status');
      if (res.ok) {
        setRajaongkirStatus(await res.json());
      }
    } catch (e) {
      console.error("Gagal menjangkau RajaOngkir status", e);
    } finally {
      setLoadingRajaongkir(false);
    }
  };

  const fetchSecurityAndDiagnostics = async () => {
    setLoadingSecurity(true);
    setLoadingDiagnostics(true);
    try {
      const [secRes, diagRes] = await Promise.all([
        fetch('/api/admin/security-logs'),
        fetch('/api/admin/diagnostic-reports')
      ]);
      if (secRes.ok) setSecurityLogsList(await secRes.json());
      if (diagRes.ok) setDiagnosticReportsList(await diagRes.json());
    } catch (e) {
      console.error("Gagal fetching security / diagnostics", e);
    } finally {
      setLoadingSecurity(false);
      setLoadingDiagnostics(false);
    }
  };

  const handleClearSecurityLogs = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus semua tangkapan log intrusi/malware?")) return;
    try {
      const res = await fetch('/api/admin/security-logs', { method: 'DELETE' });
      if (res.ok) {
        setActionFeedback("✓ Seluruh riwayat ancaman malware berhasil dibersihkan.");
        fetchSecurityAndDiagnostics();
      }
    } catch (e) {
      setActionFeedback("⚠️ Gagal membersihkan log keamanan.");
    }
  };

  const handleResolveDiagnosticReport = async (id: string, status: 'PENDING' | 'RESOLVED') => {
    try {
      const res = await fetch(`/api/admin/diagnostic-reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setActionFeedback(`✓ Status laporan kendala berhasil diubah menjadi ${status}.`);
        fetchSecurityAndDiagnostics();
      }
    } catch (e) {
      setActionFeedback("⚠️ Gagal memperbarui laporan kendala.");
    }
  };

  const handleDeleteDiagnosticReport = async (id: string) => {
    if (!window.confirm("Hapus laporan kendala user ini dari database?")) return;
    try {
      const res = await fetch(`/api/admin/diagnostic-reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setActionFeedback("✓ Laporan kendala berhasil dihapus.");
        fetchSecurityAndDiagnostics();
      }
    } catch (e) {
      setActionFeedback("⚠️ Gagal menghapus laporan.");
    }
  };

  useEffect(() => {
    fetchAdminStats();
    if (activeTab === 'rajaongkir') {
      fetchRajaongkirStatus();
    }
    if (activeTab === 'security_compliance') {
      fetchSecurityAndDiagnostics();
    }
  }, [actionFeedback, activeTab, triggerDiagnosticCount]);

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerImage.trim()) {
      setActionFeedback("⚠️ Link gambar banner wajib diisi!");
      return;
    }
    setIsAddingBanner(true);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bannerTitle,
          image: bannerImage,
          url: bannerUrl,
          description: bannerDescription,
          tag: bannerTag,
          buttonText: bannerButtonText
        })
      });
      if (res.ok) {
        setActionFeedback("✅ Banner baru berhasil ditambahkan!");
        setBannerTitle('');
        setBannerImage('');
        setBannerUrl('');
        setBannerDescription('');
        setBannerTag('');
        setBannerButtonText('');
        await refreshAllData(); // Refresh banners globally
        setTimeout(() => setActionFeedback(null), 3500);
      } else {
        const data = await res.json();
        setActionFeedback(`⚠️ Gagal menambahkan banner: ${data.error || 'Server error'}`);
      }
    } catch (e: any) {
      setActionFeedback(`⚠️ Galat koneksi: ${e.message}`);
    } finally {
      setIsAddingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus banner ini?")) return;
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setActionFeedback("✅ Banner berhasil dihapus!");
        await refreshAllData(); // Refresh banners globally
        setTimeout(() => setActionFeedback(null), 3500);
      } else {
        setActionFeedback("⚠️ Gagal menghapus banner!");
      }
    } catch (e: any) {
      setActionFeedback(`⚠️ Galat koneksi: ${e.message}`);
    }
  };

  // Handle Approvals
  const handleApproveApp = async (id: string) => {
    try {
      const res = await fetch(`/api/stores/applications/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        setActionFeedback("Aplikasi toko sukses disetujui! Akun dipromosikan ber-role Seller.");
        await refreshAllData();
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectApp = async (id: string) => {
    try {
      const res = await fetch(`/api/stores/applications/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        setActionFeedback("Pendaftaran aplikasi toko ditolak.");
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Bank verification approvals
  const handleApproveBank = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bank-accounts/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        setActionFeedback("Data Rekening seller berhasil dicentang verifikasi!");
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectBank = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bank-accounts/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        setActionFeedback("Rekening seller ditolak.");
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Withdrawal distributions transfers approvals
  const handleApproveWd = async (id: string) => {
    try {
      const res = await fetch(`/api/withdrawals/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        setActionFeedback("Penarikan disetujui! Dana sukses dikirimkan ke rekening seller.");
        await refreshAllData();
        setTimeout(() => setActionFeedback(null), 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectWd = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/withdrawals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: reason })
      });
      if (res.ok) {
        setActionFeedback(`Penarikan dana dibatalkan: ${reason}. Saldo dikembalikan ke dompet seller.`);
        await refreshAllData();
        setTimeout(() => setActionFeedback(null), 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Create User
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormName || !userFormEmail || !userFormPassword) {
      setActionFeedback("Nama, Email, dan Password wajib diisi!");
      return;
    }
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userFormName,
          email: userFormEmail,
          role: userFormRole,
          angkatan: userFormAngkatan,
          campus: userFormCampus,
          password: userFormPassword,
          avatar: userFormAvatar,
          phone: userFormPhone
        })
      });
      if (res.ok) {
        setActionFeedback(`User "${userFormName}" sukses ditambahkan!`);
        setShowCreateUser(false);
        // Clear fields
        setUserFormName('');
        setUserFormEmail('');
        setUserFormPassword('');
        setUserFormAngkatan('');
        setUserFormCampus('');
        setUserFormAvatar('');
        setUserFormPhone('');
        setUserFormRole(Role.BUYER);
        // Refresh
        await fetchAdminStats();
        await refreshAllData();
        setTimeout(() => setActionFeedback(null), 3000);
      } else {
        const data = await res.json();
        setActionFeedback("Error: " + (data.error || "Gagal membuat user"));
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Edit User
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userFormName,
          email: userFormEmail,
          role: userFormRole,
          angkatan: userFormAngkatan,
          campus: userFormCampus,
          password: userFormPassword || undefined,
          avatar: userFormAvatar,
          phone: userFormPhone
        })
      });
      if (res.ok) {
        setActionFeedback(`User "${editingUser.name}" sukses diperbaharui!`);
        setEditingUser(null);
        // Clear fields
        setUserFormName('');
        setUserFormEmail('');
        setUserFormAngkatan('');
        setUserFormCampus('');
        setUserFormPassword('');
        setUserFormAvatar('');
        setUserFormPhone('');
        setUserFormRole(Role.BUYER);
        // Refresh
        await fetchAdminStats();
        await refreshAllData();
        setTimeout(() => setActionFeedback(null), 3000);
      } else {
        const data = await res.json();
        setActionFeedback("Error: " + (data.error || "Gagal mengubah detail user"));
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (id: string, name: string) => {
    if (id === currentUser?.id) {
      setActionFeedback("Kesalahan Fatal: Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!");
      setTimeout(() => setActionFeedback(null), 4000);
      return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin menghapus user "${name}" dari sistem secara permanen? Seluruh riwayat akan mengikuti aturan integrasi.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setActionFeedback(`User "${name}" berhasil dihapus.`);
        await fetchAdminStats();
        await refreshAllData();
        setTimeout(() => setActionFeedback(null), 3005);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setShowCreateUser(false);
    setUserFormName(user.name);
    setUserFormEmail(user.email);
    setUserFormRole(user.role);
    setUserFormAngkatan(user.angkatan || '');
    setUserFormCampus(user.campus || '');
    setUserFormPassword('');
    setUserFormAvatar(user.avatar || '');
    setUserFormPhone(user.phone || '');
  };

  // Handle create category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catName, icon: catIcon })
      });
      if (res.ok) {
        setActionFeedback(`Kategori "${catName}" sukses ditambahkan!`);
        setCatName('');
        await refreshAllData();
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (e) {}
  };

  // Adjust config platform commission, WhatsApp, App Name & App Logo
  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          commissionPercent: commissionVal,
          adminWhatsapp: adminWhatsappVal,
          appLogo: appLogoVal,
          appName: appNameVal
        })
      });
      if (res.ok) {
        setActionFeedback("Konfigurasi platform (Komisi, WhatsApp, Nama, & Logo Resmi) berhasil disimpan!");
        await refreshAllData();
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (e) {}
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vchCode || !vchAmount) {
      setActionFeedback("Kode voucher dan nominal wajib diisi.");
      setTimeout(() => setActionFeedback(null), 3000);
      return;
    }
    try {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: vchCode.toUpperCase(),
          type: vchType,
          discountType: vchDiscountType,
          amount: Number(vchAmount),
          minPurchase: Number(vchMinPurchase || 0)
        })
      });
      if (res.ok) {
        setActionFeedback(`Voucher "${vchCode.toUpperCase()}" berhasil diterbitkan!`);
        setVchCode('');
        setVchAmount('');
        setVchMinPurchase('');
        await fetchAdminStats();
        await refreshAllData();
        setTimeout(() => setActionFeedback(null), 3000);
      } else {
        const errData = await res.json();
        setActionFeedback("Error: " + (errData.error || "Gagal menerbitkan voucher"));
        setTimeout(() => setActionFeedback(null), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus voucher ini?")) return;
    try {
      const res = await fetch(`/api/vouchers/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setActionFeedback("Voucher berhasil dihapus.");
        await fetchAdminStats();
        await refreshAllData();
        setTimeout(() => setActionFeedback(null), 3000);
      } else {
        setActionFeedback("Gagal menghapus voucher.");
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveProduct = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/products/${id}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        setActionFeedback(`Produk "${name}" sukses disetujui dan kini publik!`);
        await refreshAllData();
        setTimeout(() => setActionFeedback(null), 3000);
      } else {
        const err = await res.json();
        setActionFeedback("Error: " + err.error);
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
      setActionFeedback("Gagal menyetujui produk.");
    }
  };

  const handleRejectProduct = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/products/${id}/reject`, {
        method: 'POST'
      });
      if (res.ok) {
        setActionFeedback(`Produk "${name}" sukses ditolak dari etalase.`);
        await refreshAllData();
        setTimeout(() => setActionFeedback(null), 3000);
      } else {
        const err = await res.json();
        setActionFeedback("Error: " + err.error);
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
      setActionFeedback("Gagal menolak produk.");
    }
  };

  const tabsList: {
    id: 'overview' | 'applications' | 'bank_accounts' | 'withdrawals' | 'categories' | 'settings' | 'vouchers' | 'products' | 'rajaongkir' | 'users' | 'banners' | 'security_compliance';
    label: string;
    icon: any;
    count: number;
  }[] = [
    { id: 'overview', label: 'STATS OVERVIEW', icon: BarChart2, count: 0 },
    { id: 'applications', label: 'APPLICATIONS', icon: Store, count: apps.filter(x => x.status === ApplicationStatus.PENDING).length },
    { id: 'bank_accounts', label: 'SELLER BANKS', icon: Landmark, count: banks.filter(x => x.status === BankVerificationStatus.PENDING).length },
    { id: 'withdrawals', label: 'SELLER CASHOUTS', icon: ArrowUpRight, count: withdraws.filter(x => x.status === WithdrawalStatus.PENDING).length },
    { id: 'categories', label: 'CATEGORY BUILDER', icon: Layers, count: 0 },
    { id: 'vouchers', label: 'VOUCHERS', icon: Percent, count: adminVouchers.length },
    { id: 'products', label: 'CURATE PRODUCTS', icon: ShieldAlert, count: products ? products.filter(x => x.isApproved === false || x.approvalStatus === 'PENDING').length : 0 },
    { id: 'users', label: 'MANAGE USERS', icon: Users, count: usersList.length },
    { id: 'banners', label: 'CAROUSEL BANNERS', icon: ImageIcon, count: banners ? banners.length : 0 },
    { id: 'security_compliance', label: 'KEAMANAN & DIAGNOSTIK', icon: Activity, count: securityLogsList.length },
  ];

  if (currentUser?.role === Role.SUPER_ADMIN) {
    tabsList.push(
      { id: 'settings', label: 'COMMISSION FEES', icon: SettingsIcon, count: 0 },
      { id: 'rajaongkir', label: 'RAJAONGKIR API', icon: Store, count: 0 }
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] text-slate-800 font-sans" id="admin-workspace-page">
      
      {/* Mobile Sidenav Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Sidebar drawer */}
          <div className="relative flex flex-col w-64 bg-emerald-950 text-white shadow-xl h-full z-50 p-4">
            {/* Logo Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-emerald-800/40">
              <div className="flex items-center gap-2.5">
                <div className="bg-white p-1 rounded-md w-8 h-8 flex items-center justify-center border border-black shadow-inner">
                  <img
                    src={settings?.appLogo || "/src/assets/images/toko_sipil_logo_1781875832848.jpg"}
                    alt="Toko Sipil Logo"
                    className="w-5.5 h-5.5 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-extrabold text-xs uppercase leading-tight text-white tracking-wider">
                    {settings?.appName || "TOKO SIPIL"}
                  </p>
                  <p className="text-[8px] text-emerald-400 uppercase font-semibold tracking-widest">ADMIN PORTAL</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md hover:bg-emerald-900 text-emerald-300"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Search tab */}
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2 w-3 h-3 text-emerald-400" />
              <input
                type="text"
                placeholder="CARI TAB..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 bg-emerald-900/40 border border-emerald-800 text-emerald-100 placeholder-emerald-500 font-mono text-[9px] focus:outline-none uppercase rounded-md"
              />
            </div>

            {/* Nav List */}
            <div className="flex flex-col gap-1 overflow-y-auto flex-1">
              {tabsList
                .filter(tab => tab.label.toLowerCase().includes(sidebarSearch.toLowerCase()))
                .map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  let activeClass = 'bg-emerald-800 text-white font-bold border-emerald-700 shadow-sm';
                  let inactiveClass = 'text-emerald-100 hover:bg-white/5 hover:text-white border-transparent';
                  
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
                        <span className="bg-red-600 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Footer of drawer */}
            <div className="mt-auto pt-4 border-t border-emerald-800/40 flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setActivePage('home');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 text-emerald-300 hover:text-white font-mono text-[11px] uppercase"
              >
                <Home className="w-4 h-4" />
                <span>KEMBALI KE TOKO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Collapsible Left Sidebar (Vertical list - matching Toko Sipil Forest Green theme) */}
      <aside 
        className={`hidden lg:flex flex-col bg-emerald-950 border-r border-emerald-900/60 transition-all duration-300 flex-shrink-0 h-screen overflow-hidden ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
        id="admin-desktop-sidebar"
      >
        {/* Logo Header */}
        <div className={`flex items-center gap-3 p-4 border-b border-emerald-900 overflow-hidden ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="bg-white p-1.5 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0 border border-black shadow-md">
            <img
              src={settings?.appLogo || "/src/assets/images/toko_sipil_logo_1781875832848.jpg"}
              alt="Toko Sipil Logo"
              className="w-7 h-7 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0 flex-1 text-left">
              <p className="font-extrabold text-sm uppercase leading-tight text-white tracking-wider">
                {String(settings?.appName || "TOKO SIPIL").toUpperCase()}
              </p>
              <p className="text-[8px] text-emerald-400 uppercase truncate font-semibold tracking-widest">
                {currentUser?.role === Role.SUPER_ADMIN ? 'SUPER ADMIN' : 'STAFF MODERATOR'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation title label */}
        {!isSidebarCollapsed && (
          <span className="text-[10px] text-emerald-500 font-bold tracking-widest block uppercase px-5 mt-5 mb-2">
            NAVIGATION
          </span>
        )}

        {/* Search Box inside Sidebar */}
        <div className="px-4 mb-4 mt-2">
          {isSidebarCollapsed ? (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-full flex justify-center py-2 bg-emerald-900/40 hover:bg-emerald-900/80 text-emerald-300 rounded-lg transition-colors cursor-pointer"
              title="Search tabs"
            >
              <Search className="w-4 h-4" />
            </button>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-400" />
              <input
                type="text"
                placeholder="CARI TAB..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800 text-white placeholder-emerald-500 font-mono text-[10px] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all uppercase rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Filtered Tabs list */}
        <div className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          {tabsList
            .filter(tab => tab.label.toLowerCase().includes(sidebarSearch.toLowerCase()))
            .map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              let activeClass = 'bg-emerald-800 text-white font-bold border-emerald-700 shadow-sm';
              let inactiveClass = 'text-emerald-100 hover:bg-white/5 hover:text-white border-transparent';
              
              if (tab.id === 'security_compliance' && isActive) {
                activeClass = 'bg-amber-500 text-black font-extrabold border-amber-400';
              } else if (tab.id === 'rajaongkir' && isActive) {
                activeClass = 'bg-rose-950 text-rose-100 border-rose-800 font-black';
              }
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center transition duration-150 cursor-pointer text-left rounded-lg border ${
                    isSidebarCollapsed ? 'justify-center p-3' : 'px-4 py-2.5 gap-3'
                  } ${isActive ? activeClass : inactiveClass}`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${tab.id === 'security_compliance' && isActive ? 'text-red-950 animate-pulse' : ''}`} />
                  {!isSidebarCollapsed && (
                    <span className="flex-1 truncate text-xs uppercase font-medium tracking-wide">{tab.label}</span>
                  )}
                  {tab.count > 0 && (
                    isSidebarCollapsed ? (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                        {tab.count}
                      </span>
                    ) : (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isActive ? 'bg-white text-black' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                        {tab.count}
                      </span>
                    )
                  )}

                  {/* Floating tooltip on hover when sidebar collapsed */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-emerald-950 text-white text-[10px] uppercase font-bold tracking-wider rounded-lg border border-emerald-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 shadow-lg">
                      {tab.label} {tab.count > 0 && `(${tab.count})`}
                    </div>
                  )}
                </button>
              );
            })}
        </div>

        {/* Bottom utilities area */}
        <div className="p-4 border-t border-emerald-900 flex flex-col gap-1.5">
          <div className={`flex items-center gap-3 p-1.5 rounded-lg ${isSidebarCollapsed ? 'justify-center' : 'justify-between bg-emerald-950/40 border border-emerald-900/40'}`}>
            {!isSidebarCollapsed && (
              <span className="text-[8px] text-emerald-400 uppercase font-bold tracking-wider">LIGHT THEME</span>
            )}
            <div 
              onClick={() => alert("Tema disinkronkan secara otomatis sesuai sistem!")}
              className="relative w-8 h-4 bg-emerald-900/60 rounded-full cursor-pointer flex items-center px-0.5"
            >
              <div className="w-3 h-3 bg-emerald-100 rounded-full shadow-sm"></div>
            </div>
          </div>

          {/* Collapse Menu Button at bottom matching picture */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`w-full group relative flex items-center transition duration-150 cursor-pointer text-left text-emerald-300 hover:bg-white/5 hover:text-white py-2 rounded-lg ${
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
        
        {/* Top Navbar */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200/80 shadow-sm z-10 flex-shrink-0">
          {/* Left: Hamburger & Page Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                if (window.innerWidth >= 1024) {
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-600 focus:outline-none cursor-pointer transition-colors"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Logo Indicator */}
            <div className="flex items-center gap-2 lg:hidden">
              <img
                src={settings?.appLogo || "/src/assets/images/toko_sipil_logo_1781875832848.jpg"}
                alt="Toko Sipil Logo"
                className="w-6 h-6 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="font-serif font-black text-xs uppercase tracking-tight text-emerald-950">
                {settings?.appName || "TOKO SIPIL"}
              </span>
            </div>

            {/* Desktop Breadcrumbs */}
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-sans font-bold tracking-wider">
              <span className="text-slate-400">PORTAL ADMIN</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-emerald-900 uppercase">
                {tabsList.find(t => t.id === activeTab)?.label || activeTab}
              </span>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="hidden md:flex items-center max-w-sm w-full mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari transaksi, toko, pengguna, barang..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 transition-all rounded-lg"
              />
            </div>
          </div>

          {/* Right Action Icons & User Menu */}
          <div className="flex items-center gap-2.5">
            
            {/* Inbox messages */}
            <button 
              onClick={() => alert("Pesan koordinasi admin berjalan lancar!")}
              className="relative w-9 h-9 rounded-xl border border-slate-250/60 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 text-slate-500 cursor-pointer transition-all flex items-center justify-center group"
              title="Pesan Masuk"
            >
              <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-105" />
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            {/* Notifications */}
            <button 
              onClick={() => alert("Seluruh sistem transaksi terpantau aman dan stabil.")}
              className="relative w-9 h-9 rounded-xl border border-slate-250/60 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 text-slate-500 cursor-pointer transition-all flex items-center justify-center group"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4 transition-transform group-hover:scale-105" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-sans font-black leading-none rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-white shadow-sm">3</span>
            </button>

            {/* Divider */}
            <span className="w-px h-5 bg-slate-200 mx-1"></span>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-1 group cursor-pointer relative py-1">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                alt="Admin Avatar"
                className="w-7.5 h-7.5 rounded-full border border-emerald-800/10 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="hidden sm:block text-left font-sans leading-none">
                <p className="font-bold text-[11px] text-slate-800 uppercase tracking-wide">{currentUser?.name || 'ADMIN'}</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  {currentUser?.role === Role.SUPER_ADMIN ? 'SUPER' : 'STAFF'}
                </p>
              </div>

              {/* Hover Dropdown Option */}
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200/80 shadow-lg rounded-xl p-2.5 invisible group-hover:visible transition-all duration-150 z-50 text-left font-sans space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase px-2 mb-1">Signed in as</p>
                <p className="text-[11px] font-bold text-slate-800 px-2 truncate leading-tight">{currentUser?.email}</p>
                <div className="h-px bg-slate-100 my-1.5" />
                
                <button 
                  onClick={() => setActivePage('home')}
                  className="w-full text-left text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 rounded-md flex items-center gap-2 px-2 py-1.5 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>KEMBALI KE TOKO</span>
                </button>
                
                <button 
                  onClick={() => alert("Keamanan akun admin terenkripsi end-to-end.")}
                  className="w-full text-left text-[11px] font-semibold text-slate-600 hover:bg-slate-50 rounded-md flex items-center gap-2 px-2 py-1.5 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>PENGATURAN AKUN</span>
                </button>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setActivePage('home')}
              className="ml-2 px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-white rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer"
              title="Storefront"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">STOREFRONT</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Workspace Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-28 lg:pb-8 bg-slate-50">
          
          {/* Action Feedback Banner */}
          {actionFeedback && (
            <div className="mb-6 bg-emerald-900 border border-emerald-800 text-emerald-100 py-3 px-4 font-sans text-xs font-bold rounded-xl shadow-sm flex items-center justify-between">
              <span>Notifikasi Sistem: {actionFeedback}</span>
              <button onClick={() => refreshAllData()} className="text-[10px] uppercase font-bold tracking-widest bg-emerald-800 hover:bg-emerald-700 text-white px-2 py-1 rounded transition-colors">
                REFRESH
              </button>
            </div>
          )}

          {/* Quick Stats Header info widget specifically styled like admin panel */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {currentUser?.role === Role.SUPER_ADMIN ? 'SUPER ADM SYSTEM' : 'STAFF MODERATOR'}
              </span>
              <h1 className="font-sans text-2xl font-black text-slate-900 uppercase tracking-tight mt-1">PLATFORM MANAGEMENT</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">
                Pusat kendali komisi, toko, saldo penarikan, voucher, dan penanganan laporan
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white px-3.5 py-2 border border-slate-200/80 rounded-xl shadow-sm text-xs font-bold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="uppercase tracking-wide">Status Sesi: Terotorisasi</span>
            </div>
          </div>

      {activeTab === 'overview' && (
        <div className="space-y-6" id="overview-pane">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="overview-metrics">
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
              <div>
                <span className="text-[9.5px] text-slate-400 font-extrabold tracking-wider block uppercase mb-1">TOTAL USER AKTIF</span>
                <span className="font-serif text-3.5xl font-black block text-slate-900">{stats.totalUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 mt-4 text-[9.5px] uppercase border-t border-slate-100 pt-2">
                <span className="font-semibold tracking-wider">TERMASUK VENDOR</span>
                <Users className="w-4 h-4 text-slate-600" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
              <div>
                <span className="text-[9.5px] text-slate-400 font-extrabold tracking-wider block uppercase mb-1">TOKO HMTS TERVERIFIKASI</span>
                <span className="font-serif text-3.5xl font-black block text-emerald-700">{stats.totalSellers || 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 mt-4 text-[9.5px] uppercase border-t border-slate-100 pt-2">
                <span className="font-semibold tracking-wider">TENANT EKOKRAF</span>
                <Store className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
              <div>
                <span className="text-[9.5px] text-slate-400 font-extrabold tracking-wider block uppercase mb-1">PRODUK YANG TAYANG</span>
                <span className="font-serif text-3.5xl font-black block text-indigo-700">{stats.totalProducts || 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 mt-4 text-[9.5px] uppercase border-t border-slate-100 pt-2">
                <span className="font-semibold tracking-wider">KATALOG DISIPLIN</span>
                <ShoppingCart className="w-4 h-4 text-indigo-600" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-850 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between text-white">
              <div>
                <span className="text-[9.5px] text-slate-400 font-extrabold tracking-wider block uppercase mb-1">PENDAPATAN KOMISI ADMIN</span>
                <span className="text-xl font-black block text-emerald-400">
                  Rp{(stats.platformEarning || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400 mt-4 text-[9.5px] uppercase border-t border-slate-800 pt-2">
                <span className="font-semibold tracking-wider">KUTIPAN PLATFORM {stats.commissionPercent || 5}%</span>
                <Percent className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Admin Profits Calculator and Breakdown Card */}
          <div className="bg-amber-50/70 border-4 border-black p-6 maternal-shadow font-mono text-xs">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-black pb-4 mb-4">
              <div className="space-y-1">
                <span className="bg-black text-[#f4f2e9] px-2 py-0.5 font-bold tracking-widest text-[9px] uppercase">
                  FINANCIAL LEDGER & TAX REPORT
                </span>
                <h3 className="font-serif text-xl font-black text-black uppercase tracking-tight">
                  RINCIAN KEUNTUNGAN & KEUANGAN PLATFORM
                </h3>
              </div>
              <div className="bg-black text-white p-2.5 border border-black font-mono text-right shrink-0">
                <span className="text-[9px] block text-gray-400 uppercase">KOMISI AKTIF SAAT INI</span>
                <span className="text-sm font-black text-green-400">{stats.commissionPercent || 5}% PER TRANSAKSI</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Formula & Explanations */}
              <div className="bg-white border-2 border-black p-4 maternal-shadow-sm flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-black text-xs text-black border-b border-black pb-1 uppercase mb-2">RUMUS UNTUNG ADMIN</h4>
                  <p className="text-gray-600 leading-relaxed text-[11px]">
                    Admin mengambil komisi sebesar <strong className="text-black">{stats.commissionPercent || 5}%</strong> dari subtotal harga produk pada setiap pesanan berstatus <span className="bg-green-105 text-green-909 px-1.5 py-0.5 border border-green-300 font-bold rounded-none">COMPLETED</span> (Selesai). Biaya ongkos kirim diserahkan sepenuhnya ke kurir/tenant.
                  </p>
                </div>
                <div className="bg-neutral-50 p-2.5 border border-neutral-300 text-[10px] space-y-1">
                  <span className="font-black block uppercase text-gray-500">Persamaan Nilai:</span>
                  <code className="text-red-900 block font-bold">L_Platform = Σ(Subtotal_Produk) × {stats.commissionPercent || 5}%</code>
                </div>
              </div>

              {/* Exact Numbers Grid */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white border border-black p-3 space-y-1">
                    <span className="text-gray-400 uppercase text-[9px] block">Total Volume Seluruh Transaksi</span>
                    <span className="text-sm font-black text-black">Rp{(stats.totalTransactions || 0).toLocaleString('id-ID')}</span>
                  </div>

                  <div className="bg-white border border-black p-3 space-y-1">
                    <span className="text-gray-400 uppercase text-[9px] block">Volume Pesanan Sukses (Completed)</span>
                    <span className="text-sm font-black text-black">Rp{(stats.completedOrdersValue || 0).toLocaleString('id-ID')}</span>
                  </div>

                  <div className="bg-teal-50 border border-teal-800 p-3 space-y-1 text-teal-950">
                    <span className="text-teal-700 uppercase text-[9px] block">Total Payout Diserahkan ke Seller</span>
                    <span className="text-sm font-black">Rp{(stats.sellerPayout || 0).toLocaleString('id-ID')}</span>
                  </div>

                  <div className="bg-green-50 border border-green-800 p-3 space-y-1 text-green-950">
                    <span className="text-green-700 uppercase text-[9px] block font-extrabold">KEUNTUNGAN NET ADMIN (BERSIH)</span>
                    <span className="text-sm font-black text-green-700">Rp{(stats.platformEarning || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="bg-neutral-900 text-white p-3 border border-black flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <span className="text-[10px] uppercase block tracking-wider text-green-400 font-bold">STATUS TRANSFER / WD SELLER</span>
                    <p className="text-[9.5px] text-gray-400 lowercase">seluruh hasil penjualan bersih setelah ditarik komisi dapat ditarik oleh tenant secara aman.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('withdrawals')}
                    className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 transition select-none flex items-center gap-1 border border-black"
                  >
                    <Landmark className="w-3.5 h-3.5" /> TINJAU PENARIKAN DANA SELER
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Graphical Analysis of the Platform */}
          <div className="border border-slate-200/80 bg-white rounded-2xl shadow-sm p-6 space-y-8 font-mono text-xs">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-serif text-xl font-extrabold text-slate-900 uppercase flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <span>GRAFIK ANALISA KINERJA & AKTIVITAS SISTEM</span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase">Peta data visual interaktif: penjualan, keuntungan admin, rasio role user, dan statistik tenant terbaik.</p>
            </div>

            {/* Grid Charts Rowland */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Revenue vs Admin Profit Trend */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="font-bold uppercase text-[10px] flex items-center gap-1.5 text-slate-700">
                    <TrendingUp className="w-4 h-4 text-emerald-600 animate-pulse" />
                    Trend Omset Toko & Untung Bersih Admin
                  </span>
                  <span className="text-[9px] text-gray-400">10 HARI TERAKHIR</span>
                </div>
                
                <div className="h-60 w-full text-[10px]">
                  {stats.trendData && stats.trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={stats.trendData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1e293b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ background: '#111', border: 'none', color: '#fff' }}
                          formatter={(value: any) => [`Rp${Number(value).toLocaleString('id-ID')}`]}
                        />
                        <Legend />
                        <Area name="Omset Penjualan" type="monotone" dataKey="sales" stroke="#1e293b" fillOpacity={1} fill="url(#colorSales)" />
                        <Area name="Komisi Bersih Admin" type="monotone" dataKey="earnings" stroke="#22c55e" fillOpacity={1} fill="url(#colorEarnings)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 italic">
                      Belum ada transaksi terekam untuk digambarkan dalam diagram garis.
                    </div>
                  )}
                </div>
              </div>

              {/* Chart 2: Order Statuses distribution */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="font-bold uppercase text-[10px] flex items-center gap-1.5 text-slate-700">
                    <BarChart3 className="w-4 h-4 text-orange-600" />
                    Distribusi Status Pesanan (Orders)
                  </span>
                  <span className="text-[9px] text-gray-400">STATUS AKTIF</span>
                </div>

                <div className="h-60 w-full text-[10px]">
                  {stats.ordersByStatus && stats.ordersByStatus.some((o: any) => o.value > 0) ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={stats.ordersByStatus} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip contentStyle={{ background: '#111', border: 'none', color: '#fff' }} />
                        <Legend />
                        <Bar name="Jumlah Pesanan" dataKey="value" fill="#de2222" border="1px solid #000" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 italic">
                      Belum ada transaksi di platform saat ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Chart 3: Role distribution */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="font-bold uppercase text-[10px] flex items-center gap-1.5 text-slate-700">
                    <PieIcon className="w-4 h-4 text-blue-600" />
                    Proporsi Klasifikasi Peran (Role) User
                  </span>
                  <span className="text-[9px] text-gray-400">DATABASE INTEGRASI</span>
                </div>

                <div className="h-60 w-full flex flex-col md:flex-row items-center justify-between">
                  {stats.roleDistribution && stats.roleDistribution.some((r: any) => r.value > 0) ? (
                    <>
                      <div className="w-full md:w-1/2 h-full text-[10px]">
                        <ResponsiveContainer width="100%" height={240}>
                          <PieChart>
                            <Pie
                              data={stats.roleDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {[
                                '#e52a2a', // Admin Red
                                '#0d9488', // Seller Teal
                                '#3b82f6', // Buyer Blue
                                '#9333ea', // Pegawai Purple
                              ].map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} stroke="#fff" strokeWidth={2} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#111', border: 'none', color: '#fff' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="w-full md:w-1/2 space-y-2 pl-4 border-l border-neutral-200">
                        <span className="block text-[8px] uppercase tracking-wider text-gray-400">LEGENDA DAN RASIO TOTAL:</span>
                        {stats.roleDistribution.map((item: any, idx: number) => {
                          const colors = ['#e52a2a', '#0d9488', '#3b82f6', '#9333ea'];
                          return (
                            <div key={idx} className="flex items-center gap-2 uppercase text-[9.5px]">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[idx] }} />
                              <span className="font-bold text-gray-700">{item.name}:</span>
                              <span className="text-black font-extrabold">{item.value || 0} akun</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 italic">
                      Tidak ada user terdaftar.
                    </div>
                  )}
                </div>
              </div>

              {/* Chart 4: Leaderboard Top Stores */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="font-bold uppercase text-[10px] flex items-center gap-1.5 text-slate-700">
                    <Store className="w-4 h-4 text-purple-600" />
                    Peringkat 5 Tenant Terbaik (Completed Sales)
                  </span>
                  <span className="text-[9px] text-gray-400">VOLUME REVENUE</span>
                </div>

                <div className="h-60 w-full text-[10px]">
                  {stats.popularStores && stats.popularStores.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart 
                        data={stats.popularStores} 
                        layout="vertical"
                        margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" stroke="#6b7280" />
                        <YAxis dataKey="name" type="category" width={90} stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ background: '#111', border: 'none', color: '#fff' }}
                          formatter={(value: any) => [`Rp${Number(value).toLocaleString('id-ID')}`]}
                        />
                        <Legend />
                        <Bar name="Omset Completed (Rp)" dataKey="sales" fill="#0d9488" stroke="#000" strokeWidth={1} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 italic">
                      Belum ada tenant dengan penjualan completed di sistem saat ini.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-6" id="applications-pane">
          <h2 className="font-serif text-xl font-bold uppercase tracking-tight block">TINJAUAN PENDAFTARAN TOKO BARU</h2>
          
          {apps.length === 0 ? (
            <p className="font-mono text-xs text-gray-400 italic">Belum ada pendaftaran toko diajukan.</p>
          ) : (
            <div className="space-y-4">
              {apps.map((item) => (
                <div key={item.id} className="bg-white border-2 border-black p-5 maternal-shadow-sm flex flex-col lg:flex-row gap-6 justify-between">
                  {/* Left Side fields info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow font-mono text-xs">
                    <div>
                      <span className="text-gray-400 font-bold uppercase block text-[10px]">REPRESENTATIVE TOKO</span>
                      <p className="font-serif font-bold text-black border-b border-gray-100 py-1 uppercase">{item.name}</p>
                      <p className="text-[10px] text-gray-400 mt-1 select-all">User ID: {item.userId}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 select-all">Username: @{item.username}</p>
                    </div>

                    <div>
                      <span className="text-gray-400 font-bold uppercase block text-[10px]">OWNER BIODATA NIK</span>
                      <p className="font-bold">{item.ownerName}</p>
                      <p className="text-[10px]">Telp: {item.phone}</p>
                      <p className="text-[10px]">NIK: <span className="select-all">{item.nik}</span></p>
                      <p className="text-[10px] truncate max-w-xs" title={item.address}>Alamat: {item.address}</p>
                    </div>

                    <div>
                      <span className="text-gray-400 font-bold uppercase block text-[10px]">FOTO LOGO / KTP SLIDER</span>
                      <div className="flex gap-2 mt-1.5">
                        <img src={item.logo} alt="logo" className="w-12 h-12 border object-cover" referrerPolicy="no-referrer" />
                        <img src={item.ktpPhoto} alt="ktp" className="w-20 h-12 border object-cover" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  </div>

                  {/* Right Side triggers actions and statuses */}
                  <div className="flex flex-col justify-between items-end gap-2 text-right">
                    <span className={`font-mono text-[10px] px-2 py-0.5 font-bold border uppercase ${
                      item.status === ApplicationStatus.APPROVED ? 'bg-green-100 text-green-700 border-green-300' :
                      item.status === ApplicationStatus.REJECTED ? 'bg-red-100 text-red-700 border-red-300' :
                      'bg-orange-100 text-orange-700 border-orange-300'
                    }`}>
                      {item.status}
                    </span>

                    {item.status === ApplicationStatus.PENDING && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveApp(item.id)}
                          className="px-3 py-1.5 bg-green-700 text-white font-mono text-[10px] font-bold border border-black hover:bg-green-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> APPROVE STORE
                        </button>
                        <button
                          onClick={() => handleRejectApp(item.id)}
                          className="px-3 py-1.5 bg-red-700 text-white font-mono text-[10px] font-bold border border-black hover:bg-red-800 flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> REJECT
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bank_accounts' && (
        <div className="space-y-6" id="bank-pane">
          <h2 className="font-serif text-xl font-bold uppercase block">VERIFIKASI REKENING SELLER</h2>
          
          {banks.length === 0 ? (
            <p className="font-mono text-xs text-gray-400 italic">Belum ada pengajuan rekening bank.</p>
          ) : (
            <div className="space-y-4">
              {banks.map((item) => (
                <div key={item.id} className="bg-white border-2 border-black p-4 paternal-shadow-sm flex flex-col md:flex-row justify-between items-start gap-4 font-mono text-xs">
                  <div>
                    <span className="font-bold text-gray-400 text-[10px] block uppercase">BANK METADATA DETAILS</span>
                    <p className="font-bold text-md mt-1 border-b pb-1 flex items-center gap-1">
                      <Landmark className="w-4 h-4 text-[#222]" /> {item.bankName} - {item.accountNumber}
                    </p>
                    <p className="mt-1">Penerima: <b>{item.accountHolder}</b></p>
                    <p className="text-[10px] text-gray-400">Seller User ID: <span className="select-all">{item.sellerId}</span></p>
                  </div>

                  <div>
                    <span className="font-bold text-gray-400 text-[10px] block uppercase">NIK & FOTO BUKU TABUNGAN</span>
                    <p className="font-bold mt-1">NIK: <span className="select-all">{item.nik}</span></p>
                    <a href={item.proofPhoto} target="_blank" rel="noreferrer" className="text-red-700 hover:underline block text-[10px] mt-1 uppercase">LIHAT BUKTI REKENING TABUNGAN</a>
                  </div>

                  <div className="flex flex-col items-end gap-2 self-stretch justify-between text-right">
                    <span className={`font-mono text-[10px] px-2 py-0.5 font-bold border uppercase ${
                      item.status === BankVerificationStatus.APPROVED ? 'bg-green-100 text-green-700 border-green-300' :
                      item.status === BankVerificationStatus.REJECTED ? 'bg-red-100 text-red-700 border-red-300' :
                      'bg-orange-100 text-orange-700 border-orange-300'
                    }`}>
                      {item.status}
                    </span>

                    {item.status === BankVerificationStatus.PENDING && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveBank(item.id)}
                          className="px-2.5 py-1.5 bg-green-700 text-white text-[10px] font-bold border border-black hover:bg-green-800 cursor-pointer"
                        >
                          APPROVE VERIFIED
                        </button>
                        <button
                          onClick={() => handleRejectBank(item.id)}
                          className="px-2.5 py-1.5 bg-red-700 text-white text-[10px] font-bold border border-black hover:bg-red-800 cursor-pointer"
                        >
                          REJECT
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="space-y-6" id="withdraws-pane">
          <h2 className="font-serif text-xl font-bold uppercase block">DAFTAR PENCAIRAN DANA WALLET SELLER (WITHDRAWAL)</h2>

          {withdraws.length === 0 ? (
            <p className="font-mono text-xs text-gray-400 italic">Belum ada pengajuan pencairan dana.</p>
          ) : (
            <div className="space-y-4">
              {withdraws.map((item) => (
                <div key={item.id} className="bg-white border-2 border-black p-4 maternal-shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs">
                  <div>
                    <span className="font-bold text-gray-400 text-[10px] block uppercase">NOMINAL WITHDRAW</span>
                    <p className="font-bold text-lg text-red-700">Rp{item.amount.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-gray-400">Pengajuan ID: <span className="select-all">{item.id}</span></p>
                    <p className="text-[10px] text-gray-400">Tanggal: {new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <span className="font-bold text-gray-400 text-[10px] block uppercase">DESTINASI REKENING</span>
                    <p className="font-bold mt-1 text-[#222]">{item.bankName} - {item.accountNumber}</p>
                    <p className="text-[10px]">A.N.: <b>{item.accountHolder}</b></p>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-right">
                    <span className={`font-mono text-[10px] px-2 py-0.5 font-bold border uppercase ${
                      item.status === WithdrawalStatus.COMPLETED ? 'bg-green-100 text-green-700 border-green-300' :
                      item.status === WithdrawalStatus.REJECTED ? 'bg-red-100 text-red-700 border-red-300' :
                      'bg-orange-100 text-orange-700 border-orange-300'
                    }`}>
                      {item.status}
                    </span>

                    {item.notes && <p className="text-[10px] text-gray-400 italic">Notes: {item.notes}</p>}

                    {item.status === WithdrawalStatus.PENDING && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveWd(item.id)}
                          className="px-2.5 py-1.5 bg-green-700 text-white text-[10px] font-bold border border-black hover:bg-green-800 cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> SETUJUI CAIRKAN
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Masukan alasan penolakan pencairan:");
                            if (reason) handleRejectWd(item.id, reason);
                          }}
                          className="px-2.5 py-1.5 bg-red-700 text-white text-[10px] font-bold border border-black hover:bg-red-800 cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> TOLAK REFUND
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="category-builder-pane">
          {/* Create category Form */}
          <div className="bg-white border-2 border-black p-6 maternal-shadow-sm font-mono text-xs">
            <h3 className="font-serif text-lg font-bold uppercase tracking-tight text-black mb-4 block">TAMBAHKAN KATEGORI FASHION BARU</h3>
            
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase">NAMA KATEGORI *</label>
                <input 
                  type="text" 
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Streetwear Caps, Footwear, Rings"
                  required
                  className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase">ICON KEY *</label>
                <input 
                  type="text" 
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  placeholder="Contoh: Sparkles, Flame, Scissors, Shirt"
                  className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 maternal-btn font-bold text-xs uppercase"
              >
                TERBITKAN KATEGORI SEKARANG
              </button>
            </form>
          </div>

          {/* List existing */}
          <div className="space-y-4 font-mono text-xs">
            <h3 className="font-serif text-lg font-bold uppercase tracking-tight text-black mb-1 block">DAFTAR KATEGORI SISTEM</h3>
            <span className="text-[10px] text-gray-400 block mb-4">TOTAL TERDAFTAR: {categories.length} KATEGORI</span>

            <div className="grid grid-cols-1 gap-2.5">
              {categories.map((c) => (
                <div key={c.id} className="bg-[#faf9f3] p-3 border border-black flex justify-between items-center">
                  <div>
                    <span className="font-bold text-black uppercase">{c.name}</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">SLUG COMPATIBLE: {c.slug}</p>
                  </div>
                  <span className="text-gray-400 font-mono font-bold">Icon: {c.icon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && currentUser?.role === Role.SUPER_ADMIN && (
        <div className="max-w-md bg-white border-2 border-black p-6 maternal-shadow font-mono text-xs" id="settings-fee-pane">
          <h3 className="font-serif text-lg font-bold uppercase tracking-tight text-black mb-4 block">KONFIGURASI PLATFORM & WHATSAPP</h3>
          
          <form onSubmit={handleSaveCommission} className="space-y-4">
            <div>
              <label className="block text-gray-400 font-bold mb-1 text-[11px] uppercase">KOMISI PLATFORM (%) *</label>
              <div className="flex">
                <input 
                  type="number" 
                  min={0}
                  max={99}
                  value={commissionVal}
                  onChange={(e) => setCommissionVal(Number(e.target.value))}
                  required
                  className="flex-grow bg-slate-50 border-2 border-black p-2.5 text-center font-bold text-lg focus:outline-none"
                />
                <span className="bg-black text-[#fcfbf7] font-bold p-3 border-y-2 border-r-2 border-black text-center flex items-center justify-center font-bold text-md cursor-default">% CUT</span>
              </div>
              <span className="text-[10px] text-gray-400 mt-2 block leading-snug">
                Persentase komisi ini diambil dari nilai total produk order Completed. Misal komisi 5%, order Rp100.000, maka platform mendapat Rp5.000 dan penarikan Wallet Seller adalah Rp95.000.
              </span>
            </div>

            <div>
              <label className="block text-gray-400 font-bold mb-1 text-[11px] uppercase">NOMOR WHATSAPP VERIFIKASI ADMIN *</label>
              <input 
                type="text" 
                value={adminWhatsappVal}
                onChange={(e) => setAdminWhatsappVal(e.target.value)}
                required
                placeholder="628123456789"
                className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs"
              />
              <span className="text-[10px] text-gray-400 mt-2 block leading-snug">
                Nomor ini akan digunakan sebagai tujuan verifikasi Dokumen NIK & KTP calon penjual saat mendaftar toko baru (format internasional, tanpa tanda +, misal: 628123456789).
              </span>
            </div>

            <div>
              <label className="block text-gray-400 font-bold mb-1 text-[11px] uppercase">NAMA APLIKASI (APP NAME) *</label>
              <input 
                type="text" 
                value={appNameVal}
                onChange={(e) => setAppNameVal(e.target.value)}
                required
                placeholder="Toko Sipil"
                className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs text-black"
              />
              <span className="text-[10px] text-gray-400 mt-2 block leading-snug">
                Nama utama aplikasi yang akan dirender di seluruh platform (Header, Footer, Dokumen, dll).
              </span>
            </div>

            <div>
              <label className="block text-gray-400 font-bold mb-1 text-[11px] uppercase">LOGO RESMI APLIKASI (OFFICIAL BRAND LOGO) *</label>
              
              {/* Logo Preview */}
              <div className="flex items-center gap-3 bg-slate-50 border-2 border-black p-3 mb-2">
                <img 
                  src={appLogoVal || "/src/assets/images/toko_sipil_logo_1781875832848.jpg"} 
                  alt="Official Logo Preview" 
                  className="w-14 h-14 min-w-[56px] rounded border border-black object-cover bg-white"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1 overflow-hidden">
                  <span className="text-[9px] bg-black text-[#fcfbf7] px-1.5 py-0.5 font-bold uppercase inline-block">LIVE PREVIEW</span>
                  <span className="text-[8px] text-gray-500 break-all leading-tight block select-all">
                    {appLogoVal && appLogoVal.startsWith('data:') ? 'Format: Base64 Uploaded File' : `Path: ${appLogoVal || 'Default Asset'}`}
                  </span>
                </div>
              </div>

              {/* Upload controls */}
              <div className="space-y-2 bg-slate-50 border-2 border-dashed border-gray-400 p-2.5">
                <div>
                  <span className="block text-gray-400 font-bold uppercase text-[8px] mb-1">UPLOAD DARI FILES / SMARTPHONE :</span>
                  <label className="cursor-pointer bg-black hover:bg-neutral-800 text-white border border-black px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest inline-block transition text-center select-none">
                    PILIH LOGO BARU...
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressAndResizeImage(file, 400, 400, 0.85);
                            setAppLogoVal(compressed);
                          } catch (err: any) {
                            console.error("Gagal memproses logo baru:", err);
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="relative">
                  <span className="block text-gray-400 font-bold uppercase text-[8px] mb-1">ATAU INPUT DIRECT URL GAMBAR :</span>
                  <input 
                    type="text" 
                    value={appLogoVal}
                    onChange={(e) => setAppLogoVal(e.target.value)}
                    placeholder="https://example.com/logo.jpg"
                    className="w-full bg-white border border-black p-2 font-mono text-[9px] text-black"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 maternal-btn text-xs font-bold uppercase mt-2"
              id="save-commission-btn"
            >
              SAVE PLATFORM CONFIGURATION
            </button>
          </form>
        </div>
      )}

      {activeTab === 'rajaongkir' && (
        <div className="space-y-6" id="rajaongkir-integration-pane">
          {/* Header Description */}
          <div className="bg-sky-55/70 border border-sky-100 p-6 rounded-2xl shadow-sm">
            <h3 className="font-serif text-xl font-extrabold uppercase text-sky-950 flex items-center gap-2 mb-2">
              🚚 RajaOngkir API Integration Hub
            </h3>
            <p className="font-sans text-xs text-sky-900 leading-relaxed">
              RajaOngkir adalah API penyedia data ongkos kirim terlengkap di Indonesia (JNE, POS, TIKI, J&T, Sicepat, dll). 
              Aplikasi Toko Sipil dilengkapi dengan <b>Hybrid Smart Engine</b>: jika API Key terpasang, sistem akan menghitung tarif asli secara realtime melintasi kota se-Indonesia. Jika kosong, sistem otomatis memakai <b>Simulator Cerdas</b> agar transaksi checkout tetap berjalan aman tanpa gangguan!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* status diagnostic block */}
            <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm font-sans text-xs space-y-4">
              <h4 className="font-sans text-sm font-bold text-slate-900 uppercase border-b border-dashed border-slate-200 pb-3 flex items-center justify-between">
                <span>⚡ STATUS KONEKSI API REST</span>
                <span className={`px-2.5 py-1 text-[9px] font-black rounded-full ${rajaongkirStatus?.active ? 'bg-emerald-600 text-white animate-pulse' : 'bg-rose-600 text-white'}`}>
                  {rajaongkirStatus?.active ? 'TERHUBUNG (REAL API)' : 'SIMULATOR MODE'}
                </span>
              </h4>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div>
                  <span className="text-gray-400 text-[9px] uppercase font-extrabold block">Status Integrasi:</span>
                  <span className="text-sm font-bold text-slate-800">
                    {rajaongkirStatus?.active ? '✅ RajaOngkir AKTIF' : '❌ API Key Kosong'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[9px] uppercase font-extrabold block">Masked API Key:</span>
                  <span className="text-sm font-mono font-bold text-slate-800 select-all bg-slate-200/60 px-1.5 py-0.5 rounded border border-slate-300">
                    {rajaongkirStatus?.maskedKey}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[9px] uppercase font-extrabold block">Origin Pengiriman:</span>
                  <span className="text-sm font-bold text-slate-800">
                    {rajaongkirStatus?.originCity} (ID: {rajaongkirStatus?.originId})
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[9px] uppercase font-extrabold block">Hasil Test Ping Server:</span>
                  <span className={`text-[11px] font-bold ${rajaongkirStatus?.connectionTest?.includes('SUKSES') ? 'text-emerald-700' : 'text-amber-800'}`}>
                    {rajaongkirStatus?.connectionTest}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTriggerDiagnosticCount(prev => prev + 1)}
                  disabled={loadingRajaongkir}
                  className="px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 transition font-sans font-extrabold uppercase text-[10px] rounded-lg tracking-wider cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {loadingRajaongkir ? '🔄 MEMROSES TEST...' : '🔍 JALANKAN DIAGNOSTIK KONEKSI'}
                </button>
                <span className="text-[10px] text-slate-400 font-sans">
                  Terakhir diperbarui: {new Date().toLocaleTimeString()}
                </span>
              </div>

              {/* Sample Cities from RajaOngkir */}
              {rajaongkirStatus?.sampleCities && rajaongkirStatus.sampleCities.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3 mt-4">
                  <h5 className="font-bold text-[9.5px] uppercase text-slate-400 tracking-wider">10 Kota Teratas RajaOngkir (Respon Sukses API):</h5>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 font-sans text-[9px]">
                    {rajaongkirStatus.sampleCities.map((c: any) => (
                      <div key={c.id} className="bg-white p-2 border border-slate-150 rounded-lg text-center shadow-xs">
                        <span className="font-bold text-indigo-600 block">ID {c.id}</span>
                        <span className="text-[10px] text-slate-800 font-extrabold truncate block uppercase mt-0.5">{c.name}</span>
                        <span className="text-[8px] text-slate-400 uppercase mt-0.5 block">{c.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mapper Info */}
              <div className="mt-4">
                <h5 className="font-bold text-[11px] uppercase text-black mb-2">Peta Kota yang Terenkripsi (UI ke City ID):</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                  {rajaongkirStatus?.cityMap && Object.entries(rajaongkirStatus.cityMap).map(([key, val]) => (
                    <div key={key} className="bg-[#fcfbf7] border border-black p-2 flex justify-between">
                      <span className="capitalize font-bold">{key}</span>
                      <span className="font-bold text-red-700 font-mono">ID {String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tutorial & Shopee Explanation block */}
            <div className="bg-[#111] text-[#f4f2e9] p-6 maternal-shadow-sm font-mono text-xs space-y-4">
              <h4 className="font-serif text-sm font-bold text-yellow-400 uppercase border-b border-gray-800 pb-2">
                💡 TUTORIAL & PETUNJUK INTEGRASI
              </h4>

              <div className="space-y-4 text-[11px] leading-relaxed">
                <div>
                  <h5 className="font-bold text-white text-[12px] uppercase mb-1">1. Cara Mendapatkan API Key:</h5>
                  <ol className="list-decimal pl-4 space-y-1 text-gray-300">
                    <li>Kunjungi website <a href="https://rajaongkir.com" target="_blank" rel="noreferrer" className="text-yellow-400 underline font-bold">rajaongkir.com</a> dan buat akun baru.</li>
                    <li>Pilih tipe akun <b>Starter</b> (gratis, cukup untuk uji coba & mendukung kurir JNE, POS Indonesia, dan TIKI).</li>
                    <li>Masuk ke Panel Akun Anda, lalu buka menu <b>API Key</b> untuk menyalin kunci unik Anda.</li>
                  </ol>
                </div>

                <div>
                  <h5 className="font-bold text-white text-[12px] uppercase mb-1">2. Pemasangan di AI Studio:</h5>
                  <p className="text-gray-300 mb-2">
                    Buka tab <b>Settings</b> pengembang di panel AI Studio sebelah kanan, lalu buat variable baru:
                  </p>
                  <code className="block bg-neutral-900 border border-neutral-700 p-2 text-[10px] text-yellow-400 select-all mb-2">
                    RAJAONGKIR_API_KEY=nilai_api_key_anda
                  </code>
                  <p className="text-gray-300">
                    Simpan dan Restart Dev Server. Database calculation system kami akan otomatis mengabaikan simulator dan menarik tarif ongkir asli langsung dari server RajaOngkir!
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-yellow-500 text-[12px] uppercase mb-1">📦 Apakah Shopee menggunakan RajaOngkir?</h5>
                  <p className="text-gray-350">
                    <b>Tidak.</b> Shopee adalah e-commerce raksasa yang memiliki unit logistik internal mandiri (Shopee Xpress) dan integrasi API enterprise skala multi-miliar langsung ke sistem pusat kurir (seperti J&T, SiCepat, JNE). 
                  </p>
                  <p className="text-gray-350 mt-1.5">
                    Namun, untuk website e-commerce UMKM, sistem custom, dan platform multi-vendor independen di Indonesia, <b>RajaOngkir</b> adalah standar emas utama karena kemudahan penggunaan, database yang terpusat, dan integrasi yang sangat cepat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vouchers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="voucher-manager-pane">
          {/* Create Voucher Form */}
          <div className="bg-white border-2 border-black p-6 maternal-shadow-sm font-mono text-xs">
            <h3 className="font-serif text-lg font-bold uppercase tracking-tight text-black mb-4 block">TERBITKAN VOUCHER BRAND BARU</h3>
            
            <form onSubmit={handleCreateVoucher} className="space-y-4">
              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase">KODE VOUCHER *</label>
                <input 
                  type="text" 
                  value={vchCode}
                  onChange={(e) => setVchCode(e.target.value)}
                  placeholder="Contoh: SIPILHEBOH10, PROMO25"
                  required
                  className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold uppercase focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold mb-1 uppercase">TIPE VOUCHER *</label>
                  <select
                    value={vchType}
                    onChange={(e: any) => setVchType(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none cursor-pointer"
                  >
                    <option value="PLATFORM">PLATFORM (Global)</option>
                    <option value="STORE">STORE (Toko)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1 uppercase">TIPE POTONGAN *</label>
                  <select
                    value={vchDiscountType}
                    onChange={(e: any) => setVchDiscountType(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none cursor-pointer"
                  >
                    <option value="NOMINAL">IDR NOMINAL (Rp)</option>
                    <option value="PERCENTAGE">PERSENTASE (%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold mb-1 uppercase">BESAR POTONGAN *</label>
                  <input 
                    type="number" 
                    min={1}
                    value={vchAmount}
                    onChange={(e) => setVchAmount(e.target.value)}
                    placeholder={vchDiscountType === 'NOMINAL' ? 'Contoh: 15000' : 'Contoh: 10'}
                    required
                    className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1 uppercase">MIN BELANJA (RP)</label>
                  <input 
                    type="number" 
                    min={0}
                    value={vchMinPurchase}
                    onChange={(e) => setVchMinPurchase(e.target.value)}
                    placeholder="Contoh: 50000 (0 jika tidak ada)"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 maternal-btn font-bold text-xs uppercase"
              >
                BAGIKAN VOUCHER DISKON SEKARANG
              </button>
            </form>
          </div>

          {/* List existing Vouchers */}
          <div className="space-y-4 font-mono text-xs">
            <h3 className="font-serif text-lg font-bold uppercase tracking-tight text-black mb-1 block">DAFTAR PILIHAN VOUCHER AKTIF</h3>
            <span className="text-[10px] text-gray-400 block mb-4">TOTAL PERIODE: {adminVouchers.length} VOUCHER BERLAKU</span>

            {adminVouchers.length === 0 ? (
              <div className="bg-amber-50 p-4 border border-yellow-300 text-amber-900 leading-snug">
                Saat ini belum ada voucher aktif di sistem platform Anda.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {adminVouchers.map((v) => (
                  <div key={v.id} className="bg-[#faf9f3] p-4 border-2 border-black flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm bg-black text-white px-2 py-0.5 select-all uppercase">
                          {v.code}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 border ${v.type === 'PLATFORM' ? 'bg-red-50 border-red-300 text-red-600' : 'bg-blue-50 border-blue-300 text-blue-600'}`}>
                          {v.type}
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] text-gray-700 space-y-0.5">
                        <p>Discount: <span className="font-bold text-black">{v.discountType === 'NOMINAL' ? `Rp${v.amount.toLocaleString('id-ID')}` : `${v.amount}%`}</span></p>
                        <p>Min. Purchase: <span className="font-bold text-black">Rp{v.minPurchase.toLocaleString('id-ID')}</span></p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteVoucher(v.id)}
                      className="text-xs bg-red-800 text-white font-bold p-1 px-2.5 uppercase border border-black hover:bg-black transition cursor-pointer self-stretch sm:self-auto text-center"
                    >
                      HAPUS VOUCHER
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6 font-mono text-xs" id="admin-products-curator-pane">
          <div className="border-b-2 border-black pb-3">
            <h3 className="font-serif text-lg font-bold uppercase tracking-tight text-black block">KURASI & PERSETUJUAN PRODUK FASHION SELLER</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Seller harus mendapatkan persetujuan admin/petugas sebelum produk rilis ke etalase publik pembeli.</p>
          </div>

          {!products || products.length === 0 ? (
            <p className="font-mono text-xs text-gray-400 italic">Belum ada data barang di platform.</p>
          ) : (() => {
            const pendingProducts = products.filter(p => p.isApproved === false || p.approvalStatus === 'PENDING');
            const curatedProducts = products.filter(p => p.isApproved === true || p.approvalStatus === 'REJECTED');

            return (
              <div className="space-y-8">
                {/* Pending Section */}
                <div className="space-y-4">
                  <h4 className="font-serif text-md font-bold text-[#b91c1c] uppercase border-l-4 border-red-700 pl-2">
                    MENUNGGU PERSETUJUAN ({pendingProducts.length})
                  </h4>
                  {pendingProducts.length === 0 ? (
                    <p className="text-gray-400 italic font-mono bg-white p-4 border border-dashed border-gray-300 text-center uppercase">
                      Semua produk fashion telah dikurasi dengan baik!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingProducts.map(p => (
                        <div key={p.id} className="bg-white border-2 border-black p-4 maternal-shadow-sm flex gap-4">
                          <img src={p.images[0]} alt="preview" className="w-16 h-16 border object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                          <div className="flex-grow min-w-0">
                            <span className="text-[9px] text-gray-400 font-bold block uppercase hover:underline">{p.storeName} (SKU: {p.sku})</span>
                            <h4 className="font-serif text-sm font-bold truncate text-black uppercase">{p.name}</h4>
                            <p className="text-[10px] text-gray-600 line-clamp-1 mt-0.5 normal-case">{p.description || "Tidak ada deskripsi."}</p>
                            <p className="font-bold text-red-800 text-[11px] mt-1">Rp{p.price.toLocaleString('id-ID')} (Diskon: {p.discount}%)</p>
                            
                            <div className="flex items-center gap-2 mt-3">
                              <button
                                onClick={() => handleApproveProduct(p.id, p.name)}
                                className="px-3 py-1 bg-green-700 text-white font-extrabold text-[9px] rounded-none uppercase tracking-wider border border-black hover:bg-black transition cursor-pointer"
                              >
                                SETUJUI RILIS (APPROVE)
                              </button>
                              <button
                                onClick={() => handleRejectProduct(p.id, p.name)}
                                className="px-3 py-1 bg-white text-red-700 font-extrabold text-[9px] rounded-none uppercase tracking-wider border border-red-700 hover:bg-red-50 transition cursor-pointer"
                              >
                                TOLAK (REJECT)
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Already Curated Section */}
                <div className="space-y-4">
                  <h4 className="font-serif text-md font-bold text-gray-800 uppercase border-l-4 border-gray-600 pl-2">
                    RIWAYAT KURASI SEBELUMNYA ({curatedProducts.length})
                  </h4>
                  {curatedProducts.length === 0 ? (
                    <p className="text-gray-400 italic font-mono text-center py-4">Belum ada barang yang dikurasi.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[400px] overflow-y-auto pr-1">
                      {curatedProducts.map(p => (
                        <div key={p.id} className="bg-gray-50 border border-gray-300 p-2.5 flex gap-2 w-full">
                          <img src={p.images[0]} alt="preview" className="w-10 h-10 object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                          <div className="min-w-0 flex-grow">
                            <h5 className="font-bold text-[11px] truncate uppercase">{p.name}</h5>
                            <p className="text-[9px] text-gray-400 block truncate uppercase">{p.storeName}</p>
                            <div className="mt-1 flex items-center justify-between">
                              <span className={`inline-block text-[8px] font-extrabold px-1 border uppercase ${p.isApproved ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                                {p.isApproved ? 'APPROVED' : 'REJECTED'}
                              </span>
                              <div className="flex gap-1.5">
                                {p.isApproved ? (
                                  <button
                                    onClick={() => handleRejectProduct(p.id, p.name)}
                                    className="text-[8px] font-bold text-red-800 hover:underline cursor-pointer"
                                  >
                                    UBAH KE REJECT
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleApproveProduct(p.id, p.name)}
                                    className="text-[8px] font-bold text-green-800 hover:underline cursor-pointer"
                                  >
                                    UBAH KE APPROVE
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6 font-mono text-xs animate-fade-in" id="users-management-view">
          
          {/* Header & Direct Actions row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-black pb-4">
            <div className="space-y-1">
              <span className="bg-red-800 text-white px-2 py-0.5 font-bold tracking-widest text-[9px] uppercase">
                CIVIL ENGINE CORE SYSTEM
              </span>
              <h2 className="font-serif text-2xl font-black text-black uppercase tracking-tight font-sans">
                MANAJEMEN & KONTROL USER
              </h2>
              <p className="text-gray-500 text-[10px] uppercase">
                Kelola status rekrutmen, modifikasi identitas mahasiswa/alumni, hak istimewa role, hingga pemecatan user dari log sistem.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setShowCreateUser(!showCreateUser);
                  // Reset form fields
                  setUserFormName('');
                  setUserFormEmail('');
                  setUserFormPassword('');
                  setUserFormAngkatan('');
                  setUserFormCampus('');
                  setUserFormRole(Role.BUYER);
                }}
                className="bg-black hover:bg-neutral-900 text-[#f4f2e9] font-black px-4 py-2.5 border border-black flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>{showCreateUser ? 'TUTUP FORM PEMBUATAN' : 'TAMBAH USER BARU'}</span>
              </button>
            </div>
          </div>

          {/* Create User Form / Edit User Form Module */}
          {(showCreateUser || editingUser) && (
            <form 
              onSubmit={editingUser ? handleEditUserSubmit : handleCreateUserSubmit} 
              className="bg-zinc-50 border-4 border-black p-5 md:p-6 maternal-shadow space-y-4"
              id="user-management-form"
            >
              <div className="flex justify-between items-center border-b-2 border-black pb-2.5">
                <h3 className="font-serif font-black text-sm uppercase text-black flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-red-800 animate-pulse" />
                  <span>{editingUser ? `MODIFIKASI DETAIL USER: ${editingUser.name}` : 'MANDAT REGISTRASI USER BARU'}</span>
                </h3>
                <button 
                  type="button" 
                  onClick={() => { setShowCreateUser(false); setEditingUser(null); }}
                  className="bg-white hover:bg-neutral-205 border border-black p-1 transition cursor-pointer"
                >
                  <X className="w-4 h-4 text-black" />
                </button>
              </div>

              {/* Grid 2 Column Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block uppercase text-[10px]">Nama Lengkap Mahasiswa / Tamu *</label>
                  <input
                    type="text"
                    required
                    value={userFormName}
                    onChange={(e) => setUserFormName(e.target.value)}
                    placeholder="Nama Lengkap sesuai KTM / KTP..."
                    className="w-full bg-white border border-black p-2.5 rounded-none text-xs text-black font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block uppercase text-[10px]">Alamat Surat Elektronik (Email) *</label>
                  <input
                    type="email"
                    required
                    value={userFormEmail}
                    onChange={(e) => setUserFormEmail(e.target.value)}
                    placeholder="Contoh: iyasyaa@gmail.com..."
                    className="w-full bg-white border border-black p-2.5 rounded-none text-xs text-black font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block uppercase text-[10px]">
                    {editingUser ? 'Ganti Password (Biarkan kosong jika tidak diubah)' : 'Password Kredensial *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showUserFormPassword ? "text" : "password"}
                      required={!editingUser}
                      value={userFormPassword}
                      onChange={(e) => setUserFormPassword(e.target.value)}
                      placeholder={editingUser ? "Masukkan password baru jika ingin meriset..." : "Minimal 6 karakter tepercaya..."}
                      className="w-full bg-white border border-black p-2.5 pl-9 pr-10 rounded-none text-xs text-black font-mono"
                    />
                    <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowUserFormPassword(!showUserFormPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-black cursor-pointer bg-transparent border-none focus:outline-none"
                    >
                      {showUserFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block uppercase text-[10px]">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={userFormPhone}
                    onChange={(e) => setUserFormPhone(e.target.value)}
                    placeholder="Contoh: 08123456789..."
                    className="w-full bg-white border border-black p-2.5 rounded-none text-xs text-black font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block uppercase text-[10px]">Hak Akses / Role Istimewa *</label>
                  <select
                    value={userFormRole}
                    onChange={(e) => setUserFormRole(e.target.value as Role)}
                    className="w-full bg-white border border-black p-2.5 rounded-none text-xs text-black font-mono"
                  >
                    <option value={Role.BUYER}>BUYER (Mahasiswa Belanja / Umum)</option>
                    <option value={Role.SELLER}>SELLER (Tenant / Vendor Ekokraf HMTS)</option>
                    <option value={Role.PEGAWAI}>PEGAWAI (Staf Logistik Himpunan)</option>
                    <option value={Role.SUPER_ADMIN}>SUPER_ADMIN (Biro Inti Sipil)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block uppercase text-[10px]">Tahun Angkatan Sipil (Opsional)</label>
                  <input
                    type="text"
                    value={userFormAngkatan}
                    onChange={(e) => setUserFormAngkatan(e.target.value)}
                    placeholder="Contoh: 2021, 2022, atau 2026..."
                    className="w-full bg-white border border-black p-2.5 rounded-none text-xs text-black font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block uppercase text-[10px]">Asal Institusi Kampus (Opsional)</label>
                  <input
                    type="text"
                    value={userFormCampus}
                    onChange={(e) => setUserFormCampus(e.target.value)}
                    placeholder="Default: UNIVERSITAS KOMPUTER INDONESIA..."
                    className="w-full bg-white border border-black p-2.5 rounded-none text-xs text-black font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2 border-2 border-dashed border-black p-4 bg-slate-50 font-mono">
                  <label className="block text-gray-500 font-extrabold uppercase text-[10px]">FOTO PROFIL / AVATAR USER</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-center animate-fade-in">
                    <img 
                      src={userFormAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userFormName || 'User')}`} 
                      alt="Avatar" 
                      className="w-16 h-16 border border-black bg-white object-cover rounded-none flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-2 w-full flex-grow">
                      <div>
                        <span className="block text-gray-400 font-bold uppercase text-[8px] mb-1">UPLOAD FOTO BARU :</span>
                        <label className="cursor-pointer bg-black hover:bg-neutral-800 text-white border border-black px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-widest inline-block transition text-center">
                          PILIH FILE FOTO...
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressAndResizeImage(file, 256, 256, 0.7);
                                  setUserFormAvatar(compressed);
                                } catch (err: any) {
                                  console.error("Gagal memproses foto ava admin:", err);
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <span className="block text-gray-400 font-bold uppercase text-[8px] mb-1 font-mono">ATAU TULIS LINK URL GAMBAR AVATAR :</span>
                        <input 
                          type="text" 
                          value={userFormAvatar}
                          onChange={(e) => setUserFormAvatar(e.target.value)}
                          placeholder="https://api.dicebear.com/..."
                          className="w-full bg-white border border-black px-2.5 py-1 text-[10px] text-black font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-dashed border-gray-300">
                <button
                  type="button"
                  onClick={() => { setShowCreateUser(false); setEditingUser(null); }}
                  className="bg-white hover:bg-neutral-100 text-black border border-black p-2 px-4 uppercase text-[10px] font-bold"
                >
                  BATALKAN
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-800 text-white font-extrabold p-2 px-5 border border-black uppercase text-[10px] tracking-wide"
                >
                  {editingUser ? 'SIMPAN UPDATE USER' : 'DAFTARKAN & BUAT USER'}
                </button>
              </div>
            </form>
          )}

          {/* Quick Metrics of roles inside the view */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border-2 border-black p-3.5 flex flex-col justify-between">
              <span className="text-gray-450 font-extrabold text-[8px] uppercase">SUPER ADMIN INTEGRAL</span>
              <span className="font-serif font-black text-lg text-red-800">
                {usersList.filter(u => u.role === Role.SUPER_ADMIN).length} ACCOUNTS
              </span>
            </div>
            <div className="bg-white border-2 border-black p-3.5 flex flex-col justify-between">
              <span className="text-gray-455 font-extrabold text-[8px] uppercase">VENDOR / SELLER VERIVIKASI</span>
              <span className="font-serif font-black text-lg text-[#0d9488]">
                {usersList.filter(u => u.role === Role.SELLER).length} COLONY
              </span>
            </div>
            <div className="bg-white border-2 border-black p-3.5 flex flex-col justify-between">
              <span className="text-gray-460 font-extrabold text-[8px] uppercase">BUYERS & CLIENTS ACTIVE</span>
              <span className="font-serif font-black text-lg text-blue-800">
                {usersList.filter(u => u.role === Role.BUYER).length} MEMBERS
              </span>
            </div>
            <div className="bg-white border-2 border-black p-3.5 flex flex-col justify-between">
              <span className="text-gray-465 font-extrabold text-[8px] uppercase">STAFF PEGAWAI SIPIL</span>
              <span className="font-serif font-black text-lg text-purple-800">
                {usersList.filter(u => u.role === Role.PEGAWAI).length} CADRES
              </span>
            </div>
          </div>

          {/* Users filtering section */}
          <div className="bg-white border-2 border-black p-4 flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Pencarian cepat: cari nama, email, angkatan, atau instansi kampus..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full bg-neutral-100 border border-black pl-9 pr-3 py-2 text-xs rounded-none text-black placeholder-gray-400 font-mono"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            </div>
            {userSearchQuery && (
              <button 
                onClick={() => setUserSearchQuery('')}
                className="bg-black text-white hover:bg-neutral-800 transition p-2 px-4 uppercase text-[9px] font-bold border border-black cursor-pointer shrink-0"
              >
                BERSIHKAN FILTER
              </button>
            )}
          </div>

          {/* User management List Table Section */}
          <div className="bg-white border-4 border-black maternal-shadow overflow-x-auto min-w-full">
            <table className="min-w-full text-left font-mono border-collapse divide-y divide-black">
              <thead className="bg-[#111] text-white">
                <tr className="uppercase border-b border-black text-[9px] font-black">
                  <th className="p-3.5">USER AVATAR & DETAIL UTAMA</th>
                  <th className="p-3.5">EMAIL RESMI</th>
                  <th className="p-3.5 text-center">HAK AKSES (ROLE)</th>
                  <th className="p-3.5">KLASIFIKASI MAHASISWA</th>
                  <th className="p-3.5 text-right">AKSI KONTROL KEMITRAAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(() => {
                  const filtered = usersList.filter(u => {
                    if (!userSearchQuery) return true;
                    const query = userSearchQuery.toLowerCase();
                    return (
                      u.name.toLowerCase().includes(query) ||
                      u.email.toLowerCase().includes(query) ||
                      (u.angkatan && u.angkatan.toLowerCase().includes(query)) ||
                      (u.campus && u.campus.toLowerCase().includes(query))
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-gray-400 italic">
                          Tidak ditemukan user yang cocok dengan kriteria pencarian Anda.
                        </td>
                      </tr>
                    );
                  }

                  return filtered.map((usr) => {
                    const isSelf = usr.id === currentUser?.id;
                    return (
                      <tr key={usr.id} className={`hover:bg-neutral-50 transition uppercase text-[10.5px] font-medium text-gray-750 ${isSelf ? 'bg-amber-50/50' : ''}`}>
                        <td className="p-3 border-r border-gray-100 flex items-center gap-2.5">
                          <img 
                            src={usr.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(usr.name)}`} 
                            alt="avatar" 
                            className="w-9 h-9 border border-black bg-zinc-100 object-cover rounded-none flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-black block truncate">
                              {usr.name} {isSelf && <span className="bg-amber-450 text-black border border-black font-serif font-black px-1 py-0.2 ml-1 text-[8px] tracking-normal select-none">SAYA AKTIF</span>}
                            </span>
                            <span className="text-[9px] text-gray-400 block font-mono">ID: {usr.id}</span>
                          </div>
                        </td>
                        
                        <td className="p-3 border-r border-gray-100 select-all max-w-[150px] truncate">
                          {usr.email}
                        </td>
                        
                        <td className="p-3 border-r border-gray-100 text-center">
                          <span className={`inline-block text-[9.5px] font-black px-2 py-0.5 border-2 border-black ${
                            usr.role === Role.SUPER_ADMIN ? 'bg-red-800 text-white' :
                            usr.role === Role.SELLER ? 'bg-[#0d9488] text-white' :
                            usr.role === Role.PEGAWAI ? 'bg-purple-900 text-white' :
                            'bg-neutral-100 text-black'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        
                        <td className="p-3 border-r border-gray-100 leading-normal">
                          <div className="space-y-0.5">
                            <p>Angkatan: <span className="font-bold text-black">{usr.angkatan || 'UMUM/NON-CIVIL'}</span></p>
                            <p className="text-[8.5px] text-gray-400 truncate max-w-[170px]" title={usr.campus || 'UNIVERSITAS KOMPUTER INDONESIA'}>
                              Kampus: {usr.campus || 'UNIKOM'}
                            </p>
                          </div>
                        </td>
                        
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleOpenEdit(usr)}
                              style={{ contentVisibility: 'auto' }}
                              className="bg-white hover:bg-neutral-100 text-black border border-black p-1 px-2 uppercase text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-blue-900" />
                              <span>UBAH DETIL</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usr.id, usr.name)}
                              disabled={isSelf}
                              className={`p-1 px-2 uppercase text-[9px] font-bold flex items-center gap-1 border border-black ${
                                isSelf 
                                  ? 'bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed opacity-55' 
                                  : 'bg-red-800 hover:bg-black text-white hover:text-white cursor-pointer'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>HAPUS</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          <div className="bg-yellow-50 border border-yellow-800 p-4 leading-normal flex items-start gap-2.5 text-[10px] text-amber-950">
            <ShieldAlert className="w-5 h-5 text-red-800 flex-shrink-0 animate-bounce mt-0.5" />
            <div className="space-y-1 uppercase">
              <span className="font-bold text-black block">PROSEDUR DEWAN DISIPLIN HMTS & VENDOR COMPLIANCE</span>
              <p>
                Platform TokoSipil mengintegrasikan database login non-komersial. Segala bentuk perampasan hak akun, fitnah, peretasan, dan tindak manipulasi harga merujuk langsung pada pencopotan peran seller atau suspend akun total. Gunakan akun Admin Anda secara bijak untuk kepentingan transaksi sivitas akademika.
              </p>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs font-mono animate-fade-in" id="banners-management-pane">
          {/* Create Banner Form */}
          <div className="bg-white border-2 border-black p-6 maternal-shadow-sm font-mono text-xs lg:col-span-1">
            <h3 className="font-serif text-lg font-bold uppercase tracking-tight text-black mb-1 block">UPLOAD BANNER BARU</h3>
            <span className="text-[10px] text-gray-500 block mb-4 font-bold">SELURUH ISI BANNER ADALAH SEBUAH GAMBAR UTUH</span>

            <form onSubmit={handleAddBanner} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-gray-450 font-extrabold uppercase text-[10px]">NAMA BANNER (UNTUK ARSIP INTERNAL) *</label>
                <input 
                  type="text" 
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="Contoh: Banner Utama Promo Juni"
                  required
                  className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs text-black"
                />
              </div>

              <div className="space-y-1 bg-slate-50 border-2 border-dashed border-black p-3 rounded-none">
                <label className="block text-gray-500 font-extrabold uppercase text-[10px] mb-2 font-mono">GAMBAR BANNER * (DIREKOMENDASIKAN ASPECT RATIO 21:9 atau 3:1)</label>
                
                <div className="space-y-3">
                  <div>
                    <span className="block text-gray-400 font-bold uppercase text-[8px] mb-1">PILIH FILE DARI PERANGKAT / GALERI FOTO :</span>
                    <label className="cursor-pointer bg-black hover:bg-neutral-800 text-white border border-black px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-widest inline-block transition text-center select-none w-full">
                      UPLOAD GAMBAR BANNER...
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressAndResizeImage(file, 1600, 600, 0.85);
                              setBannerImage(compressed);
                            } catch (err: any) {
                              console.error("Gagal memproses banner admin:", err);
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="relative">
                    <span className="block text-gray-400 font-bold uppercase text-[8px] mb-1 font-mono">ATAU MASUKKAN URL DIREK GAMBAR :</span>
                    <input 
                      type="text" 
                      value={bannerImage}
                      onChange={(e) => setBannerImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      required
                      className="w-full bg-white border border-slate-305 p-2 font-bold focus:outline-none text-[10.5px] text-black font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-455 font-extrabold uppercase text-[10px]">LINK TARGET JIKA DIKLIK (URL REDIRECT)</label>
                <input 
                  type="text" 
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="Contoh: /shop atau link eksternal"
                  className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold focus:outline-none text-xs text-black"
                />
              </div>

              {bannerImage && (
                <div className="border-2 border-black p-2 bg-slate-100">
                  <span className="block text-[8px] text-gray-400 font-bold uppercase mb-1">PREVIEW GAMBAR BANNER:</span>
                  <img 
                    src={bannerImage} 
                    alt="Banner preview" 
                    className="w-full h-24 object-cover border border-black" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x200?text=Gambar+Gagal+Dimuat";
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isAddingBanner}
                className="w-full py-2.5 bg-black hover:bg-neutral-900 text-[#f4f2e9] font-black border-2 border-black cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all uppercase text-[11px]"
              >
                {isAddingBanner ? "Sedang Menambahkan..." : "TAMBAH BANNER SEKARANG"}
              </button>
            </form>
          </div>

          {/* List existing banners */}
          <div className="space-y-4 lg:col-span-2">
            <div className="border-b-2 border-black pb-2">
              <h3 className="font-serif text-lg font-bold uppercase tracking-tight text-black block">DAFTAR CAROUSEL BANNER ({banners ? banners.length : 0})</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Semua banner ini aktif dan ditayangkan secara langsung di home page.</p>
            </div>

            {!banners || banners.length === 0 ? (
              <div className="bg-amber-50 p-4 border border-yellow-300 text-amber-900 leading-snug">
                Saat ini belum ada banner carousel aktif. Banner default platform akan dimunculkan seadanya.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b) => (
                  <div key={b.id} className="bg-white border-2 border-black p-4 flex flex-col justify-between maternal-shadow-sm font-mono text-xs">
                    <div>
                      <div className="aspect-[3/1] w-full border border-black overflow-hidden relative mb-3">
                        <img 
                          src={b.image} 
                          alt={b.title} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h4 className="font-bold text-black uppercase text-sm block tracking-tight line-clamp-1">{b.title}</h4>
                      {b.tag && <p className="text-[10px] text-brand-forest font-bold uppercase mt-1">Tag: {b.tag}</p>}
                      {b.description && <p className="text-[10px] text-gray-700 font-sans mt-1 line-clamp-2">Desc: {b.description}</p>}
                      {b.buttonText && <p className="text-[10px] text-black font-semibold mt-1">Tombol: {b.buttonText}</p>}
                      <p className="text-[10px] text-gray-400 mt-1 truncate">ID: {b.id}</p>
                      <p className="text-[10px] text-gray-600 truncate">Link: {b.url || '#'}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteBanner(b.id)}
                      className="mt-4 w-full py-2 text-center bg-red-800 hover:bg-black text-white font-extrabold uppercase border border-black text-[10px] cursor-pointer transition-colors"
                    >
                      Hapus Banner
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'security_compliance' && (
        <div className="space-y-6 font-mono text-xs animate-fade-in" id="security-compliance-panel">
          
          {/* Header of the Security control page */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-black pb-4">
            <div className="space-y-1">
              <span className="bg-amber-450 text-black px-2 py-0.5 font-bold tracking-widest text-[9px] uppercase">
                REAL-TIME INTRUSION PREVENTION & MALWARE SHIELD LIVE
              </span>
              <h2 className="font-serif text-2xl font-black text-black uppercase tracking-tight font-sans">
                KONTROL KEAMANAN & DIAGNOSIS KENDALA
              </h2>
              <p className="text-gray-500 text-[10px] uppercase">
                Pantau log upaya serangan siber (XSS, SQLi, Backend Backdoor, WebShell) serta status penanganan hambatan 1-Klik yang dialami oleh pembeli/tenant.
              </p>
            </div>

            <button
              onClick={fetchSecurityAndDiagnostics}
              className="bg-black hover:bg-neutral-900 text-[#f4f2e9] font-black px-4 py-2.5 border border-black flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400 rotate-180" />
              <span>MUAT ULANG DATA SEKURITI</span>
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Left Column: Anti-Malware Live Shield Logger */}
            <div className="bg-white border-4 border-black p-5 md:p-6 maternal-shadow space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-serif font-black text-sm uppercase text-red-800 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 animate-pulse text-red-700" />
                    <span>ANTI-MALWARE REAL-TIME SHIELD ({securityLogsList.length})</span>
                  </h3>
                  <p className="text-[8px] text-gray-400 uppercase">Upaya serangan siber dideaktivasi & dinetralisir otomatis</p>
                </div>
                {securityLogsList.length > 0 && (
                  <button
                    onClick={handleClearSecurityLogs}
                    className="bg-red-800 hover:bg-black text-white px-2 py-1 text-[9px] font-bold uppercase border border-black cursor-pointer transition-colors"
                  >
                    Kosongkan Log
                  </button>
                )}
              </div>

              {loadingSecurity ? (
                <p className="text-center py-10 text-gray-500 italic">Membaca log dari firewall server...</p>
              ) : securityLogsList.length === 0 ? (
                <div className="bg-emerald-50 text-emerald-950 p-4 border border-emerald-500 leading-relaxed uppercase rounded-none text-center">
                  <p className="font-bold text-[10px]">✓ SISTEM AMAN: BELUM ADA DETEKSI ANCAMAN MALWARE ATAU INJEKSI PAYLOAD.</p>
                  <p className="text-[8.5px] text-emerald-800 hover:underline mt-1 font-mono">Saling saring muatan berbahaya (XSS, SQLi, RCE, Webshell Backdoors) berjalan mulus di pintu gerbang utama API.</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                  {securityLogsList.map((log) => (
                    <div key={log.id} className="border-2 border-black p-3 bg-red-50 relative font-mono text-[10px]">
                      <span className="absolute top-2.5 right-2.5 bg-red-800 text-white font-black text-[7.5px] px-1 py-0.2 uppercase">
                        {log.category}
                      </span>
                      
                      <div className="space-y-1 text-gray-800">
                        <p><span className="font-bold text-black">Waktu Kejadian:</span> {new Date(log.timestamp).toLocaleString()}</p>
                        <p><span className="font-bold text-black">IP Pelaku:</span> <span className="bg-white px-1 border select-all">{log.ip}</span></p>
                        <p><span className="font-bold text-black">Target Sasar:</span> <span className="text-red-900 font-bold select-all">{log.method} {log.path}</span></p>
                        <p className="truncate" title={log.userAgent}><span className="font-bold text-black">User-Agent:</span> {log.userAgent}</p>
                        
                        <div className="mt-2 bg-neutral-900 text-amber-400 p-1.5 border border-black max-h-[80px] overflow-y-auto font-mono text-[9px] whitespace-pre-wrap select-all">
                          {log.blockedBody}
                        </div>
                        <p className="text-[8px] text-red-700 italic font-mono uppercase mt-1">Keamanan: {log.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: User Diagnostics Reports Area */}
            <div className="bg-white border-4 border-black p-5 md:p-6 maternal-shadow space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-serif font-black text-sm uppercase text-black flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-900 animate-pulse" />
                  <span>TIKET HAMBATAN DIAGNOSTIK USER ({diagnosticReportsList.length})</span>
                </h3>
                <p className="text-[8px] text-gray-400 uppercase">Umpan balik rincian diagnosis dan bug sistem pengguna</p>
              </div>

              {loadingDiagnostics ? (
                <p className="text-center py-10 text-gray-500 italic">Membaca daftar laporan dewan sipil...</p>
              ) : diagnosticReportsList.length === 0 ? (
                <p className="text-gray-400 italic text-center py-10">Belum ada pengguna SIPIL yang mengeklik lapor kendala system. Sistem berjalan mulus tanpa hambatan.</p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {diagnosticReportsList.map((rep) => (
                    <div key={rep.id} className={`border-2 p-3 relative font-mono text-[10.5px] ${rep.status === 'RESOLVED' ? 'bg-zinc-50 border-gray-400 opacity-60' : 'bg-white border-black maternal-shadow-sm'}`}>
                      
                      <div className="flex justify-between items-start mb-2 border-b border-gray-200 pb-1.5">
                        <div>
                          <span className="font-bold block text-black text-xs uppercase">{rep.userName}</span>
                          <span className="text-[9px] text-gray-500 font-mono block uppercase">{rep.userEmail} (ID: {rep.userId})</span>
                        </div>
                        <span className={`text-[8.5px] font-black px-1.5 py-0.5 border uppercase ${rep.status === 'RESOLVED' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                          {rep.status}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <p><span className="font-bold uppercase text-[9px] text-gray-500">KLASIFIKASI:</span> <span className="text-black font-bold mr-2">{rep.issueType}</span> <span className="text-[8.5px] text-gray-400">{new Date(rep.timestamp).toLocaleString()}</span></p>
                        
                        <div className="bg-neutral-50 p-2.5 border border-dashed border-gray-350 text-gray-800 leading-normal whitespace-pre-wrap">
                          {rep.description}
                        </div>

                        {/* System environment bundle */}
                        <div className="bg-gray-100 p-2 space-y-1 text-[8.5px] text-gray-700 font-mono leading-snug">
                          <p className="font-bold uppercase border-b pb-0.5 text-black">DIAGNOSTIC METRICS PACKET:</p>
                          <p className="truncate"><span className="font-bold text-black">Browser Agent:</span> {rep.systemInfo?.userAgent}</p>
                          <p><span className="font-bold text-black">Dimensi Screen:</span> {rep.systemInfo?.viewport || 'Res Tersembunyi'}</p>
                          <p><span className="font-bold text-black">Latensi:</span> {rep.systemInfo?.latencyMs || 0}ms</p>
                        </div>

                        {/* Actions for reports */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                          {rep.status === 'PENDING' ? (
                            <button
                              onClick={() => handleResolveDiagnosticReport(rep.id, 'RESOLVED')}
                              className="bg-green-800 hover:bg-black text-white p-1 px-2 uppercase text-[8.5px] font-bold border border-black cursor-pointer transition-colors"
                            >
                              ✓ TANDAI SELESAI
                            </button>
                          ) : (
                            <button
                              onClick={() => handleResolveDiagnosticReport(rep.id, 'PENDING')}
                              className="bg-amber-500 hover:bg-black text-black hover:text-white p-1 px-2 uppercase text-[8.5px] font-bold border border-black cursor-pointer transition-colors"
                            >
                              Kira Pending-kan Kembali
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteDiagnosticReport(rep.id)}
                            className="bg-black hover:bg-red-800 text-white p-1 px-2 uppercase text-[8.5px] font-bold border border-black cursor-pointer transition-colors"
                          >
                            Hapus Laporan
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="bg-slate-50 border border-slate-600 p-4 leading-normal flex items-start gap-2.5 text-[10px] text-slate-1500 uppercase">
            <ShieldCheck className="w-5 h-5 text-indigo-900 flex-shrink-0 animate-bounce" />
            <div className="space-y-1">
              <span className="font-bold text-black block">REKOMENDASI MITIGASI CACAT MALWARE SIBER</span>
              <p>
                Platform TokoSipil berkomitmen melindungi tenant dari malware siber. Semua masukan file gambar produk melalui filter validasi visual yang tepercaya. Server ini dipersenjatai dengan kuki restriksi httpOnly serta header anti-XSS. Lakukan audit log keamanan secara berkala untuk menjaga kebersihan sistem belanja sipil.
              </p>
            </div>
          </div>

        </div>
      )}
        </main>
      </div>
    </div>
  );
}
