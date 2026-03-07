import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { NuevoInventario } from '@/types'

// GET /api/inventarios
export async function GET() {
  const { data, error } = await supabaseServer
    .from('inventarios')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/inventarios
export async function POST(req: NextRequest) {
  const body: NuevoInventario = await req.json()
  const { mes, anio, fecha, total, items } = body

  if (!mes || !anio || !items?.length)
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })

  // Verificar si ya existe
  const { data: existe } = await supabaseServer
    .from('inventarios')
    .select('id')
    .eq('mes', mes)
    .eq('anio', anio)
    .single()

  if (existe) {
    // Borrar el anterior (cascade borra los items)
    await supabaseServer.from('inventarios').delete().eq('id', existe.id)
  }

  // Crear nuevo inventario
  const { data: inv, error: invErr } = await supabaseServer
    .from('inventarios')
    .insert({ mes, anio, fecha, total })
    .select()
    .single()

  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 })

  // Insertar items
  const rows = items.map(i => ({ ...i, inventario_id: inv.id }))
  const { error: itemsErr } = await supabaseServer.from('inventario_items').insert(rows)
  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })

  return NextResponse.json(inv, { status: 201 })
}
