# Inventario · Berns — Next.js
Stack: Next.js 14 · TypeScript · Tailwind · Supabase · Vercel

Sistema full-stack de gestión de inventario desarrollado para un cliente real (Hotel Berns, Suecia). Permite al equipo de cocina llevar control mensual de stock, ver un dashboard con KPIs, comparar períodos históricos, y cargar/exportar productos vía Excel.
Funcionalidades principales:

Conteo de inventario mensual por producto y categoría
Dashboard con KPIs: valor total de stock, desglose por categoría
Comparación histórica entre períodos
Import/export de catálogo de productos vía Excel
Backend propio con API routes (Next.js) conectado a Supabase (PostgreSQL)

⚠️ Nota: la instancia de Supabase que alimentaba el demo en vivo fue eliminada, por lo que el deploy en Vercel actualmente no muestra datos. El código y la arquitectura siguen siendo representativos del proyecto completo.
---

## 🚀 Correr localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Copiá .env.local y completá SUPABASE_SERVICE_KEY con la service_role key de Supabase
# Settings → API → service_role (secret)

# 3. Correr en desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura

```
src/
├── app/
│   ├── page.tsx              ← Inventario (home)
│   ├── catalogo/page.tsx
│   ├── historial/page.tsx
│   ├── dashboard/page.tsx
│   ├── configuracion/page.tsx
│   └── api/                  ← Backend (API Routes)
│       ├── productos/
│       ├── inventarios/
│       ├── categorias/
│       └── unidades/
├── components/
│   ├── Shell.tsx             ← Header + Nav
│   └── ui/
│       ├── Counter.tsx       ← Input de cantidad
│       └── Toast.tsx
├── lib/
│   ├── supabase.ts           ← Clientes Supabase
│   └── api.ts                ← Helper fetch
└── types/
    └── index.ts              ← Interfaces TypeScript
```

---

## 🌐 Deploy en Vercel

1. Subí el código a GitHub
2. Entrá a [vercel.com](https://vercel.com) → New Project → importá el repo
3. En **Environment Variables** agregá:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy → listo ✓

Cada push a `main` redeploya automáticamente.
