# Refactoring Playbook

## Purpose
Improve code quality without changing behavior.

---

## When to Use

- Code duplication detected
- Functions too large (>100 LOC)
- Poor structure or readability

---

## Rules

- DO NOT change functionality
- DO NOT mix with feature development
- Keep changes minimal and scoped

---

## Steps

### 1. Identify Issue

- Duplication
- Complexity
- Naming issues
- Violations of code practices

---

### 2. Extract & Simplify

- Extract repeated logic into functions
- Reduce nesting
- Improve naming

---

### 3. Preserve Behavior

- Ensure output remains identical
- Do not introduce side effects

---

### 4. Verify

- Run existing tests
- Add minimal validation if missing

---

## Anti-Patterns

- Mixing refactor + new features
- Large sweeping rewrites
- Changing behavior unintentionally