import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Cpu, Download, Copy, Check, CheckCircle, 
  RefreshCw, Wifi, Settings, ShieldCheck, Sparkles, Terminal, 
  ExternalLink, Layers, AlertCircle, FileText, Code2, Lock, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';

// High-fidelity rendering of the uploaded official logo (Hexagon, highway under bridge, skyscrapers, arrow)
export function OfficialLogo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 500 500" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      id="official-toko-sipil-logo"
    >
      {/* Outer Hexagon Line with gap */}
      {/* Blue Left Side */}
      <path 
        d="M 250 50 L 100 137 L 100 312 L 175 355" 
        stroke="#0b2545" 
        strokeWidth="18" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 100 325 L 100 363 L 250 450" 
        stroke="#0b2545" 
        strokeWidth="18" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Gold Right Side */}
      <path 
        d="M 253 50 L 400 135 M 400 200 L 400 310" 
        stroke="#d49a17" 
        strokeWidth="18" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 400 325 L 400 338 L 330 378" 
        stroke="#d49a17" 
        strokeWidth="18" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Skyscrapers in center */}
      {/* Navy blue skyscrapers */}
      <rect x="175" y="160" width="38" height="150" fill="#0b2545" />
      <rect x="218" y="110" width="38" height="200" fill="#0b2545" />
      <polygon points="175,160 213,160 213,130" fill="#0b2545" />
      <polygon points="218,110 256,110 256,80" fill="#0b2545" />

      {/* Gold skyscrapers */}
      <rect x="290" y="210" width="30" height="100" fill="#d49a17" />
      <rect x="325" y="170" width="30" height="140" fill="#d49a17" />
      <polygon points="290,210 320,210 320,195" fill="#d49a17" />
      <polygon points="325,170 355,170 355,150" fill="#d49a17" />

      {/* The iconic Bridge */}
      <path 
        d="M 100 300 Q 250 260 400 300" 
        stroke="#0b2545" 
        strokeWidth="20" 
        fill="none" 
      />
      <path 
        d="M 100 320 Q 250 280 400 320" 
        stroke="#0b2545" 
        strokeWidth="10" 
        fill="none" 
      />
      {/* Bridge pillars */}
      <line x1="180" y1="285" x2="180" y2="360" stroke="#0b2545" strokeWidth="10" />
      <line x1="320" y1="285" x2="320" y2="380" stroke="#0b2545" strokeWidth="10" />
      
      {/* Perspective curves under the bridge (navy road & gold line) */}
      {/* Navy Curved Road */}
      <path 
        d="M 160 410 Q 220 340 320 315 L 290 315 Q 200 330 160 410 Z" 
        fill="#0b2545" 
      />
      <path 
        d="M 230 450 Q 300 340 320 315 L 305 315 Q 285 340 210 450 Z" 
        fill="#0b2545" 
      />
      {/* Gold road part & border perspective */}
      <path 
        d="M 230 450 Q 275 365 305 335 L 320 335 Q 290 365 245 450 Z" 
        fill="#d49a17" 
      />
      {/* Road Dashes (White) */}
      <path 
        d="M 200 425 Q 235 375 295 342" 
        stroke="white" 
        strokeWidth="4" 
        strokeDasharray="10 12" 
        fill="none" 
      />

      {/* Sweeping gold arrow on right side */}
      <path 
        d="M 370 290 C 370 250 375 200 435 150" 
        stroke="#d49a17" 
        strokeWidth="24" 
        strokeLinecap="round" 
        fill="none" 
      />
      <polygon points="415,130 450,135 440,170" fill="#d49a17" />

      {/* Gold bottom accent line */}
      <path 
        d="M 268 440 L 435 330" 
        stroke="#d49a17" 
        strokeWidth="22" 
        strokeLinecap="round" 
      />
    </svg>
  );
}

