import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// CSV file URLs
const csvFiles = [
  {
    id: 1,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-BqrtWtpI48P4sH13bcM3n8Fy5pjLnW.csv",
  },
  {
    id: 2,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-k8CiZNMid3UVty6fhTx1AV5vYjcEGM.csv",
  },
  {
    id: 3,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-9diZQPobJ9G0RCh5o87edkELgKBOij.csv",
  },
  {
    id: 4,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-QbPQzFIMdNzPDo1vq0gOAbEKl1OzsV.csv",
  },
  {
    id: 5,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-4oVlIKQkStje941e7r0qJU9ES5540i.csv",
  },
  {
    id: 6,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-HfADUDSs1FOJp2NGAJAsiQHFT3xwqZ.csv",
  },
]

// Simple CSV parser function
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
    const row = {}

    headers.forEach((header, index) => {
      let value = values[index] || null

      // Convert empty strings to null
      if (value === "" || value === "null" || value === "NULL") {
        value = null
      }

      // Convert numeric strings to numbers for specific fields
      const numericFields = [
        "half_time_home_goals",
        "half_time_away_goals",
        "full_time_home_goals",
        "full_time_away_goals",
        "attendance",
        "home_corners",
        "away_corners",
        "home_shots",
        "away_shots",
        "home_shots_on_target",
        "away_shots_on_target",
        "home_yellow_cards",
        "away_yellow_cards",
        "home_red_cards",
        "away_red_cards",
      ]

      if (numericFields.includes(header) && value !== null) {
        const num = Number.parseInt(value)
        value = isNaN(num) ? null : num
      }

      row[header] = value
    })

    rows.push(row)
  }

  return rows
}

// Function to transform CSV data to match database schema
function transformMatchData(csvRow) {
  return {
    // Skip id field - let database auto-generate
    match_time: csvRow.match_time || "12:00:00",
    home_team: csvRow.home_team || "Unknown Team",
    away_team: csvRow.away_team || "Unknown Team",
    half_time_home_goals: csvRow.half_time_home_goals,
    half_time_away_goals: csvRow.half_time_away_goals,
    full_time_home_goals: csvRow.full_time_home_goals || 0,
    full_time_away_goals: csvRow.full_time_away_goals || 0,
    league: csvRow.league || "Unknown League",
    season: csvRow.season || "Unknown Season",
    attendance: csvRow.attendance,
    venue: csvRow.venue || "Unknown Venue",
    referee: csvRow.referee,
    home_corners: csvRow.home_corners,
    away_corners: csvRow.away_corners,
    home_shots: csvRow.home_shots,
    away_shots: csvRow.away_shots,
    home_shots_on_target: csvRow.home_shots_on_target,
    away_shots_on_target: csvRow.away_shots_on_target,
    home_yellow_cards: csvRow.home_yellow_cards,
    away_yellow_cards: csvRow.away_yellow_cards,
    home_red_cards: csvRow.home_red_cards,
    away_red_cards: csvRow.away_red_cards,
    match_status: csvRow.match_status || "completed",
    // Skip created_at and updated_at - let database handle these
  }
}

// Main import function
async function importCSVData() {
  console.log("🚀 Starting CSV import process...")

  let totalImported = 0

  for (const file of csvFiles) {
    try {
      console.log(`📥 Fetching CSV file ${file.id}...`)

      const response = await fetch(file.url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const csvText = await response.text()
      console.log(`✅ Successfully fetched CSV file ${file.id}`)

      // Parse CSV data
      const csvData = parseCSV(csvText)
      console.log(`📊 Parsed ${csvData.length} rows from CSV file ${file.id}`)

      // Transform data for database
      const matchData = csvData.map(transformMatchData)

      // Insert data in batches to avoid timeout
      const batchSize = 100
      let imported = 0

      for (let i = 0; i < matchData.length; i += batchSize) {
        const batch = matchData.slice(i, i + batchSize)

        const { data, error } = await supabase.from("matches").insert(batch).select("id")

        if (error) {
          console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1} from file ${file.id}:`, error)
          continue
        }

        imported += batch.length
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} records) from file ${file.id}`)
      }

      console.log(`🎉 Successfully imported ${imported} matches from CSV file ${file.id}`)
      totalImported += imported
    } catch (error) {
      console.error(`❌ Error processing CSV file ${file.id}:`, error)
    }
  }

  console.log(`🏆 Import complete! Total matches imported: ${totalImported}`)

  // Verify import
  const { count, error } = await supabase.from("matches").select("*", { count: "exact", head: true })

  if (error) {
    console.error("❌ Error verifying import:", error)
  } else {
    console.log(`📊 Total matches in database: ${count}`)
  }
}

// Run the import
importCSVData().catch(console.error)
