// ── TIPOS PRINCIPALES ───────────────────────────────

export interface Producto {
  id: number
  nombre: string
  categoria: string
  unidad: string
  cantUnidad: number
  costo: number
}

export interface Categoria {
  id: number
  nombre: string
}

export interface Unidad {
  id: number
  nombre: string
}

export interface InventarioItem {
  id?: number
  inventario_id?: number
  producto_id: number
  nombre_producto: string
  categoria: string
  unidad: string
  cant_por_unidad: number
  cantidad: number
  costo_por_unidad: number
  subtotal: number
}

export interface Inventario {
  id: number
  mes: string
  anio: number
  fecha: string
  total: number
  created_at?: string
  items?: InventarioItem[]
}

export interface NuevoInventario {
  mes: string
  anio: number
  fecha: string
  total: number
  items: Omit<InventarioItem, 'id' | 'inventario_id'>[]
}

// ── TIPOS PARA API RESPONSES ─────────────────────────

export interface ApiResponse<T> {
  data?: T
  error?: string
}

// ── TIPOS PARA DASHBOARD ─────────────────────────────

export interface DashboardData {
  inventario: Inventario
  totalMateriaPrima: number
  totalProductoElaborado: number
  desglosePorCategoria: Record<string, number>
  topProductos: InventarioItem[]
}
