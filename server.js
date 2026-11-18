/**
 * AgroShield Pro — Uzaktan Erişim, Telemetri ve Güvenli Donanım Kontrol Backend Sunucusu
 * Not: Ön yüz prototipi tarayıcıda bağımsız çalışabilmektedir. Gerçek saha kurulumunda
 * sensör direklerinden (MQTT/TLS) veri almak, çok kullanıcılı JWT oturumlarını doğrulamak ve
 * donanımsal Acil Durdurma (E-Stop) rölesini tetiklemek için bu servis çalıştırılır.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-in-production';

// Rol Tabanlı Yetkilendirme (RBAC) Ara Katmanı
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Kimlik doğrulama başarısız: JWT token eksik.' });
    }
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Yetkisiz işlem: Bu işlem için yetki seviyeniz yetersiz.' });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş oturum anahtarı.' });
    }
  };
}

// 1. Sistem Sağlık ve Telemetri Durumu
app.get('/api/v1/status', (req, res) => {
  res.json({
    status: 'online',
    hardwareConnected: false,
    mode: 'SIMULATION_GATEWAY',
    timestamp: new Date().toISOString()
  });
});

// 2. Güvenli Kimyasal / Biyoteknik Uygulama Onayı (Yalnızca 'admin' / Ziraat Mühendisi)
app.post('/api/v1/interventions/:id/approve', requireRole(['admin']), (req, res) => {
  const { safetyChecks, windSpeedKmh } = req.body;
  if (!safetyChecks || !safetyChecks.agronomistVerified || !safetyChecks.labelDosageVerified || !safetyChecks.weatherWindVerified || !safetyChecks.fieldClearVerified) {
    return res.status(400).json({
      error: 'Güvenlik doğrulama hatası: 4 zorunlu güvenlik kontrolü tamamlanmadan onay verilemez.'
    });
  }
  if (Number(windSpeedKmh) > 12) {
    return res.status(400).json({
      error: 'Meteorolojik kısıtlama: Rüzgâr hızı 12 km/s üzerinde olduğundan uygulama reddedildi.'
    });
  }
  res.json({
    id: req.params.id,
    status: 'APPROVED_SIMULATION',
    approvedBy: req.user.username,
    approvedAt: new Date().toISOString()
  });
});

// 3. Donanımsal Acil Durdurma (E-Stop) Komutu
app.post('/api/v1/hardware/emergency-stop', requireRole(['admin', 'operator']), (req, res) => {
  const { reason } = req.body;
  // Gerçek kurulumda burada MQTT üzerinden tüm direklere 'SYS/ESTOP/LOCK' komutu yayınlanır
  res.json({
    emergencyStopActive: true,
    reason: reason || 'Manuel Acil Durdurma',
    triggeredBy: req.user.username,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`AgroShield Pro Backend API http://localhost:${PORT} adresinde çalışıyor.`);
  });
}

module.exports = app;
