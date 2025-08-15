// Dashboard-specific JavaScript
class DashboardManager {
  constructor() {
    this.mockData = {
      metrics: {
        threats: 47,
        blockedIps: 23,
        scans: 1284,
        uptime: 99.9,
        threatsChange: -12.5,
        blockedIpsChange: 8.3,
        scansChange: 15.7,
      },
      events: [
        {
          id: 1,
          type: "login",
          severity: "high",
          description: "Failed login attempt from 192.168.1.100",
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          source: "192.168.1.100",
        },
        {
          id: 2,
          type: "malware",
          severity: "medium",
          description: "Malware detected in uploaded file",
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          source: "File Scanner",
        },
        {
          id: 3,
          type: "system",
          severity: "info",
          description: "System backup completed successfully",
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          source: "Backup Service",
        },
      ],
      alerts: [
        {
          id: 1,
          title: "High Risk IP Detected",
          severity: "high",
          count: 5,
        },
        {
          id: 2,
          title: "SSL Certificate Expiring",
          severity: "medium",
          count: 2,
        },
      ],
    }

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadDashboard()
  }

  setupEventListeners() {
    const refreshBtn = document.getElementById("refresh-dashboard")
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.refreshDashboard()
      })
    }
  }

  loadDashboard() {
    this.showLoading()

    // Simulate API call delay
    setTimeout(() => {
      this.loadMetrics()
      this.loadRecentEvents()
      this.loadActiveAlerts()
      this.updateLastUpdated()
      this.showContent()
    }, 1500)
  }

  showLoading() {
    const loadingEl = document.getElementById("dashboard-loading")
    const contentEl = document.getElementById("dashboard-content")

    if (loadingEl) loadingEl.classList.remove("d-none")
    if (contentEl) contentEl.classList.add("d-none")
  }

  showContent() {
    const loadingEl = document.getElementById("dashboard-loading")
    const contentEl = document.getElementById("dashboard-content")

    if (loadingEl) loadingEl.classList.add("d-none")
    if (contentEl) contentEl.classList.remove("d-none")
  }

  loadMetrics() {
    const metrics = this.mockData.metrics

    // Update metric values with animation
    this.animateMetric("metric-threats", metrics.threats)
    this.animateMetric("metric-blocked-ips", metrics.blockedIps)
    this.animateMetric("metric-scans", metrics.scans)
    this.animateMetric("metric-uptime", metrics.uptime, "%")

    // Update change indicators
    this.updateChangeIndicator("threats-change", metrics.threatsChange)
    this.updateChangeIndicator("blocked-ips-change", metrics.blockedIpsChange)
    this.updateChangeIndicator("scans-change", metrics.scansChange)
  }

  animateMetric(elementId, targetValue, suffix = "") {
    const element = document.getElementById(elementId)
    if (!element) return

    const startValue = 0
    const duration = 1000
    const startTime = performance.now()

    const updateValue = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const currentValue = startValue + (targetValue - startValue) * progress

      element.textContent = Math.floor(currentValue).toLocaleString() + suffix

      if (progress < 1) {
        requestAnimationFrame(updateValue)
      }
    }

    requestAnimationFrame(updateValue)
  }

  updateChangeIndicator(elementId, changeValue) {
    const element = document.getElementById(elementId)
    if (!element) return

    const isPositive = changeValue > 0
    const parentElement = element.closest("small")

    if (parentElement) {
      parentElement.className = isPositive ? "text-danger" : "text-success"
      const icon = parentElement.querySelector("i")
      if (icon) {
        icon.className = isPositive ? "bi bi-arrow-up me-1" : "bi bi-arrow-down me-1"
      }
    }

    element.textContent = Math.abs(changeValue) + "%"
  }

  loadRecentEvents() {
    const container = document.getElementById("recent-events-container")
    if (!container) return

    const events = this.mockData.events

    container.innerHTML = events
      .map(
        (event) => `
            <div class="d-flex align-items-center p-3 border-bottom">
                <div class="icon-feature me-3" style="width: 2rem; height: 2rem; font-size: 0.875rem;">
                    <i class="bi bi-${this.getEventIcon(event.type)}"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${event.description}</h6>
                            <small class="text-muted">
                                <i class="bi bi-clock me-1"></i>
                                ${window.secureGuardApp.formatTimestamp(event.timestamp)}
                            </small>
                        </div>
                        <span class="status-badge status-${event.severity}">${event.severity}</span>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  loadActiveAlerts() {
    const container = document.getElementById("active-alerts-container")
    if (!container) return

    const alerts = this.mockData.alerts

    if (alerts.length === 0) {
      container.innerHTML = `
                <div class="text-center py-4">
                    <i class="bi bi-check-circle display-4 text-success mb-2"></i>
                    <p class="text-muted mb-0">No active alerts</p>
                </div>
            `
      return
    }

    container.innerHTML = alerts
      .map(
        (alert) => `
            <div class="d-flex justify-content-between align-items-center p-3 border rounded mb-2">
                <div>
                    <h6 class="mb-1">${alert.title}</h6>
                    <small class="text-muted">${alert.count} occurrence${alert.count > 1 ? "s" : ""}</small>
                </div>
                <span class="status-badge status-${alert.severity}">${alert.severity}</span>
            </div>
        `,
      )
      .join("")
  }

  getEventIcon(type) {
    const icons = {
      login: "person-exclamation",
      malware: "bug",
      system: "gear",
      xss: "code-slash",
      ddos: "shield-exclamation",
    }
    return icons[type] || "info-circle"
  }

  updateLastUpdated() {
    const element = document.getElementById("last-updated")
    if (element) {
      element.textContent = new Date().toLocaleTimeString()
    }
  }

  refreshDashboard() {
    const refreshBtn = document.getElementById("refresh-dashboard")
    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i> Refreshing...'
      refreshBtn.disabled = true
    }

    // Simulate refresh
    setTimeout(() => {
      this.loadDashboard()

      if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i> Refresh'
        refreshBtn.disabled = false
      }
    }, 1000)
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("dashboard-content")) {
    window.dashboardManager = new DashboardManager()
  }
})
