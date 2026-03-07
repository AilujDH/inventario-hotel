'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/',              label: 'Inventario',    icon: <ClipboardIcon /> },
  { href: '/catalogo',      label: 'Catálogo',      icon: <CubeIcon /> },
  { href: '/historial',     label: 'Historial',     icon: <ClockIcon /> },
  { href: '/dashboard',     label: 'Dashboard',     icon: <GridIcon /> },
  { href: '/configuracion', label: 'Configuración', icon: <SettingsIcon /> },
]

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const now = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <>
      {/* Header */}
      <header className="bg-ink text-paper px-10 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-rust rounded-md flex items-center justify-center text-base">🍽</div>
          <span className="font-serif text-lg">Inventario · Berns</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-paper/40 font-light">{now}</span>
          <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-[#7DCE85]">
            <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
            Supabase ✓
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-white border-b border-stone px-10 flex sticky top-16 z-40">
        {NAV.map(({ href, label, icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-5 py-4 text-sm font-medium border-b-2 transition-all duration-150
                ${active
                  ? 'text-ink border-rust'
                  : 'text-mist border-transparent hover:text-ink'}`}
            >
              <span className="w-4 h-4">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-10 py-9">{children}</main>
    </>
  )
}

// ── ICONS ────────────────────────────────────────────
function ClipboardIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
}
function CubeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>
}
function ClockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
}
function GridIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><rect x="2" y="3" width="7" height="7" rx="1"/><rect x="15" y="3" width="7" height="7" rx="1"/><rect x="2" y="14" width="7" height="7" rx="1"/><rect x="15" y="14" width="7" height="7" rx="1"/></svg>
}
function SettingsIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
}
