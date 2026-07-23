# Pavlovapp — Vite + React + TypeScript

Ficha, salud y plan de entrenamiento de mascotas. Frontend SPA sobre Supabase (auth por enlace mágico / OTP, datos con RLS por familia). PWA instalable.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera /dist
npm run preview  # sirve /dist localmente
```

La URL y la clave *publishable* de Supabase están en `src/lib/supabase.ts` (clave de cliente, pública por diseño y protegida por RLS).

## Estructura

- `src/state/store.tsx` — estado global (sesión, familia/mascotas, modal, toast).
- `src/components/tabs/` — Ficha (con bloque **Hoy**), Médico, Diario, Entreno, Alertas, Contactos.
- `src/components/forms/` — formularios y onboarding.
- `src/components/QuickLog.tsx` — registro de un toque (tabla `daily_events`).
- `src/components/WeightChart.tsx` — curva de peso con objetivo.
- `src/features/pdf.ts` — exportar ficha para la vet (jsPDF, carga diferida).

## Deploy en Vercel

### Opción A — Auto-deploy por Git (recomendada)
1. Reemplaza el contenido del repo `lepaiva-io/pavlovapp` con **el código fuente** de este proyecto (no subas `node_modules` ni `dist`; ya están en `.gitignore`).
2. En Vercel → Project → Settings → Build & Deployment:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Desde tu Terminal: `git add . && git commit -m "migrar a Vite+React" && git push`.
4. Vercel construye y despliega solo. **Cada push futuro se despliega automáticamente.**

### Opción B — Manual (mantener el flujo actual)
1. `npm run build`
2. Sube el contenido de la carpeta `dist/` al repo (como veníamos haciendo).

En Supabase → Auth → URL Configuration deben seguir la Site URL de Vercel y el Redirect `https://pavlovapp.vercel.app/**`.

## Base de datos (ya aplicado)
- Tabla `daily_events` (registro de un toque) con RLS por familia.
- Columna `pets.target_weight_kg` (peso objetivo, opcional).
