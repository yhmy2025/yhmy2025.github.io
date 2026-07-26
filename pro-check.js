/**
 * yhmy_tools Pro 验证模块 v1.0
 * 用法: <script src="/pro-check.js"></script>
 * API: Pro.isPro() | Pro.getDailyUsage() | Pro.incrementUsage() | Pro.isOverLimit()
 */
(function() {
  'use strict';

  var PRO_KEY = 'yhmy_pro_status';
  var USAGE_KEY = 'yhmy_usage';
  var DAILY_LIMIT = 3;

  // 预设Pro激活码（后期可扩展为动态验证）
  var VALID_TOKENS = ['PRO-YHMY-2026-FREE30'];

  function _getPro() {
    try {
      return JSON.parse(localStorage.getItem(PRO_KEY)) || { active: false, token: '', activatedAt: null };
    } catch(e) {
      return { active: false, token: '', activatedAt: null };
    }
  }

  function _setPro(data) {
    localStorage.setItem(PRO_KEY, JSON.stringify(data));
  }

  function _todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  function _getUsage() {
    try {
      return JSON.parse(localStorage.getItem(USAGE_KEY)) || {};
    } catch(e) {
      return {};
    }
  }

  function _setUsage(data) {
    localStorage.setItem(USAGE_KEY, JSON.stringify(data));
  }

  window.Pro = {
    /** 是否Pro用户 */
    isPro: function() {
      return _getPro().active === true;
    },

    /** 激活Pro */
    activate: function(token) {
      if (VALID_TOKENS.indexOf(token) === -1) {
        return { ok: false, error: '激活码无效' };
      }
      _setPro({ active: true, token: token, activatedAt: new Date().toISOString() });
      return { ok: true };
    },

    /** 取消Pro */
    deactivate: function() {
      _setPro({ active: false, token: '', activatedAt: null });
    },

    /** 获取Pro信息 */
    getInfo: function() {
      return _getPro();
    },

    /** 今日已使用次数 */
    getDailyUsage: function() {
      var usage = _getUsage();
      return usage[_todayKey()] || 0;
    },

    /** 增加计数 */
    incrementUsage: function() {
      var usage = _getUsage();
      var key = _todayKey();
      usage[key] = (usage[key] || 0) + 1;
      _setUsage(usage);
      return usage[key];
    },

    /** 是否超出免费配额 */
    isOverLimit: function() {
      if (this.isPro()) return false;
      return this.getDailyUsage() >= DAILY_LIMIT;
    },

    /** 剩余免费次数 */
    remainingFree: function() {
      if (this.isPro()) return Infinity;
      return Math.max(0, DAILY_LIMIT - this.getDailyUsage());
    },

    /** 每日配额数 */
    getLimit: function() {
      return DAILY_LIMIT;
    },

    /** 配额使用后检查（先计数再判断） */
    checkAndUse: function() {
      if (this.isPro()) {
        this.incrementUsage();
        return { ok: true, remaining: Infinity, isPro: true };
      }
      var used = this.getDailyUsage();
      if (used >= DAILY_LIMIT) {
        return { ok: false, remaining: 0, isPro: false, used: used, limit: DAILY_LIMIT };
      }
      this.incrementUsage();
      return { ok: true, remaining: DAILY_LIMIT - used - 1, isPro: false, used: used + 1, limit: DAILY_LIMIT };
    }
  };

  console.log('[pro-check] Loaded. Pro:', Pro.isPro(), 'Usage:', Pro.getDailyUsage() + '/' + DAILY_LIMIT);
})();
