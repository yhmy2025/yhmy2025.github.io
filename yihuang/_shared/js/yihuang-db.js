/**
 * 谊璜贸易系统 - 统一数据层 v1.0
 * yihuang-db.js — 关系型数据关联 + 从旧独立存储迁移
 *
 * 主数据模型:
 *   clients.id <-> orders.clientId
 *   suppliers.id <-> products.supplierId
 *   orders.productId <-> products.id
 *   inventory.productId <-> products.id
 */
(function() {
  'use strict';

  const DB_VERSION = '1.0';
  const DB_KEY = 'yihuang_db_version';

  // ====== 数据键定义 ======
  const KEYS = {
    clients:    'yihuang_clients',
    orders:     'yihuang_orders',
    finance:    'yihuang_finance',
    tasks:      'yihuang_tasks',
    suppliers:  'yihuang_suppliers',
    inventory:  'yihuang_inventory',
    products:   'yihuang_products',
    quotes:     'yihuang_quotes',
    dashboard:  'yihuang_dashboard',
  };

  // ====== 核心 CRUD ======
  function _get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch(e) {
      return [];
    }
  }

  function _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function _genId() {
    return 'yh_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  }

  // ====== 公共 API ======
  window.YH = {
    // --- Clients ---
    getClients() { return _get(KEYS.clients); },
    saveClients(data) { _set(KEYS.clients, data); },
    addClient(obj) {
      const list = _get(KEYS.clients);
      const item = { id: _genId(), ...obj, createdAt: new Date().toISOString(), level: obj.level || 1, source: obj.source || '' };
      list.push(item);
      _set(KEYS.clients, list);
      return item;
    },
    getClientById(id) { return _get(KEYS.clients).find(c => c.id === id); },

    // --- Orders ---
    getOrders() { return _get(KEYS.orders); },
    saveOrders(data) { _set(KEYS.orders, data); },
    addOrder(obj) {
      const list = _get(KEYS.orders);
      const item = { id: _genId(), ...obj, createdAt: new Date().toISOString(), status: obj.status || 'pending' };
      list.push(item);
      _set(KEYS.orders, list);
      return item;
    },
    getOrdersByClient(clientId) { return _get(KEYS.orders).filter(o => o.clientId === clientId); },

    // --- Products ---
    getProducts() { return _get(KEYS.products); },
    saveProducts(data) { _set(KEYS.products, data); },
    addProduct(obj) {
      const list = _get(KEYS.products);
      const item = { id: _genId(), ...obj, createdAt: new Date().toISOString() };
      list.push(item);
      _set(KEYS.products, list);
      return item;
    },
    getProductsBySupplier(supplierId) { return _get(KEYS.products).filter(p => p.supplierId === supplierId); },

    // --- Suppliers ---
    getSuppliers() { return _get(KEYS.suppliers); },
    saveSuppliers(data) { _set(KEYS.suppliers, data); },
    addSupplier(obj) {
      const list = _get(KEYS.suppliers);
      const item = { id: _genId(), ...obj, createdAt: new Date().toISOString(), score: obj.score || 0, scores: obj.scores || {} };
      list.push(item);
      _set(KEYS.suppliers, list);
      return item;
    },
    getSupplierById(id) { return _get(KEYS.suppliers).find(s => s.id === id); },

    // --- Finance ---
    getFinance() { return _get(KEYS.finance); },
    saveFinance(data) { _set(KEYS.finance, data); },
    addTransaction(obj) {
      const list = _get(KEYS.finance);
      const item = { id: _genId(), ...obj, createdAt: new Date().toISOString(), type: obj.type || 'income' };
      list.push(item);
      _set(KEYS.finance, list);
      return item;
    },
    getProfit() {
      const list = _get(KEYS.finance);
      const income = list.filter(t => t.type === 'income').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      const expense = list.filter(t => t.type === 'expense').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      return { income, expense, profit: income - expense };
    },

    // --- Tasks ---
    getTasks() { return _get(KEYS.tasks); },
    saveTasks(data) { _set(KEYS.tasks, data); },
    addTask(obj) {
      const list = _get(KEYS.tasks);
      const item = { id: _genId(), ...obj, createdAt: new Date().toISOString(), status: obj.status || 'pending' };
      list.push(item);
      _set(KEYS.tasks, list);
      return item;
    },
    getPendingTasks() { return _get(KEYS.tasks).filter(t => t.status === 'pending'); },

    // --- Inventory ---
    getInventory() { return _get(KEYS.inventory); },
    saveInventory(data) { _set(KEYS.inventory, data); },
    addInventoryItem(obj) {
      const list = _get(KEYS.inventory);
      const item = { id: _genId(), ...obj, updatedAt: new Date().toISOString() };
      list.push(item);
      _set(KEYS.inventory, list);
      return item;
    },
    getLowStockItems() {
      return _get(KEYS.inventory).filter(i => i.quantity <= (i.safetyStock || 10));
    },

    // --- Quotes ---
    getQuotes() { return _get(KEYS.quotes); },
    saveQuotes(data) { _set(KEYS.quotes, data); },
    addQuote(obj) {
      const list = _get(KEYS.quotes);
      const item = { id: _genId(), ...obj, createdAt: new Date().toISOString() };
      list.push(item);
      _set(KEYS.quotes, list);
      return item;
    },

    // --- Supplier Scoring ---
    scoreSupplier(supplierId, scores) {
      const list = _get(KEYS.suppliers);
      const idx = list.findIndex(s => s.id === supplierId);
      if (idx === -1) return null;
      const weights = { quality: 0.35, delivery: 0.30, price: 0.20, service: 0.15 };
      let total = 0;
      for (let [k, w] of Object.entries(weights)) {
        total += (scores[k] || 3) * w;
      }
      list[idx].scores = scores;
      list[idx].score = Math.round(total * 10) / 10;
      list[idx].scoredAt = new Date().toISOString();
      _set(KEYS.suppliers, list);
      return list[idx];
    },

    // --- Dashboard Stats ---
    getDashboardStats() {
      return {
        tasks: _get(KEYS.tasks).filter(t => t.status === 'pending').length,
        clients: _get(KEYS.clients).filter(c => c.level >= 3).length, // negotiating
        deals: _get(KEYS.orders).filter(o => o.status !== 'cancelled' && o.status !== 'completed').length,
        profit: this.getProfit().profit,
        lowStock: this.getLowStockItems().length,
      };
    },

    // --- Migration ---
    migrate() {
      const currentVersion = localStorage.getItem(DB_KEY);
      if (currentVersion === DB_VERSION) return false;

      // Ensure all keys exist
      Object.values(KEYS).forEach(key => {
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, '[]');
        }
      });

      // Add productId to inventory items if missing
      const inv = _get(KEYS.inventory);
      if (inv.length > 0) {
        let changed = false;
        inv.forEach(item => {
          if (!item.productId) {
            item.productId = '';
            changed = true;
          }
        });
        if (changed) _set(KEYS.inventory, inv);
      }

      localStorage.setItem(DB_KEY, DB_VERSION);
      return true;
    },

    // --- Export ---
    exportAll() {
      const data = {};
      Object.entries(KEYS).forEach(([name, key]) => {
        data[name] = _get(key);
      });
      return data;
    },

    importAll(data) {
      Object.entries(KEYS).forEach(([name, key]) => {
        if (data[name]) {
          _set(key, data[name]);
        }
      });
    },

    KEYS: KEYS,
    genId: _genId,
  };

  // Auto-migrate on load
  YH.migrate();

  console.log('[yihuang-db] v' + DB_VERSION + ' initialized. Keys:', Object.keys(KEYS).length);
})();
