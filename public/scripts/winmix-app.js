// WinMix - Main Application Script
class WinMixApp {
  constructor() {
    // Application state
    this.matches = []
    this.filteredMatches = []
    this.currentPage = 1
    this.itemsPerPage = 50
    this.totalPages = 1
    this.sortBy = null
    this.sortOrder = "asc"

    // Filter state
    this.filters = {
      home: null,
      away: null,
      btts: null,
      comeback: null,
    }

    // Configuration
    this.STORAGE_KEY = "winmix_filters_v2"
    this.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tssgzrzjxslvqmpxgsss.supabase.co"
    this.SUPABASE_KEY =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzc2d6cnpqeHNsdnFtcHhnc3NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDQ0NzksImV4cCI6MjA3MDQyMDQ3OX0.x3dwO-gt7bp4-uM-lMktVxFdu-RaRgN8N5DM8-mqofI"

    // DOM elements cache
    this.elements = {}

    // Charts
    this.chartResults = null
    this.chartBTTS = null

    // Initialize
    this.init()
  }

  async init() {
    try {
      this.cacheElements()
      this.initSupabase()
      this.setupEventListeners()
      this.setupDropdowns()
      this.initCharts()
      this.loadStoredFilters()

      // Load initial data
      await this.loadData()

      // Initialize Lucide icons
      window.lucide.createIcons()
    } catch (error) {
      console.error("Initialization error:", error)
      this.showError("Hiba történt az alkalmazás inicializálása során.")
    }
  }

  cacheElements() {
    const ids = [
      "loadingOverlay",
      "toastContainer",
      "resultsBody",
      "listedCount",
      "statTotal",
      "statHome",
      "statDraw",
      "statAway",
      "noResultsMessage",
      "chartResults",
      "chartBTTS",
      "extendedStatsModal",
      "paginationTop",
      "paginationBottom",
      "itemsPerPage",
      "totalItems",
      "pageInfoTop",
      "pageInfoBottom",
      "prevPageTop",
      "nextPageTop",
      "prevPageBottom",
      "nextPageBottom",
    ]

    ids.forEach((id) => {
      this.elements[id] = document.getElementById(id)
    })

    // Button collections
    this.elements.applyButtons = document.querySelectorAll("#applyBtn, #applyBtnMain, #applyBtnMobile")
    this.elements.resetButtons = document.querySelectorAll("#resetBtn, #resetBtnMobile")
    this.elements.exportButtons = document.querySelectorAll("#exportBtn, #exportBtnMobile")
    this.elements.extendedStatsButtons = document.querySelectorAll("#extendedStatsBtn, #extendedStatsBtnHeader")
    this.elements.modalCloseButtons = document.querySelectorAll("#closeModal, #closeModalX")

    // Table headers for sorting
    this.elements.sortHeaders = document.querySelectorAll("th[data-sort-key]")
  }

  initSupabase() {
    if (typeof window.supabase !== "undefined") {
      const { createClient } = window.supabase
      this.supabaseClient = createClient(this.SUPABASE_URL, this.SUPABASE_KEY)
    } else {
      console.warn("Supabase not available, using sample data only")
      this.supabaseClient = null
    }
  }

