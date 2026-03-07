import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Inventario · Berns',
  description: 'Sistema de gestión de inventario — Hotel Berns',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-paper font-sans">{children}</body>
    </html>
  )
}
