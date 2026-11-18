/**
 * AgroShield Pro — Veri Modelleri ve Başlangıç Simülasyon Veri Seti
 * Gerçek kamera, sensör veya donanım bağlı olmadığında şeffaf simülasyon verisi sağlar.
 */

const STORAGE_KEY = 'agroshield_pro_state_v1';

const INITIAL_STATE = {
  systemMeta: {
    appName: 'AgroShield Pro',
    version: '1.2.0',
    isSimulationMode: true,
    connectionState: 'online', // 'online' | 'offline' | 'api_error'
    emergencyStopActive: false,
    emergencyStopReason: '',
    emergencyStopTime: null,
    lastSyncTime: '2026-10-15 18:55:12',
    uptimePercent: 98.4,
    telemetryLatencyMs: 42,
    mapMode: 'svg', // 'svg' | 'leaflet'
    mapTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    mapApiKeyConfigured: false,
    showCoverageRadius: true,
    showRiskHeatmap: false
  },

  currentUserRole: 'admin', // 'admin' | 'operator' | 'viewer'

  roles: {
    admin: {
      id: 'admin',
      name: 'ZiraatYönetici (Baş Mühendis)',
      title: 'Yetkili Ziraat Mühendisi & Sistem Yöneticisi',
      badgeColor: 'bg-emerald-700 text-white',
      permissions: ['view_all', 'manage_detections', 'approve_chemical', 'create_chemical', 'manage_poles', 'trigger_estop', 'reset_estop', 'export_reports', 'manage_settings']
    },
    operator: {
      id: 'operator',
      name: 'SahaOperatörü (Tekniker)',
      title: 'Saha Operasyon ve Gözlem Teknikeri',
      badgeColor: 'bg-amber-600 text-white',
      permissions: ['view_all', 'manage_detections', 'create_chemical', 'trigger_estop', 'export_reports']
    },
    viewer: {
      id: 'viewer',
      name: 'DenetçiGözlemci (Salt Okunur)',
      title: 'Bağımsız Denetçi / İzleme Kullanıcısı',
      badgeColor: 'bg-slate-600 text-white',
      permissions: ['view_all', 'export_reports']
    }
  },

  fields: [
    {
      id: 'PARSEL-A1',
      name: 'A-1 Kuzey Buğday Parseli',
      crop: 'Kışlık Ekmeklik Buğday',
      stage: 'Kardeşlenme Dönemi',
      areaHa: 42.5,
      soilMoisture: 64,
      ambientTempC: 19.4,
      windSpeedKmh: 8.2,
      riskLevel: 'Orta',
      activePolesCount: 2,
      totalPolesCount: 2,
      svgPoints: '55,45 430,45 405,215 55,215',
      labelPos: { x: 230, y: 125 },
      centerLatLng: [39.9255, 32.8369],
      description: 'Kuzey sınır hattı orman kenarına komşu olduğundan yaban domuzu ve kemirgen geçişlerine açık bölge.'
    },
    {
      id: 'PARSEL-B2',
      name: 'B-2 Güney Domates & Biber Alanı',
      crop: 'Sanayi Tipi Domates',
      stage: 'Meyve Tutumu ve Olgunlaşma',
      areaHa: 28.0,
      soilMoisture: 71,
      ambientTempC: 21.8,
      windSpeedKmh: 6.5,
      riskLevel: 'Kritik',
      activePolesCount: 2,
      totalPolesCount: 3,
      svgPoints: '55,235 400,235 385,435 55,435',
      labelPos: { x: 220, y: 340 },
      centerLatLng: [39.9180, 32.8365],
      description: 'Tuta absoluta (Domates Güvesi) ve yaprak kurdu açısından yüksek duyarlılığa sahip yoğun üretim parseli.'
    },
    {
      id: 'PARSEL-C3',
      name: 'C-3 Doğu Zeytinlik ve Meyve Bahçesi',
      crop: 'Gemlik Zeytin & Ceviz',
      stage: 'Hasat Öncesi Dönem',
      areaHa: 54.0,
      soilMoisture: 52,
      ambientTempC: 20.1,
      windSpeedKmh: 11.4,
      riskLevel: 'Düşük',
      activePolesCount: 1,
      totalPolesCount: 1,
      svgPoints: '450,45 795,45 795,245 425,215',
      labelPos: { x: 625, y: 135 },
      centerLatLng: [39.9252, 32.8495],
      description: 'Feromon tuzakları ve biyolojik mücadele ajanları ile dengeli korunan çok yıllık ağaçlık parsel.'
    },
    {
      id: 'PARSEL-D4',
      name: 'D-4 Batı Mısır & Ayçiçeği Tarlası',
      crop: 'Silajlık Mısır & Ayçiçeği',
      stage: 'Koçan Dolumu',
      areaHa: 61.5,
      soilMoisture: 58,
      ambientTempC: 20.6,
      windSpeedKmh: 9.0,
      riskLevel: 'Yüksek',
      activePolesCount: 1,
      totalPolesCount: 2,
      svgPoints: '420,235 795,265 795,435 405,435',
      labelPos: { x: 610, y: 345 },
      centerLatLng: [39.9175, 32.8490],
      description: 'Kuş sürüleri ve yaban domuzu girişlerinin yoğunlaştığı geniş tarla alanı.'
    }
  ],

  poles: [
    {
      id: 'KD-101',
      name: 'Kuzey-Batı Sınır Direği',
      fieldId: 'PARSEL-A1',
      status: 'active', // 'active' | 'offline' | 'maintenance'
      lastPing: '2026-10-15 18:54:50',
      batteryPct: 94,
      solarWatt: 48,
      signalDbm: -62,
      aiUnitTempC: 44.2,
      cameraStatus: '4K RGB + Termal Aktif',
      deterrentStatus: 'Ultrasonik Modül Hazır',
      uptimeHours30d: 716,
      offlineHours30d: 4,
      svgPos: { x: 145, y: 105 },
      latLng: [39.9272, 32.8330],
      firmware: 'v3.4.2-edge',
      notes: 'Kuzey orman geçiş koridorunu izliyor. Son 24 saatte 3 tespit kaydetti.'
    },
    {
      id: 'KD-102',
      name: 'Kuzey-Doğu Su Kanalı Direği',
      fieldId: 'PARSEL-A1',
      status: 'active',
      lastPing: '2026-10-15 18:55:04',
      batteryPct: 88,
      solarWatt: 45,
      signalDbm: -67,
      aiUnitTempC: 45.0,
      cameraStatus: '4K RGB + Termal Aktif',
      deterrentStatus: 'Ultrasonik Modül Hazır',
      uptimeHours30d: 712,
      offlineHours30d: 8,
      svgPos: { x: 355, y: 155 },
      latLng: [39.9248, 32.8405],
      firmware: 'v3.4.2-edge',
      notes: 'Sulama kanalı çevresindeki kemirgen ve kuş hareketliliğini takip ediyor.'
    },
    {
      id: 'KD-103',
      name: 'Domates Parseli Merkez Direği',
      fieldId: 'PARSEL-B2',
      status: 'active',
      lastPing: '2026-10-15 18:55:10',
      batteryPct: 91,
      solarWatt: 52,
      signalDbm: -58,
      aiUnitTempC: 46.8,
      cameraStatus: 'Makro Optik + Spektral Kamera Aktif',
      deterrentStatus: 'Feromon & Biyopestisit Ünitesi Kilitli (Onay Bekliyor)',
      uptimeHours30d: 718,
      offlineHours30d: 2,
      svgPos: { x: 150, y: 300 },
      latLng: [39.9195, 32.8340],
      firmware: 'v3.4.2-edge',
      notes: 'Tuta absoluta feromon tuzağı kamera sayımı aktif. Yüksek yoğunluk uyarısı verdi.'
    },
    {
      id: 'KD-104',
      name: 'Güney Sera Giriş Direği',
      fieldId: 'PARSEL-B2',
      status: 'active',
      lastPing: '2026-10-15 18:54:38',
      batteryPct: 82,
      solarWatt: 39,
      signalDbm: -71,
      aiUnitTempC: 43.5,
      cameraStatus: '4K RGB + Makro Sensör Aktif',
      deterrentStatus: 'Akustik + Işık Caydırıcı Hazır',
      uptimeHours30d: 705,
      offlineHours30d: 15,
      svgPos: { x: 315, y: 285 },
      latLng: [39.9192, 32.8392],
      firmware: 'v3.4.1-edge',
      notes: 'Yaprak biti ve pamuk yaprak kurdu erken uyarı noktası.'
    },
    {
      id: 'KD-105',
      name: 'Güney-Batı Sınır Direği',
      fieldId: 'PARSEL-B2',
      status: 'offline',
      lastPing: '2026-10-15 14:12:09',
      batteryPct: 14,
      solarWatt: 0,
      signalDbm: -98,
      aiUnitTempC: 28.0,
      cameraStatus: 'Bağlantı Yok (Son Durum: Aktif)',
      deterrentStatus: 'Çevrim Dışı — Güvenlik Kilidi Devrede',
      uptimeHours30d: 642,
      offlineHours30d: 78,
      svgPos: { x: 115, y: 400 },
      latLng: [39.9162, 32.8325],
      firmware: 'v3.4.0-edge',
      notes: 'Güneş paneli şarj regülatörü uyarısı sonrası 14:12 itibarıyla bağlantı kesildi. Saha ekibi yönlendirildi.'
    },
    {
      id: 'KD-106',
      name: 'Doğu Zeytinlik Gözlem Direği',
      fieldId: 'PARSEL-C3',
      status: 'active',
      lastPing: '2026-10-15 18:55:01',
      batteryPct: 97,
      solarWatt: 55,
      signalDbm: -60,
      aiUnitTempC: 42.1,
      cameraStatus: '4K RGB + Termal Aktif',
      deterrentStatus: 'Yalnızca Gözlem Modu (Hasat Öncesi)',
      uptimeHours30d: 719,
      offlineHours30d: 1,
      svgPos: { x: 615, y: 125 },
      latLng: [39.9255, 32.8492],
      firmware: 'v3.4.2-edge',
      notes: 'Zeytin sineği tuzak takibi ve yararlı böcek popülasyonu izleme noktası.'
    },
    {
      id: 'KD-107',
      name: 'Batı Mısır Hattı Direği',
      fieldId: 'PARSEL-D4',
      status: 'active',
      lastPing: '2026-10-15 18:54:59',
      batteryPct: 86,
      solarWatt: 44,
      signalDbm: -65,
      aiUnitTempC: 45.9,
      cameraStatus: '4K Termal Gece Görüş Aktif',
      deterrentStatus: 'Ultrasonik Frekans Modülü Hazır',
      uptimeHours30d: 710,
      offlineHours30d: 10,
      svgPos: { x: 525, y: 310 },
      latLng: [39.9185, 32.8460],
      firmware: 'v3.4.2-edge',
      notes: 'Gece saatlerinde yaban domuzu sürüsü hareketlerini termal sensör ile tespit ediyor.'
    },
    {
      id: 'KD-108',
      name: 'Güney-Doğu Ayçiçeği Direği',
      fieldId: 'PARSEL-D4',
      status: 'maintenance',
      lastPing: '2026-10-15 18:40:00',
      batteryPct: 76,
      solarWatt: 32,
      signalDbm: -69,
      aiUnitTempC: 39.0,
      cameraStatus: 'Optik Kalibrasyon Yapılıyor (Bakımda)',
      deterrentStatus: 'Bakım Kilidi Aktif — Müdahale Devre Dışı',
      uptimeHours30d: 688,
      offlineHours30d: 32,
      svgPos: { x: 715, y: 380 },
      latLng: [39.9165, 32.8525],
      firmware: 'v3.4.2-edge',
      notes: 'Periyodik lens temizliği ve sensör kalibrasyonu nedeniyle planlı bakım modunda.'
    }
  ],

  detections: [
    {
      id: 'TSP-2026-891',
      species: 'Tuta absoluta (Domates Güvesi)',
      category: 'Zararlı Böcek / Lepidoptera',
      timestamp: '2026-10-15 18:42:15',
      dateOnly: '2026-10-15',
      poleId: 'KD-103',
      fieldId: 'PARSEL-B2',
      confidencePct: 96.4,
      riskLevel: 'Kritik',
      aiAnalysis: 'Feromon tuzağı makro kamerasında son 6 saatte eşik değerin (25 birey/tuzak) üzerinde ergin birey ve yaprak galerisi semptomu saptandı.',
      recommendedAction: 'Uzman ziraat mühendisi onayıyla ruhsatlı Bacillus thuringiensis (Biyolarvasit) lokal uygulaması ve feromon kapsül yenilemesi.',
      status: 'Bekleyen' // 'Bekleyen' | 'Onaylanan' | 'Tamamlanan' | 'İptal Edilen'
    },
    {
      id: 'TSP-2026-890',
      species: 'Sus scrofa (Yaban Domuzu Sürüsü - 4 Birey)',
      category: 'Yabani Memeli',
      timestamp: '2026-10-15 17:58:03',
      dateOnly: '2026-10-15',
      poleId: 'KD-107',
      fieldId: 'PARSEL-D4',
      confidencePct: 98.1,
      riskLevel: 'Yüksek',
      aiAnalysis: 'Termal kamera ile parsel sınırına 35 metre mesafede 4 bireylik sürü hareketi doğrulandı. Mısır koçanlarında ezilme riski yüksek.',
      recommendedAction: 'Kimyasal kullanılmaz. Zararsız değişken frekanslı ultrasonik ses + çakarlı LED ışık caydırıcı protokolü (120 sn).',
      status: 'Onaylanan'
    },
    {
      id: 'TSP-2026-889',
      species: 'Spodoptera littoralis (Pamuk Yaprak Kurdu)',
      category: 'Zararlı Böcek / Lepidoptera',
      timestamp: '2026-10-15 16:20:44',
      dateOnly: '2026-10-15',
      poleId: 'KD-104',
      fieldId: 'PARSEL-B2',
      confidencePct: 91.8,
      riskLevel: 'Yüksek',
      aiAnalysis: 'Alt yaprak yüzeylerinde larva beslenme izleri ve 14.2 birey/m² yoğunluk tahmini yapıldı.',
      recommendedAction: 'Rüzgâr hızı < 10 km/s olduğunda hedefli Azadirachtin (Neem özütü) biyolojik uygulama planlanması.',
      status: 'Bekleyen'
    },
    {
      id: 'TSP-2026-888',
      species: 'Coccinella septempunctata (Yedi Noktalı Uğur Böceği)',
      category: 'Yararlı Böcek / Doğal Avcı',
      timestamp: '2026-10-15 15:10:19',
      dateOnly: '2026-10-15',
      poleId: 'KD-106',
      fieldId: 'PARSEL-C3',
      confidencePct: 97.5,
      riskLevel: 'Yararlı / Zararsız',
      aiAnalysis: 'Yaprak biti kolonilerini doğal olarak baskılayan yararlı avcı böcek popülasyonu tespit edildi.',
      recommendedAction: 'KESİNLİKLE MÜDAHALE EDİLMEZ. Bölgede kimyasal ilaçlama kısıtlaması (Koruma Kilidi) sürdürülmeli.',
      status: 'Tamamlanan'
    },
    {
      id: 'TSP-2026-887',
      species: 'Corvus frugilegus (Ekin Kargası Sürüsü)',
      category: 'Kuş / Kanatlı',
      timestamp: '2026-10-15 11:35:00',
      dateOnly: '2026-10-15',
      poleId: 'KD-101',
      fieldId: 'PARSEL-A1',
      confidencePct: 94.2,
      riskLevel: 'Orta',
      aiAnalysis: 'Yeni çimlenen buğday sıralarında gagalamaya bağlı lokal tohum kaybı riski saptandı.',
      recommendedAction: 'Doğal yırtıcı kuş sesi simülasyonu (biyomimetik akustik caydırıcı) ile sürü uzaklaştırma.',
      status: 'Tamamlanan'
    },
    {
      id: 'TSP-2026-886',
      species: 'Microtus arvalis (Tarla Faresi)',
      category: 'Kemirgen',
      timestamp: '2026-10-14 22:14:52',
      dateOnly: '2026-10-14',
      poleId: 'KD-102',
      fieldId: 'PARSEL-A1',
      confidencePct: 89.6,
      riskLevel: 'Orta',
      aiAnalysis: 'Termal kamerada su kanalı şevinde gece aktivitesi ve 3 aktif galeri girişi belirlendi.',
      recommendedAction: 'Saha operatörü tarafından mekanik kapan kontrolü ve yırtıcı kuş tüneklerinin (T-tünek) yerleştirilmesi.',
      status: 'Onaylanan'
    },
    {
      id: 'TSP-2026-885',
      species: 'Bactrocera oleae (Zeytin Sineği)',
      category: 'Zararlı Böcek / Diptera',
      timestamp: '2026-10-13 14:05:30',
      dateOnly: '2026-10-13',
      poleId: 'KD-106',
      fieldId: 'PARSEL-C3',
      confidencePct: 93.0,
      riskLevel: 'Düşük',
      aiAnalysis: 'Sarı yapışkan tuzakta ekonomik zarar eşiğinin altında (2 birey/tuzak) tespit yapıldı. Hasat öncesi bekleme süresi nedeniyle ilaçlama uygun değil.',
      recommendedAction: 'Yalnızca kitlesel tuzaklama ile izlemeye devam edilmesi, kimyasal uygulamanın reddedilmesi.',
      status: 'İptal Edilen'
    },
    {
      id: 'TSP-2026-884',
      species: 'Lepus europaeus (Yaban Tavşanı)',
      category: 'Yabani Memeli',
      timestamp: '2026-10-11 06:18:10',
      dateOnly: '2026-10-11',
      poleId: 'KD-101',
      fieldId: 'PARSEL-A1',
      confidencePct: 95.3,
      riskLevel: 'Düşük',
      aiAnalysis: 'Tekil birey sınır hattından geçiş yaptı, ekinlerde ekonomik zarar bulgusu yok.',
      recommendedAction: 'Müdahale gerekmez, pasif gözlem kaydı olarak arşivlendi.',
      status: 'Tamamlanan'
    }
  ],

  chemicalApplications: [
    {
      id: 'KIM-2026-401',
      detectionId: 'TSP-2026-891',
      fieldId: 'PARSEL-B2',
      fieldName: 'B-2 Güney Domates & Biber Alanı',
      crop: 'Sanayi Tipi Domates',
      targetOrganism: 'Tuta absoluta (Domates Güvesi)',
      productName: 'Biolep BT-Kurstaki (Bacillus thuringiensis var. kurstaki)',
      approvalLicenseNo: 'BKÜ-RUHSAT-2021/4892',
      dosagePerDecare: '100 g / dekar (400 L su ile)',
      phiDays: 3, // Hasat Öncesi Bekleme Süresi
      windSpeedKmh: 6.5,
      tempC: 21.8,
      safetyChecks: {
        agronomistVerified: true,
        labelDosageVerified: true,
        weatherWindVerified: true,
        fieldClearVerified: false
      },
      status: 'Onay Bekliyor', // 'Onay Bekliyor' | 'Uygulamada (Simülasyon)' | 'Tamamlandı' | 'İptal / Durduruldu'
      requestedBy: 'SahaOperatörü (Tekniker)',
      approvedBy: '—',
      timestamp: '2026-10-15 18:45:00',
      safetyWarnings: 'Uygulama öncesi parselde çalışan personel bulunmadığı doğrulanmalı (4. Güvenlik Maddesi eksik). Arıların aktif olduğu öğle saatlerinde uygulanmamalıdır.'
    },
    {
      id: 'KIM-2026-400',
      detectionId: 'TSP-2026-889',
      fieldId: 'PARSEL-B2',
      fieldName: 'B-2 Güney Domates & Biber Alanı',
      crop: 'Sanayi Tipi Domates',
      targetOrganism: 'Spodoptera littoralis (Pamuk Yaprak Kurdu)',
      productName: 'NeemAzal T/S (Azadirachtin 10 g/L - Organik Uyumlu)',
      approvalLicenseNo: 'BKÜ-RUHSAT-2019/3104',
      dosagePerDecare: '250 ml / dekar',
      phiDays: 3,
      windSpeedKmh: 6.5,
      tempC: 21.8,
      safetyChecks: {
        agronomistVerified: true,
        labelDosageVerified: true,
        weatherWindVerified: true,
        fieldClearVerified: true
      },
      status: 'Uygulamada (Simülasyon)',
      requestedBy: 'ZiraatYönetici (Baş Mühendis)',
      approvedBy: 'ZiraatYönetici (Baş Mühendis)',
      timestamp: '2026-10-15 16:40:00',
      safetyWarnings: 'Etiket dozunu aşmayın. Hasat öncesi bekleme süresi 3 gündür. Koruyucu eldiven ve maske (KKD) zorunludur.'
    },
    {
      id: 'KIM-2026-399',
      detectionId: 'TSP-2026-887',
      fieldId: 'PARSEL-A1',
      fieldName: 'A-1 Kuzey Buğday Parseli',
      crop: 'Kışlık Ekmeklik Buğday',
      targetOrganism: 'Corvus frugilegus (Ekin Kargası)',
      productName: 'Kimyasal Yok — Biyomimetik Akustik Caydırıcı Protokolü',
      approvalLicenseNo: 'FİZİKSEL-ÖNLEM-01',
      dosagePerDecare: '0 ml (Akustik 75 dB / 90 sn)',
      phiDays: 0,
      windSpeedKmh: 8.2,
      tempC: 19.4,
      safetyChecks: {
        agronomistVerified: true,
        labelDosageVerified: true,
        weatherWindVerified: true,
        fieldClearVerified: true
      },
      status: 'Tamamlandı',
      requestedBy: 'SahaOperatörü (Tekniker)',
      approvedBy: 'ZiraatYönetici (Baş Mühendis)',
      timestamp: '2026-10-15 11:42:10',
      safetyWarnings: 'Kimyasal kalıntı bırakmaz. Hedef dışı canlılara zarar vermez.'
    },
    {
      id: 'KIM-2026-398',
      detectionId: 'TSP-2026-885',
      fieldId: 'PARSEL-C3',
      fieldName: 'C-3 Doğu Zeytinlik ve Meyve Bahçesi',
      crop: 'Gemlik Zeytin',
      targetOrganism: 'Bactrocera oleae (Zeytin Sineği)',
      productName: 'Spinosad 480 g/L Lokal Yem İlaçlaması',
      approvalLicenseNo: 'BKÜ-RUHSAT-2020/1190',
      dosagePerDecare: '25 ml / dekar (Lokal Dal Uygulaması)',
      phiDays: 7,
      windSpeedKmh: 16.8,
      tempC: 20.1,
      safetyChecks: {
        agronomistVerified: true,
        labelDosageVerified: true,
        weatherWindVerified: false,
        fieldClearVerified: true
      },
      status: 'İptal / Durduruldu',
      requestedBy: 'SahaOperatörü (Tekniker)',
      approvedBy: 'ZiraatYönetici (Baş Mühendis - Reddetti)',
      timestamp: '2026-10-13 14:30:00',
      safetyWarnings: 'İPTAL NEDENİ: Hasada 5 gün kalması (PHI 7 gün şartı sağlanmıyor) ve rüzgâr hızının 15 km/s üzerinde olması nedeniyle sistem güvenlik kilidi tarafından reddedildi.'
    }
  ],

  events: [
    {
      id: 'OLAY-901',
      type: 'critical',
      category: 'YZ Tespit Uyarısı',
      title: 'KD-103 Direğinde Kritik Yoğunlukta Tuta absoluta Tespiti',
      message: 'B-2 Güney Domates Parselinde ekonomik zarar eşiği aşıldı (%96.4 güven skoru). Uzman müdahale onayı bekleniyor.',
      timestamp: '2026-10-15 18:42:18',
      read: false
    },
    {
      id: 'OLAY-900',
      type: 'warning',
      category: 'Direk Bağlantı Uyarısı',
      title: 'KD-105 Güney-Batı Sınır Direği Çevrim Dışı',
      message: 'KD-105 direğinden 14:12 itibarıyla telemetri alınamıyor (Son batarya: %14). Fiziksel müdahale kilidi otomatik olarak güvenli konuma alındı.',
      timestamp: '2026-10-15 14:15:00',
      read: false
    },
    {
      id: 'OLAY-899',
      type: 'info',
      category: 'Ekosistem Koruma Kilidi',
      title: 'KD-106 Bölgesinde Yararlı Böcek (Uğur Böceği) Koruması Aktif',
      message: 'C-3 Zeytinlik parselinde Coccinella septempunctata tespit edildiğinden kimyasal uygulama önerileri otomatik olarak devre dışı bırakıldı.',
      timestamp: '2026-10-15 15:10:22',
      read: true
    },
    {
      id: 'OLAY-898',
      type: 'success',
      category: 'Güvenli Caydırıcı',
      title: 'KD-101 Akustik Kuş Caydırıcı Görevi Tamamlandı',
      message: 'A-1 Buğday parselinde kimyasal kullanılmadan 90 saniyelik akustik protokol ile ekin kargası sürüsü uzaklaştırıldı.',
      timestamp: '2026-10-15 11:44:00',
      read: true
    },
    {
      id: 'OLAY-897',
      type: 'info',
      category: 'Planlı Bakım',
      title: 'KD-108 Direği Bakım Moduna Alındı',
      message: 'Optik lens temizliği ve sensör kalibrasyonu için KD-108 direği saha ekibi tarafından bakım moduna geçirildi.',
      timestamp: '2026-10-15 10:30:00',
      read: true
    }
  ],

  analyticsSeries: {
    daily: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '18:55'],
      highRisk: [1, 2, 1, 2, 3, 2],
      lowMedRisk: [0, 1, 3, 2, 2, 1],
      beneficial: [0, 0, 1, 2, 1, 1]
    },
    weekly: {
      labels: ['9 Eki', '10 Eki', '11 Eki', '12 Eki', '13 Eki', '14 Eki', '15 Eki'],
      highRisk: [3, 4, 2, 5, 4, 6, 7],
      lowMedRisk: [4, 5, 6, 4, 5, 5, 5],
      beneficial: [2, 3, 2, 4, 3, 2, 2]
    },
    monthly: {
      labels: ['1. Hafta (Eyl Sonu)', '2. Hafta (1-7 Eki)', '3. Hafta (8-15 Eki)', '4. Hafta (Tahmin/Projeksiyon)'],
      highRisk: [14, 19, 31, 22],
      lowMedRisk: [21, 25, 34, 28],
      beneficial: [9, 12, 18, 15]
    }
  }
};

function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.poles && parsed.detections && parsed.chemicalApplications) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('localStorage erişimi kısıtlı, bellek içi durum kullanılıyor:', err);
  }
  return JSON.parse(JSON.stringify(INITIAL_STATE));
}

function saveAppState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // Sandbox iframe içerisinde localStorage engellenirse sessizce bellek içi devam et
  }
}

function resetAppState() {
  const fresh = JSON.parse(JSON.stringify(INITIAL_STATE));
  saveAppState(fresh);
  return fresh;
}
