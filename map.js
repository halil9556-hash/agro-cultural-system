/**
 * AgroShield Pro — Etkileşimli Tarım Alanı Haritası ve Kontrol Direkleri Görselleştirme Modülü
 * Hem %100 çevrim dışı çalışan SVG Akıllı Arazi/Kadastro Haritası hem de yapılandırılabilir
 * Leaflet Coğrafi Harita katmanı içerir. Harita servisi erişilemediğinde otomatik olarak
 * kullanıcıya anlaşılır açıklama gösterir ve kesintisiz çalışmaya devam eder.
 */

let leafletMapInstance = null;

function renderInteractiveSvgMap(state, selectedPoleId, selectedFieldId) {
  const container = document.getElementById('svg-map-canvas');
  if (!container) return;

  const riskColors = {
    'Kritik': { fill: '#ef4444', stroke: '#fca5a5' },
    'Yüksek': { fill: '#f97316', stroke: '#fdba74' },
    'Orta': { fill: '#eab308', stroke: '#fde047' },
    'Düşük': { fill: '#10b981', stroke: '#6ee7b7' }
  };

  const fieldsSvg = state.fields.map((f) => {
    const isSelected = f.id === selectedFieldId;
    const rc = riskColors[f.riskLevel] || riskColors['Düşük'];
    const baseFill = state.systemMeta.showRiskHeatmap ? rc.fill : '#15803d';
    const fillOpacity = state.systemMeta.showRiskHeatmap ? '0.38' : '0.25';

    return `
      <g onclick="selectFieldOnMap('${f.id}')" role="button" tabindex="0" aria-label="${f.name} - Risk: ${f.riskLevel}">
        <polygon
          points="${f.svgPoints}"
          fill="${baseFill}"
          fill-opacity="${fillOpacity}"
          stroke="${isSelected ? '#ffffff' : rc.stroke}"
          stroke-width="${isSelected ? '3.5' : '2'}"
          stroke-dasharray="${f.riskLevel === 'Kritik' ? '6,3' : 'none'}"
          class="field-polygon ${isSelected ? 'field-polygon-selected' : ''}"
        />
        <rect x="${f.labelPos.x - 95}" y="${f.labelPos.y - 22}" width="190" height="42" rx="6" fill="#042619" fill-opacity="0.82" stroke="#34d399" stroke-width="0.8" />
        <text x="${f.labelPos.x}" y="${f.labelPos.y - 4}" text-anchor="middle" fill="#ecfdf5" font-size="11" font-weight="700">${f.name}</text>
        <text x="${f.labelPos.x}" y="${f.labelPos.y + 12}" text-anchor="middle" fill="#a7f3d0" font-size="10">${f.crop} • Risk: ${f.riskLevel}</text>
      </g>
    `;
  }).join('');

  const polesSvg = state.poles.map((p) => {
    const isSelected = p.id === selectedPoleId;
    let color = '#10b981'; // active
    let statusCode = 'AKTİF';
    let iconSymbol = '●';
    if (p.status === 'offline') {
      color = '#ef4444';
      statusCode = 'ÇEVRİM DIŞI';
      iconSymbol = '✕';
    } else if (p.status === 'maintenance') {
      color = '#f59e0b';
      statusCode = 'BAKIMDA';
      iconSymbol = '⚙';
    }

    const coverageCircle = (state.systemMeta.showCoverageRadius && p.status === 'active')
      ? `<circle cx="${p.svgPos.x}" cy="${p.svgPos.y}" r="68" fill="${color}" fill-opacity="0.10" stroke="${color}" stroke-opacity="0.45" stroke-width="1" stroke-dasharray="4,4" pointer-events="none" />`
      : '';

    const pulseCircle = (p.status === 'active' && !state.systemMeta.emergencyStopActive)
      ? `<circle cx="${p.svgPos.x}" cy="${p.svgPos.y}" r="14" fill="none" stroke="${color}" stroke-width="2" class="pole-pulse" pointer-events="none" />`
      : '';

    return `
      <g>
        ${coverageCircle}
        ${pulseCircle}
        <g class="pole-marker ${isSelected ? 'pole-marker-selected' : ''}" onclick="selectPole('${p.id}')" role="button" tabindex="0" aria-label="Kontrol Direği ${p.id} (${statusCode})">
          <circle class="pole-outer-ring" cx="${p.svgPos.x}" cy="${p.svgPos.y}" r="${isSelected ? '18' : '15'}" fill="#0f172a" stroke="${isSelected ? '#ffffff' : color}" stroke-width="${isSelected ? '3.5' : '2.5'}" />
          <circle cx="${p.svgPos.x}" cy="${p.svgPos.y}" r="10" fill="${color}" />
          <text x="${p.svgPos.x}" y="${p.svgPos.y + 3.5}" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="800">${iconSymbol}</text>
          <rect x="${p.svgPos.x - 30}" y="${p.svgPos.y + 19}" width="60" height="18" rx="4" fill="#0f172a" fill-opacity="0.92" stroke="${color}" stroke-width="1" />
          <text x="${p.svgPos.x}" y="${p.svgPos.y + 31}" text-anchor="middle" fill="#ffffff" font-size="9.5" font-weight="700">${p.id}</text>
        </g>
      </g>
    `;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 850 480" class="w-full h-auto block select-none rounded-xl bg-emerald-950 border border-emerald-800/60 shadow-inner" role="img" aria-label="Akıllı Tarım Arazisi ve Kontrol Direkleri Haritası">
      <defs>
        <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#065f46" stroke-width="0.6" stroke-opacity="0.55" />
        </pattern>
      </defs>
      <!-- Arka Plan Izgara -->
      <rect width="850" height="480" fill="#032217" />
      <rect width="850" height="480" fill="url(#gridPattern)" />

      <!-- Kuzey Orman Sınırı -->
      <rect x="0" y="0" width="850" height="28" fill="#02170f" />
      <text x="425" y="18" text-anchor="middle" fill="#6ee7b7" font-size="10" font-weight="600" letter-spacing="1.5">▲ KUZEY ORMAN KUŞAĞI VE YABAN HAYATI GEÇİŞ HATTI ▲</text>

      <!-- Ana Sulama Kanalı ve Tarla Yolu -->
      <path d="M 425 28 L 402 480" stroke="#0284c7" stroke-width="10" stroke-opacity="0.55" fill="none" />
      <path d="M 425 28 L 402 480" stroke="#38bdf8" stroke-width="2" stroke-dasharray="8,6" fill="none" />
      <text x="415" y="252" text-anchor="middle" fill="#bae6fd" font-size="9" font-weight="600">ANA SULAMA KANALI</text>

      <path d="M 35 225 L 820 252" stroke="#64748b" stroke-width="9" stroke-opacity="0.65" fill="none" />
      <path d="M 35 225 L 820 252" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,6" fill="none" />

      <!-- Tarım Parselleri -->
      ${fieldsSvg}

      <!-- Kontrol Direkleri -->
      ${polesSvg}

      <!-- Pusula ve Ölçek -->
      <g transform="translate(805, 65)">
        <circle cx="0" cy="0" r="18" fill="#0f172a" fill-opacity="0.85" stroke="#34d399" stroke-width="1.2" />
        <polygon points="0,-12 -5,6 0,2 5,6" fill="#34d399" />
        <text x="0" y="-14" text-anchor="middle" fill="#a7f3d0" font-size="8" font-weight="700">K</text>
      </g>
      <g transform="translate(20, 460)">
        <line x1="0" y1="0" x2="80" y2="0" stroke="#a7f3d0" stroke-width="2" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#a7f3d0" stroke-width="2" />
        <line x1="80" y1="-4" x2="80" y2="4" stroke="#a7f3d0" stroke-width="2" />
        <text x="40" y="-5" text-anchor="middle" fill="#a7f3d0" font-size="9">250 Metre</text>
      </g>
    </svg>
  `;
}

function initOrUpdateLeafletMap(state, selectedPoleId) {
  const mapEl = document.getElementById('leaflet-map-container');
  const fallbackEl = document.getElementById('leaflet-fallback-notice');
  if (!mapEl) return;

  if (typeof window.L === 'undefined' || state.systemMeta.connectionState === 'offline') {
    if (fallbackEl) fallbackEl.classList.remove('hidden');
    return;
  }

  try {
    if (!leafletMapInstance) {
      leafletMapInstance = window.L.map('leaflet-map-container', {
        center: [39.9215, 32.8425],
        zoom: 15
      });

      const tileLayer = window.L.tileLayer(state.systemMeta.mapTileUrl, {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap katkıda bulunanlar'
      });

      tileLayer.on('tileerror', function () {
        if (fallbackEl) fallbackEl.classList.remove('hidden');
      });

      tileLayer.addTo(leafletMapInstance);
    }

    // İşaretçileri temizle ve yeniden çiz
    leafletMapInstance.eachLayer((layer) => {
      if (layer instanceof window.L.CircleMarker || layer instanceof window.L.Polygon) {
        leafletMapInstance.removeLayer(layer);
      }
    });

    state.poles.forEach((p) => {
      const color = p.status === 'active' ? '#10b981' : (p.status === 'offline' ? '#ef4444' : '#f59e0b');
      const marker = window.L.circleMarker(p.latLng, {
        radius: p.id === selectedPoleId ? 12 : 9,
        fillColor: color,
        color: '#0f172a',
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(leafletMapInstance);

      marker.bindPopup(`<strong>${p.id} — ${p.name}</strong><br/>Durum: ${p.status.toUpperCase()}<br/>Son Veri: ${p.lastPing}`);
      marker.on('click', () => {
        window.selectPole(p.id);
      });
    });

    setTimeout(() => {
      if (leafletMapInstance) leafletMapInstance.invalidateSize();
    }, 150);
  } catch (err) {
    if (fallbackEl) fallbackEl.classList.remove('hidden');
  }
}
