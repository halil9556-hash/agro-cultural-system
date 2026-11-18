# AgroShield Pro — Akıllı Tarım ve Bitki Koruma Yönetim Sistemi

Modern tarım arazilerinde güneş enerjili akıllı kontrol direkleri, yapay zekâ destekli canlı tespiti, bitki risk analizi ve insan onaylı güvenli müdahale süreçlerini yöneten profesyonel web uygulaması ve sistem mimarisi.

## 1. Proje Klasör Yapısı

```text
agroshield-pro/
├── index.html                  # Ana uygulama kabuğu, erişilebilir navigasyon ve görünüm şablonları
├── package.json                # Proje bağımlılıkları ve çalıştırma betikleri
├── .env.example                # Güvenli ortam değişkenleri şablonu (API anahtarı içermez)
├── README.md                   # Kurulum, mimari ve kullanım kılavuzu
├── css/
│   └── styles.css              # Doğa/tarım odaklı renk paleti, duyarlı (responsive) tasarım ve erişilebilirlik stilleri
├── js/
│   ├── data.js                 # Veri modelleri (Direkler, Parseller, YZ Tespitleri, Kimyasal Uygulamalar, Olaylar) ve localStorage katmanı
│   ├── auth.js                 # Rol Tabanlı Yetkilendirme (RBAC: Yönetici, Operatör, Gözlemci) ve güvenlik doğrulama modülü
│   ├── map.js                  # Etkileşimli SVG Arazi/Kadastro Haritası + Yapılandırılabilir Leaflet Coğrafi Harita modülü
│   ├── charts.js               # Chart.js tabanlı günlük/haftalık/aylık analiz ve direk çalışma süresi grafikleri
│   └── app.js                  # Durum yönetimi, arama/filtreleme, onay akışları, CSV dışa aktarma ve Acil Durdurma (E-Stop) kontrolcüsü
├── backend/
│   └── server.js               # Uzaktan erişim, gerçek cihaz telemetrisi, JWT yetkilendirme ve donanım güvenlik kilidi için örnek Node.js/Express API sunucusu
└── scripts/
    └── build-canvas.py         # Modüler dosyaları tek dosyalık izole Canvas önizlemesine derleyen yardımcı betik
```

## 2. Kullanılan Teknolojiler

- **Ön Yüz (Frontend):** HTML5 (Semantik ve ARIA uyumlu), CSS3 (Özel tasarım değişkenleri + Tailwind CSS 3.4 yardımcı sınıfları), Modern JavaScript (ES6+ Modüler Mimari).
- **Görselleştirme ve Harita:** Chart.js 4.4.1 (dinamik istatistik ve rapor grafikleri), Etkileşimli SVG Arazi & Kadastro Haritası (çevrim dışı %100 çalışır) + Leaflet 1.9.4 Coğrafi Harita entegrasyonu (yapılandırılabilir karo sunucusu ve bağlantı koptuğunda otomatik yedekleme).
- **Veri ve Durum Yönetimi:** Tarayıcıda güvenli `localStorage` kalıcılığı (`try/catch` korumalı), gerçek zamanlı filtreleme ve UTF-8 BOM destekli CSV dışa aktarma.
- **Arka Uç (Backend Referans Mimarisi):** Node.js, Express, MQTT (saha direkleri telemetrisi), WebSocket (canlı bildirimler), JWT + RBAC (Rol Tabanlı Erişim Kontrolü).

## 3. Kurulum ve Çalıştırma Adımları

### Seçenek A: Ön Yüz Uygulamasını Doğrudan Çalıştırma (Hızlı Başlangıç)
Projenin ön yüzü herhangi bir derleme adımı gerektirmeden yerel bir statik sunucu üzerinden hemen çalıştırılabilir:

```bash
# Python 3 ile başlatma:
python3 -m http.server 8080

# Veya Node.js npx serve ile başlatma:
npx serve . -l 3000
```
Ardından tarayıcınızda `http://localhost:8080` (veya `http://localhost:3000`) adresini açın.

### Seçenek B: Backend API Sunucusu ile Birlikte Çalıştırma
Gerçek saha direklerinden MQTT/REST üzerinden veri almak ve çok kullanıcılı oturum yönetimi için:

```bash
cp .env.example .env
npm install
npm start
```

## 4. Simülasyon ve Gerçek Donanım / Backend Entegrasyonu Ayrımı

Uygulama içerisinde **gerçek donanım bağlantısı gerektiren özellikler** yanıltıcı bir şekilde çalışıyormuş gibi gösterilmez; her ekranda açık **Simülasyon Ortamı Etiketi** bulunur:

1. **Yapay Zekâ ve Kamera Akışı:** Gerçek saha kameraları (RTSP/WebRTC) ve kenar yapay zekâ birimi (NVIDIA Jetson / Hailo YOLOv8 modeli) bağlı olmadığında sistem doğrulanmış örnek veri seti üzerinden çalışır ve kullanıcıya yeni simülasyon tespiti üretme imkânı sunar.
2. **Güvenli Müdahale ve Kimyasal Uygulama:** Hiçbir canlıya otomatik fiziksel veya kimyasal müdahale yapılmaz. Sistem; **Risk Analizi → Tür Doğrulama (Yararlı Tür Koruması) → 4 Maddeli Güvenlik Kontrol Listesi → Ziraat Mühendisi (Yönetici) Onayı** akışını zorunlu tutar.
3. **Fiziksel Donanım ve Acil Durdurma (E-Stop):** Üst barda yer alan **ACİL DURDURMA** butonu aktif simülasyon görevlerini anında askıya alır ve işlem kaydı (audit log) oluşturur. Gerçek saha kurulumunda bu buton donanımsal güvenlik rölesini (Hardware Safety Interlock) kesmek üzere `backend/server.js` içerisindeki çift yönlü mTLS kanalını tetikler.
