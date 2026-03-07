'use client'
import { useEffect, useState, useRef } from 'react'
import Shell from '@/components/Shell'
import { apiFetch } from '@/lib/api'
import { Inventario, Categoria } from '@/types'
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, BarController } from 'chart.js'

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, BarController)

function formatKr(n: number) {
  return 'kr ' + Number(n || 0).toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function pct(parte: number, total: number) {
  if (!total) return '0%'
  return Math.round((parte / total) * 100) + '% del stock'
}

const COLORES = ['#5A7A62','#C05A2E','#B8860B','#6B5B9E','#3A7EA8','#7DCE85','#E8956A','#A89BCE','#7AB8D4','#E0C96A']

export default function DashboardPage() {
  const [inventarios, setInventarios] = useState<Inventario[]>([])
  const [categorias, setCategorias]   = useState<Categoria[]>([])
  const [id1, setId1] = useState<string>('')
  const [id2, setId2] = useState<string>('')
  const [inv1, setInv1] = useState<Inventario | null>(null)
  const [inv2, setInv2] = useState<Inventario | null>(null)

  const chartMPRef  = useRef<HTMLCanvasElement>(null)
  const chartPERef  = useRef<HTMLCanvasElement>(null)
  const chartTopRef = useRef<HTMLCanvasElement>(null)
  const chartsRef   = useRef<Chart[]>([])

  useEffect(() => {
    Promise.all([
      apiFetch<Inventario[]>('/api/inventarios'),
      apiFetch<Categoria[]>('/api/categorias'),
    ]).then(([invs, cats]) => {
      setInventarios(invs)
      setCategorias(cats)
      if (invs.length) setId1(String(invs[0].id))
    })
  }, [])

  useEffect(() => {
    if (!id1) return
    apiFetch<Inventario>(`/api/inventarios/${id1}`).then(setInv1)
  }, [id1])

  useEffect(() => {
    if (!id2) { setInv2(null); return }
    apiFetch<Inventario>(`/api/inventarios/${id2}`).then(setInv2)
  }, [id2])

  useEffect(() => {
    if (!inv1) return
    // Destruir charts anteriores
    chartsRef.current.forEach(c => c.destroy())
    chartsRef.current = []

    const items = inv1.items || []
    const agrupar = (prefijo: string) => {
      const map: Record<string, number> = {}
      items.filter(i => i.categoria?.startsWith(prefijo)).forEach(i => {
        const sub = i.categoria.includes('—') ? i.categoria.split('—')[1].trim() : i.categoria
        map[sub] = (map[sub] || 0) + i.subtotal
      })
      return map
    }

    const chartOpts = (data: Record<string, number>, colors: string[]) => ({
      type: 'doughnut' as const,
      data: {
        labels: Object.keys(data),
        datasets: [{ data: Object.values(data), backgroundColor: colors, borderWidth: 2, borderColor: '#FEFCF9' }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' as const, labels: { font: { family: 'Outfit', size: 11 }, padding: 10, boxWidth: 12 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${formatKr(ctx.raw)}` } }
        },
        cutout: '60%'
      }
    })

    if (chartMPRef.current) {
      const mpData = agrupar('Materia Prima')
      if (Object.keys(mpData).length)
        chartsRef.current.push(new Chart(chartMPRef.current, chartOpts(mpData, COLORES)))
    }

    if (chartPERef.current) {
      const peData = agrupar('Producto Elaborado')
      if (Object.keys(peData).length)
        chartsRef.current.push(new Chart(chartPERef.current, chartOpts(peData, ['#B8860B','#C05A2E','#6B5B9E','#3A7EA8'])))
    }

    if (chartTopRef.current) {
      const top = [...items].sort((a,b) => b.subtotal - a.subtotal).slice(0, 10)
      chartsRef.current.push(new Chart(chartTopRef.current, {
        type: 'bar',
        data: {
          labels: top.map(i => i.nombre_producto),
          datasets: [{
            data: top.map(i => i.subtotal),
            backgroundColor: top.map(i => i.categoria?.startsWith('Materia Prima') ? '#5A7A62' : '#B8860B'),
            borderRadius: 5,
            borderSkipped: false,
          }]
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx: any) => ` ${formatKr(ctx.raw)}` } }
          },
          scales: {
            x: { grid: { color: '#E2DDD5' }, ticks: { font: { family: 'Outfit', size: 11 }, callback: (v: any) => 'kr ' + Number(v).toLocaleString('sv-SE') } },
            y: { grid: { display: false }, ticks: { font: { family: 'Outfit', size: 11 } } }
          }
        }
      }))
    }

    return () => { chartsRef.current.forEach(c => c.destroy()); chartsRef.current = [] }
  }, [inv1])

  const totalMP = (inv: Inventario) => (inv.items || []).filter(i => i.categoria?.startsWith('Materia Prima')).reduce((s,i) => s+i.subtotal, 0)
  const totalPE = (inv: Inventario) => (inv.items || []).filter(i => i.categoria?.startsWith('Producto Elaborado')).reduce((s,i) => s+i.subtotal, 0)

  const badgeClass = (cat: string) => {
    const idx = categorias.findIndex(c => c.nombre === cat)
    return `badge badge-${idx % 5}`
  }

  return (
    <Shell>
      <div className="mb-7">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Valor en stock por mes</p>
      </div>

      {/* Selector */}
      <div className="card flex items-end gap-4 flex-wrap mb-6">
        <div className="field min-w-[160px]">
          <label>Mes a ver</label>
          <select value={id1} onChange={e => setId1(e.target.value)}>
            {inventarios.map(inv => <option key={inv.id} value={inv.id}>{inv.mes} {inv.anio}</option>)}
          </select>
        </div>
        <span className="text-sm text-mist pb-2">comparar con</span>
        <div className="field min-w-[160px]">
          <label>Otro mes (opcional)</label>
          <select value={id2} onChange={e => setId2(e.target.value)}>
            <option value="">— ninguno —</option>
            {inventarios.map(inv => <option key={inv.id} value={inv.id}>{inv.mes} {inv.anio}</option>)}
          </select>
        </div>
      </div>

      {!inv1 ? (
        <div className="empty">Seleccioná un mes para ver el dashboard.</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Stock total',      val: inv1.total,       color: 'rust' },
              { label: 'Materia Prima',    val: totalMP(inv1),    color: 'sage' },
              { label: 'Prod. Elaborado',  val: totalPE(inv1),    color: 'gold' },
            ].map(({ label, val, color }) => (
              <div key={label} className={`bg-white border border-stone rounded-xl p-6 border-t-[3px] ${color === 'rust' ? 'border-t-rust' : color === 'sage' ? 'border-t-sage' : 'border-t-gold'}`}>
                <div className="text-xs font-semibold uppercase tracking-wider text-mist mb-2">{label}</div>
                <div className="font-serif text-2xl text-ink">{formatKr(val)}</div>
                {label !== 'Stock total' && <div className="text-xs text-mist mt-1.5">{pct(val, inv1.total)}</div>}
              </div>
            ))}
          </div>

          {/* Comparación */}
          {inv2 && (
            <div className="bg-white border border-stone rounded-xl overflow-hidden mb-6">
              <div className="grid grid-cols-4 px-5 py-3 bg-paper2 border-b border-stone text-xs font-semibold text-mist uppercase tracking-wider">
                <div></div>
                <div className="text-right text-rust">{inv1.mes} {inv1.anio}</div>
                <div className="text-center">diff</div>
                <div className="text-right text-gold">{inv2.mes} {inv2.anio}</div>
              </div>
              {[
                { label: 'Stock total',     v1: inv1.total,    v2: inv2.total },
                { label: 'Materia Prima',   v1: totalMP(inv1), v2: totalMP(inv2) },
                { label: 'Prod. Elaborado', v1: totalPE(inv1), v2: totalPE(inv2) },
              ].map(({ label, v1, v2 }) => {
                const diff = v1 - v2
                return (
                  <div key={label} className="grid grid-cols-4 px-5 py-3.5 border-b border-stone last:border-0 items-center text-sm">
                    <div className="font-medium">{label}</div>
                    <div className="text-right font-semibold">{formatKr(v1)}</div>
                    <div className={`text-center text-xs font-semibold ${diff > 0 ? 'text-rust' : diff < 0 ? 'text-sage' : 'text-mist'}`}>
                      {diff === 0 ? '—' : (diff > 0 ? '▲ ' : '▼ ') + formatKr(Math.abs(diff))}
                    </div>
                    <div className="text-right font-semibold">{formatKr(v2)}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Gráficos donas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="card">
              <div className="font-serif text-base mb-4">Materia Prima — por subcategoría</div>
              <div className="h-56"><canvas ref={chartMPRef} /></div>
            </div>
            <div className="card">
              <div className="font-serif text-base mb-4">Producto Elaborado — por tipo</div>
              <div className="h-56"><canvas ref={chartPERef} /></div>
            </div>
          </div>

          {/* Top productos */}
          <div className="card">
            <div className="font-serif text-base mb-4">Top productos en stock</div>
            <div className="h-72"><canvas ref={chartTopRef} /></div>
          </div>
        </>
      )}
    </Shell>
  )
}
