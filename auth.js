/**
 * AgroShield Pro — Rol Tabanlı Yetkilendirme (RBAC) ve Güvenlik Doğrulama Modülü
 */

function getCurrentRoleObj(state) {
  return state.roles[state.currentUserRole] || state.roles.viewer;
}

function hasPermission(state, permissionKey) {
  const role = getCurrentRoleObj(state);
  return Array.isArray(role.permissions) && role.permissions.includes(permissionKey);
}

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

function logSecurityEvent(state, category, title, message, type) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts = `2026-10-15 ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  state.events.unshift({
    id: 'OLAY-' + Math.floor(1000 + Math.random() * 9000),
    type: type || 'info',
    category: category,
    title: title,
    message: message,
    timestamp: ts,
    read: false
  });
  saveAppState(state);
}
