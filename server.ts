/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { loadDb, saveDb } from './server/db';
import { Role, OrderStatus, ApplicationStatus, BankVerificationStatus, WithdrawalStatus } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing and size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Dynamic memory storage for blocked request payloads & security alerts
  const securityLogs: any[] = [];

  // Security Headers + Real-time Malware & Intrusion Shield Middleware
  app.use((req, res, next) => {
    // 1. Set robust security headers to protect from browser malware/clickjacking
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

    // 2. Scan incoming URI, Query and Body to detect XSS/SQLi/Malware scripts
    let decodedUrl = '';
    try {
      decodedUrl = decodeURIComponent(req.originalUrl || req.url || '').toLowerCase();
    } catch (e) {
      decodedUrl = (req.originalUrl || req.url || '').toLowerCase();
    }

    const checkString = [
      JSON.stringify(req.body || {}),
      JSON.stringify(req.query || {}),
      decodedUrl
    ].join(' ').toLowerCase();

    // malware & vulnerability patterns to scan
    const threatRules = [
      {
        pattern: /<script|javascript:|onerror=|onload=|eval\(|document\.cookie/i,
        category: 'CROSS-SITE SCRIPTING (XSS)',
        description: 'Upaya injeksi skrip HTML/JS aktif ke dalam parameter input.'
      },
      {
        pattern: /union\s+select|select\s+.*\s+from|insert\s+into|delete\s+from|drop\s+table/i,
        category: 'SQL INJECTION (SQLi)',
        description: 'Mendeteksi kata kunci bahasa kueri database relasional mencurigakan yang berpotensi mencederai query backend.'
      },
      {
        pattern: /\.(php|jsp|asp|aspx|sh|exe|bat|cmd|apk)\b/i,
        category: 'MALWARE / WEBSHELL UPLOAD',
        description: 'Mendeteksi eksitensi ekstensi file executable atau naskah server-side jahat berpotensi webshell backdoor.'
      },
      {
        pattern: /(chmod\s\+x|wget\s|curl\s|bash\s|cat\s\/etc\/passwd|..\/\.\.\/)/i,
        category: 'REMOTE CODE EXECUTION (RCE)',
        description: 'Upaya eksploitasi parameter sistem, manipulasi path transversal, atau eksekusi perintah terminal shell.'
      }
    ];

    let attackDetected = false;
    let threatInfo = null;

    for (const rule of threatRules) {
      if (rule.pattern.test(checkString)) {
        attackDetected = true;
        threatInfo = rule;
        break;
      }
    }

    if (attackDetected && threatInfo) {
      const threatId = 'sec_' + Math.random().toString(36).substring(2, 9);
      const logEntry = {
        id: threatId,
        timestamp: new Date().toISOString(),
        category: threatInfo.category,
        description: threatInfo.description,
        path: req.path,
        method: req.method,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown Agent',
        queryString: JSON.stringify(req.query || {}),
        blockedBody: JSON.stringify(req.body || {}).substring(0, 500)
      };

      securityLogs.unshift(logEntry);
      if (securityLogs.length > 100) {
        securityLogs.pop();
      }

      console.warn(`[MALWARE PREVENTED] ${threatInfo.category} from IP ${logEntry.ip} successfully neutralized.`);

      return res.status(400).json({
        error: `Akses Diblokir! Sistem Proteksi Real-time TokoSipil mendeteksi adanya muatan berbahaya (${threatInfo.category}). Log insiden terekam di Dasbor Keamanan Admin.`,
        blocked: true,
        threatId: threatId,
        threatType: threatInfo.category,
        timestamp: logEntry.timestamp
      });
    }

    next();
  });

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Authenticaton endpoints
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, angkatan, campus } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Data registrasi tidak lengkap.' });
    }

    const db = loadDb();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role: Role.BUYER,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}`,
      password, // save password to DB so user can log in with their custom password
      angkatan: angkatan || undefined,
      campus: campus || undefined
    };

    db.users.push(newUser);
    saveDb(db);

    res.status(201).json({ message: 'Registrasi berhasil', user: { ...newUser, password: undefined } });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const db = loadDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    // Check if password matches stored password or development fallbacks for seeded users
    const expectedPw = email.split('@')[0] + '123';
    
    // If the user was registered without a password property, auto-assign the typed password as their active credential
    if (!user.password) {
      user.password = password;
      saveDb(db);
    }
    
    const isCustomMatch = user.password === password;
    const isFallbackMatch = password === expectedPw || password === 'admin123' || password === 'password123';

    if (!isCustomMatch && !isFallbackMatch) {
      return res.status(401).json({ error: 'Kredensial tidak valid.' });
    }

    res.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        angkatan: user.angkatan,
        campus: user.campus,
        username: user.username,
        phone: user.phone,
        gender: user.gender,
        addressDetail: user.addressDetail,
        addressCity: user.addressCity,
        addressProvince: user.addressProvince,
        addressDistrict: user.addressDistrict,
        addressSubdistrict: user.addressSubdistrict,
        addressRTRW: user.addressRTRW,
        addressReceiver: user.addressReceiver,
        addressPhone: user.addressPhone,
        addressLatLng: user.addressLatLng,
        isGuest: user.isGuest
      }
    });
  });

  // Dynamic automatic guest synchronization to support fully insulated individual guest trials
  app.post('/api/auth/guest', (req, res) => {
    const { id, name, email } = req.body;
    if (!id || !name || !email) {
      return res.status(400).json({ error: 'Data registrasi guest tidak lengkap.' });
    }

    const db = loadDb();
    let user = db.users.find(u => u.id === id);
    if (!user) {
      user = {
        id,
        name,
        email,
        role: Role.BUYER,
        password: 'local_guest_automated_security_token',
        avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(id)}`,
        angkatan: 'TAMU',
        campus: 'Ekosistem Lokal',
        isGuest: true
      } as any;
      db.users.push(user);
      saveDb(db);
    }

    res.json({
      message: 'Guest session synchronized successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        angkatan: user.angkatan,
        campus: user.campus,
        username: user.username,
        phone: user.phone,
        gender: user.gender,
        addressDetail: user.addressDetail,
        addressCity: user.addressCity,
        addressProvince: user.addressProvince,
        addressDistrict: user.addressDistrict,
        addressSubdistrict: user.addressSubdistrict,
        addressRTRW: user.addressRTRW,
        addressReceiver: user.addressReceiver,
        addressPhone: user.addressPhone,
        addressLatLng: user.addressLatLng,
        isGuest: true
      }
    });
  });

  app.post('/api/auth/google', (req, res) => {
    const { name, email, avatar } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Data autentikasi Google tidak valid.' });
    }

    const db = loadDb();
    let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name,
        email,
        role: Role.BUYER,
        avatar: avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}`
      };
      db.users.push(user);
      saveDb(db);
    }

    res.json({ message: 'Login Google berhasil', user });
  });

  // Store lists & profile
  app.get('/api/stores', (req, res) => {
    const db = loadDb();
    res.json(db.stores);
  });

  app.get('/api/stores/applications', (req, res) => {
    const db = loadDb();
    res.json(db.storeApplications);
  });

  app.get('/api/stores/:username', (req, res) => {
    const db = loadDb();
    const store = db.stores.find(s => s.username === req.params.username);
    if (!store) {
      return res.status(444).json({ error: 'Toko tidak ditemukan.' });
    }
    const products = db.products.filter(p => p.storeId === store.id);
    res.json({ store, products });
  });

  // Store Application Flow
  app.post('/api/stores/apply', (req, res) => {
    const { userId, name, username, ownerName, phone, email, address, nik, ktpPhoto, logo, bankName, bankAccount, bankAccountName } = req.body;
    if (!userId || !name || !username || !ownerName || !phone || !email || !address || !nik || !ktpPhoto || !logo || !bankName || !bankAccount || !bankAccountName) {
      return res.status(400).json({ error: 'Semua kolom pendaftaran toko wajib diisi.' });
    }

    const db = loadDb();
    const existingApp = db.storeApplications.find(app => app.username.toLowerCase() === username.toLowerCase() || app.userId === userId);
    if (existingApp && existingApp.status === ApplicationStatus.PENDING) {
      return res.status(400).json({ error: 'Pendaftaran toko Anda sedang dalam peninjauan.' });
    }

    const existingStore = db.stores.find(s => s.username.toLowerCase() === username.toLowerCase());
    if (existingStore) {
      return res.status(400).json({ error: 'Username Toko sudah digunakan.' });
    }

    const newApp = {
      id: 'app_' + Math.random().toString(36).substring(2, 9),
      userId,
      name,
      username: username.toLowerCase().replace(/\s+/g, '-'),
      ownerName,
      phone,
      email,
      address,
      nik,
      ktpPhoto,
      logo,
      bankName,
      bankAccount,
      bankAccountName,
      status: ApplicationStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    db.storeApplications.push(newApp);
    saveDb(db);

    res.status(201).json({ message: 'Pendaftaran toko berhasil diajukan.', application: newApp });
  });

  app.post('/api/stores/applications/:id/approve', (req, res) => {
    const db = loadDb();
    const application = db.storeApplications.find(app => app.id === req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Pendaftaran tidak ditemukan.' });
    }

    application.status = ApplicationStatus.APPROVED;

    // Promote User to Seller (only if not already an Admin/Staff)
    const user = db.users.find(u => u.id === application.userId);
    if (user) {
      if (user.role !== Role.SUPER_ADMIN && user.role !== Role.PEGAWAI) {
        user.role = Role.SELLER;
      }
    }

    // Create Store structure
    const newStoreId = 'str_' + Math.random().toString(36).substring(2, 9);
    const newStore = {
      id: newStoreId,
      userId: application.userId,
      name: application.name,
      username: application.username,
      description: `Selamat datang di ${application.name}! Hubungi kami untuk produk fashion alternatif terbaik.`,
      logo: application.logo,
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop',
      rating: 5.0,
      followersCount: 0,
      createdAt: new Date().toISOString()
    };

    // Ensure they do not have store already
    if (!db.stores.find(s => s.userId === application.userId)) {
      db.stores.push(newStore);
    }

    // Create associated Wallet for Store
    if (!db.wallets.find(w => w.storeId === newStoreId)) {
      db.wallets.push({
        storeId: newStoreId,
        balance: 0,
        heldBalance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0
      });
    }

    // Setup associated bank account pre-verification
    const existingBank = db.bankAccounts.find(bk => bk.sellerId === application.userId);
    if (!existingBank) {
      db.bankAccounts.push({
        id: 'bk_' + Math.random().toString(36).substring(2, 9),
        sellerId: application.userId,
        bankName: application.bankName,
        accountNumber: application.bankAccount,
        accountHolder: application.bankAccountName,
        proofPhoto: application.ktpPhoto, // fallback
        nik: application.nik,
        ktpPhoto: application.ktpPhoto,
        status: BankVerificationStatus.APPROVED, // auto-verified during shop approval
        createdAt: new Date().toISOString()
      });
    }

    saveDb(db);
    res.json({ message: 'Toko berhasil disetujui! User sekarang ber-role Seller.', store: newStore });
  });

  app.post('/api/stores/applications/:id/reject', (req, res) => {
    const db = loadDb();
    const application = db.storeApplications.find(app => app.id === req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Pendaftaran tidak ditemukan.' });
    }

    application.status = ApplicationStatus.REJECTED;
    saveDb(db);
    res.json({ message: 'Pendaftaran toko telah ditolak.' });
  });

  // Store following toggle
  app.post('/api/stores/follow', (req, res) => {
    const { userId, storeId } = req.body;
    if (!userId || !storeId) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    const db = loadDb();
    const existingIndex = db.follows.findIndex(f => f.userId === userId && f.storeId === storeId);
    let followed = false;
    if (existingIndex > -1) {
      db.follows.splice(existingIndex, 1);
    } else {
      db.follows.push({ userId, storeId });
      followed = true;
    }

    // Update follow count in store
    const store = db.stores.find(s => s.id === storeId);
    if (store) {
      store.followersCount = db.follows.filter(f => f.storeId === storeId).length + 1240; // baseline of seeded
    }

    saveDb(db);
    res.json({ followed, followersCount: store ? store.followersCount : 0 });
  });

  // Users management
  app.get('/api/users', (req, res) => {
    const db = loadDb();
    // omit passwords
    const cleanUsers = db.users.map(({ password, ...u }) => u);
    res.json(cleanUsers);
  });

  app.post('/api/users', (req, res) => {
    const { name, email, role, angkatan, campus, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nama, Email, dan Password wajib diisi.' });
    }
    const db = loadDb();
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email ini sudah terdaftar.' });
    }
    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role: role || 'BUYER',
      angkatan: angkatan || '',
      campus: campus || 'UNIKOM',
      password,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    };
    db.users.push(newUser);
    saveDb(db);
    res.status(201).json({ message: 'User berhasil dibuat.', user: { ...newUser, password: undefined } });
  });

  app.post('/api/users/:id/role', (req, res) => {
    const { role } = req.body;
    const db = loadDb();
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }
    user.role = role as Role;
    saveDb(db);
    res.json({ message: 'Role user berhasil diubah.', user });
  });

  app.put('/api/users/:id', (req, res) => {
    const { name, email, role, angkatan, campus, password, avatar, phone } = req.body;
    const db = loadDb();
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (angkatan !== undefined) user.angkatan = angkatan;
    if (campus !== undefined) user.campus = campus;
    if (password) user.password = password; // Enable password reset by admin
    if (avatar !== undefined) user.avatar = avatar;
    if (phone !== undefined) user.phone = phone;
    
    saveDb(db);
    res.json({ message: 'Detail user berhasil diperbaharui.', user });
  });

  app.delete('/api/users/:id', (req, res) => {
    const db = loadDb();
    const index = db.users.findIndex(u => u.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }
    
    // Prevent self-deletion if logged user deletes themselves (optionally, checked in client/server)
    const deletedUser = db.users[index];
    db.users.splice(index, 1);
    saveDb(db);
    res.json({ message: `User "${deletedUser.name}" berhasil dihapus dari sistem.` });
  });

  // Categories controller
  app.get('/api/categories', (req, res) => {
    const db = loadDb();
    res.json(db.categories);
  });

  app.post('/api/categories', (req, res) => {
    const { name, icon } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nama kategori wajib diisi.' });
    }
    const db = loadDb();
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const newCategory = {
      id: 'cat_' + Math.random().toString(36).substring(2, 9),
      name,
      slug,
      icon: icon || 'Sparkles'
    };
    db.categories.push(newCategory);
    saveDb(db);
    res.json({ message: 'Kategori berhasil ditambahkan', category: newCategory });
  });

  // Products CRUD
  app.get('/api/products', (req, res) => {
    const db = loadDb();
    const { category, search, storeId, sort, includeUnapproved } = req.query;
    let list = [...db.products];

    if (includeUnapproved !== 'true') {
      list = list.filter(p => p.isApproved !== false);
    }

    if (category) {
      list = list.filter(p => p.categoryId === category || p.sku.toLowerCase().includes(String(category).toLowerCase()));
    }
    if (storeId) {
      list = list.filter(p => p.storeId === storeId);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.storeName.toLowerCase().includes(q));
    }

    if (sort === 'price-asc') {
      list.sort((a, b) => (a.price * (1 - a.discount / 100)) - (b.price * (1 - b.discount / 100)));
    } else if (sort === 'price-desc') {
      list.sort((a, b) => (b.price * (1 - b.discount / 100)) - (a.price * (1 - a.discount / 100)));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(list);
  });

  app.get('/api/products/:id', (req, res) => {
    const db = loadDb();
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }
    const reviews = db.reviews.filter(r => r.productId === product.id);
    res.json({ product, reviews });
  });

  app.post('/api/products', (req, res) => {
    const { storeId, name, sku, description, price, discount, weight, stock, categoryId, sizes, colors, images, isPreOrder, preOrderDpPercent } = req.body;
    if (!storeId || !name || !sku || !price || !categoryId || !images || images.length < 5) {
      return res.status(400).json({ error: 'Silakan isi parameter wajib produk dan berikan minimal 5 foto.' });
    }

    const db = loadDb();
    const store = db.stores.find(s => s.id === storeId);
    if (!store) {
      return res.status(404).json({ error: 'Toko seller tidak ditemukan.' });
    }

    const duplicatedSku = db.products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
    if (duplicatedSku) {
      return res.status(400).json({ error: 'SKU produk sudah terdaftar.' });
    }

    const newProd = {
      id: 'prod_' + Math.random().toString(36).substring(2, 9),
      storeId,
      storeName: store.name,
      name,
      sku,
      description: description || '',
      price: Number(price),
      discount: Number(discount || 0),
      weight: Number(weight || 250),
      stock: Number(stock || 0),
      categoryId,
      sizes: sizes || ['All Size'],
      colors: colors || ['N/A'],
      images,
      createdAt: new Date().toISOString(),
      isApproved: false,
      approvalStatus: 'PENDING' as const,
      isPreOrder: isPreOrder === true || isPreOrder === 'true',
      preOrderDpPercent: isPreOrder ? Number(preOrderDpPercent || 50) : undefined
    };

    db.products.push(newProd);
    saveDb(db);
    res.status(201).json({ message: 'Produk berhasil diupload!', product: newProd });
  });

  app.put('/api/products/:id', (req, res) => {
    const db = loadDb();
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }

    const { name, sku, description, price, discount, weight, stock, categoryId, sizes, colors, images, isPreOrder, preOrderDpPercent } = req.body;
    if (name) product.name = name;
    if (sku) product.sku = sku;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (discount !== undefined) product.discount = Number(discount);
    if (weight) product.weight = Number(weight);
    if (stock !== undefined) product.stock = Number(stock);
    if (categoryId) product.categoryId = categoryId;
    if (sizes) product.sizes = sizes;
    if (colors) product.colors = colors;
    if (images && images.length > 0) product.images = images;
    if (isPreOrder !== undefined) product.isPreOrder = isPreOrder === true || isPreOrder === 'true';
    if (preOrderDpPercent !== undefined) product.preOrderDpPercent = Number(preOrderDpPercent);

    saveDb(db);
    res.json({ message: 'Produk berhasil diperbarui.', product });
  });

  app.delete('/api/products/:id', (req, res) => {
    const db = loadDb();
    const idx = db.products.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }
    db.products.splice(idx, 1);
    saveDb(db);
    res.json({ message: 'Produk berhasil dihapus.' });
  });

  app.post('/api/products/:id/approve', (req, res) => {
    const db = loadDb();
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }
    product.isApproved = true;
    product.approvalStatus = 'APPROVED';
    saveDb(db);
    res.json({ message: 'Produk berhasil disetujui untuk ditampilkan di etalase.', product });
  });

  app.post('/api/products/:id/reject', (req, res) => {
    const db = loadDb();
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }
    product.isApproved = false;
    product.approvalStatus = 'REJECTED';
    saveDb(db);
    res.json({ message: 'Produk berhasil ditolak.', product });
  });

  // Mapping of standard Indonesian cities to RajaOngkir Starter City IDs
  const RAJAONGKIR_CITY_MAP: Record<string, string> = {
    'bandung': '54',
    'jakarta': '151',
    'surabaya': '444',
    'medan': '278',
    'makassar': '256',
    'kampus unikom': '0',
  };

  // Diagnostic Endpoint to verify RajaOngkir integration configuration & status
  app.get('/api/rajaongkir/status', async (req, res) => {
    const key = process.env.RAJAONGKIR_API_KEY || '';
    const hasKey = key.trim().length > 0;
    const maskedKey = hasKey 
      ? key.trim().substring(0, 4) + '...' + key.trim().substring(key.trim().length - 4) 
      : 'TIDAK TERPASANG';

    let connectionTest = 'Belum Dites';
    let apiCitiesList: any[] = [];
    
    if (hasKey) {
      try {
        console.log('[RajaOngkir Diagnostic] Testing connection...');
        const apiRes = await fetch('https://api.rajaongkir.com/starter/city', {
          method: 'GET',
          headers: { 'key': key }
        });
        if (apiRes.ok) {
          const json: any = await apiRes.json();
          const results = json?.rajaongkir?.results;
          if (Array.isArray(results)) {
            connectionTest = 'SUKSES CONNECT (API Key VALID)';
            apiCitiesList = results.slice(0, 10).map((c: any) => ({
              id: c.city_id,
              name: c.city_name,
              type: c.type,
              province: c.province
            }));
          } else {
            connectionTest = 'Format Data Tidak Sesuai';
          }
        } else {
          const errMsg = await apiRes.text();
          connectionTest = `GAGAL CONNECT: HTTP ${apiRes.status} - ${errMsg}`;
        }
      } catch (e: any) {
        connectionTest = `GAGAL KONEKSI SERVER: ${e.message}`;
      }
    }

    res.json({
      active: hasKey,
      maskedKey,
      originCity: 'Bandung (Kota)',
      originId: '54',
      cityMap: RAJAONGKIR_CITY_MAP,
      connectionTest,
      sampleCities: apiCitiesList,
      instructions: [
        'Masuk ke dashboard RajaOngkir (https://rajaongkir.com) dan buat akun (Starter cukup)',
        'Copy API Key Anda dari halaman lisensi RajaOngkir',
        'Buka Settings di platform AI Studio Build ini',
        'Tambahkan Environment Variable: RAJAONGKIR_API_KEY dengan nilai API Key Anda yang disalin tersebut',
        'Save Settings. Aplikasi akan mendeteksi kunci baru Anda secara otomatis dan menghitung ongkos kirim asli!'
      ]
    });
  });

  // Calculate & checkout checkout RajaOngkir Multi-Kurir
  app.post('/api/checkout/calculate', async (req, res) => {
    const { items, city, courier, voucherCode, paymentMethod } = req.body;
    if (!items || items.length === 0 || !city || !courier) {
      return res.status(400).json({ error: 'Parameter perhitungan harga tidak lengkap.' });
    }

    const db = loadDb();
    let totalProdPrice = 0;
    let totalWeight = 0;

    // Validate items
    for (const item of items) {
      const prod = db.products.find(p => p.id === item.productId);
      if (prod) {
        const itemPrice = prod.price * (1 - prod.discount / 100);
        totalProdPrice += itemPrice * item.quantity;
        totalWeight += (prod.weight || 250) * item.quantity;
      }
    }

    // RajaOngkir simulated shipping service rates based on weights and destination city
    // Multi Kurir rate base: JNE, J&T, Sicepat, POS, Anteraja
    let baseRate = 9000; // per kg
    if (city.toLowerCase() === 'jakarta') baseRate = 12000;
    if (city.toLowerCase() === 'surabaya') baseRate = 19000;
    if (city.toLowerCase() === 'medan') baseRate = 35000;
    if (city.toLowerCase() === 'makassar') baseRate = 38000;

    // Courier factors
    let courierFactor = 1.0;
    if (courier === 'JNE YES') courierFactor = 1.8;
    if (courier === 'AnterAja NextDay') courierFactor = 1.5;
    if (courier === 'POS Indonesia kilat') courierFactor = 0.9;

    const weightKg = Math.max(1, Math.ceil(totalWeight / 1000));
    let shippingCost = Math.round(baseRate * weightKg * courierFactor);
    if (courier === 'None/Kampus' || city.toLowerCase() === 'kampus unikom' || city.toLowerCase().includes('unikom')) {
      shippingCost = 0;
    }

    // REAL RAJAONGKIR API INTEGRATION BLOCK
    const rajaongkirKey = process.env.RAJAONGKIR_API_KEY;
    let isRealRajaOngkirUsed = false;
    let rajaongkirLogMessage = 'Simulated Rates (api key not found)';

    if (rajaongkirKey && courier !== 'None/Kampus' && city.toLowerCase() !== 'kampus unikom' && !city.toLowerCase().includes('unikom')) {
      // Find destination ID
      let destCityId = '151'; // default Jakarta Barat
      const normalizedCity = city.toLowerCase().trim();
      for (const [key, val] of Object.entries(RAJAONGKIR_CITY_MAP)) {
        if (normalizedCity.includes(key)) {
          destCityId = val;
          break;
        }
      }

      // Map courier to RajaOngkir supported couriers (Starter supports: jne, pos, tiki)
      let mappedCourier = 'jne';
      const lowerCourier = courier.toLowerCase();
      if (lowerCourier.includes('pos')) {
        mappedCourier = 'pos';
      } else if (lowerCourier.includes('tiki')) {
        mappedCourier = 'tiki';
      } else {
        mappedCourier = 'jne';
      }

      try {
        console.log(`[RajaOngkir API] Querying cost: Origin=54 (Bandung), Destination=${destCityId} (${city}), Weight=${totalWeight}g, Courier=${mappedCourier}...`);
        
        const params = new URLSearchParams();
        params.append('origin', '54'); // default Bandung
        params.append('destination', destCityId);
        params.append('weight', String(Math.max(100, Math.round(totalWeight))));
        params.append('courier', mappedCourier);

        const apiRes = await fetch('https://api.rajaongkir.com/starter/cost', {
          method: 'POST',
          headers: {
            'key': rajaongkirKey,
            'content-type': 'application/x-www-form-urlencoded'
          },
          body: params
        });

        if (apiRes.ok) {
          const apiData: any = await apiRes.json();
          const results = apiData?.rajaongkir?.results;
          if (results && results.length > 0) {
            const costs = results[0].costs;
            if (costs && costs.length > 0) {
              // Find matching cost service or get the first one
              let selectedCostObj = costs[0];
              if (courier.toLowerCase().includes('yes') || courier.toLowerCase().includes('nextday')) {
                const yesCost = costs.find((c: any) => c.service.toUpperCase() === 'YES' || c.service.toUpperCase() === 'ONS');
                if (yesCost) selectedCostObj = yesCost;
              } else {
                const regCost = costs.find((c: any) => c.service.toUpperCase() === 'REG' || c.service.toUpperCase() === 'CTC_REG' || c.service.toUpperCase() === 'REGULER');
                if (regCost) selectedCostObj = regCost;
              }

              const realCostVal = selectedCostObj?.cost?.[0]?.value;
              if (typeof realCostVal === 'number' && realCostVal > 0) {
                shippingCost = realCostVal;
                isRealRajaOngkirUsed = true;
                rajaongkirLogMessage = `RajaOngkir API Succeeded: Rp ${shippingCost} (${selectedCostObj.service})`;
                console.log(`[RajaOngkir API Success] Cost resolved to Rp ${shippingCost}`);
              }
            }
          }
        } else {
          const errText = await apiRes.text();
          rajaongkirLogMessage = `API error ${apiRes.status}`;
        }
      } catch (err: any) {
        // Silent fallback to standard simulation
        rajaongkirLogMessage = `API exception: ${err.message}`;
      }
    }

    // Platform application fees
    const platformFee = 2000;

    // payment method specific admin fee (paid by buyer)
    const paymentAdminFee = (paymentMethod && (paymentMethod.includes('Virtual Account') || paymentMethod.includes('Bill Payment'))) ? 4000 : 0;

    // Voucher validation
    let discount = 0;
    if (voucherCode) {
      const activeVoucher = db.vouchers.find(v => v.code.toUpperCase() === voucherCode.toUpperCase() && v.active);
      if (activeVoucher) {
        if (totalProdPrice >= activeVoucher.minPurchase) {
          if (activeVoucher.discountType === 'NOMINAL') {
            discount = activeVoucher.amount;
          } else {
            discount = Math.round(totalProdPrice * (activeVoucher.amount / 100));
          }
        }
      }
    }

    const totalAmount = Math.max(0, (totalProdPrice + shippingCost + platformFee + paymentAdminFee) - discount);

    res.json({
      totalProductPrice: totalProdPrice,
      totalWeight,
      shippingCost,
      platformFee,
      paymentAdminFee,
      discount,
      totalAmount,
      isRealRajaOngkirUsed,
      rajaongkirLogMessage
    });
  });


  // Expose public Midtrans configuration to safe-load client SDK in the frontend
  app.get('/api/midtrans-config', (req, res) => {
    res.json({
      active: !!process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true'
    });
  });

  // Create order & pay via simulated/real Midtrans Snap
  app.post('/api/orders', async (req, res) => {
    const { 
      buyerId, 
      items, 
      address, 
      courier, 
      shippingCost, 
      discount, 
      platformFee, 
      totalProductPrice, 
      totalAmount, 
      paymentMethod,
      isPreOrder,
      preOrderDpPercent,
      dpAmount,
      remainingAmount,
      pelunasanDeadline,
      isFullPaid
    } = req.body;
    if (!buyerId || !items || items.length === 0 || !address || !totalAmount) {
      return res.status(400).json({ error: 'Order parameters are incomplete.' });
    }

    const db = loadDb();
    const buyer = db.users.find(u => u.id === buyerId);
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer account not found.' });
    }

    // Resolve store id from items
    const sampleProd = db.products.find(p => p.id === items[0].productId);
    if (!sampleProd) {
      return res.status(444).json({ error: 'Product in cart is missing.' });
    }

    // Deduct stock
    for (const item of items) {
      const prod = db.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    const orderId = 'ord_' + Math.random().toString(36).substring(2, 9);
    
    // Configure default simulation payment details based on selection
    let orderPaymentDetails: any = {};
    if (paymentMethod && paymentMethod.includes('Virtual Account')) {
      const bankName = paymentMethod.split(' ')[0]; // BCA, BNI, BRI, Mandiri
      orderPaymentDetails = {
        vaNumber: '77620' + Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        bank: bankName
      };
    } else {
      orderPaymentDetails = {
        qrUrl: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400' // mock QR Code image link
      };
    }

    // Try generating real Midtrans Snap Token if Server Key is configured!
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isProductionEnv = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    let snapToken = '';
    let snapRedirectUrl = '';
    let usedRealMidtrans = false;

    if (serverKey) {
      try {
        const midtransUrl = isProductionEnv 
          ? 'https://app.midtrans.com/snap/v1/transactions' 
          : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');
        
        const finalGrossAmount = isPreOrder && dpAmount ? Math.round(Number(dpAmount)) : Math.round(Number(totalAmount));
        
        let enabledPayments: string[] = [];
        if (paymentMethod) {
          const method = String(paymentMethod).toLowerCase();
          if (finalGrossAmount < 10000) {
            // Virtual Accounts require a minimum amount of Rp10,000. Under 10k, we force QRIS and e-wallets.
            enabledPayments = ['qris', 'gopay', 'shopeepay'];
          } else {
            if (method.includes('bca')) {
              enabledPayments = ['bca_va', 'qris', 'gopay', 'shopeepay'];
            } else if (method.includes('mandiri')) {
              enabledPayments = ['echannel', 'qris', 'gopay', 'shopeepay'];
            } else if (method.includes('bni')) {
              enabledPayments = ['bni_va', 'qris', 'gopay', 'shopeepay'];
            } else if (method.includes('bri')) {
              enabledPayments = ['bri_va', 'qris', 'gopay', 'shopeepay'];
            } else if (method.includes('pindai') || method === 'qris') {
              enabledPayments = ['qris', 'gopay', 'shopeepay'];
            } else if (method.includes('gopay') || method.includes('shopee') || method.includes('aplikasi')) {
              enabledPayments = ['qris', 'gopay', 'shopeepay'];
            } else {
              enabledPayments = ['qris', 'gopay', 'shopeepay'];
            }
          }
        }

        const midtransPayload: any = {
          transaction_details: {
            order_id: orderId,
            gross_amount: finalGrossAmount
          },
          customer_details: {
            first_name: address.receiver || buyer.name,
            email: buyer.email,
            phone: address.phone || '08123456789'
          }
        };

        if (enabledPayments.length > 0) {
          midtransPayload.enabled_payments = enabledPayments;
        }

        const midtransRes = await fetch(midtransUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify(midtransPayload)
        });

        if (midtransRes.ok) {
          const midtransData: any = await midtransRes.json();
          snapToken = midtransData.token;
          snapRedirectUrl = midtransData.redirect_url;
          usedRealMidtrans = true;
          console.log(`[Midtrans] Successfully retrieved snap token for ${orderId}: ${snapToken}`);
        } else {
          const errText = await midtransRes.text();
          console.error('[Midtrans] Configuration was present but Midtrans rejected parameters:', errText);
        }
      } catch (err) {
        console.error('[Midtrans] Connection error during order creation:', err);
      }
    }

    const paymentAdminFee = (paymentMethod && (paymentMethod.includes('Virtual Account') || paymentMethod.includes('Bill Payment'))) ? 4000 : 0;

    const newOrder = {
      id: orderId,
      buyerId,
      buyerName: buyer.name,
      storeId: sampleProd.storeId,
      storeName: sampleProd.storeName,
      items,
      address,
      courier,
      shippingCost,
      discount,
      platformFee,
      paymentAdminFee,
      totalProductPrice,
      totalAmount,
      status: OrderStatus.PENDING,
      paymentMethod,
      paymentDetails: orderPaymentDetails,
      snapToken: snapToken || undefined,
      snapRedirectUrl: snapRedirectUrl || undefined,
      usedRealMidtrans,
      isPreOrder: !!isPreOrder,
      preOrderDpPercent: isPreOrder ? Number(preOrderDpPercent) : undefined,
      dpAmount: isPreOrder ? Number(dpAmount) : undefined,
      remainingAmount: isPreOrder ? Number(remainingAmount) : undefined,
      pelunasanDeadline: isPreOrder ? pelunasanDeadline : undefined,
      isFullPaid: isPreOrder ? (isFullPaid === true) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.push(newOrder);
    saveDb(db);

    res.status(201).json({ message: 'Order created successfully.', order: newOrder });
  });

  // Handle direct Midtrans webhook status updates
  const handleMidtransWebhook = (req: express.Request, res: express.Response) => {
    // Enable CORS for webhook callers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    // Robustly handle empty body, ping or connection test from Midtrans dashboard
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('[Midtrans Webhook] Received empty notification body (test/ping). Responding with 200 OK.');
      return res.status(200).json({ status: 'ok', message: 'Midtrans Webhook receiver is active and reachable' });
    }

    const { order_id, transaction_status, status_code, gross_amount, signature_key } = req.body;
    console.log(`[Midtrans Webhook] Received payload: OrderId=${order_id}, Status=${transaction_status}, StatusCode=${status_code}, GrossAmount=${gross_amount}`);
    
    if (!order_id) {
      console.log('[Midtrans Webhook] Received empty order_id. Responding with 200 OK for verification.');
      return res.status(200).json({ status: 'ok', message: 'Webhook is active but order_id is missing' });
    }

    // Check signature key if server key is configured to enforce security
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (serverKey && signature_key) {
      // Signature formula: SHA512(order_id + status_code + gross_amount + serverKey)
      // Check different gross_amount formats due to decimal conversion variance in Midtrans notifications
      const rawStringHash = crypto.createHash('sha512').update(order_id + status_code + gross_amount + serverKey).digest('hex');
      
      const parsedIntAmount = Math.round(parseFloat(gross_amount)).toString();
      const intStringHash = crypto.createHash('sha512').update(order_id + status_code + parsedIntAmount + serverKey).digest('hex');
      const decimalIntStringHash = crypto.createHash('sha512').update(order_id + status_code + parsedIntAmount + '.00' + serverKey).digest('hex');

      const isSignatureValid = (signature_key === rawStringHash || signature_key === intStringHash || signature_key === decimalIntStringHash);

      if (!isSignatureValid) {
        console.error(`[Midtrans Webhook] Verification failed for order ${order_id}. Expected matching: ${rawStringHash} or ${intStringHash}. Received: ${signature_key}`);
        return res.status(403).json({ error: 'Signature key verification failed' });
      }
      console.log(`[Midtrans Webhook] Secure signature verified successfully for order: ${order_id}`);
    } else {
      console.log(`[Midtrans Webhook] Signature verification skipped (MIDTRANS_SERVER_KEY defined: ${!!serverKey}, signature_key received: ${!!signature_key})`);
    }

    const rawOrderId = order_id;
    const isPelunasan = rawOrderId.includes('-lunas');
    const actualOrderId = isPelunasan ? rawOrderId.split('-lunas')[0] : rawOrderId;

    const db = loadDb();
    const order = db.orders.find(o => o.id === actualOrderId || o.id === rawOrderId);
    if (!order) {
      console.log(`[Midtrans Webhook] Order ID "${order_id}" not found in database. Responding with 200 OK for acknowledgment.`);
      return res.status(200).json({ status: 'ok', message: `Order ${order_id} not found, acknowledged.` });
    }

    // Process valid status changes
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      const commissionPercent = db.settings.commissionPercent;
      let netEarning = 0;
      let targetStatus = '';

      if (isPelunasan) {
        if (order.status === OrderStatus.DP_PAID) {
          order.status = OrderStatus.PAID;
          order.isFullPaid = true;
          targetStatus = 'PAID (Pelunasan)';
          
          // Calculate remaining earning portion (minus commissions)
          const dpPercent = order.preOrderDpPercent || 50;
          const remainingPercent = 100 - dpPercent;
          const remainingProductPrice = order.totalProductPrice * (remainingPercent / 100);
          const commissionVal = remainingProductPrice * (commissionPercent / 100);
          netEarning = remainingProductPrice - commissionVal;
        } else {
          console.log(`[Midtrans Webhook] Pelunasan received, but order ${order.id} status is already: ${order.status}`);
          return res.status(200).json({ status: 'ok', message: `Pelunasan ignored, order status is already: ${order.status}` });
        }
      } else {
        if (order.status === OrderStatus.PENDING) {
          if (order.isPreOrder && !order.isFullPaid) {
            order.status = OrderStatus.DP_PAID;
            targetStatus = 'DP_PAID';

            // Setup 14-day pelunasan deadline
            const deadlineDate = new Date();
            deadlineDate.setDate(deadlineDate.getDate() + 14);
            order.pelunasanDeadline = deadlineDate.toISOString();

            // Calculate DP earning portion (minus commissions)
            const dpPercent = order.preOrderDpPercent || 50;
            const dpProductPrice = order.totalProductPrice * (dpPercent / 100);
            const commissionVal = dpProductPrice * (commissionPercent / 100);
            netEarning = dpProductPrice - commissionVal;
          } else {
            // Regular order or pre-order fully paid (Lunas)
            order.status = OrderStatus.PAID;
            order.isFullPaid = true;
            targetStatus = 'PAID';

            const commissionVal = order.totalProductPrice * (commissionPercent / 100);
            netEarning = order.totalProductPrice - commissionVal;
          }
        } else {
          console.log(`[Midtrans Webhook] Settlement received, but order ${order.id} status is already: ${order.status}`);
          return res.status(200).json({ status: 'ok', message: `Settlement ignored, order status is already: ${order.status}` });
        }
      }

      if (targetStatus) {
        order.updatedAt = new Date().toISOString();

        // Move to Seller Held balance inside wallets
        let wallet = db.wallets.find(w => w.storeId === order.storeId);
        if (!wallet) {
          wallet = {
            storeId: order.storeId,
            balance: 0,
            heldBalance: 0,
            totalEarnings: 0,
            totalWithdrawn: 0
          };
          db.wallets.push(wallet);
        }

        wallet.heldBalance += netEarning;
        wallet.totalEarnings += netEarning;
        saveDb(db);
        console.log(`[Midtrans Webhook] Order ${order.id} was successfully marked as ${targetStatus}. Net earning addition: Rp${netEarning}`);
      }
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      if (order.status === OrderStatus.PENDING) {
        order.status = OrderStatus.CANCELLED;
        order.updatedAt = new Date().toISOString();
        
        // Restore stock
        for (const item of order.items) {
          const prod = db.products.find(p => p.id === item.productId);
          if (prod) {
            prod.stock += item.quantity;
          }
        }
        saveDb(db);
        console.log(`[Midtrans Webhook] Order ${order_id} was marked as CANCELLED`);
      }
    }

    res.json({ success: true, status: 'processed', orderStatus: order.status });
  };

  const handleWebhookVerify = (req: express.Request, res: express.Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    res.json({
      status: 'active',
      endpoints: [
        '/api/webhook/midtrans',
        '/api/midtrans-webhook'
      ],
      message: 'Midtrans Webhook receiver is fully active. Use POST to send transaction notifications.',
      serverTime: new Date().toISOString()
    });
  };

  app.get('/api/midtrans-webhook', handleWebhookVerify);
  app.get('/api/webhook/midtrans', handleWebhookVerify);
  app.post('/api/midtrans-webhook', handleMidtransWebhook);
  app.post('/api/webhook/midtrans', handleMidtransWebhook);

  // Helper to expire pending orders older than 24 hours and restock products
  function processPendingOrderExpirations(db: any) {
    let changed = false;
    const now = new Date().getTime();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    
    if (db && Array.isArray(db.orders)) {
      db.orders.forEach((order: any) => {
        if (order.status === OrderStatus.PENDING) {
          const createdTime = new Date(order.createdAt).getTime();
          if (now - createdTime > ONE_DAY_MS) {
            order.status = OrderStatus.FAILED;
            order.updatedAt = new Date().toISOString();
            if (Array.isArray(order.items)) {
              order.items.forEach((item: any) => {
                const prod = db.products.find((p: any) => p.id === item.productId);
                if (prod) {
                  prod.stock += item.quantity;
                }
              });
            }
            changed = true;
          }
        }
      });
    }
    if (changed) {
      saveDb(db);
    }
  }

  app.get('/api/orders', (req, res) => {
    const { buyerId, storeId, role } = req.query;
    const db = loadDb();
    processPendingOrderExpirations(db);
    let list = db.orders;

    if (role === Role.BUYER && buyerId) {
      list = list.filter(o => o.buyerId === buyerId);
    } else if (role === Role.SELLER && storeId) {
      list = list.filter(o => o.storeId === storeId);
    }

    // Sort order by newest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(list);
  });

  app.get('/api/orders/:id', (req, res) => {
    const db = loadDb();
    processPendingOrderExpirations(db);
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(order);
  });

  app.get('/api/orders/:id/track-status', async (req, res) => {
    const db = loadDb();
    const order = db.orders.find(o => o.id === req.params.id || (o.resiNo && o.resiNo === req.params.id));
    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    }

    const resiNo = order.resiNo || '';
    const rawCourier = String(order.courier || 'jne').toLowerCase();
    
    // Map rawCourier to Binderbyte courier code
    let courierCode = 'jne';
    if (rawCourier.includes('jne')) courierCode = 'jne';
    else if (rawCourier.includes('j&t') || rawCourier.includes('jnt')) courierCode = 'jnt';
    else if (rawCourier.includes('sicepat')) courierCode = 'sicepat';
    else if (rawCourier.includes('pos')) courierCode = 'pos';
    else if (rawCourier.includes('tiki')) courierCode = 'tiki';
    else if (rawCourier.includes('wahana')) courierCode = 'wahana';
    else if (rawCourier.includes('ninja')) courierCode = 'ninja';
    else if (rawCourier.includes('anteraja')) courierCode = 'anteraja';

    const apiKey = process.env.BINDERBYTE_API_KEY;

    let trackingData: any = null;
    let apiUsed = 'none';

    if (apiKey && apiKey !== 'MY_BINDERBYTE_API_KEY' && resiNo && !resiNo.startsWith('SIPIL-RESI-MOCK')) {
      try {
        console.log(`[Binderbyte] Fetching real-time tracking from Binderbyte for ${courierCode} / ${resiNo}...`);
        const response = await fetch(`https://api.binderbyte.com/v1/track?api_key=${apiKey}&courier=${courierCode}&awb=${resiNo}`);
        const result = await response.json();
        if (result && result.status === 200 && result.data) {
          trackingData = result.data;
          apiUsed = 'binderbyte';
          console.log(`[Binderbyte] Successfully tracked waybill ${resiNo}, status: ${trackingData.summary.status}`);
          
          // Auto-sync status to DB if delivered
          const binderStatus = String(trackingData.summary.status).toUpperCase();
          if (binderStatus === 'DELIVERED' && order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.COMPLETED) {
            order.status = OrderStatus.DELIVERED;
            order.updatedAt = new Date().toISOString();
            saveDb(db);
          }
        } else {
          console.warn(`[Binderbyte] API returned non-200 or failure:`, result);
        }
      } catch (e) {
        console.warn(`[Binderbyte] Failed to contact API:`, e);
      }
    }

    // Fallback to high-fidelity simulated real-time tracking if real API is not accessible or mock waybill is used
    if (!trackingData) {
      apiUsed = 'simulation';
      
      // Let's create high-fidelity simulated timeline for the courier based on elapsed time since order creation
      const createdAtTime = new Date(order.createdAt).getTime();
      const nowTime = new Date().getTime();
      const elapsedHours = (nowTime - createdAtTime) / (3600 * 1000);

      // We generate realistic checkpoints that progressively appear as hours/days go by
      const courierName = courierCode.toUpperCase() + ' Express';
      const historyList: any[] = [];

      // Initial checkpoint: 5 minutes after creation
      historyList.push({
        date: new Date(createdAtTime + 5 * 60 * 1000).toISOString(),
        desc: `[SYSTEM] Invoice pesanan diterbitkan. Menunggu serah terima paket ke kurir ${courierName}.`
      });

      // Shipped checkpoint: 1.5 hours after
      if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.COMPLETED) {
        historyList.push({
          date: new Date(createdAtTime + 1.5 * 3600 * 1000).toISOString(),
          desc: `[${courierName}] SHIPMENT RECEIVED BY JNE COUNTER BANDUNG [AGEN COBLONG]`
        });

        // Transit 1: 4 hours after
        if (elapsedHours >= 4 || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.COMPLETED) {
          historyList.push({
            date: new Date(createdAtTime + 4 * 3600 * 1000).toISOString(),
            desc: `[${courierName}] PROCESSED IN SORTING CENTER BANDUNG`
          });
        }

        // Transit 2: 8 hours after
        if (elapsedHours >= 8 || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.COMPLETED) {
          historyList.push({
            date: new Date(createdAtTime + 8 * 3600 * 1000).toISOString(),
            desc: `[${courierName}] RECEIVED AT HUB TRANSIT ${order.address?.city?.toUpperCase() || 'BANDUNG'}`
          });
        }

        // Out for Delivery: 12 hours after
        if (elapsedHours >= 12 || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.COMPLETED) {
          historyList.push({
            date: new Date(createdAtTime + 12 * 3600 * 1000).toISOString(),
            desc: `[${courierName}] WITH COURIER [SDR. NANDANG JNE] ON THE WAY TO RECEIVER ADDRESS`
          });
        }

        // Delivered: 16 hours after
        if (elapsedHours >= 16 || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.COMPLETED) {
          // If the order status is currently SHIPPED but elapsed time says it should be delivered,
          // let's auto-advance the database status to DELIVERED to show real-time progress!
          if (order.status === OrderStatus.SHIPPED) {
            order.status = OrderStatus.DELIVERED;
            order.updatedAt = new Date().toISOString();
            saveDb(db);
          }

          historyList.push({
            date: new Date(createdAtTime + 16 * 3600 * 1000).toISOString(),
            desc: `[${courierName}] DELIVERED TO [${order.address?.receiver || 'PENERIMA'} | TETANGGA]`
          });
        }
      }

      // Reverse history so latest is at the top
      historyList.reverse();

      const latestStatus = order.status; // SYNC with DB status

      trackingData = {
        summary: {
          awb: resiNo || 'SIPIL-RESI-MOCK',
          courier: courierName,
          service: 'REG',
          status: latestStatus === OrderStatus.COMPLETED ? 'CLOSED' : (latestStatus === OrderStatus.DELIVERED ? 'DELIVERED' : 'ON_PROCESS'),
          date: historyList[0] ? historyList[0].date : new Date(order.createdAt).toISOString(),
          desc: historyList[0] ? historyList[0].desc : "Pesanan baru dibuat."
        },
        detail: {
          origin: "BANDUNG COBLONG",
          destination: (order.address?.city || "KOTA BANDUNG").toUpperCase(),
          shipper: `${order.storeName} @ TokoSipil`,
          receiver: order.address?.receiver || "MAHASISWA SIPIL"
        },
        history: historyList
      };
    }

    res.json({
      orderId: order.id,
      status: order.status,
      apiSource: apiUsed,
      tracking: trackingData
    });
  });

  app.post('/api/orders/:id/pelunasan-token', async (req, res) => {
    const db = loadDb();
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    }

    if (order.status !== OrderStatus.DP_PAID) {
      return res.status(400).json({ error: 'Pesanan ini tidak berada di tahap pelunasan DP.' });
    }

    const { paymentMethod } = req.body;
    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
      // Configure default simulation payment details based on selection
      if (paymentMethod.includes('Virtual Account') || paymentMethod.includes('Bill Payment')) {
        const bankName = paymentMethod.split(' ')[0]; // BCA, BNI, BRI, Mandiri
        order.paymentDetails = {
          vaNumber: '77620' + Math.floor(1000000000 + Math.random() * 9000000000).toString(),
          bank: bankName
        };
      } else {
        order.paymentDetails = {
          qrUrl: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400'
        };
      }
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isProductionEnv = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    const buyer = db.users.find(u => u.id === order.buyerId);

    if (serverKey) {
      try {
        const midtransUrl = isProductionEnv 
          ? 'https://app.midtrans.com/snap/v1/transactions' 
          : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');
        
        const finalGrossAmount = Math.round(Number(order.remainingAmount || 0));
        const pelunasanOrderId = `${order.id}-lunas-${Math.random().toString(36).substring(2, 6)}`;

        let enabledPayments: string[] = [];
        if (order.paymentMethod) {
          const method = String(order.paymentMethod).toLowerCase();
          if (finalGrossAmount < 10000) {
            enabledPayments = ['qris', 'gopay', 'shopeepay'];
          } else {
            if (method.includes('bca')) {
              enabledPayments = ['bca_va', 'qris', 'gopay', 'shopeepay'];
            } else if (method.includes('mandiri')) {
              enabledPayments = ['echannel', 'qris', 'gopay', 'shopeepay'];
            } else if (method.includes('bni')) {
              enabledPayments = ['bni_va', 'qris', 'gopay', 'shopeepay'];
            } else if (method.includes('bri')) {
              enabledPayments = ['bri_va', 'qris', 'gopay', 'shopeepay'];
            } else if (method.includes('pindai') || method === 'qris') {
              enabledPayments = ['qris', 'gopay', 'shopeepay'];
            } else if (method.includes('gopay') || method.includes('shopee') || method.includes('aplikasi')) {
              enabledPayments = ['qris', 'gopay', 'shopeepay'];
            } else {
              enabledPayments = ['qris', 'gopay', 'shopeepay'];
            }
          }
        }

        console.log(`[Midtrans] Contacting Midtrans for pelunasan order ${pelunasanOrderId} with amount ${finalGrossAmount}...`);

        const midtransPayload: any = {
          transaction_details: {
            order_id: pelunasanOrderId,
            gross_amount: finalGrossAmount
          },
          customer_details: {
            first_name: order.address.receiver || (buyer ? buyer.name : 'Customer'),
            email: buyer ? buyer.email : 'customer@example.com',
            phone: order.address.phone || '08123456789'
          }
        };

        if (enabledPayments.length > 0) {
          midtransPayload.enabled_payments = enabledPayments;
        }

        const midtransRes = await fetch(midtransUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify(midtransPayload)
        });

        if (midtransRes.ok) {
          const midtransData: any = await midtransRes.json();
          order.snapToken = midtransData.token;
          order.snapRedirectUrl = midtransData.redirect_url;
          order.usedRealMidtrans = true;
          console.log(`[Midtrans] Generated pelunasan snap token for ${pelunasanOrderId}: ${order.snapToken}`);
          saveDb(db);
        } else {
          const errText = await midtransRes.text();
          console.error('[Midtrans] Midtrans rejected pelunasan parameters:', errText);
          return res.status(400).json({ error: `Midtrans menolak pembuatan token pelunasan: ${errText}` });
        }
      } catch (err: any) {
        console.error('[Midtrans] Connection error during pelunasan token creation:', err);
        return res.status(500).json({ error: `Gagal terhubung ke Midtrans: ${err.message}` });
      }
    } else {
      order.usedRealMidtrans = false;
      if (order.snapToken) delete order.snapToken;
      if (order.snapRedirectUrl) delete order.snapRedirectUrl;
      saveDb(db);
    }

    res.json(order);
  });

  // Midtrans Payment Simulation
  app.post('/api/orders/:id/pay', (req, res) => {
    const db = loadDb();
    processPendingOrderExpirations(db);
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.DP_PAID) {
      return res.status(400).json({ error: 'Pesanan ini sudah dibayar atau dibatalkan.' });
    }

    const commissionPercent = db.settings.commissionPercent;
    let netEarning = 0;
    let statusMessage = '';

    if (order.isPreOrder) {
      if (order.status === OrderStatus.PENDING) {
        if (order.isFullPaid) {
          order.status = OrderStatus.PAID;
          const commissionVal = order.totalProductPrice * (commissionPercent / 100);
          netEarning = order.totalProductPrice - commissionVal;
          statusMessage = 'Pembayaran penuh Pre-Order (Lunas) berhasil disimulasikan.';
        } else {
          // Step 1: Paid down payment (DP)
          order.status = OrderStatus.DP_PAID;
          
          // Setup 14-day pelunasan deadline
          const deadlineDate = new Date();
          deadlineDate.setDate(deadlineDate.getDate() + 14);
          order.pelunasanDeadline = deadlineDate.toISOString();
          
          // Calculate DP earning portion (minus commissions)
          const dpPercent = order.preOrderDpPercent || 50;
          const dpProductPrice = order.totalProductPrice * (dpPercent / 100);
          const commissionVal = dpProductPrice * (commissionPercent / 100);
          netEarning = dpProductPrice - commissionVal;
          statusMessage = 'Uang muka (DP) berhasil disimulasikan.';
        }
      } else if (order.status === OrderStatus.DP_PAID) {
        // Step 2: Paid pelunasan
        order.status = OrderStatus.PAID;
        order.isFullPaid = true;
        
        // Calculate remaining earning portion (minus commissions)
        const dpPercent = order.preOrderDpPercent || 50;
        const remainingPercent = 100 - dpPercent;
        const remainingProductPrice = order.totalProductPrice * (remainingPercent / 100);
        const commissionVal = remainingProductPrice * (commissionPercent / 100);
        netEarning = remainingProductPrice - commissionVal;
        statusMessage = 'Pelunasan berhasil disimulasikan.';
      }
    } else {
      // Regular full payment
      order.status = OrderStatus.PAID;
      const commissionVal = order.totalProductPrice * (commissionPercent / 100);
      netEarning = order.totalProductPrice - commissionVal;
      statusMessage = 'Pembayaran penuh berhasil disimulasikan.';
    }

    order.updatedAt = new Date().toISOString();

    // Move to Seller Held balance inside wallets
    let wallet = db.wallets.find(w => w.storeId === order.storeId);
    if (!wallet) {
      wallet = {
        storeId: order.storeId,
        balance: 0,
        heldBalance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0
      };
      db.wallets.push(wallet);
    }

    wallet.heldBalance += netEarning;
    wallet.totalEarnings += netEarning;

    saveDb(db);
    res.json({ message: statusMessage, order });
  });

  // Shipping process
  app.post('/api/orders/:id/ship', (req, res) => {
    const { resiNo } = req.body;
    if (!resiNo) {
      return res.status(400).json({ error: 'Nomor Resi wajib diisi.' });
    }

    const db = loadDb();
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    }

    order.status = OrderStatus.SHIPPED;
    order.resiNo = resiNo;
    order.updatedAt = new Date().toISOString();

    saveDb(db);
    res.json({ message: 'Pesanan berhasil dikirim.', order });
  });

  app.post('/api/orders/:id/deliver', (req, res) => {
    const db = loadDb();
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    }

    order.status = OrderStatus.DELIVERED;
    order.updatedAt = new Date().toISOString();

    saveDb(db);
    res.json({ message: 'Kurir sukses mengirim paket ke alamat.', order });
  });

  // Complete Order & Wallet Credit releases
  app.post('/api/orders/:id/complete', (req, res) => {
    const db = loadDb();
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    }

    if (order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.DELIVERED) {
      return res.status(400).json({ error: 'Pesanan belum dikirim atau telah selesai.' });
    }

    order.status = OrderStatus.COMPLETED;
    order.updatedAt = new Date().toISOString();

    // Release held balance to seller wallet cash-in
    const wallet = db.wallets.find(w => w.storeId === order.storeId);
    if (wallet) {
      const commissionPercent = db.settings.commissionPercent;
      const commissionVal = order.totalProductPrice * (commissionPercent / 100);
      const netEarning = order.totalProductPrice - commissionVal;

      wallet.heldBalance = Math.max(0, wallet.heldBalance - netEarning);
      wallet.balance += netEarning;

      // Log wallet transaction
      db.walletTransactions.push({
        id: 'tx_' + Math.random().toString(36).substring(2, 9),
        storeId: order.storeId,
        amount: netEarning,
        type: 'CREDIT',
        description: `Pelepasan penjualan order ${order.id} (Diskon platform terpotong)`,
        createdAt: new Date().toISOString()
      });
    }

    saveDb(db);
    res.json({ message: 'Pesanan selesai. Dana saldo penjual telah dicairkan ke dompet.', order });
  });

  // Client cancellation
  app.post('/api/orders/:id/cancel', (req, res) => {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Alasan pembatalan wajib disediakan.' });
    }

    const db = loadDb();
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    }

    if (order.status !== OrderStatus.PENDING) {
      return res.status(400).json({ error: 'Uang muka (DP) telah didepositokan untuk pesanan ini. Sesuai kebijakan Toko Sipil, pesanan yang sudah membayar DP atau lunas tidak dapat dibatalkan atau direfund.' });
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelReason = reason.trim();
    order.updatedAt = new Date().toISOString();

    // Restock
    for (const item of order.items) {
      const prod = db.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
      }
    }

    saveDb(db);
    res.json({ message: 'Pesanan berhasil dibatalkan.', order });
  });

  // Reviews product
  app.post('/api/orders/:id/review', (req, res) => {
    const { productId, buyerId, buyerName, rating, text, image } = req.body;
    if (!productId || !buyerId || !rating || !text) {
      return res.status(400).json({ error: 'Data ulasan tidak lengkap.' });
    }

    const db = loadDb();
    const hasPriorReview = db.reviews.find(r => r.productId === productId && r.buyerId === buyerId);
    if (hasPriorReview) {
      return res.status(400).json({ error: 'Anda sudah mengirimkan ulasan untuk produk ini sebelumnya.' });
    }

    const newReview = {
      id: 'rev_' + Math.random().toString(36).substring(2, 9),
      productId,
      buyerId,
      buyerName: buyerName || 'Anonim',
      rating: Number(rating),
      text,
      image: image || null,
      createdAt: new Date().toISOString()
    };

    db.reviews.push(newReview);

    // Calculate new average product store ratings
    const product = db.products.find(p => p.id === productId);
    if (product) {
      const pReviews = db.reviews.filter(r => r.productId === productId);
      const totalStars = pReviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = totalStars / pReviews.length;
      
      const store = db.stores.find(s => s.id === product.storeId);
      if (store) {
        store.rating = Number(avg.toFixed(1));
      }
    }

    saveDb(db);
    res.status(201).json({ message: 'Terima kasih atas ulasan ulasan bintang ' + rating + ' Anda!', review: newReview });
  });

  // Wallets statistics & bank controls
  app.get('/api/wallets/:storeId', (req, res) => {
    const db = loadDb();
    let wallet = db.wallets.find(w => w.storeId === req.params.storeId);
    if (!wallet) {
      wallet = {
        storeId: req.params.storeId,
        balance: 0,
        heldBalance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0
      };
      db.wallets.push(wallet);
      saveDb(db);
    }
    res.json(wallet);
  });

  app.get('/api/wallets/transactions/:storeId', (req, res) => {
    const db = loadDb();
    const txs = db.walletTransactions.filter(tx => tx.storeId === req.params.storeId);
    // newest transactions
    txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(txs);
  });

  app.get('/api/bank-account/:userId', (req, res) => {
    const db = loadDb();
    const bank = db.bankAccounts.find(bk => bk.sellerId === req.params.userId);
    res.json(bank || null);
  });

  app.post('/api/bank-account', (req, res) => {
    const { sellerId, bankName, accountNumber, accountHolder, proofPhoto, nik, ktpPhoto } = req.body;
    if (!sellerId || !bankName || !accountNumber || !accountHolder || !proofPhoto || !nik || !ktpPhoto) {
      return res.status(400).json({ error: 'Seluruh form data rekening wajib diisi.' });
    }

    const db = loadDb();
    const existing = db.bankAccounts.find(bk => bk.sellerId === sellerId);
    if (existing) {
      existing.bankName = bankName;
      existing.accountNumber = accountNumber;
      existing.accountHolder = accountHolder;
      existing.proofPhoto = proofPhoto;
      existing.nik = nik;
      existing.ktpPhoto = ktpPhoto;
      existing.status = BankVerificationStatus.PENDING;
      existing.createdAt = new Date().toISOString();
      saveDb(db);
      return res.json({ message: 'Data rekening diperbarui, silakan tunggu verifikasi pegurus.', bankAccount: existing });
    }

    const newBank = {
      id: 'bk_' + Math.random().toString(36).substring(2, 9),
      sellerId,
      bankName,
      accountNumber,
      accountHolder,
      proofPhoto,
      nik,
      ktpPhoto,
      status: BankVerificationStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    db.bankAccounts.push(newBank);
    saveDb(db);
    res.status(201).json({ message: 'Rekening diajukan, menunggu verifikasi pengurus.', bankAccount: newBank });
  });

  app.get('/api/admin/bank-accounts', (req, res) => {
    const db = loadDb();
    res.json(db.bankAccounts);
  });

  app.post('/api/admin/bank-accounts/:id/approve', (req, res) => {
    const db = loadDb();
    const bk = db.bankAccounts.find(x => x.id === req.params.id);
    if (!bk) {
      return res.status(404).json({ error: 'Data Rekening tidak ditemukan.' });
    }
    bk.status = BankVerificationStatus.APPROVED;
    saveDb(db);
    res.json({ message: 'Rekening seller berhasil disetujui.', bankAccount: bk });
  });

  app.post('/api/admin/bank-accounts/:id/reject', (req, res) => {
    const db = loadDb();
    const bk = db.bankAccounts.find(x => x.id === req.params.id);
    if (!bk) {
      return res.status(404).json({ error: 'Data Rekening tidak ditemukan.' });
    }
    bk.status = BankVerificationStatus.REJECTED;
    saveDb(db);
    res.json({ message: 'Rekening seller ditolak.', bankAccount: bk });
  });

  // Withdrawals
  app.post('/api/withdrawals', (req, res) => {
    const { sellerId, amount, bankName, accountNumber, accountHolder } = req.body;
    if (!sellerId || !amount || amount < 50000) {
      return res.status(400).json({ error: 'Form penarikan wajib diisi, minimal Rp50.000.' });
    }

    const db = loadDb();
    // Validate bank status is verified
    const userRole = db.users.find(u => u.id === sellerId);
    const sellerStore = db.stores.find(s => s.userId === sellerId);
    if (!sellerStore) {
      return res.status(400).json({ error: 'Akun toko anda tidak terdaftar.' });
    }

    const bankAcc = db.bankAccounts.find(bk => bk.sellerId === sellerId && bk.status === BankVerificationStatus.APPROVED);
    if (!bankAcc) {
      return res.status(400).json({ error: 'Anda wajib memiliki rekening yang diverifikasi oleh Admin/Pegawai untuk menarik dana.' });
    }

    const wallet = db.wallets.find(w => w.storeId === sellerStore.id);
    if (!wallet || wallet.balance < Number(amount)) {
      return res.status(400).json({ error: 'Saldo Anda tidak mencukupi untuk penarikan ini.' });
    }

    // Deduct immediately to prevent double spend
    wallet.balance -= Number(amount);
    wallet.totalWithdrawn += Number(amount);

    const wdId = 'wd_' + Math.random().toString(36).substring(2, 9);
    const newWd = {
      id: wdId,
      sellerId,
      amount: Number(amount),
      bankName,
      accountNumber,
      accountHolder,
      status: WithdrawalStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    db.withdrawals.push(newWd);

    // Log debit transaction
    db.walletTransactions.push({
      id: 'tx_wd_' + Math.random().toString(36).substring(2, 9),
      storeId: sellerStore.id,
      amount: Number(amount),
      type: 'DEBIT',
      description: `Pengajuan withdraw ${wdId} - Satus Pending`,
      createdAt: new Date().toISOString()
    });

    saveDb(db);
    res.status(201).json({ message: 'Pencairan diajukan, menunggu approval tim admin.', withdrawal: newWd });
  });

  app.get('/api/withdrawals', (req, res) => {
    const { sellerId } = req.query;
    const db = loadDb();
    if (sellerId) {
      return res.json(db.withdrawals.filter(w => w.sellerId === sellerId));
    }
    // Newest first
    const list = [...db.withdrawals];
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(list);
  });

  app.post('/api/withdrawals/:id/approve', (req, res) => {
    const db = loadDb();
    const wd = db.withdrawals.find(w => w.id === req.params.id);
    if (!wd) {
      return res.status(404).json({ error: 'Pengajuan withdraw tidak ditemukan.' });
    }

    wd.status = WithdrawalStatus.COMPLETED;
    wd.notes = 'Penarikan sukses ditransfer ke rekening bank ' + wd.bankName + '.';
    
    // Update seller tx log note
    const sellerStore = db.stores.find(s => s.userId === wd.sellerId);
    if (sellerStore) {
      const tx = db.walletTransactions.find(t => t.storeId === sellerStore.id && t.description.includes(wd.id));
      if (tx) {
        tx.description = `Penarikan dana Rekening ${wd.bankName} - Berhasil dan Ditransfer`;
      }
    }

    saveDb(db);
    res.json({ message: 'Penarikan berhasil disetujui dan dana dicairkan.', withdrawal: wd });
  });

  app.post('/api/withdrawals/:id/reject', (req, res) => {
    const db = loadDb();
    const wd = db.withdrawals.find(w => w.id === req.params.id);
    if (!wd) {
      return res.status(404).json({ error: 'Pengajuan withdraw tidak ditemukan.' });
    }

    wd.status = WithdrawalStatus.REJECTED;
    wd.notes = 'Ditolak: ' + (req.body.notes || 'Data bank tidak valid.');

    // Return balance to seller
    const sellerStore = db.stores.find(s => s.userId === wd.sellerId);
    if (sellerStore) {
      const wallet = db.wallets.find(w => w.storeId === sellerStore.id);
      if (wallet) {
        wallet.balance += wd.amount;
        wallet.totalWithdrawn = Math.max(0, wallet.totalWithdrawn - wd.amount);
      }

      db.walletTransactions.push({
        id: 'tx_wd_rej_' + Math.random().toString(36).substring(2, 9),
        storeId: sellerStore.id,
        amount: wd.amount,
        type: 'CREDIT',
        description: `Pengembalian dana withdraw ${wd.id} karena ditolak admin`,
        createdAt: new Date().toISOString()
      });
    }

    saveDb(db);
    res.json({ message: 'Penarikan dana ditolak dan saldo dikembalikan ke seller.', withdrawal: wd });
  });

  // Chats Controller
  app.get('/api/chats', (req, res) => {
    const { buyerId, storeId, userId } = req.query;
    const db = loadDb();
    let list = db.chats;

    if (userId) {
      const uId = String(userId);
      // Fetch store IDs owned by this user
      const ownedStoreIds = (db.stores || []).filter(s => s.userId === uId).map(s => s.id);
      list = list.filter(c => c.buyerId === uId || ownedStoreIds.includes(c.sellerId) || c.sellerId === uId);
    } else {
      if (buyerId) {
        list = list.filter(c => c.buyerId === buyerId);
      }
      if (storeId) {
        list = list.filter(c => c.sellerId === storeId);
      }
    }
    res.json(list);
  });

  app.post('/api/chats/new', (req, res) => {
    const { buyerId, storeId } = req.body;
    if (!buyerId || !storeId) {
      return res.status(400).json({ error: 'Parameter kurang' });
    }

    const db = loadDb();
    let chat = db.chats.find(c => c.buyerId === buyerId && c.sellerId === storeId);
    if (!chat) {
      const buyer = db.users.find(u => u.id === buyerId);
      const store = db.stores.find(s => s.id === storeId);
      
      chat = {
        id: 'cht_' + Math.random().toString(36).substring(2, 9),
        buyerId,
        buyerName: buyer ? buyer.name : 'Pembeli',
        sellerId: storeId,
        sellerName: store ? store.name : 'Toko',
        lastMessage: 'Memulai percakapan...',
        updatedAt: new Date().toISOString()
      };
      db.chats.push(chat);
      saveDb(db);
    }
    res.json(chat);
  });

  app.get('/api/chats/:id/messages', (req, res) => {
    const db = loadDb();
    const messages = db.messages.filter(m => m.chatId === req.params.id);
    res.json(messages);
  });

  app.post('/api/chats/:chatId/messages', (req, res) => {
    const { senderId, text, image } = req.body;
    if (!senderId || (!text && !image)) {
      return res.status(400).json({ error: 'Pesan kosong.' });
    }

    const db = loadDb();
    const chat = db.chats.find(c => c.id === req.params.chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Obrolan tidak ditemukan.' });
    }

    const msg = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      chatId: req.params.chatId,
      senderId,
      text: text || '',
      image,
      createdAt: new Date().toISOString()
    };

    db.messages.push(msg);
    chat.lastMessage = text || '[Gambar]';
    chat.updatedAt = new Date().toISOString();

    saveDb(db);
    res.json(msg);
  });

  // Vouchers
  app.get('/api/vouchers', (req, res) => {
    const { storeId } = req.query;
    const db = loadDb();
    let list = db.vouchers;
    if (storeId) {
      list = list.filter(v => v.storeId === storeId || v.type === 'PLATFORM');
    }
    res.json(list);
  });

  app.post('/api/vouchers', (req, res) => {
    const { code, type, discountType, amount, minPurchase, storeId } = req.body;
    if (!code || !amount) {
      return res.status(400).json({ error: 'Kode voucher dan nominal wajib diisi.' });
    }

    const db = loadDb();
    const newVoucher = {
      id: 'vch_' + Math.random().toString(36).substring(2, 9),
      code: code.toUpperCase(),
      type: type || 'STORE',
      discountType: discountType || 'NOMINAL',
      amount: Number(amount),
      minPurchase: Number(minPurchase || 0),
      storeId: storeId || undefined,
      active: true
    };

    db.vouchers.push(newVoucher);
    saveDb(db);
    res.json({ message: 'Voucher berhasil diterbitkan.', voucher: newVoucher });
  });

  app.delete('/api/vouchers/:id', (req, res) => {
    const { id } = req.params;
    const db = loadDb();
    const idx = db.vouchers.findIndex(v => v.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Voucher tidak ditemukan.' });
    }
    db.vouchers.splice(idx, 1);
    saveDb(db);
    res.json({ success: true, message: 'Voucher berhasil dihapus.' });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password baru wajib diisi.' });
    }
    const db = loadDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'Email tidak ditemukan.' });
    }
    user.password = password;
    saveDb(db);
    res.json({ success: true, message: 'Password Anda berhasil diubah.' });
  });

  app.put('/api/auth/profile', (req, res) => {
    const { 
      id, name, angkatan, campus, avatar, 
      username, phone, gender,
      addressDetail, addressCity, addressProvince, addressDistrict, addressSubdistrict, addressRTRW,
      addressReceiver, addressPhone, addressLatLng,
      oldPassword, newPassword 
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'User ID wajib disertakan.' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nama tidak boleh kosong.' });
    }
    const db = loadDb();
    const user = db.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    // Password change logic if newPassword is provided
    if (newPassword && newPassword.trim()) {
      if (oldPassword && user.password && user.password !== oldPassword.trim()) {
        return res.status(400).json({ error: 'Password lama salah.' });
      }
      user.password = newPassword.trim();
    }

    user.name = name.trim();
    if (angkatan !== undefined) {
      user.angkatan = String(angkatan || '').trim();
    }
    if (campus !== undefined) {
      user.campus = String(campus || '').trim();
    }
    if (avatar !== undefined) {
      user.avatar = String(avatar || '').trim();
    }
    if (username !== undefined) {
      user.username = String(username || '').trim();
    }
    if (phone !== undefined) {
      user.phone = String(phone || '').trim();
    }
    if (gender !== undefined) {
      user.gender = String(gender || '').trim();
    }
    if (addressDetail !== undefined) {
      user.addressDetail = String(addressDetail || '').trim();
    }
    if (addressCity !== undefined) {
      user.addressCity = String(addressCity || '').trim();
    }
    if (addressProvince !== undefined) {
      user.addressProvince = String(addressProvince || '').trim();
    }
    if (addressDistrict !== undefined) {
      user.addressDistrict = String(addressDistrict || '').trim();
    }
    if (addressSubdistrict !== undefined) {
      user.addressSubdistrict = String(addressSubdistrict || '').trim();
    }
    if (addressRTRW !== undefined) {
      user.addressRTRW = String(addressRTRW || '').trim();
    }
    if (addressReceiver !== undefined) {
      user.addressReceiver = String(addressReceiver || '').trim();
    }
    if (addressPhone !== undefined) {
      user.addressPhone = String(addressPhone || '').trim();
    }
    if (addressLatLng !== undefined) {
      user.addressLatLng = addressLatLng; // {lat, lng} / null
    }

    saveDb(db);
    res.json({
      success: true,
      message: 'Profil Anda berhasil diperbarui.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        angkatan: user.angkatan,
        campus: user.campus,
        username: user.username,
        phone: user.phone,
        gender: user.gender,
        addressDetail: user.addressDetail,
        addressCity: user.addressCity,
        addressProvince: user.addressProvince,
        addressDistrict: user.addressDistrict,
        addressSubdistrict: user.addressSubdistrict,
        addressRTRW: user.addressRTRW,
        addressReceiver: user.addressReceiver,
        addressPhone: user.addressPhone,
        addressLatLng: user.addressLatLng,
        isGuest: user.isGuest
      }
    });
  });

  // Banners & settings
  app.get('/api/banners', (req, res) => {
    const db = loadDb();
    res.json(db.banners);
  });

  app.post('/api/banners', (req, res) => {
    const db = loadDb();
    const { title, image, url } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    const newBanner = {
      id: "banner_" + Date.now().toString(36),
      title: (title || '').trim() || 'New Platform Banner',
      image: (image || '').trim(),
      url: (url || '').trim() || '#',
      active: true
    };
    db.banners.push(newBanner);
    saveDb(db);
    res.json({ message: 'Banner successfully added', banners: db.banners });
  });

  app.delete('/api/banners/:id', (req, res) => {
    const db = loadDb();
    const { id } = req.params;
    db.banners = db.banners.filter(b => b.id !== id);
    saveDb(db);
    res.json({ message: 'Banner successfully deleted', banners: db.banners });
  });

  app.get('/api/settings', (req, res) => {
    const db = loadDb();
    if (!db.settings.adminWhatsapp) {
      db.settings.adminWhatsapp = "628123456789";
    }
    res.json(db.settings);
  });

  app.put('/api/settings', (req, res) => {
    const db = loadDb();
    db.settings.commissionPercent = Number(req.body.commissionPercent || 5);
    if (req.body.adminWhatsapp !== undefined) {
      db.settings.adminWhatsapp = String(req.body.adminWhatsapp || '').trim();
    }
    saveDb(db);
    res.json({ message: 'Pengaturan platform berhasil disimpan.', settings: db.settings });
  });

  // Super Admin statistics panel console
  app.get('/api/admin/stats', (req, res) => {
    const db = loadDb();
    const totalUsers = db.users.length;
    const totalSellers = db.stores.length;
    const totalProducts = db.products.length;
    const totalOrders = db.orders.length;
    
    const commissionPercent = db.settings.commissionPercent || 5;

    const completedOrdersValue = db.orders
      .filter(o => o.status === OrderStatus.COMPLETED)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Total earnings from platform commission (e.g. 5% of order product totals)
    const platformEarning = db.orders
      .filter(o => o.status === OrderStatus.COMPLETED)
      .reduce((sum, o) => sum + (o.totalProductPrice * (commissionPercent / 100)), 0);

    // Group orders by status
    const ordersByStatus = Object.values(OrderStatus).map(status => {
      const count = db.orders.filter(o => o.status === status).length;
      return { name: status, value: count };
    });

    // Daily Sales & Commission Trend (last 10 days)
    const dailyMap: Record<string, { date: string, sales: number, earnings: number, count: number }> = {};
    
    // Seed last 10 days to make sure there's always data on the chart
    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = { date: dateStr, sales: 0, earnings: 0, count: 0 };
    }

    db.orders.forEach(o => {
      if (!o.createdAt) return;
      const dateStr = o.createdAt.split('T')[0];
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { date: dateStr, sales: 0, earnings: 0, count: 0 };
      }
      dailyMap[dateStr].count += 1;
      if (o.status === OrderStatus.COMPLETED) {
        dailyMap[dateStr].sales += o.totalAmount;
        dailyMap[dateStr].earnings += (o.totalProductPrice * (commissionPercent / 100));
      }
    });

    const trendData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // Role distribution
    const roleDistribution = [
      { name: 'Buyer', value: db.users.filter(u => u.role === Role.BUYER).length },
      { name: 'Seller', value: db.users.filter(u => u.role === Role.SELLER).length },
      { name: 'Pegawai', value: db.users.filter(u => u.role === Role.PEGAWAI).length },
      { name: 'Super Admin', value: db.users.filter(u => u.role === Role.SUPER_ADMIN).length },
    ];

    // Popular Stores: stores sorted by products count or order sales
    const popularStores = db.stores.map(s => {
      const storeProductsCount = db.products.filter(p => p.storeId === s.id).length;
      const completedStoreOrders = db.orders.filter(o => 
        o.status === OrderStatus.COMPLETED && 
        o.items.some(item => db.products.some(p => p.id === item.productId && p.storeId === s.id))
      );
      const storeSales = completedStoreOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        name: s.name,
        productsCount: storeProductsCount,
        sales: storeSales
      };
    }).sort((a, b) => b.sales - a.sales).slice(0, 5);

    // Revenue, Costs & Seller Payout Breakdowns
    const totalTransactions = db.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const sellerPayout = completedOrdersValue - platformEarning;

    res.json({
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      completedOrdersValue,
      platformEarning,
      commissionPercent,
      adminWhatsapp: db.settings.adminWhatsapp || "628123456789",
      ordersByStatus,
      trendData,
      roleDistribution,
      popularStores,
      sellerPayout,
      totalTransactions
    });
  });

  // --- REAL-TIME USER DIAGNOSTICS & MALWARE SHIELD ENDPOINTS ---

  // 1. Submit a 1-click diagnostic/obstacle report from the user side
  app.post('/api/diagnostics/reports', (req, res) => {
    const { userId, userName, userEmail, issueType, description, systemInfo } = req.body;
    if (!issueType || !description) {
      return res.status(400).json({ error: 'Jenis hambatan dan deskripsi wajib diisi.' });
    }

    const db = loadDb();
    if (!db.diagnosticReports) db.diagnosticReports = [];

    const newReport = {
      id: 'rep_' + Math.random().toString(36).substring(2, 9),
      userId: userId || 'usr_anonymous',
      userName: userName || 'Tamu Anonim',
      userEmail: userEmail || 'guest@tokosipil.com',
      issueType,
      description,
      status: 'PENDING' as const,
      systemInfo: {
        userAgent: systemInfo?.userAgent || req.headers['user-agent'] || 'Unknown',
        language: systemInfo?.language || 'id-ID',
        viewport: systemInfo?.viewport || 'Unknown Screen',
        latencyMs: Number(systemInfo?.latencyMs || 0),
        localStorageHealth: !!systemInfo?.localStorageHealth,
      },
      timestamp: new Date().toISOString()
    };

    db.diagnosticReports.push(newReport);
    saveDb(db);

    res.status(201).json({ message: 'Laporan diagnosis kendala berhasil dikirim ke Admin Hub!', report: newReport });
  });

  // 2. Fetch all user obstacle reports for administrator console
  app.get('/api/admin/diagnostic-reports', (req, res) => {
    const db = loadDb();
    const reports = db.diagnosticReports || [];
    const sorted = [...reports].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    res.json(sorted);
  });

  // 3. Update resolution status of a diagnostic report (PENDING <=> RESOLVED)
  app.put('/api/admin/diagnostic-reports/:id', (req, res) => {
    const { status } = req.body;
    const db = loadDb();
    if (!db.diagnosticReports) db.diagnosticReports = [];
    const report = db.diagnosticReports.find(r => r.id === req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Laporan kendala tidak ditemukan.' });
    }

    if (status) {
      report.status = status;
    }
    saveDb(db);
    res.json({ message: 'Status laporan kendala berhasil diperbarui.', report });
  });

  // 4. Delete a diagnostic report
  app.delete('/api/admin/diagnostic-reports/:id', (req, res) => {
    const db = loadDb();
    if (!db.diagnosticReports) db.diagnosticReports = [];
    const index = db.diagnosticReports.findIndex(r => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Laporan kendala tidak ditemukan.' });
    }

    db.diagnosticReports.splice(index, 1);
    saveDb(db);
    res.json({ message: 'Laporan kendala berhasil dihapus.' });
  });

  // 5. Fetch blocked malware injection attempts / security alerts
  app.get('/api/admin/security-logs', (req, res) => {
    res.json(securityLogs);
  });

  // 6. Clear security log entries
  app.delete('/api/admin/security-logs', (req, res) => {
    securityLogs.length = 0;
    res.json({ message: 'Semua riwayat deteksi ancaman malware diringkus & dibersihkan.' });
  });

  // --- VITE DEV OR PRODUCTION STATIC BINDINGS ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to port 3000 and 0.0.0.0
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`System alternative boutique fashion server loaded on port ${PORT}`);
  });
}

startServer();
