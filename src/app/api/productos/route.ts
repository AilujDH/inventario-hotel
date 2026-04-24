import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { Producto } from '@/types'

export async function GET() {
  const { data, error } = await supabaseServer
    .from('productos')
    .select('*')
    .order('nombre')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const productos: Producto[] = data.map(p => ({
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria || '',
    unidad: p.unidad || 'unidad',
    cantUnidad: p.cant_por_unidad || 1,
    costo: p.costo_por_unidad || 0,
  }))

  return NextResponse.json(productos)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, categoria, unidad, cantUnidad, costo } = body

  if (!nombre) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  }

  // asegurar que la categoría exista
  if (categoria) {
    const { data: existingCat } = await supabaseServer
      .from('categorias')
      .select('id')
      .eq('nombre', categoria)
      .maybeSingle()

    if (!existingCat) {
      await supabaseServer
        .from('categorias')
        .insert({ nombre: categoria })
    }
  }

  // insertar producto
  const { data, error } = await supabaseServer
    .from('productos')
    .insert({
      nombre,
      categoria,
      unidad,
      cant_por_unidad: cantUnidad,
      costo_por_unidad: costo
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    id: data.id,
    nombre: data.nombre,
    categoria: data.categoria || '',
    unidad: data.unidad || 'unidad',
    cantUnidad: data.cant_por_unidad || 1,
    costo: data.costo_por_unidad || 0,
  }, { status: 201 })
}