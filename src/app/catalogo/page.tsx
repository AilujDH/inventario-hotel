'use client'
import { useEffect, useState, useRef } from 'react'
import Shell from '@/components/Shell'
import { Toast, useToast } from '@/components/ui/Toast'
import { apiFetch } from '@/lib/api'
import { Producto, Categoria, Unidad } from '@/types'
import * as XLSX from 'xlsx'

function formatKr(n: number) {
  return 'kr ' + Number(n || 0).toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const emptyForm = { nombre: '', categoria: '', unidad: '', cantUnidad: '', costo: '' }

export default function CatalogoPage() {
  const [productos, setProductos]   = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [unidades, setUnidades]     = useState<Unidad[]>([])
  const [form, setForm]             = useState(emptyForm)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [filtro, setFiltro]         = useState('')
  const [catFiltro, setCatFiltro]   = useState('')
  const [guardando, setGuardando]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast, showToast, clearToast } = useToast()

  const cargar = async () => {
    const [prods, cats, unis] = await Promise.all([
      apiFetch<Producto[]>('/api/productos'),
      apiFetch<Categoria[]>('/api/categorias'),
      apiFetch<Unidad[]>('/api/unidades'),
    ])
    setProductos(prods)
    setCategorias(cats)
    setUnidades(unis)
  }

  useEffect(() => { cargar() }, [])

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) &&
    (!catFiltro || p.categoria === catFiltro)
  )

  const badgeClass = (cat: string) => {
    const idx = categorias.findIndex(c => c.nombre === cat)
    return `badge badge-${idx % 5}`
  }

  const guardar = async () => {
    if (!form.nombre.trim()) { showToast('El nombre es obligatorio.', 'error'); return }
    setGuardando(true)
    try {
      const body = {
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        unidad: form.unidad || 'unidad',
        cantUnidad: parseFloat(form.cantUnidad) || 1,
        costo: parseFloat(form.costo) || 0,
      }
      if (editandoId !== null) {
        const updated = await apiFetch<Producto>(`/api/productos/${editandoId}`, { method: 'PATCH', body: JSON.stringify(body) })
        setProductos(prev => prev.map(p => p.id === editandoId ? updated : p))
        setEditandoId(null)
      } else {
        const nuevo = await apiFetch<Producto>('/api/productos', { method: 'POST', body: JSON.stringify(body) })
        setProductos(prev => [...prev, nuevo].sort((a,b) => a.nombre.localeCompare(b.nombre)))
      }
      setForm(emptyForm)
      showToast('✓ Producto guardado', 'success')
    } catch (e: any) {
      showToast('Error: ' + e.message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  const editar = (p: Producto) => {
    setForm({ nombre: p.nombre, categoria: p.categoria, unidad: p.unidad, cantUnidad: String(p.cantUnidad), costo: String(p.costo) })
    setEditandoId(p.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await apiFetch(`/api/productos/${id}`, { method: 'DELETE' })
      setProductos(prev => prev.filter(p => p.id !== id))
      showToast('Producto eliminado', '')
    } catch (e: any) {
      showToast('Error: ' + e.message, 'error')
    }
  }

  // ── IMPORTAR EXCEL ───────────────────────────────
  const importarExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, any>[]

      const find = (row: Record<string, any>, ...keys: string[]) => {
        for (const k of keys) {
          const found = Object.keys(row).find(r => r.toLowerCase().trim() === k.toLowerCase())
          if (found) return String(row[found]).trim()
        }
        return ''
      }

      const filas = rows.map(r => ({
        nombre:    find(r, 'producto', 'nombre', 'product'),
        categoria: find(r, 'categoría', 'categoria', 'category'),
        unidad:    find(r, 'unidad', 'unit'),
        cantUnidad: parseFloat(find(r, 'cantidad por unidad', 'cant/unidad')) || 1,
        costo:     parseFloat(find(r, 'costo por unidad', 'costo', 'precio')) || 0,
      })).filter(r => r.nombre)

      if (!filas.length) { showToast('No se encontraron productos.', 'error'); return }

      let agregados = 0, reemplazados = 0, saltados = 0

      for (const fila of filas) {
        const existe = productos.find(p => p.nombre.toLowerCase() === fila.nombre.toLowerCase())
        if (existe) {
          const reemplazar = confirm(`"${fila.nombre}" ya existe.\n\n¿Reemplazarlo con los nuevos datos?`)
          if (reemplazar) {
            const updated = await apiFetch<Producto>(`/api/productos/${existe.id}`, { method: 'PATCH', body: JSON.stringify(fila) })
            setProductos(prev => prev.map(p => p.id === existe.id ? updated : p))
            reemplazados++
          } else {
            const duplicar = confirm(`¿Agregarlo igual como duplicado?\n(Útil si tenés dos proveedores distintos)`)
            if (duplicar) {
              const nuevo = await apiFetch<Producto>('/api/productos', { method: 'POST', body: JSON.stringify(fila) })
              setProductos(prev => [...prev, nuevo])
              agregados++
            } else { saltados++ }
          }
        } else {
          const nuevo = await apiFetch<Producto>('/api/productos', { method: 'POST', body: JSON.stringify(fila) })
          setProductos(prev => [...prev, nuevo])
          agregados++
        }
      }

      if (fileRef.current) fileRef.current.value = ''
      const partes = []
      if (agregados)    partes.push(`${agregados} agregados`)
      if (reemplazados) partes.push(`${reemplazados} reemplazados`)
      if (saltados)     partes.push(`${saltados} saltados`)
      showToast('✓ ' + partes.join(' · '), 'success')
    }
    reader.readAsArrayBuffer(file)
  }

  const descargarPlantilla = () => {
    const rows = [
      ['producto', 'categoría', 'unidad', 'cantidad por unidad', 'costo por unidad'],
      ['Manteca', 'Materia Prima — Lácteos', 'kg', 1, 45.00],
      ['Harina 000', 'Materia Prima — Harinas', 'bolsa', 25, 120.00],
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 28 }, { wch: 35 }, { wch: 12 }, { wch: 22 }, { wch: 20 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Catálogo')
    XLSX.writeFile(wb, 'plantilla_catalogo_berns.xlsx')
  }

  return (
    <Shell>
      <div className="flex justify-between items-start mb-7 flex-wrap gap-4">
        <div>
          <h2 className="page-title">Catálogo de Productos</h2>
          <p className="page-subtitle">Configurá productos, unidades y costos</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-ghost btn-sm" onClick={descargarPlantilla}>↓ Plantilla Excel</button>
          <button className="btn btn-sage btn-sm" onClick={() => fileRef.current?.click()}>↑ Importar Excel</button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={importarExcel} />
        </div>
      </div>

      {/* Formulario */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-4">
          <div className="field col-span-2">
            <label>Nombre del producto *</label>
            <input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} placeholder="Ej: Crema de leche" />
          </div>
          <div className="field">
            <label>Categoría</label>
            <select value={form.categoria} onChange={e => setForm(f => ({...f, categoria: e.target.value}))}>
              <option value="">— Seleccioná —</option>
              {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Unidad</label>
            <select value={form.unidad} onChange={e => setForm(f => ({...f, unidad: e.target.value}))}>
              <option value="">— Seleccioná —</option>
              {unidades.map(u => <option key={u.id} value={u.nombre}>{u.nombre}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Cantidad por unidad</label>
            <input type="number" value={form.cantUnidad} onChange={e => setForm(f => ({...f, cantUnidad: e.target.value}))} placeholder="Ej: 12" min="0" />
          </div>
          <div className="field">
            <label>Costo por unidad (kr)</label>
            <input type="number" value={form.costo} onChange={e => setForm(f => ({...f, costo: e.target.value}))} placeholder="Ej: 89.50" min="0" step="0.01" />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={guardar} disabled={guardando}>
            {guardando ? '⏳ Guardando...' : editandoId ? '💾 Guardar cambios' : '＋ Agregar producto'}
          </button>
          {editandoId && (
            <button className="btn btn-ghost" onClick={() => { setForm(emptyForm); setEditandoId(null) }}>Cancelar</button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2.5 mb-4 flex-wrap">
        <input className="flex-1 min-w-[140px] px-3 py-2 border border-stone rounded-lg bg-paper text-sm focus:outline-none focus:border-rust" placeholder="🔍 Buscar..." value={filtro} onChange={e => setFiltro(e.target.value)} />
        <select className="flex-1 min-w-[140px] px-3 py-2 border border-stone rounded-lg bg-paper text-sm focus:outline-none focus:border-rust" value={catFiltro} onChange={e => setCatFiltro(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th><th>Categoría</th><th>Unidad</th>
              <th className="text-right">Cant./unidad</th>
              <th className="text-right">Costo/unidad</th>
              <th className="text-right">Costo/pieza</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!productosFiltrados.length ? (
              <tr><td colSpan={7} className="empty">{productos.length ? 'Sin resultados.' : 'No hay productos todavía.'}</td></tr>
            ) : productosFiltrados.map(p => (
              <tr key={p.id}>
                <td><strong>{p.nombre}</strong></td>
                <td><span className={badgeClass(p.categoria)}>{p.categoria || '—'}</span></td>
                <td>{p.unidad}</td>
                <td className="text-right">{p.cantUnidad}</td>
                <td className="text-right">{formatKr(p.costo)}</td>
                <td className="text-right">{formatKr(p.costo / (p.cantUnidad || 1))}</td>
                <td>
                  <div className="flex gap-1.5">
                    <button className="btn btn-ghost btn-sm" onClick={() => editar(p)}>✏ Editar</button>
                    <button className="btn btn-danger" onClick={() => eliminar(p.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Toast {...toast} onClose={clearToast} />
    </Shell>
  )
}
