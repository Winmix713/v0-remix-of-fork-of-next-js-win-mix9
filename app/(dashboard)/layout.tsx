import type React from "react"
import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SplineBackground } from "@/components/spline-background"
import { LoadingOverlay } from "@/components/loading-overlay"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <SplineBackground />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] rounded-full blur-3xl opacity-35 bg-[radial-gradient(closest-side,rgba(138,92,246,0.5),rgba(10,10,18,0))]"></div>
        <div className="absolute -bottom-20 -right-20 w-[800px] h-[800px] rounded-full blur-3xl opacity-30 bg-[radial-gradient(closest-side,rgba(99,102,241,0.4),rgba(10,10,18,0))]"></div>
      </div>

      <Header />

      <main className="relative z-10">
        <Suspense fallback={<LoadingOverlay isVisible={true} />}>{children}</Suspense>
      </main>

      <Footer />
    </div>
  )
}
