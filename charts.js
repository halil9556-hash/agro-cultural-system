/**
 * AgroShield Pro — İstatistik ve Raporlama Grafikleri Modülü (Chart.js + SVG Yedekli)
 */

let dashboardTrendChart = null;
let dashboardRiskChart = null;
let reportDetectionsChart = null;
let reportUptimeChart = null;

function renderDashboardCharts(state) {
  if (typeof window.Chart === 'undefined') return;

  const ctxTrend = document.getElementById('chart-dashboard-trend');
  if (ctxTrend) {
    if (dashboardTrendChart) dashboardTrendChart.destroy();
    const series = state.analyticsSeries.weekly;
    dashboardTrendChart = new window.Chart(ctxTrend, {
      type: 'bar',
      data: {
        labels: series.labels,
        datasets: [
          {
            label: 'Kritik / Yüksek Riskli Tespit',
            data: series.highRisk,
            backgroundColor: '#dc2626',
            borderRadius: 5
          },
          {
            label: 'Orta / Düşük Riskli Tespit',
            data: series.lowMedRisk,
            backgroundColor: '#d97706',
            borderRadius: 5
          },
          {
            label: 'Yararlı Tür (Koruma Altında)',
            data: series.beneficial,
            backgroundColor: '#0284c7',
            borderRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Tespit Sayısı' } }
        }
      }
    });
  }

  const ctxRisk = document.getElementById('chart-dashboard-poles');
  if (ctxRisk) {
    if (dashboardRiskChart) dashboardRiskChart.destroy();
    const activeCount = state.poles.filter(p => p.status === 'active').length;
    const offlineCount = state.poles.filter(p => p.status === 'offline').length;
    const maintCount = state.poles.filter(p => p.status === 'maintenance').length;

    dashboardRiskChart = new window.Chart(ctxRisk, {
      type: 'doughnut',
      data: {
        labels: ['Aktif Direkler', 'Çevrim Dışı Direkler', 'Bakımdaki Direkler'],
        datasets: [{
          data: [activeCount, offlineCount, maintCount],
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '64%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  }
}

function renderReportCharts(state, periodKey) {
  if (typeof window.Chart === 'undefined') return;

  const series = state.analyticsSeries[periodKey] || state.analyticsSeries.weekly;
  const ctxDet = document.getElementById('chart-report-detections');
  if (ctxDet) {
    if (reportDetectionsChart) reportDetectionsChart.destroy();
    reportDetectionsChart = new window.Chart(ctxDet, {
      type: 'line',
      data: {
        labels: series.labels,
        datasets: [
          {
            label: 'Yüksek / Kritik Risk Tespiti',
            data: series.highRisk,
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.12)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Orta / Düşük Risk Tespiti',
            data: series.lowMedRisk,
            borderColor: '#d97706',
            backgroundColor: 'rgba(217, 119, 6, 0.10)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Yararlı Canlı Tespiti',
            data: series.beneficial,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.10)',
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  const ctxUp = document.getElementById('chart-report-uptime');
  if (ctxUp) {
    if (reportUptimeChart) reportUptimeChart.destroy();
    reportUptimeChart = new window.Chart(ctxUp, {
      type: 'bar',
      data: {
        labels: state.poles.map(p => p.id),
        datasets: [
          {
            label: 'Çalışma Süresi (Saat / 30 Gün)',
            data: state.poles.map(p => p.uptimeHours30d),
            backgroundColor: '#059669',
            borderRadius: 4
          },
          {
            label: 'Çevrim Dışı / Bakım Süresi (Saat)',
            data: state.poles.map(p => p.offlineHours30d),
            backgroundColor: '#ef4444',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        },
        scales: {
          x: { stacked: true },
          y: { stacked: true, max: 720, title: { display: true, text: 'Saat (30 Günlük Toplam: 720s)' } }
        }
      }
    });
  }
}