  setupEventListeners() {
    // Apply filters
    this.elements.applyButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.applyFilters())
    })

    // Reset filters
    this.elements.resetButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.resetFilters())
    })

    // Export CSV
    this.elements.exportButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.exportCSV())
    })

    // Extended statistics
    this.elements.extendedStatsButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.showExtendedStats())
    })

    // Modal close
    this.elements.modalCloseButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.hideExtendedStats())
    })

    // Sort headers
    this.elements.sortHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const sortKey = header.getAttribute("data-sort-key")
        this.handleSort(sortKey)
      })
    })

    // Pagination
    this.setupPaginationListeners()

    // Items per page change
    if (this.elements.itemsPerPage) {
      this.elements.itemsPerPage.addEventListener("change", (e) => {
        this.itemsPerPage = Number.parseInt(e.target.value)
        this.currentPage = 1
        this.renderCurrentPage()
        this.updatePaginationControls()
        this.saveSettingsToStorage()
      })
    }

    // Modal backdrop click
    if (this.elements.extendedStatsModal) {
      this.elements.extendedStatsModal.addEventListener("click", (e) => {
        if (e.target === this.elements.extendedStatsModal) {
          this.hideExtendedStats()
        }
      })
    }

    // Global click handler for dropdowns
    document.addEventListener("click", (e) => {
      if (!e.target.closest("[data-dropdown]")) {
        this.closeAllDropdowns()
      }
    })
  }

  setupPaginationListeners() {
    // Previous page buttons
    document.querySelectorAll("#prevPageTop, #prevPageBottom").forEach((btn) => {
      btn.addEventListener("click", () => this.previousPage())
    })

    // Next page buttons
    document.querySelectorAll("#nextPageTop, #nextPageBottom").forEach((btn) => {
      btn.addEventListener("click", () => this.nextPage())
    })
  }

  setupDropdowns() {
    // Home team dropdown
    this.buildDropdown("home", [])

    // Away team dropdown
    this.buildDropdown("away", [])

    // BTTS dropdown
    this.buildDropdown("btts", [
      { text: "Mindegy", value: "" },
      { text: "Igen", value: "true" },
      { text: "Nem", value: "false" },
    ])

    // Comeback dropdown
    this.buildDropdown("comeback", [
      { text: "Mindegy", value: "" },
      { text: "Igen", value: "true" },
      { text: "Nem", value: "false" },
    ])
  }

  buildDropdown(type, options) {
    const dropdown = document.querySelector(`[data-dropdown="${type}"]`)
    if (!dropdown) return

    const trigger = dropdown.querySelector("[data-trigger]")
    const menu = dropdown.querySelector("[data-menu]")
    const optionsContainer = dropdown.querySelector("[data-options]")
    const label = dropdown.querySelector("[data-label]")

    // Clear existing options
    optionsContainer.innerHTML = ""

    // Add options
    options.forEach((option) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "w-full text-left px-3 py-2 hover:bg-white/5 text-sm text-zinc-200 dropdown-option"
      button.textContent = option.text
      button.dataset.value = option.value

      button.addEventListener("click", (e) => {
        e.stopPropagation()
        this.selectDropdownOption(type, option.value, option.text)
        menu.classList.add("hidden")
      })

      optionsContainer.appendChild(button)
    })

    // Trigger click handler
    trigger.addEventListener("click", (e) => {
      e.stopPropagation()
      this.closeAllDropdowns()
      menu.classList.toggle("hidden")
    })
  }

  selectDropdownOption(type, value, text) {
    const dropdown = document.querySelector(`[data-dropdown="${type}"]`)
    const label = dropdown.querySelector("[data-label]")

    if (type === "home") {
      this.filters.home = value || null
      label.textContent = text
    } else if (type === "away") {
      this.filters.away = value || null
      label.textContent = text
    } else if (type === "btts") {
      this.filters.btts = value === "" ? null : value === "true"
      label.textContent = text
    } else if (type === "comeback") {
      this.filters.comeback = value === "" ? null : value === "true"
      label.textContent = text
    }

    this.saveFiltersToStorage()
  }

  closeAllDropdowns() {
    document.querySelectorAll("[data-menu]").forEach((menu) => {
      menu.classList.add("hidden")
    })
  }

  async loadData() {
    this.showLoading()

    try {
      if (this.supabaseClient) {
        const { data, error } = await this.supabaseClient
          .from("matches")
          .select("*")
          .order("match_time", { ascending: false })

        if (error) throw error

        // Transform the data
        this.matches = this.transformSupabaseData(data || [])
      }

      // If no data from Supabase, use sample data
      if (this.matches.length === 0) {
        this.matches = this.generateSampleData()
        this.showInfo("Minta adatok betöltve. Az adatbázis kapcsolat nem elérhető.")
      }

      // Update team dropdowns
      this.updateTeamDropdowns()

      // Apply initial filters and render
      this.applyFilters()
    } catch (error) {
      console.error("Data loading error:", error)
      this.matches = this.generateSampleData()
      this.updateTeamDropdowns()
      this.applyFilters()
      this.showError("Hiba az adatok betöltése során. Minta adatok betöltve.")
    } finally {
      this.hideLoading()
    }
  }

  transformSupabaseData(data) {
    return data.map((match) => {
      const ht = `${match.half_time_home_goals ?? 0}-${match.half_time_away_goals ?? 0}`
      const ft = `${match.full_time_home_goals ?? 0}-${match.full_time_away_goals ?? 0}`

      return {
        home: match.home_team,
        away: match.away_team,
        ht: ht,
        ft: ft,
        res: this.getResultFromScore(ft),
        btts: this.getBTTSFromScore(ft),
        comeback: this.getComebackFromScores(ht, ft),
        date: match.match_time ? new Date(match.match_time) : new Date(),
      }
    })
  }

  generateSampleData() {
    const teams = [
      "Ferencváros",
      "Újpest",
      "Debrecen",
      "Paks",
      "Videoton",
      "Honvéd",
      "Kisvárda",
      "Zalaegerszeg",
      "Diósgyőr",
      "Gyirmót",
      "Budafok",
      "Soroksár",
      "Barcelona",
      "Real Madrid",
      "Atletico Madrid",
      "Sevilla",
      "Valencia",
      "Villarreal",
      "Real Sociedad",
      "Athletic Bilbao",
      "Celta Vigo",
      "Getafe",
    ]

    const sampleMatches = []
    const baseDate = new Date("2024-01-01")

    // Generate approximately 5000 matches
    for (let i = 0; i < 5000; i++) {
      const homeGoals = Math.floor(Math.random() * 5)
      const awayGoals = Math.floor(Math.random() * 5)
      const htHomeGoals = Math.floor(Math.random() * (homeGoals + 1))
      const htAwayGoals = Math.floor(Math.random() * (awayGoals + 1))

      const ht = `${htHomeGoals}-${htAwayGoals}`
      const ft = `${homeGoals}-${awayGoals}`

      const matchDate = new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000) / 5)

      const home = teams[Math.floor(Math.random() * teams.length)]
      let away = teams[Math.floor(Math.random() * teams.length)]
      while (away === home) {
        away = teams[Math.floor(Math.random() * teams.length)]
      }

      sampleMatches.push({
        home,
        away,
        ht: ht,
        ft: ft,
        res: this.getResultFromScore(ft),
        btts: this.getBTTSFromScore(ft),
        comeback: this.getComebackFromScores(ht, ft),
        date: matchDate,
      })
    }

    return sampleMatches
  }

  getResultFromScore(score) {
    const [home, away] = score.split("-").map((n) => Number.parseInt(n, 10))
    if (home > away) return "H"
    if (home < away) return "A"
    return "D"
  }

  getBTTSFromScore(score) {
    const [home, away] = score.split("-").map((n) => Number.parseInt(n, 10))
    return home > 0 && away > 0
  }

  getComebackFromScores(htScore, ftScore) {
    const [htHome, htAway] = htScore.split("-").map((n) => Number.parseInt(n, 10))
    const [ftHome, ftAway] = ftScore.split("-").map((n) => Number.parseInt(n, 10))

    // Check if halftime leader is different from fulltime leader
    const htResult = htHome > htAway ? "H" : htHome < htAway ? "A" : "D"
    const ftResult = ftHome > ftAway ? "H" : ftHome < ftAway ? "A" : "D"

    return htResult !== "D" && ftResult !== "D" && htResult !== ftResult
  }

  updateTeamDropdowns() {
    const homeTeams = [...new Set(this.matches.map((m) => m.home))].sort()
    const awayTeams = [...new Set(this.matches.map((m) => m.away))].sort()

    // Update home dropdown
    const homeOptions = [{ text: "Mindegy", value: "" }, ...homeTeams.map((team) => ({ text: team, value: team }))]
    this.buildDropdown("home", homeOptions)

    // Update away dropdown
    const awayOptions = [{ text: "Mindegy", value: "" }, ...awayTeams.map((team) => ({ text: team, value: team }))]
    this.buildDropdown("away", awayOptions)
  }

  applyFilters() {
    let filtered = [...this.matches]

    // Apply filters
    if (this.filters.home) {
      filtered = filtered.filter((m) => m.home === this.filters.home)
    }

    if (this.filters.away) {
      filtered = filtered.filter((m) => m.away === this.filters.away)
    }

    if (this.filters.btts !== null) {
      filtered = filtered.filter((m) => m.btts === this.filters.btts)
    }

    if (this.filters.comeback !== null) {
      filtered = filtered.filter((m) => m.comeback === this.filters.comeback)
    }

    // Apply sorting
    filtered = this.sortMatches(filtered)

    this.filteredMatches = filtered
    this.currentPage = 1
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage)

    // Update UI
    this.renderCurrentPage()
    this.updateStats()
    this.updateCharts()
    this.updatePaginationControls()
    this.saveFiltersToStorage()

    // Show/hide no results message
    this.elements.noResultsMessage.classList.toggle("hidden", filtered.length > 0)

    // Show/hide pagination
    this.elements.paginationTop.classList.toggle("hidden", filtered.length === 0)
    this.elements.paginationBottom.classList.toggle("hidden", filtered.length === 0)
  }

  sortMatches(matches) {
    if (!this.sortBy) return matches

    return [...matches].sort((a, b) => {
      let result = 0

      switch (this.sortBy) {
        case "home":
        case "away":
          result = a[this.sortBy].localeCompare(b[this.sortBy], "hu")
          break

        case "ht":
        case "ft":
          const [aHome, aAway] = a[this.sortBy].split("-").map((n) => Number.parseInt(n, 10))
          const [bHome, bAway] = b[this.sortBy].split("-").map((n) => Number.parseInt(n, 10))
          result = aHome + aAway - (bHome + bAway)
          if (result === 0) result = aHome - bHome
          break

        case "btts":
        case "comeback":
          result = (a[this.sortBy] ? 1 : 0) - (b[this.sortBy] ? 1 : 0)
          break
      }

      return this.sortOrder === "asc" ? result : -result
    })
  }

  handleSort(sortKey) {
    if (this.sortBy === sortKey) {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc"
    } else {
      this.sortBy = sortKey
      this.sortOrder = "asc"
    }

    this.updateSortIndicators()
    this.applyFilters()
  }

  updateSortIndicators() {
    this.elements.sortHeaders.forEach((header) => {
      const key = header.getAttribute("data-sort-key")
      const icon = header.querySelector("i[data-lucide]")

      if (this.sortBy === key) {
        icon.setAttribute("data-lucide", this.sortOrder === "asc" ? "chevron-up" : "chevron-down")
      } else {
        icon.setAttribute("data-lucide", "chevrons-up-down")
      }
    })

    window.lucide.createIcons()
  }

  renderCurrentPage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    const pageMatches = this.filteredMatches.slice(startIndex, endIndex)

    this.renderMatches(pageMatches)
    this.updateMatchCount()
  }

  renderMatches(matches) {
    const tbody = this.elements.resultsBody
    tbody.innerHTML = ""

    const fragment = document.createDocumentFragment()

    matches.forEach((match) => {
      const row = this.createMatchRow(match)
      fragment.appendChild(row)
    })

    tbody.appendChild(fragment)

    window.lucide.createIcons()
  }

  createMatchRow(match) {
    const tr = document.createElement("tr")
    tr.className = "hover:bg-white/5 transition"

    const bttsText = match.btts ? "Igen" : "Nem"
    const comebackText = match.comeback ? "Fordítás" : "Nincs"

    // Get team logos
    const homeLogo = this.getTeamLogo(match.home)
    const awayLogo = this.getTeamLogo(match.away)

    // Result styling
    const resultClass =
      match.res === "H"
        ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30"
        : match.res === "A"
          ? "bg-sky-500/10 text-sky-300 ring-sky-400/30"
          : "bg-amber-500/10 text-amber-300 ring-amber-400/30"

    const resultIcon = match.res === "H" ? "circle-dot" : match.res === "A" ? "circle" : "minus"

    tr.innerHTML = `
      <td class="px-4 py-3 text-zinc-200">
        <div class="flex items-center gap-2">
          <img src="${homeLogo}" alt="${match.home} logo" class="h-6 w-6 rounded-full ring-1 ring-white/10 object-cover team-logo" onerror="this.src='https://via.placeholder.com/24x24?text=?'">
          <span>${match.home}</span>
        </div>
      </td>
      <td class="px-4 py-3 text-zinc-200">
        <div class="flex items-center gap-2">
          <img src="${awayLogo}" alt="${match.away} logo" class="h-6 w-6 rounded-full ring-1 ring-white/10 object-cover team-logo" onerror="this.src='https://via.placeholder.com/24x24?text=?'">
          <span>${match.away}</span>
        </div>
      </td>
      <td class="px-4 py-3 text-zinc-300">${match.ht}</td>
      <td class="px-4 py-3">
        <span class="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs ring-1 ${resultClass}">
          <i data-lucide="${resultIcon}" style="width:14px; height:14px; stroke-width:1.5;"></i>
          ${match.ft}
        </span>
      </td>
      <td class="px-4 py-3">
        <span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ring-1 ${match.btts ? "bg-indigo-500/10 text-indigo-300 ring-indigo-400/30" : "bg-white/5 text-zinc-300 ring-white/10"}">
          ${bttsText}
        </span>
      </td>
      <td class="px-4 py-3">
        <span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ring-1 ${match.comeback ? "bg-fuchsia-500/10 text-fuchsia-300 ring-fuchsia-400/30" : "bg-white/5 text-zinc-300 ring-white/10"}">
          <i data-lucide="${match.comeback ? "shuffle" : "minus"}" style="width:14px; height:14px; stroke-width:1.5;"></i>
          ${comebackText}
        </span>
      </td>
    `

    return tr
  }

  getTeamLogo(teamName) {
    const teamLogos = {
      Ferencváros:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Ferencvarosi_TC_logo.svg/500px-Ferencvarosi_TC_logo.svg.png",
      Újpest:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Ujpest_FC_logo.svg/500px-Ujpest_FC_logo.svg.png",
      Debrecen:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Debreceni_VSC_logo.svg/500px-Debreceni_VSC_logo.svg.png",
      Paks: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Paksi_FC_logo.svg/500px-Paksi_FC_logo.svg.png",
      Barcelona:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/FC_Barcelona_%28crest%29.svg/500px-FC_Barcelona_%28crest%29.svg.png",
      "Real Madrid":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Real_Madrid_CF.svg/500px-Real_Madrid_CF.svg.png",
      "Atletico Madrid":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Atletico_Madrid_2017_logo.svg/500px-Atletico_Madrid_2017_logo.svg.png",
    }

    return (
      teamLogos[teamName] ||
      "https://via.placeholder.com/24x24/4f46e5/ffffff?text=" + encodeURIComponent(teamName.charAt(0))
    )
  }

  updateMatchCount() {
    const totalMatches = this.filteredMatches.length
    this.elements.listedCount.innerHTML = `
      <i data-lucide="table" style="width:14px; height:14px; stroke-width:1.5;"></i>
      Mérkőzések: ${totalMatches}
    `

    if (this.elements.totalItems) {
      this.elements.totalItems.textContent = totalMatches
    }

    window.lucide.createIcons()
  }

  updateStats() {
    const matches = this.filteredMatches
    const total = matches.length
    const home = matches.filter((m) => m.res === "H").length
    const draw = matches.filter((m) => m.res === "D").length
    const away = matches.filter((m) => m.res === "A").length

    this.elements.statTotal.textContent = total
    this.elements.statHome.textContent = home
    this.elements.statDraw.textContent = draw
    this.elements.statAway.textContent = away
  }

  // Pagination methods
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--
      this.renderCurrentPage()
      this.updatePaginationControls()
      this.scrollToResults()
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++
      this.renderCurrentPage()
      this.updatePaginationControls()
      this.scrollToResults()
    }
  }

  updatePaginationControls() {
    // Show pagination if there are matches
    const showPagination = this.filteredMatches.length > 0
    this.elements.paginationTop.classList.toggle("hidden", !showPagination)
    this.elements.paginationBottom.classList.toggle("hidden", !showPagination)

    if (!showPagination) return

    // Update page info
    const pageInfo = `${this.currentPage} / ${this.totalPages}`
    if (this.elements.pageInfoTop) this.elements.pageInfoTop.textContent = pageInfo
    if (this.elements.pageInfoBottom) this.elements.pageInfoBottom.textContent = pageInfo

    // Update button states
    const prevButtons = document.querySelectorAll("#prevPageTop, #prevPageBottom")
    const nextButtons = document.querySelectorAll("#nextPageTop, #nextPageBottom")

    prevButtons.forEach((btn) => {
      btn.disabled = this.currentPage === 1
    })

    nextButtons.forEach((btn) => {
      btn.disabled = this.currentPage === this.totalPages || this.totalPages === 0
    })
  }

  scrollToResults() {
    const resultsSection = document.getElementById("results")
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Chart initialization and updates
  initCharts() {
    const ctxResults = this.elements.chartResults
    const ctxBTTS = this.elements.chartBTTS

    if (!ctxResults || !ctxBTTS || typeof window.Chart === "undefined") {
      console.warn("Chart.js not available or canvas elements not found")
      return
    }

    try {
      // Results chart
      this.chartResults = new window.Chart(ctxResults, {
        type: "bar",
        data: {
          labels: ["Hazai", "Döntetlen", "Vendég"],
          datasets: [
            {
              label: "Darab",
              data: [0, 0, 0],
              backgroundColor: ["#34d39955", "#fbbf2455", "#60a5fa55"],
              borderColor: ["#34d399", "#fbbf24", "#60a5fa"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              grid: { color: "rgba(255,255,255,0.06)" },
              ticks: { color: "rgba(228,228,231,0.9)", font: { size: 12 } },
            },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(255,255,255,0.06)" },
              ticks: { color: "rgba(228,228,231,0.9)", stepSize: 1 },
            },
          },
        },
      })

      // BTTS chart
      this.chartBTTS = new window.Chart(ctxBTTS, {
        type: "doughnut",
        data: {
          labels: ["Igen", "Nem"],
          datasets: [
            {
              data: [0, 0],
              backgroundColor: ["#a78bfa88", "#ffffff22"],
              borderColor: ["#a78bfa", "#e5e7eb33"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: "rgba(228,228,231,0.9)",
                boxWidth: 12,
              },
            },
          },
          cutout: "60%",
        },
      })
    } catch (error) {
      console.error("Error initializing charts:", error)
    }
  }

  updateCharts() {
    if (!this.chartResults || !this.chartBTTS) return

    try {
      const matches = this.filteredMatches
      const home = matches.filter((m) => m.res === "H").length
      const draw = matches.filter((m) => m.res === "D").length
      const away = matches.filter((m) => m.res === "A").length
      const bttsYes = matches.filter((m) => m.btts).length
      const bttsNo = matches.length - bttsYes

      // Update results chart
      this.chartResults.data.datasets[0].data = [home, draw, away]
      this.chartResults.update()

      // Update BTTS chart
      this.chartBTTS.data.datasets[0].data = [bttsYes, bttsNo]
      this.chartBTTS.update()
    } catch (error) {
      console.error("Error updating charts:", error)
    }
  }

  resetFilters() {
    this.filters = {
      home: null,
      away: null,
      btts: null,
      comeback: null,
    }

    this.sortBy = null
    this.sortOrder = "asc"
    this.currentPage = 1

    // Reset dropdown labels
    const dropdowns = [
      { selector: '[data-dropdown="home"] [data-label]', text: "Válassz hazai csapatot" },
      { selector: '[data-dropdown="away"] [data-label]', text: "Válassz vendég csapatot" },
      { selector: '[data-dropdown="btts"] [data-label]', text: "Válassz: Igen / Nem" },
      { selector: '[data-dropdown="comeback"] [data-label]', text: "Válassz: Igen / Nem" },
    ]

    dropdowns.forEach(({ selector, text }) => {
      const element = document.querySelector(selector)
      if (element) element.textContent = text
    })

    this.updateSortIndicators()
    this.clearFiltersFromStorage()
    this.applyFilters()
  }

  exportCSV() {
    if (this.filteredMatches.length === 0) {
      this.showError("Nincs adat az exportáláshoz")
      return
    }

    const header = [
      "Hazai csapat",
      "Vendég csapat",
      "Félidő eredmény",
      "Végeredmény",
      "Mindkét csapat gólt szerzett",
      "Fordítás",
    ]

    const rows = [header]

    this.filteredMatches.forEach((match) => {
      const row = [
        match.home,
        match.away,
        match.ht,
        match.ft,
        match.btts ? "Igen" : "Nem",
        match.comeback ? "Igen" : "Nem",
      ]

      // Escape CSV values
      const escapedRow = row.map((value) => `"${String(value).replace(/"/g, '""')}"`)
      rows.push(escapedRow)
    })

    const csvContent = "\ufeff" + rows.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `winmix_merkozesek_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    this.showSuccess("CSV fájl letöltve!")
  }

  // Extended statistics modal
  showExtendedStats() {
    const matches = this.filteredMatches
    const total = matches.length

    if (total === 0) {
      this.showInfo("Nincs adat a bővített statisztikához. Alkalmazz szűrőket vagy töltsd be az adatokat.")
      return
    }

    // Calculate statistics
    let homeWins = 0,
      draws = 0,
      awayWins = 0
    let totalHomeGoals = 0,
      totalAwayGoals = 0,
      bttsCount = 0
    const resultCounts = {}

    matches.forEach((match) => {
      const [homeGoals, awayGoals] = match.ft.split("-").map((n) => Number.parseInt(n, 10))

      totalHomeGoals += homeGoals
      totalAwayGoals += awayGoals

      if (match.res === "H") homeWins++
      else if (match.res === "A") awayWins++
      else draws++

      if (match.btts) bttsCount++

      resultCounts[match.ft] = (resultCounts[match.ft] || 0) + 1
    })

    const homeAvg = total ? (totalHomeGoals / total).toFixed(2) : "0.0"
    const awayAvg = total ? (totalAwayGoals / total).toFixed(2) : "0.0"
    const bttsPercent = total ? ((bttsCount / total) * 100).toFixed(1) : "0"

    // Update modal content
    const totalMatchesEl = document.getElementById("totalMatches")
    const homeWinsEl = document.getElementById("homeWins")
    const drawsEl = document.getElementById("draws")
    const awayWinsEl = document.getElementById("awayWins")
    const homeGoalAvgEl = document.getElementById("homeGoalAvg")
    const awayGoalAvgEl = document.getElementById("awayGoalAvg")

    if (totalMatchesEl) totalMatchesEl.textContent = total
    if (homeWinsEl) homeWinsEl.textContent = homeWins
    if (drawsEl) drawsEl.textContent = draws
    if (awayWinsEl) awayWinsEl.textContent = awayWins
    if (homeGoalAvgEl) homeGoalAvgEl.textContent = homeAvg
    if (awayGoalAvgEl) awayGoalAvgEl.textContent = awayAvg

    const bttsElement = document.getElementById("bothTeamsScored")
    if (bttsElement) {
      bttsElement.innerHTML = `Összes mérkőzésből hány mérkőzésen szerzett mind a két csapat gólt: <span class="font-semibold">${bttsPercent}%</span>`
    }

    // Update frequent results
    const frequentList = document.getElementById("frequentResultsList")
    if (frequentList) {
      frequentList.innerHTML = ""

      const sortedResults = Object.entries(resultCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      if (sortedResults.length > 0) {
        sortedResults.forEach(([result, count]) => {
          const li = document.createElement("li")
          li.textContent = `${result} - ${count} alkalommal`
          frequentList.appendChild(li)
        })
      } else {
        frequentList.innerHTML = '<li class="text-zinc-400 italic">Nincs adat</li>'
      }
    }

    // Update team info
    this.updateModalTeamInfo()

    // Show modal
    this.elements.extendedStatsModal.classList.remove("hidden")

    window.lucide.createIcons()
  }

  updateModalTeamInfo() {
    const homeTeamInfo = document.getElementById("homeTeamInfo")
    const awayTeamInfo = document.getElementById("awayTeamInfo")

    const homeTeam = this.filters.home || "Nincs kiválasztva"
    const awayTeam = this.filters.away || "Nincs kiválasztva"

    // Update home team
    const homeLogo = homeTeamInfo.querySelector("img")
    const homeNameDiv = homeTeamInfo.querySelector(".font-medium")
    if (homeLogo && homeNameDiv) {
      homeLogo.src = this.filters.home
        ? this.getTeamLogo(this.filters.home)
        : "https://via.placeholder.com/40x40?text=?"
      homeNameDiv.textContent = homeTeam
    }

    // Update away team
    const awayLogo = awayTeamInfo.querySelector("img")
    const awayNameDiv = awayTeamInfo.querySelector(".font-medium")
    if (awayLogo && awayNameDiv) {
      awayLogo.src = this.filters.away
        ? this.getTeamLogo(this.filters.away)
        : "https://via.placeholder.com/40x40?text=?"
      awayNameDiv.textContent = awayTeam
    }
  }

  hideExtendedStats() {
    this.elements.extendedStatsModal.classList.add("hidden")
  }

  // Storage methods
  saveFiltersToStorage() {
    try {
      const data = {
        filters: this.filters,
        itemsPerPage: this.itemsPerPage,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.warn("Could not save filters to storage:", error)
    }
  }

  loadStoredFilters() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return

      const data = JSON.parse(stored)

      // Restore filters
      if (data.filters) {
        this.filters = { ...this.filters, ...data.filters }
      }

      // Restore settings
      if (data.itemsPerPage) {
        this.itemsPerPage = data.itemsPerPage
        if (this.elements.itemsPerPage) {
          this.elements.itemsPerPage.value = data.itemsPerPage
        }
      }

      if (data.sortBy) {
        this.sortBy = data.sortBy
        this.sortOrder = data.sortOrder || "asc"
      }
    } catch (error) {
      console.warn("Could not load stored filters:", error)
    }
  }

  saveSettingsToStorage() {
    this.saveFiltersToStorage()
  }

  clearFiltersFromStorage() {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.warn("Could not clear filters from storage:", error)
    }
  }

  // UI feedback methods
  showLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.classList.remove("hidden")
      this.elements.loadingOverlay.classList.add("flex")
    }
  }

  hideLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.classList.add("hidden")
      this.elements.loadingOverlay.classList.remove("flex")
    }
  }

  showError(message) {
    this.showToast(message, "error")
  }

  showSuccess(message) {
    this.showToast(message, "success")
  }

  showInfo(message) {
    this.showToast(message, "info")
  }

  showToast(message, type = "info") {
    if (!this.elements.toastContainer) return

    const toast = document.createElement("div")
    toast.className = "toast animate-pulse rounded-lg ring-1 px-4 py-3 shadow-xl"

    let iconName = "info"
    let colorClasses = "ring-blue-400/30 bg-blue-500/10 text-blue-200"

    switch (type) {
      case "error":
        iconName = "alert-triangle"
        colorClasses = "ring-red-400/30 bg-red-500/10 text-red-200"
        break
      case "success":
        iconName = "check-circle"
        colorClasses = "ring-green-400/30 bg-green-500/10 text-green-200"
        break
      case "info":
      default:
        iconName = "info"
        colorClasses = "ring-blue-400/30 bg-blue-500/10 text-blue-200"
        break
    }

    toast.className += ` ${colorClasses}`

    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <i data-lucide="${iconName}" style="width:18px; height:18px;"></i>
        <span class="text-sm">${message}</span>
        <button class="ml-auto hover:opacity-70">
          <i data-lucide="x" style="width:16px; height:16px;"></i>
        </button>
      </div>
    `

    // Close button functionality
    const closeBtn = toast.querySelector("button")
    closeBtn.addEventListener("click", () => {
      toast.remove()
    })

    this.elements.toastContainer.appendChild(toast)

    window.lucide.createIcons()

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove()
      }
    }, 5000)
  }

  // Utility methods
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Performance optimization for large datasets
  createVirtualScrolling() {
    // This would be implemented for very large datasets
    // For now, pagination handles the performance concerns
  }

  // Error boundary
  handleError(error, context = "Unknown") {
    console.error(`Error in ${context}:`, error)
    this.showError(`Hiba történt: ${context}. Részletek a konzolban.`)
  }

  // Cleanup method
  destroy() {
    // Clean up event listeners and resources
    if (this.chartResults) {
      this.chartResults.destroy()
    }

    if (this.chartBTTS) {
      this.chartBTTS.destroy()
    }

    // Remove event listeners
    document.removeEventListener("click", this.globalClickHandler)
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    window.winmixApp = new WinMixApp()
  } catch (error) {
    console.error("Failed to initialize WinMix application:", error)

    // Show error message to user
    const errorDiv = document.createElement("div")
    errorDiv.className =
      "fixed top-4 right-4 z-50 bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg"
    errorDiv.innerHTML = `
      <div class="flex items-center gap-2">
        <span>⚠️</span>
        <span>Hiba történt az alkalmazás betöltése során.</span>
      </div>
    `
    document.body.appendChild(errorDiv)

    setTimeout(() => {
      errorDiv.remove()
    }, 10000)
  }
})

// Global error handler
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error)
  if (window.winmixApp) {
    window.winmixApp.showError("Váratlan hiba történt. Frissítsd az oldalt.")
  }
})

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason)
  if (window.winmixApp) {
    window.winmixApp.showError("Hálózati hiba történt. Ellenőrizd az internetkapcsolatot.")
  }
})

// Export for potential external use
if (typeof module !== "undefined" && module.exports) {
  module.exports = WinMixApp
}
