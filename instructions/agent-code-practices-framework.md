# Agent Code Practices Framework

This document defines **mandatory coding standards** for all agent-generated code.

These are enforced rules, not guidelines.

---

## Core Principles

- Do not hardcode constants. Define them at the top of the file or in a config module using `ALL_CAPS`.
  - This includes: magic numbers, retry counts, limits, timeouts, string literals used as error messages, fixed filenames, and any value that could be named.
  - Error messages must be `ALL_CAPS` constants (e.g. `ERR_NOT_FOUND = "Resource not found"`), not inline strings inside `raise` or `HTTPException` calls.
  - Magic numbers (e.g. `range(2)`, `if attempt == 1`) must be named constants (e.g. `MAX_ATTEMPTS = 2`).
- Do not duplicate logic (DRY). Extract reusable functions/modules.
- Keep functions under 100 LOC unless absolutely necessary. If exceeded → justify and refactor where possible.
- Always ask clarifying questions when requirements are unclear. Do not assume.

---

## Code Structure & Organization

- Follow modular architecture (`api`, `services`, `utils`, `models`, `config`).
- Each file must have a single responsibility.
- Avoid deep nesting (>3–4 levels). Refactor into helpers.
- Prefer composition over inheritance unless justified.

---

## Naming & Readability

- Use clear, descriptive names (no `tmp`, `val`, `x1` unless trivial).
- Avoid unnecessary abbreviations.
- Code must be self-explanatory.
- Comments explain **why**, not **what**.
- No excessive or redundant comments.

---

## Types & Contracts

- Add type hints/types for:
  - All public functions
  - Non-trivial data structures
- Use explicit interfaces/contracts where applicable.
- Avoid loosely typed or ambiguous structures.

---

## Change Discipline

- Make the **smallest possible change** to solve the problem.
- Do not perform unrelated refactors unless explicitly requested.
- Avoid formatting-only diffs unless necessary.
- Preserve existing behavior unless the plan specifies changes.

---

## Dependencies

- Do not introduce new dependencies without strong justification.
- Prefer standard library or existing dependencies.
- If adding a dependency:
  - Justify in one sentence
  - Ensure it is stable and widely used

---

## Error Handling & Resilience

- Never ignore errors silently.
- Fail fast on invalid inputs.
- Validate all external inputs (API, file, CLI).
- Provide meaningful, actionable error messages.

---

## Reusability & Modularity

- Write reusable, testable functions.
- Prefer pure functions when possible (minimize side effects).
- Avoid tight coupling between modules.

---

## State & Side Effects

- Minimize global state.
- Isolate side effects (I/O, DB, API calls).
- Keep business logic pure and deterministic.

---

## Performance & Efficiency

- Avoid obviously inefficient implementations.
- Do not prematurely optimize.
- If optimizing:
  - Explain the bottleneck
  - Prefer measurable improvements

---

## Testing & Verification

- Any non-trivial change must include verification:
  - Update or add tests when available
  - If no tests exist → provide a minimal validation method (script/example)
- Clearly state how to verify correctness.

---

## Logging & Observability

- Use logging framework — **no `print` statements in production code**.
- Logs must be meaningful and help debugging.
- Avoid excessive logging noise.

---

## Security & Safety

- Never expose secrets, credentials, or API keys.
- Sanitize and validate all inputs.
- Avoid unsafe operations unless explicitly required.

---

## LLM-Specific Constraints

- Do not hallucinate APIs, libraries, or methods.
- If uncertain → state uncertainty explicitly.
- Prefer well-known, stable libraries.
- Do not assume missing requirements.

---

## Enforcement Rules

- Code that violates this framework must be refactored before completion.
- If a task conflicts with these rules:
  → STOP  
  → Raise the conflict  
  → Request clarification  

No exceptions.

## Clarification vs Autonomy Rule

- If ambiguity blocks correctness → ASK and STOP
- If ambiguity is minor → proceed with assumption and log it
