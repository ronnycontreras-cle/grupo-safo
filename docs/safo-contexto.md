# SAFO / Sourcing Foods — Contexto del proyecto

Documento de traspaso para continuar el desarrollo (en VS Code / Claude Code).
Resume qué es el proyecto, las decisiones tomadas, el estado actual y los próximos pasos.

---

## 1. Qué es

**SAFO / Sourcing Foods**: plataforma B2B de *sourcing* y cotizaciones de alimentos.
App **transaccional**. Un operador pide precios a proveedores (RFQs), recibe y evalúa
ofertas, confirma compras, sigue envíos y acumula un histórico de precios que explota
como inteligencia de mercado (BI "Price Radar").

Son **dos aplicaciones**:
- **`operator`** — plataforma interna del operador (SAFO). La grande y compleja.
- **`supplier-portal`** — portal de cara al proveedor (Supplier Intake). App pequeña.

El "contrato" entre ambas son **5 flujos**: (1) publicar RFQ → invitaciones,
(2) enviar oferta (web-form quote), (3) outcome + mensajes, (4) respuesta del proveedor,
(5) email de compra confirmada.

---

## 2. Regla de negocio central — los 3 ejes independientes

Una cotización (`Quote`) NO tiene un solo estado. Lleva **tres ejes que avanzan por
separado** y no deben mezclarse en un único campo `status`:

| Eje | Estados | Para qué |
|-----|---------|----------|
| **dataset** | draft → active → archived | Solo las `active` alimentan el BI de precios |
| **outcome** | evaluating → approved / declined | Decisión del operador; es lo que ve el proveedor |
| **shipment** | none → purchased → tracking → arrived | Compra confirmada + seguimiento |

> **ACTIVE ≠ Approved ≠ Purchased.** Una oferta puede estar *Active* en el dataset aunque
> la hayas *Declined*; *Approved* sin estar *Purchased*. Modelar esto como tres máquinas de
> estado separadas es la decisión de diseño más importante del dominio.

El proveedor **nunca** ve el dataset ni el BI. Esa frontera es regla de negocio y se
refuerza en código (ver sección 5).

---

## 3. Stack y arquitectura

- **Monorepo Nx** (preset `react-monorepo`, integrado) + **Vite + React + TypeScript**.
- **Gestor de paquetes: pnpm** (NO npm).
- **Node 22** (Vite reciente exige 20.19+ / 22.12+).

Estructura:

```
apps/
  operator/            # SAFO — app interna
  supplier-portal/     # portal del proveedor
libs/
  ui/                  # design system: tokens + componentes  → lo usan AMBAS
  contracts/           # tipos + esquemas Zod (dominio + 5 flujos) → AMBAS
  operator-core/       # lógica interna del operador → SOLO operator
```

Librerías planeadas del stack (a instalar por app/lib según toque):
- **TanStack Query** — data fetching / caché / mutations optimistas.
- **React Hook Form + Zod** — formularios y validación.
- **TanStack Table** — tablas (ordenar/filtrar/paginar server-side).
- **Zustand** — estado global de UI (no de servidor).
- **Tailwind v4 + shadcn/ui** — estilos y componentes accesibles (sobre Radix).
- **axios** con interceptores JWT.
- **decimal.js** — dinero. NUNCA usar `number`/float para dinero.

Roles de las libs:
- **`contracts`** = idioma común. Solo tipos + Zod + enums/constantes. Sin lógica ni UI.
  Una sola definición de cada shape; si cambia, ambas apps lo notan en compilación.
- **`operator-core`** = lógica interna (BI/dataset, reglas de evaluación, flujos de compra,
  cálculos con decimal.js). TS puro, sin React. Vetada al portal del proveedor.

---

## 4. Estado actual (HECHO)

- [x] Workspace Nx creado con `--pm pnpm`.
- [x] Apps y libs generadas:
  ```
  pnpm nx g @nx/react:app supplier-portal --bundler=vite
  pnpm nx g @nx/react:lib ui
  pnpm nx g @nx/js:lib contracts        # bundler: none
  pnpm nx g @nx/js:lib operator-core    # bundler: none
  ```
- [x] Resueltos los líos de entorno: Node actualizado a 22, pnpm instalado,
  `.npmrc` con `_password` mal formado (corchetes `[...]` del feed de Azure).

---

## 5. Convenciones / reglas de oro

- **pnpm siempre.** Comandos: `pnpm nx ...`, `pnpm add <pkg>` (`-w` para raíz,
  `--filter <proyecto>` para una app/lib concreta).
- **Dinero nunca como float.** decimal.js o unidad mínima (céntimos como enteros).
  Si la API .NET manda `decimal`, tratarlo como string y convertir con precisión.
- **Fronteras de módulo.** El proveedor no toca lo interno; lo fuerza el linter (paso 3).
- **Design system agnóstico del dominio.** Un `Button` no importa `contracts` ni conoce `Quote`.
- **Libs internas → bundler `none`** (no se publican; Vite las resuelve del código fuente).

---

## 6. Design tokens (extraídos del Figma)

