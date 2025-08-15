// Logs-specific JavaScript
class LogsManager {
  constructor() {
    this.currentPage = 1
    this.itemsPerPage = 10
    this.filters = {
      severity: "",
      eventType: "",
      dateRange: "today",
    }

    this.mockLogs = this.generateMockLogs()
    this.filteredLogs = [...this.mockLogs]

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadLogs()
  }

  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById("refresh-logs")
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.refreshLogs())
    }

    // Filter controls
    const severityFilter = document.getElementById("severity-filter")
    const eventTypeFilter = document.getElementById("event-type-filter")
    const dateFilter = document.getElementById("date-filter")
    const clearFiltersBtn = document.getElementById("clear-filters")

    if (severityFilter) {
      severityFilter.addEventListener("change", (e) => {
        this.filters.severity = e.target.value
        this.applyFilters()
      })
    }

    if (eventTypeFilter) {
      eventTypeFilter.addEventListener("change", (e) => {
        this.filters.eventType = e.target.value
        this.applyFilters()
      })
    }

    if (dateFilter) {
      dateFilter.addEventListener("change", (e) => {
        this.filters.dateRange = e.target.value
        this.applyFilters()
      })
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", () => this.clearFilters())
    }
  }

  generateMockLogs() {
    const eventTypes = ["login", "xss", "malware", "ddos", "system"]
    const severities = ["high", "medium", "low", "info"]
    const sources = ["192.168.1.100", "10.0.0.50", "Scanner Module", "Firewall", "System"]

    const logs = []

    for (let i = 0; i < 50; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      const severity = severities[Math.floor(Math.random() * severities.length)]
      const source = sources[Math.floor(Math.random() * sources.length)]

      logs.push({
        id: i + 1,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        eventType: eventType,
        source: source,
        description: this.generateDescription(eventType),
        severity: severity,
      })
    }

    return logs.sort((a, b) => b.timestamp - a.timestamp)
  }

  generateDescription(eventType) {
    const descriptions = {
      login: "Failed login attempt detected",
      xss: "Cross-site scripting attempt blocked",
      malware: "Malicious file detected and quarantined",
      ddos: "DDoS attack mitigated",
      system: "System security update applied",
    }

    return descriptions[eventType] || "Security event detected"
  }

  loadLogs() {
    this.showLoading()

    setTimeout(() => {
      this.renderLogs()
      this.updateLogCount()
      this.renderPagination()
      this.showContent()
    }, 1000)
  }

  showLoading() {
    const loadingEl = document.getElementById("logs-loading")
    const contentEl = document.getElementById("logs-content")
    const emptyEl = document.getElementById("logs-empty")

    if (loadingEl) loadingEl.classList.remove("d-none")
    if (contentEl) contentEl.classList.add("d-none")
    if (emptyEl) emptyEl.classList.add("d-none")
  }

  showContent() {
    const loadingEl = document.getElementById("logs-loading")
    const contentEl = document.getElementById("logs-content")
    const emptyEl = document.getElementById("logs-empty")

    if (loadingEl) loadingEl.classList.add("d-none")

    if (this.filteredLogs.length === 0) {
      if (contentEl) contentEl.classList.add("d-none")
      if (emptyEl) emptyEl.classList.remove("d-none")
    } else {
      if (contentEl) contentEl.classList.remove("d-none")
      if (emptyEl) emptyEl.classList.add("d-none")
    }
  }

  renderLogs() {
    const tbody = document.getElementById("logs-table-body")
    if (!tbody) return

    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    const pageData = this.filteredLogs.slice(startIndex, endIndex)

    tbody.innerHTML = pageData
      .map(
        (log) => `
            <tr class="slide-in">
                <td class="text-muted">${this.formatTime(log.timestamp)}</td>
                <td>
                    <span class="badge bg-primary me-2">${this.getEventTypeLabel(log.eventType)}</span>
                </td>
                <td>${log.source}</td>
                <td>${log.description}</td>
                <td>
                    <span class="status-badge status-${log.severity}">${log.severity}</span>
                </td>
                <td>
                    <button class="btn btn-outline-primary btn-sm" onclick="window.logsManager.viewLogDetails(${log.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `,
      )
      .join("")
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredLogs.length / this.itemsPerPage)
    const pagination = document.getElementById("logs-pagination")

    if (!pagination) return

    let paginationHTML = ""

    // Previous button
    paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? "disabled" : ""}">
                <a class="page-link" href="#" onclick="window.logsManager.goToPage(${this.currentPage - 1})">Previous</a>
            </li>
        `

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? "active" : ""}">
                        <a class="page-link" href="#" onclick="window.logsManager.goToPage(${i})">${i}</a>
                    </li>
                `
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>'
      }
    }

    // Next button
    paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? "disabled" : ""}">
                <a class="page-link" href="#" onclick="window.logsManager.goToPage(${this.currentPage + 1})">Next</a>
            </li>
        `

    pagination.innerHTML = paginationHTML

    // Update showing info
    const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1
    const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.filteredLogs.length)

    const showingStart = document.getElementById("showing-start")
    const showingEnd = document.getElementById("showing-end")
    const totalLogs = document.getElementById("total-logs")

    if (showingStart) showingStart.textContent = startIndex
    if (showingEnd) showingEnd.textContent = endIndex
    if (totalLogs) totalLogs.textContent = this.filteredLogs.length
  }

  updateLogCount() {
    const logCount = document.getElementById("log-count")
    if (logCount) {
      logCount.textContent = `${this.filteredLogs.length} events`
    }
  }

  applyFilters() {
    this.filteredLogs = this.mockLogs.filter((log) => {
      let matches = true

      if (this.filters.severity && log.severity !== this.filters.severity) {
        matches = false
      }

      if (this.filters.eventType && log.eventType !== this.filters.eventType) {
        matches = false
      }

      // Date filtering logic would go here
      // For now, we'll just filter by today/yesterday/etc.

      return matches
    })

    this.currentPage = 1
    this.loadLogs()
  }

  clearFilters() {
    this.filters = {
      severity: "",
      eventType: "",
      dateRange: "today",
    }

    // Reset form controls
    const severityFilter = document.getElementById("severity-filter")
    const eventTypeFilter = document.getElementById("event-type-filter")
    const dateFilter = document.getElementById("date-filter")

    if (severityFilter) severityFilter.value = ""
    if (eventTypeFilter) eventTypeFilter.value = ""
    if (dateFilter) dateFilter.value = "today"

    this.applyFilters()
  }

  goToPage(page) {
    const totalPages = Math.ceil(this.filteredLogs.length / this.itemsPerPage)

    if (page >= 1 && page <= totalPages) {
      this.currentPage = page
      this.renderLogs()
      this.renderPagination()
    }
  }

  refreshLogs() {
    const refreshBtn = document.getElementById("refresh-logs")
    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i> Refreshing...'
      refreshBtn.disabled = true
    }

    // Simulate new logs
    this.mockLogs = this.generateMockLogs()
    this.applyFilters()

    setTimeout(() => {
      if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i> Refresh Logs'
        refreshBtn.disabled = false
      }
    }, 1000)
  }

  viewLogDetails(logId) {
    const log = this.mockLogs.find((l) => l.id === logId)
    if (log) {
      alert(
        `Log Details:\n\nID: ${log.id}\nTimestamp: ${log.timestamp}\nType: ${log.eventType}\nSeverity: ${log.severity}\nSource: ${log.source}\nDescription: ${log.description}`,
      )
    }
  }

  formatTime(date) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  getEventTypeLabel(eventType) {
    const labels = {
      login: "Login",
      xss: "XSS",
      malware: "Malware",
      ddos: "DDoS",
      system: "System",
    }

    return labels[eventType] || eventType.toUpperCase()
  }
}

// Initialize logs manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("logs-table")) {
    window.logsManager = new LogsManager()
  }
})
