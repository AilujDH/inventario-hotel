import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { nombre, categoria, unidad, cantUnidad, costo } = body

  const { data, error } = await supabaseServer
    .from('productos')
    .update({ nombre, categoria, unidad, cant_por_unidad: cantUnidad, costo_por_unidad: costo })
    .eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, nombre: data.nombre, categoria: data.categoria || '', unidad: data.unidad || 'unidad', cantUnidad: data.cant_por_unidad || 1, costo: data.costo_por_unidad || 0 })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await supabaseServer.from('productos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}