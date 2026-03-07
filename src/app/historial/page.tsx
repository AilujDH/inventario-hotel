'use client'
import { useEffect, useState } from 'react'
import Shell from '@/components/Shell'
import { Toast, useToast } from '@/components/ui/Toast'
import { apiFetch } from '@/lib/api'
import { Inventario, Categoria } from '@/types'
import * as XLSX from 'xlsx'

function formatKr(n: number) {
  return 'kr ' + Number(n || 0).toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function HistorialPage() {
  const [inventarios, setInventarios] = useState<Inventario[]>([])
  const [categorias, setCategorias]   = useState<Categoria[]>([])
  const [detalle, setDetalle]         = useState<Inventario | null>(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const { toast, showToast, clearToast } = useToast()

  useEffect(() => {
    apiFetch<Inventario[]>('/api/inventarios').then(setInventarios)
    apiFetch<Categoria[]>('/api/categorias').then(setCategorias)
  }, [])

  const badgeClass = (cat: string) => {
    const idx = categorias.findIndex(c => c.nombre === cat)
    return `badge badge-${idx % 5}`
  }

  const verDetalle = async (inv: Inventario) => {
    setCargandoDetalle(true)
    try {
      const data = await apiFetch<Inventario>(`/api/inventarios/${inv.id}`)
      setDetalle(data)
    } catch { showToast('Error cargando detalle', 'error') }
    finally { setCargandoDetalle(false) }
  }

  const eliminar = async (inv: Inventario, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar este inventario?')) return
    try {
      await apiFetch(`/api/inventarios/${inv.id}`, { method: 'DELETE' })
      setInventarios(prev => prev.filter(i => i.id !== inv.id))
      if (detalle?.id === inv.id) setDetalle(null)
      showToast('Inventario eliminado', '')
    } catch (e: any) { showToast('Error: ' + e.message, 'error') }
  }

  const exportar = () => {
    if (!detalle?.items) return
    const rows = [['Producto','Categoría','Unidad','Cant./unidad','Cantidad','Total unidades','Subtotal']]
    detalle.items.forEach(i => {
      rows.push([i.nombre_producto, i.categoria, i.unidad, String(i.cant_por_unidad), String(i.cantidad), String(i.cantidad * i.cant_por_unidad), String(i.subtotal)])
    })
    rows.push(['','','','','','TOTAL', String(detalle.total)])
    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario')
    XLSX.writeFile(wb, `inventario_${detalle.mes}_${detalle.anio}.xlsx`)
  }

  return (
    <Shell>
      <div className="mb-7">
        <h2 className="page-title">Historial de Inventarios</h2>
        <p className="page-subtitle">Todos los inventarios guardados por mes</p>
      </div>

      {detalle ? (
        <>
          <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
            <h3 className="font-serif text-xl">Inventario — {detalle.mes} {detalle.anio}</h3>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm" onClick={exportar}>↓ Exportar Excel</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetalle(null)}>← Volver</button>
            </div>
          </div>

          <div className="table-wrap mb-4">
            <table>
              <thead>
                <tr>
                  <th>Producto</th><th>Categoría</th>
                  <th className="text-right">Cantidad</th><th>Unidad</th>
                  <th className="text-right">Total unidades</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cargandoDetalle ? (
                  <tr><td colSpan={6} className="empty">Cargando...</td></tr>
                ) : detalle.items?.map((item, i) => (
                  <tr key={i}>
                    <td><strong>{item.nombre_producto}</strong></td>
                    <td><span className={badgeClass(item.categoria)}>{item.categoria || '—'}</span></td>
                    <td className="text-right">{item.cantidad}</td>
                    <td>{item.unidad}</td>
                    <td className="text-right">{item.cantidad * (item.cant_por_unidad || 1)}</td>
                    <td className="text-right font-semibold text-sage">{formatKr(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="total-bar">
            <div>
              <div className="text-xs opacity-50 mb-1">Total en stock</div>
              <div className="font-serif text-3xl">{formatKr(detalle.total)}</div>
            </div>
          </div>
        </>
      ) : (
        <>
          {!inventarios.length ? (
            <div className="empty">No hay inventarios guardados todavía.</div>
          ) : inventarios.map(inv => (
            <div
              key={inv.id}
              onClick={() => verDetalle(inv)}
              className="bg-white border border-stone rounded-xl px-5 py-4 mb-2.5 flex justify-between items-center cursor-pointer hover:border-rust hover:shadow-sm transition-all"
            >
              <div>
                <div className="font-semibold">{inv.mes} {inv.anio}</div>
                <div className="text-xs text-mist mt-0.5">{inv.fecha || '—'}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-serif text-xl text-sage">{formatKr(inv.total)}</div>
                <button className="btn btn-danger" onClick={e => eliminar(inv, e)}>🗑</button>
              </div>
            </div>
          ))}
        </>
      )}

      <Toast {...toast} onClose={clearToast} />
    </Shell>
  )
}
