"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Spinner } from "@/components/ui/spinner"

function DashboardContent({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Spinner className="w-8 h-8 text-[var(--primary)]" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminSidebar />
      <main className="lg:pl-64 min-h-screen">
        <div className="p-3 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  )
}
