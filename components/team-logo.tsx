"use client"

import { useState } from "react"

interface TeamLogoProps {
  teamName: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function TeamLogo({ teamName, size = "md", className = "" }: TeamLogoProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  }

  const teamLogos: { [key: string]: string } = {
    Ferencváros:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Ferencvarosi_TC_logo.svg/500px-Ferencvarosi_TC_logo.svg.png",
    Újpest: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Ujpest_FC_logo.svg/500px-Ujpest_FC_logo.svg.png",
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

  const logoUrl =
    teamLogos[teamName] || `/placeholder.svg?height=40&width=40&text=${encodeURIComponent(teamName.charAt(0))}`
  const fallbackUrl = `/placeholder.svg?height=40&width=40&text=${encodeURIComponent(teamName.charAt(0))}`

  return (
    <img
      src={imageError ? fallbackUrl : logoUrl}
      alt={`${teamName} logo`}
      className={`${sizeClasses[size]} rounded-full ring-1 ring-white/10 object-cover team-logo ${className}`}
      onError={() => setImageError(true)}
    />
  )
}
