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
    // --- Audit Log ---
    addAuditLog(entity, action, detail) {
      const list = _get('yihuang_audit_log');
      const log = { id: _genId(), entity, action, detail: detail || '', timestamp: new Date().toISOString(), operator: 'system' };
      list.push(log);
      _set('yihuang_audit_log', list);
      return log;
    },
    getAuditLog(filter) {
      let list = _get('yihuang_audit_log');
      if (filter && filter.entity) list = list.filter(l => l.entity === filter.entity);
      if (filter && filter.action) list = list.filter(l => l.action === filter.action);
      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return list;
    },

    // --- Clients ---
    getClients() { return _get(KEYS.clients); },
    saveClients(data) { _set(KEYS.clients, data); },
    addClient(obj) {
      const list = _get(KEYS.clients);
      const item = { id: _genId(), ...obj, createdAt: new Date().toISOString(), level: obj.level || 1, source: obj.source || '' };
      list.push(item);
      _set(KEYS.clients, list);
      this.addAuditLog('clients', 'create', '新增客户: ' + (obj.name || item.id));
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
      this.addAuditLog('orders', 'create', '新增订单: ' + (obj.client || '') + ' ¥' + (obj.amount || 0));
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
      this.addAuditLog('products', 'create', '新增产品: ' + (obj.name || obj.sku || item.id));
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
      this.addAuditLog('suppliers', 'create', '新增供应商: ' + (obj.name || item.id));
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
      this.addAuditLog('finance', 'create', (obj.type==='expense'?'支出':'收入') + ': ' + (obj.category||'') + ' ¥' + (obj.amount || 0));
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
      this.addAuditLog('tasks', 'create', '新增任务: ' + (obj.title || item.id));
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
      this.addAuditLog('inventory', 'create', '新增库存: ' + (obj.name || obj.productName || item.id));
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
      this.addAuditLog('quotes', 'create', '新增报价: ' + (obj.clientName || obj.client || item.id));
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
      this.addAuditLog('suppliers', 'update', '评分供应商: ' + (list[idx].name || supplierId) + ' → ' + list[idx].score + '分');
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
      // Ensure audit log key exists
      if (!localStorage.getItem('yihuang_audit_log')) {
        localStorage.setItem('yihuang_audit_log', '[]');
      }

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