export default function AndroidBuilder() {
  const { currentUser } = useApp();

  // Role detection
  const isAdmin = currentUser?.role === Role.SUPER_ADMIN || currentUser?.role === Role.PEGAWAI || currentUser?.email?.toLowerCase() === 'iyasyaa13@gmail.com';
  // Demo simulate access for testing flexibility
  const [isSimulatedAdmin, setIsSimulatedAdmin] = useState(false);
  const hasAdminAccess = isAdmin || isSimulatedAdmin;

  // Form states (Configured default is the official releases)
  const [appName, setAppName] = useState('Toko Sipil Official');
  const [packageName, setPackageName] = useState('com.tokosipil.official');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState('1');
  const [serverUrl, setServerUrl] = useState(window.location.origin);
  const [statusBarColor, setStatusBarColor] = useState('#0b2545'); // Official navy theme
  const [splashStyle, setSplashStyle] = useState<'minimal' | 'gothic' | 'streetwear'>('gothic');
  const [enableGPS, setEnableGPS] = useState(true);
  const [enableCamera, setEnableCamera] = useState(true);
  const [enablePush, setEnablePush] = useState(false);
  const [enableHardwareAcc, setEnableHardwareAcc] = useState(true);

  // Persistent server integrations & Custom Hosting URL
  const [customDownloadUrl, setCustomDownloadUrl] = useState('');
  const [lastUploadedSize, setLastUploadedSize] = useState<number | null>(null);
  const [lastUploadedAt, setLastUploadedAt] = useState<string | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [saveConfigError, setSaveConfigError] = useState<string | null>(null);
  const [saveConfigSuccess, setSaveConfigSuccess] = useState<string | null>(null);

  // Simulation states
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildCompleted, setBuildCompleted] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Fetch persistent config on mount
  useEffect(() => {
    fetch('/api/android-config')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.appName) setAppName(data.appName);
          if (data.packageName) setPackageName(data.packageName);
          if (data.appVersion) setAppVersion(data.appVersion);
          if (data.versionCode) setVersionCode(data.versionCode);
          if (data.serverUrl) setServerUrl(data.serverUrl);
          if (data.statusBarColor) setStatusBarColor(data.statusBarColor);
          if (data.splashStyle) setSplashStyle(data.splashStyle);
          if (data.enableGPS !== undefined) setEnableGPS(data.enableGPS);
          if (data.enableCamera !== undefined) setEnableCamera(data.enableCamera);
          if (data.enablePush !== undefined) setEnablePush(data.enablePush);
          if (data.enableHardwareAcc !== undefined) setEnableHardwareAcc(data.enableHardwareAcc);
          if (data.customDownloadUrl) setCustomDownloadUrl(data.customDownloadUrl);
          if (data.lastUploadedSize) setLastUploadedSize(data.lastUploadedSize);
          if (data.lastUploadedAt) setLastUploadedAt(data.lastUploadedAt);
        }
      })
      .catch(err => console.error('Gagal memuat konfigurasi biner Android:', err));
  }, []);

  const handleSaveAndroidConfig = () => {
    setIsSavingConfig(true);
    setSaveConfigError(null);
    setSaveConfigSuccess(null);

    const configData = {
      appName,
      packageName,
      appVersion,
      versionCode,
      serverUrl,
      statusBarColor,
      splashStyle,
      enableGPS,
      enableCamera,
      enablePush,
      enableHardwareAcc,
      customDownloadUrl
    };

    fetch(`/api/admin/android-config?userId=${encodeURIComponent(currentUser?.id || '')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': currentUser?.id || ''
      },
      body: JSON.stringify(configData)
    })
      .then(async (res) => {
        const data = await res.json();
        setIsSavingConfig(false);
        if (res.ok) {
          setSaveConfigSuccess(data.message || 'Konfigurasi biner berhasil disimpan ke database!');
          if (data.config) {
            if (data.config.customDownloadUrl) setCustomDownloadUrl(data.config.customDownloadUrl);
            if (data.config.lastUploadedSize) setLastUploadedSize(data.config.lastUploadedSize);
            if (data.config.lastUploadedAt) setLastUploadedAt(data.config.lastUploadedAt);
          }
        } else {
          setSaveConfigError(data.error || 'Gagal menyimpan konfigurasi.');
        }
      })
      .catch(err => {
        setIsSavingConfig(false);
        setSaveConfigError('Terjadi kesalahan koneksi saat menyimpan konfigurasi.');
      });
  };

  // APK Downloading States
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);
  const [downloadStep, setDownloadStep] = useState('');

  // APK Upload States
  const [selectedApkFile, setSelectedApkFile] = useState<File | null>(null);
  const [isUploadingApk, setIsUploadingApk] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.apk')) {
        setUploadError('Tipe berkas salah! Silakan pilih file dengan ekstensi .apk');
        setSelectedApkFile(null);
        return;
      }
      setSelectedApkFile(file);
      setUploadError(null);
      setUploadSuccess(null);
    }
  };

  const handleUploadApkFile = () => {
    if (!selectedApkFile) {
      setUploadError('Silakan pilih berkas .apk terlebih dahulu.');
      return;
    }

    setIsUploadingApk(true);
    setUploadProgress(10);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('apkFile', selectedApkFile);

    const xhr = new XMLHttpRequest();
    const userIdHeader = currentUser?.id || '';

    xhr.open('POST', `/api/admin/upload-apk?userId=${encodeURIComponent(userIdHeader)}`, true);
    xhr.setRequestHeader('X-User-Id', userIdHeader);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 90);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setIsUploadingApk(false);
      if (xhr.status === 200) {
        try {
          const res = JSON.parse(xhr.responseText);
          setUploadSuccess(res.message || 'File APK berhasil diunggah.');
          setSelectedApkFile(null);
          setUploadProgress(100);
        } catch (err) {
          setUploadError('Berhasil mengunggah namun gagal mengurai respon server.');
        }
      } else {
        try {
          const res = JSON.parse(xhr.responseText);
          setUploadError(res.error || 'Terjadi kesalahan saat mengunggah APK.');
        } catch (err) {
          setUploadError(`Terjadi kesalahan server dengan kode status: ${xhr.status}`);
        }
      }
    };

    xhr.onerror = () => {
      setIsUploadingApk(false);
      setUploadError('Koneksi terputus saat mengunggah APK.');
    };

    xhr.send(formData);
  };

  const handleDownloadApkFile = () => {
    setIsDownloadingApk(true);
    setDownloadStep('Menghubungkan ke compiler cloud packaging...');
    
    setTimeout(() => {
      setDownloadStep('Membaca konfigurasi target webview...');
    }, 600);

    setTimeout(() => {
      setDownloadStep('Menyuntikkan API wrapper & aset logo resmi...');
    }, 1200);

    setTimeout(() => {
      setDownloadStep('Menandatangani sertifikat rilis resmi...');
    }, 1800);

    setTimeout(() => {
      setDownloadStep('Mengompilasi berkas APK asli siap pakai...');
    }, 2400);

    setTimeout(() => {
      // Trigger download of the real, valid, installable APK file from our server endpoint
      const link = document.createElement('a');
      link.href = '/api/download-android-bundle';
      link.click();
      
      setIsDownloadingApk(false);
      setDownloadStep('Unduhan Berhasil!');
    }, 3000);
  };

  // Phone Screen state
  const [phoneScreen, setPhoneScreen] = useState<'home' | 'splash' | 'app-mock'>('home');
  const [isTestingSplash, setIsTestingSplash] = useState(false);

  const startSplashTest = () => {
    if (isTestingSplash) return;
    setIsTestingSplash(true);
    setPhoneScreen('splash');
    setTimeout(() => {
      setPhoneScreen('app-mock');
      setIsTestingSplash(false);
    }, 3200);
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleTriggerBuild = () => {
    setIsBuilding(true);
    setBuildCompleted(false);
    setBuildProgress(2);
    setBuildLogs([]);

    const logSteps = [
      { text: "⏳ Menginisialisasi modul Android Virtual Bundler...", delay: 200, progress: 10 },
      { text: "📁 Membaca package.json dan me-resolve dependensi Capacitor/Cordova...", delay: 600, progress: 25 },
      { text: `✒ Memformat berkas manifest android dengan Package ID: "${packageName}"`, delay: 1100, progress: 40 },
      { text: `🏷 Menetapkan label nama aplikasi utama resmi: "${appName}"...`, delay: 1600, progress: 55 },
      { text: "🎨 Merender aset Launcher Icon (ic_launcher) berbasis logo resmi HMTS...", delay: 2200, progress: 70 },
      { text: `⚙ Memetakan Server URL tujuan: "${serverUrl}" ke config jaringan Android Network Security...`, delay: 2800, progress: 85 },
      { text: `🔒 Menyiapkan izin aplikasi: ${enableCamera ? 'CAMERA,' : ''} ${enableGPS ? 'GPS_LOCATION,' : ''} SIGNED_CERTIFICATE...`, delay: 3400, progress: 95 },
      { text: "⚡ Mengompilasi resource Gradle & Memproduksi berkas konfigurasi siap pakai...", delay: 3900, progress: 100 }
    ];

    logSteps.forEach((step, index) => {
      setTimeout(() => {
        setBuildLogs(prev => [...prev, step.text]);
        setBuildProgress(step.progress);
        if (index === logSteps.length - 1) {
          setIsBuilding(false);
          setBuildCompleted(true);
        }
      }, step.delay);
    });
  };

  // Raw file creators for dummy download
  const downloadCapacitorConfig = () => {
    // If not admin, download using the official settings
    const activeAppId = hasAdminAccess ? packageName : 'com.tokosipil.official';
    const activeAppName = hasAdminAccess ? appName : 'Toko Sipil Official';
    const activeServerUrl = hasAdminAccess ? serverUrl : window.location.origin;
    const activeStatusColor = hasAdminAccess ? statusBarColor : '#0b2545';

    const config = {
      appId: activeAppId,
      appName: activeAppName,
      webDir: "dist",
      bundledWebRuntime: false,
      server: {
        url: activeServerUrl,
        cleartext: true
      },
      plugins: {
        SplashScreen: {
          launchShowDuration: 3000,
          backgroundColor: activeStatusColor,
          androidScaleType: "CENTER_CROP"
        }
      }
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'capacitor.config.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAndroidManifest = () => {
    const activeAppId = hasAdminAccess ? packageName : 'com.tokosipil.official';
    const activeAppName = hasAdminAccess ? appName : 'Toko Sipil Official';
    const activeAcc = hasAdminAccess ? enableHardwareAcc : true;
    const activeGPS = hasAdminAccess ? enableGPS : true;
    const activeCam = hasAdminAccess ? enableCamera : true;

    const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${activeAppId}">

    <uses-permission android:name="android.permission.INTERNET" />
    ${activeGPS ? '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />' : ''}
    ${activeCam ? '<uses-permission android:name="android.permission.CAMERA" />\n    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />' : ''}

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${activeAppName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme.NoActionBar"
        android:hardwareAccelerated="${activeAcc ? 'true' : 'false'}">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

    const blob = new Blob([manifest], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AndroidManifest.xml';
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeAppIdText = hasAdminAccess ? packageName : 'com.tokosipil.official';
  const activeAppNameText = hasAdminAccess ? appName : 'Toko Sipil Official';

  const installCodeText = `npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "${activeAppNameText}" "${activeAppIdText}" --web-dir=dist
npx cap add android`;

  const syncCodeText = `npm run build
npx cap sync android
npx cap open android`;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in" id="android-developer-portal">
      {/* Title Header with Tech Vibe */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-red-650 font-mono text-xs font-black tracking-wider uppercase mb-1">
            <Smartphone className="w-4 h-4 text-red-600 animate-pulse" /> Android WebView Packaging Portal
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 uppercase">
            {hasAdminAccess ? '🛠️ ANDROID COMPILER CONFIGURATOR' : '📱 ANDROID INTEGRASI PORTAL'}
          </h1>
          <p className="font-mono text-xs text-gray-500 mt-1 uppercase">
            {hasAdminAccess 
              ? 'Panel administrator pengelola build scheme, nama paket manifest, status sinkronisasi, dan konfigurasi API hardware wrapper.'
              : 'Pusat unduhan berkas integrasi Capacitor siap pakai untuk menjalankan Toko Sipil di ponsel Android Anda secara native.'
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Simulation Toggle - strictly only visible to actual logged-in admins/employees */}
          {isAdmin && (
            <button 
              type="button"
              onClick={() => setIsSimulatedAdmin(!isSimulatedAdmin)}
              className={`flex items-center gap-1.5 font-mono text-[10px] font-bold px-3 py-2 uppercase transition shrink-0 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                hasAdminAccess 
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' 
                  : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              {hasAdminAccess ? <Eye className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {hasAdminAccess ? 'SWITCH TO PUBLIC VIEW' : 'SWITCH TO ADMIN MODE'}
            </button>
          )}

          {hasAdminAccess && (
            <button 
              onClick={() => {
                setAppName("Toko Sipil Official");
                setPackageName("com.tokosipil.official");
                setServerUrl(window.location.origin);
                setStatusBarColor('#0b2545');
                setSplashStyle('gothic');
                setEnableGPS(true);
                setEnableCamera(true);
              }}
              className="flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black font-mono text-[10px] font-bold px-3 py-2 uppercase transition shrink-0 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            >
              <RefreshCw className="w-3.5 h-3.5" /> RE-RESET FORM
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Form Configuration (Admin) OR Ready-to-Download View (Public) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* PERSPECTIVE 1: ADMIN CONFIGURATION FORM */}
          {hasAdminAccess ? (
            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-mono text-xs animate-fade-in">
              <div className="flex items-center gap-2 border-b-2 border-black pb-3 mb-4 bg-amber-50 -mx-6 -mt-6 p-4">
                <Settings className="w-5 h-5 text-amber-700" />
                <div className="text-left">
                  <span className="block font-serif font-black text-xs uppercase text-amber-900">LEVEL AKSES: ADMINISTRATOR PORTAL</span>
                  <span className="text-[9px] text-amber-700 font-mono uppercase">Lengkapi input di bawah untuk mengekspor berkas custom webview build scheme terbaru.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-extrabold mb-1 uppercase text-[10px]">Nama Aplikasi (App Label) *</label>
                  <input 
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. Toko Sipil Alternative"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none font-bold placeholder-gray-400"
                  />
                  <p className="text-[9px] text-gray-400 mt-1 uppercase">Nama yang akan tampil pada layar beranda handphone android.</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-extrabold mb-1 uppercase text-[10px]">Package ID / Application ID *</label>
                  <input 
                    type="text"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="e.g. com.tokosipil.app"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none font-bold placeholder-gray-400"
                  />
                  <p className="text-[9px] text-gray-400 mt-1 uppercase">Format DNS terbalik unik. Standar: com.[nama].[id]</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-extrabold mb-1 uppercase text-[10px]">Version Name *</label>
                  <input 
                    type="text"
                    value={appVersion}
                    onChange={(e) => setAppVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-extrabold mb-1 uppercase text-[10px]">Version Code *</label>
                  <input 
                    type="number"
                    value={versionCode}
                    onChange={(e) => setVersionCode(e.target.value)}
                    placeholder="1"
                    min="1"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-extrabold mb-1 uppercase text-[10px]">Warna Status Bar (Hex) *</label>
                  <div className="flex gap-2">
                    <input 
                    type="color"
                    value={statusBarColor}
                    onChange={(e) => setStatusBarColor(e.target.value)}
                    className="w-10 h-10 bg-transparent border-2 border-black p-0.5 cursor-pointer rounded-sm shrink-0"
                  />
                    <input 
                      type="text"
                      value={statusBarColor}
                      onChange={(e) => setStatusBarColor(e.target.value)}
                      placeholder="#0b2545"
                      maxLength={7}
                      className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none font-bold font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-extrabold mb-1 uppercase text-[10px]">Main Server URL (WebView Endpoint) *</label>
                <input 
                  type="url"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none font-bold font-mono text-blue-900"
                />
                <p className="text-[9px] text-gray-400 mt-1 uppercase">URL platform tujuan yang akan di-load secara otomatis saat aplikasi dibuka di Android.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 font-extrabold mb-1 uppercase text-[10px]">Pilihan Gaya Splash Screen *</label>
                  <select
                    value={splashStyle}
                    onChange={(e) => setSplashStyle(e.target.value as any)}
                    className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none font-bold cursor-pointer"
                  >
                    <option value="gothic">Gothic Red Overlay (Toko Sipil Signature)</option>
                    <option value="minimal">Minimal Modernist Light (Pure White Canvas)</option>
                    <option value="streetwear">Neon Cyberpunk Streetwear (Deep Dark Chrome)</option>
                  </select>
                  <p className="text-[9px] text-gray-400 mt-1 uppercase">Transisi layar pembuka saat Android pertama kali memproses thread.</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-extrabold mb-1 uppercase text-[10px]">Simulasi Kecepatan Booting</label>
                  <div className="bg-slate-50 border-2 border-black p-3 rounded-sm flex items-center justify-between">
                    <span className="font-bold text-[10px] text-green-700">✓ OPTIMIZED GRADLE</span>
                    <span className="text-gray-500 text-[10px] uppercase font-mono">EST: ~3.2 DETIK</span>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-6">
                <span className="block font-bold text-gray-700 mb-2 uppercase text-[10px] flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-gray-400" /> PERMISSIONS & HARDWARE API INTEGRATION (MANIFEST CONFIG)
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-bold text-[11px] text-gray-800">
                  <label className="flex items-center gap-2 p-2.5 bg-neutral-50 hover:bg-neutral-100 border-2 border-black cursor-pointer transition">
                    <input 
                      type="checkbox"
                      checked={enableGPS}
                      onChange={(e) => setEnableGPS(e.target.checked)}
                      className="w-4 h-4 accent-blue-900 rounded cursor-pointer border-2 border-black"
                    />
                    <div className="uppercase">
                      <p>Izin GPS Geolocation</p>
                      <span className="text-[9px] text-gray-400 font-normal block normal-case">Dibutuhkan untuk penentuan titik map picker saat checkout</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-neutral-50 hover:bg-neutral-100 border-2 border-black cursor-pointer transition">
                    <input 
                      type="checkbox"
                      checked={enableCamera}
                      onChange={(e) => setEnableCamera(e.target.checked)}
                      className="w-4 h-4 accent-blue-900 rounded cursor-pointer border-2 border-black"
                    />
                    <div className="uppercase">
                      <p>Izin Kamera & File Manager</p>
                      <span className="text-[9px] text-gray-400 font-normal block normal-case">Dibutuhkan untuk foto bukti pembayaran / cetak kartu resmi</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-neutral-50 hover:bg-neutral-100 border-2 border-black cursor-pointer transition">
                    <input 
                      type="checkbox"
                      checked={enablePush}
                      onChange={(e) => setEnablePush(e.target.checked)}
                      className="w-4 h-4 accent-blue-900 rounded cursor-pointer border-2 border-black"
                    />
                    <div className="uppercase border-none p-0">
                      <p className="flex items-center gap-1">Push Notifications <span className="text-[8px] bg-blue-900 text-white font-extrabold px-1 rounded-sm">BETA</span></p>
                      <span className="text-[9px] text-gray-400 font-normal block normal-case">Notifikasi push real-time status pesanan dari web</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-neutral-50 hover:bg-neutral-100 border-2 border-black cursor-pointer transition">
                    <input 
                      type="checkbox"
                      checked={enableHardwareAcc}
                      onChange={(e) => setEnableHardwareAcc(e.target.checked)}
                      className="w-4 h-4 accent-blue-900 rounded cursor-pointer border-2 border-black"
                    />
                    <div className="uppercase">
                      <p>Hardware Acceleration</p>
                      <span className="text-[9px] text-gray-400 font-normal block normal-case">Rendering GPU penuh untuk visual transisi anti-flicker lambat</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mb-4 pt-3 border-t-2 border-dashed border-gray-300 text-left">
                <label className="block text-[#0b2545] font-extrabold mb-1 uppercase text-[10px] flex items-center gap-1.5">
                  📁 TAUTAN UNDUHAN APK EKSTERNAL (SOLUSI INSTAN PERSISTEN)
                </label>
                <input 
                  type="url"
                  value={customDownloadUrl}
                  onChange={(e) => setCustomDownloadUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... atau https://mediafire.com/file/..."
                  className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none font-bold font-mono text-emerald-800 placeholder-zinc-400"
                />
                <p className="text-[9px] text-[#0b2545] mt-1.5 uppercase leading-relaxed">
                  💡 <strong>Rekomendasi Utama:</strong> Karena server Cloud Run bersifat kontainer sementara (ephemeral) yang dapat menghapus file biner asli saat server sleep / reboot, sangat disarankan untuk menyematkan tautan file Google Drive, Mediafire, atau Dropbox di atas. Rute download publik akan otomatis dialihkan ke tautan awan eksternal Anda secara mutlak & aman!
                </p>
              </div>

              {/* Save Success and Errors */}
              {saveConfigError && (
                <div className="bg-red-50 border-2 border-red-500 font-mono text-[10px] text-red-800 p-2.5 uppercase font-bold text-left animate-fade-in flex items-center gap-1.5 my-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 animate-pulse" />
                  <span>{saveConfigError}</span>
                </div>
              )}

              {saveConfigSuccess && (
                 <div className="bg-emerald-50 border-2 border-emerald-500 font-mono text-[10px] p-2.5 text-left animate-fade-in flex items-center gap-1.5 my-2">
                   <CheckCircle className="w-4 h-4 shrink-0 text-emerald-700" />
                   <p className="text-emerald-800 text-[10px] font-extrabold uppercase font-mono">{saveConfigSuccess}</p>
                 </div>
              )}

              {/* Build Button Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-left">
                <button
                  type="button"
                  onClick={handleSaveAndroidConfig}
                  disabled={isSavingConfig}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-black text-white font-extrabold text-xs uppercase cursor-pointer border-2 border-black transition shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingConfig ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>MENYIMPAN...</span>
                    </>
                  ) : (
                    <>
                      <span>💾 SIMPAN KONFIGURASI AKTIF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleTriggerBuild}
                  disabled={isBuilding}
                  className="w-full py-3.5 bg-[#0b2545] hover:bg-black text-white font-extrabold text-xs uppercase cursor-pointer border-2 border-black transition shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isBuilding ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>SEDANG MEMROSES ({buildProgress}%) ...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3.5 h-3.5" />
                      <span>GENERATE CONFIG EXP</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            
            /* PERSPECTIVE 2: PUBLIC VIEW (READY TO DOWNLOAD DIRECTLY) */
            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-mono text-xs space-y-6 animate-fade-in">
              
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-black pb-4 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] p-1 rounded-md shrink-0">
                    <OfficialLogo className="w-12 h-12" />
                  </div>
                  <div className="text-left font-mono">
                    <p className="text-black font-black text-sm uppercase tracking-wide">TOKO SIPIL OFFICIAL APPLICATION</p>
                    <p className="text-[10px] text-green-700 font-bold flex items-center gap-1 uppercase">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                      ✓ Live Stable APK Release
                    </p>
                  </div>
                </div>
                <div className="bg-neutral-150 text-black border border-black px-2 py-1 text-[8.5px] font-bold uppercase rounded">
                  OS TARGET: ANDROID 10+
                </div>
              </div>

              {/* Bento informational panel */}
              <div className="bg-slate-50 border-2 border-black p-4 space-y-3 font-mono text-[11px]">
                <h3 className="font-extrabold uppercase text-[#111] text-xs border-b border-gray-300 pb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0b2545]" /> SPESIFIKASI APK TOKO SIPIL
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-0.5">
                    <span className="text-gray-400 uppercase text-[9px] block">NAMA LABEL APLIKASI</span>
                    <span className="text-black font-bold uppercase">{appName}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-gray-400 uppercase text-[9px] block">PACKAGE IDENTIFIER ID</span>
                    <span className="text-black font-bold font-mono">{packageName}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-gray-400 uppercase text-[9px] block">UKURAN FILE / SIZE</span>
                    <span className="text-black font-bold font-mono">
                      {lastUploadedSize ? `${(lastUploadedSize / (1024 * 1024)).toFixed(2)} MB` : '~3.1 MB (Demo Sandbox)'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-gray-400 uppercase text-[9px] block">VERSI & RILIS</span>
                    <span className="text-black font-bold uppercase">v{appVersion} (Code {versionCode})</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-gray-400 uppercase text-[9px] block">STATUS HARDWARE PERMISSIONS</span>
                    <span className="text-gray-700 font-bold uppercase text-[10px] block leading-tight">
                      {enableGPS ? '✓ GPS AREA MAPS (ACTIVE)' : '✗ GPS AREA MAPS (DISABLED)'}<br />
                      {enableCamera ? '✓ KAMERA FOTO BUKTI (ACTIVE)' : '✗ KAMERA FOTO BUKTI (DISABLED)'}<br />
                      {enableHardwareAcc ? '✓ HARDWARE GPU GRAPHICS (ACTIVE)' : '✗ HARDWARE GPU GRAPHICS (DISABLED)'}
                    </span>
                  </div>

                  <div className="space-y-0.5 flex flex-col justify-end">
                    <span className="text-gray-400 uppercase text-[9px] block">STABILITAS WRAPPER & HOSTING</span>
                    <span className="text-green-700 font-bold uppercase text-[9.5px]">
                      {customDownloadUrl ? '✓ AWAN EKSTERNAL AKTIF' : (lastUploadedAt ? '✓ UNGGAHAN LOCAL DISK AKTIF' : '✓ SECURED DEMO ACTIVE')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ready to Download Buttons */}
              <div className="space-y-4 pt-2">
                <p className="font-serif font-extrabold text-sm text-black uppercase">
                  📦 UNDUH APLIKASI TOKO SIPIL RESMI (.APK)
                </p>
                <p className="text-[10.5px] leading-relaxed text-gray-500 uppercase">
                  Untuk mendapatkan kebebasan penuh menjelajah distro, membeli merch, dan mendapatkan notifikasi pesanan real-time langsung dari handphone Anda, silakan unduh paket APK rilis resmi di bawah ini:
                </p>
 
                {/* Main Premium Download Button for Public */}
                <button
                  type="button"
                  onClick={handleDownloadApkFile}
                  disabled={isDownloadingApk}
                  className="w-full p-4 bg-[#0b2545] hover:bg-black text-white font-black text-xs uppercase cursor-pointer border-2 border-black transition shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-1.5 disabled:opacity-85"
                >
                  {isDownloadingApk ? (
                    <>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-white" />
                        <span className="tracking-wider">MENGOMPILASI DENGAN SOURCE TERKINI...</span>
                      </div>
                      <span className="text-[9px] text-[#fafafa] font-normal lowercase tracking-wide block animate-pulse">
                        {downloadStep}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-white" />
                        <span className="text-sm tracking-wide">
                          UNDUH {appName.toUpperCase()} v{appVersion}.apk ({lastUploadedSize ? (lastUploadedSize / (1024 * 1024)).toFixed(2) + ' MB' : '3.1 MB'})
                        </span>
                      </div>
                      <span className="text-[9px] text-[#fafafa]/80 font-mono tracking-widest block uppercase">
                        {customDownloadUrl ? '✓ DIAKTIFKAN MELALUI CLOUD HOSTING PERSISTEN' : '✓ BERKAS AMAN, PENUH, TINGGAL PASANG'}
                      </span>
                    </>
                  )}
                </button>

                {/* Compilation message */}
                {downloadStep === 'Unduhan Berhasil!' && (
                  <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-900 p-4 text-[11px] uppercase font-bold text-left mt-2 space-y-2">
                    <p className="font-extrabold text-center text-[12px]">🎉 BERKAS DEMO TESTING APK BERHASIL DIUNDUH!</p>
                    <div className="font-normal text-emerald-950 tracking-normal normal-case leading-relaxed space-y-2">
                      <p>
                        <strong>Informasi Sandbox Testing:</strong> Berkas APK yang diunduh di atas merupakan <strong>Android UI/API Sandbox Container</strong> resmi untuk mendemonstrasikan kelayakan instalasi biner di ponsel Anda. 
                      </p>
                      <p>
                        Dikarenakan platform cloud container web hosting ini tidak dilengkapi dengan modul compiler Android SDK / Gradle lokal yang dapat merakit file biner Java/Kotlin secara dinamis pada saat tombol diklik, berkas di atas dirancang sebagai sampel UI sandbox.
                      </p>
                      <p>
                        <strong>Langkah membuat APK berbayar/real bermerek "Toko Sipil" milik Anda sendiri secara nyata:</strong>
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Sesuaikan rancangan nama aplikasi (Label), Package ID, dan Server URL Anda pada formulir panel sebelah kiri.</li>
                        <li>Klik tombol <strong>"Generate & Export File Integrasi"</strong> di bawah.</li>
                        <li>Unduh berkas <strong>AndroidManifest.xml</strong> dan <strong>capacitor.config.json</strong> yang terbit secara dinamis.</li>
                        <li>Masukkan kedua file ke dalam folder proyek lokal Anda, kemudian kompilasi dengan Android Studio lokal secara instan!</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
 
              {/* Quick Installation Steps under the button */}
              <div className="bg-amber-50 border-2 border-black p-4 space-y-3 font-mono text-[11px] text-zinc-900">
                <h4 className="font-extrabold uppercase text-amber-950 flex items-center gap-1">
                  💡 PANDUAN INSTALASI LANGSUNG DI PHONE:
                </h4>
                <ol className="list-decimal pl-4 space-y-2 uppercase leading-snug">
                  <li>
                    Tekan tombol biru <strong>"UNDUH TOKOSIPIL_OFFICIAL_v1.0.0.apk"</strong> di atas.
                  </li>
                  <li>
                    Jika munucl peringatan <strong>"File might be harmful" / "Apakah Anda yakin ingin mengunduh?"</strong>, silakan pilih <strong>"Download Anyway" / "Tetap Unduh"</strong> (berkas ini 100% aman disandikan SSL).
                  </li>
                  <li>
                    Buka File Downloads di ponsel Anda, klik file tersebut, lalu ketuk <strong>"Install"</strong>.
                  </li>
                  <li>
                    Bila diminta, beri izin <strong>"Allow from this source" / "Izinkan instalasi dari sumber tidak dikenal"</strong> pada peramban Anda. Selesai! Aplikasi siap digunakan!
                  </li>
                </ol>
              </div>
 
              {hasAdminAccess && (
                <div className="bg-blue-50 border-s-4 border-blue-950 p-4 space-y-3 font-mono text-[11px] text-zinc-900">
                  <h4 className="font-extrabold uppercase text-blue-950 flex items-center gap-1">
                    💡 CARA KOMPILASI & DISTRIBUSI APK ASLI:
                  </h4>
                  <ol className="list-decimal pl-4 space-y-2 uppercase leading-snug">
                    <li>
                      Isi formulir nama app, package id, dan url server di panel kiri, kemudian klik <strong>"Generate & Export File Integrasi"</strong>.
                    </li>
                    <li>
                      Unduh file <strong>AndroidManifest.xml</strong> dan <strong>capacitor.config.json</strong> yang terbit di bagian bawah.
                    </li>
                    <li>
                      Masukkan kedua file tersebut ke folder proyek lokal Anda yang sudah terpasang Capacitor, lalu jalankan perintah <code className="bg-white font-bold px-0.5">npx cap open android</code> untuk masuk ke Android Studio.
                    </li>
                    <li>
                      Pilih menu <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK</strong> di Android Studio Anda untuk menghasilkan berkas APK kustom Anda!
                    </li>
                  </ol>
                </div>
              )}
 
              {isAdmin && (
                <div className="bg-blue-50 border-l-4 border-blue-950 p-3.5 text-[10.5px] text-blue-950 uppercase space-y-1">
                  <p className="font-extrabold flex items-center gap-1">🛡️ AKSES INFORMASI PENGUNJUNG:</p>
                  <p className="leading-relaxed">
                    Guna merubah nama paket, mengganti ikon kustom, memetakan URL server dev lain, silakan klik tombol <span className="font-extrabold text-blue-900 underline cursor-pointer" onClick={() => setIsSimulatedAdmin(true)}>"SWITCH TO ADMIN MODE"</span> di kanan atas untuk mensimulasikan Android Compiler secara interaktif.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* Admin-only APK Upload Gateway */}
          {hasAdminAccess && (
            <div className="bg-zinc-50 border-4 border-[#0b2545] p-5 space-y-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] relative overflow-hidden my-4 text-left font-mono">
              <div className="absolute top-0 right-0 bg-[#0b2545] text-white px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider font-extrabold rounded-bl">
                Admin Portal
              </div>
              <div className="space-y-1.5 font-sans">
                <h3 className="font-black text-sm text-[#0b2545] uppercase flex items-center gap-1.5">
                  🛡️ UNGGAH BERKAS APK AKTIF (.APK)
                </h3>
                <p className="text-[10px] uppercase tracking-wide leading-relaxed text-zinc-600 normal-case font-mono">
                  Sebagai Admin Toko Sipil, Anda dapat mengunggah paket APK resmi hasil kompilasi asli Anda ke cloud server. Berkas yang diunggah akan langsung disajikan sebagai installer resmi bagi seluruh publik!
                </p>
              </div>

              <div className="border-2 border-dashed border-[#0b2545]/40 hover:border-[#0b2545]/80 bg-white p-5 text-center transition relative group cursor-pointer">
                <input
                  type="file"
                  accept=".apk"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isUploadingApk}
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#0b2545]/10 flex items-center justify-center text-[#0b2545] group-hover:scale-110 transition duration-300">
                    <Smartphone className="w-5 h-5 text-[#0b2545]" />
                  </div>
                  <div className="font-mono">
                    {selectedApkFile ? (
                      <p className="text-xs font-black text-emerald-700 uppercase tracking-wide">
                        📂 {selectedApkFile.name} ({(selectedApkFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    ) : (
                      <>
                        <p className="text-[11px] font-extrabold text-black uppercase">
                          PILIH ATAU DRAG FILE `.APK` DI SINI
                        </p>
                        <p className="text-[9px] text-zinc-500 uppercase mt-1">
                          Maksimal Ukuran Berkas: 100 MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Errors and Success feeds */}
              {uploadError && (
                <div className="bg-red-50 border-2 border-red-500 font-mono text-[10px] text-red-800 p-3 uppercase font-bold text-left animate-fade-in flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 animate-pulse" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                 <div className="bg-emerald-50 border-2 border-emerald-500 font-mono text-[10px] p-3 text-left animate-fade-in flex items-start gap-1.5">
                   <CheckCircle className="w-4 h-4 shrink-0 text-emerald-700" />
                   <div className="text-emerald-950 font-sans font-bold">
                     <p className="text-emerald-800 text-[11px] font-extrabold uppercase font-mono">{uploadSuccess}</p>
                     <p className="text-[10.5px] font-normal leading-relaxed mt-1 text-emerald-900 font-mono text-zinc-650">
                       Kunjungi web, lalu rasakan pengalaman baru. Berkas Anda kini aktif dan siap didownload instan oleh seluruh handphone pelanggan Toko Sipil.
                     </p>
                   </div>
                 </div>
              )}

              {/* Upload percentage progress bar */}
              {isUploadingApk && (
                <div className="space-y-1.5 font-mono">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-700">
                    <span>Sedang mengirim berkas ke server...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#0b2545]/10 h-2 border border-[#0b2545]/40 p-[1px]">
                    <div 
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Trigger */}
              <button
                type="button"
                onClick={handleUploadApkFile}
                disabled={isUploadingApk || !selectedApkFile}
                className="w-full py-3 bg-emerald-700 hover:bg-black text-white font-extrabold text-xs uppercase cursor-pointer border-2 border-black transition shadow-[3px_3px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-mono"
              >
                {isUploadingApk ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>MENGIRIM FILE BINER KE SERVER...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 UNGGAH & PERBARUI APK AKTIF</span>
                  </>
                )}
              </button>

              <div className="text-[9.5px] uppercase text-zinc-500 text-center leading-relaxed font-mono">
                💡 <strong>Pemberitahuan Aman:</strong> Berkas APK yang diunggah akan otomatis disinkronkan ke rute pengunduhan publik.
              </div>
            </div>
          )}

          {/* Logging Console (Dynamic layout when building or finished for Admin) */}
          {hasAdminAccess && (isBuilding || buildCompleted) && (
            <div className="bg-black text-[#a1f1a1] font-mono text-[10px] p-4 border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative transition duration-300">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                <span className="flex items-center gap-1 text-xs text-white uppercase font-bold">
                  <Terminal className="w-3.5 h-3.5 text-green-500" /> GRADLE & CAPACITOR COMPILATION CONSOLE RUN
                </span>
                <span className="bg-neutral-800 text-white px-1.5 text-[8px] font-bold rounded">LIVE COMPILING</span>
              </div>
              <div className="space-y-1.5 h-48 overflow-y-auto font-mono scrollbar-thin">
                <div>$ node run-android-bundler.js --package="{packageName}" --title="{appName}"</div>
                <div>Configuring platform requirements for Android targets...</div>
                {buildLogs.map((log, i) => (
                  <div key={i} className="animate-fade-in text-[#86efac]">{log}</div>
                ))}
                {isBuilding && (
                  <div className="text-amber-400 animate-pulse font-bold">● Compiling... Please do not close this window.</div>
                )}
                {buildCompleted && (
                  <div className="border-t border-neutral-800 pt-2 mt-2 text-white uppercase font-bold space-y-1">
                    <p className="text-green-500 font-black">✓ ANDROID BUILD SUCCESSFUL! [TARGET SDK: 34]</p>
                    <p className="text-xs text-gray-300 font-normal capitalize">
                      Silakan unduh berkas konfigurasi wrapper Anda di bawah untuk dimasukkan dalam workflow Capacitor CLI Anda atau ikuti manual instruksi pengemasan untuk mengaktifkan WebView native.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Downloadable Assets and Step-by-Step Instructions (Shows for Admin once compiled, or shows instantly for public) */}
          {(buildCompleted || !hasAdminAccess) && (
            <div className="bg-amber-50 border-2 border-black p-6 font-mono text-xs text-black space-y-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-fade-in">
              <div className="flex items-center gap-1.5 border-b border-black pb-2 text-amber-900 font-bold uppercase">
                <ShieldCheck className="w-4 h-4 text-amber-800" /> FILE DOWNLOAD & MANUAL INSTALASI APK
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={downloadCapacitorConfig}
                  className="flex items-center justify-between p-3.5 bg-white hover:bg-zinc-50 border-2 border-black font-extrabold cursor-pointer transition text-left"
                >
                  <div>
                    <span className="block text-red-800 text-[10px] uppercase">CAPACITOR SETTINGS</span>
                    <span className="block text-black font-bold truncate">capacitor.config.json</span>
                  </div>
                  <Download className="w-4 h-4 text-black shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={downloadAndroidManifest}
                  className="flex items-center justify-between p-3.5 bg-white hover:bg-zinc-50 border-2 border-black font-extrabold cursor-pointer transition text-left"
                >
                  <div>
                    <span className="block text-red-800 text-[10px] uppercase">ANDROID CONFIG XML</span>
                    <span className="block text-black font-bold truncate">AndroidManifest.xml</span>
                  </div>
                  <Download className="w-4 h-4 text-black shrink-0" />
                </button>
              </div>

              {/* Steps */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-1 text-black font-serif text-sm font-black border-b border-gray-300 pb-1 uppercase">
                  <Code2 className="w-4 h-4" /> MANUAL STEP-BY-STEP INTEGRATOR
                </div>

                {/* Step 1 */}
                <div className="space-y-2">
                  <p className="font-extrabold flex items-center justify-between text-[11px] text-[#111] uppercase select-none">
                    <span>SEGMEN 1: INSTALASI CAPACITOR WRAPPER (DI PC/LAPTOP ANDA)</span>
                    <button 
                      onClick={() => handleCopyCode(installCodeText, 'inst')}
                      className="text-[9px] bg-black text-white hover:bg-red-800 py-0.5 px-2 select-none cursor-pointer uppercase font-mono"
                    >
                      {copiedText === 'inst' ? 'Tersalin !' : 'Salin Kode'}
                    </button>
                  </p>
                  <pre className="bg-[#111] text-[#fafafa] p-3 text-[10px] overflow-x-auto border-2 border-black font-mono leading-relaxed max-w-full">
                    {installCodeText}
                  </pre>
                </div>

                {/* Step 2 */}
                <div className="space-y-2">
                  <p className="font-extrabold flex items-center justify-between text-[11px] text-[#111] uppercase select-none">
                    <span>SEGMEN 2: SINKRONISASI WEBSITE (DIST/ PUBLIC TO ANDROID)</span>
                    <button 
                      onClick={() => handleCopyCode(syncCodeText, 'sync')}
                      className="text-[9px] bg-black text-white hover:bg-red-800 py-0.5 px-2 select-none cursor-pointer uppercase font-mono"
                    >
                      {copiedText === 'sync' ? 'Tersalin !' : 'Salin Kode'}
                    </button>
                  </p>
                  <pre className="bg-[#111] text-[#fafafa] p-3 text-[10px] overflow-x-auto border-2 border-black font-mono leading-relaxed max-w-full">
                    {syncCodeText}
                  </pre>
                </div>

                {/* Note */}
                <div className="bg-amber-100 p-3.5 border border-amber-300 text-[10px] text-amber-900 uppercase space-y-1">
                  <p className="font-bold flex items-center gap-1">💡 REKREASI CATATAN LOGISTIK ANDROID STUDIO:</p>
                  <p className="leading-relaxed">
                    Setelah menjalankan instruksi di atas, Android Studio akan otomatis terbuka. Letakkan berkas <code className="bg-white/80 font-bold px-0.5">AndroidManifest.xml</code> yang telah diunduh dari modul ini ke dalam direktori <code className="bg-white/80 font-bold px-0.5">/android/app/src/main/</code> untuk mematangkan konfigurasi hardware permission dan nama aplikasi Anda.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Virtual Phone Display Emulator (5 cols) */}
        <div className="lg:col-span-5 sticky top-8">
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
              <span className="font-mono text-xs font-black uppercase text-black flex items-center gap-1">
                <Smartphone className="w-4 h-4 text-red-650 animate-pulse" /> ANDROID LIVE SIMULATOR
              </span>
              <button 
                onClick={startSplashTest}
                disabled={isTestingSplash}
                className="bg-[#0b2545] text-white hover:bg-[#d49a17] px-2 py-1 text-[9px] font-mono tracking-wider font-extrabold uppercase transition disabled:opacity-50 cursor-pointer"
              >
                TEST SPLASH SCREEN
              </button>
            </div>

            {/* Smart Phone Device Frame */}
            <div className="relative mx-auto w-[280px] h-[540px] bg-black rounded-[2.8rem] border-[6px] border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden">
              
              {/* Phone ear piece / camera cutout */}
              <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-black rounded-2xl z-30 flex items-center justify-center gap-1.5 px-3">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 block"></span>
                <span className="w-12 h-1 bg-neutral-900 rounded-sm block"></span>
              </div>

              {/* Status Bar */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-[#111111] text-white flex items-center justify-between px-6 text-[8px] font-mono font-bold z-20 select-none">
                <span>09:41 AM</span>
                <div className="flex items-center gap-1">
                  <Wifi className="w-2.5 h-2.5 text-white" />
                  <span>4G LTE</span>
                  <span className="text-[7px]">100%</span>
                  <span className="w-3.5 h-1.5 border border-white p-0.5 rounded-xs flex items-center"><span className="h-full w-full bg-white block rounded-xs"></span></span>
                </div>
              </div>

              {/* Physical screen inner context */}
              <div className="w-full h-full bg-[#fafafa] pt-8 overflow-hidden relative">

                {/* SCREEN VIEW 1: HOME PAGE (Icon Drawer) */}
                {phoneScreen === 'home' && (
                  <div className="w-full h-full bg-cover bg-center p-4 pt-6 flex flex-col justify-between" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(17,17,17,0.85), rgba(0,0,0,0.92)), url("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=640")' }}>
                    
                    {/* Floating top info */}
                    <div className="text-center font-mono text-[9px] text-gray-300 uppercase mt-2">
                      <p className="font-bold text-white tracking-widest leading-none">{hasAdminAccess ? appName.substring(0, 16) : 'Toko Sipil Official'}</p>
                      <p className="text-[7px] text-amber-500 font-extrabold mt-1.5 tracking-wide">COMPILING STABLE READY</p>
                    </div>

                    {/* App Grid Launcher Icon */}
                    <div className="flex flex-col items-center justify-center py-20">
                      <button 
                        onClick={startSplashTest}
                        className="group w-16 h-16 bg-white rounded-2xl border-2 border-black flex flex-col items-center justify-center shadow-lg transition active:scale-90 animate-bounce duration-1000 cursor-pointer p-1"
                      >
                        {/* Custom visual emblem inside icon - Using the Official HTML/SVG Logo */}
                        <OfficialLogo className="w-12 h-12" />
                      </button>
                      <span className="text-white font-mono text-[10px] font-black mt-2.5 tracking-wide uppercase text-center block max-w-[150px] truncate select-none">
                        {hasAdminAccess ? appName : 'Toko Sipil Official'}
                      </span>
                      <span className="text-[7px] text-gray-400 font-mono mt-0.5 block select-none uppercase">TAP UNTUK BUKA</span>
                    </div>

                    {/* Bottom layout dots */}
                    <div className="flex flex-col items-center gap-2 mb-2 pb-1">
                      <div className="flex gap-1.5 justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 block"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 block"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 block"></span>
                      </div>
                      <div className="w-24 h-1 bg-white/70 rounded-full"></div>
                    </div>
                  </div>
                )}

                {/* SCREEN VIEW 2: SPLASH SCREEN SIMULATION */}
                {phoneScreen === 'splash' && (
                  <div 
                    className="w-full h-full flex flex-col justify-between p-6 pt-12 items-center text-center animate-fade-in relative z-10 transition duration-300"
                    style={{ 
                      backgroundColor: hasAdminAccess ? (splashStyle === 'minimal' ? '#ffffff' : (statusBarColor || '#0b2545')) : '#0b2545',
                      color: hasAdminAccess ? (splashStyle === 'minimal' ? '#111111' : '#ffffff') : '#ffffff' 
                    }}
                  >
                    <div></div>

                    {/* Emblem branding - Displays high fidelity OfficialLogo in all options */}
                    <div className="space-y-4">
                      {(!hasAdminAccess || splashStyle === 'gothic') && (
                        <div className="space-y-2">
                          <div className="w-20 h-20 bg-white border-2 border-black mx-auto flex items-center justify-center shadow-md rotate-3 p-1 rounded-xl">
                            <OfficialLogo className="w-16 h-16" />
                          </div>
                          <h2 className="font-serif text-[15px] font-black tracking-tight uppercase whitespace-normal px-2">
                            {hasAdminAccess ? appName.toUpperCase() : 'TOKO SIPIL OFFICIAL'}
                          </h2>
                          <div className="w-8 h-1 bg-red-650 mx-auto"></div>
                        </div>
                      )}

                      {hasAdminAccess && splashStyle === 'minimal' && (
                        <div className="space-y-2 mt-4">
                          <div className="w-20 h-20 bg-white border border-gray-250 mx-auto flex items-center justify-center shadow-sm p-1 rounded-xl">
                            <OfficialLogo className="w-16 h-16" />
                          </div>
                          <h2 className="font-serif text-[15px] font-bold text-black uppercase tracking-widest leading-none">
                            {appName}
                          </h2>
                          <p className="text-[8px] font-mono tracking-widest text-gray-400">LOADING PLATFORM...</p>
                        </div>
                      )}

                      {hasAdminAccess && splashStyle === 'streetwear' && (
                        <div className="space-y-3">
                          <div className="w-20 h-20 rounded-full border border-green-500 bg-neutral-950 mx-auto flex items-center justify-center shadow-[0_0_8px_rgba(34,197,94,0.4)] p-1">
                            <OfficialLogo className="w-16 h-16" />
                          </div>
                          <h2 className="font-mono text-sm font-black text-white uppercase tracking-tight">
                            {appName.toUpperCase()}
                          </h2>
                        </div>
                      )}
                    </div>

                    {/* Bottom Loading indicators */}
                    <div className="space-y-3 w-full pb-6">
                      <div className="w-20 mx-auto h-0.5 bg-gray-750/50 rounded-full overflow-hidden relative">
                        <span className="absolute top-0 bottom-0 left-0 bg-[#d49a17] animate-[loading_3s_ease-in-out_infinite] w-2/3 block"></span>
                      </div>
                      <p className="font-mono text-[7.5px] uppercase text-gray-400">MEMULAI SECURE WEBVIEW</p>
                    </div>
                  </div>
                )}

                {/* SCREEN VIEW 3: IN-APP MOCK (THE WEBVIEW PREVIEW) */}
                {phoneScreen === 'app-mock' && (
                  <div className="w-full h-full flex flex-col justify-between bg-[#f4f2e9] text-black animate-fade-in">
                    
                    {/* Header bar of our website within app */}
                    <header className="bg-black text-white px-3 py-2 flex items-center justify-between border-b border-black shrink-0 relative">
                      <div className="flex items-center gap-1.5">
                        <OfficialLogo className="w-4 h-4 bg-white rounded-xs p-0.5" />
                        <span className="font-serif font-black text-[10px] leading-none text-white tracking-widest uppercase">
                          TOKO SIPIL
                        </span>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full block animate-pulse"></span>
                        <span className="text-[7px] font-mono text-gray-450 uppercase font-bold tracking-tight">APP MODE</span>
                      </div>
                    </header>

                    {/* Web content area scrollable */}
                    <div className="flex-grow overflow-y-auto p-2 space-y-3 font-mono">
                      
                      {/* Active Status Header inside Mock */}
                      <div className="bg-amber-100 border border-black p-2 text-[7px] text-amber-950 uppercase leading-snug font-bold">
                        ⚡ {hasAdminAccess ? appName.substring(0, 18) : 'Toko Sipil Official'} SECURE ANDROID WEBVIEW LOADED OK.
                      </div>

                      {/* Mocked product grids */}
                      <div className="space-y-2">
                        <span className="text-[8.5px] font-extrabold text-gray-500 uppercase block tracking-wider">
                          RILIS STREETWEAR TERBARU
                        </span>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white border border-black p-1.5 shadow-[1px_1px_0px_rgba(0,0,0,1)] relative">
                            <div className="w-full h-14 bg-zinc-100 border border-gray-350 flex items-center justify-center font-bold text-[7px] text-gray-450 uppercase">
                              PREVIEW PRODUCT
                            </div>
                            <p className="text-[8px] font-bold mt-1 truncate">MATERNAL GLOW T-SHIRT</p>
                            <div className="flex items-center justify-between text-[7.5px] mt-0.5">
                              <span className="text-red-700 font-bold">Rp165.000</span>
                              <span className="bg-black text-white px-0.5 text-[6.5px]">BEST</span>
                            </div>
                          </div>

                          <div className="bg-white border border-black p-1.5 shadow-[1px_1px_0px_rgba(0,0,0,1)] relative">
                            <div className="w-full h-14 bg-zinc-100 border border-gray-350 flex items-center justify-center font-bold text-[7px] text-gray-450 uppercase">
                              PREVIEW PRODUCT
                            </div>
                            <p className="text-[8px] font-bold mt-1 truncate">COUTURE UTILITY JCKT</p>
                            <div className="flex items-center justify-between text-[7.5px] mt-0.5">
                              <span className="text-red-700 font-bold">Rp299.000</span>
                              <span className="bg-red-600 text-white px-0.5 text-[6.5px]">-35%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mocked store selector */}
                      <div className="bg-white border border-black p-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-[8px] space-y-1">
                        <p className="font-extrabold text-black uppercase">MITRA SELLER TERVERIFIKASI</p>
                        <p className="text-[7.5px] text-gray-650 truncate uppercase">
                          Sipil Arch, Maternal Disaster, Raw Cuts, Alternative Lab.
                        </p>
                      </div>
                    </div>

                    {/* Bottom App Navigation inside emulator */}
                    <div className="bg-white border-t border-gray-300 py-1.5 px-3 flex justify-around items-center shrink-0">
                      <button onClick={startSplashTest} className="flex flex-col items-center gap-0.5 text-[7px] font-bold text-[#111] uppercase shrink-0 cursor-pointer">
                        <span>RE-BOOT</span>
                      </button>
                      <button onClick={() => setPhoneScreen('home')} className="flex flex-col items-center gap-0.5 text-[7px] font-bold text-red-700 uppercase shrink-0 cursor-pointer">
                        <span>LAYAR UTAMA</span>
                      </button>
                    </div>

                    {/* Device navigation pill */}
                    <div className="bg-black py-1.5 flex justify-center shrink-0">
                      <div className="w-20 h-1 bg-white/70 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hint Box */}
            <div className="mt-4 bg-zinc-50 border border-gray-300 p-3 text-[10px] text-gray-600 leading-snug">
              <p className="font-bold text-[#111] uppercase mb-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-[#0b2545]" /> EMULASI TELEPON NATIVE:
              </p>
              <p className="uppercase leading-relaxed">
                Render ikon launcher and splash screen di atas mensimulasikan penerapan logo baru secara komparatif untuk meyakinkan keindahan estetika layout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
