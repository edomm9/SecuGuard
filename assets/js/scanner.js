// Scanner-specific JavaScript
import bootstrap from "bootstrap" // Import bootstrap to declare the variable

class ScannerManager {
  constructor() {
    this.isScanning = false
    this.currentScan = null

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.initializeTooltips()
  }

  setupEventListeners() {
    const scannerForm = document.getElementById("scanner-form")
    const clearFormBtn = document.getElementById("clear-form")

    if (scannerForm) {
      scannerForm.addEventListener("submit", (e) => this.handleScanSubmit(e))
    }

    if (clearFormBtn) {
      clearFormBtn.addEventListener("click", () => this.clearForm())
    }
  }

  initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))
  }

  handleScanSubmit(e) {
    e.preventDefault()

    if (this.isScanning) return

    const formData = new FormData(e.target)
    const url = formData.get("scan-url") || document.getElementById("scan-url").value

    if (!this.validateUrl(url)) {
      this.showUrlError("Please enter a valid URL")
      return
    }

    this.clearUrlError()
    this.startScan(url)
  }

  validateUrl(url) {
    try {
      new URL(url)
      return url.startsWith("http://") || url.startsWith("https://")
    } catch {
      return false
    }
  }

  showUrlError(message) {
    const urlInput = document.getElementById("scan-url")
    const errorDiv = document.getElementById("url-error")

    if (urlInput) {
      urlInput.classList.add("is-invalid")
    }

    if (errorDiv) {
      errorDiv.textContent = message
    }
  }

  clearUrlError() {
    const urlInput = document.getElementById("scan-url")
    const errorDiv = document.getElementById("url-error")

    if (urlInput) {
      urlInput.classList.remove("is-invalid")
    }

    if (errorDiv) {
      errorDiv.textContent = ""
    }
  }

  startScan(url) {
    this.isScanning = true
    this.currentScan = {
      url: url,
      startTime: new Date(),
      options: this.getScanOptions(),
    }

    // Show results section and progress
    this.showScanProgress(url)

    // Simulate scan progress
    this.simulateScanProgress()
  }

  getScanOptions() {
    return {
      headers: document.getElementById("scan-headers")?.checked || false,
      ssl: document.getElementById("scan-ssl")?.checked || false,
      xss: document.getElementById("scan-xss")?.checked || false,
      malware: document.getElementById("scan-malware")?.checked || false,
    }
  }

  showScanProgress(url) {
    const resultsSection = document.getElementById("scan-results-section")
    const progressDiv = document.getElementById("scan-progress")
    const resultsDiv = document.getElementById("scan-results")
    const scanningUrl = document.getElementById("scanning-url")

    if (resultsSection) resultsSection.style.display = "block"
    if (progressDiv) progressDiv.style.display = "block"
    if (resultsDiv) resultsDiv.style.display = "none"
    if (scanningUrl) scanningUrl.textContent = url

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: "smooth" })
  }

  simulateScanProgress() {
    const progressBar = document.getElementById("scan-progress-bar")
    const statusText = document.getElementById("scan-status")

    const steps = [
      { progress: 10, status: "Connecting to target..." },
      { progress: 25, status: "Analyzing HTTP headers..." },
      { progress: 40, status: "Checking SSL configuration..." },
      { progress: 60, status: "Scanning for vulnerabilities..." },
      { progress: 80, status: "Running security tests..." },
      { progress: 95, status: "Generating report..." },
      { progress: 100, status: "Scan complete!" },
    ]

    let currentStep = 0

    const updateProgress = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep]

        if (progressBar) {
          progressBar.style.width = step.progress + "%"
        }

        if (statusText) {
          statusText.textContent = step.status
        }

        currentStep++

        setTimeout(updateProgress, 800 + Math.random() * 400)
      } else {
        this.showScanResults()
      }
    }

    updateProgress()
  }

  showScanResults() {
    const progressDiv = document.getElementById("scan-progress")
    const resultsDiv = document.getElementById("scan-results")
    const scannedUrl = document.getElementById("scanned-url")

    if (progressDiv) progressDiv.style.display = "none"
    if (resultsDiv) resultsDiv.style.display = "block"
    if (scannedUrl) scannedUrl.textContent = this.currentScan.url

    this.generateScanResults()
    this.isScanning = false
  }

  generateScanResults() {
    const resultsContainer = document.getElementById("results-content")
    const overallScore = document.getElementById("overall-score")

    if (!resultsContainer) return

    // Generate mock results based on scan options
    const results = this.generateMockResults()

    // Set overall score
    if (overallScore) {
      const score = this.calculateOverallScore(results)
      overallScore.textContent = score + "/100"
      overallScore.className = `badge fs-6 px-3 py-2 ${this.getScoreBadgeClass(score)}`
    }

    // Render results
    resultsContainer.innerHTML = results.map((result) => this.createResultCard(result)).join("")
  }

  generateMockResults() {
    const results = []
    const options = this.currentScan.options

    if (options.headers) {
      results.push({
        title: "Security Headers",
        icon: "shield-check",
        status: "good",
        score: 85,
        details: [
          { name: "Content-Security-Policy", status: "present", description: "CSP header found" },
          { name: "X-Frame-Options", status: "present", description: "Clickjacking protection enabled" },
          { name: "X-XSS-Protection", status: "missing", description: "XSS protection header missing" },
        ],
      })
    }

    if (options.ssl) {
      results.push({
        title: "SSL/TLS Configuration",
        icon: "lock",
        status: "excellent",
        score: 95,
        details: [
          { name: "Certificate Validity", status: "valid", description: "Certificate is valid and trusted" },
          { name: "Protocol Version", status: "good", description: "TLS 1.3 supported" },
          { name: "Cipher Strength", status: "strong", description: "Strong encryption algorithms used" },
        ],
      })
    }

    if (options.xss) {
      results.push({
        title: "XSS Vulnerability Scan",
        icon: "code-slash",
        status: "warning",
        score: 70,
        details: [
          { name: "Input Validation", status: "partial", description: "Some inputs lack proper validation" },
          { name: "Output Encoding", status: "good", description: "Most outputs are properly encoded" },
          { name: "CSP Implementation", status: "missing", description: "Content Security Policy not implemented" },
        ],
      })
    }

    if (options.malware) {
      results.push({
        title: "Malware Detection",
        icon: "bug",
        status: "good",
        score: 90,
        details: [
          { name: "Known Signatures", status: "clean", description: "No known malware signatures detected" },
          { name: "Suspicious Scripts", status: "clean", description: "No suspicious JavaScript found" },
          { name: "External Resources", status: "verified", description: "All external resources verified" },
        ],
      })
    }

    return results
  }

  createResultCard(result) {
    const statusColors = {
      excellent: "success",
      good: "success",
      warning: "warning",
      danger: "danger",
    }

    const statusColor = statusColors[result.status] || "secondary"

    return `
            <div class="col-lg-6 mb-4">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-header bg-white border-bottom">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="mb-0 fw-bold">
                                <i class="bi bi-${result.icon} me-2"></i>
                                ${result.title}
                            </h6>
                            <div class="d-flex align-items-center">
                                <span class="badge bg-${statusColor} me-2">${result.status}</span>
                                <span class="fw-bold">${result.score}/100</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <div class="progress" style="height: 8px;">
                                <div class="progress-bar bg-${statusColor}" 
                                     role="progressbar" 
                                     style="width: ${result.score}%"></div>
                            </div>
                        </div>
                        <div class="list-group list-group-flush">
                            ${result.details
                              .map(
                                (detail) => `
                                <div class="list-group-item border-0 px-0">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 class="mb-1">${detail.name}</h6>
                                            <small class="text-muted">${detail.description}</small>
                                        </div>
                                        <span class="badge bg-${this.getDetailStatusColor(detail.status)}">${detail.status}</span>
                                    </div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  getDetailStatusColor(status) {
    const colors = {
      present: "success",
      valid: "success",
      good: "success",
      strong: "success",
      clean: "success",
      verified: "success",
      partial: "warning",
      missing: "danger",
      weak: "danger",
      invalid: "danger",
    }

    return colors[status] || "secondary"
  }

  calculateOverallScore(results) {
    if (results.length === 0) return 0

    const totalScore = results.reduce((sum, result) => sum + result.score, 0)
    return Math.round(totalScore / results.length)
  }

  getScoreBadgeClass(score) {
    if (score >= 90) return "bg-success"
    if (score >= 70) return "bg-warning"
    return "bg-danger"
  }

  clearForm() {
    const form = document.getElementById("scanner-form")
    const resultsSection = document.getElementById("scan-results-section")

    if (form) {
      form.reset()
      // Reset checkboxes to default state
      document.getElementById("scan-headers").checked = true
      document.getElementById("scan-ssl").checked = true
      document.getElementById("scan-xss").checked = false
      document.getElementById("scan-malware").checked = false
    }

    if (resultsSection) {
      resultsSection.style.display = "none"
    }

    this.clearUrlError()
    this.isScanning = false
    this.currentScan = null
  }
}

// Initialize scanner manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("scanner-form")) {
    window.scannerManager = new ScannerManager()
  }
})
