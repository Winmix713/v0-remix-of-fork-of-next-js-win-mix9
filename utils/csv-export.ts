export interface CSVExportOptions {
  filename?: string
  includeHeaders?: boolean
  delimiter?: string
  encoding?: string
}

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: { key: keyof T; label: string; formatter?: (value: any) => string }[],
  options: CSVExportOptions = {},
) {
  const { filename = "export", includeHeaders = true, delimiter = ",", encoding = "utf-8" } = options

  if (data.length === 0) {
    throw new Error("No data to export")
  }

  // Escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '""'
    const stringValue = value.toString()
    const escaped = stringValue.replace(/"/g, '""')
    return `"${escaped}"`
  }

  // Generate CSV content
  const rows: string[] = []

  // Add headers if requested
  if (includeHeaders) {
    const headers = columns.map((col) => escapeCSV(col.label)).join(delimiter)
    rows.push(headers)
  }

  // Add data rows
  data.forEach((item) => {
    const row = columns
      .map((col) => {
        const value = item[col.key]
        const formattedValue = col.formatter ? col.formatter(value) : value
        return escapeCSV(formattedValue)
      })
      .join(delimiter)
    rows.push(row)
  })

  const csvContent = rows.join("\n")

  // Create and download file
  const BOM = encoding === "utf-8" ? "\uFEFF" : ""
  const blob = new Blob([BOM + csvContent], { type: `text/csv;charset=${encoding};` })

  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up
  URL.revokeObjectURL(url)

  return {
    rowCount: data.length,
    filename: `${filename}.csv`,
  }
}

export function formatMatchForCSV(match: any) {
  return {
    home: match.home || "N/A",
    away: match.away || "N/A",
    ht: match.ht || "N/A",
    ft: match.ft || "N/A",
    result: match.result === "H" ? "Hazai" : match.result === "A" ? "Vendég" : "Döntetlen",
    btts: match.btts === "yes" ? "Igen" : "Nem",
    comeback: match.comeback === "yes" ? "Igen" : "Nem",
    date: match.date || new Date().toISOString().split("T")[0],
    league: match.league || "N/A",
    season: match.season || "N/A",
  }
}
