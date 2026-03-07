'use client'
import { useEffect, useState } from 'react'
import Shell from '@/components/Shell'
import { Toast, useToast } from '@/components/ui/Toast'
import { apiFetch } from '@/lib/api'
import { Categoria, Unidad } from '@/types'

export default function ConfiguracionPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [unidades, setUnidades]     = useState<Unidad[]>([])
  const [nuevaCat, setNuevaCat]     = useState('')
  const [nuevaUni, setNuevaUni]     = useState('')
  const { toast, showToast, clearToast } = useToast()

  useEffect(() => {
    apiFetch<Categoria[]>('/api/categorias').then(setCategorias)
    apiFetch<Unidad[]>('/api/unidades').then(setUnidades)
  }, [])

  const agregarCategoria = async () => {
    const nombre = nuevaCat.trim()
    if (!nombre) return
    if (categorias.find(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
      showToast('Ya existe esa categoría.', 'error'); return
    }
    try {
      const data = await apiFetch<Categoria>('/api/categorias', { method: 'POST', body: JSON.stringify({ nombre }) })
      setCategorias(prev => [...prev, data].sort((a,b) => a.nombre.localeCompare(b.nombre)))
      setNuevaCat('')
      showToast('✓ Categoría agregada', 'success')
    } catch (e: any) { showToast('Error: ' + e.message, 'error') }
  }

  const eliminarCategoria = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar la categoría "${nombre}"?`)) return
    try {
      await apiFetch(`/api/categorias/${id}`, { method: 'DELETE' })
      setCategorias(prev => prev.filter(c => c.id !== id))
      showToast('Categoría eliminada', '')
    } catch (e: any) { showToast('Error: ' + e.message, 'error') }
  }

  const agregarUnidad = async () => {
    const nombre = nuevaUni.trim()
    if (!nombre) return
    if (unidades.find(u => u.nombre.toLowerCase() === nombre.toLowerCase())) {
      showToast('Ya existe esa unidad.', 'error'); return
    }
    try {
      const data = await apiFetch<Unidad>('/api/unidades', { method: 'POST', body: JSON.stringify({ nombre }) })
      setUnidades(prev => [...prev, data].sort((a,b) => a.nombre.localeCompare(b.nombre)))
      setNuevaUni('')
      showToast('✓ Unidad agregada', 'success')
    } catch (e: any) { showToast('Error: ' + e.message, 'error') }
  }

  const eliminarUnidad = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar la unidad "${nombre}"?`)) return
    try {
      await apiFetch(`/api/unidades/${id}`, { method: 'DELETE' })
      setUnidades(prev => prev.filter(u => u.id !== id))
      showToast('Unidad eliminada', '')
    } catch (e: any) { showToast('Error: ' + e.message, 'error') }
  }

  return (
    <Shell>
      <div className="mb-7">
        <h2 className="page-title">Configuración</h2>
        <p className="page-subtitle">Gestioná categorías y unidades disponibles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Categorías */}
        <div className="card">
          <h3 className="font-serif text-lg mb-4">Categorías</h3>
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 px-3 py-2 border border-stone rounded-lg bg-paper text-sm focus:outline-none focus:border-rust"
              placeholder="Ej: Materia Prima — Lácteos"
              value={nuevaCat}
              onChange={e => setNuevaCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarCategoria()}
            />
            <button className="btn btn-primary btn-sm" onClick={agregarCategoria}>＋</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nombre</th><th className="w-12"></th></tr></thead>
              <tbody>
                {!categorias.length ? (
                  <tr><td colSpan={2} className="empty">Sin categorías</td></tr>
                ) : categorias.map((c, i) => (
                  <tr key={c.id}>
                    <td><span className={`badge badge-${i % 5}`}>{c.nombre}</span></td>
                    <td><button className="btn btn-danger" onClick={() => eliminarCategoria(c.id, c.nombre)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unidades */}
        <div className="card">
          <h3 className="font-serif text-lg mb-4">Unidades</h3>
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 px-3 py-2 border border-stone rounded-lg bg-paper text-sm focus:outline-none focus:border-rust"
              placeholder="Ej: kg, caja, botella"
              value={nuevaUni}
              onChange={e => setNuevaUni(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarUnidad()}
            />
            <button className="btn btn-primary btn-sm" onClick={agregarUnidad}>＋</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nombre</th><th className="w-12"></th></tr></thead>
              <tbody>
                {!unidades.length ? (
                  <tr><td colSpan={2} className="empty">Sin unidades</td></tr>
                ) : unidades.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.nombre}</strong></td>
                    <td><button className="btn btn-danger" onClick={() => eliminarUnidad(u.id, u.nombre)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <Toast {...toast} onClose={clearToast} />
    </Shell>
  )
}
