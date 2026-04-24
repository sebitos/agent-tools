# Monorepo Workflow Playbook

Workflow rules for managing a single repository that contains a web app, Android app, iOS app, and shared backend.

---

## Core Principle

**Build only what changed. Share only what's truly shared.**

A monorepo is a tool for coordination, not for coupling. Apps should be independently buildable and deployable at all times.

---

## Repository Structure

```
/
├── apps/
│   ├── web/              (Next.js — deploys independently)
│   ├── backend/          (API server — deploys independently)
│   ├── android/          (Android — ships independently)
│   └── ios/              (iOS — ships independently)
├── packages/
│   ├── api-types/        (shared TypeScript types generated from OpenAPI)
│   ├── validation/       (shared Zod schemas)
│   ├── design-tokens/    (token source + build scripts)
│   └── config/           (shared ESLint, TypeScript, Prettier configs)
├── openapi.yaml          (API contract — source of truth)
├── tokens/
│   └── base.json         (design token source)
├── turbo.json            (Turborepo pipeline)
├── pnpm-workspace.yaml   (workspace definition)
└── .github/
    └── workflows/
```

---

## Workspace Tooling

Use **pnpm workspaces** + **Turborepo**:

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// turbo.json — task pipeline
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "test": { "dependsOn": ["^build"] },
    "lint": {},
    "type-check": {}
  }
}
```

**Rules**:
- `turbo run build --filter=apps/web` — build only the web app and its dependencies
- `turbo run build --filter=...[HEAD^1]` — build only what changed since the last commit
- Never run all builds on every PR — use affected-package detection

---

## Shared Packages Rules

- A package belongs in `packages/` only if **two or more apps** use it
- Shared packages must have **zero platform-specific imports** (no Next.js, no Android SDK, no UIKit)
- Each package has its own `package.json` with `name`, `version`, and `exports` defined
- Apps import shared packages by workspace name: `import { Product } from '@myapp/api-types'`
- Changes to a shared package trigger rebuilds of all consuming apps in CI

---

## CI Pipeline — Affected-Only Builds

```yaml
# .github/workflows/ci.yml (conceptual structure)
jobs:
  affected:
    # Detect which apps/packages changed vs main
    # Output: affected=["apps/web","packages/api-types"]

  web:
    needs: affected
    if: contains(needs.affected.outputs.list, 'apps/web')
    steps: [build, test, lint, deploy-to-staging]

  backend:
    needs: affected
    if: contains(needs.affected.outputs.list, 'apps/backend')
    steps: [build, test, lint, deploy-to-staging]

  android:
    needs: affected
    if: contains(needs.affected.outputs.list, 'apps/android')
    steps: [gradle-build, unit-test, upload-to-play-internal]

  ios:
    needs: affected
    if: contains(needs.affected.outputs.list, 'apps/ios')
    steps: [xcodebuild, unit-test, upload-to-testflight]
```

**Rules**:
- Backend CI always runs before frontend/mobile CI (dependency order)
- A failing backend build blocks all downstream app builds
- Mobile CI (Android + iOS) runs in parallel — they don't depend on each other
- Web deploys on every green main merge; mobile promotes manually to production

---

## Branching Strategy

```
main          ← always deployable; web auto-deploys from here
release/vX.Y  ← cut for each mobile release cycle
feature/*     ← short-lived; merged to main via PR
```

**Rules**:
- `main` must be green at all times — no "it's fine, we'll fix it later"
- Mobile releases branch from `main` at a point in time; hotfixes cherry-pick back to both
- Feature flags gate new features in `main` — no long-lived feature branches
- Use **conventional commits** (`feat:`, `fix:`, `chore:`) — enables automated changelogs and version bumps

---

## Dependency Management

- `pnpm update --recursive --interactive` — review all dependency updates weekly
- Shared config packages (`packages/config/`) own ESLint, TypeScript, and Prettier configs — apps extend them, never duplicate
- Pin exact versions for mobile build tooling (Gradle, Xcode build settings) — patch updates can silently break builds
- Use Dependabot or Renovate for automated PR creation on dependency updates

---

## Release Coordination

| Phase | Action |
|-------|--------|
| 1. Backend | Deploy to production; verify API health |
| 2. Web | Promote staging → production (instant) |
| 3. Android | Promote internal track → production (staged rollout: 10% → 50% → 100%) |
| 4. iOS | Enable feature flag post App Store review approval |

- Never promote mobile to production while the backend deploy is in progress
- Keep the previous backend API version live for the entire mobile rollout window
- Monitor error rates on all platforms during rollout — have a rollback plan for each

---

## Common Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Every PR builds all four apps | Use `--filter` / affected detection |
| Shared package imports platform SDKs | Extract platform-specific code into the app, keep shared package pure |
| Hardcoded API URLs in mobile app | Build variants / schemes per environment |
| Merging a backend breaking change without a new API version | Version the endpoint; keep v1 alive |
| Long-lived feature branches | Use feature flags on `main` instead |
| Skipping design token sync | Run Style Dictionary transform in CI — fail if output is stale |
