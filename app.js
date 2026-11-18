/**
 * AgroShield Pro — Ana Uygulama Kontrolcüsü ve Etkileşim Yönetimi
 */

let appState = loadAppState();
let currentTab = 'dashboard';
let selectedPoleId = 'KD-103';
let selectedFieldId = 'PARSEL-B2';
let reportPeriod = 'weekly';

function showToast(title, message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const colors = {
    success: 'bg-emerald-900 border-emerald-500 text-emerald-50',
    warning: 'bg-amber-900 border-amber-500 text-amber-50',
    error: 'bg-red-900 border-red-500 text-red-50',
    info: 'bg-slate-900 border-sky-500 text-slate-50'
  };
  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ'
  };

  const el = document.createElement('div');
  el.className = `flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-200 max-w-md ${colors[type] || colors.info}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `
    <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/15 font-bold text-sm shrink-0">${icons[type] || 'ℹ'}</span>
    <div class="text-xs leading-relaxed">
      <div class="font-bold text-sm">${sanitizeInput(title)}</div>
      <div class="opacity-90 mt-0.5">${sanitizeInput(message)}</div>
    </div>
  `;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 250);
  }, 4200);
}

function getRiskBadgeHtml(risk) {
  if (risk === 'Kritik') return `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold badge-critical">▲ KRİTİK RİSK</span>`;
  if (risk === 'Yüksek') return `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold badge-high">▲ YÜKSEK RİSK</span>`;
  if (risk === 'Orta') return `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold badge-medium">● ORTA RİSK</span>`;
  if (risk === 'Düşük') return `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold badge-low">▼ DÜŞÜK RİSK</span>`;
  return `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold badge-beneficial">★ YARARLI / KORUMA</span>`;
}

function getPoleStatusBadgeHtml(status) {
  if (status === 'active') {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300"><span class="w-2 h-2 rounded-full bg-emerald-600"></span>● Aktif Çalışıyor</span>`;
  }
  if (status === 'offline') {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300"><span class="w-2 h-2 rounded-full bg-red-600"></span>✕ Çevrim Dışı</span>`;
  }
  return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300"><span class="w-2 h-2 rounded-full bg-amber-600"></span>⚙ Bakımda</span>`;
}

function getWorkflowBadgeHtml(status) {
  if (status === 'Bekleyen' || status === 'Onay Bekliyor') {
    return `<span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">⏳ ${status}</span>`;
  }
  if (status === 'Onaylanan' || status === 'Uygulamada (Simülasyon)') {
    return `<span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-100 text-sky-900 border border-sky-300">▶ ${status}</span>`;
  }
  if (status === 'Tamamlanan' || status === 'Tamamlandı') {
    return `<span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">✓ ${status}</span>`;
  }
  return `<span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-900 border border-red-300">✕ ${status}</span>`;
}

function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.tab-section').forEach((sec) => {
    sec.classList.add('hidden');
  });
  const target = document.getElementById('view-' + tabId);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('nav-item-active');
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.classList.remove('nav-item-active');
      btn.removeAttribute('aria-current');
    }
  });

  // Mobil menüyü kapat
  const mobileDrawer = document.getElementById('mobile-sidebar');
  if (mobileDrawer) mobileDrawer.classList.add('hidden');

  renderAll();
}

function toggleMobileMenu() {
  const mobileDrawer = document.getElementById('mobile-sidebar');
  if (mobileDrawer) {
    mobileDrawer.classList.toggle('hidden');
  }
}

function changeUserRole(roleKey) {
  if (!appState.roles[roleKey]) return;
  appState.currentUserRole = roleKey;
  saveAppState(appState);
  const roleObj = getCurrentRoleObj(appState);
  logSecurityEvent(appState, 'Yetki Değişimi', `Aktif Kullanıcı Rolü Değiştirildi: ${roleObj.name}`, `Kullanıcı oturum yetkisi '${roleObj.title}' seviyesine güncellendi.`, 'info');
  showToast('Kullanıcı Rolü Güncellendi', `Aktif yetki: ${roleObj.title}`, 'info');
  renderAll();
}

function setConnectionSimulation(mode) {
  appState.systemMeta.connectionState = mode;
  saveAppState(appState);
  if (mode === 'offline') {
    showToast('Bağlantı Kesildi (Simülasyon)', 'Saha ağ geçidi bağlantısı kesildi. Uygulama yerel önbellek (localStorage) verileriyle çevrim dışı modda çalışıyor.', 'warning');
  } else if (mode === 'api_error') {
    showToast('API Hatası (503 Simülasyonu)', 'Merkezi sunucu yanıt vermiyor. Hata kurtarma ekranı ve güvenli kilit devreye alındı.', 'error');
  } else {
    showToast('Bağlantı Normale Döndü', 'Telemetri simülasyon akışı ve API servisleri aktif.', 'success');
  }
  renderAll();
}

function openEmergencyStopModal() {
  const modal = document.getElementById('modal-estop');
  if (modal) modal.classList.remove('hidden');
}

function closeEmergencyStopModal() {
  const modal = document.getElementById('modal-estop');
  if (modal) modal.classList.add('hidden');
}

function confirmEmergencyStop() {
  if (!hasPermission(appState, 'trigger_estop')) {
    showToast('Yetki Hatası', 'Acil durdurma komutu için Saha Operatörü veya Yönetici yetkisi gereklidir.', 'error');
    return;
  }
  const reasonEl = document.getElementById('estop-reason-input');
  const reason = sanitizeInput(reasonEl ? reasonEl.value : '') || 'Operatör tarafından manuel acil durdurma tetiklendi';

  appState.systemMeta.emergencyStopActive = true;
  appState.systemMeta.emergencyStopReason = reason;
  appState.systemMeta.emergencyStopTime = '2026-10-15 18:58:00';

  // Aktif simülasyon uygulamalarını durdur
  appState.chemicalApplications.forEach((app) => {
    if (app.status === 'Uygulamada (Simülasyon)' || app.status === 'Onay Bekliyor') {
      app.status = 'İptal / Durduruldu';
      app.safetyWarnings = `[ACİL DURDURMA İLE KİLİTLENDİ] Neden: ${reason}`;
    }
  });

  logSecurityEvent(appState, 'ACİL DURDURMA (E-STOP)', 'Tüm Saha Müdahale ve Kimyasal Görevleri Durduruldu', `Tetikleyen: ${getCurrentRoleObj(appState).name} | Gerekçe: ${reason}`, 'critical');
  saveAppState(appState);
  closeEmergencyStopModal();
  showToast('ACİL DURDURMA AKTİF!', 'Tüm saha müdahale birimleri güvenli kilide alındı ve aktif görevler iptal edildi.', 'error');
  renderAll();
}

function releaseEmergencyStop() {
  if (!hasPermission(appState, 'reset_estop')) {
    showToast('Yetkisiz İşlem', 'Acil Durdurma kilidini yalnızca Yetkili Ziraat Mühendisi (Yönetici) kaldırabilir.', 'error');
    return;
  }
  appState.systemMeta.emergencyStopActive = false;
  appState.systemMeta.emergencyStopReason = '';
  logSecurityEvent(appState, 'Güvenlik Kilidi Açıldı', 'Acil Durdurma Durumu Normale Döndürüldü', 'Yönetici kontrolü sonrasında sistem normal gözlem moduna geçirildi.', 'success');
  saveAppState(appState);
  showToast('Sistem Normale Döndü', 'Acil durdurma kilidi kaldırıldı.', 'success');
  renderAll();
}

