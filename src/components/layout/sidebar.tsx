'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  LayoutDashboard,
  Map,
  Package,
  Users,
  Warehouse,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Klien", icon: Users },
  { href: "/inventory", label: "Inventori", icon: Package },
  { href: "/warehouse", label: "Peta Gudang", icon: Map },
  { href: "/billing", label: "Billing", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex size-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600">
          <Warehouse className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-slate-900">
            WH Dashboard
          </p>
          <p className="text-xs text-slate-500">Hybrid Fulfillment</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "border border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-200 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          Gudang
        </p>
        <p className="text-sm text-slate-600">Jombang, Jawa Timur</p>
        <p className="text-xs text-slate-500">v1.0 Prototype</p>
      </div>
    </aside>
  )
}
