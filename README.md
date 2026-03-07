# Inventario · Berns — Next.js

Sistema de gestión de inventario para la cocina del Hotel Berns.  
Stack: **Next.js 14 · TypeScript · Tailwind · Supabase · Vercel**

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
