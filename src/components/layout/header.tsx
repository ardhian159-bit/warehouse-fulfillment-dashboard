'use client'

import { usePathname } from "next/navigation"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Klien",
  "/inventory": "Inventori",
  "/warehouse": "Peta Gudang",
  "/billing": "Billing",
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/clients/")) {
    return "Detail Klien"
  }

  return pageTitles[pathname] ?? "WH Dashboard"
}

export function Header() {
  const pathname = usePathname()
  const currentDate = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date())

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          {getPageTitle(pathname)}
        </h1>
        <p className="text-sm text-slate-500">
          Operasional gudang hybrid warehouse
        </p>
      </div>
      <div className="text-sm font-medium text-slate-500">{currentDate}</div>
    </header>
  )
}
