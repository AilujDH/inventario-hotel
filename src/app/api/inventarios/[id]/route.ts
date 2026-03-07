import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: inv, error: invErr } = await supabaseServer
    .from('inventarios').select('*').eq('id', id).single()
  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 })

  const { data: items, error: itemsErr } = await supabaseServer
    .from('inventario_items').select('*').eq('inventario_id', id)
  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })

  return NextResponse.json({ ...inv, items })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await supabaseServer.from('inventarios').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}