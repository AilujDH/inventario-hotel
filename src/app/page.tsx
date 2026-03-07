'use client'
import { useEffect, useState, useCallback } from 'react'
import Shell from '@/components/Shell'
import { Counter } from '@/components/ui/Counter'
import { Toast, useToast } from '@/components/ui/Toast'
import { apiFetch } from '@/lib/api'
import { Producto, Categoria, NuevoInventario } from '@/types'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function formatKr(n: number) {
  return 'kr ' + Number(n || 0).toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function InventarioPage() {
  const now = new Date()
  const [mes, setMes]         = useState(MESES[now.getMonth()])
  const [anio, setAnio]       = useState(now.getFullYear())
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cantidades, setCantidades] = useState<Record<number, number>>({})
  const [filtro, setFiltro]   = useState('')
  const [catFiltro, setCatFiltro] = useState('')
  const [guardando, setGuardando] = useState(false)
  const { toast, showToast, clearToast } = useToast()

  useEffect(() => {
    apiFetch<Producto[]>('/api/productos').then(setProductos).catch(() => {})
    apiFetch<Categoria[]>('/api/categorias').then(setCategorias).catch(() => {})
  }, [])

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) &&
    (!catFiltro || p.categoria === catFiltro)
  )

  const total = productos.reduce((s, p) => s + (cantidades[p.id] || 0) * p.costo, 0)
  const hayItems = Object.values(cantidades).some(v => v > 0)

  const setCantidad = useCallback((id: number, val: number) => {
    setCantidades(prev => ({ ...prev, [id]: Math.max(0, val) }))
  }, [])

  const guardar = async () => {
    const items = productos
      .filter(p => (cantidades[p.id] || 0) > 0)
      .map(p => ({
        producto_id: p.id,
        nombre_producto: p.nombre,
        categoria: p.categoria,
        unidad: p.unidad,
        cant_por_unidad: p.cantUnidad,
        cantidad: cantidades[p.id] || 0,
        costo_por_unidad: p.costo,
        subtotal: (cantidades[p.id] || 0) * p.costo,
      }))

    if (!items.length) { showToast('No hay cantidades cargadas.', 'error'); return }

    const payload: NuevoInventario = {
      mes, anio, fecha: new Date().toLocaleDateString('es-AR'),
      total, items
    }

    setGuardando(true)
    try {
      await apiFetch('/api/inventarios', { method: 'POST', body: JSON.stringify(payload) })
      setCantidades({})
      showToast(`✓ Inventario ${mes} ${anio} guardado`, 'success')
    } catch (e: any) {
      showToast('Error: ' + e.message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  const badgeClass = (cat: string) => {
    const idx = categorias.findIndex(c => c.nombre === cat)
    return `badge badge-${idx % 5}`
  }

  return (
    <Shell>
      <div className="flex justify-between items-start mb-7 flex-wrap gap-4">
        <div>
          <h2 className="page-title">Nuevo Inventario</h2>
          <p className="page-subtitle">Cargá las cantidades del mes</p>
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="field">
            <label>Mes</label>
            <select value={mes} onChange={e => setMes(e.target.value)} className="min-w-[120px]">
              {MESES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Año</label>
            <input type="number" value={anio} onChange={e => setAnio(+e.target.value)} className="w-20" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2.5 mb-4 flex-wrap">
        <input
          className="flex-1 min-w-[140px] px-3 py-2 border border-stone rounded-lg bg-paper text-sm focus:outline-none focus:border-rust"
          placeholder="🔍 Buscar producto..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
        <select
          className="flex-1 min-w-[140px] px-3 py-2 border border-stone rounded-lg bg-paper text-sm focus:outline-none focus:border-rust"
          value={catFiltro}
          onChange={e => setCatFiltro(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
        </select>
      </div>

      {/* Total bar */}
      {hayItems && (
        <div className="total-bar">
          <div>
            <div className="text-xs opacity-50 mb-1 font-light">Total en stock</div>
            <div className="font-serif text-3xl">{formatKr(total)}</div>
          </div>
          <button
            className="btn btn-rust"
            onClick={guardar}
            disabled={guardando}
          >
            {guardando ? '⏳ Guardando...' : '💾 Guardar inventario'}
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Unidad</th>
              <th className="text-right">Cant./unidad</th>
              <th className="text-right">kr/unidad</th>
              <th>Cantidad</th>
              <th className="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {!productosFiltrados.length ? (
              <tr>
                <td colSpan={7} className="empty">
                  {productos.length ? 'Sin resultados.' : 'No hay productos. Agregá en Catálogo primero.'}
                </td>
              </tr>
            ) : productosFiltrados.map(p => {
              const cant = cantidades[p.id] || 0
              const subtotal = cant * p.costo
              return (
                <tr key={p.id}>
                  <td><strong>{p.nombre}</strong></td>
                  <td><span className={badgeClass(p.categoria)}>{p.categoria || '—'}</span></td>
                  <td>{p.unidad}</td>
                  <td className="text-right">{p.cantUnidad}</td>
                  <td className="text-right">{formatKr(p.costo)}</td>
                  <td>
                    <Counter
                      value={cant}
                      onChange={val => setCantidad(p.id, val)}
                      step={1}
                    />
                  </td>
                  <td className="text-right font-semibold text-sage">
                    {subtotal > 0 ? formatKr(subtotal) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Toast {...toast} onClose={clearToast} />
    </Shell>
  )
}
