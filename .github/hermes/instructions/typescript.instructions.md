---
description: 'Instructions for writing TypeScript and JavaScript code following idiomatic practices and community standards'
applyTo: '**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/tsconfig*.json,**/package.json'
---

# TypeScript Development Instructions

Follow idiomatic TypeScript practices and community standards when writing TypeScript or JavaScript code. These instructions are based on the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/), [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html), and the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

## General Instructions

- Write simple, clear, and idiomatic TypeScript
- Prefer `const` over `let`; never use `var`
- Prefer explicit types over implicit where the type is not immediately obvious
- Return early to reduce nesting; avoid deeply nested conditionals
- Use `async/await` over raw `.then()` chains
- Write self-documenting code with descriptive names

## Naming Conventions

- **Files**: `kebab-case.ts` for modules; `PascalCase.tsx` for React components
- **Classes and interfaces**: `PascalCase`
- **Functions, methods, variables**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE` for true constants; `camelCase` for `const` bindings that are not fixed values
- **Types and enums**: `PascalCase`
- **Private class members**: prefix with `#` (native private) or `_private` where `#` is unavailable
- Avoid abbreviations; prefer `userRepository` over `userRepo` or `ur`

## Type System

- Enable `strict: true` in `tsconfig.json` — no exceptions
- Never use `any`; use `unknown` when the type is genuinely unknown, then narrow it
- Prefer `interface` for object shapes that may be extended; `type` for unions, intersections, and aliases
- Use `readonly` on properties that should not be mutated after construction
- Use `as const` for literal tuples and objects used as constants
- Avoid type assertions (`as X`) except at system boundaries (parsing, external APIs)

```typescript
// Good
function parseUser(raw: unknown): User {
  if (!isUser(raw)) throw new Error(ERR_INVALID_USER);
  return raw;
}

// Bad
function parseUser(raw: any): User {
  return raw as User;
}
```

## Constants

- Define module-level constants in `SCREAMING_SNAKE_CASE`
- Never use magic numbers or inline string literals; name them

```typescript
// Good
const MAX_RETRY_ATTEMPTS = 3;
const ERR_NOT_FOUND = "Resource not found";

// Bad
for (let i = 0; i < 3; i++) { ... }
throw new Error("Resource not found");
```

## Functions

- Annotate return types on all non-trivial functions
- Keep functions under 50 lines; under 30 is preferred
- Avoid side effects in functions that compute values
- Use default parameters over conditional assignments

```typescript
// Good
function buildUrl(base: string, path: string, version = "v1"): string {
  return `${base}/${version}/${path}`;
}

// Bad
function buildUrl(base, path, version) {
  version = version || "v1";
  return base + "/" + version + "/" + path;
}
```

## Error Handling

- Never swallow errors silently (`catch (e) {}`)
- Always handle `Promise` rejections — either `await` with `try/catch` or `.catch()`
- Define typed error classes for domain errors
- Provide meaningful, actionable error messages

```typescript
// Good
try {
  const user = await fetchUser(id);
} catch (error) {
  throw new UserFetchError(`Failed to fetch user ${id}`, { cause: error });
}

// Bad
fetchUser(id).then(user => { ... }); // unhandled rejection
```

## Async Code

- Always `await` promises — never fire-and-forget unless explicitly intentional (document it)
- Use `Promise.all` for independent parallel operations
- Use `Promise.allSettled` when you need all results regardless of failure
- Never mix `async/await` with `.then()/.catch()` in the same function

## Code Structure

- Follow modular architecture: `api/`, `services/`, `models/`, `utils/`, `config/`
- One export per file for classes and React components
- Barrel exports (`index.ts`) define the public API of a module
- Do not export implementation details

## Imports

- Use ES module imports (`import`/`export`), never `require()` in TypeScript
- Use path aliases (configured in `tsconfig.json`) to avoid `../../..` chains
- Sort imports: external packages → internal aliases → relative paths (enforce with `prettier-plugin-sort-imports` or ESLint)

## Formatting & Tooling

- Format all code with `prettier` (no config debates — accept defaults or commit a `.prettierrc`)
- Lint with `eslint` using `@typescript-eslint/recommended`
- All ESLint errors must be zero before a milestone is marked `done`
- Compile with zero TypeScript errors (`tsc --noEmit`)

## Testing

- Use `vitest` (preferred) or `jest` as the test runner
- Mirror the source tree in `__tests__/` or use `*.test.ts` colocated files
- Use `vi.mock()` / `jest.mock()` to mock modules; never mock implementations inline
- Minimum: one passing test and one failure-path test per public function or exported component
- For React components: use `@testing-library/react`; test behaviour, not implementation

## React-Specific (when applicable)

- Prefer function components with hooks over class components
- Never mutate state directly — always use the setter from `useState`
- Keep component files focused: one primary component per file
- Colocate component types, hooks, and tests with the component
- Follow the React 19 patterns defined in `/.github/skills/react19-source-patterns/`

## Dependency Management

- Declare exact peer dependency versions in `package.json`
- Separate `dependencies` from `devDependencies` strictly
- Do not add a package if the standard library or an existing dependency covers the use case
- Audit with `npm audit` or `pnpm audit` before milestone completion
