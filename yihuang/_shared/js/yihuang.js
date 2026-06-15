/* ═══════════════════════════════════════
   谊璜贸易 · 共享JavaScript工具库
   Yihuang Trade System — Shared JS Utils
   ═══════════════════════════════════════ */

// ───── 数据持久化 ─────
function saveData(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); return true; }
  catch(e) { console.warn('saveData failed:', e); return false; }
}

function loadData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { console.warn('loadData failed:', e); return null; }
}

function removeData(key) {
  try { localStorage.removeItem(key); return true; }
  catch(e) { return false; }
}

// ───── 工具函数 ─────
function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,6);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function now() {
  return new Date().toISOString();
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit'});
}

function formatMoney(amount, currency='¥') {
  return currency + Number(amount).toFixed(2);
}

function debounce(fn, ms=300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// ───── 部门信息 ─────
const DEPARTMENTS = {
  BIZ:    {name:'业务部',         icon:'💼', color:'#818cf8'},
  SUPPLY: {name:'供应链部',       icon:'📦', color:'#22c55e'},
  OPS:    {name:'运营中台',       icon:'🔧', color:'#38bdf8'},
  FIN:    {name:'财务部',         icon:'💰', color:'#f59e0b'},
  LEGAL:  {name:'法务合规部',     icon:'⚖️', color:'#ef4444'},
  MKT:    {name:'市场营销部',     icon:'📢', color:'#f472b6'},
  HR:     {name:'行政人事部',     icon:'📋', color:'#94a3b8'},
  IT:     {name:'技术信息部',     icon:'🖥', color:'#a78bfa'},
};

function deptLabel(id) {
  return DEPARTMENTS[id] ? DEPARTMENTS[id].name : id;
}

function deptColor(id) {
  return DEPARTMENTS[id] ? DEPARTMENTS[id].color : '#475569';
}

// ───── 通知系统 ─────
function showToast(msg, duration=2500) {
  let el = document.getElementById('yihuang-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'yihuang-toast';
    el.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.85);color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;z-index:9999;opacity:0;transition:opacity .3s;pointer-events:none;max-width:90%;text-align:center';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.opacity = '0'; }, duration);
}

// ───── 导出/备份 ─────
function exportJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename || ('yihuang_export_' + today() + '.json');
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJSON(callback) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        callback(data);
        showToast('✅ 数据导入成功');
      } catch(e) {
        showToast('❌ 导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ───── 日期计算 ─────
function daysBetween(d1, d2) {
  const a = new Date(d1), b = new Date(d2);
  return Math.round((b - a) / (1000*60*60*24));
}

function isToday(dateStr) {
  return dateStr === today();
}

function isThisWeek(dateStr) {
  const d = new Date(dateStr);
  const nowDate = new Date();
  const startOfWeek = new Date(nowDate);
  startOfWeek.setDate(nowDate.getDate() - nowDate.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return d >= startOfWeek && d <= endOfWeek;
}
