/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Mail, ArrowRight, ShieldCheck, MailWarning } from 'lucide-react';
import { Role } from '../types';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { login, signup, setActivePage, setUserDashboardInitialTab, settings } = useApp();

  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [angkatan, setAngkatan] = useState('');
  const [campus, setCampus] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isForgotPassword) {
      if (!email || !password) {
        setErrorMsg("Harap isi email dan password baru.");
        return;
      }
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Terjadi kesalahan.');
          return;
        }
        setSuccessMsg("Sukses: Password berhasil diatur ulang! Silakan login menggunakan password baru.");
        setIsForgotPassword(false);
        setIsLogin(true);
      } catch (err) {
        setErrorMsg("Koneksi ke server gagal.");
      }
      return;
    }

    if (isLogin) {
      const err = await login(email, password);
      if (err) {
        setErrorMsg(err);
      } else {
        if (justRegistered) {
          setUserDashboardInitialTab('address');
          setActivePage('dashboard-user');
        }
        onClose();
      }
    } else {
      if (!name || !email || !password) {
        setErrorMsg("Harap lengkapi semua field registrasi.");
        return;
      }
      const err = await signup(name, email, password, angkatan, campus);
      if (err) {
        setErrorMsg(err);
      } else {
        setSuccessMsg("Registrasi berhasil! Silakan masuk menggunakan kredensial Anda.");
        setIsLogin(true);
        setJustRegistered(true);
        setPassword('');
        setAngkatan('');
        setCampus('');
      }
    }
  };



  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-start md:items-center justify-center p-2 sm:p-4 overflow-y-auto py-6 sm:py-8" id="auth-overlay">
      <div className="bg-[#f4f2e9] border bg-brand-cream border-2 border-black max-w-md w-full h-auto maternal-shadow-lg relative p-6 md:p-8 my-auto" id="auth-modal-card">
        
        {/* Close Button top-right */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-40 p-1 bg-black text-white hover:bg-red-800 transition border-2 border-black cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand visual header */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <img 
            src={settings?.appLogo || "/src/assets/images/toko_sipil_logo_1781875832848.jpg"} 
            alt={settings?.appName || "Logo Toko Sipil"} 
            className="w-12 h-12 rounded-lg border-2 border-black object-cover mb-2"
            referrerPolicy="no-referrer"
          />
          <span className="font-serif text-3xl font-black text-black select-none tracking-tighter col-span-full">{settings?.appName || "TOKO SIPIL"}</span>
          <p className="font-mono text-[9px] text-[#222] tracking-widest mt-1 uppercase">
            {isForgotPassword ? 'PASSWORD RESET PORTAL' : 'ARCHIVE CREDENTIAL PORTAL'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-800 text-[#fcfbf7] p-2.5 font-mono text-[10px] flex items-center gap-1.5 leading-snug border border-black">
            <MailWarning className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-emerald-800 text-[#fcfbf7] p-2.5 font-mono text-[10px] flex items-center gap-1.5 leading-snug border border-black">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}



        {/* Regular Login/Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs" id="auth-access-form">
          
          {!isForgotPassword && !isLogin && (
            <>
              <div>
                <label className="block text-gray-500 font-bold mb-1 uppercase">NAME *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Asep Coblong"
                  className="w-full bg-white border-2 border-black px-3 py-2 rounded-none focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1 uppercase">ANGKATAN TAHUN BERAPA (OPSIONAL)</label>
                <input 
                  type="text" 
                  value={angkatan}
                  onChange={(e) => setAngkatan(e.target.value)}
                  placeholder="Contoh: 2022"
                  className="w-full bg-white border-2 border-black px-3 py-2 rounded-none focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1 uppercase">ASAL KAMPUS (OPSIONAL)</label>
                <input 
                  type="text" 
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  placeholder="Contoh: Universitas Sipil Jaya"
                  className="w-full bg-white border-2 border-black px-3 py-2 rounded-none focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-gray-500 font-bold mb-1 uppercase">EMAIL ADDRESS *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@email.com"
                className="w-full bg-white border-2 border-black pl-9 pr-3 py-2 rounded-none focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 font-bold mb-1 uppercase">
              {isForgotPassword ? 'PASSWORD BARU *' : 'PASSWORD *'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white border-2 border-black pl-9 pr-3 py-2 rounded-none focus:outline-none"
              />
            </div>
          </div>

          {!isLogin && !isForgotPassword && (
            <div className="bg-amber-50 border border-amber-350 p-2 text-center text-[9.5px] text-amber-950 font-bold uppercase tracking-tight">
              ⚠️ Pendaftaran baru otomatis diverifikasi sebagai role <span className="text-red-800 underline">BUYER</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-black hover:bg-gray-800 text-[#f4f2e9] font-bold text-xs uppercase flex items-center justify-center gap-1 border-2 border-black cursor-pointer"
          >
            <span>
              {isForgotPassword 
                ? 'RESET PASSWORD SAYA' 
                : isLogin 
                  ? 'LOG IN MEMBER' 
                  : 'REGISTER NEW MEMBER'}
            </span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>



        {/* Change Mode toggler */}
        <div className="mt-6 flex flex-col items-center gap-2 font-mono text-[10px] text-center text-[#222]">
          {isForgotPassword ? (
            <button 
              type="button"
              onClick={() => { setIsForgotPassword(false); setIsLogin(true); setErrorMsg(null); setSuccessMsg(null); }}
              className="text-red-800 font-extrabold uppercase underline hover:text-black cursor-pointer bg-transparent border-none"
            >
              Kembali ke Login
            </button>
          ) : (
            <>
              <div>
                {isLogin ? "Belum jadi member platform?" : "Sudah terdaftar sebagai member?"}
                <button 
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setIsForgotPassword(false); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-red-800 font-extrabold ml-1 uppercase underline hover:text-black cursor-pointer bg-transparent border-none"
                >
                  {isLogin ? 'Daftar sekarang' : 'Log in di sini'}
                </button>
              </div>
              
              {isLogin && (
                <button 
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-gray-500 font-bold uppercase underline hover:text-black cursor-pointer bg-transparent border-none mt-1"
                >
                  Lupa password Anda?
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