Lenguaje visual: tinta casi negra cálida para acciones/nav, violeta como acento de marca,
semántica de estados fuerte, sobre lienzo gris-lavanda muy suave.
Los hex son aproximados de capturas — refinar con las variables reales de Figma.

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-ink` | `#1E1B19` | botones primarios, nav, logo |
| `--color-accent` | `#7C3AED` | acento de marca, dots "draft", números |
| `--color-success` | `#2E6A4B` | approve / complete / active |
| `--color-info` | `#3B6FE0` | banners informativos |
| `--color-warning` | `#E5A21A` | estado "review" |
| `--color-destructive` | `#DC2626` | requeridos, borrar |
| `--color-background` | `#F7F6F8` | lienzo |
| `--color-surface` | `#FFFFFF` | cards |
| `--color-border` | `#E5E4E7` | bordes hairline |
| `--color-foreground` | `#1A1817` | texto principal |

Mapeo de estados (mismo token para badge Y dot de sidebar):
`draft → accent`, `review → warning`, `active/approved → success`.

`tokens.css` (Tailwind v4, primer borrador) — va en `libs/ui`:

```css
@theme {
  /* primitivos */
  --color-ink: #1E1B19;
  --color-violet-500: #7C3AED;
  --color-green-600: #2E6A4B;
  --color-blue-500: #3B6FE0;
  --color-amber-500: #E5A21A;
  --color-red-600: #DC2626;
  --color-gray-50: #F7F6F8;
  --color-gray-200: #E5E4E7;
  --color-gray-900: #1A1817;

  /* semánticos — la capa que usan los componentes */
  --color-primary: var(--color-ink);
  --color-accent: var(--color-violet-500);
  --color-success: var(--color-green-600);
  --color-info: var(--color-blue-500);
  --color-warning: var(--color-amber-500);
  --color-destructive: var(--color-red-600);
  --color-background: var(--color-gray-50);
  --color-surface: #FFFFFF;
  --color-border: var(--color-gray-200);
  --color-foreground: var(--color-gray-900);

  --radius-md: 0.5rem;   /* inputs, botones */
  --radius-lg: 0.875rem; /* cards */
}
```

---

## 7. Próximos pasos

### Paso 3 — Fronteras de módulo (EN CURSO)

**3.1** Taggear cada proyecto en su `project.json` (o en `package.json` bajo `"nx": { "tags" }`):

```jsonc
// apps/operator/project.json        → "tags": ["scope:operator", "type:app"]
// apps/supplier-portal/project.json  → "tags": ["scope:supplier", "type:app"]
// libs/ui/project.json               → "tags": ["scope:shared", "type:ui"]
// libs/contracts/project.json        → "tags": ["scope:shared", "type:contracts"]
// libs/operator-core/project.json    → "tags": ["scope:operator", "type:core"]
```

**3.2** En el `eslint.config.mjs` de la raíz (flat config), reemplazar el `depConstraints`
comodín dentro de la regla `@nx/enforce-module-boundaries`:

```js
depConstraints: [
  // frontera de seguridad (scope)
  { sourceTag: 'scope:shared',   onlyDependOnLibsWithTags: ['scope:shared'] },
  { sourceTag: 'scope:operator', onlyDependOnLibsWithTags: ['scope:operator', 'scope:shared'] },
  { sourceTag: 'scope:supplier', onlyDependOnLibsWithTags: ['scope:supplier', 'scope:shared'] },
  // pureza del design system (type)
  { sourceTag: 'type:ui',        onlyDependOnLibsWithTags: ['type:ui'] },
]
```

Efecto clave: `supplier-portal` (scope:supplier) NO puede importar `operator-core`
(scope:operator). Las reglas se combinan con Y.

**3.3** Probar que el candado cierra: meter un import prohibido en `supplier-portal`
(`import ... from '@sourcing-foods/operator-core'`), correr `pnpm nx lint supplier-portal`
→ debe fallar. Borrar el import. Verificar con `pnpm nx graph`.

### Paso 4 — Tailwind v4 + tokens.css en `libs/ui`
Montar la capa de tokens (primitivos → semánticos, ver sección 6) + dark mode.

### Paso 5 — Primeros componentes en `ui`
`Button` (variantes con CVA: primary/success/outline/ghost), `Badge` (estados
review/approved/draft + pill negro de Incoterm), `FormField` (con Zod), `IncotermBlock`.
Storybook como catálogo vivo.

### Paso 6 — Capa de datos
Cliente axios + interceptores JWT + TanStack Query. Esquemas Zod en `contracts` como
espejo de la API .NET.

### Paso 7 — Modelar el dominio en `contracts`
Entidades: RFQ, Quote, Product, Supplier, Offer, Message, Shipment.
Los 3 ejes como enums/estados SEPARADOS (no un solo `status`). Ejemplo:

```ts
export const QuoteSchema = z.object({
  reference: z.string(),
  supplierId: z.string(),
  datasetStatus:  z.enum(["draft", "active", "archived"]),
  outcome:        z.enum(["evaluating", "approved", "declined"]),
  shipmentStatus: z.enum(["none", "purchased", "tracking", "arrived"]),
});
export type Quote = z.infer<typeof QuoteSchema>;
```

---

## Comandos útiles

```bash
pnpm nx serve operator          # levantar la app interna
pnpm nx graph                   # ver el grafo de dependencias
pnpm nx lint <proyecto>         # lint (incluye fronteras de módulo)
pnpm nx g @nx/react:lib <name>  # nueva lib React
pnpm nx reset                   # reiniciar daemon + limpiar caché (ante errores raros)
```