function renderTopBanners() {
  const roleObj = getCurrentRoleObj(appState);
  const roleSelect = document.getElementById('role-selector');
  if (roleSelect) roleSelect.value = appState.currentUserRole;

  const roleBadge = document.getElementById('active-role-badge');
  if (roleBadge) {
    roleBadge.className = `hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${roleObj.badgeColor}`;
    roleBadge.textContent = roleObj.title;
  }

  // Bağlantı & API Hata Durumu Bandı
  const connBanner = document.getElementById('connection-status-banner');
  if (connBanner) {
    if (appState.systemMeta.connectionState === 'offline') {
      connBanner.className = 'bg-amber-800 text-amber-50 px-4 py-2.5 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2 border-b border-amber-600';
      connBanner.innerHTML = `
        <div class="flex items-center gap-2 font-medium">
          <span class="font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-200">ÇEVRİM DIŞI MOD</span>
          <span>Saha ağ geçidi ile bağlantı kesildi. Son kaydedilen önbellek verileri görüntüleniyor; uzaktan donanım komutları devre dışı bırakıldı.</span>
        </div>
        <button onclick="setConnectionSimulation('online')" class="px-3 py-1 rounded bg-white text-amber-900 font-bold text-xs hover:bg-amber-100">Bağlantıyı Yeniden Kur</button>
      `;
    } else if (appState.systemMeta.connectionState === 'api_error') {
      connBanner.className = 'bg-red-800 text-red-50 px-4 py-2.5 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2 border-b border-red-600';
      connBanner.innerHTML = `
        <div class="flex items-center gap-2 font-medium">
          <span class="font-bold px-2 py-0.5 rounded bg-red-950 text-red-200">API HATASI (HTTP 503)</span>
          <span>Telemetri servisi yanıt vermiyor. Hata izolasyonu devrede; mevcut kayıtları inceleyebilir ve CSV rapor alabilirsiniz.</span>
        </div>
        <button onclick="setConnectionSimulation('online')" class="px-3 py-1 rounded bg-white text-red-900 font-bold text-xs hover:bg-red-100">API Servisini Yeniden Dene</button>
      `;
    } else {
      connBanner.className = 'bg-emerald-950 text-emerald-100 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800';
      connBanner.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 font-semibold">SİMÜLASYON MODU AKTİF</span>
          <span class="text-emerald-200">Gerçek kamera, yapay zekâ kenar birimi ve ilaçlama donanımı bağlı değildir. Veriler şeffaf simülasyon ve onay akışı doğrulaması içindir.</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-emerald-300 hidden md:inline">Hata Yönetimi Testi:</span>
          <button onclick="setConnectionSimulation('offline')" class="px-2 py-0.5 rounded bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700">Çevrim Dışı Test</button>
          <button onclick="setConnectionSimulation('api_error')" class="px-2 py-0.5 rounded bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700">API Hatası Test</button>
        </div>
      `;
    }
  }

  // Acil Durdurma (E-Stop) Bandı
  const estopBanner = document.getElementById('estop-active-banner');
  if (estopBanner) {
    if (appState.systemMeta.emergencyStopActive) {
      estopBanner.classList.remove('hidden');
      const reasonSpan = document.getElementById('estop-banner-reason');
      if (reasonSpan) reasonSpan.textContent = appState.systemMeta.emergencyStopReason;
    } else {
      estopBanner.classList.add('hidden');
    }
  }

  // Okunmamış bildirim sayacı
  const unreadCount = appState.events.filter(e => !e.read).length;
  const badgeEl = document.getElementById('unread-events-count');
  if (badgeEl) {
    badgeEl.textContent = String(unreadCount);
    badgeEl.className = unreadCount > 0
      ? 'ml-1 px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-red-600 text-white'
      : 'ml-1 px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-600 text-slate-200';
  }
}

function renderDashboardView() {
  const totalPoles = appState.poles.length;
  const activePoles = appState.poles.filter(p => p.status === 'active').length;
  const offlinePoles = appState.poles.filter(p => p.status === 'offline').length;
  const maintPoles = appState.poles.filter(p => p.status === 'maintenance').length;

  const todayDetections = appState.detections.filter(d => d.dateOnly === '2026-10-15').length;
  const weeklyDetections = appState.detections.length + 60; // 7 günlük toplam

  const pendingDetections = appState.detections.filter(d => d.status === 'Bekleyen').length;
  const criticalCount = appState.detections.filter(d => d.riskLevel === 'Kritik' || d.riskLevel === 'Yüksek').length;

  const kpiContainer = document.getElementById('dashboard-kpi-grid');
  if (kpiContainer) {
    const sysHealthy = !appState.systemMeta.emergencyStopActive && appState.systemMeta.connectionState === 'online';
    kpiContainer.innerHTML = `
      <!-- KPI 1: Sistem Genel Çalışma Durumu -->
      <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Sistem Çalışma Durumu</span>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold ${sysHealthy ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
            ${appState.systemMeta.emergencyStopActive ? '■ ACİL DURDURULDU' : (appState.systemMeta.connectionState === 'online' ? '● SİSTEM AKTİF' : '⚠ BAĞLANTI UYARISI')}
          </span>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-extrabold text-slate-900">%${appState.systemMeta.uptimePercent} <span class="text-sm font-medium text-slate-500">Çalışma Süresi</span></div>
          <p class="text-xs text-slate-600 mt-1">Son Senkronizasyon: ${appState.systemMeta.lastSyncTime} • Gecikme: ${appState.systemMeta.telemetryLatencyMs} ms</p>
        </div>
      </div>

      <!-- KPI 2: Kontrol Direkleri Durumu -->
      <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Kontrol Direkleri</span>
          <button onclick="switchTab('map')" class="text-xs font-semibold text-emerald-700 hover:underline">Haritada Gör →</button>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-extrabold text-slate-900">${totalPoles} <span class="text-sm font-medium text-slate-500">Toplam Direk</span></div>
          <div class="flex flex-wrap items-center gap-2 mt-2 text-xs font-semibold">
            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">● ${activePoles} Aktif</span>
            <span class="px-2 py-0.5 rounded bg-red-100 text-red-800">✕ ${offlinePoles} Çevrim Dışı</span>
            <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800">⚙ ${maintPoles} Bakımda</span>
          </div>
        </div>
      </div>

      <!-- KPI 3: Günlük ve Haftalık Canlı Tespitleri -->
      <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Canlı Tespit İstatistiği</span>
          <button onclick="switchTab('detections')" class="text-xs font-semibold text-emerald-700 hover:underline">Kayıtları İncele →</button>
        </div>
        <div class="mt-3">
          <div class="flex items-baseline gap-4">
            <div>
              <span class="text-2xl font-extrabold text-slate-900">${todayDetections}</span>
              <span class="text-xs font-medium text-slate-500 block">Günlük (Bugün)</span>
            </div>
            <div class="border-l border-slate-200 pl-4">
              <span class="text-2xl font-extrabold text-emerald-800">${weeklyDetections}</span>
              <span class="text-xs font-medium text-slate-500 block">Haftalık (Son 7 Gün)</span>
            </div>
          </div>
          <p class="text-xs text-amber-800 font-medium mt-2">⏳ Onay bekleyen ${pendingDetections} analiz kaydı bulunuyor</p>
        </div>
      </div>

      <!-- KPI 4: Bitkilere Yönelik Tahmini Risk Seviyesi -->
      <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Tahmini Bitki Risk Seviyesi</span>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold badge-high">▲ ORTA-YÜKSEK</span>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-extrabold text-red-700">${criticalCount} <span class="text-sm font-medium text-slate-600">Yüksek/Kritik Bulgu</span></div>
          <p class="text-xs text-slate-600 mt-1">En yüksek risk: <strong>B-2 Güney Domates</strong> (Tuta absoluta & Yaprak Kurdu)</p>
        </div>
      </div>
    `;
  }

  // Son Tespit Edilen Canlılar Tablosu
  const recentDetBody = document.getElementById('dashboard-recent-detections');
  if (recentDetBody) {
    recentDetBody.innerHTML = appState.detections.slice(0, 5).map((d) => `
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="py-2.5 px-3 font-semibold text-slate-900">${sanitizeInput(d.species)}<div class="text-[11px] font-normal text-slate-500">${sanitizeInput(d.category)}</div></td>
        <td class="py-2.5 px-3 text-slate-700"><span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100">${d.poleId}</span></td>
        <td class="py-2.5 px-3 text-slate-600 text-xs">${d.timestamp}</td>
        <td class="py-2.5 px-3 font-semibold text-slate-800">%${d.confidencePct}</td>
        <td class="py-2.5 px-3">${getRiskBadgeHtml(d.riskLevel)}</td>
        <td class="py-2.5 px-3">${getWorkflowBadgeHtml(d.status)}</td>
        <td class="py-2.5 px-3 text-right">
          <button onclick="openDetectionModal('${d.id}')" class="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200">Detay</button>
        </td>
      </tr>
    `).join('');
  }

  // Tarım Alanlarının Genel Durumu
  const fieldsGrid = document.getElementById('dashboard-fields-grid');
  if (fieldsGrid) {
    fieldsGrid.innerHTML = appState.fields.map((f) => `
      <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between gap-2">
            <h4 class="font-bold text-slate-900 text-sm">${f.name}</h4>
            ${getRiskBadgeHtml(f.riskLevel)}
          </div>
          <p class="text-xs text-emerald-800 font-semibold mt-1">${f.crop} • ${f.stage}</p>
          <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">${f.description}</p>
        </div>
        <div class="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-200 text-xs">
          <div><span class="text-slate-500 block">Alan</span><strong>${f.areaHa} ha</strong></div>
          <div><span class="text-slate-500 block">Toprak Nemi</span><strong>%${f.soilMoisture}</strong></div>
          <div><span class="text-slate-500 block">Aktif Direk</span><strong>${f.activePolesCount}/${f.totalPolesCount}</strong></div>
        </div>
      </div>
    `).join('');
  }

  // Son Sistem Olayları ve Bildirimler
  const eventsList = document.getElementById('dashboard-events-list');
  if (eventsList) {
    if (appState.events.length === 0) {
      eventsList.innerHTML = `<div class="p-6 text-center text-slate-500 text-sm">Kayıtlı sistem olayı bulunmuyor.</div>`;
    } else {
      eventsList.innerHTML = appState.events.slice(0, 6).map((ev) => {
        const borderColors = {
          critical: 'border-l-4 border-l-red-600 bg-red-50/40',
          warning: 'border-l-4 border-l-amber-500 bg-amber-50/40',
          success: 'border-l-4 border-l-emerald-600 bg-emerald-50/30',
          info: 'border-l-4 border-l-sky-600 bg-slate-50'
        };
        return `
          <div class="p-3 rounded-lg border border-slate-200 ${borderColors[ev.type] || borderColors.info} flex items-start justify-between gap-3">
            <div class="text-xs">
              <div class="flex items-center gap-2">
                <span class="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">${sanitizeInput(ev.category)}</span>
                <span class="text-slate-500">${ev.timestamp}</span>
                ${!ev.read ? '<span class="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">YENİ</span>' : ''}
              </div>
              <div class="font-bold text-slate-900 mt-1 text-sm">${sanitizeInput(ev.title)}</div>
              <p class="text-slate-600 mt-0.5 leading-relaxed">${sanitizeInput(ev.message)}</p>
            </div>
            ${!ev.read ? `<button onclick="markEventRead('${ev.id}')" class="shrink-0 text-xs font-semibold text-emerald-700 hover:underline">Okundu</button>` : ''}
          </div>
        `;
      }).join('');
    }
  }

  renderDashboardCharts(appState);
}

function markEventRead(eventId) {
  const ev = appState.events.find(e => e.id === eventId);
  if (ev) {
    ev.read = true;
    saveAppState(appState);
    renderAll();
  }
}

function markAllEventsRead() {
  appState.events.forEach(e => { e.read = true; });
  saveAppState(appState);
  showToast('Bildirimler Güncellendi', 'Tüm sistem bildirimleri okundu olarak işaretlendi.', 'info');
  renderAll();
}

// ============================================================================
// 5. TARIM ALANI HARİTASI VE KONTROL DİREKLERİ
// ============================================================================
function selectPole(poleId) {
  selectedPoleId = poleId;
  const pole = appState.poles.find(p => p.id === poleId);
  if (pole) {
    selectedFieldId = pole.fieldId;
  }
  renderMapView();
}

function selectFieldOnMap(fieldId) {
  selectedFieldId = fieldId;
  const firstPole = appState.poles.find(p => p.fieldId === fieldId);
  if (firstPole) selectedPoleId = firstPole.id;
  renderMapView();
}

function toggleMapOption(optionKey) {
  if (optionKey === 'coverage') {
    appState.systemMeta.showCoverageRadius = !appState.systemMeta.showCoverageRadius;
  } else if (optionKey === 'heatmap') {
    appState.systemMeta.showRiskHeatmap = !appState.systemMeta.showRiskHeatmap;
  }
  saveAppState(appState);
  renderMapView();
}

function switchMapEngine(engine) {
  appState.systemMeta.mapMode = engine;
  saveAppState(appState);
  renderMapView();
}

function pingSelectedPole(poleId) {
  const pole = appState.poles.find(p => p.id === poleId);
  if (!pole) return;
  if (appState.systemMeta.connectionState !== 'online') {
    showToast('Bağlantı Hatası', 'Sistem çevrim dışı moddayken saha direğine ping gönderilemez.', 'error');
    return;
  }
  if (pole.status === 'offline') {
    showToast(`${pole.id} Yanıt Vermiyor`, 'Direk çevrim dışı (Batarya: %14). Saha bakım ekibinin fiziksel kontrolü gerekiyor.', 'warning');
    return;
  }
  pole.lastPing = '2026-10-15 18:58:10 (Az Önce)';
  saveAppState(appState);
  showToast(`${pole.id} Bağlantı Testi Başarılı`, `Gecikme: 38 ms • Sinyal: ${pole.signalDbm} dBm • Kamera ve Sensör Birimi Sağlıklı.`, 'success');
  renderMapView();
}

function changePoleStatus(poleId, newStatus) {
  if (!hasPermission(appState, 'manage_poles')) {
    showToast('Yetki Kısıtlaması', 'Kontrol direği çalışma modunu değiştirmek için Yönetici yetkisi gereklidir.', 'error');
    return;
  }
  const pole = appState.poles.find(p => p.id === poleId);
  if (!pole) return;
  pole.status = newStatus;
  pole.lastPing = '2026-10-15 18:58:15';
  if (newStatus === 'active' && pole.batteryPct < 30) {
    pole.batteryPct = 85;
    pole.solarWatt = 42;
  }
  logSecurityEvent(appState, 'Direk Durum Değişikliği', `${pole.id} Direği '${newStatus.toUpperCase()}' Moduna Alındı`, `İşlemi yapan: ${getCurrentRoleObj(appState).name}`, 'info');
  saveAppState(appState);
  showToast(`${pole.id} Durumu Güncellendi`, `Yeni çalışma durumu: ${newStatus.toUpperCase()}`, 'success');
  renderAll();
}

function renderMapView() {
  const statusFilterEl = document.getElementById('map-pole-status-filter');
  const filterVal = statusFilterEl ? statusFilterEl.value : 'ALL';

  const svgWrapper = document.getElementById('svg-map-wrapper');
  const leafletWrapper = document.getElementById('leaflet-map-wrapper');
  const btnSvg = document.getElementById('btn-map-svg');
  const btnLeaflet = document.getElementById('btn-map-leaflet');

  if (appState.systemMeta.mapMode === 'leaflet') {
    if (svgWrapper) svgWrapper.classList.add('hidden');
    if (leafletWrapper) leafletWrapper.classList.remove('hidden');
    if (btnLeaflet) btnLeaflet.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 text-white';
    if (btnSvg) btnSvg.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200';
    initOrUpdateLeafletMap(appState, selectedPoleId);
  } else {
    if (svgWrapper) svgWrapper.classList.remove('hidden');
    if (leafletWrapper) leafletWrapper.classList.add('hidden');
    if (btnSvg) btnSvg.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 text-white';
    if (btnLeaflet) btnLeaflet.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200';
    renderInteractiveSvgMap(appState, selectedPoleId, selectedFieldId);
  }

  // Seçili Direk Detay Paneli
  const pole = appState.poles.find(p => p.id === selectedPoleId) || appState.poles[0];
  const field = appState.fields.find(f => f.id === pole.fieldId);
  const poleDetections = appState.detections.filter(d => d.poleId === pole.id);

  const detailContainer = document.getElementById('selected-pole-detail');
  if (detailContainer && pole) {
    detailContainer.innerHTML = `
      <div class="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">${pole.id}</span>
            <h3 class="font-bold text-slate-900 text-base">${pole.name}</h3>
          </div>
          <p class="text-xs text-emerald-800 font-semibold mt-1">İlişkili Alan: ${field ? field.name : pole.fieldId}</p>
        </div>
        ${getPoleStatusBadgeHtml(pole.status)}
      </div>

      <div class="grid grid-cols-2 gap-2.5 my-3 text-xs">
        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span class="text-slate-500 block">Son Veri Gönderimi</span>
          <strong class="text-slate-900">${pole.lastPing}</strong>
        </div>
        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span class="text-slate-500 block">Batarya & Güneş Paneli</span>
          <strong class="${pole.batteryPct < 25 ? 'text-red-700' : 'text-emerald-800'}">%${pole.batteryPct} (${pole.solarWatt}W Şarj)</strong>
        </div>
        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span class="text-slate-500 block">Kamera & Sensör</span>
          <strong class="text-slate-900">${pole.cameraStatus}</strong>
        </div>
        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span class="text-slate-500 block">Müdahale Birimi</span>
          <strong class="text-slate-900">${pole.deterrentStatus}</strong>
        </div>
      </div>

      <p class="text-xs text-slate-600 bg-emerald-50/60 border border-emerald-200 rounded-lg p-2.5">${pole.notes}</p>

      <div class="mt-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Bu Direkteki Tespit Geçmişi (${poleDetections.length} Kayıt)</h4>
        ${poleDetections.length === 0
          ? `<div class="text-xs text-slate-500 p-3 rounded bg-slate-50 border border-slate-200">Bu direkte kayıtlı canlı tespiti bulunmuyor.</div>`
          : `<div class="space-y-2 max-h-40 overflow-y-auto pr-1">
              ${poleDetections.map(d => `
                <div class="p-2 rounded border border-slate-200 bg-white flex items-center justify-between gap-2 text-xs">
                  <div>
                    <div class="font-bold text-slate-800">${sanitizeInput(d.species)}</div>
                    <div class="text-[11px] text-slate-500">${d.timestamp} • Güven: %${d.confidencePct}</div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    ${getRiskBadgeHtml(d.riskLevel)}
                    <button onclick="openDetectionModal('${d.id}')" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">İncele</button>
                  </div>
                </div>
              `).join('')}
            </div>`
        }
      </div>

      <div class="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
        <button onclick="pingSelectedPole('${pole.id}')" class="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold">Bağlantı & Sensör Testi (Ping)</button>
        ${pole.status !== 'active'
          ? `<button onclick="changePoleStatus('${pole.id}', 'active')" class="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold">Aktif Moda Geçir</button>`
          : `<button onclick="changePoleStatus('${pole.id}', 'maintenance')" class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold">Bakım Moduna Al</button>`
        }
      </div>
    `;
  }

  // Direk Listesi Kartları (Filtreli)
  const polesListEl = document.getElementById('map-poles-list');
  if (polesListEl) {
    const filteredPoles = appState.poles.filter(p => filterVal === 'ALL' || p.status === filterVal);
    if (filteredPoles.length === 0) {
      polesListEl.innerHTML = `<div class="p-6 text-center text-slate-500 text-sm col-span-full">Seçilen durum filtresine uygun kontrol direği bulunamadı.</div>`;
    } else {
      polesListEl.innerHTML = filteredPoles.map((p) => {
        const isSel = p.id === selectedPoleId;
        return `
          <div onclick="selectPole('${p.id}')" role="button" tabindex="0" class="p-3 rounded-xl border transition cursor-pointer ${isSel ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/30' : 'border-slate-200 bg-white hover:border-emerald-400'}">
            <div class="flex items-center justify-between gap-2">
              <span class="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-900 text-white">${p.id}</span>
              ${getPoleStatusBadgeHtml(p.status)}
            </div>
            <div class="font-bold text-slate-900 text-sm mt-2">${p.name}</div>
            <div class="text-xs text-slate-500 mt-0.5">Alan: ${p.fieldId} • Son Veri: ${p.lastPing}</div>
            <div class="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-xs">
              <span>Batarya: <strong class="${p.batteryPct < 25 ? 'text-red-600' : 'text-emerald-700'}">%${p.batteryPct}</strong></span>
              <span>Sinyal: <strong>${p.signalDbm} dBm</strong></span>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

// ============================================================================
// 6. CANLI TESPİT VE YAPAY ZEKÂ ANALİZİ
// ============================================================================
function renderDetectionsView() {
  const searchInput = document.getElementById('det-search-input');
  const riskSelect = document.getElementById('det-risk-filter');
  const poleSelect = document.getElementById('det-pole-filter');
  const statusSelect = document.getElementById('det-status-filter');

  const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const rFilter = riskSelect ? riskSelect.value : 'ALL';
  const pFilter = poleSelect ? poleSelect.value : 'ALL';
  const sFilter = statusSelect ? statusSelect.value : 'ALL';

  const filtered = appState.detections.filter((d) => {
    const matchesSearch = !q ||
      d.species.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.aiAnalysis.toLowerCase().includes(q) ||
      d.recommendedAction.toLowerCase().includes(q);
    const matchesRisk = rFilter === 'ALL' || d.riskLevel === rFilter;
    const matchesPole = pFilter === 'ALL' || d.poleId === pFilter;
    const matchesStatus = sFilter === 'ALL' || d.status === sFilter;
    return matchesSearch && matchesRisk && matchesPole && matchesStatus;
  });

  const countEl = document.getElementById('det-filtered-count');
  if (countEl) countEl.textContent = `${filtered.length} / ${appState.detections.length} kayıt gösteriliyor`;

  const tbody = document.getElementById('detections-table-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="py-10 px-4 text-center">
          <div class="max-w-sm mx-auto">
            <div class="text-slate-400 text-2xl mb-1">⌕</div>
            <div class="font-bold text-slate-800 text-sm">Arama ve Filtre Kriterlerine Uygun Tespit Bulunamadı</div>
            <p class="text-xs text-slate-500 mt-1">Filtreleri sıfırlayarak tüm yapay zekâ tespit kayıtlarını tekrar görüntüleyebilirsiniz.</p>
            <button onclick="resetDetectionFilters()" class="mt-3 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold">Filtreleri Temizle</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((d) => `
    <tr class="border-b border-slate-200 hover:bg-slate-50/90 align-top">
      <td class="py-3 px-3 font-mono text-xs font-bold text-slate-700">${d.id}</td>
      <td class="py-3 px-3">
        <div class="font-bold text-slate-900 text-sm">${sanitizeInput(d.species)}</div>
        <div class="text-xs text-slate-500">${sanitizeInput(d.category)}</div>
      </td>
      <td class="py-3 px-3 text-xs text-slate-700">
        <span class="font-mono font-bold px-2 py-0.5 rounded bg-slate-100">${d.poleId}</span>
        <div class="text-slate-500 mt-1">${d.timestamp}</div>
      </td>
      <td class="py-3 px-3">
        <div class="text-xs font-bold text-slate-900">%${d.confidencePct}</div>
        <div class="w-20 h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
          <div class="h-full bg-emerald-600" style="width: ${Math.min(100, d.confidencePct)}%"></div>
        </div>
      </td>
      <td class="py-3 px-3">${getRiskBadgeHtml(d.riskLevel)}</td>
      <td class="py-3 px-3 text-xs text-slate-700 max-w-xs">
        <p class="font-medium text-slate-900">${sanitizeInput(d.aiAnalysis)}</p>
        <p class="text-emerald-800 mt-1"><strong>Öneri:</strong> ${sanitizeInput(d.recommendedAction)}</p>
      </td>
      <td class="py-3 px-3">${getWorkflowBadgeHtml(d.status)}</td>
      <td class="py-3 px-3 text-right">
        <div class="flex flex-col gap-1.5 items-end">
          <button onclick="openDetectionModal('${d.id}')" class="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs">İncele & İşlem</button>
          ${d.status === 'Bekleyen'
            ? `<button onclick="updateDetectionStatus('${d.id}', 'Onaylanan')" class="px-2.5 py-1 rounded bg-sky-100 hover:bg-sky-200 text-sky-900 font-semibold text-xs">Hızlı Onayla</button>`
            : ''
          }
        </div>
      </td>
    </tr>
  `).join('');
}

function resetDetectionFilters() {
  const s = document.getElementById('det-search-input');
  const r = document.getElementById('det-risk-filter');
  const p = document.getElementById('det-pole-filter');
  const st = document.getElementById('det-status-filter');
  if (s) s.value = '';
  if (r) r.value = 'ALL';
  if (p) p.value = 'ALL';
  if (st) st.value = 'ALL';
  renderDetectionsView();
}

function openDetectionModal(detId) {
  const d = appState.detections.find(item => item.id === detId);
  if (!d) return;
  const modal = document.getElementById('modal-detection-detail');
  const content = document.getElementById('modal-detection-content');
  if (!modal || !content) return;

  const isBeneficial = d.riskLevel === 'Yararlı / Zararsız';

  content.innerHTML = `
    <div class="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
      <div>
        <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">${d.id}</span>
        <span class="ml-2 text-xs text-slate-500">${d.timestamp}</span>
        <h3 class="text-lg font-extrabold text-slate-900 mt-1">${sanitizeInput(d.species)}</h3>
        <p class="text-xs text-slate-600">${sanitizeInput(d.category)} • Kontrol Direği: <strong>${d.poleId}</strong> (${d.fieldId})</p>
      </div>
      <button onclick="closeDetectionModal()" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm" aria-label="Kapat">✕</button>
    </div>

    <div class="my-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
      <strong>SİMÜLASYON BİLDİRİMİ:</strong> Bu analiz kaydı örnek kenar yapay zekâ modeli (AgroNet-v3) simülasyon verisidir. Gerçek kamera akışı bağlı değildir.
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 text-xs">
      <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
        <span class="text-slate-500 block">YZ Güven Skoru</span>
        <strong class="text-base text-slate-900">%${d.confidencePct}</strong>
      </div>
      <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
        <span class="text-slate-500 block mb-1">Bitki Risk Seviyesi</span>
        ${getRiskBadgeHtml(d.riskLevel)}
      </div>
      <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
        <span class="text-slate-500 block mb-1">Mevcut İşlem Durumu</span>
        ${getWorkflowBadgeHtml(d.status)}
      </div>
    </div>

    <div class="space-y-3 text-xs mt-3">
      <div class="p-3 rounded-lg bg-white border border-slate-200">
        <div class="font-bold text-slate-800 mb-1">Yapay Zekâ Görüntü & Sensör Analizi Sonucu:</div>
        <p class="text-slate-700 leading-relaxed">${sanitizeInput(d.aiAnalysis)}</p>
      </div>
      <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
        <div class="font-bold text-emerald-950 mb-1">Önerilen Güvenli İşlem Protokolü:</div>
        <p class="text-emerald-900 leading-relaxed">${sanitizeInput(d.recommendedAction)}</p>
      </div>
    </div>

    <div class="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <button onclick="updateDetectionStatus('${d.id}', 'Onaylanan')" class="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold">Analizi Onayla</button>
        <button onclick="updateDetectionStatus('${d.id}', 'Tamamlanan')" class="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold">Tamamlandı İşaretle</button>
        <button onclick="updateDetectionStatus('${d.id}', 'İptal Edilen')" class="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-semibold">İptal Et</button>
      </div>
      ${!isBeneficial
        ? `<button onclick="prefillChemicalFromDetection('${d.id}')" class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold">Güvenli Müdahale Planla →</button>`
        : `<span class="text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-1 rounded">★ Yararlı Tür — Müdahale Kilitli</span>`
      }
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeDetectionModal() {
  const modal = document.getElementById('modal-detection-detail');
  if (modal) modal.classList.add('hidden');
}

function updateDetectionStatus(detId, newStatus) {
  if (!hasPermission(appState, 'manage_detections')) {
    showToast('Yetki Kısıtlaması', 'Gözlemci rolü tespit durumlarını değiştiremez. Operatör veya Yönetici rolüne geçin.', 'error');
    return;
  }
  const d = appState.detections.find(item => item.id === detId);
  if (!d) return;
  d.status = newStatus;
  logSecurityEvent(appState, 'Tespit Durum Güncellemesi', `${d.id} Kaydı '${newStatus}' Olarak Güncellendi`, `${d.species} tespiti için durum güncellendi.`, 'info');
  saveAppState(appState);
  showToast(`${d.id} Güncellendi`, `Yeni işlem durumu: ${newStatus}`, 'success');
  closeDetectionModal();
  renderAll();
}

function simulateNewDetection() {
  if (!hasPermission(appState, 'manage_detections')) {
    showToast('Yetki Kısıtlaması', 'Yeni simülasyon kaydı oluşturmak için Operatör veya Yönetici yetkisi gereklidir.', 'error');
    return;
  }
  const samples = [
    {
      species: 'Helicoverpa armigera (Yeşil Kurt)',
      category: 'Zararlı Böcek / Lepidoptera',
      poleId: 'KD-104',
      fieldId: 'PARSEL-B2',
      confidencePct: 94.7,
      riskLevel: 'Yüksek',
      aiAnalysis: 'Domates meyvelerinde giriş delikleri ve 8 birey/tuzak artışı simülasyon sensörüyle saptandı.',
      recommendedAction: 'Uzman onayı ile biyolojik Bacillus thuringiensis veya feromon şaşırtma tekniği.'
    },
    {
      species: 'Apis mellifera (Bal Arısı Kolonisi - Polinasyon)',
      category: 'Yararlı Böcek / Tozlaştırıcı',
      poleId: 'KD-108',
      fieldId: 'PARSEL-D4',
      confidencePct: 99.1,
      riskLevel: 'Yararlı / Zararsız',
      aiAnalysis: 'Ayçiçeği tablasında yoğun polinasyon aktivitesi saptandı.',
      recommendedAction: 'KESİNLİKLE İLAÇLama YAPILMAZ. Arı koruma protokolü gereği tüm kimyasal valfler kilitlendi.'
    },
    {
      species: 'Sus scrofa (Yaban Domuzu - 2 Birey)',
      category: 'Yabani Memeli',
      poleId: 'KD-101',
      fieldId: 'PARSEL-A1',
      confidencePct: 96.9,
      riskLevel: 'Yüksek',
      aiAnalysis: 'Kuzey sınır hattında gece termal izleme ile parsel girişi algılandı.',
      recommendedAction: 'Kimyasal kullanmadan ultrasonik + stroboskopik ışık caydırıcı çalıştırılması.'
    }
  ];
  const pick = samples[Math.floor(Math.random() * samples.length)];
  const newId = 'TSP-2026-' + Math.floor(900 + Math.random() * 99);
  const newRec = {
    id: newId,
    species: pick.species,
    category: pick.category,
    timestamp: '2026-10-15 18:58:25',
    dateOnly: '2026-10-15',
    poleId: pick.poleId,
    fieldId: pick.fieldId,
    confidencePct: pick.confidencePct,
    riskLevel: pick.riskLevel,
    aiAnalysis: pick.aiAnalysis,
    recommendedAction: pick.recommendedAction,
    status: pick.riskLevel === 'Yararlı / Zararsız' ? 'Tamamlanan' : 'Bekleyen'
  };
  appState.detections.unshift(newRec);
  logSecurityEvent(appState, 'Simülasyon Tespiti', `Yeni YZ Tespit Kaydı: ${pick.species}`, `${pick.poleId} direğinde %${pick.confidencePct} güven skoru ile oluşturuldu.`, 'warning');
  saveAppState(appState);
  showToast('Simülasyon Tespiti Eklendi', `${newId}: ${pick.species} listeye eklendi.`, 'info');
  renderAll();
}

function prefillChemicalFromDetection(detId) {
  closeDetectionModal();
  switchTab('chemical');
  const d = appState.detections.find(item => item.id === detId);
  if (!d) return;
  const fieldEl = document.getElementById('chem-form-field');
  const targetEl = document.getElementById('chem-form-target');
  if (fieldEl) fieldEl.value = d.fieldId;
  if (targetEl) targetEl.value = `${d.species} (${d.id})`;
  showToast('Müdahale Formu Hazırlandı', `${d.id} kaydı için güvenlik doğrulama adımlarını tamamlayın.`, 'info');
}

// ============================================================================
// 7. GÜVENLİ MÜDAHALE VE KİMYASAL UYGULAMA YÖNETİMİ
// ============================================================================
function renderChemicalView() {
  const tbody = document.getElementById('chemical-table-body');
  if (!tbody) return;

  tbody.innerHTML = appState.chemicalApplications.map((c) => {
    const allChecked = c.safetyChecks.agronomistVerified &&
      c.safetyChecks.labelDosageVerified &&
      c.safetyChecks.weatherWindVerified &&
      c.safetyChecks.fieldClearVerified;

    return `
      <tr class="border-b border-slate-200 hover:bg-slate-50 align-top">
        <td class="py-3 px-3">
          <span class="font-mono text-xs font-bold text-slate-800">${c.id}</span>
          <div class="text-[11px] text-slate-500 mt-0.5">${c.timestamp}</div>
        </td>
        <td class="py-3 px-3">
          <div class="font-bold text-slate-900 text-xs">${sanitizeInput(c.fieldName)}</div>
          <div class="text-xs text-emerald-800 font-medium">${sanitizeInput(c.crop)}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Hedef: ${sanitizeInput(c.targetOrganism)}</div>
        </td>
        <td class="py-3 px-3 text-xs">
          <div class="font-bold text-slate-900">${sanitizeInput(c.productName)}</div>
          <div class="text-slate-600 mt-0.5">Ruhsat: <span class="font-mono">${sanitizeInput(c.approvalLicenseNo)}</span></div>
          <div class="text-slate-700 mt-0.5">Doz: <strong>${sanitizeInput(c.dosagePerDecare)}</strong> • PHI: <strong>${c.phiDays} Gün</strong></div>
        </td>
        <td class="py-3 px-3 text-xs">
          <div class="space-y-1">
            <div class="flex items-center gap-1.5 ${c.safetyChecks.agronomistVerified ? 'text-emerald-800' : 'text-red-700 font-semibold'}">
              <span>${c.safetyChecks.agronomistVerified ? '✓' : '✕'}</span> Uzman Reçete Onayı
            </div>
            <div class="flex items-center gap-1.5 ${c.safetyChecks.labelDosageVerified ? 'text-emerald-800' : 'text-red-700 font-semibold'}">
              <span>${c.safetyChecks.labelDosageVerified ? '✓' : '✕'}</span> Etiket & PHI Uygunluğu
            </div>
            <div class="flex items-center gap-1.5 ${c.safetyChecks.weatherWindVerified ? 'text-emerald-800' : 'text-red-700 font-semibold'}">
              <span>${c.safetyChecks.weatherWindVerified ? '✓' : '✕'}</span> Rüzgâr (${c.windSpeedKmh} km/s) Uygun
            </div>
            <div class="flex items-center gap-1.5 ${c.safetyChecks.fieldClearVerified ? 'text-emerald-800' : 'text-red-700 font-semibold'}">
              <span>${c.safetyChecks.fieldClearVerified ? '✓' : '✕'}</span> Saha İnsansız / Arısız Teyidi
            </div>
          </div>
        </td>
        <td class="py-3 px-3 text-xs text-amber-950 max-w-xs">
          <div class="p-2 rounded bg-amber-50 border border-amber-200">${sanitizeInput(c.safetyWarnings)}</div>
          <div class="text-[11px] text-slate-500 mt-1">Talep: ${sanitizeInput(c.requestedBy)} | Onay: ${sanitizeInput(c.approvedBy)}</div>
        </td>
        <td class="py-3 px-3">${getWorkflowBadgeHtml(c.status)}</td>
        <td class="py-3 px-3 text-right">
          <div class="flex flex-col gap-1.5 items-end">
            ${!allChecked && c.status === 'Onay Bekliyor'
              ? `<button onclick="completeSafetyCheckForItem('${c.id}')" class="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs border border-amber-300">Eksik Güvenlik Teyidini Tamamla</button>`
              : ''
            }
            ${c.status === 'Onay Bekliyor'
              ? `<button onclick="approveChemicalApplication('${c.id}')" class="px-2.5 py-1 rounded ${allChecked ? 'bg-emerald-700 hover:bg-emerald-800 text-white' : 'bg-slate-200 text-slate-500'} font-semibold text-xs">Simülasyon Onayı Ver</button>`
              : ''
            }
            ${c.status === 'Uygulamada (Simülasyon)'
              ? `<button onclick="completeChemicalApplication('${c.id}')" class="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs">Uygulamayı Tamamla</button>`
              : ''
            }
            ${(c.status === 'Onay Bekliyor' || c.status === 'Uygulamada (Simülasyon)')
              ? `<button onclick="cancelChemicalApplication('${c.id}')" class="px-2.5 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800 font-semibold text-xs">İptal Et</button>`
              : ''
            }
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function completeSafetyCheckForItem(chemId) {
  if (!hasPermission(appState, 'create_chemical')) {
    showToast('Yetki Kısıtlaması', 'Güvenlik kontrol listesini doğrulamak için Operatör veya Yönetici yetkisi gereklidir.', 'error');
    return;
  }
  const item = appState.chemicalApplications.find(c => c.id === chemId);
  if (!item) return;
  item.safetyChecks.agronomistVerified = true;
  item.safetyChecks.labelDosageVerified = true;
  item.safetyChecks.weatherWindVerified = true;
  item.safetyChecks.fieldClearVerified = true;
  item.safetyWarnings = '4 aşamalı güvenlik kontrolü tamamlandı. Yetkili Ziraat Mühendisi (Yönetici) onayı bekleniyor.';
  saveAppState(appState);
  showToast('Güvenlik Kontrolü Tamamlandı', `${item.id} için saha güvenliği teyit edildi. Artık yönetici tarafından onaylanabilir.`, 'success');
  renderChemicalView();
}

function approveChemicalApplication(chemId) {
  if (appState.systemMeta.emergencyStopActive) {
    showToast('Acil Durdurma Aktif!', 'Sistemde Acil Durdurma (E-Stop) kilidi devredeyken hiçbir uygulama onaylanamaz.', 'error');
    return;
  }
  if (!hasPermission(appState, 'approve_chemical')) {
    showToast('Yetkisiz İşlem (RBAC Koruması)', 'Kimyasal veya biyoteknik müdahale onayını yalnızca Yetkili Ziraat Mühendisi (Yönetici) rolü verebilir!', 'error');
    return;
  }
  const item = appState.chemicalApplications.find(c => c.id === chemId);
  if (!item) return;

  const sc = item.safetyChecks;
  if (!sc.agronomistVerified || !sc.labelDosageVerified || !sc.weatherWindVerified || !sc.fieldClearVerified) {
    showToast('Güvenlik Kontrolü Eksik!', '4 aşamalı güvenlik doğrulaması (Reçete, Etiket/PHI, Rüzgâr Hızı ve İnsansız Saha Teyidi) tamamlanmadan işlem onaylanamaz.', 'warning');
    return;
  }

  item.status = 'Uygulamada (Simülasyon)';
  item.approvedBy = getCurrentRoleObj(appState).name;
  logSecurityEvent(appState, 'Müdahale Onayı (Simülasyon)', `${item.id} Uygulaması Onaylandı`, `${item.fieldName} alanında '${item.productName}' simülasyon akışı başlatıldı.`, 'success');
  saveAppState(appState);
  showToast('Müdahale Onaylandı (Simülasyon)', `${item.id} kaydı güvenlik kontrolleri doğrulanarak simülasyon kuyruğuna alındı.`, 'success');
  renderAll();
}

function completeChemicalApplication(chemId) {
  if (!hasPermission(appState, 'approve_chemical')) {
    showToast('Yetki Kısıtlaması', 'Uygulama tamamlama onayı için Yönetici yetkisi gereklidir.', 'error');
    return;
  }
  const item = appState.chemicalApplications.find(c => c.id === chemId);
  if (!item) return;
  item.status = 'Tamamlandı';
  logSecurityEvent(appState, 'Uygulama Tamamlandı', `${item.id} Görevi Kayıt Altına Alındı`, `${item.fieldName} için güvenli uygulama simülasyonu tamamlandı.`, 'info');
  saveAppState(appState);
  showToast('Görev Tamamlandı', `${item.id} uygulama geçmişine kaydedildi.`, 'success');
  renderAll();
}

function cancelChemicalApplication(chemId) {
  if (!hasPermission(appState, 'create_chemical')) {
    showToast('Yetki Kısıtlaması', 'Bu işlem için Operatör veya Yönetici yetkisi gereklidir.', 'error');
    return;
  }
  const item = appState.chemicalApplications.find(c => c.id === chemId);
  if (!item) return;
  item.status = 'İptal / Durduruldu';
  item.approvedBy = getCurrentRoleObj(appState).name + ' (İptal)';
  logSecurityEvent(appState, 'Müdahale İptali', `${item.id} Uygulaması İptal Edildi`, `${item.fieldName} için planlanan görev kullanıcı tarafından iptal edildi.`, 'warning');
  saveAppState(appState);
  showToast('Uygulama İptal Edildi', `${item.id} kaydı iptal durumuna geçirildi.`, 'warning');
  renderAll();
}

function submitNewChemicalPlan(event) {
  if (event) event.preventDefault();
  if (appState.systemMeta.emergencyStopActive) {
    showToast('Acil Durdurma Aktif!', 'Acil durdurma kilidi kaldırılmadan yeni müdahale kaydı oluşturulamaz.', 'error');
    return;
  }
  if (!hasPermission(appState, 'create_chemical')) {
    showToast('Yetki Kısıtlaması', 'Gözlemci rolü yeni müdahale planı oluşturamaz.', 'error');
    return;
  }

  const fieldId = document.getElementById('chem-form-field').value;
  const target = sanitizeInput(document.getElementById('chem-form-target').value);
  const productSelect = document.getElementById('chem-form-product');
  const productVal = productSelect.value;
  const dosage = sanitizeInput(document.getElementById('chem-form-dosage').value);
  const wind = parseFloat(document.getElementById('chem-form-wind').value || '0');
  const warningNote = sanitizeInput(document.getElementById('chem-form-notes').value);

  const chk1 = document.getElementById('chk-safety-1').checked;
  const chk2 = document.getElementById('chk-safety-2').checked;
  const chk3 = document.getElementById('chk-safety-3').checked;
  const chk4 = document.getElementById('chk-safety-4').checked;

  if (!target || !dosage) {
    showToast('Eksik Alan', 'Lütfen hedef organizma ve etiket doz bilgisini eksiksiz girin.', 'warning');
    return;
  }

  if (wind > 12 && productVal.indexOf('Akustik') === -1) {
    showToast('Meteorolojik Güvenlik Engeli!', `Rüzgâr hızı (${wind} km/s) 12 km/s sınırını aştığı için ilaç sürüklenme (drift) riski var! Kimyasal planlama engellendi.`, 'error');
    return;
  }

  if (!chk1 || !chk2 || !chk3 || !chk4) {
    showToast('Zorunlu Güvenlik Kontrolü!', '4 güvenlik kontrol maddesinin tamamı doğrulanmadan müdahale talebi kaydedilemez.', 'warning');
    return;
  }

  const fieldObj = appState.fields.find(f => f.id === fieldId) || appState.fields[0];
  const newId = 'KIM-2026-' + Math.floor(402 + Math.random() * 90);

  const licenseMap = {
    'Biolep BT-Kurstaki (Bacillus thuringiensis - Biyolarvasit)': { lic: 'BKÜ-RUHSAT-2021/4892', phi: 3 },
    'NeemAzal T/S (Azadirachtin 10 g/L - Organik Uyumlu)': { lic: 'BKÜ-RUHSAT-2019/3104', phi: 3 },
    'Spinosad 480 g/L (Biyokimyasal Lokal Uygulama)': { lic: 'BKÜ-RUHSAT-2020/1190', phi: 7 },
    'Kimyasal Yok — Ultrasonik & Biyoteknik Feromon Tuzak': { lic: 'FİZİKSEL-ÖNLEM-02', phi: 0 }
  };
  const meta = licenseMap[productVal] || { lic: 'BKÜ-RUHSAT-STANDART', phi: 5 };

  const newPlan = {
    id: newId,
    detectionId: 'MANUEL',
    fieldId: fieldObj.id,
    fieldName: fieldObj.name,
    crop: fieldObj.crop,
    targetOrganism: target,
    productName: productVal,
    approvalLicenseNo: meta.lic,
    dosagePerDecare: dosage,
    phiDays: meta.phi,
    windSpeedKmh: wind,
    tempC: fieldObj.ambientTempC,
    safetyChecks: {
      agronomistVerified: chk1,
      labelDosageVerified: chk2,
      weatherWindVerified: chk3,
      fieldClearVerified: chk4
    },
    status: 'Onay Bekliyor',
    requestedBy: getCurrentRoleObj(appState).name,
    approvedBy: '—',
    timestamp: '2026-10-15 18:58:20',
    safetyWarnings: warningNote || 'Tüm ön güvenlik kontrolleri doğrulandı. Yönetici simülasyon onayı bekleniyor.'
  };

  appState.chemicalApplications.unshift(newPlan);
  logSecurityEvent(appState, 'Yeni Müdahale Planı', `${newId} Güvenli Müdahale Talebi Oluşturuldu`, `${fieldObj.name} için ${productVal} planlandı.`, 'info');
  saveAppState(appState);

  document.getElementById('chem-form-target').value = '';
  document.getElementById('chem-form-notes').value = '';
  showToast('Güvenli Müdahale Planı Kaydedildi', `${newId} onay listesine eklendi.`, 'success');
  renderAll();
}

// ============================================================================
// 8. RAPORLAMA VE İSTATİSTİKLER + CSV DIŞA AKTARMA
// ============================================================================
function setReportPeriod(periodKey) {
  reportPeriod = periodKey;
  ['daily', 'weekly', 'monthly'].forEach((k) => {
    const btn = document.getElementById('btn-period-' + k);
    if (btn) {
      btn.className = (k === periodKey)
        ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 text-white'
        : 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200';
    }
  });
  renderReportsView();
}

function getFilteredReportRows() {
  const startEl = document.getElementById('rep-date-start');
  const endEl = document.getElementById('rep-date-end');
  const catEl = document.getElementById('rep-category-filter');
  const riskEl = document.getElementById('rep-risk-filter');
  const poleEl = document.getElementById('rep-pole-filter');

  const startVal = startEl ? startEl.value : '2026-10-01';
  const endVal = endEl ? endEl.value : '2026-10-16';
  const catVal = catEl ? catEl.value : 'ALL';
  const riskVal = riskEl ? riskEl.value : 'ALL';
  const poleVal = poleEl ? poleEl.value : 'ALL';

  return appState.detections.filter((d) => {
    const afterStart = !startVal || d.dateOnly >= startVal;
    const beforeEnd = !endVal || d.dateOnly <= endVal;
    const matchCat = catVal === 'ALL' || d.category.indexOf(catVal) !== -1;
    const matchRisk = riskVal === 'ALL' || d.riskLevel === riskVal;
    const matchPole = poleVal === 'ALL' || d.poleId === poleVal;
    return afterStart && beforeEnd && matchCat && matchRisk && matchPole;
  });
}

function renderReportsView() {
  const rows = getFilteredReportRows();
  const tbody = document.getElementById('report-table-body');
  if (tbody) {
    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-500 text-xs">Seçilen tarih aralığı ve filtrelere uygun rapor kaydı bulunamadı.</td></tr>`;
    } else {
      tbody.innerHTML = rows.map((d) => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
          <td class="py-2.5 px-3 font-mono font-bold">${d.id}</td>
          <td class="py-2.5 px-3 font-semibold text-slate-900">${sanitizeInput(d.species)}</td>
          <td class="py-2.5 px-3 text-slate-600">${sanitizeInput(d.category)}</td>
          <td class="py-2.5 px-3 font-mono">${d.poleId} (${d.fieldId})</td>
          <td class="py-2.5 px-3">${d.timestamp}</td>
          <td class="py-2.5 px-3 font-bold">%${d.confidencePct}</td>
          <td class="py-2.5 px-3">${getRiskBadgeHtml(d.riskLevel)}</td>
        </tr>
      `).join('');
    }
  }

  // Özet İstatistik Kartları
  const summaryEl = document.getElementById('report-summary-metrics');
  if (summaryEl) {
    const highCount = rows.filter(r => r.riskLevel === 'Kritik' || r.riskLevel === 'Yüksek').length;
    const avgConf = rows.length > 0
      ? (rows.reduce((acc, r) => acc + r.confidencePct, 0) / rows.length).toFixed(1)
      : '0.0';
    const completedChem = appState.chemicalApplications.filter(c => c.status === 'Tamamlandı').length;

    summaryEl.innerHTML = `
      <div class="p-3.5 rounded-xl bg-white border border-slate-200">
        <span class="text-xs text-slate-500">Filtrelenen Tespit Sayısı</span>
        <div class="text-xl font-extrabold text-slate-900 mt-1">${rows.length} Kayıt</div>
      </div>
      <div class="p-3.5 rounded-xl bg-white border border-slate-200">
        <span class="text-xs text-slate-500">Kritik / Yüksek Riskli Kayıt</span>
        <div class="text-xl font-extrabold text-red-700 mt-1">${highCount} Kayıt</div>
      </div>
      <div class="p-3.5 rounded-xl bg-white border border-slate-200">
        <span class="text-xs text-slate-500">Ortalama YZ Güven Skoru</span>
        <div class="text-xl font-extrabold text-emerald-800 mt-1">%${avgConf}</div>
      </div>
      <div class="p-3.5 rounded-xl bg-white border border-slate-200">
        <span class="text-xs text-slate-500">Tamamlanan Güvenli Müdahale</span>
        <div class="text-xl font-extrabold text-sky-800 mt-1">${completedChem} Görev</div>
      </div>
    `;
  }

  renderReportCharts(appState, reportPeriod);
}

function exportReportToCSV() {
  const rows = getFilteredReportRows();
  if (rows.length === 0) {
    showToast('Dışa Aktarılacak Veri Yok', 'Seçili filtrelere uygun kayıt bulunmadığından CSV oluşturulamadı.', 'warning');
    return;
  }

  const headers = ['Kayit_ID', 'Canli_Turu', 'Sinif_Kategori', 'Kontrol_Diregi', 'Parsel', 'Tarih_Saat', 'YZ_Guven_Skoru_Yuzde', 'Risk_Seviyesi', 'Islem_Durumu', 'Onerilen_Guvenli_Islem'];
  const csvLines = [headers.join(';')];

  rows.forEach((r) => {
    const line = [
      r.id,
      `"${r.species.replace(/"/g, '""')}"`,
      `"${r.category.replace(/"/g, '""')}"`,
      r.poleId,
      r.fieldId,
      r.timestamp,
      r.confidencePct,
      r.riskLevel,
      r.status,
      `"${r.recommendedAction.replace(/"/g, '""')}"`
    ];
    csvLines.push(line.join(';'));
  });

  const csvContent = '\uFEFF' + csvLines.join('\n');

  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AgroShield_Rapor_${reportPeriod}_2026-10-15.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    // Sandbox kısıtlaması durumunda modal önizleme her zaman çalışır
  }

  const modal = document.getElementById('modal-csv-preview');
  const textarea = document.getElementById('csv-preview-textarea');
  if (textarea) textarea.value = csvLines.join('\n');
  if (modal) modal.classList.remove('hidden');

  logSecurityEvent(appState, 'Rapor Dışa Aktarma', `CSV Raporu Oluşturuldu (${rows.length} Kayıt)`, `Dönem: ${reportPeriod.toUpperCase()} | Kullanıcı: ${getCurrentRoleObj(appState).name}`, 'info');
  showToast('CSV Raporu Hazırlandı', `${rows.length} kayıt içeren CSV dosyası indirildi ve önizleme penceresinde açıldı.`, 'success');
}

function copyCsvToClipboard() {
  const textarea = document.getElementById('csv-preview-textarea');
  if (!textarea) return;
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('Panoya Kopyalandı', 'CSV içeriği panoya kopyalandı.', 'success');
  } catch (err) {
    showToast('Kopyalama Bilgilendirmesi', 'Metin seçildi, Ctrl+C ile kopyalayabilirsiniz.', 'info');
  }
}

function closeCsvModal() {
  const modal = document.getElementById('modal-csv-preview');
  if (modal) modal.classList.add('hidden');
}

function resetDemoData() {
  appState = resetAppState();
  showToast('Fabrika Verilerine Dönüldü', 'Tüm simülasyon verileri ve direk durumları başlangıç değerlerine sıfırlandı.', 'info');
  renderAll();
}

function renderAll() {
  renderTopBanners();
  if (currentTab === 'dashboard') renderDashboardView();
  if (currentTab === 'map') renderMapView();
  if (currentTab === 'detections') renderDetectionsView();
  if (currentTab === 'chemical') renderChemicalView();
  if (currentTab === 'reports') renderReportsView();
}

window.addEventListener('DOMContentLoaded', () => {
  renderAll();
});
