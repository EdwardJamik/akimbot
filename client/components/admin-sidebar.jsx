"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  MessageSquare,
  Users,
  Send,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Bot,
  ClipboardCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Головна", icon: LayoutDashboard },
  { href: "/dashboard/messages", label: "Повідомлення", icon: MessageSquare },
  { href: "/dashboard/users", label: "Користувачі", icon: Users },
  { href: "/dashboard/broadcast", label: "Розсилка", icon: Send },
  { href: "/dashboard/courses", label: "Курси", icon: GraduationCap },
  { href: "/dashboard/testing", label: "Тестування", icon: ClipboardCheck },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">Akim</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Адмін панель</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium",
                isActive
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
        >
          <LogOut className="w-5 h-5" />
          Вийти
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-[var(--card)] border border-[var(--border)]"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-[var(--card)] border-r border-[var(--border)] flex flex-col transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 bg-[var(--card)] border-r border-[var(--border)] flex-col">
        <SidebarContent />
      </aside>
    </>
  )
}
