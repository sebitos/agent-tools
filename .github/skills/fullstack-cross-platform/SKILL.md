---
name: fullstack-cross-platform
description: |
  Keeping a web app, Android app, and iOS app in sync against a single backend. Use this skill when:
  - Designing or reviewing how web, Android, and iOS share a single backend API
  - Defining a shared API contract (OpenAPI / GraphQL schema) that all three clients consume
  - Implementing feature flags that roll out consistently across web, Android, and iOS
  - Managing design tokens (colours, typography, spacing) across platforms
  - Structuring environment configurations (dev / staging / prod) per platform
  - Planning versioned API changes that don't break live mobile apps in the field
  - Coordinating a release across web and mobile (timing, feature parity gates)
  - Setting up shared TypeScript types, validation schemas, or API client packages used by web and possibly React Native
  - Any project where a single backend serves two or more frontend platforms
---

# Full-Stack Cross-Platform Sync

Patterns for keeping web, Android, and iOS in sync against a shared backend.

---

## The Core Problem

Web deploys instantly. Mobile ships to an app store and sits on devices for weeks.

**This means**:
- The backend must support **at least the current + previous mobile app version** at all times
- Breaking API changes require a versioning strategy, not a cut-over
- Feature rollout must be **flag-controlled**, not deploy-controlled

---

## Single Backend, Three Clients

```
                    ┌─────────────┐
                    │   Backend   │
                    │  (REST/GQL) │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
      Web (Next.js)   Android (Kotlin)  iOS (Swift)
```

**Rules**:
- Backend is platform-agnostic — no platform-specific response shapes
- Auth tokens (JWT/OAuth) use the same flow on all three clients
- All three clients hit the same base URL per environment; only the env var differs

---

## API Contract — OpenAPI as Source of Truth

Define the API contract in an **OpenAPI 3.x spec** (`openapi.yaml`) committed alongside the backend:

```yaml
# openapi.yaml (backend repo)
paths:
  /products:
    get:
      summary: List products
      parameters:
        - name: page
          in: query
          schema: { type: integer, default: 1 }
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductList'
```

**Generate clients from the spec — never write them by hand**:

| Platform | Generator | Output |
|----------|-----------|--------|
| Web (TypeScript) | `openapi-typescript` | Type-safe `fetch` wrappers |
| Android | `openapi-generator` (kotlin) | Retrofit/OkHttp client |
| iOS | `openapi-generator` (swift5) | URLSession client |

CI fails if the spec is changed without re-generating and committing updated clients.

---

## API Versioning Strategy

```
/api/v1/products   ← current stable (served to all clients)
/api/v2/products   ← new version (web + new mobile releases)
```

**Rules**:
- **Never break** `/v1` while live mobile apps still use it — add fields, never remove or rename
- Deprecation window: minimum **90 days** after a new version ships (covers the slowest App Store update cycle)
- Use the `Sunset` response header to signal deprecation to clients programmatically
- Mobile apps send `X-App-Version: 2.4.1` and `X-Platform: ios` headers — backend can log and alert on old-version traffic before cutting off

---

## Design Tokens — Single Source of Truth

Store design tokens in a platform-neutral format (JSON or YAML), then transform for each target:

```json
// tokens/base.json
{
  "color": {
    "brand-primary": "#0066FF",
    "text-primary": "#111111",
    "surface": "#FFFFFF"
  },
  "spacing": { "sm": 8, "md": 16, "lg": 24 },
  "radius": { "card": 12 }
}
```

| Platform | Transform tool | Output |
|----------|---------------|--------|
| Web | Style Dictionary → CSS variables / Tailwind config | `--color-brand-primary: #0066FF` |
| Android | Style Dictionary → `colors.xml`, `dimens.xml` | `<color name="brand_primary">#0066FF</color>` |
| iOS | Style Dictionary → Swift enum or Xcode asset catalog | `Color.brandPrimary` |

**All three UIs share the same token values** — changing a brand colour is a one-line edit.

---

## Feature Flags

Use a **flag service** (LaunchDarkly, Firebase Remote Config, or Unleash) as the gate for every new feature — not a deployment.

```
Flag: new_checkout_flow
  → Web:     enabled for 100% (deployed, tested)
  → Android: enabled for 20% (rolling out)
  → iOS:     disabled (pending App Store review)
```

**Rules**:
- Every non-trivial feature is behind a flag before it reaches production
- Flags are evaluated server-side for sensitive features (pricing, permissions)
- Kill switch: disabling a flag must revert the feature instantly on all platforms without a deploy or app update
- Remove flag code within one sprint of full rollout — flags are not permanent config

---

## Environment Configuration Per Platform

| Environment | Web | Android | iOS |
|-------------|-----|---------|-----|
| Dev | `.env.local` | `debug` build variant | `Debug` scheme |
| Staging | `.env.staging` (CI) | `staging` build variant | `Staging` scheme |
| Production | Platform secrets (Vercel/Azure) | `release` build variant | `Release` scheme (App Store) |

All three point to the same backend URL per environment — managed via:
- Web: `NEXT_PUBLIC_API_URL` in env file
- Android: `BuildConfig.API_BASE_URL` in `build.gradle` per variant
- iOS: `API_BASE_URL` in `Info.plist` per scheme / xcconfig file

---

## Coordinated Release Checklist

Use this before shipping a cross-platform feature:

- [ ] API change is backward-compatible OR a new versioned endpoint is added
- [ ] OpenAPI spec updated and all three clients regenerated
- [ ] Feature flag added — disabled by default on all platforms
- [ ] Backend deployed and verified on staging
- [ ] Web deployed to staging with flag enabled — QA sign-off
- [ ] Android build with flag enabled — internal test track sign-off
- [ ] iOS build with flag enabled — TestFlight sign-off
- [ ] Flag enabled to 100% on web (instant)
- [ ] Android flag rolled to 100% (or promote to production track)
- [ ] iOS flag enabled after App Store review approval
- [ ] Monitoring: error rate and API latency checked 30 min after each rollout

---

## Shared Code Candidates

Things worth extracting into a shared package when running a monorepo:

| Candidate | Web | Android | iOS |
|-----------|-----|---------|-----|
| TypeScript API types | ✓ (direct) | ✗ (generate from OpenAPI) | ✗ (generate from OpenAPI) |
| Zod validation schemas | ✓ (direct) | ✗ | ✗ |
| Business logic | ✓ via shared TS package | Kotlin Multiplatform (KMP) | Kotlin Multiplatform (KMP) |
| Design tokens | ✓ Style Dictionary | ✓ Style Dictionary | ✓ Style Dictionary |
| Feature flag keys | ✓ constants file | ✓ constants file | ✓ constants file |

Keep shared packages **thin** — only pure logic and types, no platform SDK imports.
