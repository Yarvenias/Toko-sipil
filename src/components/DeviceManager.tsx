import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Smartphone, Laptop, MapPin, Clock, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';
import { UserSession } from '../types';

export default function DeviceManager() {
  const { currentUser, addToast } = useApp();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/auth/sessions/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        // Sort sessions so the current session is on top, followed by other active sessions
        const sorted = data.sort((a: UserSession, b: UserSession) => {
          if (a.id === currentUser.sessionToken) return -1;
          if (b.id === currentUser.sessionToken) return 1;
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        });
        setSessions(sorted);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleDeleteSession = async (sessionId: string) => {
    if (!currentUser) return;
    if (window.confirm('Apakah Anda yakin ingin menghentikan sesi login di perangkat ini? Perangkat tersebut akan segera dikeluarkan dari akun Anda.')) {
      setIsDeleting(sessionId);
      try {
        const res = await fetch('/api/auth/sessions/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            sessionId: sessionId
          })
        });
        if (res.ok) {
          addToast(
            "SESI DIHAPUS",
            "Koneksi perangkat berhasil diputuskan secara aman.",
            "success"
          );
          fetchSessions();
        } else {
          addToast("GAGAL", "Gagal memutus sesi perangkat.", "error");
        }
      } catch (err) {
        console.error('Error deleting session:', err);
        addToast("ERROR", "Terjadi kesalahan jaringan.", "error");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const getDeviceIcon = (model: string) => {
    const m = model.toLowerCase();
    if (m.includes('iphone') || m.includes('ipad') || m.includes('android') || m.includes('phone')) {
      return <Smartphone className="w-5 h-5 text-red-800" />;
    }
    return <Laptop className="w-5 h-5 text-black" />;
  };

  const formatLastActive = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Aktif sekarang';
      if (diffMins < 60) return `${diffMins} menit yang lalu`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} jam yang lalu`;
      
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Baru saja';
    }
  };

  if (!currentUser) return null;

  return (
    <div className="bg-white border-2 border-black p-6 maternal-shadow col-span-1 md:col-span-2 space-y-4" id="device-manager-pane">
      <div className="flex justify-between items-center border-b-2 border-black pb-2 flex-wrap gap-2">
        <div>
          <span className="font-serif text-lg font-bold block uppercase text-black tracking-wider">
            📱 PENGELOLA PERANGKAT & RIWAYAT LOGIN
          </span>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5">
            Akun Anda sekarang diizinkan untuk masuk di beberapa perangkat sekaligus secara aman.
          </p>
        </div>
        <button 
          onClick={fetchSessions}
          disabled={isLoading}
          className="p-1.5 border-2 border-black bg-stone-50 hover:bg-stone-200 transition text-black cursor-pointer flex items-center gap-1 font-mono text-[9px] font-bold uppercase"
          title="Segarkan Riwayat Perangkat"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          RELOAD LIST
        </button>
      </div>

      {isLoading && sessions.length === 0 ? (
        <div className="py-8 text-center font-mono text-gray-400 animate-pulse uppercase text-[10px]">
          Mencari perangkat yang terhubung...
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-8 text-center font-mono text-gray-400 uppercase text-[10px]">
          Tidak ada riwayat sesi login aktif.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => {
            const isCurrent = session.id === currentUser.sessionToken;
            return (
              <div 
                key={session.id} 
                className={`p-4 border-2 border-black flex gap-4 items-start bg-stone-50 transition relative ${
                  isCurrent ? 'bg-emerald-50/50 border-emerald-600 shadow-[3px_3px_0px_rgba(5,150,105,1)]' : 'hover:bg-stone-100/50 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <div className="p-2 border border-black bg-white shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                  {getDeviceIcon(session.deviceModel)}
                </div>

                <div className="space-y-1 flex-grow font-mono text-[11px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-black text-xs uppercase tracking-tight">
                      {session.deviceModel}
                    </span>
                    {isCurrent && (
                      <span className="bg-emerald-600 text-white font-sans font-bold text-[8px] px-1.5 py-0.5 uppercase flex items-center gap-0.5 shadow-[1px_1px_0px_rgba(0,0,0,0.2)]">
                        <ShieldCheck className="w-3 h-3" /> PERANGKAT INI
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 text-gray-600">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      Lokasi: <span className="text-black font-bold">{session.location}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      Aktif terakhir: <span className="text-black">{formatLastActive(session.lastActive)}</span>
                    </p>
                    {session.ip && (
                      <p className="text-[10px] text-gray-400">
                        IP: <span className="font-semibold select-all text-gray-600">{session.ip}</span>
                      </p>
                    )}
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    disabled={isDeleting === session.id}
                    className="absolute top-3 right-3 p-1.5 border border-red-300 hover:border-red-600 hover:bg-red-50 text-red-700 transition cursor-pointer"
                    title="Keluarkan Perangkat ini"
                  >
                    <Trash2 className={`w-3.5 h-3.5 ${isDeleting === session.id ? 'animate-pulse' : ''}`} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
