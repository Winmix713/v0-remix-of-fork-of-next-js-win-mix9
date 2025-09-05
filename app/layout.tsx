import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "WinMix — Mérkőzés szűrő és statisztikák",
  description: "Mérkőzés szűrés, statisztikák és CSV export.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="hu" className={`${inter.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/styles/winmix-styles.css" />
        <link rel="stylesheet" href="/styles/winmix-enhanced.css" />
      </head>
      <body className="antialiased text-zinc-100 bg-[#0a0a12] font-sans">
        {children}
        <Script src="https://unpkg.com/lucide@latest" strategy="beforeInteractive" />
      </body>
    </html>
  )
}
