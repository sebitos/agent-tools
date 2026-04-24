---
name: web-app-builder
description: |
  Web application development patterns and implementation guidance using React, Next.js, and modern frontend tooling. Use this skill when:
  - Building, extending, or debugging a web app with React or Next.js
  - Choosing between CSR (client-side rendering), SSR (server-side rendering), SSG (static generation), or ISR
  - Implementing routing: React Router, Next.js App Router, or file-based routing
  - Managing state: local state, server state (TanStack Query), global state (Zustand, Redux Toolkit)
  - Building responsive layouts that work across desktop, tablet, and mobile browsers
  - Implementing authentication flows (OAuth, JWT, session-based) in a web frontend
  - Integrating REST or GraphQL APIs with proper loading, error, and empty states
  - Optimising web performance: Core Web Vitals, code splitting, lazy loading, image optimisation
  - Setting up a PWA (Progressive Web App) for offline support and installability
  - Preparing for deployment: build output, environment variables, CDN, caching headers
  - Any codebase containing package.json with react, next, vite, or webpack dependencies
---

# Web App Builder

Best practices and patterns for building modern web applications with React and Next.js.

---

## Project Structure (Next.js App Router)

```
src/
├── app/
│   ├── layout.tsx           (root layout — fonts, providers, metadata)
│   ├── page.tsx             (home route)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (app)/
│       ├── layout.tsx       (authenticated layout — nav, sidebar)
│       ├── dashboard/page.tsx
│       └── products/
│           ├── page.tsx     (list)
│           └── [id]/page.tsx (detail)
├── components/
│   ├── ui/                  (primitive components — Button, Input, Card)
│   └── features/            (domain-specific composites — ProductCard, UserMenu)
├── lib/
│   ├── api/                 (API client, fetchers)
│   ├── hooks/               (custom hooks)
│   └── utils/               (pure utility functions)
├── stores/                  (Zustand stores or Redux slices)
├── types/                   (shared TypeScript types)
└── styles/
    └── globals.css
```

---

## Rendering Strategy Decision Table

| Content type | Strategy | Why |
|---|---|---|
| Marketing / blog | SSG / ISR | Fast, cacheable, no auth needed |
| Dashboard / user data | SSR or CSR with TanStack Query | Fresh data, personalised |
| Real-time feeds | CSR + WebSocket / SSE | Streaming updates |
| Mixed authenticated app | App Router Server + Client Components | Best of both |

**Next.js App Router rules**:
- Server Components by default — add `"use client"` only when you need event handlers, browser APIs, `useState`, or `useEffect`
- Never put secrets or DB queries in Client Components
- `loading.tsx` per route segment for Suspense streaming; `error.tsx` for error boundaries

---

## State Management

| Scope | Tool | When |
|---|---|---|
| Component-local | `useState`, `useReducer` | Form state, toggles, transient UI |
| Server / async state | TanStack Query | API data, caching, background refetch |
| Global client state | Zustand | Auth user, theme, cart, cross-component UI |
| URL state | `useSearchParams`, `useRouter` | Filters, pagination, tabs |
| Form state | React Hook Form + Zod | All forms — validation + submission |

**Rules**:
- Do not put server state into a global store — TanStack Query is the cache
- Derive computed values; never duplicate state
- URL is the best global state for anything the user should bookmark or share

---

## API Integration

```typescript
// Type-safe fetcher with runtime validation
import { z } from 'zod'

const ProductSchema = z.object({ id: z.string(), name: z.string(), price: z.number() })
type Product = z.infer<typeof ProductSchema>

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new ApiError(res.status, await res.text())
  return z.array(ProductSchema).parse(await res.json())
}
```

**Rules**:
- All API base URLs via environment variables — never hardcoded
- Always check `res.ok` — `fetch` does not throw on 4xx/5xx
- Use `useQuery` / `useMutation` from TanStack Query in components — not raw `fetch` in `useEffect`
- Validate API responses with Zod at the network boundary — never trust raw JSON types

---

## Responsive Layout

- **Mobile-first**: write base styles for 375px, use `sm:`, `md:`, `lg:` breakpoints up
- CSS Grid for two-dimensional layouts; Flexbox for single-axis
- Never hardcode container widths — use `max-w-*` with `mx-auto`
- Test at: 375px (phone), 768px (tablet), 1280px (desktop), 1920px (wide)

```tsx
// Adaptive grid — 1 col mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {products.map(p => <ProductCard key={p.id} product={p} />)}
</div>
```

---

## Authentication

- Store JWT access tokens in **memory only** (React state or Zustand) — never in `localStorage`
- Use `httpOnly` cookies for refresh tokens — JS cannot read them
- Protect routes server-side via Next.js `middleware.ts` before the page renders
- Never decode JWTs client-side for authorization decisions — verify server-side only

---

## Performance Checklist

- [ ] `next build` — no chunk > 250 kB initial JS
- [ ] All images use `<Image>` with explicit dimensions to prevent CLS
- [ ] Heavy components (charts, rich editors, maps) loaded with `next/dynamic`
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Lighthouse CI configured in pull requests
- [ ] No N+1 API calls on list pages — batch, paginate, or prefetch

---

## Environment Variables

```bash
# .env.local (gitignored — local dev values)
NEXT_PUBLIC_API_URL=https://api.example.com   # exposed to browser — no secrets
DATABASE_URL=...                               # server-only — never prefix NEXT_PUBLIC_

# .env.example (committed — documents required vars, no values)
NEXT_PUBLIC_API_URL=
DATABASE_URL=
```

- `NEXT_PUBLIC_` = bundled into client JS — **never put secrets there**
- Production values injected by CI/CD via platform secrets, never via committed files

---

## Deployment Checklist

- [ ] All environment variables configured in hosting platform
- [ ] `output: 'standalone'` in `next.config.ts` if containerised
- [ ] Content Security Policy headers set
- [ ] `robots.txt` and `sitemap.xml` present for public-facing apps
- [ ] Error monitoring (Sentry) enabled before launch
- [ ] Analytics event tracking verified on staging before production rollout
